import { expect, test, type Page } from '@playwright/test';

/**
 * "What we build" section contract (Build.png at 1440): a surface-container-low band, the
 * two-column header, nine static cards in three columns with an illustration panel each, and the
 * muted footnote; two columns at the medium width and one at the compact width.
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

const KINDS = [
  'saas',
  'crm-erp',
  'web',
  'mobile',
  'ai',
  'automation',
  'portal',
  'internal-tools',
  'api',
];

test.describe('what-we-build at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('app-what-we-build').scrollIntoViewIfNeeded();
    await expect(page.locator('app-what-we-build .what-we-build__card')).toHaveCount(9);
  });

  test('follows why on a tinted band with the two-column header and the copy tokens', async ({
    page,
  }) => {
    await expect(page.locator('app-why + app-what-we-build')).toHaveCount(1);
    expect(await style(page, 'app-what-we-build', 'padding-top')).toBe('96px');
    expect(await style(page, 'app-what-we-build', 'background-color')).toBe('rgb(246, 248, 251)');
    expect(
      await style(page, 'app-what-we-build .what-we-build__header', 'grid-template-columns'),
    ).toMatch(/^\d+(\.\d+)?px 440px$/);
    expect(await style(page, 'app-what-we-build .what-we-build__header', 'margin-bottom')).toBe(
      '64px',
    );

    await expect(page.locator('app-what-we-build .what-we-build__eyebrow')).toHaveText(
      'What we build',
    );
    expect(await style(page, 'app-what-we-build .what-we-build__eyebrow', 'color')).toBe(
      'rgb(15, 85, 232)',
    );
    await expect(page.locator('app-what-we-build h2')).toHaveText(
      'Systems shaped around how your business runs.',
    );
    expect(await style(page, 'app-what-we-build h2', 'font-size')).toBe('40px');
    expect(await style(page, 'app-what-we-build h2', 'line-height')).toBe('48px');
    expect(await style(page, 'app-what-we-build h2', 'font-weight')).toBe('600');

    expect(await style(page, 'app-what-we-build .what-we-build__intro', 'font-size')).toBe('16px');
    expect(await style(page, 'app-what-we-build .what-we-build__intro', 'line-height')).toBe(
      '26px',
    );
    expect(await style(page, 'app-what-we-build .what-we-build__intro', 'color')).toBe(
      'rgb(71, 85, 105)',
    );
    const [heading] = await boxes(page, 'app-what-we-build .what-we-build__heading');
    const [intro] = await boxes(page, 'app-what-we-build .what-we-build__intro');
    expect(intro.x).toBe(920);
    // The intro sits on the heading's baseline side: both blocks end together.
    expect(Math.abs(heading.y + heading.h - (intro.y + intro.h))).toBeLessThanOrEqual(2);
  });

  test('nine cards in three columns with the card chrome and the illustration panel', async ({
    page,
  }) => {
    const cards = await boxes(page, 'app-what-we-build .what-we-build__card');
    expect(cards).toHaveLength(9);
    // Three equal columns of (1280 − 2 × 24) / 3 = 410.67px: x 80, 514.67, 949.33.
    for (const [i, expected] of [80, 515, 949, 80, 515, 949, 80, 515, 949].entries()) {
      expect(Math.abs(cards[i].x - expected)).toBeLessThanOrEqual(1);
      expect(Math.abs(cards[i].w - 411)).toBeLessThanOrEqual(1);
    }
    expect(cards[1].y).toBe(cards[0].y);
    expect(cards[3].y - (cards[0].y + cards[0].h)).toBe(24);
    expect(cards.slice(0, 3).every((c) => c.h === cards[0].h)).toBe(true);

    expect(await style(page, 'app-what-we-build .what-we-build__card', 'background-color')).toBe(
      'rgb(255, 255, 255)',
    );
    expect(await style(page, 'app-what-we-build .what-we-build__card', 'border-top-color')).toBe(
      'rgb(226, 232, 240)',
    );
    expect(
      await style(page, 'app-what-we-build .what-we-build__card', 'border-top-left-radius'),
    ).toBe('16px');
    expect(await style(page, 'app-what-we-build .what-we-build__card', 'padding-top')).toBe('20px');

    const [panel] = await boxes(page, 'app-what-we-build app-what-we-build-illustration');
    expect(panel.x - cards[0].x).toBe(21);
    expect(panel.y - cards[0].y).toBe(21);
    expect(Math.abs(panel.w - (cards[0].w - 42))).toBeLessThanOrEqual(1);
    expect(Math.abs(panel.h - (panel.w * 168) / 368)).toBeLessThanOrEqual(1);
    expect(
      await style(page, 'app-what-we-build app-what-we-build-illustration', 'background-color'),
    ).toBe('rgb(250, 251, 253)');
    expect(
      await style(
        page,
        'app-what-we-build app-what-we-build-illustration',
        'border-top-left-radius',
      ),
    ).toBe('12px');
  });

  test('card titles, descriptions and the footnote use the Nexora roles', async ({ page }) => {
    const [card] = await boxes(page, 'app-what-we-build .what-we-build__card');
    const [title] = await boxes(page, 'app-what-we-build .what-we-build__card-title');
    expect(title.x - card.x).toBe(29);
    expect(await style(page, 'app-what-we-build .what-we-build__card-title', 'font-size')).toBe(
      '20px',
    );
    expect(await style(page, 'app-what-we-build .what-we-build__card-title', 'line-height')).toBe(
      '28px',
    );
    expect(await style(page, 'app-what-we-build .what-we-build__card-title', 'font-weight')).toBe(
      '600',
    );
    expect(await style(page, 'app-what-we-build .what-we-build__card-title', 'color')).toBe(
      'rgb(11, 19, 36)',
    );
    expect(await style(page, 'app-what-we-build .what-we-build__card-desc', 'font-size')).toBe(
      '14px',
    );
    expect(await style(page, 'app-what-we-build .what-we-build__card-desc', 'line-height')).toBe(
      '22px',
    );
    expect(await style(page, 'app-what-we-build .what-we-build__card-desc', 'color')).toBe(
      'rgb(71, 85, 105)',
    );

    await expect(page.locator('app-what-we-build .what-we-build__card h3')).toHaveText([
      'SaaS Platforms',
      'CRM & ERP Systems',
      'Web Applications',
      'Mobile Applications',
      'AI Assistants & Agents',
      'Business Automation Platforms',
      'B2B Portals',
      'Internal Business Tools',
      'API-Connected Systems',
    ]);
    await expect(
      page.locator(
        'app-what-we-build .what-we-build__card a, app-what-we-build .what-we-build__card button',
      ),
    ).toHaveCount(0);

    const note = page.locator('app-what-we-build .what-we-build__note');
    await expect(note).toHaveText(
      'Illustrations are conceptual and do not represent specific client projects.',
    );
    expect(await style(page, 'app-what-we-build .what-we-build__note', 'font-size')).toBe('14px');
    expect(await style(page, 'app-what-we-build .what-we-build__note', 'color')).toBe(
      'rgb(100, 116, 139)',
    );
    expect(await style(page, 'app-what-we-build .what-we-build__note', 'margin-top')).toBe('48px');
  });

  test('illustrations are decorative inline SVGs coloured from the theme tokens', async ({
    page,
  }) => {
    const art = page.locator('app-what-we-build app-what-we-build-illustration');
    expect(await art.evaluateAll((els) => els.map((el) => el.getAttribute('data-kind')))).toEqual(
      KINDS,
    );
    expect(await art.evaluateAll((els) => els.map((el) => el.getAttribute('aria-hidden')))).toEqual(
      Array(9).fill('true'),
    );
    await expect(page.locator('app-what-we-build app-what-we-build-illustration svg')).toHaveCount(
      9,
    );
    await expect(
      page.locator(
        'app-what-we-build app-what-we-build-illustration img, app-what-we-build app-what-we-build-illustration text',
      ),
    ).toHaveCount(0);

    expect(await style(page, 'app-what-we-build [data-kind="saas"] .i-primary', 'fill')).toBe(
      'rgb(15, 85, 232)',
    );
    expect(await style(page, 'app-what-we-build [data-kind="mobile"] .i-inverse', 'fill')).toBe(
      'rgb(6, 11, 23)',
    );
    expect(
      await style(page, 'app-what-we-build [data-kind="internal-tools"] .i-success', 'fill'),
    ).toBe('rgb(4, 120, 87)');
    expect(await style(page, 'app-what-we-build [data-kind="api"] .i-link', 'stroke')).toBe(
      'rgb(15, 85, 232)',
    );
  });
});

test.describe('what-we-build at the medium width', () => {
  test.use({ viewport: { width: 700, height: 900 } });

  test('lays the cards out in two columns and stacks the header', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-what-we-build .what-we-build__card')).toHaveCount(9);
    const cards = await boxes(page, 'app-what-we-build .what-we-build__card');
    expect(cards[1].y).toBe(cards[0].y);
    expect(cards[2].y).toBeGreaterThan(cards[0].y + cards[0].h);
    const [heading] = await boxes(page, 'app-what-we-build .what-we-build__heading');
    const [intro] = await boxes(page, 'app-what-we-build .what-we-build__intro');
    expect(intro.y).toBeGreaterThanOrEqual(heading.y + heading.h);
  });
});

test.describe('what-we-build at the mobile width', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('stacks into one column with the illustration scaling to the card', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-what-we-build .what-we-build__card')).toHaveCount(9);
    const cards = await boxes(page, 'app-what-we-build .what-we-build__card');
    expect(cards.every((c) => c.x === 20 && c.w === 350)).toBe(true);
    expect(cards[1].y).toBeGreaterThan(cards[0].y + cards[0].h);
    const [panel] = await boxes(page, 'app-what-we-build app-what-we-build-illustration');
    expect(panel.w).toBe(308);
    expect(Math.abs(panel.h - (308 * 168) / 368)).toBeLessThanOrEqual(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
});
