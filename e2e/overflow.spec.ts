import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

/**
 * No page may scroll sideways, in any locale, at any supported width.
 *
 * This exists because the home page did. Armenian compounds are long enough to push a grid
 * track past the viewport where English and Russian do not, and the page overflowed by 87px at
 * 390px in `hy` only - invisible to every existing check, because the narrow-viewport
 * assertions all ran on the default locale. Asserting the locales together is the whole point.
 *
 * It covers every page rather than the home page alone for the same reason it covers every
 * locale: a page that is never asserted is a page that is never checked, and `hy` overflow is
 * a property of the copy, so it can appear on any band the home page does not happen to use.
 *
 * 320px is the narrowest viewport the site claims to support, and it is where the `hy` grid
 * runs out of room first: the 390px and 840px cases passed while 320px overflowed by 20px.
 *
 * On failure the offending elements are named, so the report points at the cause rather than
 * just stating that a number is too large.
 */

/*
 * The pages come from the sitemap rather than a list kept here, so adding a route cannot
 * quietly leave it unchecked: `src/app/core/seo/sitemap.spec.ts` already pins the sitemap to
 * `DOCUMENT_META_PAGES`, and `src/app/core/seo/route-meta.spec.ts` pins that to the route
 * table. `not-found` is absent from the sitemap by design and is asserted separately below.
 */
const sitemapPaths = (): string[] => {
  const xml = readFileSync('public/sitemap.xml', 'utf8');
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname,
  );
  if (paths.length === 0) {
    throw new Error('public/sitemap.xml yielded no <loc>: the overflow sweep would be vacuous');
  }
  return paths;
};

const PATHS = [...sitemapPaths(), '/no-such-page', '/hy/no-such-page', '/ru/no-such-page'];

const VIEWPORTS = [
  { label: 'small phone', width: 320, height: 568 },
  { label: 'phone', width: 390, height: 844 },
  { label: 'tablet', width: 840, height: 900 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.label} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const path of PATHS) {
      test(`${path} does not overflow horizontally`, async ({ page }) => {
        await page.goto(path);
        // The page, not just the shell: a layout measured before the route renders proves
        // nothing about the route.
        await expect(page.locator('main h1')).toBeVisible();

        const report = await page.evaluate(() => {
          const doc = document.documentElement;
          const culprits: string[] = [];
          for (const el of Array.from(document.querySelectorAll('body *'))) {
            const rect = el.getBoundingClientRect();
            if (rect.width > doc.clientWidth + 0.5 || rect.right > doc.clientWidth + 0.5) {
              const name =
                typeof el.className === 'string' && el.className.trim()
                  ? `${el.tagName.toLowerCase()}.${el.className.trim().split(/\s+/)[0]}`
                  : el.tagName.toLowerCase();
              culprits.push(`${name}(w=${Math.round(rect.width)})`);
            }
          }
          return { overflow: doc.scrollWidth - doc.clientWidth, culprits: culprits.slice(0, 5) };
        });

        expect(report.overflow, `widest elements: ${report.culprits.join(', ') || 'none'}`).toBe(0);
      });
    }
  });
}
