import { expect, test, type Page } from '@playwright/test';

/**
 * 404 page contract (content.png).
 *
 * The wildcard route renders the page at the address that was attempted, rather than
 * redirecting, so the visitor can see and correct the URL. The design reuses the project's
 * existing button (48) and chip (36) heights and the shared icon tile.
 */
const boxes = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) };
    }),
  );

const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('404 at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/no/such/page');
    await page.locator('app-not-found .notfound').waitFor();
  });

  test('renders at the attempted address under a single h1', async ({ page }) => {
    await expect(page).toHaveURL(/\/no\/such\/page$/);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveText('This page doesn’t exist — or it has moved.');
    await expect(page.locator('.notfound__eyebrow')).toHaveText(/error 404/i);
  });

  test('draws the broken-link diagram with a primary and an error tile', async ({ page }) => {
    const diagram = page.locator('.notfound__diagram');
    await expect(diagram).toHaveAttribute('role', 'img');
    await expect(diagram).toHaveAttribute('aria-label', /could not be resolved/i);

    await expect(page.locator('.notfound__node-text')).toHaveText(['/your-link', 'page not found']);

    const tones = await page
      .locator('.notfound__diagram app-icon-tile')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-tone')));
    expect(tones).toEqual(['primary', 'error']);

    const tiles = await boxes(page, '.notfound__diagram app-icon-tile');
    for (const tile of tiles) expect([tile.w, tile.h]).toEqual([32, 32]);

    // The failing side is dashed and carries the error colour.
    const missing = page.locator('.notfound__node--missing');
    await expect(missing).toHaveCSS('border-style', 'dashed');
    await expect(missing).toHaveCSS('border-top-color', 'rgb(220, 38, 38)');
  });

  test('reuses the project button and chip heights', async ({ page }) => {
    const actions = await boxes(page, '.notfound__actions a');
    expect(actions).toHaveLength(2);
    for (const action of actions) expect(action.h).toBe(48);

    const chips = await boxes(page, '.notfound__chip');
    expect(chips).toHaveLength(5);
    for (const chip of chips) expect(chip.h).toBe(36);

    await expect(page.locator('.notfound__chip')).toHaveText([
      'Solutions',
      'About Nexora',
      'Engagement models',
      'Partnerships',
      'Contact',
    ]);
  });

  test('the primary action returns to the homepage', async ({ page }) => {
    await page.locator('.notfound__actions a').first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('main h1')).toHaveText(
      'Engineering Digital Solutions That Move Business Forward.',
    );
  });

  test('the secondary action opens services', async ({ page }) => {
    await page.locator('.notfound__actions a').nth(1).click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('main h1')).toHaveText(
      'Fifteen services across the full software lifecycle.',
    );
  });

  test('a shortcut chip navigates to its page', async ({ page }) => {
    await page.locator('.notfound__chip').first().click();
    await expect(page).toHaveURL(/\/solutions$/);
    await expect(page.locator('main h1')).toHaveText('Start from the problem, not the technology.');
  });

  test('sets the 404 document title', async ({ page }) => {
    await expect(page).toHaveTitle('Page not found | Nexora');
  });
});

test.describe('404 at narrower widths', () => {
  for (const width of [390, 768, 1024]) {
    test(`stays within the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/no/such/page');
      await page.locator('app-not-found .notfound').waitFor();

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);
      await expect(page.locator('.notfound__chip')).toHaveCount(5);
    });
  }
});

test.describe('404 under a locale prefix', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('keeps the prefix on the URL and on every link', async ({ page }) => {
    await page.goto('/ru/no/such/page');
    await page.locator('app-not-found .notfound').waitFor();

    await expect(page).toHaveURL(/\/ru\/no\/such\/page$/);
    await expect(page.locator('main h1')).toHaveText(
      'Этой страницы не существует — или она была перемещена.',
    );

    const hrefs = await page
      .locator('app-not-found a')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(hrefs.every((href) => href === '/ru' || href?.startsWith('/ru/'))).toBe(true);
  });
});
