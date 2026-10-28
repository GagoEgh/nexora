import { expect, test, type Page } from '@playwright/test';

/**
 * Solutions page contract.
 *
 * hero.png fixes the opening band at 1440: the shared page intro with its lead in the
 * aside, then an index of eight 305px cards on a 20px column / 12px row rhythm that
 * lands exactly on the 1280px container (4 x 305 + 3 x 20). Solutions.png fixes the
 * eight detail panels below it: full container width, 20px apart, each a three-column
 * grid of 488px / fluid / 300px separated by a hairline.
 */
const box = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.left),
        y: Math.round(r.top),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    });

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

const style = (page: Page, selector: string, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

const noOverflow = (page: Page) =>
  page.evaluate(() => {
    const de = document.documentElement;
    return de.scrollWidth - de.clientWidth;
  });

test.describe('solutions at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/solutions');
    await expect(page.locator('.challenge-details__panel')).toHaveCount(8);
  });

  test('opens with the shared intro and carries the lead in a 440px aside', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Start from the problem, not the technology.');

    // The lead sits in the aside column, not under the heading - one element either way.
    const lead = await box(page, '.page-intro__lead');
    expect(lead.w).toBe(440);
    expect(lead.x + lead.w).toBe(1360);

    const title = await box(page, '.page-intro__title');
    expect(title.x).toBe(80);
  });

  test('indexes eight cards on the measured grid', async ({ page }) => {
    const cards = await boxes(page, '.challenge-index__card');
    expect(cards).toHaveLength(8);

    // Four equal columns that fill the container exactly.
    for (const card of cards) expect(card.w).toBe(305);
    expect(cards[0].x).toBe(80);
    expect(cards[3].x + cards[3].w).toBe(1360);
    expect(cards[1].x - (cards[0].x + cards[0].w)).toBe(20);
    expect(cards[2].x - (cards[1].x + cards[1].w)).toBe(20);
    expect(cards[4].y - (cards[0].y + cards[0].h)).toBe(12);

    // Two rows of four, every card the same height.
    expect(new Set(cards.map((c) => c.y)).size).toBe(2);
    expect(new Set(cards.map((c) => c.h))).toEqual(new Set([70]));
  });

  test('card titles wrap exactly as the design does', async ({ page }) => {
    const lines = await page
      .locator('.challenge-index__title')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height / 20)));
    expect(lines).toEqual([1, 2, 2, 2, 2, 1, 1, 2]);
  });

  test('stacks eight detail panels at container width, 20px apart', async ({ page }) => {
    const panels = await boxes(page, '.challenge-details__panel');
    expect(panels).toHaveLength(8);
    for (const panel of panels) {
      expect(panel.x).toBe(80);
      expect(panel.w).toBe(1280);
    }
    for (let i = 1; i < panels.length; i++) {
      expect(panels[i].y - (panels[i - 1].y + panels[i - 1].h)).toBe(20);
    }
    expect(await style(page, '.challenge-details__panel', 'border-top-left-radius')).toBe('24px');
  });

  test('lays each panel out as 488 / fluid / 300 with a hairline between the first two', async ({
    page,
  }) => {
    const summary = await box(page, '.challenge-details__summary');
    const help = await box(page, '.challenge-details__help');
    const services = await box(page, '.challenge-details__services');

    expect(summary.x).toBe(121);
    expect(summary.w).toBe(488);
    expect(help.x).toBe(649);
    expect(services.x).toBe(1019);
    expect(services.w).toBe(300);

    // 40px column gap either side of the fluid middle column.
    expect(help.x - (summary.x + summary.w)).toBe(40);
    expect(services.x - (help.x + help.w)).toBe(40);

    // The hairline is the summary column's trailing border.
    expect(await style(page, '.challenge-details__summary', 'border-right-width')).toBe('1px');
    expect(await style(page, '.challenge-details__summary', 'border-right-color')).toBe(
      'rgb(226, 232, 240)',
    );
  });

  test('renders the panel contents: tiles, counters, checklists and service rows', async ({
    page,
  }) => {
    await expect(page.locator('.challenge-details__counter').first()).toHaveText('01 / 08');
    await expect(page.locator('.challenge-details__counter').last()).toHaveText('08 / 08');

    // Only the AI challenge uses the inverted tile.
    await expect(page.locator('app-icon-tile[data-tone="inverse-container"]')).toHaveCount(1);
    await expect(page.locator('app-icon-tile[data-tone="primary"]')).toHaveCount(7);

    const first = page.locator('.challenge-details__panel').first();
    await expect(first.locator('.challenge-details__point')).toHaveCount(3);
    await expect(first.locator('.challenge-details__service')).toHaveCount(4);
    await expect(first.locator('.challenge-details__cta')).toHaveAttribute('href', '/contact');

    expect(await style(page, '.challenge-details__services', 'background-color')).toBe(
      'rgb(246, 248, 251)',
    );
    expect(await style(page, '.challenge-details__check', 'background-color')).toBe(
      'rgb(238, 244, 255)',
    );
  });

  test('joins the intro and the index into one tinted band', async ({ page }) => {
    // page-intro's gradient ends on --mat-sys-background; the index continues it, so
    // there is no step where the two meet.
    expect(await style(page, 'app-challenge-index', 'background-color')).toBe('rgb(250, 251, 253)');
  });
});

/**
 * Reaching a challenge.
 *
 * The index cards used to cancel their own navigation and scroll imperatively, so the position
 * was unreachable: the URL never changed, opening a card in a new tab landed at the top of the
 * page, and Back did nothing. They now carry the same `?challenge=` contract the footer links
 * use, which is the one mechanism the page handles.
 */
test.describe('reaching a challenge', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const PANEL = '#challenge-introduce-ai';
  const top = (page: Page) =>
    page.locator(PANEL).evaluate((el) => Math.round(el.getBoundingClientRect().top));

  test('a card addresses the panel it points at', async ({ page }) => {
    await page.goto('/solutions');

    await expect(page.locator('.challenge-index__card').nth(3)).toHaveAttribute(
      'href',
      '/solutions?challenge=introduce-ai',
    );
  });

  test('clicking a card records the challenge and lands on the panel', async ({ page }) => {
    await page.goto('/solutions');

    await page.locator('.challenge-index__card').nth(3).click();

    await expect(page).toHaveURL(/\?challenge=introduce-ai$/);
    await expect.poll(() => top(page)).toBe(0);
  });

  test('the same card works twice, after scrolling away', async ({ page }) => {
    await page.goto('/solutions');
    await page.locator('.challenge-index__card').nth(3).click();
    await expect.poll(() => top(page)).toBe(0);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('.challenge-index__card').nth(3).click();

    await expect.poll(() => top(page)).toBe(0);
  });

  test('back leaves the challenge behind', async ({ page }) => {
    await page.goto('/solutions');
    await page.locator('.challenge-index__card').nth(3).click();
    await expect(page).toHaveURL(/\?challenge=introduce-ai$/);

    await page.goBack();

    await expect(page).toHaveURL(/\/solutions$/);
  });

  /** The contract the footer depends on, from a cold load rather than an in-page click. */
  test('a cold load of the address lands on the panel', async ({ page }) => {
    await page.goto('/solutions?challenge=introduce-ai');

    await expect.poll(() => top(page)).toBe(0);
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(0);
  });

  test('keeps the locale prefix on the card addresses', async ({ page }) => {
    await page.goto('/ru/solutions');

    await expect(page.locator('.challenge-index__card').first()).toHaveAttribute(
      'href',
      '/ru/solutions?challenge=launch-digital-product',
    );
  });
});

test.describe('solutions responsiveness', () => {
  for (const width of [320, 375, 768, 1024, 1199, 1200, 1920]) {
    test(`fits ${width}px without horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/solutions');
      await expect(page.locator('.challenge-details__panel')).toHaveCount(8);

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);

      const cards = await boxes(page, '.challenge-index__card');
      const columns = new Set(cards.map((c) => c.x)).size;
      expect(columns).toBe(width >= 1200 ? 4 : width >= 600 ? 2 : 1);

      // Panels stack into a single column below the large breakpoint.
      const summary = await box(page, '.challenge-details__summary');
      const services = await box(page, '.challenge-details__services');
      if (width >= 1200) {
        expect(summary.y).toBe(services.y);
      } else {
        expect(services.y).toBeGreaterThan(summary.y);
      }
    });
  }

  for (const locale of ['hy', 'ru']) {
    test(`does not clip ${locale} copy at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.goto(`/${locale}/solutions`);
      await expect(page.locator('.challenge-details__panel')).toHaveCount(8);

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);

      const clipped = await page.evaluate(
        () =>
          [
            ...document.querySelectorAll(
              '.challenge-index__title,.challenge-details__title,.challenge-details__text,.challenge-details__point-text,.challenge-details__service-name,.start-conversation__title,.start-conversation__lead,.start-conversation__actions a',
            ),
          ].filter(
            (el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1,
          ).length,
      );
      expect(clipped).toBe(0);
    });
  }
});

/**
 * The page entrance.
 *
 * Everything else in this file runs under the suite-wide `reducedMotion: 'reduce'`
 * (playwright.config.ts), which is what keeps its pixel assertions stable: under `reduce` no
 * hidden state applies at all.
 */
test.describe('solutions entrance', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });

  test('holds each panel until it is reached rather than firing all eight at once', async ({
    page,
  }) => {
    await page.goto('/solutions');
    await expect
      .poll(() => page.locator('.challenge-index').getAttribute('data-reveal'), { timeout: 5000 })
      .toBe('in');

    const panels = page.locator('.challenge-details__panel');
    const atLoad = await panels.evaluateAll((els) =>
      els.map((el) => el.getAttribute('data-reveal')),
    );
    // The first is already on screen; the rest are not.
    expect(atLoad.slice(1).every((state) => state === 'out')).toBe(true);

    await panels.nth(7).scrollIntoViewIfNeeded();
    await expect
      .poll(() => panels.nth(7).getAttribute('data-reveal'), { timeout: 5000 })
      .toBe('in');

    await page.waitForTimeout(900);
    for (const selector of ['.challenge-details__summary', '.challenge-details__services']) {
      const part = panels.nth(7).locator(selector);
      await expect(part, selector).toHaveCSS('opacity', '1');
      await expect(part, selector).toHaveCSS('transform', 'none');
    }
  });

  test('staggers the index across the row', async ({ page }) => {
    await page.goto('/solutions');

    const delays = await page
      .locator('.challenge-index__item')
      .evaluateAll((els) => [...new Set(els.map((el) => getComputedStyle(el).transitionDelay))]);
    expect(delays).toEqual(['0s', '0.05s', '0.1s', '0.15s']);
  });

  /**
   * A panel that starts hidden still occupies its space, so the scroll target is unaffected -
   * which is what keeps the footer's deep links landing on the right panel.
   */
  test('a deep link still lands on a panel that has not revealed yet', async ({ page }) => {
    await page.goto('/solutions?challenge=improve-reliability');

    const panel = page.locator('#challenge-improve-reliability');
    await expect
      .poll(() => panel.evaluate((el) => Math.round(el.getBoundingClientRect().top)))
      .toBe(0);
    await expect(panel.locator('.challenge-details__summary')).toHaveCSS('opacity', '1');
  });
});

/**
 * Arriving at a challenge.
 *
 * Eight panels look alike, so landing on one needs an acknowledgement. The index keeps a
 * persistent mark of where the reader is; the panel gives a one-shot ring and then stops. The
 * mark is state and applies whatever the motion setting is; the ring is motion and is gated.
 */
test.describe('arriving at a challenge', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });

  test('marks exactly the card that matches the url', async ({ page }) => {
    await page.goto('/solutions?challenge=introduce-ai');

    const current = page.locator('.challenge-index__card[aria-current="location"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveCSS('background-color', 'rgb(238, 244, 255)');
    await expect(page.locator('.challenge-index__card').nth(3)).toHaveAttribute(
      'aria-current',
      'location',
    );
  });

  test('marks nothing when the url names no challenge', async ({ page }) => {
    await page.goto('/solutions');

    await expect(page.locator('.challenge-index__card[aria-current]')).toHaveCount(0);
  });

  test('rings the panel once and leaves it at its resting colour', async ({ page }) => {
    await page.goto('/solutions?challenge=introduce-ai');
    const panel = page.locator('#challenge-introduce-ai');

    expect(await panel.evaluate((el) => getComputedStyle(el).animationName)).toContain('arrival');
    expect(await panel.evaluate((el) => getComputedStyle(el).animationIterationCount)).toBe('1');

    await page.waitForTimeout(1600);
    await expect(panel).toHaveCSS('border-top-color', 'rgb(226, 232, 240)');
  });

  test('lifts an index card under the pointer', async ({ page }) => {
    await page.goto('/solutions');
    const card = page.locator('.challenge-index__card').first();
    await expect(card).toHaveCSS('translate', 'none');

    await card.hover();
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).translate)).toBe('0px -2px');
  });

  test('nudges the panel cta arrow under the pointer', async ({ page }) => {
    await page.goto('/solutions');
    const cta = page.locator('.challenge-details__cta').first();
    await cta.scrollIntoViewIfNeeded();
    const arrow = cta.locator('.mat-icon');

    await cta.hover();
    await expect.poll(() => arrow.evaluate((el) => getComputedStyle(el).translate)).toBe('4px');
  });
});

test.describe('arriving at a challenge with reduced motion', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });

  test('keeps the mark and drops the ring and the nudge', async ({ page }) => {
    await page.goto('/solutions?challenge=introduce-ai');

    await expect(page.locator('.challenge-index__card[aria-current="location"]')).toHaveCount(1);
    expect(
      await page
        .locator('#challenge-introduce-ai')
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe('none');

    const cta = page.locator('.challenge-details__cta').first();
    await cta.scrollIntoViewIfNeeded();
    await cta.hover();
    expect(await cta.locator('.mat-icon').evaluate((el) => getComputedStyle(el).translate)).toBe(
      'none',
    );
  });
});

test.describe('solutions entrance with reduced motion', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });

  test('hides nothing', async ({ page }) => {
    await page.goto('/solutions');

    await expect(page.locator('.challenge-index__item').first()).toHaveCSS('opacity', '1');
    await page.locator('.challenge-details__panel').nth(4).scrollIntoViewIfNeeded();
    await expect(
      page.locator('.challenge-details__panel').nth(4).locator('.challenge-details__summary'),
    ).toHaveCSS('opacity', '1');
  });
});

test.describe('solutions conversation band', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/solutions');
    await expect(page.locator('app-start-conversation')).toHaveCount(1);
  });

  test('closes the page with the shared band, no steps and two working links', async ({ page }) => {
    const band = page.locator('app-start-conversation');
    await expect(band.locator('.start-conversation__eyebrow')).toHaveText('Start a conversation');
    await expect(band.locator('h2.start-conversation__title')).toHaveText(
      'Facing a challenge that isn’t listed?',
    );
    await expect(band.locator('.start-conversation__lead')).toHaveText(
      'These are common starting points, not a complete list. Describe your situation and we’ll tell you honestly whether and how we can help.',
    );
    await expect(page.locator('app-solutions h1')).toHaveCount(1);

    // CTA.png shows no numbered list.
    await expect(band.locator('.start-conversation__step')).toHaveCount(0);

    const links = band.locator('a');
    await expect(links).toHaveCount(2);
    await expect(links).toHaveText(['Discuss Your Project', 'Explore Our Services']);
    await expect(links.nth(0)).toHaveAttribute('href', '/contact');
    await expect(links.nth(1)).toHaveAttribute('href', '/services');
    await expect(band.locator('.start-conversation__art')).toHaveAttribute('aria-hidden', 'true');

    // The secondary link actually resolves.
    await links.nth(1).click();
    await expect(page).toHaveURL(/\/services$/);
  });

  test('sits below the last panel and matches the design geometry', async ({ page }) => {
    const panels = await boxes(page, '.challenge-details__panel');
    const panel = await box(page, '.start-conversation');

    // The band is the last section on the page, under all eight panels.
    expect(panel.y).toBeGreaterThan(panels[7].y + panels[7].h);
    expect(panel.x).toBe(80);
    expect(panel.w).toBe(1280);

    expect(await style(page, '.start-conversation', 'border-radius')).toBe('28px');
    expect(await style(page, '.start-conversation', 'background-color')).toBe('rgb(238, 244, 255)');

    const buttons = await boxes(page, '.start-conversation__actions a');
    expect(buttons).toHaveLength(2);
    for (const button of buttons) expect(button.h).toBe(48);

    // This page narrows the shared artwork column and lets the ring bleed past the
    // grid row, reproducing CTA.png's 380px ring inset 4px inside a 388px panel.
    const ring = await box(page, '.start-conversation__ring');
    expect(ring.w).toBe(380);
    expect(ring.h).toBe(380);
    expect(panel.h).toBe(388);
    expect(ring.y - panel.y).toBe(4);
    expect(panel.y + panel.h - (ring.y + ring.h)).toBe(4);

    const titleLines = await page
      .locator('.start-conversation__title')
      .evaluate((el) =>
        Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)),
      );
    expect(titleLines).toBe(1);
  });

  test('stacks the band and keeps it inside the viewport at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/solutions');
    await expect(page.locator('app-start-conversation')).toHaveCount(1);

    expect(await noOverflow(page)).toBeLessThanOrEqual(0);

    const copy = await box(page, '.start-conversation__copy');
    const art = await box(page, '.start-conversation__art');
    expect(art.y).toBeGreaterThan(copy.y);

    const buttons = await boxes(page, '.start-conversation__actions a');
    expect(buttons[0].x).toBe(buttons[1].x);
  });
});
