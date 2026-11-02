import { readFile, writeFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { argv, exit } from 'node:process';

export const REQUIRED_HEADERS = [
  'Strict-Transport-Security',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
];

export const REQUIRED_DIRECTIVES = {
  'default-src': "'self'",
  'base-uri': "'self'",
  'object-src': "'none'",
  'frame-ancestors': "'none'",
  'form-action': "'self'",
};

/**
 * Whether a `<script>` tag runs code the CSP has to hash, judged from its attributes.
 * @param {string} attributes The raw attribute text between `<script` and `>`.
 * @returns {boolean}
 */
export function isExecutableScript(attributes) {
  if (/\bsrc=/.test(attributes)) {
    return false;
  }
  const type = /type="([^"]*)"/.exec(attributes);
  if (!type) {
    return true;
  }
  return ['text/javascript', 'application/javascript', ''].includes(type[1].trim().toLowerCase());
}

/**
 * Every `sha256-` hash the inline, executable scripts of one document require.
 * @param {string} html
 * @returns {string[]}
 */
export function inlineScriptHashes(html) {
  /** @type {string[]} */
  const hashes = [];
  const pattern = /<script([^>]*)>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    if (!isExecutableScript(match[1])) {
      continue;
    }
    hashes.push(`sha256-${createHash('sha256').update(match[2]).digest('base64')}`);
  }
  return hashes;
}

/**
 * The indented `Name: value` lines of a `_headers` file, keyed by header name.
 * @param {string} text
 * @returns {Map<string, string>}
 */
export function parseHeaders(text) {
  /** @type {Map<string, string>} */
  const headers = new Map();
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line === '' || line.startsWith('#') || !raw.startsWith(' ')) {
      continue;
    }
    const separator = line.indexOf(':');
    if (separator > 0) {
      headers.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
    }
  }
  return headers;
}

/**
 * The hash sources of one CSP directive, unquoted.
 * @param {string} directive
 * @returns {string[]}
 */
export function hashesIn(directive) {
  return (directive.match(/'sha(?:256|384|512)-[^']+'/g) ?? []).map((value) => value.slice(1, -1));
}

/**
 * One `Content-Security-Policy` value split into directive name to value.
 * @param {string} csp
 * @returns {Map<string, string>}
 */
export function parseCsp(csp) {
  /** @type {Map<string, string>} */
  const directives = new Map();
  for (const part of csp.split(';')) {
    const trimmed = part.trim();
    if (trimmed === '') {
      continue;
    }
    const space = trimmed.indexOf(' ');
    if (space === -1) {
      directives.set(trimmed, '');
    } else {
      directives.set(trimmed.slice(0, space), trimmed.slice(space + 1).trim());
    }
  }
  return directives;
}

/**
 * The production `apiOrigin`, read as text so this script does not have to compile TypeScript.
 *
 * @param {string} source
 * @returns {string}
 */
export function apiOriginFrom(source) {
  const match = /apiOrigin:\s*'([^']*)'/.exec(source);
  return match ? match[1] : '';
}

const SNIPPET_PREAMBLE = [
  '# Generated from public/_headers by scripts/verify-headers.mjs. Do not edit by hand.',
  '#',
  '# Regenerate with `npm run verify:headers -- --write` after a production build;',
  '# `npm run verify:headers` fails when this file and public/_headers disagree.',
  '#',
  '# Included at server level by nexora-site.conf. `add_header` in a nested level discards',
  '# every inherited header, so a location that adds one must repeat the include.',
];

/**
 * The `_headers` rule expressed as nginx `add_header` directives.
 *
 * `always` is deliberate on every line: without it nginx omits the header on its own error
 * responses, which is exactly where a missing `X-Frame-Options` or CSP matters most - the
 * localized 404 is served through `error_page`.
 *
 * @param {Map<string, string>} headers
 * @returns {string}
 */
export function nginxHeaderSnippet(headers) {
  const lines = [...SNIPPET_PREAMBLE, ''];
  for (const [name, value] of headers) {
    lines.push(`add_header ${name} "${value.replaceAll('"', '\\"')}" always;`);
  }
  return lines.join('\n') + '\n';
}

/**
 * Returns a list of problems with the header file, given what the build actually produced.
 *
 * @param {Map<string, string>} headers
 * @param {Set<string>} buildHashes
 * @param {string} apiOrigin
 * @returns {string[]}
 */
export function checkHeaders(headers, buildHashes, apiOrigin) {
  /** @type {string[]} */
  const problems = [];

  for (const name of REQUIRED_HEADERS) {
    if (!headers.has(name)) {
      problems.push(`missing header: ${name}`);
    }
  }

  const csp = headers.get('Content-Security-Policy');
  if (!csp) {
    problems.push(
      headers.has('Content-Security-Policy-Report-Only')
        ? 'the CSP is still Report-Only, which enforces nothing'
        : 'missing header: Content-Security-Policy',
    );
    return problems;
  }

  const directives = parseCsp(csp);
  for (const [name, expected] of Object.entries(REQUIRED_DIRECTIVES)) {
    const actual = directives.get(name);
    if (actual === undefined) {
      problems.push(`CSP is missing ${name}`);
    } else if (actual !== expected) {
      problems.push(`CSP ${name} is "${actual}", expected "${expected}"`);
    }
  }

  const scriptSrc = directives.get('script-src');
  if (!scriptSrc) {
    problems.push('CSP is missing script-src');
  } else {
    if (scriptSrc.includes("'unsafe-inline'") || scriptSrc.includes("'unsafe-eval'")) {
      problems.push("CSP script-src allows 'unsafe-inline' or 'unsafe-eval'");
    }
    const listed = new Set(hashesIn(scriptSrc));
    for (const hash of buildHashes) {
      if (!listed.has(hash)) {
        problems.push(`the build emits an inline script that script-src does not allow: ${hash}`);
      }
    }
    for (const hash of listed) {
      if (!buildHashes.has(hash)) {
        problems.push(`script-src allows a hash the build no longer emits: ${hash}`);
      }
    }
  }

  // The form posts with XHR, so a configured API origin that CSP does not list is a blocked
  // request - the same visitor-facing failure as no API at all, for a reason nothing logs.
  const connectSrc = directives.get('connect-src') ?? '';
  if (apiOrigin !== '' && !connectSrc.split(/\s+/).includes(apiOrigin)) {
    problems.push(
      `connect-src does not list the configured apiOrigin (${apiOrigin}), so the contact form would be blocked`,
    );
  }

  return problems;
}

/**
 * @param {string} root
 * @param {string} headersFile
 * @param {string} environmentFile
 * @param {string} snippetFile
 * @param {boolean} write
 * @returns {Promise<number>}
 */
async function main(root, headersFile, environmentFile, snippetFile, write) {
  /** @type {Set<string>} */
  const buildHashes = new Set();
  let checked = 0;

  for await (const file of glob('**/index.html', { cwd: root })) {
    const html = await readFile(`${root}/${file}`, 'utf8');
    for (const hash of inlineScriptHashes(html)) {
      buildHashes.add(hash);
    }
    checked += 1;
  }

  if (checked === 0) {
    console.error(`[verify-headers] no prerendered pages under ${root}. Run a build first.`);
    return 1;
  }

  const text = await readFile(headersFile, 'utf8');

  if (write) {
    const replacement = `script-src 'self' ${[...buildHashes]
      .sort()
      .map((hash) => `'${hash}'`)
      .join(' ')}`;
    // Tested for a match, not for a change. An already-current hash list rewrites to itself,
    // and treating that as "directive not found" made --write fail precisely when it had
    // nothing to do - which is the usual case straight after a clean build.
    const directive = /script-src 'self'[^;\n]*/;
    if (!directive.test(text)) {
      console.error('[verify-headers] could not find a script-src directive to rewrite.');
      return 1;
    }
    const updated = text.replace(directive, replacement);
    await writeFile(headersFile, updated);
    // Generated from the text just written, never from the text read, so the snippet carries
    // the new hashes rather than the ones they replaced.
    await writeFile(snippetFile, nginxHeaderSnippet(parseHeaders(updated)));
    console.log(
      `[verify-headers] rewrote script-src with ${buildHashes.size} hashes from ${checked} pages, and regenerated ${snippetFile}.`,
    );
    return 0;
  }

  const apiOrigin = apiOriginFrom(await readFile(environmentFile, 'utf8'));
  const headers = parseHeaders(text);
  const problems = checkHeaders(headers, buildHashes, apiOrigin);

  // The nginx copy is checked even when the headers themselves are fine: the live site is
  // served by nginx, which never reads `_headers`, so a stale snippet means the policy
  // verified above is not the policy anyone actually receives.
  const expectedSnippet = nginxHeaderSnippet(headers);
  let actualSnippet = null;
  try {
    actualSnippet = await readFile(snippetFile, 'utf8');
  } catch {
    problems.push(`missing ${snippetFile} - run with --write to generate it`);
  }
  if (actualSnippet !== null && actualSnippet !== expectedSnippet) {
    problems.push(
      `${snippetFile} no longer matches ${headersFile}, so nginx would serve a different policy`,
    );
  }

  if (problems.length > 0) {
    console.error(`[verify-headers] ${headersFile} does not match the build:\n`);
    for (const problem of problems) {
      console.error(`  ${problem}`);
    }
    console.error('\n  Run "npm run verify:headers -- --write" if the change was intentional.\n');
    return 1;
  }

  console.log(
    `[verify-headers] ${checked} pages: ${buildHashes.size} inline scripts allowed by hash, ${REQUIRED_HEADERS.length + 1} headers present, nginx snippet in step.`,
  );
  return 0;
}

if (import.meta.filename === argv[1]) {
  const args = argv.slice(2).filter((value) => value !== '--write');
  exit(
    await main(
      args[0] ?? 'dist/nexora/browser',
      args[1] ?? 'public/_headers',
      args[2] ?? 'src/environments/environment.production.ts',
      args[3] ?? 'deploy/nginx/nexora-headers.conf',
      argv.includes('--write'),
    ),
  );
}
