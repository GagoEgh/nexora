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

test.describe('about philosophy section at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 1400 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('.philosophy__card')).toHaveCount(4);
  });

  test('sits below the intro band and spans the container', async ({ page }) => {
    const intro = await box(page, 'app-page-intro');
    const section = await box(page, '.philosophy');
    expect(section.y).toBeGreaterThan(intro.y + intro.h - 1);
    expect(section.x).toBe(80);
    expect(section.w).toBe(1280);
  });

  test('lays the header out as two columns with the measured origin', async ({ page }) => {
    const heading = await box(page, '.philosophy__heading');
    const intro = await box(page, '.philosophy__intro');
    expect(heading.y).toBe(intro.y);
    // philosophy.png puts the right column at x=657 and runs it to the container edge.
    expect(intro.x).toBe(657);
    expect(intro.x + intro.w).toBe(1360);

    await expect(page.locator('h2.philosophy__title')).toHaveText(
      'Good software is mostly good decisions.',
    );
    expect(await style(page, '.philosophy__title', 'font-size')).toBe('32px');
    expect(await style(page, '.philosophy__title', 'line-height')).toBe('40px');
    expect(await style(page, '.philosophy__text', 'font-size')).toBe('18px');
    expect(await style(page, '.philosophy__text', 'line-height')).toBe('30px');
  });

  test('places four 305px cards on a 20px gutter across the container', async ({ page }) => {
    const cards = await boxes(page, '.philosophy__card');
    expect(cards).toHaveLength(4);

    // 4 x 305 + 3 x 20 lands exactly on the 1280px container.
    for (const card of cards) expect(card.w).toBe(305);
    for (let i = 1; i < cards.length; i++) {
      expect(cards[i].x - (cards[i - 1].x + cards[i - 1].w)).toBe(20);
    }
    expect(cards[0].x).toBe(80);
    expect(cards[3].x + cards[3].w).toBe(1360);

    // The grid stretches every card to the tallest.
    const heights = new Set(cards.map((c) => c.h));
    expect(heights.size).toBe(1);
    expect(cards[0].y).toBe(cards[3].y);
  });

  test('matches the card chrome and internals from the design', async ({ page }) => {
    expect(await style(page, '.philosophy__card', 'background-color')).toBe('rgb(246, 248, 251)');
    expect(await style(page, '.philosophy__card', 'padding-left')).toBe('28px');

    const card = await box(page, '.philosophy__card');
    const tile = await box(page, '.philosophy__card app-icon-tile');
    expect(tile.w).toBe(48);
    expect(tile.h).toBe(48);
    expect(tile.x - card.x).toBe(28);
    expect(tile.y - card.y).toBe(28);
    expect(await style(page, '.philosophy__card app-icon-tile', 'background-color')).toBe(
      'rgb(238, 244, 255)',
    );

    await expect(page.locator('.philosophy__number')).toHaveText(['01', '02', '03', '04']);
    expect(await style(page, '.philosophy__card-title', 'font-size')).toBe('18px');
    expect(await style(page, '.philosophy__card-title', 'line-height')).toBe('26px');
    expect(await style(page, '.philosophy__card-text', 'font-size')).toBe('14px');
    expect(await style(page, '.philosophy__card-text', 'line-height')).toBe('22px');
  });

  test('keeps the four principles in the order the design shows', async ({ page }) => {
    await expect(page.locator('.philosophy__card-title')).toHaveText([
      'Understand before building',
      'Architecture is a business decision',
      'Quality is designed in',
      'Leave systems better',
    ]);
  });
});

test.describe('about philosophy responsiveness', () => {
  for (const [width, columns] of [
    [320, 1],
    [375, 1],
    [768, 2],
    [1024, 2],
    [1199, 2],
    [1200, 4],
    [1920, 4],
  ] as const) {
    test(`stacks the cards into ${columns} column(s) at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1400 });
      await page.goto('/about');
      await expect(page.locator('.philosophy__card')).toHaveCount(4);

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);

      const cards = await boxes(page, '.philosophy__card');
      expect(new Set(cards.map((c) => c.x)).size).toBe(columns);
    });
  }

  for (const locale of ['hy', 'ru']) {
    test(`does not clip ${locale} philosophy copy at 320px or 1440px`, async ({ page }) => {
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 1400 });
        await page.goto(`/${locale}/about`);
        await expect(page.locator('.philosophy__card')).toHaveCount(4);

        expect(await noOverflow(page)).toBeLessThanOrEqual(0);

        const clipped = await page.evaluate(
          () =>
            [
              ...document.querySelectorAll(
                '.philosophy__title,.philosophy__text,.philosophy__card-title,.philosophy__card-text',
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

test.describe('about senior model section at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 1600 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('.senior__panel')).toHaveCount(2);
  });

  test('sits last on the page and splits into the measured two columns', async ({ page }) => {
    const philosophy = await box(page, '.philosophy');
    const section = await box(page, '.senior');
    expect(section.y).toBeGreaterThan(philosophy.y + philosophy.h - 1);
    expect(section.x).toBe(80);
    expect(section.w).toBe(1280);

    // Senior.png: copy column 513, gap 64, models column 703 ending on the container edge.
    const copy = await box(page, '.senior__copy');
    const models = await box(page, '.senior__models');
    expect(copy.w).toBe(513);
    expect(models.x).toBe(657);
    expect(models.x + models.w).toBe(1360);
  });

  test('places two equal panels 20px apart', async ({ page }) => {
    const panels = await boxes(page, '.senior__panel');
    expect(panels).toHaveLength(2);
    expect(panels[1].x - (panels[0].x + panels[0].w)).toBe(20);
    expect(panels[0].w).toBe(panels[1].w);
    expect(panels[0].h).toBe(panels[1].h);
    expect(panels[0].x).toBe(657);
    expect(panels[1].x + panels[1].w).toBe(1360);
  });

  test('uses the inverse palette for the Nexora panel and a bordered surface for the pyramid', async ({
    page,
  }) => {
    const plain = '.senior__panel[data-tone="plain"]';
    const inverse = '.senior__panel[data-tone="inverse"]';

    expect(await style(page, plain, 'background-color')).toBe('rgb(255, 255, 255)');
    expect(await style(page, plain, 'border-top-color')).toBe('rgb(226, 232, 240)');
    // navy-950 / blue-300 / slate-400 from the project palette.
    expect(await style(page, inverse, 'background-color')).toBe('rgb(6, 11, 23)');
    expect(await style(page, `${inverse} .senior__panel-label`, 'color')).toBe(
      'rgb(134, 173, 255)',
    );
    expect(await style(page, `${inverse} .senior__key`, 'color')).toBe('rgb(148, 163, 184)');
    expect(await style(page, `${inverse} .senior__block`, 'background-color')).toBe(
      'rgb(134, 173, 255)',
    );
  });

  test('draws 1/2/3/5 with one highlighted apex and a 3x2 Nexora grid', async ({ page }) => {
    const rows = (selector: string) =>
      page
        .locator(selector)
        .evaluateAll((els) => els.map((el) => el.querySelectorAll('.senior__block').length));

    expect(await rows('.senior__panel[data-tone="plain"] .senior__row')).toEqual([1, 2, 3, 5]);
    expect(await rows('.senior__panel[data-tone="inverse"] .senior__row')).toEqual([3, 3]);

    await expect(page.locator('.senior__block--apex')).toHaveCount(1);
    expect(await style(page, '.senior__block--apex', 'background-color')).toBe('rgb(15, 85, 232)');
    expect(
      await style(page, '.senior__panel[data-tone="plain"] .senior__block', 'background-color'),
    ).toBe('rgb(226, 232, 240)');

    // Blocks measured 29-30px on a 38px pitch.
    const blocks = await boxes(
      page,
      '.senior__panel[data-tone="inverse"] .senior__row:first-child .senior__block',
    );
    expect(blocks).toHaveLength(3);
    for (const block of blocks) expect(block.w).toBe(30);
    expect(blocks[1].x - blocks[0].x).toBe(38);
  });

  test('lists three points with 22px badges beside them', async ({ page }) => {
    await expect(page.locator('.senior__point')).toHaveCount(3);
    const badge = await box(page, '.senior__badge');
    expect(badge.w).toBe(22);
    expect(badge.h).toBe(22);
    expect(await style(page, '.senior__badge', 'background-color')).toBe('rgb(238, 244, 255)');
    expect(await style(page, '.senior__point-text', 'font-size')).toBe('16px');
  });
});

test.describe('about senior model responsiveness', () => {
  for (const width of [320, 375, 768, 1024, 1199, 1200, 1920]) {
    test(`fits ${width}px without horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1600 });
      await page.goto('/about');
      await expect(page.locator('.senior__panel')).toHaveCount(2);

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);

      const panels = await boxes(page, '.senior__panel');
      // Panels sit side by side from `medium` up and stack below it.
      if (width >= 600) {
        expect(panels[0].y).toBe(panels[1].y);
      } else {
        expect(panels[1].y).toBeGreaterThan(panels[0].y);
      }
    });
  }

  for (const locale of ['hy', 'ru']) {
    test(`does not clip ${locale} senior model copy at 320px or 1440px`, async ({ page }) => {
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 1600 });
        await page.goto(`/${locale}/about`);
        await expect(page.locator('.senior__panel')).toHaveCount(2);

        expect(await noOverflow(page)).toBeLessThanOrEqual(0);

        const clipped = await page.evaluate(
          () =>
            [
              ...document.querySelectorAll(
                '.senior__title,.senior__lead,.senior__point-text,.senior__panel-label,.senior__key',
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

test.describe('about business flow at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 2200 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('.flow__step')).toHaveCount(5);
  });

  test('sits last on the page with the measured two-column header', async ({ page }) => {
    const senior = await box(page, '.senior');
    const section = await box(page, '.flow');
    expect(section.y).toBeGreaterThan(senior.y + senior.h - 1);
    expect(section.x).toBe(80);
    expect(section.w).toBe(1280);

    const heading = await box(page, '.flow__heading');
    const intro = await box(page, '.flow__intro');
    expect(heading.w).toBe(513);
    expect(intro.x).toBe(657);
    expect(intro.x + intro.w).toBe(1360);

    expect(await style(page, '.flow__title', 'font-size')).toBe('32px');
    expect(await style(page, '.flow__title', 'line-height')).toBe('40px');
    expect(await style(page, '.flow__intro', 'font-size')).toBe('18px');
  });

  test('lays five equal cards across the container on the grid gutter', async ({ page }) => {
    const steps = await boxes(page, '.flow__step');
    expect(steps).toHaveLength(5);

    for (const step of steps) expect(step.w).toBe(230);
    expect(steps[0].x).toBe(80);
    expect(steps[4].x + steps[4].w).toBe(1360);
    expect(new Set(steps.map((s) => s.h)).size).toBe(1);

    // 32px grid gutter; sub-pixel track widths round to 32 or 33.
    for (let i = 1; i < steps.length; i++) {
      const gutter = steps[i].x - (steps[i - 1].x + steps[i - 1].w);
      expect(gutter).toBeGreaterThanOrEqual(32);
      expect(gutter).toBeLessThanOrEqual(33);
    }
  });

  test('centres a connector in each gutter, on the card mid-line', async ({ page }) => {
    const steps = await boxes(page, '.flow__step');
    const arrows = await boxes(page, '.flow__arrow');
    expect(arrows).toHaveLength(4);

    arrows.forEach((arrow, i) => {
      const gutterMid = (steps[i].x + steps[i].w + steps[i + 1].x) / 2;
      expect(Math.abs(arrow.x + arrow.w / 2 - gutterMid)).toBeLessThanOrEqual(1);
      const cardMid = steps[i + 1].y + steps[i + 1].h / 2;
      expect(Math.abs(arrow.y + arrow.h / 2 - cardMid)).toBeLessThanOrEqual(1);
    });

    expect(await style(page, '.flow__arrow', 'color')).toBe('rgb(100, 116, 139)');
  });

  test('accents the first step and tints the rest', async ({ page }) => {
    const accent = '.flow__step[data-tone="accent"]';
    const plain = '.flow__step[data-tone="plain"]';

    await expect(page.locator(accent)).toHaveCount(1);
    await expect(page.locator(plain)).toHaveCount(4);

    expect(await style(page, accent, 'background-color')).toBe('rgb(15, 85, 232)');
    expect(await style(page, `${accent} .flow__step-title`, 'color')).toBe('rgb(255, 255, 255)');
    expect(await style(page, `${accent} .flow__icon`, 'color')).toBe('rgb(255, 255, 255)');

    expect(await style(page, plain, 'background-color')).toBe('rgb(246, 248, 251)');
    expect(await style(page, `${plain} .flow__step-title`, 'color')).toBe('rgb(11, 19, 36)');
    expect(await style(page, `${plain} .flow__step-text`, 'color')).toBe('rgb(71, 85, 105)');
    expect(await style(page, `${plain} .flow__icon`, 'color')).toBe('rgb(15, 85, 232)');
  });

  test('matches the card chrome and type from the design', async ({ page }) => {
    expect(await style(page, '.flow__step', 'border-top-left-radius')).toBe('16px');
    expect(await style(page, '.flow__step', 'padding-top')).toBe('24px');
    expect(await style(page, '.flow__step', 'padding-left')).toBe('20px');

    const icon = await box(page, '.flow__icon');
    expect(icon.w).toBe(20);
    expect(icon.h).toBe(20);

    // Measured from Business.png: 16px semibold titles over 14/22 body text.
    expect(await style(page, '.flow__step-title', 'font-size')).toBe('16px');
    expect(await style(page, '.flow__step-title', 'font-weight')).toBe('600');
    expect(await style(page, '.flow__step-text', 'font-size')).toBe('14px');
    expect(await style(page, '.flow__step-text', 'line-height')).toBe('22px');

    await expect(page.locator('.flow__step-title')).toHaveText([
      'Business goal',
      'Constraints',
      'Architecture',
      'Delivery',
      'Evolution',
    ]);
  });
});

test.describe('about business flow responsiveness', () => {
  for (const [width, columns, arrows] of [
    [320, 1, 0],
    [375, 1, 0],
    [768, 2, 0],
    [1024, 2, 0],
    [1199, 2, 0],
    [1200, 5, 4],
    [1920, 5, 4],
  ] as const) {
    test(`shows ${columns} column(s) and ${arrows} connectors at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 2200 });
      await page.goto('/about');
      await expect(page.locator('.flow__step')).toHaveCount(5);

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);

      const steps = await boxes(page, '.flow__step');
      expect(new Set(steps.map((s) => s.x)).size).toBe(columns);

      // Connectors only read as connectors while the steps sit in one row.
      const shown = await page
        .locator('.flow__arrow')
        .evaluateAll((els) => els.filter((el) => getComputedStyle(el).display !== 'none').length);
      expect(shown).toBe(arrows);
    });
  }

  for (const locale of ['hy', 'ru']) {
    test(`does not clip ${locale} business flow copy at 320px or 1440px`, async ({ page }) => {
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 2200 });
        await page.goto(`/${locale}/about`);
        await expect(page.locator('.flow__step')).toHaveCount(5);

        expect(await noOverflow(page)).toBeLessThanOrEqual(0);

        const clipped = await page.evaluate(
          () =>
            [
              ...document.querySelectorAll(
                '.flow__title,.flow__intro,.flow__step-title,.flow__step-text',
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

test.describe('about quality and capability panels at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 2600 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('.quality__panel')).toHaveCount(2);
  });

  test('sits last on the page as two 628px panels 24px apart', async ({ page }) => {
    const flow = await box(page, '.flow');
    const section = await box(page, '.quality');
    expect(section.y).toBeGreaterThan(flow.y + flow.h - 1);
    expect(section.x).toBe(80);
    expect(section.w).toBe(1280);

    const panels = await boxes(page, '.quality__panel');
    expect(panels).toHaveLength(2);
    for (const panel of panels) expect(panel.w).toBe(628);
    expect(panels[1].x - (panels[0].x + panels[0].w)).toBe(24);
    expect(panels[0].x).toBe(80);
    expect(panels[1].x + panels[1].w).toBe(1360);

    // Quality.png shows the panels top-aligned with independent heights.
    expect(panels[0].y).toBe(panels[1].y);
    expect(panels[0].h).not.toBe(panels[1].h);
  });

  test('gives each panel its own tone, radius and padding', async ({ page }) => {
    const plain = '.quality__panel[data-tone="plain"]';
    const accent = '.quality__panel[data-tone="accent"]';

    expect(await style(page, plain, 'background-color')).toBe('rgb(255, 255, 255)');
    expect(await style(page, plain, 'border-top-color')).toBe('rgb(226, 232, 240)');
    // blue-50 / blue-900 from the project palette.
    expect(await style(page, accent, 'background-color')).toBe('rgb(238, 244, 255)');
    expect(await style(page, `${accent} .quality__chip-label`, 'color')).toBe('rgb(14, 44, 107)');

    expect(await style(page, plain, 'border-top-left-radius')).toBe('24px');
    expect(await style(page, plain, 'padding-top')).toBe('40px');
    expect(await style(page, '.quality__title', 'font-size')).toBe('26px');
    expect(await style(page, '.quality__title', 'line-height')).toBe('34px');
  });

  test('renders six practice chips and ten discipline chips at the measured sizes', async ({
    page,
  }) => {
    const plain = '.quality__panel[data-tone="plain"]';
    const accent = '.quality__panel[data-tone="accent"]';

    await expect(page.locator(`${plain} .quality__chip`)).toHaveCount(6);
    await expect(page.locator(`${accent} .quality__chip`)).toHaveCount(10);

    const practice = await box(page, `${plain} .quality__chip`);
    const discipline = await box(page, `${accent} .quality__chip`);
    expect(practice.h).toBe(40);
    expect(discipline.h).toBe(36);

    expect(await style(page, `${plain} .quality__chip`, 'border-top-left-radius')).toBe('12px');
    expect(await style(page, `${plain} .quality__chip`, 'background-color')).toBe(
      'rgb(246, 248, 251)',
    );
    expect(await style(page, `${accent} .quality__chip`, 'background-color')).toBe(
      'rgb(255, 255, 255)',
    );
    // A pill: the radius resolves far larger than half the height.
    expect(
      parseInt(await style(page, `${accent} .quality__chip`, 'border-top-left-radius'), 10),
    ).toBeGreaterThan(discipline.h);

    const icon = await box(page, '.quality__chip-icon');
    expect(icon.w).toBe(16);
    expect(await style(page, '.quality__chip-icon', 'color')).toBe('rgb(15, 85, 232)');
    // Only the practices panel carries icons.
    await expect(page.locator(`${accent} .quality__chip-icon`)).toHaveCount(0);
  });

  test('keeps both chip lists in the order the design shows', async ({ page }) => {
    await expect(
      page.locator('.quality__panel[data-tone="plain"] .quality__chip-label'),
    ).toHaveText([
      'Architecture reviews',
      'Code review on every change',
      'Automated testing',
      'Living documentation',
      'Security by default',
      'Observability',
    ]);
    await expect(
      page.locator('.quality__panel[data-tone="accent"] .quality__chip-label'),
    ).toHaveText([
      'UI/UX design',
      'Frontend',
      'Backend & APIs',
      'Mobile',
      'AI engineering',
      'Cloud & DevOps',
      'QA',
      'Solution architecture',
      'Technical leadership',
      'Maintenance',
    ]);
  });
});

test.describe('about quality and capability responsiveness', () => {
  for (const width of [320, 375, 768, 1024, 1199, 1200, 1920]) {
    test(`fits ${width}px without horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 2600 });
      await page.goto('/about');
      await expect(page.locator('.quality__chip')).toHaveCount(16);

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);

      const panels = await boxes(page, '.quality__panel');
      // Side by side from `large` up, stacked below.
      if (width >= 1200) {
        expect(panels[0].y).toBe(panels[1].y);
      } else {
        expect(panels[1].y).toBeGreaterThan(panels[0].y);
      }
    });
  }

  for (const locale of ['hy', 'ru']) {
    test(`does not clip ${locale} capability copy at 320px or 1440px`, async ({ page }) => {
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 2600 });
        await page.goto(`/${locale}/about`);
        await expect(page.locator('.quality__chip')).toHaveCount(16);

        expect(await noOverflow(page)).toBeLessThanOrEqual(0);

        const clipped = await page.evaluate(
          () =>
            [
              ...document.querySelectorAll('.quality__title,.quality__note,.quality__chip-label'),
            ].filter(
              (el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1,
            ).length,
        );
        expect(clipped, `${locale} at ${width}`).toBe(0);
      }
    });
  }
});

test.describe('about long-term band at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 3200 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('.long-term')).toHaveCount(1);
  });

  test('closes the page as a full-bleed dark band', async ({ page }) => {
    const quality = await box(page, '.quality');
    const host = await box(page, 'app-long-term');
    const inner = await box(page, '.long-term');

    expect(host.y).toBeGreaterThan(quality.y + quality.h - 1);
    // The band runs edge to edge; only its contents are contained.
    expect(host.x).toBe(0);
    expect(host.w).toBe(1440);
    expect(inner.x).toBe(80);
    expect(inner.w).toBe(1280);

    expect(await style(page, 'app-long-term', 'background-color')).toBe('rgb(6, 11, 23)');
  });

  test('uses the inverse palette throughout', async ({ page }) => {
    // navy-950 ground with blue-300 / slate-50 / slate-400 on top.
    expect(await style(page, '.long-term__eyebrow', 'color')).toBe('rgb(134, 173, 255)');
    expect(await style(page, '.long-term__title', 'color')).toBe('rgb(246, 248, 251)');
    expect(await style(page, '.long-term__text', 'color')).toBe('rgb(148, 163, 184)');
  });

  test('splits into a heading column and a 440px copy column', async ({ page }) => {
    const heading = await box(page, '.long-term__heading');
    const copy = await box(page, '.long-term__copy');
    expect(heading.y).toBe(copy.y);
    expect(copy.x).toBe(920);
    expect(copy.w).toBe(440);
    expect(copy.x + copy.w).toBe(1360);

    expect(await style(page, '.long-term__title', 'font-size')).toBe('40px');
    expect(await style(page, '.long-term__title', 'line-height')).toBe('48px');
    expect(await style(page, '.long-term__text', 'font-size')).toBe('18px');
    expect(await style(page, '.long-term__text', 'line-height')).toBe('30px');
    await expect(page.locator('.long-term__text')).toHaveCount(2);
  });

  test('breaks the heading after "be", as the design does', async ({ page }) => {
    const lines = await page.locator('.long-term__title').evaluate((el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      return [...r.getClientRects()].length;
    });
    expect(lines).toBe(2);
  });
});

test.describe('about long-term responsiveness', () => {
  for (const width of [320, 375, 768, 1024, 1199, 1200, 1920]) {
    test(`stays full bleed and fits ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 3200 });
      await page.goto('/about');
      await expect(page.locator('.long-term')).toHaveCount(1);

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);

      const host = await box(page, 'app-long-term');
      expect(host.w).toBe(width);

      const heading = await box(page, '.long-term__heading');
      const copy = await box(page, '.long-term__copy');
      if (width >= 1200) {
        expect(heading.y).toBe(copy.y);
      } else {
        expect(copy.y).toBeGreaterThan(heading.y);
      }
    });
  }

  for (const locale of ['hy', 'ru']) {
    test(`does not clip ${locale} long-term copy at 320px or 1440px`, async ({ page }) => {
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 3200 });
        await page.goto(`/${locale}/about`);
        await expect(page.locator('.long-term')).toHaveCount(1);

        expect(await noOverflow(page)).toBeLessThanOrEqual(0);

        const clipped = await page.evaluate(
          () =>
            [...document.querySelectorAll('.long-term__title,.long-term__text')].filter(
              (el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1,
            ).length,
        );
        expect(clipped, `${locale} at ${width}`).toBe(0);
      }
    });
  }
});

test.describe('about markets at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 3600 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('.markets__panel')).toHaveCount(2);
  });

  test('closes the page as two 628px panels 24px apart', async ({ page }) => {
    const longTerm = await box(page, '.long-term');
    const list = await box(page, '.markets');
    expect(list.y).toBeGreaterThan(longTerm.y + longTerm.h - 1);
    expect(list.x).toBe(80);
    expect(list.w).toBe(1280);

    const panels = await boxes(page, '.markets__panel');
    for (const panel of panels) expect(panel.w).toBe(628);
    expect(panels[1].x - (panels[0].x + panels[0].w)).toBe(24);
    expect(panels[0].x).toBe(80);
    expect(panels[1].x + panels[1].w).toBe(1360);
    expect(panels[0].h).toBe(panels[1].h);
  });

  test('matches the panel chrome from the design', async ({ page }) => {
    expect(await style(page, '.markets__panel', 'background-color')).toBe('rgb(255, 255, 255)');
    expect(await style(page, '.markets__panel', 'border-top-color')).toBe('rgb(226, 232, 240)');
    expect(await style(page, '.markets__panel', 'border-top-left-radius')).toBe('24px');
    expect(await style(page, '.markets__panel', 'padding-top')).toBe('36px');
  });

  test('uses a primary tile and a secondary tile, both 48px', async ({ page }) => {
    const tiles = await boxes(page, '.markets__panel app-icon-tile');
    expect(tiles).toHaveLength(2);
    for (const tile of tiles) {
      expect(tile.w).toBe(48);
      expect(tile.h).toBe(48);
    }

    const panels = await boxes(page, '.markets__panel');
    tiles.forEach((tile, i) => {
      expect(tile.x - panels[i].x).toBe(37);
      expect(tile.y - panels[i].y).toBe(37);
    });

    // blue-50 / cyan-50 containers from the project palette.
    expect(
      await style(page, '.markets__panel app-icon-tile[data-tone="primary"]', 'background-color'),
    ).toBe('rgb(238, 244, 255)');
    expect(
      await style(page, '.markets__panel app-icon-tile[data-tone="secondary"]', 'background-color'),
    ).toBe('rgb(232, 248, 254)');
  });

  test('sets the market titles and body copy from the design', async ({ page }) => {
    await expect(page.locator('.markets__title')).toHaveText(['Armenia', 'International markets']);
    expect(await style(page, '.markets__title', 'font-size')).toBe('22px');
    expect(await style(page, '.markets__title', 'font-weight')).toBe('600');
    expect(await style(page, '.markets__title', 'color')).toBe('rgb(11, 19, 36)');
    expect(await style(page, '.markets__text', 'font-size')).toBe('16px');
    expect(await style(page, '.markets__text', 'line-height')).toBe('26px');
    expect(await style(page, '.markets__text', 'color')).toBe('rgb(71, 85, 105)');
  });
});

test.describe('about markets responsiveness', () => {
  for (const width of [320, 375, 768, 1024, 1199, 1200, 1920]) {
    test(`fits ${width}px without horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 3600 });
      await page.goto('/about');
      await expect(page.locator('.markets__panel')).toHaveCount(2);

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);

      const panels = await boxes(page, '.markets__panel');
      if (width >= 1200) {
        expect(panels[0].y).toBe(panels[1].y);
      } else {
        expect(panels[1].y).toBeGreaterThan(panels[0].y);
      }
    });
  }

  for (const locale of ['hy', 'ru']) {
    test(`does not clip ${locale} market copy at 320px or 1440px`, async ({ page }) => {
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 3600 });
        await page.goto(`/${locale}/about`);
        await expect(page.locator('.markets__panel')).toHaveCount(2);

        expect(await noOverflow(page)).toBeLessThanOrEqual(0);

        const clipped = await page.evaluate(
          () =>
            [...document.querySelectorAll('.markets__title,.markets__text')].filter(
              (el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1,
            ).length,
        );
        expect(clipped, `${locale} at ${width}`).toBe(0);
      }
    });
  }
});

test.describe('about conversation band at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 4200 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('app-about app-start-conversation')).toHaveCount(1);
  });

  test('closes the page with the compact band in its design geometry', async ({ page }) => {
    const markets = await box(page, '.markets');
    const panel = await box(page, 'app-about .start-conversation');
    expect(panel.y).toBeGreaterThan(markets.y + markets.h - 1);
    expect(panel.x).toBe(80);
    expect(panel.w).toBe(1280);

    // CTA.png: a 380px ring inset 4px inside a 388px panel - the compact variant.
    expect(panel.h).toBe(388);
    const ring = await box(page, 'app-about .start-conversation__ring');
    expect(ring.w).toBe(380);
    expect(ring.h).toBe(380);
    expect(ring.y - panel.y).toBe(4);
    expect(panel.y + panel.h - (ring.y + ring.h)).toBe(4);

    expect(await style(page, 'app-about .start-conversation', 'background-color')).toBe(
      'rgb(238, 244, 255)',
    );
    expect(await style(page, 'app-about .start-conversation', 'border-radius')).toBe('28px');
  });

  test('carries the about copy, no steps, and two working links', async ({ page }) => {
    const band = page.locator('app-about app-start-conversation');
    await expect(band.locator('.start-conversation__eyebrow')).toHaveText(
      'Collaborate with Nexora',
    );
    await expect(band.locator('h2.start-conversation__title')).toHaveText(
      'Let’s talk about working together.',
    );
    await expect(band.locator('.start-conversation__step')).toHaveCount(0);

    const links = band.locator('.start-conversation__actions a');
    await expect(links).toHaveCount(2);
    await expect(links).toHaveText(['Discuss Your Project', 'Engagement models']);
    await expect(links.nth(0)).toHaveAttribute('href', '/contact');
    await expect(links.nth(1)).toHaveAttribute('href', '/partnerships');

    await links.nth(1).click();
    await expect(page).toHaveURL(/\/partnerships$/);
  });
});

test.describe('about conversation band responsiveness', () => {
  for (const width of [320, 375, 768, 1024, 1199, 1200, 1920]) {
    test(`fits ${width}px without horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 4200 });
      await page.goto('/about');
      await expect(page.locator('app-about app-start-conversation')).toHaveCount(1);

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);
      await expect(page.locator('app-about .start-conversation__actions a')).toHaveCount(2);
    });
  }

  for (const locale of ['hy', 'ru']) {
    test(`keeps the ${locale} prefix on both actions and does not clip`, async ({ page }) => {
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 4200 });
        await page.goto(`/${locale}/about`);
        await expect(page.locator('app-about app-start-conversation')).toHaveCount(1);

        expect(await noOverflow(page)).toBeLessThanOrEqual(0);

        const hrefs = await page
          .locator('app-about .start-conversation__actions a')
          .evaluateAll((els) => els.map((el) => el.getAttribute('href')));
        expect(hrefs).toEqual([`/${locale}/contact`, `/${locale}/partnerships`]);

        const clipped = await page.evaluate(
          () =>
            [
              ...document.querySelectorAll(
                'app-about .start-conversation__title, app-about .start-conversation__lead',
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
