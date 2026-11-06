/**
 * Checks the JavaScript a visitor actually downloads to open a page, per prerendered route.
 *
 * `ng build` prints an "Initial total", but on this project that figure counts `main` plus
 * `styles` and nothing else - it was 499.68 kB raw / 125.31 kB transfer while the home page was
 * really pulling 818 kB raw / 215 kB gzip. The gap is not a packaging fault: every page is
 * prerendered, so its document names the lazy chunks that route needs in
 * `<link rel="modulepreload">`, and the browser fetches those at high priority during load
 * rather than deferring them. Hydration cannot finish without them, so they are first-load cost.
 *
 * No `budgets` entry in `angular.json` can express this. `type: "initial"` measures the entry
 * point, `type: "all"` measures every chunk ever built including ones a given route never
 * touches, and neither knows which chunks a particular document references. Hence this script:
 * it reads the built documents, resolves what each one actually loads, and fails when the worst
 * route crosses the committed ceiling.
 *
 * Run it after a production build: `npm run verify:bundle`.
 * Pass `--report` to print every route and exit 0 regardless, for when you are moving the budget
 * on purpose.
 */
import { readFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { argv, exit } from 'node:process';
import { pagePathFromFile } from './verify-prerender.mjs';

/**
 * The ceiling for the heaviest single route, in gzipped bytes of JavaScript.
 *
 * Measured 2026-11-05: the worst routes are the three `contact` pages at 220.7 kB gzip
 * (829.3 kB raw, 6 files); home is 215.7 kB. The ceiling below carries roughly 9% headroom over
 * that. Raising it is a deliberate act - do it in the same commit as whatever made the page
 * heavier, with the reason in the message, not as a drive-by to make a red build green.
 */
export const MAX_ROUTE_GZIP_BYTES = 240 * 1024;

/** Where the production build puts the browser artifact. */
const BROWSER_DIR = 'dist/nexora/browser';

/**
 * The scripts a document causes the browser to fetch during initial load: the entry `<script
 * src>` plus every `<link rel="modulepreload">`. Both are first-load cost - `modulepreload` is a
 * high-priority fetch issued while the page loads, not a deferral.
 *
 * Returns served paths without a leading slash, de-duplicated, so they can be joined to the
 * output directory.
 *
 * @param {string} html
 * @returns {string[]}
 */
export function loadedScripts(html) {
  /** @type {Set<string>} */
  const found = new Set();

  for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js)"/g)) {
    found.add(match[1]);
  }
  for (const match of html.matchAll(/<link\b[^>]*\brel="modulepreload"[^>]*>/g)) {
    const href = /\bhref="([^"]+\.js)"/.exec(match[0]);
    if (href) {
      found.add(href[1]);
    }
  }

  return [...found].map((path) => path.replace(/^\//, ''));
}

/**
 * @param {number} bytes
 * @returns {string}
 */
export function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} kB`;
}

/**
 * Measures one route. Sizes are cached by the caller, because the same chunk is referenced by
 * many documents and gzipping `main` 27 times is the slow part of this script.
 *
 * @param {string} html
 * @param {(path: string) => Promise<{ raw: number, gzip: number }>} sizeOf
 * @returns {Promise<{ files: number, raw: number, gzip: number }>}
 */
export async function measureDocument(html, sizeOf) {
  let raw = 0;
  let gzip = 0;
  const scripts = loadedScripts(html);

  for (const script of scripts) {
    const size = await sizeOf(script);
    raw += size.raw;
    gzip += size.gzip;
  }

  return { files: scripts.length, raw, gzip };
}

/**
 * @param {string} browserDir
 * @returns {Promise<{ route: string, files: number, raw: number, gzip: number }[]>}
 */
export async function measureRoutes(browserDir) {
  /** @type {Map<string, { raw: number, gzip: number }>} */
  const cache = new Map();

  /** @param {string} path */
  const sizeOf = async (path) => {
    const hit = cache.get(path);
    if (hit) {
      return hit;
    }
    const bytes = await readFile(`${browserDir}/${path}`);
    const size = { raw: bytes.byteLength, gzip: gzipSync(bytes, { level: 9 }).byteLength };
    cache.set(path, size);
    return size;
  };

  /** @type {{ route: string, files: number, raw: number, gzip: number }[]} */
  const routes = [];

  for await (const file of glob('**/index.html', { cwd: browserDir })) {
    const html = await readFile(`${browserDir}/${file}`, 'utf8');
    const measured = await measureDocument(html, sizeOf);
    routes.push({ route: pagePathFromFile(file), ...measured });
  }

  return routes.sort((a, b) => b.gzip - a.gzip);
}

async function main() {
  const report = argv.includes('--report');
  const routes = await measureRoutes(BROWSER_DIR);

  if (routes.length === 0) {
    console.error(`[verify-bundle] No prerendered documents under ${BROWSER_DIR}. Run a build.`);
    exit(1);
  }

  const shown = report ? routes : routes.slice(0, 5);
  const width = Math.max(...shown.map((r) => r.route.length));
  for (const route of shown) {
    console.log(
      `  ${route.route.padEnd(width)}  ${String(route.files).padStart(2)} files  ` +
        `${formatKb(route.raw).padStart(9)} raw  ${formatKb(route.gzip).padStart(9)} gzip`,
    );
  }

  const worst = routes[0];
  if (!report && worst.gzip > MAX_ROUTE_GZIP_BYTES) {
    console.error(
      `\n[verify-bundle] ${worst.route} loads ${formatKb(worst.gzip)} of JavaScript, over the ` +
        `${formatKb(MAX_ROUTE_GZIP_BYTES)} budget in scripts/verify-bundle-budget.mjs.`,
    );
    exit(1);
  }

  console.log(
    `\n[verify-bundle] ${routes.length} routes: worst is ${worst.route} at ` +
      `${formatKb(worst.gzip)} gzip, budget ${formatKb(MAX_ROUTE_GZIP_BYTES)}.`,
  );
}

if (import.meta.filename === process.argv[1]) {
  await main();
}
