import { expect, test, type Page } from '@playwright/test';

/**
 * Start-a-conversation contract (CTA.png at 1440): a primary-container panel holding the copy
 * column — eyebrow, h2, lead, three numbered steps and two CTA buttons — beside the brand mark
 * inside two concentric rings that reach the panel edge. One column below 1200.
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

const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

const STEPS = ['Share your context', 'Discovery conversation', 'Proposed approach'];

test.describe('start a conversation at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('app-start-conversation').scrollIntoViewIfNeeded();
    await expect(page.locator('app-start-conversation .start-conversation__mark')).toBeVisible();
  });

  test('follows engagement models as a primary-container panel on the section grid', async ({
    page,
  }) => {
    await expect(page.locator('app-engagement-models + app-start-conversation')).toHaveCount(1);
    expect(await style(page, 'app-start-conversation', 'padding-top')).toBe('96px');

    const [panel] = await boxes(page, 'app-start-conversation .start-conversation');
    expect([panel.x, panel.w]).toEqual([80, 1280]);
    expect(
      await style(page, 'app-start-conversation .start-conversation', 'background-color'),
    ).toBe('rgb(238, 244, 255)');
    expect(
      await style(page, 'app-start-conversation .start-conversation', 'border-top-left-radius'),
    ).toBe('28px');
    expect(await style(page, 'app-start-conversation .start-conversation', 'padding-top')).toBe(
      '64px',
    );
  });

  test('renders the eyebrow, a single h2 on the display-section role and the lead copy', async ({
    page,
  }) => {
    await expect(page.locator('app-start-conversation .start-conversation__eyebrow')).toHaveText(
      'Start a conversation',
    );
    expect(await style(page, 'app-start-conversation .start-conversation__eyebrow', 'color')).toBe(
      'rgb(15, 85, 232)',
    );
    expect(
      await style(page, 'app-start-conversation .start-conversation__eyebrow', 'text-transform'),
    ).toBe('uppercase');

    const title = page.locator('app-start-conversation h2');
    await expect(title).toHaveCount(1);
    await expect(title).toHaveText('Have a Complex Technical Challenge? Let’s Solve It Together.');
    expect(await style(page, 'app-start-conversation h2', 'font-size')).toBe('40px');
    expect(await style(page, 'app-start-conversation h2', 'line-height')).toBe('48px');
    expect(await style(page, 'app-start-conversation h2', 'font-weight')).toBe('600');
    expect(await style(page, 'app-start-conversation h2', 'color')).toBe('rgb(11, 19, 36)');

    const lead = 'app-start-conversation .start-conversation__lead';
    expect(await style(page, lead, 'font-size')).toBe('18px');
    expect(await style(page, lead, 'line-height')).toBe('30px');
    expect(await style(page, lead, 'color')).toBe('rgb(71, 85, 105)');
  });

  test('renders the three steps as an ordered list with 24px white badges', async ({ page }) => {
    await expect(page.locator('app-start-conversation ol.start-conversation__steps')).toHaveCount(
      1,
    );
    const markers = await boxes(page, 'app-start-conversation .start-conversation__marker');
    expect(markers).toHaveLength(3);
    expect(markers.every((m) => m.w === 24 && m.h === 24)).toBe(true);
    // All three sit on one line, as in the mockup.
    expect(new Set(markers.map((m) => m.y)).size).toBe(1);

    const marker = 'app-start-conversation .start-conversation__marker';
    expect(await style(page, marker, 'background-color')).toBe('rgb(255, 255, 255)');
    expect(await style(page, marker, 'color')).toBe('rgb(15, 85, 232)');
    expect(await style(page, marker, 'font-size')).toBe('13px');
    await expect(page.locator(marker)).toHaveText(['1', '2', '3']);

    for (const [i, label] of STEPS.entries()) {
      await expect(
        page.locator('app-start-conversation .start-conversation__step').nth(i),
      ).toContainText(label);
    }
  });

  test('renders two 48px Material buttons 12px apart with the agreed fills', async ({ page }) => {
    const links = await boxes(page, 'app-start-conversation .start-conversation__actions a');
    expect(links).toHaveLength(2);
    expect(links.every((l) => l.h === 48)).toBe(true);
    expect(links[1].x - (links[0].x + links[0].w)).toBe(12);
    expect(links[0].y).toBe(links[1].y);

    const primary = page.locator('app-start-conversation .start-conversation__actions a').first();
    await expect(primary).toHaveAttribute('href', '/contact');
    await expect(primary).toHaveClass(/mat-mdc-unelevated-button/);
    expect(
      await style(
        page,
        'app-start-conversation .start-conversation__actions a',
        'background-color',
      ),
    ).toBe('rgb(15, 85, 232)');
    const [icon] = await boxes(
      page,
      'app-start-conversation .start-conversation__actions mat-icon',
    );
    expect(icon.w).toBe(18);

    const secondary = page.locator('app-start-conversation .start-conversation__secondary');
    await expect(secondary).toHaveAttribute('href', '/partnerships');
    await expect(secondary).toHaveClass(/mat-mdc-outlined-button/);
    expect(
      await style(
        page,
        'app-start-conversation .start-conversation__secondary',
        'background-color',
      ),
    ).toBe('rgb(255, 255, 255)');
    expect(
      await style(
        page,
        'app-start-conversation .start-conversation__secondary',
        'border-top-color',
      ),
    ).toBe('rgb(203, 213, 225)');
  });

  test('centres the brand mark in two rings that reach the panel edge', async ({ page }) => {
    const [panel] = await boxes(page, 'app-start-conversation .start-conversation');
    const [ring] = await boxes(page, 'app-start-conversation .start-conversation__ring');
    expect(ring.w).toBe(460);
    expect(ring.h).toBe(460);
    // 26px of slack on each side of the 512px art column, which ends at the panel edge.
    expect(panel.x + panel.w - (ring.x + ring.w)).toBe(26);
    // The artwork overflows the 64px block padding by 32px top and bottom, so it sets the
    // panel height, but it never escapes the panel itself.
    expect(ring.y - panel.y).toBe(32);
    expect(panel.y + panel.h - (ring.y + ring.h)).toBe(32);
    expect(await style(page, 'app-start-conversation .start-conversation__ring', 'border-radius')) //
      .not.toBe('0px');
    expect(
      await style(page, 'app-start-conversation .start-conversation__ring', 'border-top-color'),
    ).toBe('rgb(15, 85, 232)');

    const [disc] = await boxes(page, 'app-start-conversation .start-conversation__disc');
    expect(disc.w).toBe(320);
    expect(
      await style(page, 'app-start-conversation .start-conversation__disc', 'background-color'),
    ).toBe('rgb(255, 255, 255)');

    const [mark] = await boxes(page, 'app-start-conversation .start-conversation__mark');
    // Concentric: the mark, the disc and the ring share one centre.
    expect(Math.abs(mark.x + mark.w / 2 - (ring.x + ring.w / 2))).toBeLessThanOrEqual(1);
    expect(Math.abs(mark.y + mark.h / 2 - (ring.y + ring.h / 2))).toBeLessThanOrEqual(1);
    // The mark overflows the disc, as in the mockup.
    expect(mark.w).toBeGreaterThan(disc.w);

    await expect(page.locator('app-start-conversation .start-conversation__art')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(page.locator('app-start-conversation .start-conversation__art a')).toHaveCount(0);
    expect(await noOverflow(page)).toBe(true);
  });

  test('navigates to contact and to partnerships', async ({ page }) => {
    await expect(page.locator('app-start-conversation a')).toHaveCount(2);
    await expect(page.locator('app-start-conversation button')).toHaveCount(0);

    await page.locator('app-start-conversation .start-conversation__secondary').click();
    await expect(page).toHaveURL(/\/partnerships$/);

    await page.goBack();
    await page.locator('app-start-conversation .start-conversation__actions a').first().click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('renders the localized copy and prefixed links under a locale', async ({ page }) => {
    await page.goto('/ru');
    await page.locator('app-start-conversation').scrollIntoViewIfNeeded();
    await expect(page.locator('app-start-conversation h2')).toHaveText(
      'Есть сложная техническая задача? Решим её вместе.',
    );
    await expect(page.locator('app-start-conversation .start-conversation__eyebrow')).toHaveText(
      'Начнём разговор',
    );
    await expect(
      page.locator('app-start-conversation .start-conversation__step').first(),
    ).toContainText('Поделитесь контекстом');
    expect(
      await page
        .locator('app-start-conversation a')
        .evaluateAll((els) => els.map((el) => el.getAttribute('href'))),
    ).toEqual(['/ru/contact', '/ru/partnerships']);
  });
});

test.describe('start a conversation at narrower widths', () => {
  for (const width of [840, 390]) {
    test(`stacks into one column at ${width}px with the artwork last`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(page.locator('app-start-conversation .start-conversation__ring')).toBeVisible();

      const [copy] = await boxes(page, 'app-start-conversation .start-conversation__copy');
      const [art] = await boxes(page, 'app-start-conversation .start-conversation__art');
      expect(copy.x).toBe(art.x);
      expect(art.y).toBeGreaterThan(copy.y + copy.h - 1);

      const [panel] = await boxes(page, 'app-start-conversation .start-conversation');
      const [ring] = await boxes(page, 'app-start-conversation .start-conversation__ring');
      expect(ring.x + ring.w).toBeLessThanOrEqual(panel.x + panel.w);
      expect(await noOverflow(page)).toBe(true);
    });
  }

  test('stacks the two buttons full width at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(
      page.locator('app-start-conversation .start-conversation__secondary'),
    ).toBeVisible();
    const links = await boxes(page, 'app-start-conversation .start-conversation__actions a');
    expect(links).toHaveLength(2);
    expect(links[0].x).toBe(links[1].x);
    expect(links[0].w).toBe(links[1].w);
    expect(links[1].y - (links[0].y + links[0].h)).toBe(12);
  });
});
