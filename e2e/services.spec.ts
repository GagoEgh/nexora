import { expect, test, type Page } from '@playwright/test';

/**
 * Services page contract. Pag.png fixes the header and the category card at 1440, Filter.png
 * fixes the chip bar, and the catalogue below is grouped one section per category so the card
 * can act as in-page navigation.
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

/** Material renders the listbox option as the button inside the chip host. */
const OPTION = 'mat-chip-option [role="option"]';

const CATEGORIES = [
  'Design & Product',
  'Software Engineering',
  'Artificial Intelligence',
  'Infrastructure & Operations',
  'Engineering Partnerships',
];
const COUNTS = ['1', '6', '3', '3', '2'];
const IDS = [
  'services-design-product',
  'services-software-engineering',
  'services-artificial-intelligence',
  'services-infrastructure-operations',
  'services-engineering-partnerships',
];

test.describe('services page at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('.services__categories')).toBeVisible();
  });

  test('runs the header gradient under the shell header', async ({ page }) => {
    await expect(page.locator('app-services')).toHaveAttribute('data-layout', 'immersive');
    expect(await style(page, '.page-intro', 'background-image')).toContain('rgb(238, 244, 255)');
    // The immersive contract pulls the main region up behind the header.
    expect(await style(page, 'app-header', 'border-bottom-width')).toBe('0px');
  });

  test('renders the breadcrumb, eyebrow, one h1 and the lead', async ({ page }) => {
    await expect(page.locator('.page-intro__crumb')).toHaveText(['Home', 'Services']);
    await expect(page.locator('.page-intro__crumb-link')).toHaveAttribute('href', '/');
    await expect(page.locator('.page-intro__crumb').nth(1)).toHaveAttribute('aria-current', 'page');

    await expect(page.locator('.page-intro__eyebrow')).toHaveText('Services');
    expect(await style(page, '.page-intro__eyebrow', 'color')).toBe('rgb(15, 85, 232)');
    expect(await style(page, '.page-intro__eyebrow', 'text-transform')).toBe('uppercase');

    const h1 = page.locator('app-services h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('Fifteen services across the full software lifecycle.');
    // Pag.png solves to 50/60: between display-section (40/48) and display-hero (64/72).
    expect(await style(page, 'app-services h1', 'font-size')).toBe('50px');
    expect(await style(page, 'app-services h1', 'line-height')).toBe('60px');
    expect(await style(page, 'app-services h1', 'color')).toBe('rgb(11, 19, 36)');

    expect(await style(page, '.page-intro__lead', 'font-size')).toBe('18px');
    expect(await style(page, '.page-intro__lead', 'line-height')).toBe('30px');
    expect(await style(page, '.page-intro__lead', 'color')).toBe('rgb(71, 85, 105)');
  });

  test('places the category card on the design grid', async ({ page }) => {
    const [card] = await boxes(page, '.services__categories');
    // Pag.png: a 420px card whose left edge lands at x=940 on the 1280px container.
    expect([card.x, card.w]).toEqual([940, 420]);
    expect(card.h).toBe(318);

    expect(await style(page, '.services__categories', 'background-color')).toBe(
      'rgb(255, 255, 255)',
    );
    expect(await style(page, '.services__categories', 'border-top-color')).toBe(
      'rgb(226, 232, 240)',
    );
    expect(await style(page, '.services__categories', 'border-top-width')).toBe('1px');
    expect(await style(page, '.services__categories', 'padding-top')).toBe('8px');
    expect(await style(page, '.services__categories', 'border-top-left-radius')).toBe('28px');
  });

  test('renders five 60px rows with a 36px tile, a label and a muted count', async ({ page }) => {
    await expect(page.locator('.services__category-label')).toHaveText(CATEGORIES);
    await expect(page.locator('.services__category-count')).toHaveText(COUNTS);

    const rows = await boxes(page, '.services__category');
    expect(rows).toHaveLength(5);
    expect(rows.every((row) => row.h === 60)).toBe(true);
    expect(rows.every((row) => row.w === 402)).toBe(true);
    // A single 60px pitch, exactly as measured in the comp.
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].y - rows[i - 1].y).toBe(60);
    }

    const tiles = await boxes(page, '.services__category app-icon-tile');
    expect(tiles).toHaveLength(5);
    expect(tiles.every((tile) => tile.w === 36 && tile.h === 36)).toBe(true);
    expect(tiles[0].x - rows[0].x).toBe(16);
    expect(await style(page, '.services__category app-icon-tile', 'background-color')).toBe(
      'rgb(238, 244, 255)',
    );

    expect(await style(page, '.services__category-label', 'font-size')).toBe('16px');
    expect(await style(page, '.services__category-label', 'font-weight')).toBe('600');
    expect(await style(page, '.services__category-count', 'color')).toBe('rgb(100, 116, 139)');
  });

  test('matches Filter.png: six 36px chips, 8px apart, all services selected', async ({ page }) => {
    const selected = page.locator('mat-chip-option').first();
    // The selection indicator is the leading checkmark drawn in Filter.png. It animates in and
    // widens the chip, so the row is measured only once it has settled.
    await expect(selected.locator('.mat-mdc-chip-graphic')).toBeVisible();
    await expect.poll(async () => (await selected.boundingBox())?.width).toBeGreaterThan(140);

    const chips = await page
      .locator('mat-chip-option')
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
    expect(chips).toHaveLength(6);
    expect(chips.every((chip) => Math.round(chip.height) === 36)).toBe(true);
    expect(chips[0].left).toBe(80);
    // Label widths are fractional, so the gap is measured before rounding.
    for (let i = 1; i < chips.length; i++) {
      expect(chips[i].left - chips[i - 1].right).toBeCloseTo(8, 1);
    }

    await expect(page.locator(OPTION).first()).toHaveAttribute('aria-selected', 'true');
    await expect(selected).toContainText('All services');
    await expect(selected).toContainText('15');
    // Selected label on-primary-container, unselected on-surface — exactly as in Filter.png.
    expect(await style(page, 'mat-chip-option .mdc-evolution-chip__text-label', 'color')).toBe(
      'rgb(14, 44, 107)',
    );
    expect(
      await page
        .locator('mat-chip-option')
        .nth(1)
        .locator('.mdc-evolution-chip__text-label')
        .evaluate((el) => getComputedStyle(el).color),
    ).toBe('rgb(11, 19, 36)');
    expect(await style(page, '.services__filter', 'border-top-color')).toBe('rgb(226, 232, 240)');
    expect(await style(page, '.services__filter', 'border-top-width')).toBe('1px');
    expect(await style(page, '.services__filter', 'padding-top')).toBe('0px');
    expect(await style(page, '.services__filter-inner', 'padding-top')).toBe('16px');

    await expect(page.locator('select.services__select')).toBeHidden();
  });

  test('lists all fifteen services grouped under the five categories', async ({ page }) => {
    await expect(page.locator('.services__card')).toHaveCount(15);
    await expect(page.locator('.services__group')).toHaveCount(5);
    await expect(page.locator('.services__group-title')).toHaveText(CATEGORIES);
    expect(
      await page.locator('.services__group').evaluateAll((els) => els.map((el) => el.id)),
    ).toEqual(IDS);
    await expect(page.locator('.services__number').first()).toHaveText('01');
    await expect(page.locator('.services__number').last()).toHaveText('15');
  });

  test('Catalog.png: an info column beside a two-up card grid, divided by hairlines', async ({
    page,
  }) => {
    // 340px info column, 64px gutter, cards filling the rest of the 1280px container.
    const [head] = await boxes(page, '.services__group-head');
    expect([head.x, head.w]).toEqual([80, 340]);

    const cards = await boxes(page, '.services__card');
    expect(cards).toHaveLength(15);
    // Paired cards share a 430px column with a 16px gutter; the row gap matches it.
    expect([cards[1].x, cards[1].w]).toEqual([484, 430]);
    expect([cards[2].x, cards[2].w]).toEqual([930, 430]);
    expect(cards[2].x - (cards[1].x + cards[1].w)).toBe(16);
    expect(cards[3].y - (cards[1].y + cards[1].h)).toBe(16);
    // A card alone on its row keeps the reference width rather than stretching.
    for (const i of [0, 9, 12]) {
      expect(cards[i].w).toBe(455);
    }
    expect(cards.every((card) => card.h === cards[1].h)).toBe(true);

    expect(await style(page, '.services__group', 'padding-top')).toBe('64px');
    expect(await style(page, '.services__group + .services__group', 'border-top-width')).toBe(
      '1px',
    );
    expect(await style(page, '.services__group + .services__group', 'border-top-color')).toBe(
      'rgb(226, 232, 240)',
    );
  });

  test('heads every section with a 48px tile, a position, a description and a count', async ({
    page,
  }) => {
    const tiles = await boxes(page, '.services__group-head app-icon-tile');
    expect(tiles).toHaveLength(5);
    expect(tiles.every((tile) => tile.w === 48 && tile.h === 48)).toBe(true);
    // The tile top lines up with the first card of the row.
    const [firstCard] = await boxes(page, '.services__card');
    expect(tiles[0].y).toBe(firstCard.y);

    await expect(page.locator('.services__group-position')).toHaveText([
      '01 / 05',
      '02 / 05',
      '03 / 05',
      '04 / 05',
      '05 / 05',
    ]);
    await expect(page.locator('.services__group-count')).toHaveText([
      '1 service',
      '6 services',
      '3 services',
      '3 services',
      '2 services',
    ]);
    expect(await style(page, '.services__group-count', 'color')).toBe('rgb(15, 85, 232)');
    expect(await style(page, '.services__group-position', 'color')).toBe('rgb(100, 116, 139)');
    expect(await style(page, '.services__group-title', 'font-weight')).toBe('600');
    expect(await style(page, '.services__group-text', 'font-size')).toBe('16px');
  });

  test('marks Artificial Intelligence with the inverse AI accent', async ({ page }) => {
    const tiles = page.locator('.services__group-head app-icon-tile');
    expect(await tiles.evaluateAll((els) => els.map((el) => el.getAttribute('data-tone')))).toEqual(
      ['primary', 'primary', 'inverse-accent', 'primary', 'primary'],
    );

    const accent = '.services__group-head app-icon-tile[data-tone="inverse-accent"]';
    expect(await style(page, accent, 'background-color')).toBe('rgb(6, 11, 23)');
    expect(await style(page, accent, 'color')).toBe('rgb(134, 173, 255)');
    expect(await style(page, '.services__group-head app-icon-tile', 'background-color')).toBe(
      'rgb(238, 244, 255)',
    );
  });

  test('builds each card from a number, an arrow, copy and three tags', async ({ page }) => {
    const card = page.locator('.services__card').first();
    expect(await style(page, '.services__card', 'padding-top')).toBe('24px');
    expect(await style(page, '.services__card', 'background-color')).toBe('rgb(255, 255, 255)');
    expect(await style(page, '.services__card', 'border-top-color')).toBe('rgb(226, 232, 240)');

    await expect(card.locator('.services__number')).toHaveText('01');
    expect(await style(page, '.services__number', 'color')).toBe('rgb(15, 85, 232)');
    await expect(card.locator('.services__card-title')).toHaveText('Web Design & UI/UX Design');
    expect(await style(page, '.services__card-title', 'font-size')).toBe('18px');
    expect(await style(page, '.services__card-summary', 'font-size')).toBe('14px');
    expect(await style(page, '.services__card-summary', 'line-height')).toBe('22px');

    const [arrow] = await boxes(page, '.services__card-arrow');
    expect([arrow.w, arrow.h]).toEqual([32, 32]);
    expect(await style(page, '.services__card-arrow', 'background-color')).toBe(
      'rgb(238, 242, 247)',
    );
    await expect(page.locator('.services__card-arrow').first()).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    // No per-service page exists, so the card carries no link.
    await expect(page.locator('.services__card a, .services__card button')).toHaveCount(0);

    await expect(card.locator('.services__tag')).toHaveText([
      'Wireframes',
      'Prototypes',
      'Design systems',
    ]);
    await expect(page.locator('.services__tag')).toHaveCount(45);
    expect(await style(page, '.services__tag', 'background-color')).toBe('rgb(246, 248, 251)');
    expect(await style(page, '.services__tag', 'border-top-color')).toBe('rgb(226, 232, 240)');
    expect(await style(page, '.services__tag', 'font-size')).toBe('13px');
    expect(await style(page, '.services__tag', 'color')).toBe('rgb(71, 85, 105)');
  });

  test('highlights the category of the section being read', async ({ page }) => {
    const row = (index: number) => page.locator('.services__category').nth(index);
    await expect(row(0)).toHaveAttribute('aria-current', 'true');

    for (const [index, id] of IDS.entries()) {
      await page.locator(`#${id}`).evaluate((el) => el.scrollIntoView());
      await expect(row(index)).toHaveAttribute('aria-current', 'true');
      await expect(page.locator('.services__category[aria-current="true"]')).toHaveCount(1);
    }
    // Scroll position alone never touches the filter or the URL.
    await expect(page).toHaveURL(/\/services$/);
  });

  test('scrolls to a section when its card row is clicked, without changing the URL', async ({
    page,
  }) => {
    await page.locator('.services__category').nth(3).click();
    await expect
      .poll(async () => {
        const [section] = await boxes(page, '#services-infrastructure-operations');
        return section.y;
      })
      .toBeLessThanOrEqual(40);
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('.services__category').nth(3)).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('filters from the chips, through the URL, and back again', async ({ page }) => {
    await page.locator('mat-chip-option', { hasText: 'Artificial Intelligence' }).click();
    await expect(page).toHaveURL(/\?category=artificial-intelligence$/);
    await expect(page.locator('.services__group')).toHaveCount(1);
    await expect(page.locator('.services__card')).toHaveCount(3);
    await expect(page.locator('.services__category').nth(2)).toHaveAttribute(
      'aria-current',
      'true',
    );

    await page.locator('mat-chip-option').first().click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('.services__card')).toHaveCount(15);

    await page.goBack();
    await expect(page).toHaveURL(/\?category=artificial-intelligence$/);
    await expect(page.locator('.services__card')).toHaveCount(3);

    await page.goForward();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('.services__card')).toHaveCount(15);
  });

  test('restores the filter when a link is opened directly', async ({ page }) => {
    await page.goto('/services?category=engineering-partnerships');
    await expect(page.locator('.services__card')).toHaveCount(2);
    await expect(page.locator(OPTION).nth(5)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.services__group-title')).toHaveText('Engineering Partnerships');
    await expect(page.locator('.services__group-position')).toHaveText('05 / 05');
    await expect(page.locator('.services__group-count')).toHaveText('2 services');
  });

  test('ignores an unknown category and shows everything', async ({ page }) => {
    await page.goto('/services?category=nope');
    await expect(page.locator('.services__card')).toHaveCount(15);
    await expect(page.locator(OPTION).first()).toHaveAttribute('aria-selected', 'true');
  });

  test('keeps the locale prefix and localizes the whole page', async ({ page }) => {
    await page.goto('/ru/services?category=design-product');
    await expect(page.locator('app-services h1')).toHaveText(
      'Пятнадцать услуг на всём жизненном цикле программного обеспечения.',
    );
    await expect(page.locator('.page-intro__crumb-link')).toHaveAttribute('href', '/ru');
    await expect(page.locator('.services__card')).toHaveCount(1);

    await page.locator('mat-chip-option').first().click();
    await expect(page).toHaveURL(/\/ru\/services$/);
    await expect(page.locator('.services__card')).toHaveCount(15);
  });

  test('moves through the chips with the keyboard', async ({ page }) => {
    await page.locator(OPTION).first().focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\?category=design-product$/);
    await expect(page.locator('.services__card')).toHaveCount(1);
  });

  test('lays out without horizontal overflow', async ({ page }) => {
    expect(await noOverflow(page)).toBe(true);
  });
});

test.describe('services page below the chip breakpoint', () => {
  for (const width of [1199, 840, 390]) {
    test(`swaps the chips for a select at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/services');
      await expect(page.locator('select.services__select')).toBeVisible();
      await expect(page.locator('mat-chip-listbox')).toBeHidden();

      const select = page.locator('select.services__select');
      await expect(select.locator('option')).toHaveCount(6);
      await expect(select).toHaveValue('all');

      await select.selectOption('software-engineering');
      await expect(page).toHaveURL(/\?category=software-engineering$/);
      await expect(page.locator('.services__card')).toHaveCount(6);
      await expect(select).toHaveValue('software-engineering');

      expect(await noOverflow(page)).toBe(true);
    });
  }

  test('stacks the header and keeps the card full width at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/services');
    await expect(page.locator('.services__categories')).toBeVisible();

    const [copy] = await boxes(page, '.page-intro__copy');
    const [card] = await boxes(page, '.services__categories');
    expect(copy.x).toBe(card.x);
    expect(card.y).toBeGreaterThan(copy.y + copy.h - 1);
    expect(await noOverflow(page)).toBe(true);
  });
});
