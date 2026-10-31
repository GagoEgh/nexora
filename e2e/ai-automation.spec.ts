import { expect, test, type Page } from '@playwright/test';
import { expectTypeFromRole } from './support/tokens';

/**
 * "AI & automation" section contract (Ai.png at 1440): one dark panel on the container width with
 * the copy column, a 2 x 3 grid of capability cards, and the pipeline row under a hairline.
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
  'Intelligent assistants',
  'RAG & knowledge retrieval',
  'Document processing',
  'Workflow automation',
  'CRM integrations',
  'Multi-step AI agents',
];

test.describe('ai-automation at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('app-ai-automation').scrollIntoViewIfNeeded();
    await expect(page.locator('app-ai-automation .ai__card app-icon-tile svg')).toHaveCount(6);
  });

  test('follows what-we-build as a dark 1280px panel with the inverse tokens', async ({ page }) => {
    await expect(page.locator('app-what-we-build + app-ai-automation')).toHaveCount(1);
    // The shared section rhythm from `styles/mixins/_container.scss` at `large`.
    expect(await style(page, 'app-ai-automation', 'padding-top')).toBe('80px');
    const [panel] = await boxes(page, 'app-ai-automation .ai');
    expect([panel.x, panel.w]).toEqual([80, 1280]);
    expect(await style(page, 'app-ai-automation .ai', 'background-color')).toBe('rgb(6, 11, 23)');
    expect(await style(page, 'app-ai-automation .ai', 'border-top-left-radius')).toBe('28px');
    expect(await style(page, 'app-ai-automation .ai', 'padding-top')).toBe('64px');

    await expect(page.locator('app-ai-automation .ai__eyebrow')).toHaveText('AI & automation');
    expect(await style(page, 'app-ai-automation .ai__eyebrow', 'color')).toBe('rgb(134, 173, 255)');
    await expectTypeFromRole(page, 'app-ai-automation h2', '--nx-sys-display-section');
    expect(await style(page, 'app-ai-automation h2', 'color')).toBe('rgb(246, 248, 251)');
    await expectTypeFromRole(page, 'app-ai-automation .ai__lead', '--nx-sys-body-lead');
    expect(await style(page, 'app-ai-automation .ai__lead', 'color')).toBe('rgb(148, 163, 184)');

    const actions = page.locator('app-ai-automation .ai__actions a');
    await expect(actions).toHaveText(['Explore AI Services', 'Discuss a use case']);
    await expect(actions.nth(0)).toHaveAttribute('href', '/services');
    await expect(actions.nth(1)).toHaveAttribute('href', '/contact');
    const [primary, secondary] = await boxes(page, 'app-ai-automation .ai__actions a');
    expect([primary.h, secondary.h]).toEqual([48, 48]);
    expect(await style(page, 'app-ai-automation .ai__actions a', 'background-color')).toBe(
      'rgb(15, 85, 232)',
    );
    expect(await style(page, 'app-ai-automation .ai__secondary', 'color')).toBe(
      'rgb(246, 248, 251)',
    );
  });

  test('six cards in two 312px columns with filled tiles, titles and copy', async ({ page }) => {
    const [panel] = await boxes(page, 'app-ai-automation .ai');
    const cards = await boxes(page, 'app-ai-automation .ai__card');
    expect(cards).toHaveLength(6);
    // Widths and columns are fixed by the 1280 canvas; heights and row offsets follow the
    // type scale, so they moved with it while the grid did not.
    expect(cards.map((c) => [c.x, c.y - panel.y, c.w, c.h])).toEqual([
      [656, 64, 312, 136],
      [984, 64, 312, 136],
      [656, 216, 312, 136],
      [984, 216, 312, 136],
      [656, 368, 312, 136],
      [984, 368, 312, 136],
    ]);
    expect(await style(page, 'app-ai-automation .ai__card', 'background-color')).toBe(
      'rgb(26, 37, 64)',
    );
    expect(await style(page, 'app-ai-automation .ai__card', 'border-top-color')).toBe(
      'rgb(246, 248, 251)',
    );
    expect(await style(page, 'app-ai-automation .ai__card', 'border-top-left-radius')).toBe('16px');

    const [tile] = await boxes(page, 'app-ai-automation .ai__card app-icon-tile');
    expect([tile.x - cards[0].x, tile.y - cards[0].y, tile.w, tile.h]).toEqual([25, 25, 40, 40]);
    expect(await style(page, 'app-ai-automation .ai__card app-icon-tile', 'background-color')).toBe(
      'rgb(15, 85, 232)',
    );
    expect(
      await style(page, 'app-ai-automation .ai__card app-icon-tile', 'border-top-left-radius'),
    ).toBe('8px');
    expect(
      await style(
        page,
        'app-ai-automation .ai__card app-icon-tile mat-icon svg path, app-ai-automation .ai__card app-icon-tile mat-icon svg rect',
        'stroke',
      ),
    ).toBe('rgb(255, 255, 255)');

    await expect(page.locator('app-ai-automation .ai__card h3')).toHaveText(TITLES);
    const [title] = await boxes(page, 'app-ai-automation .ai__card-title');
    expect(title.x - cards[0].x).toBe(81);
    await expectTypeFromRole(page, 'app-ai-automation .ai__card-title', '--mat-sys-label-large');
    expect(await style(page, 'app-ai-automation .ai__card-title', 'font-weight')).toBe('600');
    await expectTypeFromRole(page, 'app-ai-automation .ai__card-text', '--mat-sys-body-small');
    expect(await style(page, 'app-ai-automation .ai__card-text', 'color')).toBe(
      'rgb(148, 163, 184)',
    );
    await expect(
      page.locator('app-ai-automation .ai__card a, app-ai-automation .ai__card button'),
    ).toHaveCount(0);
  });

  test('pipeline row under a hairline: five code pills, the review step in inverse-primary, footnote right', async ({
    page,
  }) => {
    const [panel] = await boxes(page, 'app-ai-automation .ai');
    const [footer] = await boxes(page, 'app-ai-automation .ai__footer');
    const cards = await boxes(page, 'app-ai-automation .ai__card');
    expect(footer.y - (cards[5].y + cards[5].h)).toBe(48);
    expect(await style(page, 'app-ai-automation .ai__footer', 'border-top-color')).toBe(
      'rgb(246, 248, 251)',
    );
    expect(await style(page, 'app-ai-automation .ai__footer', 'padding-top')).toBe('32px');

    const labels = page.locator('app-ai-automation .ai__step-label');
    await expect(labels).toHaveText(['input', 'retrieve', 'reason', 'act', 'human review']);
    const pills = await boxes(page, 'app-ai-automation .ai__step-label');
    expect(pills.every((p) => p.h === 30)).toBe(true);
    expect(pills[0].x).toBe(panel.x + 64);
    expect(await style(page, 'app-ai-automation .ai__step-label', 'font-size')).toBe('12px');
    expect(await style(page, 'app-ai-automation .ai__step-label', 'border-top-left-radius')).toBe(
      '9999px',
    );
    expect(await style(page, 'app-ai-automation .ai__step-label', 'border-top-color')).toBe(
      'rgb(246, 248, 251)',
    );
    expect(await style(page, 'app-ai-automation .ai__step--review .ai__step-label', 'color')).toBe(
      'rgb(134, 173, 255)',
    );
    await expect(page.locator('app-ai-automation .ai__arrow')).toHaveCount(4);
    expect((await boxes(page, 'app-ai-automation .ai__arrow'))[0].w).toBe(14);

    const note = page.locator('app-ai-automation .ai__note');
    await expect(note).toHaveText(/human review where decisions matter/);
    const [noteBox] = await boxes(page, 'app-ai-automation .ai__note');
    expect(noteBox.x + noteBox.w).toBe(panel.x + 1280 - 64);
    await expectTypeFromRole(page, 'app-ai-automation .ai__note', '--mat-sys-body-small');
  });

  test('the calls to action navigate', async ({ page }) => {
    await page.locator('app-ai-automation .ai__actions a').nth(1).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.locator('main h1')).toHaveText('Let’s Build Something Meaningful.');
  });
});

test.describe('ai-automation at narrower widths', () => {
  test('two card columns at 700px inside a 40px panel padding', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 });
    await page.goto('/');
    await expect(page.locator('app-ai-automation .ai__card')).toHaveCount(6);
    expect(await style(page, 'app-ai-automation .ai', 'padding-top')).toBe('40px');
    const cards = await boxes(page, 'app-ai-automation .ai__card');
    expect(new Set(cards.map((c) => c.x)).size).toBe(2);
  });

  test('one column at 390px without horizontal overflow, pipeline wrapping onto two rows', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('app-ai-automation .ai__card')).toHaveCount(6);
    const [panel] = await boxes(page, 'app-ai-automation .ai');
    expect([panel.x, panel.w]).toEqual([20, 350]);
    expect(await style(page, 'app-ai-automation .ai', 'padding-top')).toBe('24px');
    const cards = await boxes(page, 'app-ai-automation .ai__card');
    expect(cards.every((c) => c.x === 44 && c.w === 302)).toBe(true);
    const pills = await boxes(page, 'app-ai-automation .ai__step-label');
    expect(new Set(pills.map((p) => p.y)).size).toBe(2);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
});
