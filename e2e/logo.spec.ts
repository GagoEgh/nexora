import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveColorToken } from './support/contrast';

const BRAND_DIR = join(__dirname, '..', 'public', 'brand');

test.describe('brand assets', () => {
  for (const file of ['mark.svg', 'lockup.svg']) {
    test(`${file} is served unchanged`, async ({ request }) => {
      const response = await request.get(`/brand/${file}`);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('image/svg+xml');
      expect(await response.text()).toBe(readFileSync(join(BRAND_DIR, file), 'utf8'));
    });
  }

  test('the favicon is the brand mark', async ({ page, request }) => {
    await page.goto('/');
    const icons = page.locator('link[rel="icon"]');
    await expect(icons).toHaveCount(1);
    await expect(icons).toHaveAttribute('href', 'brand/mark.svg');
    await expect(icons).toHaveAttribute('type', 'image/svg+xml');

    const response = await request.get('/brand/mark.svg');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/svg+xml');
  });
});

test.describe('logo component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the lockup as one accessible image', async ({ page }) => {
    const logo = page.locator('app-header').getByRole('img', { name: 'Nexora' });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('data-variant', 'lockup');

    const mark = logo.locator('img.app-logo__mark');
    await expect(mark).toHaveJSProperty('complete', true);
    expect(await mark.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

    const box = await logo.boundingBox();
    expect(box?.height).toBeCloseTo(32, 0);
    expect(box?.width).toBeGreaterThanOrEqual(186);
    expect(box?.width).toBeLessThanOrEqual(190);
  });

  test('wordmark follows the theme: on-surface on light, inverse-on-surface on dark', async ({
    page,
  }) => {
    const logo = page.locator('app-header').getByRole('img', { name: 'Nexora' });
    const wordmarkFill = () =>
      logo.locator('svg.app-logo__wordmark path').first().evaluate((p) => getComputedStyle(p).fill);
    const onSurface = await resolveColorToken(page, '--mat-sys-on-surface');
    const inverseOnSurface = await resolveColorToken(page, '--mat-sys-inverse-on-surface');

    // Default (auto) on the light surface: inherits the header brand link colour = on-surface = source #0B1324.
    expect(await wordmarkFill()).toBe('rgb(11, 19, 36)');
    expect(onSurface).toEqual({ r: 11 / 255, g: 19 / 255, b: 36 / 255, a: 1 });

    // Auto inside an inverse surface: inherits inverse-on-surface = source #F6F8FB.
    // The shell renders two logos (header, footer); the contract is checked on the header one.
    await page.evaluate(() => {
      const brand = document.querySelector<HTMLElement>('app-header .header__brand');
      if (brand) brand.style.color = 'var(--mat-sys-inverse-on-surface)';
    });
    expect(await wordmarkFill()).toBe('rgb(246, 248, 251)');
    expect(inverseOnSurface).toEqual({ r: 246 / 255, g: 248 / 255, b: 251 / 255, a: 1 });

    // Explicit tones override the inherited colour.
    await page.evaluate(() => {
      document.body.style.color = '';
    });
    await logo.evaluate((el) => el.setAttribute('data-tone', 'dark'));
    expect(await wordmarkFill()).toBe('rgb(246, 248, 251)');
    await logo.evaluate((el) => el.setAttribute('data-tone', 'light'));
    expect(await wordmarkFill()).toBe('rgb(11, 19, 36)');
  });
});
