import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  checkCorpus,
  checkDocument,
  hreflangMap,
  jsonLdGraphs,
  localeOf,
  parseSiteOrigin,
} from './verify-seo.mjs';

const ORIGIN = 'https://example.test';

const page = (overrides = {}) => {
  const {
    lang = 'en',
    title = '<title>About Nexora</title>',
    description = '<meta name="description" content="Who we are.">',
    canonical = `<link rel="canonical" href="${ORIGIN}/about">`,
    ogUrl = `<meta property="og:url" content="${ORIGIN}/about">`,
    twitter = [
      `<meta name="twitter:title" content="About Nexora">`,
      `<meta name="twitter:description" content="Who we are.">`,
      `<meta name="twitter:image" content="${ORIGIN}/brand/og-cover.png">`,
    ].join(''),
    alternates = [
      `<link rel="alternate" hreflang="en" href="${ORIGIN}/about">`,
      `<link rel="alternate" hreflang="hy" href="${ORIGIN}/hy/about">`,
      `<link rel="alternate" hreflang="ru" href="${ORIGIN}/ru/about">`,
      `<link rel="alternate" hreflang="x-default" href="${ORIGIN}/about">`,
    ].join(''),
    robots = '',
    body = '<h1>About</h1><img src="/a.png" alt="A">',
    jsonLd = `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', '@id': `${ORIGIN}/#organization` },
        { '@type': 'WebSite', '@id': `${ORIGIN}/#website` },
        { '@type': 'WebPage', '@id': `${ORIGIN}/about#webpage`, url: `${ORIGIN}/about` },
      ],
    })}</script>`,
  } = overrides;
  return `<!doctype html><html lang="${lang}"><head>${title}${description}${canonical}${ogUrl}${twitter}${alternates}${robots}${jsonLd}</head><body>${body}</body></html>`;
};

describe('verify-seo', () => {
  it('accepts a document that satisfies the whole contract', () => {
    assert.deepEqual(checkDocument(page(), '/about', ORIGIN), []);
  });

  it('reads the locale off the path, and only off a real prefix', () => {
    assert.equal(localeOf('/'), 'en');
    assert.equal(localeOf('/about'), 'en');
    assert.equal(localeOf('/hy'), 'hy');
    assert.equal(localeOf('/ru/about'), 'ru');
    // `/running` must not be read as the `ru` prefix plus `nning`.
    assert.equal(localeOf('/running'), 'en');
  });

  it('reads the origin out of the production environment file', () => {
    assert.equal(
      parseSiteOrigin("export const environment = {\n  siteOrigin: 'https://a.test',\n};"),
      'https://a.test',
    );
    assert.equal(parseSiteOrigin("siteOrigin: 'https://a.test/'"), 'https://a.test');
    assert.throws(() => parseSiteOrigin('export const environment = {};'), /siteOrigin/);
  });

  const mutations = [
    [{ lang: 'ru' }, /<html lang> is "ru"/],
    [{ title: '' }, /no <title>/],
    [{ title: '<title>   </title>' }, /no <title>/],
    [{ description: '' }, /no <meta name="description">/],
    [{ canonical: '' }, /expected 1 canonical link, found 0/],
    [
      {
        canonical: `<link rel="canonical" href="${ORIGIN}/about"><link rel="canonical" href="/x">`,
      },
      /expected 1 canonical link, found 2/,
    ],
    [{ canonical: `<link rel="canonical" href="${ORIGIN}/about/">` }, /canonical is .*about\//],
    [{ ogUrl: '' }, /og:url is null/],
    [{ twitter: '' }, /no <meta name="twitter:title">/],
    [{ alternates: '' }, /hreflang keys are \[\]/],
    [
      {
        alternates: [
          `<link rel="alternate" hreflang="en" href="${ORIGIN}/about">`,
          `<link rel="alternate" hreflang="hy" href="${ORIGIN}/hy/about">`,
          `<link rel="alternate" hreflang="ru" href="${ORIGIN}/ru/about">`,
          `<link rel="alternate" hreflang="x-default" href="${ORIGIN}/hy/about">`,
        ].join(''),
      },
      /x-default is .*\/hy\/about/,
    ],
    [{ body: '<h1>A</h1><h1>B</h1>' }, /expected exactly 1 <h1>, found 2/],
    [{ body: '<h1>A</h1>' + '<img src="/a.png">' }, /1 <img> without alt/],
    [{ robots: '<meta name="robots" content="noindex">' }, /must be indexable/],
    [{ jsonLd: '' }, /expected 1 JSON-LD block, found 0/],
    [
      { jsonLd: '<script type="application/ld+json">{ not json }</script>' },
      /JSON-LD does not parse/,
    ],
    [
      {
        jsonLd: `<script type="application/ld+json">${JSON.stringify({
          '@graph': [{ '@type': 'WebPage', url: `${ORIGIN}/about` }],
        })}</script>`,
      },
      /no Organization node/,
    ],
    [
      {
        jsonLd: `<script type="application/ld+json">${JSON.stringify({
          '@graph': [
            { '@type': 'Organization' },
            { '@type': 'WebSite' },
            { '@type': 'WebPage', url: `${ORIGIN}/elsewhere` },
          ],
        })}</script>`,
      },
      /WebPage.url is .*\/elsewhere/,
    ],
  ];

  for (const [overrides, expected] of mutations) {
    it(`rejects ${JSON.stringify(Object.keys(overrides)[0])}: ${expected.source}`, () => {
      const problems = checkDocument(page(overrides), '/about', ORIGIN);
      assert.ok(
        problems.some((problem) => expected.test(problem)),
        `expected a problem matching ${expected} but got ${JSON.stringify(problems)}`,
      );
    });
  }

  it('requires noindex on /not-found, in every locale', () => {
    const notFound = (robots) =>
      checkDocument(
        page({
          robots,
          canonical: `<link rel="canonical" href="${ORIGIN}/hy/not-found">`,
          ogUrl: `<meta property="og:url" content="${ORIGIN}/hy/not-found">`,
          lang: 'hy',
          alternates: [
            `<link rel="alternate" hreflang="en" href="${ORIGIN}/not-found">`,
            `<link rel="alternate" hreflang="hy" href="${ORIGIN}/hy/not-found">`,
            `<link rel="alternate" hreflang="ru" href="${ORIGIN}/ru/not-found">`,
            `<link rel="alternate" hreflang="x-default" href="${ORIGIN}/not-found">`,
          ].join(''),
          jsonLd: `<script type="application/ld+json">${JSON.stringify({
            '@graph': [
              { '@type': 'Organization' },
              { '@type': 'WebSite' },
              { '@type': 'WebPage', url: `${ORIGIN}/hy/not-found` },
            ],
          })}</script>`,
        }),
        '/hy/not-found',
        ORIGIN,
      );

    assert.deepEqual(notFound('<meta name="robots" content="noindex, follow">'), []);
    assert.ok(notFound('').some((problem) => /must be noindex/.test(problem)));
  });

  it('pulls the hreflang pairs out of the head and ignores other links', () => {
    assert.deepEqual(
      hreflangMap(
        '<link rel="canonical" href="/a"><link rel="alternate" hreflang="ru" href="/ru/a">',
      ),
      { ru: '/ru/a' },
    );
  });

  it('reports a JSON-LD parse failure instead of throwing', () => {
    const { graphs, problems } = jsonLdGraphs(
      '<script type="application/ld+json">{</script><script type="application/ld+json">{}</script>',
    );
    assert.deepEqual(graphs, [{}]);
    assert.equal(problems.length, 1);
  });

  describe('across the corpus', () => {
    const alternates = (base) => ({
      en: `${ORIGIN}${base}`,
      hy: `${ORIGIN}/hy${base === '/' ? '' : base}`,
      ru: `${ORIGIN}/ru${base === '/' ? '' : base}`,
      'x-default': `${ORIGIN}${base}`,
    });
    const docs = [
      { pagePath: '/', title: 'Home', alternates: alternates('/') },
      { pagePath: '/hy', title: 'Գլխավոր', alternates: alternates('/') },
      { pagePath: '/ru', title: 'Главная', alternates: alternates('/') },
      { pagePath: '/not-found', title: 'Not found', alternates: alternates('/not-found') },
      { pagePath: '/hy/not-found', title: 'Չի գտնվել', alternates: alternates('/not-found') },
      { pagePath: '/ru/not-found', title: 'Не найдено', alternates: alternates('/not-found') },
    ];
    const sitemap = [`<loc>${ORIGIN}/</loc>`, `<loc>${ORIGIN}/hy</loc>`, `<loc>${ORIGIN}/ru</loc>`]
      .map((loc) => `<url>${loc}</url>`)
      .join('');

    it('accepts a corpus the sitemap agrees with', () => {
      assert.deepEqual(checkCorpus(docs, sitemap, ORIGIN), []);
    });

    it('catches two documents sharing a title', () => {
      const clashing = docs.map((doc) => ({ ...doc, title: 'Home' }));
      assert.ok(
        checkCorpus(clashing, sitemap, ORIGIN).some((problem) => /duplicate <title>/.test(problem)),
      );
    });

    it('catches an hreflang pointing at a page that was not built', () => {
      const dangling = [
        { ...docs[0], alternates: { ...docs[0].alternates, ru: `${ORIGIN}/ru/ghost` } },
        ...docs.slice(1),
      ];
      assert.ok(
        checkCorpus(dangling, sitemap, ORIGIN).some((problem) =>
          /hreflang ru points at .*\/ru\/ghost, which is not a prerendered document/.test(problem),
        ),
      );
    });

    it('catches an indexable page missing from the sitemap', () => {
      const short = sitemap.replace(`<url><loc>${ORIGIN}/ru</loc></url>`, '');
      assert.ok(
        checkCorpus(docs, short, ORIGIN).some(
          (problem) => problem === `sitemap is missing ${ORIGIN}/ru`,
        ),
      );
    });

    it('catches the noindex page being listed in the sitemap', () => {
      const tooLong = sitemap + `<url><loc>${ORIGIN}/not-found</loc></url>`;
      assert.ok(
        checkCorpus(docs, tooLong, ORIGIN).some((problem) => /which is noindex/.test(problem)),
      );
    });

    it('catches the sitemap listing a URL this build did not produce', () => {
      const tooLong = sitemap + `<url><loc>${ORIGIN}/ghost</loc></url>`;
      assert.ok(
        checkCorpus(docs, tooLong, ORIGIN).some((problem) =>
          /\/ghost, which this build did not produce/.test(problem),
        ),
      );
    });

    it('catches a duplicated sitemap entry', () => {
      const doubled = sitemap + `<url><loc>${ORIGIN}/ru</loc></url>`;
      assert.ok(
        checkCorpus(docs, doubled, ORIGIN).some((problem) => /1 duplicate <loc>/.test(problem)),
      );
    });
  });
});
