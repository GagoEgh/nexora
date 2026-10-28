import { expect, test, type Page } from '@playwright/test';
import { contrastRatio, parseCssColor } from './support/contrast';

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

/**
 * Text contrast on the bands that invert their background.
 *
 * The dark workflow step shipped with its label still on `--mat-sys-primary`, which measures
 * 3.08:1 against the inverted background - the sibling `__detail` rule had been re-coloured
 * and the label had not. Both lines are normal-weight text under 24px, so AA is 4.5:1.
 */
test.describe('ai agents contrast on inverted surfaces', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/ai_agent');
  });

  const ratio = async (page: Page, foreground: string, background: string) =>
    contrastRatio(
      parseCssColor(await style(page, foreground, 'color')),
      parseCssColor(await style(page, background, 'background-color')),
    );

  for (const tone of ['dark', 'accent'] as const) {
    test(`the ${tone} workflow step keeps both of its lines readable`, async ({ page }) => {
      const step = `.workflow__step[data-tone='${tone}']`;
      for (const part of ['__label', '__detail'] as const) {
        expect(await ratio(page, `${step} .workflow${part}`, step), `${tone}${part}`) //
          .toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test('the business value cards stay readable on the inverse surface', async ({ page }) => {
    for (const part of ['-title', '-text'] as const) {
      expect(
        await ratio(page, `.business-value__card${part}`, '.business-value__card'),
        part,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

test.describe('ai agents overview band', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/ai_agent');
  });

  test('renders an eyebrow, an h2 and two paragraphs', async ({ page }) => {
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

  test('renders a header and four problem cards', async ({ page }) => {
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

  test('renders two checklist panels', async ({ page }) => {
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

  test('renders a numbered project list and an audience chip set', async ({ page }) => {
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
    await expect(audiences.locator('a.audiences__row')).toHaveCount(6);
    await expect(audiences.locator('button')).toHaveCount(0);

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

/**
 * The project rows are links.
 *
 * They used to carry an arrow and go nowhere. There is no per-example destination to send them
 * to - the catalogue has no entry for "weekly reporting automation" - but the one action that
 * is true of all six is starting a conversation, which is this page's own primary call to
 * action, so the whole row carries it.
 */
/**
 * Hover feedback across the bands. State (ground, depth) applies whatever the motion setting
 * is; movement is gated, so someone who asked for less motion still gets the feedback without
 * anything shifting.
 */
test.describe('ai agents hover feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/ai_agent');
  });

  test('brightens the workflow step under the pointer without moving it', async ({ page }) => {
    const step = page.locator('.workflow__step').first();
    await expect(step).toBeVisible();
    const before = await step.boundingBox();

    await step.hover();
    await expect(step).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect.poll(() => step.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
    // The card lives inside the intro column, so the step must not move.
    expect(await step.boundingBox()).toEqual(before);
  });

  test('lifts the problem card under the pointer', async ({ page }) => {
    const card = page.locator('.problems__card').first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveCSS('box-shadow', 'none');

    await card.hover();
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
  });

  test('raises the accent capabilities panel above the neutral one', async ({ page }) => {
    await page.locator('app-capabilities').scrollIntoViewIfNeeded();
    const accent = ".capabilities__panel[data-tone='accent']";

    // The flat colour is unchanged; the depth is a wash layered over it plus one elevation.
    expect(await style(page, accent, 'background-color')).toBe('rgb(238, 244, 255)');
    expect(await style(page, accent, 'background-image')).toContain('linear-gradient');
    expect(await style(page, accent, 'box-shadow')).not.toBe('none');
    expect(await style(page, ".capabilities__panel[data-tone='neutral']", 'box-shadow')).toBe(
      'none',
    );
  });

  test('builds the audience chips in sequence rather than as one block', async ({ page }) => {
    await page.locator('app-audiences').scrollIntoViewIfNeeded();

    const delays = await page
      .locator('.audiences__chip')
      .evaluateAll((els) => [...new Set(els.map((el) => getComputedStyle(el).transitionDelay))]);
    expect(delays.length).toBeGreaterThan(1);

    // The two column headings are not siblings, so the offset is placed on the column.
    const headings = await page
      .locator('.audiences__heading')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).transitionDelay));
    expect(headings[1]).toBe('0.12s');
  });
});

test.describe('ai agents hover feedback under reduced motion', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });

  test('keeps the feedback and drops the movement', async ({ page }) => {
    await page.goto('/services/ai_agent');
    const card = page.locator('.problems__card').first();
    await card.scrollIntoViewIfNeeded();

    await card.hover();
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
    expect(await card.evaluate((el) => getComputedStyle(el).translate)).toBe('0px');
  });
});

test.describe('ai agents typical project rows', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/ai_agent');
  });

  test('offers the whole row as the target, not just the words', async ({ page }) => {
    const row = page.locator('a.audiences__row').first();
    await expect(row).toBeVisible();
    const [box] = await boxes(page, 'a.audiences__row');
    const [column] = await boxes(page, '.audiences__column');

    expect(box.w).toBe(column.w);
    await expect(row).toHaveAttribute('href', '/contact');
    expect(await style(page, 'a.audiences__row', 'text-decoration-line')).toBe('none');
  });

  /**
   * The tint is state and the nudge is motion, so they are gated differently: the row still
   * answers the pointer when someone has asked for less motion, it just does not move.
   */
  test('tints under the pointer whether or not motion is allowed', async ({ page }) => {
    const row = page.locator('a.audiences__row').nth(1);
    const rest = await style(page, 'a.audiences__row', 'background-color');

    await row.hover();
    await expect
      .poll(() => row.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toBe(rest);
  });

  test('holds the arrow still under reduced motion', async ({ page }) => {
    await page.locator('a.audiences__row').nth(1).hover();
    await page.waitForTimeout(300);

    expect(
      await page
        .locator('a.audiences__row')
        .nth(1)
        .locator('.audiences__arrow')
        .evaluate((el) => getComputedStyle(el).translate),
    ).toBe('none');
  });

  test('is reachable and operable from the keyboard', async ({ page }) => {
    const row = page.locator('a.audiences__row').first();
    await row.focus();

    await expect(row).toBeFocused();
    // The same affordance the pointer gets, plus the global focus ring.
    await expect
      .poll(() => row.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toBe('rgba(0, 0, 0, 0)');

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('keeps the locale prefix', async ({ page }) => {
    await page.goto('/ru/services/ai_agent');
    await expect(page.locator('a.audiences__row').first()).toHaveAttribute('href', '/ru/contact');
  });
});

test.describe('ai agents typical project rows with motion', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });

  test('nudges the arrow under the pointer and puts it back', async ({ page }) => {
    await page.goto('/services/ai_agent');
    const row = page.locator('a.audiences__row').nth(1);
    const arrow = row.locator('.audiences__arrow');

    await row.hover();
    await expect.poll(() => arrow.evaluate((el) => getComputedStyle(el).translate)).toBe('4px');

    await page.mouse.move(0, 0);
    await expect.poll(() => arrow.evaluate((el) => getComputedStyle(el).translate)).toBe('none');
  });
});

test.describe('ai agents business value band', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/ai_agent');
  });

  test('renders four outcome cards', async ({ page }) => {
    const business = page.locator('app-business-value');
    await expect(business).toHaveCount(1);
    await expect(business.locator('.business-value__eyebrow')).toHaveText('Business value');
    await expect(business.locator('h2.business-value__title')).toHaveText(
      'What changes when the routine runs itself.',
    );
    await expect(page.locator('app-ai-agent h1')).toHaveCount(1);

    await expect(business.locator('.business-value__card')).toHaveCount(4);
    await expect(business.locator('.business-value__card-title')).toHaveText([
      'Less manual work',
      'Faster response',
      'Consistent processes',
      'Visibility and control',
    ]);

    // Bare decorative icons rather than app-icon-tile.
    await expect(business.locator('.business-value__icon')).toHaveCount(4);
    await expect(business.locator('app-icon-tile')).toHaveCount(0);
    await expect(business.locator('.business-value__icon svg')).toHaveCount(4);
  });

  test('matches the dark band geometry and palette from the design', async ({ page }) => {
    // The dark band is full-bleed, unlike the contained panel on the home page.
    const band = await box(page, 'app-business-value');
    expect(band.x).toBe(0);
    expect(band.w).toBe(1440);
    expect(band.h).toBe(576);

    const cards = await boxes(page, '.business-value__card');
    expect(cards).toHaveLength(4);
    expect(cards.map((card) => card.x)).toEqual([80, 405, 730, 1055]);
    for (const card of cards) expect(card.w).toBe(305);
    expect(cards[1].x - (cards[0].x + cards[0].w)).toBe(20);
    expect(cards[3].x + cards[3].w).toBe(1360);
    for (const card of cards) expect(card.h).toBe(cards[0].h);

    expect(await style(page, 'app-business-value', 'background-color')).toBe('rgb(6, 11, 23)');
    expect(await style(page, '.business-value__card', 'background-color')).toBe('rgb(26, 37, 64)');
    expect(await style(page, '.business-value__eyebrow', 'color')).toBe('rgb(134, 173, 255)');
    expect(await style(page, '.business-value__title', 'color')).toBe('rgb(246, 248, 251)');
    expect(await style(page, '.business-value__card-text', 'color')).toBe('rgb(148, 163, 184)');

    // Cards are borderless with a 24px radius and 28px padding.
    expect(await style(page, '.business-value__card', 'border-top-width')).toBe('0px');
    expect(await style(page, '.business-value__card', 'border-top-left-radius')).toBe('24px');
    expect(await style(page, '.business-value__card', 'padding-top')).toBe('28px');

    expect(await style(page, '.business-value__title', 'font-size')).toBe('32px');
    expect(await style(page, '.business-value__title', 'line-height')).toBe('40px');
    expect(await style(page, '.business-value__title', 'font-weight')).toBe('600');
    expect(await style(page, '.business-value__title', 'letter-spacing')).toBe('-1px');
  });
});

test.describe('ai agents related services band', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/ai_agent');
    // The page is lazy, so wait for the band before measuring anything.
    await expect(page.locator('app-service-card')).toHaveCount(3);
  });

  test('renders three service cards and the engagement panel', async ({ page }) => {
    const related = page.locator('app-related-services');
    await expect(related).toHaveCount(1);
    await expect(related.locator('.related__eyebrow')).toHaveText('Related services');
    await expect(related.locator('h2.related__title')).toHaveText(
      'Often combined with this service.',
    );
    await expect(page.locator('app-ai-agent h1')).toHaveCount(1);

    await expect(related.locator('app-service-card')).toHaveCount(3);
    await expect(related.locator('.service-card__number')).toHaveText(['08', '06', '10']);
    await expect(related.locator('.service-card__title')).toHaveText([
      'AI Development & Integration',
      'Backend Development & API Integration',
      'Claude & AI Workflow Engineering',
    ]);
    await expect(related.locator('.service-card__tag')).toHaveCount(9);

    // Arrows are decoration: nothing in this band navigates.
    await expect(related.locator('.service-card__arrow')).toHaveCount(3);
    await expect(related.locator('a, button')).toHaveCount(0);

    await expect(related.locator('.engagement__eyebrow')).toHaveText('How to engage');
    await expect(related.locator('h3.engagement__title')).toHaveText('Usually delivered as');
    await expect(related.locator('.engagement__model-title')).toHaveText([
      'Project-Based',
      'Long-Term Partnership',
      'Maintenance & Support',
    ]);
    await expect(related.locator('app-icon-tile')).toHaveCount(3);
  });

  test('matches the card and panel geometry from the design', async ({ page }) => {
    const cards = await boxes(page, 'app-service-card');
    expect(cards).toHaveLength(3);
    expect(cards.map((c) => c.x)).toEqual([80, 512, 944]);
    for (const card of cards) expect(card.w).toBe(416);
    expect(cards[1].x - (cards[0].x + cards[0].w)).toBe(16);
    expect(cards[2].x - (cards[1].x + cards[1].w)).toBe(16);
    expect(cards[2].x + cards[2].w).toBe(1360);
    // single row, equal heights
    for (const card of cards) {
      expect(card.y).toBe(cards[0].y);
      expect(card.h).toBe(cards[0].h);
    }

    const panel = await box(page, 'app-engagement-panel');
    expect(panel.x).toBe(80);
    expect(panel.w).toBe(1280);

    const models = await boxes(page, '.engagement__model');
    expect(models).toHaveLength(3);
    for (const model of models) expect(model.w).toBe(290);
    expect(models[1].x - (models[0].x + models[0].w)).toBe(12);
    expect(models[2].x + models[2].w).toBeLessThanOrEqual(panel.x + panel.w - 32);

    // The arrow sits opposite the ordinal and never collides with it.
    const numbers = await boxes(page, '.service-card__number');
    const arrows = await boxes(page, '.service-card__arrow');
    for (let i = 0; i < 3; i += 1) {
      expect(arrows[i].w).toBe(32);
      expect(arrows[i].h).toBe(32);
      expect(arrows[i].x).toBeGreaterThan(numbers[i].x + numbers[i].w);
    }
  });

  test('uses one corner radius, one tag height and the design typography', async ({ page }) => {
    const radii = await page
      .locator('app-service-card, app-engagement-panel, .engagement__model')
      .evaluateAll((els) => [...new Set(els.map((e) => getComputedStyle(e).borderTopLeftRadius))]);
    expect(radii).toEqual(['16px']);

    const tagHeights = await page
      .locator('.service-card__tag')
      .evaluateAll((els) => [
        ...new Set(els.map((e) => Math.round(e.getBoundingClientRect().height))),
      ]);
    expect(tagHeights).toEqual([28]);

    expect(await style(page, '.related__title', 'font-size')).toBe('32px');
    expect(await style(page, '.related__title', 'line-height')).toBe('40px');
    expect(await style(page, '.related__title', 'font-weight')).toBe('600');
    expect(await style(page, '.related__title', 'letter-spacing')).toBe('-1px');

    expect(await style(page, '.engagement__title', 'font-size')).toBe('22px');
    expect(await style(page, '.engagement__title', 'line-height')).toBe('28px');
    expect(await style(page, '.engagement__title', 'font-weight')).toBe('600');

    expect(await style(page, '.service-card__title', 'font-size')).toBe('18px');
    expect(await style(page, '.engagement__model-title', 'font-size')).toBe('16px');
    expect(await style(page, '.engagement__model-text', 'font-size')).toBe('14px');

    expect(await style(page, 'app-service-card', 'background-color')).toBe('rgb(255, 255, 255)');
    expect(await style(page, 'app-engagement-panel', 'background-color')).toBe(
      'rgb(246, 248, 251)',
    );
    expect(await style(page, '.service-card__arrow', 'background-color')).toBe(
      'rgb(238, 242, 247)',
    );
    expect(await style(page, '.service-card__number', 'color')).toBe('rgb(15, 85, 232)');
  });

  test('adapts its columns and never spills out of the viewport', async ({ page }) => {
    for (const [width, cardCols, modelCols] of [
      [390, 1, 1],
      [768, 1, 2],
      [1024, 2, 2],
      [1280, 3, 3],
      [1440, 3, 3],
      [1920, 3, 3],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/services/ai_agent');
      await expect(page.locator('app-service-card')).toHaveCount(3);

      const state = await page.evaluate((vw) => {
        const q = (sel: string) => Array.from(document.querySelectorAll(sel));
        const cards = q('app-service-card');
        const models = q('.engagement__model');
        const cols = (els: Element[]) => {
          const top = Math.round(els[0].getBoundingClientRect().y);
          return els.filter((e) => Math.round(e.getBoundingClientRect().y) === top).length;
        };
        const spills = q('app-related-services *').some((e) => {
          const b = e.getBoundingClientRect();
          return b.right > vw + 0.5 || b.left < -0.5;
        });
        const clipped = [
          ...cards,
          ...models,
          ...q('.service-card__title'),
          ...q('.service-card__summary'),
          ...q('.service-card__tag'),
          ...q('.engagement__model-copy'),
        ].some((e) => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1);
        // rows equalise within themselves
        const rows = [...new Set(cards.map((c) => Math.round(c.getBoundingClientRect().y)))];
        const evenRows = rows.every((y) => {
          const g = cards.filter((c) => Math.round(c.getBoundingClientRect().y) === y);
          return g.every(
            (c) =>
              Math.round(c.getBoundingClientRect().height) ===
                Math.round(g[0].getBoundingClientRect().height) &&
              Math.round(c.getBoundingClientRect().width) ===
                Math.round(g[0].getBoundingClientRect().width),
          );
        });
        // the tile must never sit on top of the copy
        const overlap = models.some((m) => {
          const t = m.querySelector('app-icon-tile')!.getBoundingClientRect();
          const c = m.querySelector('.engagement__model-copy')!.getBoundingClientRect();
          return (
            t.right > c.left + 0.5 &&
            c.right > t.left + 0.5 &&
            t.bottom > c.top + 0.5 &&
            c.bottom > t.top + 0.5
          );
        });
        return {
          cardCols: cols(cards),
          modelCols: cols(models),
          spills,
          clipped,
          evenRows,
          overlap,
        };
      }, width);

      expect(state.cardCols, `card columns at ${width}`).toBe(cardCols);
      expect(state.modelCols, `model columns at ${width}`).toBe(modelCols);
      expect(state.spills, `band inside viewport at ${width}`).toBe(false);
      expect(state.clipped, `no clipped text at ${width}`).toBe(false);
      expect(state.evenRows, `equal cards per row at ${width}`).toBe(true);
      expect(state.overlap, `tile clear of copy at ${width}`).toBe(false);
    }
  });

  test('keeps the English card headings on a single line from 600px upward', async ({ page }) => {
    // 1200-1439 is excluded: three columns of a sub-1280 container are too narrow for the
    // longest English title, which is documented rather than papered over.
    for (const width of [600, 768, 1024, 1199, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/services/ai_agent');
      await expect(page.locator('.service-card__title')).toHaveCount(3);
      const lines = await page.locator('.service-card__title').evaluateAll((els) =>
        els.map((e) => {
          const lh = parseFloat(getComputedStyle(e).lineHeight);
          return Math.round(e.getBoundingClientRect().height / lh);
        }),
      );
      expect(lines, `card heading lines at ${width}`).toEqual([1, 1, 1]);
    }
  });
});

test.describe('ai agents conversation band', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/ai_agent');
    await expect(page.locator('app-start-conversation')).toHaveCount(1);
  });

  test('closes the page with the shared band, no steps and two working links', async ({ page }) => {
    const band = page.locator('app-start-conversation');
    await expect(band.locator('.start-conversation__eyebrow')).toHaveText('Discuss this service');
    await expect(band.locator('h2.start-conversation__title')).toHaveText(
      'Have a process you\u2019d like to automate?',
    );
    await expect(page.locator('app-ai-agent h1')).toHaveCount(1);

    // The design shows no numbered list.
    await expect(band.locator('.start-conversation__step')).toHaveCount(0);

    const links = band.locator('a');
    await expect(links).toHaveCount(2);
    await expect(links).toHaveText(['Discuss this service', 'All services']);
    await expect(links.nth(0)).toHaveAttribute('href', '/contact');
    await expect(links.nth(1)).toHaveAttribute('href', '/services');
    await expect(band.locator('.start-conversation__art')).toHaveAttribute('aria-hidden', 'true');

    // Both links actually resolve.
    await links.nth(1).click();
    await expect(page).toHaveURL(/\/services$/);
  });

  test('matches the panel geometry and palette from the design', async ({ page }) => {
    const panel = await box(page, '.start-conversation');
    expect(panel.x).toBe(80);
    expect(panel.w).toBe(1280);

    expect(await style(page, '.start-conversation', 'border-radius')).toBe('28px');
    expect(await style(page, '.start-conversation', 'background-color')).toBe('rgb(238, 244, 255)');
    expect(await style(page, '.start-conversation__title', 'font-size')).toBe('40px');
    expect(await style(page, '.start-conversation__title', 'line-height')).toBe('48px');
    expect(await style(page, '.start-conversation__lead', 'font-size')).toBe('18px');
    expect(await style(page, '.start-conversation__lead', 'line-height')).toBe('30px');

    const buttons = await boxes(page, '.start-conversation__actions a');
    expect(buttons).toHaveLength(2);
    for (const button of buttons) expect(button.h).toBe(48);
    expect(buttons[1].x - (buttons[0].x + buttons[0].w)).toBe(12);

    // Artwork proportions: the disc is a fixed fraction of the ring.
    const ring = await box(page, '.start-conversation__ring');
    const disc = await box(page, '.start-conversation__disc');
    expect(ring.w).toBe(ring.h);
    // The stylesheet fixes the disc at 69.87% of the ring; pixel rounding lands on 69 or 70.
    const discRatio = (100 * disc.w) / ring.w;
    expect(discRatio).toBeGreaterThan(69);
    expect(discRatio).toBeLessThan(70.5);

    // This page narrows the shared artwork column and lets the ring bleed past the
    // grid row, which is what reproduces the design's 380px ring in a 388px panel
    // with the title on one line.
    expect(ring.w).toBe(380);
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

  test('stays inside the viewport in every locale down to 320px', async ({ page }) => {
    // Long Russian and Armenian words in the title used to widen the copy column
    // past the panel; min-content has to be allowed to shrink.
    for (const route of ['/services/ai_agent', '/ru/services/ai_agent', '/hy/services/ai_agent']) {
      for (const width of [320, 375, 430, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        await expect(page.locator('app-start-conversation')).toHaveCount(1);

        const state = await page.evaluate((vw) => {
          const band = document.querySelector('app-start-conversation')!;
          const spills = Array.from(band.querySelectorAll('*')).some((el) => {
            const b = el.getBoundingClientRect();
            return b.right > vw + 0.5 || b.left < -0.5;
          });
          const clipped = Array.from(
            band.querySelectorAll(
              '.start-conversation__copy, .start-conversation__title, .start-conversation__lead',
            ),
          ).some((el) => el.scrollWidth > el.clientWidth + 1);
          const links = Array.from(band.querySelectorAll('a')).map((a) =>
            Math.round(a.getBoundingClientRect().height),
          );
          return { spills, clipped, minTouch: Math.min(...links) };
        }, width);

        expect(state.spills, `band inside viewport ${route} @${width}`).toBe(false);
        expect(state.clipped, `no clipped copy ${route} @${width}`).toBe(false);
        expect(state.minTouch, `touch target ${route} @${width}`).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

/**
 * The page entrance.
 *
 * Everything else in this file runs under the suite-wide `reducedMotion: 'reduce'`
 * (playwright.config.ts), which is what keeps its pixel assertions stable: under `reduce` no
 * hidden state applies at all. These specs opt back in.
 */
const BANDS = [
  ['app-overview', '.overview'],
  ['app-problems', '.problems'],
  ['app-capabilities', '.capabilities'],
  ['app-audiences', '.audiences'],
  ['app-business-value', '.business-value'],
  ['app-related-services', '.related'],
] as const;

/**
 * The shared page intro.
 *
 * `app-page-intro` renders the `h1` on seven pages, so this covers the band itself rather than
 * anything specific to this one. The cadence matches the home hero's - 60ms a line - so moving
 * between the home page and any of the seven reads as one gesture.
 */
test.describe('page intro entrance', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });

  const COPY = [
    '.page-intro__breadcrumb',
    '.page-intro__eyebrow',
    '.page-intro__title',
    '.page-intro__lead',
  ] as const;

  test('introduces the page in reading order and settles flat', async ({ page }) => {
    await page.goto('/services/ai_agent');
    await expect
      .poll(() => page.locator('.page-intro').getAttribute('data-reveal'), { timeout: 5000 })
      .toBe('in');

    const delays = await Promise.all(COPY.map((s) => style(page, s, 'transition-delay')));
    // The breadcrumb leads with no delay; the shorthand gives it one value per property.
    expect(delays[0].split(',').every((d) => d.trim() === '0s')).toBe(true);
    expect(delays.slice(1)).toEqual(['0.06s', '0.12s', '0.18s']);

    // The projected buttons are not reachable from the intro's own stylesheet, so they carry
    // their own reveal one step further along the same cadence.
    expect(await style(page, '.ai-agent__actions', 'transition-delay')).toBe('0.24s');

    await page.waitForTimeout(1200);
    for (const selector of [...COPY, '.ai-agent__actions']) {
      await expect(page.locator(selector), selector).toHaveCSS('opacity', '1');
      await expect(page.locator(selector), selector).toHaveCSS('transform', 'none');
    }
  });

  test('leaves the heading visible and flat under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/services/ai_agent');

    for (const selector of [...COPY, '.ai-agent__actions']) {
      await expect(page.locator(selector), selector).toHaveCSS('opacity', '1');
      await expect(page.locator(selector), selector).toHaveCSS('transform', 'none');
    }
  });
});

test.describe('ai agents entrance', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });

  test('assembles the example flow on load, drawing each connector into its step', async ({
    page,
  }) => {
    await page.goto('/services/ai_agent');
    await expect
      .poll(() => page.locator('.workflow').getAttribute('data-reveal'), { timeout: 5000 })
      .toBe('in');

    // Each step waits a little longer than the one above it. The delay is a list across every
    // transitioned property: the reveal pair is staggered, the hover pair pinned at zero so a
    // step near the bottom does not take half a second to answer the pointer.
    const delays = await page
      .locator('.workflow__step')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).transitionDelay));
    expect(delays).toEqual([
      '0.08s, 0.08s, 0s, 0s',
      '0.15s, 0.15s, 0s, 0s',
      '0.22s, 0.22s, 0s, 0s',
      '0.29s, 0.29s, 0s, 0s',
      '0.36s, 0.36s, 0s, 0s',
      '0.43s, 0.43s, 0s, 0s',
    ]);

    // And the rule above each step is drawn 40ms ahead of it, so it leads rather than follows.
    const connectors = await page
      .locator('.workflow__step')
      .evaluateAll((els) =>
        els.slice(1).map((el) => getComputedStyle(el, '::before').transitionDelay),
      );
    expect(connectors).toEqual(['0.11s', '0.18s', '0.25s', '0.32s', '0.39s']);

    await page.waitForTimeout(1600);
    for (const step of await page.locator('.workflow__step').all()) {
      await expect(step).toHaveCSS('opacity', '1');
      await expect(step).toHaveCSS('transform', 'none');
    }
    const drawn = await page
      .locator('.workflow__step')
      .evaluateAll((els) =>
        els
          .slice(1)
          .map((el) => new DOMMatrixReadOnly(getComputedStyle(el, '::before').transform).d),
      );
    expect(drawn).toEqual([1, 1, 1, 1, 1]);
  });

  test('holds every band below the fold until it is reached, then settles it', async ({ page }) => {
    await page.goto('/services/ai_agent');
    await expect
      .poll(() => page.locator('.workflow').getAttribute('data-reveal'), { timeout: 5000 })
      .toBe('in');

    for (const [, root] of BANDS) {
      expect(await page.locator(root).getAttribute('data-reveal'), root).toBe('out');
    }

    for (const [host, root] of BANDS) {
      await page.locator(host).scrollIntoViewIfNeeded();
      await expect
        .poll(() => page.locator(root).getAttribute('data-reveal'), { timeout: 5000 }) //
        .toBe('in');
    }

    await page.waitForTimeout(1200);
    for (const selector of [
      '.problems__card',
      '.capabilities__panel',
      '.business-value__card',
      '.related__grid > li',
      '.audiences__row',
    ]) {
      const first = page.locator(selector).first();
      await expect(first, selector).toHaveCSS('opacity', '1');
      await expect(first, selector).toHaveCSS('transform', 'none');
    }
  });

  test('scrolling back up does not replay a band', async ({ page }) => {
    await page.goto('/services/ai_agent');
    await page.locator('app-problems').scrollIntoViewIfNeeded();
    await expect
      .poll(() => page.locator('.problems').getAttribute('data-reveal'), { timeout: 5000 })
      .toBe('in');

    await page.locator('app-related-services').scrollIntoViewIfNeeded();
    await page.locator('app-problems').scrollIntoViewIfNeeded();

    expect(await page.locator('.problems').getAttribute('data-reveal')).toBe('in');
  });
});

test.describe('ai agents entrance with reduced motion', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });

  test('hides nothing, draws the connectors and runs no animation', async ({ page }) => {
    await page.goto('/services/ai_agent');

    for (const step of await page.locator('.workflow__step').all()) {
      await expect(step).toHaveCSS('opacity', '1');
      await expect(step).toHaveCSS('transform', 'none');
    }
    const drawn = await page
      .locator('.workflow__step')
      .evaluateAll((els) =>
        els
          .slice(1)
          .map((el) => new DOMMatrixReadOnly(getComputedStyle(el, '::before').transform).d),
      );
    expect(drawn).toEqual([1, 1, 1, 1, 1]);
    expect(
      await page
        .locator('.workflow__badge')
        .evaluate((el) => getComputedStyle(el, '::before').animationName),
    ).toBe('none');

    await page.locator('app-problems').scrollIntoViewIfNeeded();
    await expect(page.locator('.problems__card').first()).toHaveCSS('opacity', '1');
  });
});

test.describe('ai agents page in other locales', () => {
  test('renders the whole band in Russian and Armenian', async ({ page }) => {
    await page.goto('/ru/services/ai_agent');
    await expect(page.locator('app-ai-agent h1')).toHaveText(
      'AI-агенты и автоматизация бизнес-процессов',
    );
    await expect(page.locator('.page-intro__eyebrow')).toHaveText(
      'Искусственный интеллект · Услуга 09',
    );
    await expect(page.locator('.workflow__label').first()).toHaveText('Триггер');
    await expect(page.locator('.overview__eyebrow')).toHaveText('Обзор');
    await expect(page.locator('.problems__eyebrow')).toHaveText('Проблемы, которые мы решаем');
    await expect(page.locator('.capabilities__panel-title')).toHaveText([
      'Возможности',
      'Что вы получаете',
    ]);
    await expect(page.locator('.audiences__eyebrow')).toHaveText([
      'Типичные проекты',
      'Для кого это',
    ]);
    await expect(page.locator('.business-value__card-title').first()).toHaveText(
      'Меньше ручной работы',
    );
    await expect(page.locator('.related__eyebrow')).toHaveText('Сопутствующие услуги');
    await expect(page.locator('.service-card__number')).toHaveText(['08', '06', '10']);
    await expect(page.locator('.start-conversation__eyebrow')).toHaveText('Обсудим эту услугу');
    await expect(page.locator('app-start-conversation a').nth(1)).toHaveAttribute(
      'href',
      '/ru/services',
    );
    await expect(page.locator('.ai-agent__actions a').nth(1)).toHaveAttribute(
      'href',
      '/ru/solutions',
    );

    await page.goto('/hy/services/ai_agent');
    await expect(page.locator('app-ai-agent h1')).toHaveText(
      'AI գործակալներ և բիզնես գործընթացների ավտոմատացում',
    );
    await expect(page.locator('.page-intro__crumb').nth(1)).toHaveText('Ծառայություններ');
    await expect(page.locator('.overview__eyebrow')).toHaveText('Ընդհանուր նկարագիր');
    await expect(page.locator('.problems__card-title').first()).toHaveText(
      'Տվյալների ձեռքով փոխանցում',
    );
    await expect(page.locator('.capabilities__panel-title').first()).toHaveText(
      'Հնարավորություններ',
    );
    await expect(page.locator('.audiences__eyebrow').first()).toHaveText('Բնորոշ նախագծեր');
    await expect(page.locator('.business-value__eyebrow')).toHaveText('Բիզնեսի արժեքը');
    await expect(page.locator('.related__eyebrow')).toHaveText('Առնչվող ծառայություններ');
    await expect(page.locator('app-start-conversation a').nth(0)).toHaveAttribute(
      'href',
      '/hy/contact',
    );
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

    // The outcome cards collapse to one column, and none of them clips its copy.
    const outcomes = await boxes(page, '.business-value__card');
    expect(outcomes).toHaveLength(4);
    for (const card of outcomes) expect(card.w).toBeLessThanOrEqual(390);
    expect(new Set(outcomes.map((card) => card.x)).size).toBe(1);
    const spill = await page
      .locator('.business-value__card')
      .evaluateAll((els) => els.map((el) => el.scrollHeight > el.clientHeight + 1));
    expect(spill).toEqual([false, false, false, false]);
  });
});
