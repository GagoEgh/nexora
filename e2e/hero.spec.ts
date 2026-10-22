import { expect, test, type Page } from '@playwright/test';

/**
 * Home hero contract (Hero.png at 1440, Bero.png at 390): full-bleed gradient, Nexora hero
 * typography tokens, Material buttons, trust list, decorative architecture illustration.
 */
const style = (page: Page, selector: string, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

const box = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });

const HEADLINE = 'Engineering Digital Solutions That Move Business Forward.';

test.describe('hero at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('full-bleed gradient from primary-container to background, two columns', async ({
    page,
  }) => {
    expect(await style(page, 'app-hero', 'background-image')).toMatch(
      /linear-gradient\((?:180deg, )?rgb\(238, 244, 255\), rgb\(250, 251, 253\)\)/, // Chromium drops the default angle
    );
    expect((await box(page, 'app-hero')).w).toBe(1440);
    // One surface: the hero starts at the top of the page behind a transparent, hairline-free header.
    expect((await box(page, 'app-hero')).y).toBe(0);
    expect(await style(page, 'app-header', 'background-color')).toBe('rgba(0, 0, 0, 0)');
    expect(await style(page, 'app-header', 'border-bottom-width')).toBe('0px');
    expect(await style(page, 'app-hero .hero', 'padding-top')).toBe(`${76 + 80}px`); // header height + 80
    expect(await style(page, 'app-hero .hero', 'grid-template-columns')).toMatch(
      /^\d+(\.\d+)?px \d+(\.\d+)?px$/,
    );
    expect((await box(page, 'app-hero .hero__copy')).x).toBe(80);
  });

  test('eyebrow, 64/72 headline, 18/30 lead, buttons and trust row', async ({ page }) => {
    await expect(page.locator('app-hero .hero__eyebrow-text--full')).toBeVisible();
    await expect(page.locator('app-hero .hero__eyebrow-text--short')).toBeHidden();
    expect(await style(page, 'app-hero .hero__eyebrow', 'color')).toBe('rgb(15, 85, 232)');
    expect(await style(page, 'app-hero .hero__eyebrow', 'text-transform')).toBe('uppercase');

    const h1 = page.locator('main h1');
    await expect(h1).toHaveText(HEADLINE);
    expect(await style(page, 'main h1', 'font-size')).toBe('64px');
    expect(await style(page, 'main h1', 'line-height')).toBe('72px');
    expect(await style(page, 'main h1', 'font-weight')).toBe('600');
    expect(await style(page, 'main h1', 'letter-spacing')).toBe('-1.28px'); // -0.02em at 64px
    expect(await style(page, 'main h1', 'color')).toBe('rgb(11, 19, 36)');

    expect(await style(page, 'app-hero .hero__lead', 'font-size')).toBe('18px');
    expect(await style(page, 'app-hero .hero__lead', 'line-height')).toBe('30px');
    expect(await style(page, 'app-hero .hero__lead', 'color')).toBe('rgb(71, 85, 105)');

    const primary = page.locator('app-hero .hero__actions a').first();
    const secondary = page.locator('app-hero .hero__actions a').nth(1);
    await expect(primary).toHaveAttribute('href', '/contact');
    await expect(secondary).toHaveAttribute('href', '/services');
    expect((await box(page, 'app-hero .hero__actions a')).h).toBe(48);
    expect(await style(page, 'app-hero .hero__actions a', 'background-color')).toBe(
      'rgb(15, 85, 232)',
    );
    await expect(primary.locator('mat-icon')).toBeVisible();
    expect(await style(page, 'app-hero .hero__actions a:nth-child(2)', 'border-top-color')).toBe(
      'rgb(203, 213, 225)',
    );

    const trust = page.locator('app-hero .hero__trust-item');
    await expect(trust).toHaveCount(3);
    expect(await style(page, 'app-hero .hero__trust', 'display')).toBe('flex');
    expect(await style(page, 'app-hero .hero__trust-icon', 'color')).toBe('rgb(15, 85, 232)');
    expect((await box(page, 'app-hero .hero__trust-icon')).w).toBe(16);
  });

  test('illustration: window, five node cards, bus links, pipeline, floating cards', async ({
    page,
  }) => {
    const art = page.locator('app-hero-illustration');
    await expect(art).toHaveAttribute('aria-hidden', 'true');
    expect(await style(page, 'app-hero-illustration .art__window', 'border-top-color')).toBe(
      'rgb(226, 232, 240)',
    );
    expect(await style(page, 'app-hero-illustration .art__window', 'border-top-left-radius')).toBe(
      '16px',
    );

    await expect(art.locator('.art__node')).toHaveCount(5);
    await expect(art.locator('.art__link')).toHaveCount(2);
    expect(await style(page, 'app-hero-illustration .art__node--dark', 'background-color')).toBe(
      'rgb(6, 11, 23)',
    );
    expect(await style(page, 'app-hero-illustration app-icon-tile', 'width')).toBe('32px');
    expect(await style(page, 'app-hero-illustration app-icon-tile', 'background-color')).toBe(
      'rgb(238, 244, 255)',
    );
    expect(
      await style(page, 'app-hero-illustration .art__node--dark app-icon-tile', 'background-color'),
    ).toBe('rgb(26, 37, 64)');
    await expect(art.locator('.art__node-meta').first()).toBeVisible();

    await expect(art.locator('.art__chip')).toHaveText(['build', 'test', 'deploy', 'monitor']);
    expect(await style(page, 'app-hero-illustration .art__chip', 'color')).toBe('rgb(4, 120, 87)');
    expect(await style(page, 'app-hero-illustration .art__chip', 'background-color')).toBe(
      'rgb(236, 253, 245)',
    );

    await expect(art.locator('.notes__workflow')).toBeVisible();
    await expect(art.locator('.notes__step--done')).toHaveCount(2);
    await expect(art.locator('.notes__request')).toBeVisible();
    expect(await style(page, 'app-hero-illustration .notes__request', 'background-color')).toBe(
      'rgb(6, 11, 23)',
    );
    expect(await style(page, 'app-hero-illustration .notes__method', 'color')).toBe(
      'rgb(134, 173, 255)',
    );
    expect(await style(page, 'app-hero-illustration .notes__status', 'color')).toBe(
      'rgb(110, 231, 183)',
    );
  });

  test('the calls to action navigate', async ({ page }) => {
    await page.locator('app-hero .hero__actions a').nth(1).click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('main h1')).toHaveText(
      'Fifteen services across the full software lifecycle.',
    );
  });
});

test.describe('hero at the mobile design width', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('single column: short eyebrow, 40/48 headline, 16/26 lead, stacked buttons and trust list', async ({
    page,
  }) => {
    await expect(page.locator('app-hero .hero__eyebrow-text--short')).toBeVisible();
    await expect(page.locator('app-hero .hero__eyebrow-text--full')).toBeHidden();
    expect(await style(page, 'main h1', 'font-size')).toBe('40px');
    expect(await style(page, 'main h1', 'line-height')).toBe('48px');
    expect(await style(page, 'app-hero .hero__lead', 'font-size')).toBe('16px');
    expect(await style(page, 'app-hero .hero__lead', 'line-height')).toBe('26px');

    const buttons = page.locator('app-hero .hero__actions a');
    expect((await box(page, 'app-hero .hero__actions a')).w).toBe(350);
    expect((await buttons.nth(1).boundingBox())?.width).toBe(350);
    expect(await style(page, 'app-hero .hero__trust', 'display')).toBe('grid');
    expect((await box(page, 'app-hero .hero__copy')).x).toBe(20);
  });

  test('illustration keeps only the window with short labels', async ({ page }) => {
    const art = page.locator('app-hero-illustration');
    await expect(art.locator('.art__node')).toHaveCount(5);
    await expect(art.locator('.art__node-label--short').last()).toHaveText('Knowledge');
    await expect(art.locator('.art__node-meta').first()).toBeHidden();
    await expect(art.locator('.art__pipeline')).toBeHidden();
    await expect(art.locator('.notes__workflow')).toBeHidden();
    await expect(art.locator('.notes__request')).toBeHidden();
    expect((await box(page, 'app-hero-illustration .art__window')).w).toBe(350);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
});
