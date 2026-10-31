import { expect, test, type Page } from '@playwright/test';
import { px, typeRole } from './support/tokens';

/**
 * The type scale itself, asserted as relationships rather than as a list of pixel values.
 *
 * Every size in the project comes from a `--nx-sys-*` role in `src/styles/tokens/_typography.scss`
 * - no component declares type of its own, which is what makes a scale change a one-file edit.
 * What must never change silently is the ORDER of those roles: if a heading role ever drops
 * below the one beneath it, the page loses its hierarchy no matter how good each size looks on
 * its own. Pinning the literals instead would fail on every deliberate change and say nothing
 * about whether the change was sane.
 */
const DESCENDING = [
  'display-hero',
  'display-page',
  'display-section',
  'display-feature',
  'display-band',
  'title-card',
  'title-step',
  'body-copy',
] as const;

const sizeOf = async (page: Page, role: string) => px((await typeRole(page, role)).size);

test.describe('the type scale', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('orders every display and body role from largest to smallest', async ({ page }) => {
    const sizes = await Promise.all(DESCENDING.map((role) => sizeOf(page, role)));

    for (let i = 1; i < sizes.length; i += 1) {
      expect(
        sizes[i],
        `${DESCENDING[i]} (${sizes[i]}px) must stay smaller than ${DESCENDING[i - 1]} (${sizes[i - 1]}px)`,
      ).toBeLessThan(sizes[i - 1]);
    }
  });

  test('gives every role a line height at least as tall as its size', async ({ page }) => {
    // A line height below the font size clips descenders and is always a mistake.
    for (const role of [...DESCENDING, 'body-lead']) {
      const { size, lineHeight } = await typeRole(page, role);
      expect(px(lineHeight), `${role} line-height`).toBeGreaterThanOrEqual(px(size));
    }
  });

  test('keeps the lead paragraph between body copy and a section heading', async ({ page }) => {
    const lead = await sizeOf(page, 'body-lead');
    expect(lead).toBeGreaterThanOrEqual(await sizeOf(page, 'body-copy'));
    expect(lead).toBeLessThan(await sizeOf(page, 'display-section'));
  });

  test('shrinks the hero and page titles on a narrow viewport', async ({ page }) => {
    // `display-hero`, `display-page` and `body-lead` are the only responsive roles: below the
    // `large` breakpoint they fall back to the compact pair, so a phone never renders a 56px h1.
    const wide = await sizeOf(page, 'display-hero');

    await page.setViewportSize({ width: 390, height: 844 });
    const narrow = await sizeOf(page, 'display-hero');

    expect(narrow).toBeLessThan(wide);
    expect(narrow).toBe(await sizeOf(page, 'display-section'));
  });
});
