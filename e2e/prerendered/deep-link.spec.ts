import { expect, test, type Page } from '@playwright/test';

const restPosition = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => ({
    top: Math.round(el.getBoundingClientRect().top),
    expected: Math.round(parseFloat(getComputedStyle(el).scrollMarginBlockStart) || 0),
  }));

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

test.describe('a cold load of a deep link lands on its target', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('/solutions?challenge= scrolls to the panel', async ({ page }) => {
    await page.goto('/solutions?challenge=introduce-ai');

    await expect
      .poll(() => restPosition(page, '#challenge-introduce-ai'))
      .toEqual({ top: 0, expected: 0 });
    expect(await scrollY(page)).toBeGreaterThan(0);
  });

  test('/engagement-models?model= scrolls to the card', async ({ page }) => {
    await page.goto('/engagement-models?model=dedicated-team');

    await expect
      .poll(() => restPosition(page, '#model-dedicated-team'))
      .toEqual({ top: 96, expected: 96 });
    expect(await scrollY(page)).toBeGreaterThan(0);
  });

  test('a localized deep link scrolls just the same', async ({ page }) => {
    await page.goto('/ru/solutions?challenge=introduce-ai');

    await expect
      .poll(() => restPosition(page, '#challenge-introduce-ai'))
      .toEqual({ top: 0, expected: 0 });
    expect(await scrollY(page)).toBeGreaterThan(0);
  });

  test('an unknown value is ignored rather than scrolling somewhere arbitrary', async ({
    page,
  }) => {
    await page.goto('/solutions?challenge=not-a-challenge');

    expect(await scrollY(page)).toBe(0);
  });

  test('no query parameter means the page opens at the top', async ({ page }) => {
    await page.goto('/solutions');

    expect(await scrollY(page)).toBe(0);
  });
});
