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

/*
 * One viewport per band the stylesheet actually declares, taken at the band's own minimum,
 * which is where its grid is tightest and so where it runs out of room first.
 *
 * `$breakpoints` in `styles/tokens/_layout.scss` is (compact: 0, medium: 600, expanded: 840,
 * large: 1200, extra-large: 1600). This list used to be 320/390/840, which swept `compact`
 * twice, caught `expanded` at its boundary, and never entered `medium`, `large` or
 * `extra-large` at all - three of the five bands had no regression check of any width.
 *
 * The bands are swept rather than device widths like 430 or 1024, because a band is what the
 * layout switches on: a width that shares a band with one already listed re-tests the same
 * grid, while a band with no width listed is a grid nothing asserts.
 *
 * `extra-large` matters even though there is more room, not less: the container stops growing
 * at `$container-max` (1280px), so past that point the margins carry the remaining width, and
 * an element that escapes the container shows up there rather than on a phone.
 */
const VIEWPORTS = [
  { label: 'small phone', width: 320, height: 568 },
  { label: 'phone', width: 390, height: 844 },
  { label: 'medium', width: 600, height: 900 },
  { label: 'expanded', width: 840, height: 900 },
  { label: 'large', width: 1200, height: 900 },
  { label: 'extra-large', width: 1600, height: 900 },
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
