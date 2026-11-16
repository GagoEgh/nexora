import { readFile } from 'node:fs/promises';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { argv, exit } from 'node:process';
import { parseSiteOrigin } from './verify-seo.mjs';
import { REQUIRED_HEADERS, parseCsp, parseHeaders } from './verify-headers.mjs';

const CONCURRENCY = 4;
const TIMEOUT_MS = 15_000;

/**
 * @typedef {object} LiveResponse
 * @property {number} status HTTP status code, or 0 when the answer carried none
 * @property {string[]} headers flat `rawHeaders` pairs
 * @property {string} body response body, decoded as UTF-8
 */

/**
 * @param {string} sitemap the `sitemap.xml` source
 * @returns {string[]} every `<loc>` in document order
 */
export function sitemapUrls(sitemap) {
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

/**
 * @param {string} html
 * @returns {string | null} the canonical href, or null when the document declares none
 */
export function canonicalOf(html) {
  for (const tag of html.match(/<link\b[^>]*>/g) ?? []) {
    if (/rel="canonical"/.test(tag)) {
      return /href="([^"]*)"/.exec(tag)?.[1] ?? null;
    }
  }
  return null;
}

/**
 * @param {string[]} rawHeaders flat `[name, value, ...]` pairs
 * @param {string} name header name, matched case-insensitively
 * @returns {string[]} every value sent under that name, in order
 */
export function headerValues(rawHeaders, name) {
  /** @type {string[]} */
  const values = [];
  for (let index = 0; index < rawHeaders.length; index += 2) {
    if (rawHeaders[index].toLowerCase() === name.toLowerCase()) {
      values.push(rawHeaders[index + 1]);
    }
  }
  return values;
}

/**
 * @param {string} url the URL that was requested
 * @param {LiveResponse} response
 * @returns {string[]} one line per problem; empty when the page is sound
 */
export function checkPage(url, response) {
  const problems = [];

  if (response.status !== 200) {
    problems.push(`answered ${response.status}, expected 200`);
  }

  const location = headerValues(response.headers, 'location');
  if (location.length > 0) {
    problems.push(`redirects to ${location[0]}; a canonical URL must be served directly`);
  }

  if (response.status === 200) {
    const canonical = canonicalOf(response.body);
    if (canonical !== url) {
      problems.push(`declares canonical ${canonical}, but was served at ${url}`);
    }
  }

  return problems;
}

/**
 * @param {Pick<LiveResponse, 'status' | 'body'>} response
 * @param {string} expectedLang
 * @returns {string[]}
 */
export function checkNotFound(response, expectedLang) {
  const problems = [];
  if (response.status !== 404) {
    problems.push(`answered ${response.status}, expected 404`);
  }
  const lang = /<html[^>]*\blang="([^"]*)"/.exec(response.body)?.[1] ?? null;
  if (lang !== expectedLang) {
    problems.push(`served the 404 in ${JSON.stringify(lang)}, expected ${expectedLang}`);
  }
  if (!/<meta[^>]*name="robots"[^>]*noindex/.test(response.body)) {
    problems.push('the 404 body carries no `noindex` robots meta');
  }
  return problems;
}

/**
 * @param {Pick<LiveResponse, 'status' | 'headers'>} response
 * @param {string} apex
 * @returns {string[]}
 */
export function checkWwwRedirect(response, apex) {
  const location = headerValues(response.headers, 'location')[0] ?? null;
  if (response.status === 301 && location?.startsWith(`${apex}/`)) {
    return [];
  }
  return [
    `answered ${response.status} -> ${location}; expected 301 -> ${apex}/ ` +
      '(a `www` that serves 200 is a second copy of the whole site)',
  ];
}

/**
 * A hashed asset must carry exactly one long-lived, immutable `Cache-Control`.
 *
 * @param {readonly string[]} cacheControl - every `Cache-Control` header the response sent
 * @returns {string[]} one message per problem, empty when the caching is sound
 */
export function checkAssetCaching(cacheControl) {
  const problems = [];
  if (cacheControl.length !== 1) {
    problems.push(
      `sent ${cacheControl.length} Cache-Control headers ${JSON.stringify(cacheControl)}; ` +
        'expected exactly 1 - `expires` and `add_header Cache-Control` each set it, so using ' +
        'both emits two',
    );
  }
  const joined = cacheControl.join(', ');
  if (!/max-age=31536000\b/.test(joined)) {
    problems.push(`Cache-Control is ${JSON.stringify(joined)}, expected max-age=31536000`);
  }
  if (!/\bimmutable\b/.test(joined)) {
    problems.push(`Cache-Control is ${JSON.stringify(joined)}, expected it to be immutable`);
  }
  return problems;
}

/**
 * The headers the deployed origin sends must be the ones this repository committed.
 *
 * `verify:headers` compares `public/_headers` with the generated nginx snippet - but both of
 * those live here, so once it passes they agree by construction and neither has been compared
 * with the server. That is the gap the live `connect-src` slipped through: it carries an origin
 * that neither file names, and every check in the repository passed anyway. This is the only
 * check that can see it, because it is the only one that asks the server.
 *
 * The CSP is compared directive by directive rather than as one string, so a drift reports the
 * directive that moved instead of printing two long policies and leaving the reader to diff
 * them by eye.
 *
 * @param {Map<string, string>} expected - the `_headers` rule, as `parseHeaders` returns it
 * @param {string[]} rawHeaders - the live response's headers
 * @returns {string[]} one message per drift, empty when the server matches the repository
 */
export function checkSecurityHeaders(expected, rawHeaders) {
  const problems = [];
  const expectedCsp = expected.get('Content-Security-Policy');

  if (expectedCsp !== undefined) {
    const live = headerValues(rawHeaders, 'content-security-policy');
    if (live.length === 0) {
      problems.push('Content-Security-Policy is missing; public/_headers declares one');
    } else {
      if (live.length > 1) {
        problems.push(
          `sent ${live.length} Content-Security-Policy headers ${JSON.stringify(live)}; ` +
            'expected exactly 1 - a second policy intersects with the first rather than ' +
            'replacing it',
        );
      }
      const sent = parseCsp(live[0] ?? '');
      const want = parseCsp(expectedCsp);
      for (const [directive, value] of want) {
        const actual = sent.get(directive);
        if (actual === undefined) {
          problems.push(`Content-Security-Policy has no ${directive}, expected ${value}`);
        } else if (actual !== value) {
          problems.push(
            `Content-Security-Policy ${directive} is ${JSON.stringify(actual)}, ` +
              `expected ${JSON.stringify(value)}`,
          );
        }
      }
      for (const directive of sent.keys()) {
        if (!want.has(directive)) {
          problems.push(
            `Content-Security-Policy sends ${directive}, which public/_headers does not declare`,
          );
        }
      }
    }
  }

  for (const name of REQUIRED_HEADERS) {
    const want = expected.get(name);
    if (want === undefined) {
      continue;
    }
    const actual = headerValues(rawHeaders, name.toLowerCase());
    if (actual.length === 0) {
      problems.push(`${name} is missing, expected ${JSON.stringify(want)}`);
    } else if (actual[0] !== want) {
      problems.push(`${name} is ${JSON.stringify(actual[0])}, expected ${JSON.stringify(want)}`);
    }
  }

  return problems;
}

/**
 * @param {string} url
 * @param {{ method?: string }} [options]
 * @returns {Promise<LiveResponse>}
 */
function fetchOnce(url, { method = 'GET' } = {}) {
  const target = new URL(url);
  const send = target.protocol === 'http:' ? httpRequest : httpsRequest;
  return new Promise((resolve, reject) => {
    const req = send(
      target,
      { method, headers: { 'user-agent': 'nexora-verify-live-seo' } },
      (res) => {
        /** @type {Buffer[]} */
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 0,
            headers: res.rawHeaders,
            body: Buffer.concat(chunks).toString('utf8'),
          }),
        );
      },
    );
    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error(`timed out after ${TIMEOUT_MS}ms`)));
    req.on('error', reject);
    req.end();
  });
}

/**
 * Runs `run` over `items` with at most `CONCURRENCY` in flight, keeping input order.
 *
 * @template T
 * @template R
 * @param {readonly T[]} items
 * @param {(item: T) => Promise<R>} run
 * @returns {Promise<R[]>}
 */
async function pooled(items, run) {
  /** @type {R[]} */
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await run(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * @param {string} origin
 * @param {string} sitemapPath
 * @param {string} headersPath
 * @returns {Promise<number>} process exit code
 */
async function main(origin, sitemapPath, headersPath) {
  const declared = sitemapUrls(await readFile(sitemapPath, 'utf8'));
  if (declared.length === 0) {
    console.error(`[verify-live-seo] no <loc> entries in ${sitemapPath}.`);
    return 1;
  }

  const urls = declared.map((url) => {
    const path = new URL(url).pathname;
    return origin + (path === '/' ? '/' : path.replace(/\/$/, ''));
  });

  /** @type {string[]} */
  const failures = [];
  /**
   * @param {string} where
   * @param {readonly string[]} problems
   */
  const record = (where, problems) => {
    if (problems.length > 0) {
      failures.push(`${where}\n    ${problems.join('\n    ')}`);
    }
  };

  /**
   * @param {string} where
   * @param {() => Promise<string[]>} run
   */
  const attempt = async (where, run) => {
    try {
      record(where, await run());
    } catch (error) {
      record(where, [`unreachable: ${/** @type {Error} */ (error).message}`]);
    }
  };

  const pages = await pooled(urls, async (url) => {
    try {
      return { url, problems: checkPage(url, await fetchOnce(url)) };
    } catch (error) {
      return { url, problems: [`unreachable: ${/** @type {Error} */ (error).message}`] };
    }
  });
  for (const page of pages) {
    record(page.url, page.problems);
  }

  for (const [prefix, lang] of [
    ['', 'en'],
    ['/hy', 'hy'],
    ['/ru', 'ru'],
  ]) {
    const url = `${origin}${prefix}/no-such-page-${Date.now()}`;
    await attempt(url, async () => checkNotFound(await fetchOnce(url), lang));
  }

  const wwwOrigin = origin.replace('://', '://www.');
  if (wwwOrigin !== origin) {
    await attempt(`${wwwOrigin}/`, async () =>
      checkWwwRedirect(await fetchOnce(`${wwwOrigin}/`, { method: 'HEAD' }), origin),
    );
  }

  await attempt(`${origin}/ (hashed asset caching)`, async () => {
    const home = await fetchOnce(`${origin}/`);
    const asset = /<script[^>]+src="([^"]+\.js)"/.exec(home.body)?.[1];
    if (!asset) {
      return ['no hashed script found in the homepage, so asset caching is untested'];
    }
    const assetUrl = new URL(asset, `${origin}/`).href;
    const response = await fetchOnce(assetUrl, { method: 'HEAD' });
    const problems = checkAssetCaching(headerValues(response.headers, 'cache-control'));
    if (response.status !== 200) {
      problems.unshift(`${assetUrl} answered ${response.status}, expected 200`);
    }
    return problems;
  });

  await attempt(`${origin}/ (security headers against public/_headers)`, async () => {
    const expected = parseHeaders(await readFile(headersPath, 'utf8'));
    const response = await fetchOnce(`${origin}/`, { method: 'HEAD' });
    const problems = checkSecurityHeaders(expected, response.headers);
    if (response.status !== 200) {
      problems.unshift(`${origin}/ answered ${response.status}, expected 200`);
    }
    return problems;
  });

  if (failures.length > 0) {
    console.error(`[verify-live-seo] ${origin}: ${failures.length} failures:\n`);
    for (const failure of failures) {
      console.error(`  ${failure}\n`);
    }
    return 1;
  }

  console.log(
    `[verify-live-seo] ${origin}: ${urls.length} sitemap URLs served directly with matching ` +
      'canonicals, 3 localized 404s, www redirected, assets immutable for a year, security ' +
      'headers matching public/_headers.',
  );
  return 0;
}

if (import.meta.filename === argv[1]) {
  const origin = (
    argv[2] ?? parseSiteOrigin(await readFile('src/environments/environment.production.ts', 'utf8'))
  ).replace(/\/$/, '');
  exit(await main(origin, argv[3] ?? 'public/sitemap.xml', argv[4] ?? 'public/_headers'));
}
