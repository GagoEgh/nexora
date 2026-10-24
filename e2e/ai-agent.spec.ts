import { expect, test, type Page } from '@playwright/test';

/**
 * AI agents page contract. hero.png fixes the opening band at 1440: the shared page intro on
 * the left, a 520px example-flow card on the right.
 */
const style = (page: Page, selector: string, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

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

const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

/** Authored casing: the uppercase look comes from `text-transform`, not from the content. */
const STEPS = [
  ['Trigger', 'New request arrives by email or form'],
  ['Agent', 'Classify intent and extract key details'],
  ['Tool', 'Look up the account in the CRM'],
  ['Decision', 'Route by type, region and priority'],
  ['Human review', 'Approve the drafted reply when needed'],
  ['Action', 'Assign owner and notify the team'],
] as const;

test.describe('ai agents page at the desktop design width', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/ai_agent');
  });

  test('opens with the shared intro: trail, eyebrow, a single h1 and the lead', async ({
    page,
  }) => {
    const crumbs = page.locator('.page-intro__crumb');
    await expect(crumbs).toHaveText(['Home', 'Services', 'AI Agents & Business Automation']);
    const crumbLinks = page.locator('.page-intro__crumb-link');
    await expect(crumbLinks).toHaveCount(2);
    await expect(crumbLinks.nth(0)).toHaveAttribute('href', '/');
    await expect(crumbLinks.nth(1)).toHaveAttribute('href', '/services');
    await expect(crumbs.nth(2)).toHaveAttribute('aria-current', 'page');

    await expect(page.locator('.page-intro__eyebrow')).toHaveText(
      'Artificial Intelligence · Service 09',
    );
    expect(await style(page, '.page-intro__eyebrow', 'text-transform')).toBe('uppercase');

    const h1 = page.locator('app-ai-agent h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('AI Agents & Business Automation');
    // Same display role the services page uses, inherited from the shared component.
    expect(await style(page, 'app-ai-agent h1', 'font-size')).toBe('50px');
    expect(await style(page, 'app-ai-agent h1', 'line-height')).toBe('60px');
  });

  test('the aside holds a 520px example-flow card', async ({ page }) => {
    const card = await box(page, 'app-workflow .workflow');
    expect(card.w).toBe(520);
    expect(await style(page, 'app-workflow .workflow', 'background-color')).toBe(
      'rgb(255, 255, 255)',
    );

    await expect(page.locator('.workflow__caption')).toHaveText('workflow / inbound-request');
    await expect(page.locator('.workflow__badge')).toHaveText('example flow');
  });

  test('lists six ordered steps, with the agent inverted and the human step tinted', async ({
    page,
  }) => {
    const steps = page.locator('.workflow__step');
    await expect(steps).toHaveCount(6);
    await expect(page.locator('.workflow__label')).toHaveText(STEPS.map(([label]) => label));
    await expect(page.locator('.workflow__detail')).toHaveText(STEPS.map(([, text]) => text));

    // The sequence is readable, not a decorative diagram.
    await expect(page.locator('ol.workflow__steps')).toHaveCount(1);
    await expect(page.locator('app-workflow[aria-hidden="true"]')).toHaveCount(0);

    expect(await style(page, '.workflow__step[data-tone="dark"]', 'background-color')).toBe(
      'rgb(11, 19, 36)',
    );
    expect(await style(page, '.workflow__step[data-tone="accent"]', 'background-color')).toBe(
      'rgb(238, 244, 255)',
    );
    expect(await style(page, '.workflow__label', 'color')).toBe('rgb(15, 85, 232)');
  });

  test('the calls to action reach contact and solutions', async ({ page }) => {
    const actions = page.locator('.ai-agent__actions a');
    await expect(actions).toHaveText(['Discuss this service', 'See related solutions']);
    await expect(actions.nth(0)).toHaveAttribute('href', '/contact');
    await expect(actions.nth(1)).toHaveAttribute('href', '/solutions');
    expect((await box(page, '.ai-agent__actions a')).h).toBe(48);

    await actions.nth(0).click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('the header marks Services as the active section in plain blue, with no pill', async ({
    page,
  }) => {
    const trigger = page.locator('app-header nav button.header__link--active');
    await expect(trigger).toHaveText('Services');
    expect(await style(page, 'app-header .header__link--active', 'background-color')).toBe(
      'rgba(0, 0, 0, 0)',
    );
    expect(await style(page, 'app-header .header__link--active', 'color')).toBe('rgb(15, 85, 232)');
  });
});

test.describe('ai agents overview band', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/ai_agent');
  });

  test('closes the page with an eyebrow, an h2 and two paragraphs', async ({ page }) => {
    const overview = page.locator('app-overview');
    await expect(overview).toHaveCount(1);
    await expect(overview.locator('.overview__eyebrow')).toHaveText('Overview');
    expect(await style(page, '.overview__eyebrow', 'text-transform')).toBe('uppercase');
    await expect(overview.locator('h2.overview__title')).toHaveText(
      'Automation that understands context, not just rules.',
    );
    await expect(page.locator('app-ai-agent h1')).toHaveCount(1);

    // Two paragraphs, the second de-emphasised by colour at the same size.
    await expect(overview.locator('.overview__body')).toHaveCount(1);
    await expect(overview.locator('.overview__note')).toHaveCount(1);
    expect(await style(page, '.overview__body', 'color')).toBe('rgb(11, 19, 36)');
    expect(await style(page, '.overview__note', 'color')).toBe('rgb(71, 85, 105)');
    expect(await style(page, '.overview__body', 'font-size')).toBe(
      await style(page, '.overview__note', 'font-size'),
    );
  });

  test('splits into a narrow heading column and a wider copy column', async ({ page }) => {
    const heading = await box(page, '.overview__heading');
    const copy = await box(page, '.overview__copy');

    expect(heading.x).toBe(80);
    expect(heading.w).toBe(480);
    // The copy column is the wider of the two, unlike the home page section headers.
    expect(copy.w).toBeGreaterThan(heading.w);
    expect(copy.x + copy.w).toBe(1360);
    expect(copy.y).toBe(heading.y);
  });

  test('sits after the hero band', async ({ page }) => {
    const intro = await box(page, 'app-page-intro');
    const overview = await box(page, 'app-overview');
    expect(overview.y).toBeGreaterThanOrEqual(intro.y + intro.h);
  });
});

test.describe('ai agents problems band', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/ai_agent');
  });

  test('ends the page with a header and four cards', async ({ page }) => {
    const problems = page.locator('app-problems');
    await expect(problems).toHaveCount(1);
    await expect(problems.locator('.problems__eyebrow')).toHaveText('Problems we solve');
    await expect(problems.locator('h2.problems__title')).toHaveText(
      'Where manual work slows the business down.',
    );
    await expect(page.locator('app-ai-agent h1')).toHaveCount(1);

    const cards = problems.locator('.problems__card');
    await expect(cards).toHaveCount(4);
    await expect(problems.locator('.problems__card-title')).toHaveText([
      'Data copied by hand',
      'Requests wait in inboxes',
      'Documents in every format',
      'Reporting by hand',
    ]);
    await expect(problems.locator('app-icon-tile[data-tone="neutral"]')).toHaveCount(4);
  });

  test('lays the header and the cards out on the design grid', async ({ page }) => {
    const intro = await box(page, '.problems__intro');
    expect(intro.w).toBe(440);
    expect(intro.x + intro.w).toBe(1360);

    const cards = await boxes(page, '.problems__card');
    expect(cards).toHaveLength(4);
    expect(cards[0].x).toBe(80);
    expect(cards[3].x + cards[3].w).toBe(1360);
    // 1280 container, 20px gaps -> (1280 - 3 * 20) / 4
    for (const card of cards) expect(card.w).toBe(305);
    expect(cards[1].x - (cards[0].x + cards[0].w)).toBe(20);
    // One row: every card shares a top edge.
    for (const card of cards) expect(card.y).toBe(cards[0].y);

    expect(await style(page, '.problems__card', 'border-top-width')).toBe('1px');
    expect(await style(page, '.problems__card', 'background-color')).toBe('rgb(255, 255, 255)');
    expect(await style(page, '.problems__card-text', 'font-size')).toBe('14px');
  });
});

test.describe('ai agents capabilities band', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/ai_agent');
  });

  test('closes the page with two checklist panels', async ({ page }) => {
    const capabilities = page.locator('app-capabilities');
    await expect(capabilities).toHaveCount(1);
    await expect(capabilities.locator('.capabilities__eyebrow')).toHaveText(
      'Capabilities & deliverables',
    );
    await expect(capabilities.locator('h2.capabilities__title')).toHaveText(
      'What we build, and what you receive.',
    );
    await expect(page.locator('app-ai-agent h1')).toHaveCount(1);

    await expect(capabilities.locator('.capabilities__panel')).toHaveCount(2);
    await expect(capabilities.locator('.capabilities__panel-title')).toHaveText([
      'Capabilities',
      'Deliverables',
    ]);
    await expect(
      capabilities.locator('.capabilities__panel[data-tone="neutral"] .capabilities__item'),
    ).toHaveCount(7);
    await expect(
      capabilities.locator('.capabilities__panel[data-tone="accent"] .capabilities__item'),
    ).toHaveCount(6);
  });

  test('matches the panel geometry and fills from the design', async ({ page }) => {
    const panels = await boxes(page, '.capabilities__panel');
    expect(panels).toHaveLength(2);
    expect(panels[0].x).toBe(80);
    expect(panels[1].x + panels[1].w).toBe(1360);
    for (const panel of panels) expect(panel.w).toBe(628);
    expect(panels[1].x - (panels[0].x + panels[0].w)).toBe(24);
    expect(panels[0].y).toBe(panels[1].y);
    expect(panels[0].h).toBe(panels[1].h);

    expect(await style(page, '.capabilities__panel', 'border-top-left-radius')).toBe('24px');
    expect(await style(page, '.capabilities__panel', 'padding-top')).toBe('28px');
    expect(await style(page, '.capabilities__panel', 'padding-left')).toBe('32px');
    expect(await style(page, '.capabilities__panel', 'padding-bottom')).toBe('16px');

    expect(await style(page, '.capabilities__panel[data-tone="neutral"]', 'background-color')).toBe(
      'rgb(246, 248, 251)',
    );
    expect(await style(page, '.capabilities__panel[data-tone="accent"]', 'background-color')).toBe(
      'rgb(238, 244, 255)',
    );
    // The deliverables title is the accent one.
    expect(
      await style(
        page,
        '.capabilities__panel[data-tone="accent"] .capabilities__panel-title',
        'color',
      ),
    ).toBe('rgb(15, 85, 232)');
  });
});

test.describe('ai agents audiences band', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/ai_agent');
  });

  test('closes the page with a numbered project list and an audience chip set', async ({
    page,
  }) => {
    const audiences = page.locator('app-audiences');
    await expect(audiences).toHaveCount(1);
    await expect(audiences.locator('.audiences__eyebrow')).toHaveText([
      'Typical projects',
      "Who it's for",
    ]);
    await expect(audiences.locator('h2.audiences__title')).toHaveText([
      'What these engagements usually look like.',
      'Built for teams that run on repeatable processes.',
    ]);
    await expect(page.locator('app-ai-agent h1')).toHaveCount(1);

    await expect(audiences.locator('.audiences__number')).toHaveText([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
    ]);
    await expect(audiences.locator('.audiences__label').first()).toHaveText(
      'Inbound lead triage and enrichment',
    );

    // The arrows are decoration: the rows must not be interactive.
    await expect(audiences.locator('.audiences__arrow')).toHaveCount(6);
    await expect(audiences.locator('a, button')).toHaveCount(0);

    await expect(audiences.locator('.audiences__chip')).toHaveCount(6);
    await expect(audiences.locator('.audiences__chip').nth(3)).toHaveText(
      'Enterprises with CRM/ERP',
    );
    await expect(audiences.locator('.audiences__chip').nth(3).locator('svg')).toHaveCount(1);
  });

  test('matches the two-column geometry and row rules from the design', async ({ page }) => {
    const columns = await boxes(page, '.audiences__column');
    expect(columns).toHaveLength(2);
    expect(columns[0].x).toBe(80);
    expect(columns[0].w).toBe(696);
    expect(columns[1].w).toBe(520);
    expect(columns[1].x - (columns[0].x + columns[0].w)).toBe(64);
    expect(columns[1].x + columns[1].w).toBe(1360);
    expect(columns[0].y).toBe(columns[1].y);

    // 26/34 heading, which sits off the token scale and is therefore set explicitly.
    expect(await style(page, '.audiences__title', 'font-size')).toBe('26px');
    expect(await style(page, '.audiences__title', 'line-height')).toBe('34px');
    expect(await style(page, '.audiences__title', 'font-weight')).toBe('600');
    expect(await style(page, '.audiences__title', 'letter-spacing')).toBe('-0.5px');
    expect(await style(page, '.audiences__title', 'font-family')).toContain('Inter');

    // Each row carries a single rule, so six rows draw seven lines with no doubling.
    expect(await style(page, '.audiences__row', 'padding-top')).toBe('16px');
    expect(await style(page, '.audiences__row', 'padding-bottom')).toBe('16px');
    expect(await style(page, '.audiences__row', 'border-top-width')).toBe('1px');
    expect(await style(page, '.audiences__row', 'border-bottom-width')).toBe('0px');
    expect(await style(page, '.audiences__row', 'border-top-color')).toBe('rgb(226, 232, 240)');
    expect(await style(page, '.audiences__row', 'column-gap')).toBe('16px');

    const rows = await boxes(page, '.audiences__row');
    expect(rows).toHaveLength(6);
    const pitch = rows[1].y - rows[0].y;
    for (let i = 1; i < rows.length; i += 1) {
      expect(rows[i].y - rows[i - 1].y).toBe(pitch);
      // Rows are flush: the rule between them is shared, never stacked.
      expect(rows[i].y).toBe(rows[i - 1].y + rows[i - 1].h);
    }
    expect(
      await page
        .locator('.audiences__row')
        .last()
        .evaluate((el) => getComputedStyle(el).borderBottomWidth),
    ).toBe('1px');
  });
});

test.describe('ai agents page in other locales', () => {
  test('renders the whole band in Russian and Armenian', async ({ page }) => {
    await page.goto('/ru/services/ai_agent');
    await expect(page.locator('app-ai-agent h1')).toHaveText('AI-агенты и автоматизация бизнеса');
    await expect(page.locator('.page-intro__eyebrow')).toHaveText(
      'Искусственный интеллект · Услуга 09',
    );
    await expect(page.locator('.workflow__label').first()).toHaveText('Триггер');
    await expect(page.locator('.overview__eyebrow')).toHaveText('Обзор');
    await expect(page.locator('.problems__eyebrow')).toHaveText('Задачи, которые мы решаем');
    await expect(page.locator('.capabilities__panel-title')).toHaveText([
      'Возможности',
      'Результаты',
    ]);
    await expect(page.locator('.audiences__eyebrow')).toHaveText([
      'Типичные проекты',
      'Для кого это',
    ]);
    await expect(page.locator('.ai-agent__actions a').nth(1)).toHaveAttribute(
      'href',
      '/ru/solutions',
    );

    await page.goto('/hy/services/ai_agent');
    await expect(page.locator('app-ai-agent h1')).toHaveText(
      'AI գործակալներ և բիզնես ավտոմատացում',
    );
    await expect(page.locator('.page-intro__crumb').nth(1)).toHaveText('Ծառայություններ');
    await expect(page.locator('.overview__eyebrow')).toHaveText('Ակնարկ');
    await expect(page.locator('.problems__card-title').first()).toHaveText(
      'Ձեռքով պատճենվող տվյալներ',
    );
    await expect(page.locator('.capabilities__panel-title').first()).toHaveText(
      'Հնարավորություններ',
    );
    await expect(page.locator('.audiences__eyebrow').first()).toHaveText('Բնորոշ նախագծեր');
    await expect(page.locator('.ai-agent__actions a').nth(0)).toHaveAttribute(
      'href',
      '/hy/contact',
    );
  });
});

test.describe('ai agents page at the mobile width', () => {
  test('stacks the band with the buttons full width and no overflow at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/services/ai_agent');

    expect(await noOverflow(page)).toBe(true);

    const actions = page.locator('.ai-agent__actions a');
    const first = await box(page, '.ai-agent__actions a');
    const second = await actions.nth(1).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { y: Math.round(r.top), w: Math.round(r.width) };
    });
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.h);
    expect(second.w).toBe(first.w);

    // The card drops below the copy rather than sitting beside it.
    const card = await box(page, 'app-workflow .workflow');
    const copy = await box(page, '.page-intro__copy');
    expect(card.y).toBeGreaterThan(copy.y);
    expect(card.w).toBeLessThanOrEqual(390);

    // The overview stacks into one column too.
    const heading = await box(page, '.overview__heading');
    const overviewCopy = await box(page, '.overview__copy');
    expect(overviewCopy.y).toBeGreaterThanOrEqual(heading.y + heading.h);

    // The problem cards collapse to a single column.
    const cards = await boxes(page, '.problems__card');
    expect(cards).toHaveLength(4);
    for (const card of cards) expect(card.w).toBeLessThanOrEqual(390);
    expect(cards[1].y).toBeGreaterThanOrEqual(cards[0].y + cards[0].h);

    // The checklist panels stack as well.
    const panels = await boxes(page, '.capabilities__panel');
    expect(panels).toHaveLength(2);
    for (const panel of panels) expect(panel.w).toBeLessThanOrEqual(390);
    expect(panels[1].y).toBeGreaterThanOrEqual(panels[0].y + panels[0].h);

    // The audiences columns stack and the chips wrap instead of scrolling sideways.
    const columns = await boxes(page, '.audiences__column');
    expect(columns).toHaveLength(2);
    for (const column of columns) expect(column.w).toBeLessThanOrEqual(390);
    expect(columns[1].y).toBeGreaterThanOrEqual(columns[0].y + columns[0].h);

    const chips = await boxes(page, '.audiences__chip');
    expect(chips).toHaveLength(6);
    for (const chip of chips) expect(chip.x + chip.w).toBeLessThanOrEqual(390);
    expect(new Set(chips.map((chip) => chip.y)).size).toBeGreaterThan(1);
  });
});
