import { expect, test, type Page } from '@playwright/test';

/**
 * The /engagement-models page.
 *
 * Named `engagement-page` because `engagement-models.spec.ts` was already taken by the home
 * page's engagement section, which only ever visits `/` and `/ru`. Before this file the page
 * itself had no e2e coverage at all.
 *
 * Its centrepiece is a comparison table with `min-width: 960px` inside an `overflow-x: auto`
 * region, so below the `large` breakpoint it scrolls: measured 612px hidden at 390, 258 at 768,
 * 18 at 1024 and 0 from 1200 up.
 */
const style = (page: Page, selector: string, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el)[p as never] as string, prop);

const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

const settle = async (page: Page, host: string) => {
  await page.locator(host).scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
};

test.describe('the comparison table keeps its row labels', () => {
  for (const width of [390, 768, 1024]) {
    test(`label column stays pinned while the columns scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/engagement-models');
      await expect(page.locator('.comparison__table')).toBeVisible();

      const label = page.locator('.comparison__label').first();
      expect(await label.evaluate((el) => getComputedStyle(el).position)).toBe('sticky');

      // A sticky cell needs an opaque fill of its own, or the scrolling columns show through.
      expect(await style(page, '.comparison__label', 'backgroundColor')).not.toBe(
        'rgba(0, 0, 0, 0)',
      );

      const before = await label.evaluate((el) => Math.round(el.getBoundingClientRect().left));
      const scrolled = await page.locator('.comparison__scroller').evaluate((el) => {
        el.scrollLeft = 10000;
        return el.scrollLeft;
      });
      expect(scrolled, `the table should overflow at ${width}px`).toBeGreaterThan(0);

      const after = await label.evaluate((el) => Math.round(el.getBoundingClientRect().left));
      expect(after, `label drifted at ${width}px`).toBe(before);
    });
  }

  test('the trailing edge fades only where the table overflows', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1000 });
    await page.goto('/engagement-models');
    await expect(page.locator('.comparison__table')).toBeVisible();
    expect(await style(page, '.comparison__scroller', 'maskImage')).not.toBe('none');

    // From `large` up the table fits exactly, where a fade would dim the last column for nothing.
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.waitForTimeout(300);
    expect(await style(page, '.comparison__scroller', 'maskImage')).toBe('none');
  });
});

test.describe('engagement models interaction', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 1000 } });

  test('a table row tints together with its pinned label', async ({ page }) => {
    await page.goto('/engagement-models');
    await settle(page, 'app-model-comparison');

    const cell = () => style(page, '.comparison__cell', 'backgroundColor');
    const label = () => style(page, '.comparison__label', 'backgroundColor');
    const cellIdle = await cell();
    const labelIdle = await label();

    await page.locator('tbody tr').first().hover();
    await expect.poll(cell, { timeout: 2000 }).not.toBe(cellIdle);
    // The label tints with the row, so it does not look severed at the sticky edge.
    await expect.poll(label, { timeout: 2000 }).not.toBe(labelIdle);
  });

  test('the disclosure uses one rotating icon and answers the pointer', async ({ page }) => {
    await page.goto('/engagement-models');
    await settle(page, 'app-model-faq');

    // One icon, not a pair toggled with `display` - which cannot be animated.
    await expect(page.locator('.faq__item').first().locator('.faq__icon')).toHaveCount(1);

    const first = page.locator('.faq__disclosure').first();
    const second = page.locator('.faq__disclosure').nth(1);
    await expect(first).toHaveAttribute('open', '');
    expect(await first.locator('.faq__icon').evaluate((el) => getComputedStyle(el).rotate)).toBe(
      '45deg',
    );
    expect(await second.locator('.faq__icon').evaluate((el) => getComputedStyle(el).rotate)).toBe(
      'none',
    );

    const summary = second.locator('.faq__summary');
    const bg = () => summary.evaluate((el) => getComputedStyle(el).backgroundColor);
    const idle = await bg();
    await summary.hover();
    await expect.poll(bg, { timeout: 2000 }).not.toBe(idle);

    // Opening it rotates the same icon rather than swapping nodes.
    await summary.click();
    await expect(second).toHaveAttribute('open', '');
    await expect
      .poll(() => second.locator('.faq__icon').evaluate((el) => getComputedStyle(el).rotate), {
        timeout: 2000,
      })
      .toBe('45deg');
  });

  test('a finder row nudges its arrow along the direction it points', async ({ page }) => {
    await page.goto('/engagement-models');
    await settle(page, 'app-model-finder');

    const arrow = () => style(page, '.finder__arrow', 'translate');
    expect(await arrow()).toBe('none');
    await page.locator('.finder__row').first().hover();
    await expect.poll(arrow, { timeout: 2000 }).not.toBe('none');
  });

  test('a model card strengthens its border without pretending to be clickable', async ({
    page,
  }) => {
    await page.goto('/engagement-models');
    await settle(page, 'app-model-details');

    const border = () => style(page, '.model', 'borderTopColor');
    const idle = await border();
    const card = page.locator('.model').first();
    await card.hover();
    await expect.poll(border, { timeout: 2000 }).not.toBe(idle);

    // Emphasis, not affordance: these cards carry no link or control.
    await expect(card).toHaveCSS('cursor', 'auto');
    await expect(card).toHaveCSS('box-shadow', 'none');
    await expect(card).toHaveCSS('translate', 'none');
  });
});

test.describe('engagement models with reduced motion', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });

  test('keeps every colour cue and drops the movement', async ({ page }) => {
    await page.goto('/engagement-models');
    await settle(page, 'app-model-finder');

    // Colour is not motion, so the cue stays.
    const bg = () => style(page, '.finder__row', 'backgroundColor');
    const idle = await bg();
    await page.locator('.finder__row').first().hover();
    await expect.poll(bg, { timeout: 2000 }).not.toBe(idle);

    // The arrow nudge is movement, so it is gone.
    expect(await style(page, '.finder__arrow', 'translate')).toBe('none');

    // Nothing is left hidden by the entrance reveals.
    for (const selector of [
      '.finder__row',
      '.models__item',
      '.comparison__scroller',
      '.faq__item',
    ]) {
      await page.locator(selector).first().scrollIntoViewIfNeeded();
      await expect(page.locator(selector).first(), selector).toHaveCSS('opacity', '1');
    }
  });
});

/**
 * The finder chips select a model.
 *
 * The selection lives in the URL, so it is shareable and survives a reload. The two
 * dictionaries behind the page carry no shared key - only translated display copy - so the
 * finder row and the detail card are paired by position through `MODEL_IDS`. These specs assert
 * the pairing end to end, which is what would catch a reorder of either dictionary.
 */
const PAIRS = [
  ['project-based', 'Project-Based Development'],
  ['dedicated-team', 'Dedicated Engineering Teams'],
  ['long-term-partnership', 'Long-Term Technology Partnership'],
  ['maintenance-support', 'Maintenance & Technical Support'],
  ['white-label', 'White-Label Development'],
] as const;

test.describe('selecting a model from the finder', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('every chip selects the model it names', async ({ page }) => {
    await page.goto('/engagement-models');
    await expect(page.locator('.finder__chip')).toHaveCount(PAIRS.length);

    for (const [id, title] of PAIRS) {
      await page
        .locator('.finder__chip')
        .filter({ hasText: /./ })
        .nth(PAIRS.findIndex(([i]) => i === id))
        .click();
      // Read the param rather than pattern-match the URL, which keeps the locale prefix out of it.
      await expect
        .poll(() => new URL(page.url()).searchParams.get('model'), { timeout: 2000 })
        .toBe(id);

      const current = page.locator('.models__item--current');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveAttribute('id', `model-${id}`);
      // The card marked current must be the one the chip names.
      await expect(current.locator('.model__title')).toHaveText(title);
      await expect(current).toHaveAttribute('aria-current', 'location');

      // And the chip itself reports the selection, so a reload still shows which is active.
      await expect(page.locator('.finder__chip--current')).toHaveCount(1);
    }
  });

  test('a shared link opens on the selected model', async ({ page }) => {
    await page.goto('/engagement-models?model=white-label');
    const current = page.locator('.models__item--current');
    await expect(current).toHaveAttribute('id', 'model-white-label');
    await expect(current.locator('.model__title')).toHaveText('White-Label Development');

    // The scroll is explicit because `anchorScrolling` is off; the card should be near the top.
    const top = await current.evaluate((el) => Math.round(el.getBoundingClientRect().top));
    expect(top).toBeLessThan(300);
  });

  test('an unknown model in the URL selects nothing rather than guessing', async ({ page }) => {
    await page.goto('/engagement-models?model=not-a-model');
    await expect(page.locator('.models__item--current')).toHaveCount(0);
    await expect(page.locator('.finder__chip--current')).toHaveCount(0);
  });
});

/**
 * The finder card at the design width in every locale.
 *
 * The model names are far longer in Armenian and Russian - up to 378px against 172px in
 * English - and `.finder__model` used to refuse to shrink, so the statement kept whatever was
 * left: measured 91px wide across ten lines, in a 339px-tall row. The chip now drops to its own
 * line instead of crushing the statement.
 */
test.describe('the finder survives its longest translations', () => {
  test.use({ viewport: { width: 1440, height: 1200 } });

  for (const [locale, path] of [
    ['en', '/engagement-models'],
    ['hy', '/hy/engagement-models'],
    ['ru', '/ru/engagement-models'],
  ] as const) {
    test(`${locale} keeps every statement readable`, async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('.finder__row')).toHaveCount(PAIRS.length);

      const widths = await page
        .locator('.finder__statement')
        .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
      // The floor that decides the wrap; nothing should end up below it.
      for (const [i, w] of widths.entries()) {
        expect(w, `${locale} statement ${i} is ${w}px wide`).toBeGreaterThanOrEqual(220);
      }

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);
    });
  }
});
