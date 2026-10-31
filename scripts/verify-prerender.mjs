/**
 * Checks that every prerendered page works before Angular runs, and with JavaScript off.
 *
 * This cannot be a Playwright spec. `outputMode: "static"` prerenders at build time only, so
 * `ng serve` - what `ng e2e` runs against - answers with a bare shell containing an empty
 * `<app-root>`; a browser with JavaScript disabled would see nothing there regardless of what
 * the templates say. The artifact a real visitor receives is `dist/browser`, so that is what
 * this inspects.
 *
 * Run it after a production build: `npm run verify:prerender`.
 */
import { readFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { argv, exit } from 'node:process';

/** Locale prefixes used by the `prefix-no-default` routing; the default locale has none. */
export const PREFIXED_LOCALES = ['hy', 'ru'];

/**
 * `about/index.html` -> `/about`; `index.html` -> `/`.
 *
 * @param {string} relativePath
 * @returns {string}
 */
export function pagePathFromFile(relativePath) {
  const trimmed = relativePath.replace(/\\/g, '/').replace(/\/?index\.html$/, '');
  return trimmed === '' ? '/' : `/${trimmed}`;
}

/**
 * Drops the locale prefix, so `/hy/about` and `/about` both yield `/about`.
 *
 * @param {string} pagePath
 * @returns {string}
 */
export function basePath(pagePath) {
  for (const locale of PREFIXED_LOCALES) {
    if (pagePath === `/${locale}`) {
      return '/';
    }
    if (pagePath.startsWith(`/${locale}/`)) {
      return pagePath.slice(locale.length + 1);
    }
  }
  return pagePath;
}

/**
 * The three hrefs the footer switcher must offer on a page, in locale order.
 *
 * @param {string} pagePath
 * @returns {string[]}
 */
export function expectedLocaleHrefs(pagePath) {
  const base = basePath(pagePath);
  const suffix = base === '/' ? '' : base;
  return [base, ...PREFIXED_LOCALES.map((locale) => `/${locale}${suffix}`)];
}

/**
 * @param {string} tag
 * @param {string} name
 * @returns {string | null}
 */
const attribute = (tag, name) => {
  const match = new RegExp(`${name}="([^"]*)"`).exec(tag);
  return match ? match[1] : null;
};

/**
 * Every `<a>` tag in the document whose class list contains `className`.
 *
 * @param {string} html
 * @param {string} className
 * @returns {string[]}
 */
const anchorsWithClass = (html, className) =>
  (html.match(/<a\b[^>]*>/g) ?? []).filter((tag) => {
    const classes = attribute(tag, 'class');
    return classes !== null && classes.split(/\s+/).includes(className);
  });

/**
 * Returns a list of problems with one prerendered document. Empty means it passes.
 *
 * Each check is something that silently regressed once already: the header's Services and
 * language controls live in `@defer` placeholders, which is what gets prerendered, and both
 * were buttons - inert without a script.
 *
 * @param {string} html
 * @param {string} pagePath
 * @returns {string[]}
 */
export function checkDocument(html, pagePath) {
  /** @type {string[]} */
  const problems = [];

  const services = anchorsWithClass(html, 'header__link').filter((tag) =>
    tag.includes('data-services-pending'),
  );
  if (services.length !== 1) {
    problems.push(
      `expected 1 anchor Services fallback, found ${services.length} (a <button> cannot open a menu without JavaScript)`,
    );
  } else {
    const expected = basePath(pagePath) === '/' ? '/services' : null;
    const href = attribute(services[0], 'href');
    if (!href) {
      problems.push('the Services fallback has no href');
    } else if (expected !== null && href !== expected && !href.endsWith('/services')) {
      problems.push(`the Services fallback points at ${href}, not a /services URL`);
    }
  }

  const languages = anchorsWithClass(html, 'footer__language');
  const hrefs = languages.map((tag) => attribute(tag, 'href'));
  const wanted = expectedLocaleHrefs(pagePath);
  if (hrefs.length !== wanted.length || hrefs.some((href, i) => href !== wanted[i])) {
    problems.push(
      `footer locale links are ${JSON.stringify(hrefs)}, expected ${JSON.stringify(wanted)}`,
    );
  }

  const pill = (html.match(/<a\b[^>]*data-lang-pending[^>]*>/g) ?? [])[0];
  if (!pill) {
    problems.push('the header language pill is not an anchor');
  } else if (attribute(pill, 'href') !== '#footer-languages') {
    problems.push(`the header language pill points at ${attribute(pill, 'href')}`);
  }
  if (!html.includes('id="footer-languages"')) {
    problems.push('nothing carries id="footer-languages", so the pill links nowhere');
  }

  const skip = anchorsWithClass(html, 'app__skip')[0];
  if (!skip) {
    problems.push('the skip link is missing');
  } else if (attribute(skip, 'href') !== '#main-content') {
    problems.push(`the skip link points at ${attribute(skip, 'href')}`);
  }
  if (!html.includes('id="main-content"')) {
    problems.push('nothing carries id="main-content", so the skip link lands nowhere');
  }

  return problems;
}

/**
 * @param {string} root
 * @returns {Promise<number>}
 */
async function main(root) {
  /** @type {string[]} */
  const failures = [];
  let checked = 0;

  for await (const file of glob('**/index.html', { cwd: root })) {
    const pagePath = pagePathFromFile(file);
    const problems = checkDocument(await readFile(`${root}/${file}`, 'utf8'), pagePath);
    checked += 1;
    if (problems.length > 0) {
      failures.push(`${pagePath}\n    ${problems.join('\n    ')}`);
    }
  }

  if (checked === 0) {
    console.error(`[verify-prerender] no prerendered pages under ${root}. Run a build first.`);
    return 1;
  }

  if (failures.length > 0) {
    console.error(`[verify-prerender] ${failures.length} of ${checked} pages failed:\n`);
    for (const failure of failures) {
      console.error(`  ${failure}\n`);
    }
    return 1;
  }

  console.log(`[verify-prerender] ${checked} prerendered pages are navigable without JavaScript.`);
  return 0;
}

if (import.meta.filename === argv[1]) {
  exit(await main(argv[2] ?? 'dist/nexora/browser'));
}
