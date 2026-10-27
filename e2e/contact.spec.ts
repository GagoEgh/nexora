import { expect, test, type Page } from '@playwright/test';

/**
 * Contact page contract.
 *
 * Contact.png fixes the page at 1440 as a single intro band: a 460px narrative column
 * (steps plus the channels card) beside a 756px form card on a 64px gap, together filling
 * the 1280 container. The form reuses the themed Material primitives, so the field rows
 * are 52 tall and the textarea 140, exactly as styles/theme/_form-field.scss declares.
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

test.describe('contact at the desktop design width', () => {
  test.use({ viewport: { width: 1440, height: 1200 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.locator('app-contact-form form.form').waitFor();
  });

  test('opens with one h1 and both columns inside the 1280 container', async ({ page }) => {
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveText('Let’s Build Something Meaningful.');

    const aside = await box(page, '.contact__aside');
    const card = await box(page, 'app-contact-form form.form');

    expect(aside.x).toBe(80);
    expect(aside.w).toBe(460);
    expect(card.w).toBe(756);
    expect(card.x - (aside.x + aside.w)).toBe(64);
    expect(card.x + card.w).toBe(1360);
  });

  test('numbers the three steps on 28px badges joined by a connector', async ({ page }) => {
    const badges = await boxes(page, '.next__badge');
    expect(badges).toHaveLength(3);
    for (const badge of badges) expect([badge.w, badge.h]).toEqual([28, 28]);

    await expect(page.locator('.next__badge')).toHaveText(['1', '2', '3']);

    // Only the first badge carries the solid primary fill.
    expect(await style(page, '.next__step:first-child .next__badge', 'background-color')).toBe(
      'rgb(15, 85, 232)',
    );
    expect(await style(page, '.next__step:nth-child(2) .next__badge', 'background-color')).toBe(
      'rgb(238, 244, 255)',
    );
  });

  test('renders the channels card with a hairline row per channel', async ({ page }) => {
    const card = await box(page, '.channels');
    expect(card.w).toBe(460);
    expect(await style(page, '.channels', 'border-top-left-radius')).toBe('16px');

    const rows = await boxes(page, '.channels__row');
    expect(rows).toHaveLength(2);

    const dividers = await page
      .locator('.channels__row')
      .evaluateAll(
        (els) => els.filter((el) => getComputedStyle(el).borderTopWidth === '1px').length,
      );
    expect(dividers).toBe(2);

    // The approved email is a mailto link; the phone number is still a placeholder.
    const mail = page.locator('.channels__link');
    await expect(mail).toHaveAttribute('href', 'mailto:info@nexoratechnology.org');
    await expect(mail).toHaveText('info@nexoratechnology.org');
    await expect(page.locator('.channels__value').last()).toContainText(
      '{CONTACT_PHONE} — add when approved',
    );
  });

  test('lays the form card out on the themed field metrics', async ({ page }) => {
    expect(await style(page, 'app-contact-form form.form', 'border-top-left-radius')).toBe('24px');
    expect(await style(page, 'app-contact-form form.form', 'padding-top')).toBe('40px');

    // Two-up rows: equal columns on a 20px gap, each field the themed 52px tall.
    const pairs = await boxes(page, '.form__row >> nth=0 >> .form__field');
    expect(pairs).toHaveLength(2);
    expect(pairs[0].w).toBe(pairs[1].w);
    expect(pairs[1].x - (pairs[0].x + pairs[0].w)).toBe(20);

    const fields = await boxes(page, '.form__field .mat-mdc-text-field-wrapper');
    expect(fields[0].h).toBe(52);

    const textarea = await box(page, 'app-contact-form textarea');
    expect(textarea.h).toBeGreaterThanOrEqual(112);

    const divider = await box(page, '.form__divider');
    expect(divider.w).toBe(674);
  });

  test('offers the interest and contact-method chips at 40px tall', async ({ page }) => {
    const chips = await boxes(page, 'mat-chip-option');
    expect(chips).toHaveLength(7);
    for (const chip of chips) expect(chip.h).toBe(40);

    await expect(page.locator('app-chip-select').first().locator('mat-chip-option')).toHaveText([
      'A new project',
      'A dedicated team',
      'A partnership',
      'Something else',
    ]);
  });

  test('keeps the root button and chip tokens untouched by the page override', async ({ page }) => {
    const root = await page.evaluate(() => ({
      button: getComputedStyle(document.documentElement)
        .getPropertyValue('--mat-button-filled-container-height')
        .trim(),
      chip: getComputedStyle(document.documentElement)
        .getPropertyValue('--mat-chip-container-height')
        .trim(),
    }));
    expect(root).toEqual({ button: '48px', chip: '36px' });
  });

  test('blocks an invalid submission and surfaces the errors', async ({ page }) => {
    await page.locator('app-contact-form button[type="submit"]').click();

    await expect(page.locator('app-contact-form mat-error').first()).toBeVisible();
    await expect(page.locator('.form__error')).toBeVisible();
  });

  test('reports that sending is not configured once the form is valid', async ({ page }) => {
    await page.locator('#contact-name').fill('Ada Lovelace');
    await page.locator('#contact-email').fill('ada@example.com');
    await page.locator('#contact-company').fill('Nexora');
    await page.locator('#contact-service').click();
    await page.locator('mat-option').first().click();
    await page.locator('#contact-description').fill('Modernizing a legacy ordering platform.');
    await page.locator('app-contact-form mat-checkbox input').check();

    await page.locator('app-contact-form button[type="submit"]').click();

    // No endpoint ships with the static build, so the form says so instead of faking a send.
    await expect(page.locator('app-snack-bar')).toContainText('Sending isn’t available yet');
  });

  test('points both privacy links at the policy route', async ({ page }) => {
    const links = page.locator('app-contact-form a');
    await expect(links).toHaveCount(2);
    for (const href of await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')))) {
      expect(href).toBe('/privacy-policy');
    }
  });

  test('names every section for assistive technology', async ({ page }) => {
    const named = await page
      .locator('app-contact section[aria-labelledby], app-contact form[aria-labelledby]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('aria-labelledby')));

    expect(named).toEqual(['contact-next-title', 'contact-channels-title', 'contact-form-title']);

    for (const id of named) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });
});

test.describe('contact at narrower widths', () => {
  for (const width of [390, 768, 1024]) {
    test(`stays within the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1200 });
      await page.goto('/contact');
      await page.locator('app-contact-form form.form').waitFor();

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);
      await expect(page.locator('.next__step')).toHaveCount(3);
      await expect(page.locator('.channels__row')).toHaveCount(2);
      await expect(page.locator('mat-chip-option')).toHaveCount(7);
    });
  }
});

test.describe('contact under a locale prefix', () => {
  test.use({ viewport: { width: 1440, height: 1200 } });

  test('translates the page and keeps the prefix on every link', async ({ page }) => {
    await page.goto('/ru/contact');
    await page.locator('app-contact-form form.form').waitFor();

    await expect(page.locator('main h1')).toHaveText('Давайте создадим что-то значимое.');
    await expect(page.locator('#contact-form-title')).toHaveText('Расскажите о своём проекте');

    const hrefs = await page
      .locator('app-contact a')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')));

    // The mailto channel is not a router link, so it must stay unprefixed.
    expect(hrefs).toContain('mailto:info@nexoratechnology.org');
    const routed = hrefs.filter((href) => !href?.startsWith('mailto:'));
    expect(routed.length).toBeGreaterThan(0);
    expect(routed.every((href) => href === '/ru' || href?.startsWith('/ru/'))).toBe(true);
  });
});
