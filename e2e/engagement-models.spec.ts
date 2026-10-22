import { expect, test, type Page } from '@playwright/test';

/**
 * Engagement models section contract (Models.png at 1440): the two-column section header with a
 * Material text link, then five equal-height cards on a 259.2px pitch, each with a 48px tile, a
 * title, copy and a bottom-anchored "best for" block whose divider aligns across the row.
 * Two columns at 840, one at 390.
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

const TITLES = [
  'Project-Based Development',
  'Dedicated Development Teams',
  'Long-Term Technical Partnership',
  'White-Label Development',
  'Maintenance & Technical Support',
];

const BEST_FOR = [
  'A defined product, feature or modernization.',
  'Extending your team with senior capacity.',
  'Products that keep evolving over years.',
  'Agencies delivering technical work to clients.',
  'Live systems that need steady care.',
];

test.describe('engagement models at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('app-engagement-models').scrollIntoViewIfNeeded();
    await expect(page.locator('app-engagement-models app-icon-tile svg')).toHaveCount(5);
  });

  test('follows how-we-work with the two-column header, copy tokens and the compare link', async ({
    page,
  }) => {
    await expect(page.locator('app-how-we-work + app-engagement-models')).toHaveCount(1);
    expect(await style(page, 'app-engagement-models', 'padding-top')).toBe('96px');
    expect(
      await style(
        page,
        'app-engagement-models .engagement-models__header',
        'grid-template-columns',
      ),
    ).toMatch(/^\d+(\.\d+)?px 440px$/);
    expect(
      await style(page, 'app-engagement-models .engagement-models__header', 'margin-bottom'),
    ).toBe('64px');

    await expect(page.locator('app-engagement-models .engagement-models__eyebrow')).toHaveText(
      'Engagement models',
    );
    expect(await style(page, 'app-engagement-models .engagement-models__eyebrow', 'color')).toBe(
      'rgb(15, 85, 232)',
    );
    const title = page.locator('app-engagement-models h2');
    await expect(title).toHaveCount(1);
    await expect(title).toHaveText('Collaboration that fits your situation.');
    expect(await style(page, 'app-engagement-models h2', 'font-size')).toBe('40px');
    expect(await style(page, 'app-engagement-models h2', 'line-height')).toBe('48px');
    expect(await style(page, 'app-engagement-models h2', 'font-weight')).toBe('600');

    const [intro] = await boxes(page, 'app-engagement-models .engagement-models__intro');
    expect(intro.x).toBe(920);
    expect(await style(page, 'app-engagement-models .engagement-models__text', 'font-size')).toBe(
      '16px',
    );
    expect(await style(page, 'app-engagement-models .engagement-models__text', 'line-height')).toBe(
      '26px',
    );
    expect(await style(page, 'app-engagement-models .engagement-models__text', 'color')).toBe(
      'rgb(71, 85, 105)',
    );

    const link = page.locator('app-engagement-models a.engagement-models__compare');
    await expect(link).toHaveAttribute('href', '/about');
    await expect(link).toHaveText('Compare engagement models');
    await expect(link).toHaveClass(/mat-mdc-button/);
    const [linkBox] = await boxes(page, 'app-engagement-models a.engagement-models__compare');
    expect(linkBox.h).toBe(48);
    expect(linkBox.x).toBe(920);
    // The header bottom-aligns, so the link closes the column level with the heading.
    const [heading] = await boxes(page, 'app-engagement-models .engagement-models__heading');
    expect(Math.abs(heading.y + heading.h - (linkBox.y + linkBox.h))).toBeLessThanOrEqual(2);
    const [icon] = await boxes(page, 'app-engagement-models a.engagement-models__compare mat-icon');
    expect(icon.w).toBe(18);
  });

  test('five cards on a 259px pitch with the card chrome, tiles and typography', async ({
    page,
  }) => {
    await expect(page.locator('app-engagement-models ul.engagement-models__list')).toHaveCount(1);
    const cards = await boxes(page, 'app-engagement-models .engagement-models__card');
    expect(cards.map((c) => [c.x, c.w])).toEqual([
      [80, 243],
      [339, 243],
      [598, 243],
      [858, 243],
      [1117, 243],
    ]);
    // One row: every card starts and ends at the same height.
    expect(new Set(cards.map((c) => c.y)).size).toBe(1);
    expect(new Set(cards.map((c) => c.h)).size).toBe(1);

    expect(
      await style(page, 'app-engagement-models .engagement-models__card', 'border-top-color'),
    ).toBe('rgb(226, 232, 240)');
    expect(
      await style(page, 'app-engagement-models .engagement-models__card', 'border-top-left-radius'),
    ).toBe('16px');
    expect(await style(page, 'app-engagement-models .engagement-models__card', 'padding-top')).toBe(
      '24px',
    );
    expect(
      await style(page, 'app-engagement-models .engagement-models__card', 'background-color'),
    ).toBe('rgb(255, 255, 255)');

    const tiles = await boxes(page, 'app-engagement-models .engagement-models__card app-icon-tile');
    expect(tiles).toHaveLength(5);
    expect(tiles.every((t) => t.w === 48 && t.h === 48)).toBe(true);
    expect(tiles.map((t, i) => t.x - cards[i].x)).toEqual(Array(5).fill(25));
    expect(await style(page, 'app-engagement-models app-icon-tile', 'background-color')).toBe(
      'rgb(238, 244, 255)',
    );

    await expect(page.locator('app-engagement-models .engagement-models__card-title')).toHaveText(
      TITLES,
    );
    const [cardTitle] = await boxes(page, 'app-engagement-models .engagement-models__card-title');
    expect(cardTitle.y - (tiles[0].y + tiles[0].h)).toBe(16);
    expect(
      await style(page, 'app-engagement-models .engagement-models__card-title', 'font-size'),
    ).toBe('18px');
    expect(
      await style(page, 'app-engagement-models .engagement-models__card-title', 'line-height'),
    ).toBe('26px');
    expect(
      await style(page, 'app-engagement-models .engagement-models__card-title', 'font-weight'),
    ).toBe('600');
    expect(
      await style(page, 'app-engagement-models .engagement-models__description', 'font-size'),
    ).toBe('14px');
    expect(
      await style(page, 'app-engagement-models .engagement-models__description', 'line-height'),
    ).toBe('22px');
    expect(
      await style(page, 'app-engagement-models .engagement-models__description', 'color'),
    ).toBe('rgb(71, 85, 105)');
  });

  test('the "best for" block is bottom-anchored, so its divider aligns across the row', async ({
    page,
  }) => {
    const cards = await boxes(page, 'app-engagement-models .engagement-models__card');
    const footers = await boxes(page, 'app-engagement-models .engagement-models__footer');
    expect(footers).toHaveLength(5);
    // Card 3 carries one line less copy, yet every divider sits on the same line.
    expect(new Set(footers.map((f) => f.y)).size).toBe(1);
    expect(footers.map((f, i) => cards[i].y + cards[i].h - (f.y + f.h))).toEqual(Array(5).fill(25));
    expect(
      await style(page, 'app-engagement-models .engagement-models__footer', 'border-top-color'),
    ).toBe('rgb(226, 232, 240)');
    expect(
      await style(page, 'app-engagement-models .engagement-models__footer', 'padding-top'),
    ).toBe('16px');

    await expect(page.locator('app-engagement-models .engagement-models__label')).toHaveText(
      Array(5).fill('Best for'),
    );
    expect(
      await style(page, 'app-engagement-models .engagement-models__label', 'text-transform'),
    ).toBe('uppercase');
    expect(await style(page, 'app-engagement-models .engagement-models__label', 'font-size')).toBe(
      '13px',
    );
    expect(await style(page, 'app-engagement-models .engagement-models__label', 'color')).toBe(
      'rgb(100, 116, 139)',
    );

    await expect(page.locator('app-engagement-models .engagement-models__value')).toHaveText(
      BEST_FOR,
    );
    expect(await style(page, 'app-engagement-models .engagement-models__value', 'font-size')).toBe(
      '14px',
    );
    expect(await style(page, 'app-engagement-models .engagement-models__value', 'color')).toBe(
      'rgb(11, 19, 36)',
    );
  });

  test('the cards are static and the only link navigates to the about page', async ({ page }) => {
    await expect(page.locator('app-engagement-models a')).toHaveCount(1);
    await expect(page.locator('app-engagement-models button')).toHaveCount(0);
    await expect(
      page.locator(
        'app-engagement-models .engagement-models__card[role], ' +
          'app-engagement-models .engagement-models__card[tabindex]',
      ),
    ).toHaveCount(0);

    await page.locator('app-engagement-models a.engagement-models__compare').click();
    await expect(page).toHaveURL(/\/about$/);
  });

  test('renders the localized copy and link under a locale prefix', async ({ page }) => {
    await page.goto('/ru');
    await page.locator('app-engagement-models').scrollIntoViewIfNeeded();
    await expect(page.locator('app-engagement-models h2')).toHaveText(
      'Сотрудничество, которое подходит вашей ситуации.',
    );
    await expect(
      page.locator('app-engagement-models .engagement-models__card-title').first(),
    ).toHaveText('Проектная разработка');
    await expect(
      page.locator('app-engagement-models .engagement-models__label').first(),
    ).toHaveText('Лучше всего для');
    await expect(
      page.locator('app-engagement-models a.engagement-models__compare'),
    ).toHaveAttribute('href', '/ru/about');
  });
});

test.describe('engagement models at narrower widths', () => {
  test('two columns at 840px with equal heights in each row', async ({ page }) => {
    await page.setViewportSize({ width: 840, height: 900 });
    await page.goto('/');
    await expect(page.locator('app-engagement-models .engagement-models__card')).toHaveCount(5);
    const cards = await boxes(page, 'app-engagement-models .engagement-models__card');
    expect(new Set(cards.map((c) => c.x)).size).toBe(2);
    expect(cards[0].x).toBe(40);
    expect(cards[0].y).toBe(cards[1].y);
    expect(cards[0].h).toBe(cards[1].h);
    expect(cards[2].y).toBe(cards[3].y);
    expect(cards[2].h).toBe(cards[3].h);
    expect(cards[2].y - (cards[0].y + cards[0].h)).toBe(16);
    const footers = await boxes(page, 'app-engagement-models .engagement-models__footer');
    expect(footers[0].y).toBe(footers[1].y);
    expect(footers[2].y).toBe(footers[3].y);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });

  test('one column at 390px without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('app-engagement-models .engagement-models__card')).toHaveCount(5);
    const cards = await boxes(page, 'app-engagement-models .engagement-models__card');
    expect(cards.every((c) => c.x === 20 && c.w === 350)).toBe(true);
    expect(cards[1].y - (cards[0].y + cards[0].h)).toBe(16);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
});
