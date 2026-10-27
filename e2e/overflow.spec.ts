import { expect, test } from '@playwright/test';

/**
 * The home page must never scroll sideways, in any locale.
 *
 * This exists because it did. Armenian compounds are long enough to push a grid track past the
 * viewport where English and Russian do not, and the page overflowed by 87px at 390px in `hy`
 * only - invisible to every existing check, because the narrow-viewport assertions all ran on
 * the default locale. Asserting the locales together is the whole point of this spec.
 *
 * On failure the offending elements are named, so the report points at the cause rather than
 * just stating that a number is too large.
 */
const LOCALES = [
  ['en', '/'],
  ['hy', '/hy'],
  ['ru', '/ru'],
] as const;

const VIEWPORTS = [
  { label: 'phone', width: 390, height: 844 },
  { label: 'tablet', width: 840, height: 900 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`home page at ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const [locale, path] of LOCALES) {
      test(`does not overflow horizontally in ${locale}`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('app-home')).toBeVisible();

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
