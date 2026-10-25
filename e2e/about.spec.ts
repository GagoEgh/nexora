import { expect, test, type Page } from '@playwright/test';

/**
 * About page contract.
 *
 * hero.png fixes the opening band at 1440: the shared page intro on the left and a 440px
 * "Nexora at a glance" card in the aside, bottom-aligned with the lead. The card is a 5-row
 * description list on a 47px rhythm (69px where a value wraps to two lines), its rules inset
 * 28px inside the card fill, values starting 113px after the labels.
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

// textContent, not the CSS-uppercased rendering.
const LABELS = ['Focus', 'Team', 'Markets', 'Clients', 'Engagement'];

test.describe('about at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('app-about-glance .glance')).toHaveCount(1);
  });

  test('opens with the shared intro and its lead in the copy column', async ({ page }) => {
    await expect(page.locator('app-about h1')).toHaveCount(1);
    await expect(page.locator('app-about h1')).toHaveText(
      'A senior engineering partner for businesses that build with technology.',
    );
    await expect(page.locator('.page-intro__eyebrow')).toHaveText('About Nexora');
    await expect(page.locator('.page-intro__crumb')).toHaveText(['Home', 'About']);
    await expect(page.locator('.page-intro__lead')).toContainText(
      'Nexora is a technology development and AI solutions company.',
    );
  });

  test('places a 440px card in the aside, matching the design geometry', async ({ page }) => {
    const card = await box(page, '.glance');
    expect(card.w).toBe(440);
    expect(card.h).toBe(353);
    // The aside is flush with the 1280px container's right edge at 1440.
    expect(card.x + card.w).toBe(1360);

    expect(await style(page, '.glance', 'border-top-left-radius')).toBe('24px');
    expect(await style(page, '.glance', 'background-color')).toBe('rgb(255, 255, 255)');
    expect(await style(page, '.glance', 'border-top-color')).toBe('rgb(226, 232, 240)');
    expect(await style(page, '.glance', 'padding-left')).toBe('28px');
  });

  test('keeps the measured row rhythm: 47px, and 69px where the value wraps', async ({ page }) => {
    const rows = await boxes(page, '.glance__row');
    expect(rows).toHaveLength(5);

    // Rows 1-3 hold one line, rows 4-5 wrap to two.
    expect(rows.slice(0, 3).map((r) => r.h)).toEqual([47, 47, 47]);
    expect(rows.slice(3).map((r) => r.h)).toEqual([69, 69]);

    const card = await box(page, '.glance');
    for (const row of rows) {
      expect(row.x - card.x).toBe(29); // 1px border + 28px padding
      expect(card.x + card.w - (row.x + row.w)).toBe(29);
    }

    const values = await boxes(page, '.glance__value');
    for (const value of values) expect(value.x - card.x).toBe(142);
  });

  test('renders the brand mark, the title and five label/value pairs', async ({ page }) => {
    const mark = page.locator('.glance__mark');
    await expect(mark).toHaveAttribute('src', 'brand/mark.svg');
    await expect(mark).toHaveAttribute('alt', '');

    const title = page.locator('h2.glance__title');
    await expect(title).toHaveText('Nexora at a glance');

    await expect(page.locator('.glance__label')).toHaveText(LABELS);
    await expect(page.locator('.glance__value')).toHaveText([
      'Software engineering & AI solutions',
      'Senior and Senior+ engineers only',
      'Armenia & international',
      'Startups, SMEs, enterprises, software companies, agencies',
      'Projects, dedicated teams, partnership, white-label, support',
    ]);

    // The card names itself through its own heading.
    const id = await title.getAttribute('id');
    await expect(page.locator('.glance')).toHaveAttribute('aria-labelledby', id ?? '');
  });

  test('uses the muted label and on-surface value tones from the design', async ({ page }) => {
    expect(await style(page, '.glance__label', 'color')).toBe('rgb(100, 116, 139)');
    expect(await style(page, '.glance__label', 'text-transform')).toBe('uppercase');
    expect(await style(page, '.glance__value', 'color')).toBe('rgb(11, 19, 36)');
    expect(await style(page, '.glance__value', 'font-size')).toBe('14px');
    expect(await style(page, '.glance__value', 'line-height')).toBe('22px');
  });
});

test.describe('about responsiveness', () => {
  for (const width of [320, 375, 768, 1024, 1199, 1200, 1920]) {
    test(`fits ${width}px without horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/about');
      await expect(page.locator('.glance__row')).toHaveCount(5);

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);

      // The label sits beside the value from `medium` up, and above it below that.
      const label = await box(page, '.glance__label');
      const value = await box(page, '.glance__value');
      if (width >= 600) {
        expect(value.y).toBe(label.y);
      } else {
        expect(value.y).toBeGreaterThan(label.y);
      }
    });
  }

  for (const locale of ['hy', 'ru']) {
    test(`does not clip ${locale} copy at 320px or 1440px`, async ({ page }) => {
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/${locale}/about`);
        await expect(page.locator('.glance__row')).toHaveCount(5);

        expect(await noOverflow(page)).toBeLessThanOrEqual(0);

        const clipped = await page.evaluate(
          () =>
            [
              ...document.querySelectorAll(
                '.glance__title,.glance__label,.glance__value,.page-intro__title,.page-intro__lead',
              ),
            ].filter(
              (el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1,
            ).length,
        );
        expect(clipped, `${locale} at ${width}`).toBe(0);
      }
    });
  }
});
