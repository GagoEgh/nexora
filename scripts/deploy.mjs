import { spawn } from 'node:child_process';
import { glob, readFile } from 'node:fs/promises';
import { argv, exit } from 'node:process';

export const BUILD_DIR = 'dist/nexora/browser';
export const REFUSED_ROOTS = [
  '/',
  '/bin',
  '/boot',
  '/dev',
  '/etc',
  '/home',
  '/lib',
  '/opt',
  '/proc',
  '/root',
  '/run',
  '/sbin',
  '/sys',
  '/tmp',
  '/usr',
  '/var',
];

/**
 * @param {string | undefined} value
 * @returns {string} the validated target
 * @throws {Error} when the target could not be used safely
 */
export function parseTarget(value) {
  if (value === undefined || value === '') {
    throw new Error('a deploy target is required, for example deploy@nexoratechnology.org');
  }
  if (!/^(?:[A-Za-z_][A-Za-z0-9._-]*@)?[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(value)) {
    throw new Error(
      `deploy target ${JSON.stringify(value)} is not a plain user@host; ` +
        'ssh aliases with options belong in ~/.ssh/config, not on this command line',
    );
  }
  return value;
}

/**
 * Validates the remote web root.
 *
 * @param {string} value
 * @returns {string} the validated root, without a trailing slash
 * @throws {Error} when the root is malformed or is a system directory
 */
export function parseRemoteRoot(value) {
  if (!/^\/[A-Za-z0-9._/-]*$/.test(value) || value.includes('//') || value.includes('..')) {
    throw new Error(
      `remote root ${JSON.stringify(value)} must be an absolute path without .. or //`,
    );
  }
  const normalised = value.length > 1 && value.endsWith('/') ? value.slice(0, -1) : value;
  if (REFUSED_ROOTS.includes(normalised)) {
    throw new Error(
      `refusing to deploy into ${normalised}: publishing would replace it wholesale. ` +
        'Use a directory that holds nothing but this site, such as /srv/nexora.',
    );
  }
  return normalised;
}

/**
 * The file `deploy/nginx/nexora-site.conf` resolves a path to, via `try_files $uri/index.html`.
 *
 * `/` -> `index.html`; `/our_work/fairwell` -> `our_work/fairwell/index.html`.
 *
 * @param {string} pathname
 * @returns {string} a path relative to the build directory, with forward slashes
 */
export function routeFileFor(pathname) {
  const trimmed = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  return trimmed === '' ? 'index.html' : `${trimmed}/index.html`;
}

/**
 * @param {string} sitemapXml - contents of `public/sitemap.xml`
 * @param {string} origin - the site origin whose prefix is stripped from each `<loc>`
 * @param {Set<string>} files - build-relative paths present in the artifact
 * @returns {string[]} the absent routes, as URLs, in sitemap order
 */
export function missingRoutes(sitemapXml, origin, files) {
  const absent = [];
  const base = origin.replace(/\/+$/, '');
  for (const match of sitemapXml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    const loc = match[1] ?? '';
    if (!loc.startsWith(base)) continue;
    if (!files.has(routeFileFor(loc.slice(base.length)))) absent.push(loc);
  }
  return absent;
}

/**
 *
 * @param {string} localDir
 * @returns {string[]}
 */
export function tarArgs(localDir) {
  return ['-czf', '-', '-C', localDir, '.'];
}

/**
 *
 * @param {string} root
 * @returns {string}
 */
export function publishScript(root) {
  const parent = root.slice(0, root.lastIndexOf('/')) || '/';
  return [
    'set -e',
    `if [ ! -w '${parent}' ]; then`,
    `  echo "no write access to ${parent}; publishing swaps directories, so the deploy user" >&2`,
    `  echo "needs it. Fix on the host: chown \\$(id -un) '${parent}'" >&2`,
    '  exit 13',
    'fi',
    `rm -rf '${root}.new'`,
    `mkdir -p '${root}.new'`,
    `tar -xzf - -C '${root}.new'`,
    `test -f '${root}.new/index.html'`,
    `rm -rf '${root}.prev'`,
    `if [ -d '${root}' ]; then mv '${root}' '${root}.prev'; fi`,
    `mv '${root}.new' '${root}'`,
    `echo "published; previous release at ${root}.prev"`,
  ].join('\n');
}

/**
 *
 * @param {string} root
 * @returns {string}
 */
export function rollbackScript(root) {
  return [
    'set -e',
    `test -d '${root}.prev'`,
    `rm -rf '${root}.failed'`,
    `if [ -d '${root}' ]; then mv '${root}' '${root}.failed'; fi`,
    `cp -a '${root}.prev' '${root}'`,
    `echo "rolled back; the rejected release is at ${root}.failed"`,
  ].join('\n');
}

/**
 *
 * @param {string} command
 * @param {string[]} args
 * @returns {Promise<number>} the exit code
 */
function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: false });
    child.on('error', () => resolve(127));
    child.on('close', (code) => resolve(code ?? 1));
  });
}

/**
 * Pipes one command's stdout into another's stdin, as a shell `|` would.
 *
 * @param {{ command: string, args: string[] }} producer
 * @param {{ command: string, args: string[] }} consumer
 * @returns {Promise<number>} the first non-zero exit code, or 0
 */
function runPiped(producer, consumer) {
  return new Promise((resolve) => {
    const left = spawn(producer.command, producer.args, { stdio: ['ignore', 'pipe', 'inherit'] });
    const right = spawn(consumer.command, consumer.args, { stdio: ['pipe', 'inherit', 'inherit'] });
    let leftCode = 0;
    let settled = false;
    /** @param {number} code */
    const settle = (code) => {
      if (!settled) {
        settled = true;
        resolve(code);
      }
    };
    left.on('error', () => settle(127));
    right.on('error', () => settle(127));
    left.stdout?.pipe(right.stdin);
    left.stdout?.on('error', () => settle(1));
    right.stdin?.on('error', () => undefined);
    left.on('close', (code) => {
      leftCode = code ?? 1;
    });
    right.on('close', (code) => settle(leftCode !== 0 ? leftCode : (code ?? 1)));
  });
}

/**
 * @param {string} target
 * @param {string} root
 * @param {string} origin
 * @returns {Promise<number>} the process exit code
 */
async function main(target, root, origin) {
  /** @type {Set<string>} */
  const files = new Set();
  for await (const entry of glob('**/*.html', { cwd: BUILD_DIR })) {
    files.add(entry.split('\\').join('/'));
  }

  if (!files.has('index.html')) {
    console.error(`no build in ${BUILD_DIR}. Run \`npm run build\` first.`);
    return 1;
  }

  const absent = missingRoutes(await readFile('public/sitemap.xml', 'utf8'), origin, files);
  if (absent.length > 0) {
    console.error(
      `${BUILD_DIR} is missing ${absent.length} route(s) the sitemap promises. ` +
        'Shipping it would publish 404s:',
    );
    for (const url of absent.slice(0, 10)) console.error(`  ${url}`);
    if (absent.length > 10) console.error(`  ... and ${absent.length - 10} more`);
    return 1;
  }
  console.log(
    `${files.size} prerendered pages, every sitemap URL present. Publishing to ${target}`,
  );

  const published = await runPiped(
    { command: 'tar', args: tarArgs(BUILD_DIR) },
    { command: 'ssh', args: [target, publishScript(root)] },
  );
  if (published !== 0) {
    console.error(
      published === 127
        ? 'could not run tar or ssh. Both must be on PATH; Windows 10+ and Git Bash ship them.'
        : 'publish failed. The previous release is still being served - nothing was swapped.',
    );
    return 1;
  }

  console.log(`\nverifying ${origin}`);
  if ((await run('npm', ['run', 'verify:live-seo', '--', origin])) !== 0) {
    console.error('\nthe deployed site does not match this repository. Rolling back.');
    if ((await run('ssh', [target, rollbackScript(root)])) !== 0) {
      console.error(`rollback FAILED. Restore by hand:\n  ssh ${target} "${rollbackScript(root)}"`);
    }
    return 1;
  }

  console.log(`\ndeployed and verified. Previous release remains at ${root}.prev`);
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  try {
    exit(
      await main(
        parseTarget(argv[2]),
        parseRemoteRoot(argv[3] ?? '/srv/nexora'),
        argv[4] ?? 'https://nexoratechnology.org',
      ),
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error('\nusage: npm run deploy -- user@host [remote-root] [origin]');
    exit(2);
  }
}
