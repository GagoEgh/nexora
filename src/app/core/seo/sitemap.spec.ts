import { readFileSync } from 'node:fs';
import { defaultLocale, getLocalizedUrl, locales } from 'intlayer';
import { DOCUMENT_META_PAGES, pagePath } from './document-meta';
import { SEO_CONFIG } from './site-origin';

/**
 * `public/sitemap.xml` and `public/robots.txt` are static files, so nothing regenerates them
 * when a route is added. This is what notices: the sitemap is checked against the same route
 * table and the same URL builder the pages themselves use, rather than against a second copy
 * of the list.
 */
const origin = SEO_CONFIG.origin;
const sitemap = readFileSync('public/sitemap.xml', 'utf8');
const robots = readFileSync('public/robots.txt', 'utf8');

/** A 404 is not a public route; everything else in the table is. */
const publicPages = DOCUMENT_META_PAGES.filter((page) => page !== 'not-found');

const expectedUrls = publicPages.flatMap((page) =>
  locales.map((locale) => origin + getLocalizedUrl(pagePath(page), locale)),
);

const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

describe('sitemap.xml', () => {
  it('lists every public route in every locale, and nothing else', () => {
    expect([...locs].sort()).toEqual([...expectedUrls].sort());
    expect(locs).toHaveLength(publicPages.length * locales.length);
  });

  it('never lists the 404', () => {
    // Scoped to the URLs: the file's own comment explains the omission and says the word.
    expect(locs.filter((loc) => loc.includes('not-found'))).toEqual([]);
    expect(publicPages).not.toContain('not-found');
  });

  it('gives every entry the same hreflang alternates the page itself emits', () => {
    for (const page of publicPages) {
      const alternates = locales.map(
        (locale) =>
          `<xhtml:link rel="alternate" hreflang="${locale}" href="${origin + getLocalizedUrl(pagePath(page), locale)}" />`,
      );
      for (const alternate of alternates) {
        expect(sitemap, `missing alternate for ${page}`).toContain(alternate);
      }
      expect(sitemap, `missing x-default for ${page}`).toContain(
        `<xhtml:link rel="alternate" hreflang="x-default" href="${origin + getLocalizedUrl(pagePath(page), defaultLocale)}" />`,
      );
    }
  });

  it('declares the sitemap namespace', () => {
    expect(sitemap).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  });
});

describe('robots.txt', () => {
  it('allows every crawler and points at the sitemap', () => {
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain(`Sitemap: ${origin}/sitemap.xml`);
  });

  it('disallows nothing, because nothing on the site is private', () => {
    expect(robots).not.toContain('Disallow');
  });
});
