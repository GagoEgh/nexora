import { expect, test } from '@playwright/test';

const PAGES = ['/', '/about', '/services', '/solutions', '/engagement-models', '/contact'];

test.describe('the document works before Angular boots', () => {
  test.use({ javaScriptEnabled: false });

  for (const path of PAGES) {
    test(`${path} renders its heading with scripting off`, async ({ page }) => {
      await page.goto(path);

      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).not.toBeEmpty();
    });
  }

  test('the header navigation is usable as plain links', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('app-header');
    const hrefs = await header
      .locator('a[href]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')));

    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.every((href) => href !== null && href !== '')).toBe(true);
  });
});

test.describe('the server answers the way the deployed site does', () => {
  test('an unknown URL answers 404 with the branded page', async ({ page }) => {
    const response = await page.goto('/no-such-page');

    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  for (const [prefix, lang] of [
    ['/hy', 'hy'],
    ['/ru', 'ru'],
  ] as const) {
    test(`an unknown URL under ${prefix} answers 404 in ${lang}`, async ({ page }) => {
      const response = await page.goto(`${prefix}/no-such-page`);

      expect(response?.status()).toBe(404);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
    });
  }

  test('the 404 document tells crawlers not to index it', async ({ page }) => {
    await page.goto('/no-such-page');

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('a real page does not carry a robots meta', async ({ page }) => {
    await page.goto('/about');

    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });
});

test.describe('hydration leaves the page where the visitor expects', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const path of ['/', '/about', '/services']) {
    test(`${path} opens at the top`, async ({ page }) => {
      await page.goto(path);

      expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(0);
    });
  }

  test('hydration does not report an error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    await page.goto('/solutions');
    await page.locator('.challenge-index__card').first().click();

    expect(errors).toEqual([]);
  });
});
