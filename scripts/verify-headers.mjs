/**
 * Checks that `public/_headers` still matches the artifact it protects.
 *
 * The enforced CSP allows inline scripts by hash. Three of the prerendered documents' inline
 * scripts are executable - Angular's event-dispatch contract, the jsaction bootstrap, and the
 * critical-CSS media restore - and the bootstrap's body contains the event types a page's
 * components actually use, so its hash changes when a component starts listening for something
 * new. A stale list does not degrade: the browser blocks the script, hydration never runs, and
 * the page looks fine until someone clicks. That is the failure this turns into a failed build.
 *
 * It also checks the reverse direction. A hash left behind after the script that needed it
 * changed is dead permission, and dead permission in a CSP is how an allowlist quietly stops
 * meaning anything.
 *
 * Run it after a production build: `npm run verify:headers`, or `-- --write` to regenerate the
 * hash list in place after an intentional change.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { argv, exit } from 'node:process';

/** Headers every response must carry, beyond the CSP itself. */
export const REQUIRED_HEADERS = [
  'Strict-Transport-Security',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
];

/** CSP directives that must be present and exactly these values. */
export const REQUIRED_DIRECTIVES = {
  'default-src': "'self'",
  'base-uri': "'self'",
  'object-src': "'none'",
  'frame-ancestors': "'none'",
  'form-action': "'self'",
};

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

export function hashesIn(directive) {
  return (directive.match(/'sha(?:256|384|512)-[^']+'/g) ?? []).map((value) => value.slice(1, -1));
}

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
 * @param {boolean} write
 * @returns {Promise<number>}
 */
async function main(root, headersFile, environmentFile, write) {
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
    const updated = text.replace(/script-src 'self'[^;\n]*/, replacement);
    if (updated === text) {
      console.error('[verify-headers] could not find a script-src directive to rewrite.');
      return 1;
    }
    await writeFile(headersFile, updated);
    console.log(
      `[verify-headers] rewrote script-src with ${buildHashes.size} hashes from ${checked} pages.`,
    );
    return 0;
  }

  const apiOrigin = apiOriginFrom(await readFile(environmentFile, 'utf8'));
  const problems = checkHeaders(parseHeaders(text), buildHashes, apiOrigin);

  if (problems.length > 0) {
    console.error(`[verify-headers] ${headersFile} does not match the build:\n`);
    for (const problem of problems) {
      console.error(`  ${problem}`);
    }
    console.error('\n  Run "npm run verify:headers -- --write" if the change was intentional.\n');
    return 1;
  }

  console.log(
    `[verify-headers] ${checked} pages: ${buildHashes.size} inline scripts allowed by hash, ${REQUIRED_HEADERS.length + 1} headers present.`,
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
      argv.includes('--write'),
    ),
  );
}
