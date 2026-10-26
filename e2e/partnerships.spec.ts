import { expect, test, type Page } from '@playwright/test';

/**
 * Partnerships page contract.
 *
 * hero.png fixes the opening band at 1440: the shared page intro with a 520px aside holding
 * the two-card flow diagram. we.png fixes the audience grid (3 x 413 on a 20px gap),
 * Partnership.png the five-row panel, works.png the dark four-step band (4 x 308 on a 16px
 * gap) and Agreed.png the terms panel with its four hairlines.
 */
const box = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.left),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    });

const boxes = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) };
    }),
  );

const style = (page: Page, selector: string, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('partnerships at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/partnerships');
    await page.locator('app-partner-terms .terms__row').first().waitFor();
  });

  test('stacks the six sections in order under a single h1', async ({ page }) => {
    const sections = await page
      .locator('app-partnerships > *')
      .evaluateAll((els) => els.map((el) => el.tagName.toLowerCase()));

    expect(sections).toEqual([
      'app-page-intro',
      'app-partner-audience',
      'app-partner-model',
      'app-partner-process',
      'app-partner-terms',
      'app-start-conversation',
    ]);

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(
      'Senior engineering behind your client relationships.',
    );
  });

  test('opens with the intro actions and the two-card flow diagram in a 520px aside', async ({
    page,
  }) => {
    const actions = page.locator('.partnerships__actions a');
    await expect(actions).toHaveCount(2);
    await expect(actions.nth(0)).toHaveAttribute('href', '/contact');
    await expect(actions.nth(1)).toHaveAttribute('href', '/engagement-models');

    const flow = page.locator('app-partner-flow .flow');
    await expect(flow).toHaveAttribute('role', 'group');
    await expect(flow).toHaveAttribute('aria-label', 'What each side brings');

    const cards = await boxes(page, '.flow__card');
    expect(cards).toHaveLength(2);
    for (const card of cards) expect([card.x, card.w, card.h]).toEqual([840, 520, 152]);

    await expect(page.locator('.flow__chip')).toHaveCount(8);
    await expect(page.locator('.flow__badge')).toHaveText('Agreed partnership model');
  });

  test('lays the six audience cards on three equal columns 20px apart', async ({ page }) => {
    const cards = await boxes(page, '.audience__card');
    expect(cards).toHaveLength(6);

    expect(cards.map((c) => c.x)).toEqual([80, 513, 947, 80, 513, 947]);
    for (const card of cards) expect(card.w).toBe(413);
    expect(cards[1].x - (cards[0].x + cards[0].w)).toBe(20);

    // Two rows: the second is taller because one title wraps.
    expect(cards[0].h).toBe(122);
    expect(cards[3].h).toBe(148);
  });

  test('renders the five partnership rows in one bordered panel', async ({ page }) => {
    const panel = await box(page, '.models__list');
    expect([panel.x, panel.w]).toEqual([80, 1280]);
    expect(await style(page, '.models__list', 'border-top-width')).toBe('1px');

    const rows = await boxes(page, '.models__row');
    expect(rows).toHaveLength(5);
    expect(rows.map((r) => r.h)).toEqual([136, 137, 115, 137, 111]);

    // Only the first tile is accented; the rest carry the primary tone.
    const tones = await page
      .locator('app-partner-model app-icon-tile')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-tone')));
    expect(tones).toEqual(['inverse-accent', 'primary', 'primary', 'primary', 'primary']);
  });

  test('puts the four process steps on a dark band as 308px cards 16px apart', async ({ page }) => {
    expect(await style(page, 'app-partner-process', 'background-color')).toBe('rgb(6, 11, 23)');

    const cards = await boxes(page, '.process__step');
    expect(cards).toHaveLength(4);
    expect(cards.map((c) => c.x)).toEqual([80, 404, 728, 1052]);
    for (const card of cards) expect([card.w, card.h]).toEqual([308, 208]);
    expect(cards[1].x - (cards[0].x + cards[0].w)).toBe(16);

    await expect(page.locator('.process__badge')).toHaveText(['01', '02', '03', '04']);
    await expect(page.locator('.process__badge--lead')).toHaveCount(1);
  });

  test('renders the terms panel with five rows and four hairlines', async ({ page }) => {
    const panel = await box(page, '.terms__panel');
    expect([panel.x, panel.w, panel.h]).toEqual([80, 1280, 502]);
    expect(await style(page, '.terms__panel', 'border-top-left-radius')).toBe('28px');

    await expect(page.locator('.terms__row')).toHaveCount(5);

    const dividers = await page
      .locator('.terms__row')
      .evaluateAll(
        (els) => els.filter((el) => getComputedStyle(el).borderTopWidth === '1px').length,
      );
    expect(dividers).toBe(4);

    const tile = page.locator('app-partner-terms app-icon-tile');
    await expect(tile).toHaveAttribute('data-tone', 'secondary');
    // The project ships the AA-safe cyan for text on the secondary container.
    expect(await style(page, 'app-partner-terms app-icon-tile', 'color')).toBe('rgb(11, 118, 161)');
  });

  test('closes with the compact conversation band pointed at contact and services', async ({
    page,
  }) => {
    const band = page.locator('app-start-conversation');
    await expect(band).toHaveAttribute('data-variant', 'compact');

    const panel = await box(page, '.start-conversation');
    expect([panel.x, panel.w, panel.h]).toEqual([80, 1280, 388]);

    await expect(page.locator('.start-conversation__step')).toHaveCount(0);

    const actions = page.locator('.start-conversation__actions a');
    await expect(actions.nth(0)).toHaveAttribute('href', '/contact');
    await expect(actions.nth(1)).toHaveAttribute('href', '/services');
  });

  test('names every section for assistive technology', async ({ page }) => {
    const named = await page
      .locator('app-partnerships section[aria-labelledby]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('aria-labelledby')));

    expect(named).toEqual([
      'audience-title',
      'models-title',
      'process-title',
      'terms-title',
      'start-conversation-title',
    ]);

    for (const id of named) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });
});

test.describe('partnerships at narrower widths', () => {
  for (const width of [390, 768, 1024]) {
    test(`stays within the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/partnerships');
      await page.locator('app-partner-terms .terms__row').first().waitFor();

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);
      await expect(page.locator('.audience__card')).toHaveCount(6);
      await expect(page.locator('.process__step')).toHaveCount(4);
      await expect(page.locator('.terms__row')).toHaveCount(5);
    });
  }
});

test.describe('partnerships under a locale prefix', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('translates the page and keeps the prefix on every link', async ({ page }) => {
    await page.goto('/ru/partnerships');
    await page.locator('app-partner-terms .terms__row').first().waitFor();

    await expect(page.locator('h1')).toHaveText(
      'Senior-инженерия за вашими клиентскими отношениями.',
    );
    await expect(page.locator('#audience-title')).toHaveText(
      'Создано для компаний, которые продают технологии или консультируют по ним.',
    );

    const hrefs = await page
      .locator('app-partnerships a')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(hrefs.every((href) => href === '/ru' || href?.startsWith('/ru/'))).toBe(true);
  });
});
