import { expect, test, type Page } from '@playwright/test';
import { expectTypeFromRole } from './support/tokens';

/**
 * Expertise section contract (Expertise.png at 1440): header block in two columns, six cards
 * in three columns with 24px gutters, Nexora tokens for chrome and typography; one column at 390.
 */
const style = (page: Page, selector: string, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

const boxes = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.left),
        y: Math.round(r.top),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    }),
  );

test.describe('expertise at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('app-expertise').scrollIntoViewIfNeeded();
  });

  test('follows the hero and lays the header out in two columns with the tokens', async ({
    page,
  }) => {
    await expect(page.locator('app-hero + app-expertise')).toHaveCount(1);
    expect(await style(page, 'app-expertise', 'padding-top')).toBe('96px');
    expect(await style(page, 'app-expertise .expertise__header', 'grid-template-columns')).toMatch(
      /^\d+(\.\d+)?px 440px$/,
    );
    expect(await style(page, 'app-expertise .expertise__header', 'margin-bottom')).toBe('64px');

    await expect(page.locator('app-expertise .expertise__eyebrow')).toHaveText('What we do');
    expect(await style(page, 'app-expertise .expertise__eyebrow', 'color')).toBe(
      'rgb(15, 85, 232)',
    );
    const title = page.locator('app-expertise h2');
    await expect(title).toHaveText('End-to-end engineering, under one roof.');
    await expectTypeFromRole(page, 'app-expertise h2', '--nx-sys-display-section');
    expect(await style(page, 'app-expertise h2', 'font-weight')).toBe('600');

    await expectTypeFromRole(page, 'app-expertise .expertise__text', '--nx-sys-body-copy');
    expect(await style(page, 'app-expertise .expertise__text', 'color')).toBe('rgb(71, 85, 105)');
    const [intro] = await boxes(page, 'app-expertise .expertise__intro');
    expect(intro.x).toBe(920);

    const all = page.locator('app-expertise a.expertise__all');
    await expect(all).toHaveAttribute('href', '/services');
    await expect(all).toHaveClass(/mat-mdc-button/);
    const [allBox] = await boxes(page, 'app-expertise a.expertise__all');
    expect(allBox.h).toBe(48);
  });

  test('six cards in three columns with the card chrome, tiles, typography and links', async ({
    page,
  }) => {
    const cards = await boxes(page, 'app-expertise .expertise__card');
    expect(cards).toHaveLength(6);
    // Three equal columns of (1280 − 2 × 24) / 3 = 410.67px: x 80, 514.67, 949.33.
    for (const [i, expected] of [80, 515, 949, 80, 515, 949].entries()) {
      expect(Math.abs(cards[i].x - expected)).toBeLessThanOrEqual(1);
    }
    expect(cards.every((c) => c.w === 411)).toBe(true);
    expect(cards[3].y - cards[0].y - cards[0].h).toBe(24);
    expect(cards[0].h).toBe(cards[1].h);

    expect(await style(page, 'app-expertise .expertise__card', 'border-top-color')).toBe(
      'rgb(226, 232, 240)',
    );
    expect(await style(page, 'app-expertise .expertise__card', 'border-top-left-radius')).toBe(
      '16px',
    );
    expect(await style(page, 'app-expertise .expertise__card', 'padding-top')).toBe('32px');
    expect(await style(page, 'app-expertise .expertise__card', 'background-color')).toBe(
      'rgb(255, 255, 255)',
    );

    const [tile] = await boxes(page, 'app-expertise .expertise__card app-icon-tile');
    expect(tile.w).toBe(48);
    expect(await style(page, 'app-expertise app-icon-tile', 'background-color')).toBe(
      'rgb(238, 244, 255)',
    );
    expect(await style(page, 'app-expertise .expertise__card-title', 'font-size')).toBe('24px');
    expect(await style(page, 'app-expertise .expertise__card-title', 'font-weight')).toBe('600');
    await expectTypeFromRole(page, 'app-expertise .expertise__card-text', '--nx-sys-body-copy');
    await expectTypeFromRole(page, 'app-expertise a.expertise__link', '--mat-sys-label-large');
    expect(await style(page, 'app-expertise a.expertise__link', 'font-weight')).toBe('600');
    expect(await style(page, 'app-expertise a.expertise__link', 'color')).toBe('rgb(15, 85, 232)');

    await expect(page.locator('app-expertise .expertise__card h3')).toHaveText([
      'Software & Web Development',
      'Mobile Applications',
      'AI Engineering & Automation',
      'UI/UX Design',
      'Cloud Infrastructure & DevOps',
      'Dedicated Engineering Teams',
    ]);
  });

  /**
   * The card links used to land on the bare `/services`, identical to the "view all" button
   * beside them. Each one now opens the filter that actually holds that work, which is the
   * same `?category=` contract the footer uses.
   */
  test('every card opens its own services filter', async ({ page }) => {
    const expected = [
      ['Software & Web Development', 'software-engineering', 6],
      ['Mobile Applications', 'software-engineering', 6],
      ['AI Engineering & Automation', 'artificial-intelligence', 3],
      ['UI/UX Design', 'design-product', 1],
      ['Cloud Infrastructure & DevOps', 'infrastructure-operations', 3],
      ['Dedicated Engineering Teams', 'engineering-partnerships', 2],
    ] as const;

    for (const [index, [title, category, count]] of expected.entries()) {
      await page.goto('/');
      const card = page.locator('app-expertise .expertise__card').nth(index);
      await expect(card.locator('h3')).toHaveText(title);

      await card.locator('a.expertise__link').click();
      await expect(page).toHaveURL(
        (url) => url.pathname === '/services' && url.searchParams.get('category') === category,
      );
      // The page really filtered, rather than just carrying the query.
      await expect(page.locator('app-service-card')).toHaveCount(count);
    }
  });

  test('the view-all button opens the unfiltered catalogue', async ({ page }) => {
    await page.locator('app-expertise a.expertise__all').click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('app-service-card')).toHaveCount(15);
  });

  test('keeps the locale prefix and the filter together', async ({ page }) => {
    await page.goto('/ru');
    await page.locator('app-expertise .expertise__card').nth(2).locator('a').click();
    await expect(page).toHaveURL(/\/ru\/services\?category=artificial-intelligence$/);
    await expect(page.locator('app-service-card')).toHaveCount(3);
  });
});

test.describe('expertise at narrower widths', () => {
  test('one column at 390px without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('app-expertise .expertise__card')).toHaveCount(6);
    const cards = await boxes(page, 'app-expertise .expertise__card');
    expect(cards.map((c) => c.x)).toEqual(Array(6).fill(20));
    expect(cards.every((c) => c.w === 350)).toBe(true);
    expect(await style(page, 'app-expertise .expertise__header', 'grid-template-columns')).toMatch(
      /^\d+(\.\d+)?px$/,
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });

  test('two columns at 840px', async ({ page }) => {
    await page.setViewportSize({ width: 840, height: 900 });
    await page.goto('/');
    await expect(page.locator('app-expertise .expertise__card')).toHaveCount(6);
    const cards = await boxes(page, 'app-expertise .expertise__card');
    expect(new Set(cards.map((c) => c.x)).size).toBe(2);
    expect(cards[0].x).toBe(40);
  });
});
