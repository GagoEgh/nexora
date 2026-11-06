import { readFile } from 'node:fs/promises';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { argv, exit } from 'node:process';
import { parseSiteOrigin } from './verify-seo.mjs';

const CONCURRENCY = 4;
const TIMEOUT_MS = 15_000;
export function sitemapUrls(sitemap) {
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

export function canonicalOf(html) {
  for (const tag of html.match(/<link\b[^>]*>/g) ?? []) {
    if (/rel="canonical"/.test(tag)) {
      return /href="([^"]*)"/.exec(tag)?.[1] ?? null;
    }
  }
  return null;
}

export function headerValues(rawHeaders, name) {
  const values = [];
  for (let index = 0; index < rawHeaders.length; index += 2) {
    if (rawHeaders[index].toLowerCase() === name.toLowerCase()) {
      values.push(rawHeaders[index + 1]);
    }
  }
  return values;
}

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

async function pooled(items, run) {
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

async function main(origin, sitemapPath) {
  const declared = sitemapUrls(await readFile(sitemapPath, 'utf8'));
  if (declared.length === 0) {
    console.error(`[verify-live-seo] no <loc> entries in ${sitemapPath}.`);
    return 1;
  }

  const urls = declared.map((url) => {
    const path = new URL(url).pathname;
    return origin + (path === '/' ? '/' : path.replace(/\/$/, ''));
  });

  const failures = [];
  const record = (where, problems) => {
    if (problems.length > 0) {
      failures.push(`${where}\n    ${problems.join('\n    ')}`);
    }
  };

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

  if (failures.length > 0) {
    console.error(`[verify-live-seo] ${origin}: ${failures.length} failures:\n`);
    for (const failure of failures) {
      console.error(`  ${failure}\n`);
    }
    return 1;
  }

  console.log(
    `[verify-live-seo] ${origin}: ${urls.length} sitemap URLs served directly with matching ` +
      'canonicals, 3 localized 404s, www redirected, assets immutable for a year.',
  );
  return 0;
}

if (import.meta.filename === argv[1]) {
  const origin = (
    argv[2] ?? parseSiteOrigin(await readFile('src/environments/environment.production.ts', 'utf8'))
  ).replace(/\/$/, '');
  exit(await main(origin, argv[3] ?? 'public/sitemap.xml'));
}
