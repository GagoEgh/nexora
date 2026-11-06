import { glob, readFile } from 'node:fs/promises';
import { argv, exit } from 'node:process';
import { PREFIXED_LOCALES, basePath, pagePathFromFile } from './verify-prerender.mjs';

export const NOINDEX_BASE_PATHS = ['/not-found'];
export const EXPECTED_HREFLANGS = ['en', ...PREFIXED_LOCALES, 'x-default'];

export function localeOf(pagePath) {
  for (const locale of PREFIXED_LOCALES) {
    if (pagePath === `/${locale}` || pagePath.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return 'en';
}

export function parseSiteOrigin(source) {
  const match = /siteOrigin:\s*'([^']+)'/.exec(source);
  if (!match) {
    throw new Error('could not find `siteOrigin` in the production environment file');
  }
  return match[1].replace(/\/$/, '');
}

const first = (html, re) => {
  const match = re.exec(html);
  return match ? match[1] : null;
};

export function hreflangMap(html) {
  const found = {};
  for (const tag of html.match(/<link\b[^>]*rel="alternate"[^>]*>/g) ?? []) {
    const hreflang = first(tag, /hreflang="([^"]*)"/);
    const href = first(tag, /href="([^"]*)"/);
    if (hreflang && href) {
      found[hreflang] = href;
    }
  }
  return found;
}

export function jsonLdGraphs(html) {
  const graphs = [];
  const problems = [];
  const blocks =
    html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) ?? [];
  for (const block of blocks) {
    const body = block.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
    try {
      graphs.push(JSON.parse(body));
    } catch (error) {
      problems.push(`JSON-LD does not parse: ${/** @type {Error} */ (error).message}`);
    }
  }
  return { graphs, problems };
}

export function checkDocument(html, pagePath, origin) {
  const problems = [];
  const canonical = origin + pagePath;
  const locale = localeOf(pagePath);

  const lang = first(html, /<html[^>]*\blang="([^"]*)"/);
  if (lang !== locale) {
    problems.push(`<html lang> is ${JSON.stringify(lang)}, expected ${JSON.stringify(locale)}`);
  }

  const title = first(html, /<title>([\s\S]*?)<\/title>/);
  if (!title || !title.trim()) {
    problems.push('no <title>');
  }

  const description = first(html, /<meta[^>]*name="description"[^>]*content="([^"]*)"/);
  if (!description || !description.trim()) {
    problems.push('no <meta name="description">');
  }

  const canonicalLinks = html.match(/<link\b[^>]*rel="canonical"[^>]*>/g) ?? [];
  if (canonicalLinks.length !== 1) {
    problems.push(`expected 1 canonical link, found ${canonicalLinks.length}`);
  } else {
    const href = first(canonicalLinks[0], /href="([^"]*)"/);
    if (href !== canonical) {
      problems.push(`canonical is ${href}, expected ${canonical}`);
    }
  }

  const ogUrl = first(html, /<meta[^>]*property="og:url"[^>]*content="([^"]*)"/);
  if (ogUrl !== canonical) {
    problems.push(`og:url is ${ogUrl}, expected the canonical ${canonical}`);
  }

  for (const name of ['twitter:title', 'twitter:description', 'twitter:image']) {
    if (!new RegExp(`<meta[^>]*name="${name}"[^>]*content="[^"]+"`).test(html)) {
      problems.push(`no <meta name="${name}">`);
    }
  }

  const alternates = hreflangMap(html);
  const keys = Object.keys(alternates).sort();
  if (keys.join(',') !== [...EXPECTED_HREFLANGS].sort().join(',')) {
    problems.push(
      `hreflang keys are ${JSON.stringify(keys)}, expected ${JSON.stringify([...EXPECTED_HREFLANGS].sort())}`,
    );
  } else {
    if (alternates[locale] !== canonical) {
      problems.push(
        `the self hreflang (${locale}) is ${alternates[locale]}, expected the canonical ${canonical}`,
      );
    }
    if (alternates['x-default'] !== alternates['en']) {
      problems.push(
        `x-default is ${alternates['x-default']}, expected the en alternate ${alternates['en']}`,
      );
    }
  }

  const h1Count = (html.match(/<h1\b/g) ?? []).length;
  if (h1Count !== 1) {
    problems.push(`expected exactly 1 <h1>, found ${h1Count}`);
  }

  const imagesWithoutAlt = (html.match(/<img\b[^>]*>/g) ?? []).filter((tag) => !/\salt=/.test(tag));
  if (imagesWithoutAlt.length > 0) {
    problems.push(`${imagesWithoutAlt.length} <img> without alt`);
  }

  const shouldNoindex = NOINDEX_BASE_PATHS.includes(basePath(pagePath));
  const robots = first(html, /<meta[^>]*name="robots"[^>]*content="([^"]*)"/);
  if (shouldNoindex && !(robots ?? '').includes('noindex')) {
    problems.push(`must be noindex, but the robots meta is ${JSON.stringify(robots)}`);
  }
  if (!shouldNoindex && robots !== null) {
    problems.push(`must be indexable, but carries a robots meta of ${JSON.stringify(robots)}`);
  }

  const { graphs, problems: ldProblems } = jsonLdGraphs(html);
  problems.push(...ldProblems);
  if (graphs.length !== 1) {
    problems.push(`expected 1 JSON-LD block, found ${graphs.length}`);
  } else {
    const graph = /** @type {{ '@graph'?: { '@type'?: string }[] }} */ (graphs[0])['@graph'] ?? [];
    const types = graph.map((node) => node['@type']);
    for (const required of ['Organization', 'WebSite', 'WebPage']) {
      if (!types.includes(required)) {
        problems.push(`JSON-LD graph has no ${required} node (found ${JSON.stringify(types)})`);
      }
    }
    const page = graph.find((node) => node['@type'] === 'WebPage');
    const pageUrl = /** @type {{ url?: string } | undefined} */ (page)?.url;
    if (page && pageUrl !== canonical) {
      problems.push(`WebPage.url is ${pageUrl}, expected the canonical ${canonical}`);
    }
  }

  return problems;
}

export function checkCorpus(docs, sitemap, origin) {
  const problems = [];
  const byTitle = new Map();
  for (const doc of docs) {
    const key = doc.title ?? '(none)';
    byTitle.set(key, [...(byTitle.get(key) ?? []), doc.pagePath]);
  }
  for (const [title, paths] of byTitle) {
    if (paths.length > 1) {
      problems.push(`duplicate <title> ${JSON.stringify(title)} on ${paths.join(', ')}`);
    }
  }

  const built = new Set(docs.map((doc) => origin + doc.pagePath));
  for (const doc of docs) {
    for (const [hreflang, href] of Object.entries(doc.alternates)) {
      if (!built.has(href)) {
        problems.push(
          `${doc.pagePath}: hreflang ${hreflang} points at ${href}, which is not a prerendered document`,
        );
      }
    }
  }

  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const inSitemap = new Set(locs);
  if (locs.length !== inSitemap.size) {
    problems.push(`sitemap has ${locs.length - inSitemap.size} duplicate <loc> entries`);
  }
  for (const doc of docs) {
    const url = origin + doc.pagePath;
    const mustBeIndexed = !NOINDEX_BASE_PATHS.includes(basePath(doc.pagePath));
    if (mustBeIndexed && !inSitemap.has(url)) {
      problems.push(`sitemap is missing ${url}`);
    }
    if (!mustBeIndexed && inSitemap.has(url)) {
      problems.push(`sitemap lists ${url}, which is noindex`);
    }
  }
  for (const loc of inSitemap) {
    if (!built.has(loc)) {
      problems.push(`sitemap lists ${loc}, which this build did not produce`);
    }
  }

  return problems;
}

async function main(root, sitemapPath, environmentPath) {
  const origin = parseSiteOrigin(await readFile(environmentPath, 'utf8'));
  const sitemap = await readFile(sitemapPath, 'utf8');
  const failures = [];
  const docs = [];

  for await (const file of glob('**/index.html', { cwd: root })) {
    const pagePath = pagePathFromFile(file);
    const html = await readFile(`${root}/${file}`, 'utf8');
    const problems = checkDocument(html, pagePath, origin);
    docs.push({
      pagePath,
      title: first(html, /<title>([\s\S]*?)<\/title>/),
      alternates: hreflangMap(html),
    });
    if (problems.length > 0) {
      failures.push(`${pagePath}\n    ${problems.join('\n    ')}`);
    }
  }

  if (docs.length === 0) {
    console.error(`[verify-seo] no prerendered pages under ${root}. Run a build first.`);
    return 1;
  }

  const corpus = checkCorpus(docs, sitemap, origin);
  if (corpus.length > 0) {
    failures.push(`across the corpus\n    ${corpus.join('\n    ')}`);
  }

  if (failures.length > 0) {
    console.error(`[verify-seo] ${failures.length} failures:\n`);
    for (const failure of failures) {
      console.error(`  ${failure}\n`);
    }
    return 1;
  }

  const indexable = docs.filter((doc) => !NOINDEX_BASE_PATHS.includes(basePath(doc.pagePath)));
  console.log(
    `[verify-seo] ${docs.length} documents: unique titles, canonical and hreflang agree, ` +
      `${indexable.length} indexable and in the sitemap, ${docs.length - indexable.length} noindex.`,
  );
  return 0;
}

if (import.meta.filename === argv[1]) {
  exit(
    await main(
      argv[2] ?? 'dist/nexora/browser',
      argv[3] ?? 'public/sitemap.xml',
      argv[4] ?? 'src/environments/environment.production.ts',
    ),
  );
}
