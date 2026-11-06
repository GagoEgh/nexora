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

const fillValidForm = async (page: Page) => {
  await page.locator('#contact-name').fill('Ada Lovelace');
  await page.locator('#contact-email').fill('ada@example.com');
  await page.locator('#contact-company').fill('Nexora');
  await page.locator('#contact-service').click();
  await page.locator('mat-option').first().click();
  await page.locator('#contact-description').fill('Modernizing a legacy ordering platform.');
};

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
    expect(await style(page, '.channels', 'border-top-left-radius')).toBe('24px');

    const rows = await boxes(page, '.channels__row');
    expect(rows).toHaveLength(1);

    const dividers = await page
      .locator('.channels__row')
      .evaluateAll(
        (els) => els.filter((el) => getComputedStyle(el).borderTopWidth === '1px').length,
      );
    expect(dividers).toBe(1);

    // The approved email is the one published channel, rendered as a mailto link.
    const mail = page.locator('.channels__link');
    await expect(mail).toHaveAttribute('href', 'mailto:info@nexoratechnology.org');
    await expect(mail).toHaveText('info@nexoratechnology.org');
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

    // One step between controls. The gap between two rows of a group is the gap between the two
    // halves of a row, because below 600px a row is itself a stack and the two are the same
    // relation; 32px, the gap on `.form`, stays the step between sections.
    const rhythm = await page
      .locator('.form__group')
      .first()
      .evaluate((el) => ({
        betweenRows: getComputedStyle(el).rowGap,
        withinRow: getComputedStyle(el.querySelector('.form__row')!).columnGap,
        betweenSections: getComputedStyle(el.closest('form')!).rowGap,
      }));
    expect(rhythm).toEqual({ betweenRows: '20px', withinRow: '20px', betweenSections: '32px' });
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
  });

  test('posts the inquiry to /api/contact and confirms a successful send', async ({ page }) => {
    const posted: Record<string, unknown>[] = [];

    await page.route('**/api/contact', async (route) => {
      posted.push(route.request().postDataJSON() as Record<string, unknown>);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Your message has been submitted.' }),
      });
    });

    await fillValidForm(page);
    await page.locator('app-contact-form button[type="submit"]').click();

    await expect(page.locator('app-snack-bar')).toContainText('on its way');

    expect(posted).toHaveLength(1);
    expect(posted[0]).toMatchObject({
      interest: 'new-project',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      company: 'Nexora',
      description: 'Modernizing a legacy ordering platform.',
      method: 'email',
      website: '',
    });
  });

  test('delivers the inquiry once when the form is submitted twice', async ({ page }) => {
    const posted: Record<string, unknown>[] = [];
    // The executor runs synchronously, so `release` is assigned before anything can call it.
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });

    // Hold the response open so both submissions are in flight at the same time; otherwise the
    // first resolves and resets the form before the second click lands, and the duplicate the
    // submitter guards against never actually occurs.
    await page.route('**/api/contact', async (route) => {
      posted.push(route.request().postDataJSON() as Record<string, unknown>);
      await held;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await fillValidForm(page);
    const submit = page.locator('app-contact-form button[type="submit"]');

    await submit.click();
    // Submitting again through the form itself, since the button is disabled during the send.
    await page.locator('app-contact-form form.form').evaluate((form: HTMLFormElement) => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    release();
    await expect(page.locator('app-snack-bar')).toContainText('on its way');
    expect(posted).toHaveLength(1);
  });

  test('never claims success when the API cannot deliver', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'unavailable' }),
      }),
    );

    await fillValidForm(page);
    await page.locator('app-contact-form button[type="submit"]').click();

    await expect(page.locator('app-snack-bar')).toContainText('Something went wrong');
  });

  test('keeps the honeypot out of sight and out of the tab order', async ({ page }) => {
    const honeypot = page.locator('#contact-website');
    await expect(honeypot).toHaveAttribute('tabindex', '-1');
    await expect(honeypot).toHaveValue('');
    await expect(page.locator('.form__honeypot')).toHaveAttribute('aria-hidden', 'true');

    const box = await page.locator('.form__honeypot').boundingBox();
    expect(box?.width ?? 0).toBeLessThanOrEqual(1);
  });

  test('every caption focuses its control when clicked', async ({ page }) => {
    // The pointer is honest: all nine captions act on click.
    const cursors = await page
      .locator('app-contact-form app-field-label label')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).cursor));
    expect(cursors).toHaveLength(9);
    expect(new Set(cursors)).toEqual(new Set(['pointer']));

    // The four labelable controls are associated natively through `for`...
    for (const id of ['contact-name', 'contact-email', 'contact-company', 'contact-description']) {
      await page.locator(`label[for="${id}"]`).click();
      await expect(page.locator(`#${id}`)).toBeFocused();
    }

    // ...and the five custom controls, which `for` cannot reach, focus by reference instead.
    for (const id of ['contact-service', 'contact-timeline', 'contact-budget']) {
      await page.locator('body').click({ position: { x: 5, y: 5 } });
      await page.locator(`#${id}-label`).click();
      await expect(page.locator(`#${id}`)).toBeFocused();
      await page.keyboard.press('Escape');
    }

    for (const id of ['contact-interest', 'contact-method']) {
      await page.locator('body').click({ position: { x: 5, y: 5 } });
      await page.locator(`#${id}-label`).click();
      // A chip listbox delegates focus to its selected chip.
      await expect(
        page.locator(`#${id} mat-chip-option button[aria-selected="true"]`),
      ).toBeFocused();
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
      await expect(page.locator('.channels__row')).toHaveCount(1);
      await expect(page.locator('mat-chip-option')).toHaveCount(7);
    });
  }
});

/**
 * The two-column band, which starts at the `large` breakpoint (1200px).
 *
 * `--nx-page-intro-aside` sizes the form column, and the narrative column takes whatever is
 * left. Between 1200px and 1440px the container has not yet reached its own 1280 maximum, so a
 * flat 756px aside used to eat the remainder: the narrative column measured 220px at 1200px and
 * the heading stacked into a 360px-tall ribbon. These are the common laptop widths, and the
 * band was previously untested - the matrix stopped at 1024 and resumed at 1440.
 */
test.describe('contact across the two-column band', () => {
  for (const width of [1200, 1280, 1366, 1440, 1920]) {
    test(`holds the narrative column at its design width at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1200 });
      await page.goto('/contact');
      await page.locator('app-contact-form form.form').waitFor();

      expect(await noOverflow(page)).toBeLessThanOrEqual(0);

      // Contact.png fixes the narrative column at 460; it must not be the column that absorbs
      // a container narrower than 1280.
      const copy = await box(page, '.page-intro__copy');
      expect(copy.w, `narrative column at ${width}px`).toBeGreaterThanOrEqual(440);

      // The symptom the squeeze produced: a heading several times taller than designed.
      const heading = await box(page, '.page-intro__title');
      expect(heading.h, `heading height at ${width}px`).toBeLessThanOrEqual(200);
    });
  }
});

test.describe('contact under a locale prefix', () => {
  test.use({ viewport: { width: 1440, height: 1200 } });

  test('translates the page and keeps the prefix on every link', async ({ page }) => {
    await page.goto('/ru/contact');
    await page.locator('app-contact-form form.form').waitFor();

    await expect(page.locator('main h1')).toHaveText(
      'Давайте вместе создадим нечто действительно ценное.',
    );
    await expect(page.locator('#contact-form-title')).toHaveText('Расскажите о своём проекте');

    const hrefs = await page
      .locator('app-contact a')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')));

    // The mailto channel is not a router link, so it must stay unprefixed.
    expect(hrefs).toContain('mailto:info@nexoratechnology.org');
    const routed = hrefs.filter((href) => !href?.startsWith('mailto:'));
    expect(routed.length).toBeGreaterThan(0);
    expect(routed.every((href) => href === '/ru' || href?.startsWith('/ru/'))).toBe(true);

    // Validator messages live on the schema rules, so they come from a function that reads the
    // dictionary rather than from copy pinned into the template. This is what proves that
    // function resolves in the active locale.
    await page.locator('button[type="submit"]').click();
    await expect(
      page.locator('#contact-name').locator('xpath=ancestor::mat-form-field').locator('mat-error'),
    ).toHaveText('Это поле обязательно для заполнения.');
  });
});

/**
 * Interaction feedback added with the design pass. The rest of this file runs under
 * `reducedMotion: 'reduce'` (playwright.config.ts), which is what keeps its geometry stable, so
 * these specs opt back in where the behaviour under test is motion.
 */
test.describe('contact interaction feedback', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 1400 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.locator('app-contact-form form.form').waitFor();
  });

  test('the channel row answers both hover and keyboard focus', async ({ page }) => {
    const bg = () => style(page, '.channels__row', 'background-color');
    const idle = await bg();

    await page.locator('.channels__row').hover();
    await expect.poll(bg, { timeout: 2000 }).not.toBe(idle);

    await page.mouse.move(0, 0);
    await expect.poll(bg, { timeout: 2000 }).toBe(idle);

    // The row wraps a link, so reaching it by keyboard earns the same surface.
    await page.locator('.channels__link').focus();
    await expect.poll(bg, { timeout: 2000 }).not.toBe(idle);
  });

  test('a chip reports the press and keeps elevation once selected', async ({ page }) => {
    const chip = page.locator('mat-chip-option').nth(1);
    const read = () =>
      chip.evaluate((el) => {
        const c = getComputedStyle(el);
        return { scale: c.scale, elevated: c.boxShadow !== 'none' };
      });

    expect(await read()).toEqual({ scale: 'none', elevated: false });

    const box = (await chip.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // The ripple is disabled on these chips, so this press feedback is the only one they have.
    await expect.poll(async () => (await read()).scale, { timeout: 2000 }).not.toBe('none');
    await page.mouse.up();

    await expect.poll(async () => (await read()).elevated, { timeout: 2000 }).toBe(true);

    // A transform must never change the resting geometry the layout specs assert - measured once
    // the press has fully returned, since a scale caught mid-transition is a fraction short.
    await expect.poll(async () => (await read()).scale, { timeout: 2000 }).toBe('none');
    expect(Math.round((await chip.boundingBox())!.height)).toBe(40);
  });

  test('a caption answers hover and turns to the error colour with its field', async ({ page }) => {
    const caption = page
      .locator('app-field-label')
      .filter({ has: page.locator('label[for="contact-name"]') });
    const colour = () => caption.locator('label').evaluate((el) => getComputedStyle(el).color);

    const idle = await colour();
    await caption.hover();
    await expect.poll(colour, { timeout: 2000 }).not.toBe(idle);

    // Touch the control and leave it empty: the caption carries the error, not just the message.
    await page.locator('#contact-name').click();
    await page.locator('#contact-email').click();
    await expect(caption).toHaveClass(/field-label--invalid/);
    await expect.poll(colour, { timeout: 2000 }).not.toBe(idle);
  });

  test('the required mark is shown but left out of the accessible name', async ({ page }) => {
    const mark = page.locator('.form__required').first();
    await expect(mark).toHaveText('*');
    await expect(mark).toHaveAttribute('aria-hidden', 'true');
    // Requiredness still reaches assistive technology through the control itself.
    await expect(page.locator('#contact-name')).toHaveAttribute('aria-required', 'true');
  });

  test('a submission in flight is announced and shown', async ({ page }) => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/api/contact', async (route) => {
      await held;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await fillValidForm(page);
    await page.locator('button[type="submit"]').click();

    const form = page.locator('app-contact-form form.form');
    await expect(form).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
    const bar = await form.evaluate((el) => {
      const b = getComputedStyle(el, '::before');
      return { content: b.content, height: b.height, animated: b.animationName !== 'none' };
    });
    expect(bar.height).toBe('2px');
    expect(bar.animated).toBe(true);

    release();
    await expect(form).toHaveAttribute('aria-busy', 'false');
  });

  test('the narrative column follows the form down the page', async ({ page }) => {
    const aside = page.locator('.contact__aside');
    expect(await aside.evaluate((el) => getComputedStyle(el).position)).toBe('sticky');

    const topBefore = (await aside.boundingBox())!.y;
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(250);
    const topAfter = (await aside.boundingBox())!.y;

    // It travelled less than the page scrolled, which is what sticking means.
    expect(topBefore - topAfter).toBeLessThan(500);

    // And it never reaches the footer.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(250);
    const clear = await page.evaluate(() => {
      const a = document.querySelector('.contact__aside')!.getBoundingClientRect();
      const f = document.querySelector('app-footer, footer')!.getBoundingClientRect();
      return Math.round(f.top - a.bottom);
    });
    expect(clear).toBeGreaterThanOrEqual(0);
  });
});

test.describe('contact interaction feedback with reduced motion', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1400 } });

  test('keeps every cue but removes the movement', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('app-contact-form form.form').waitFor();
    await page.waitForTimeout(800);

    // Nothing is left hidden or displaced.
    for (const selector of ['.next__eyebrow', '.next__step', '.channels', '.form']) {
      await expect(page.locator(selector).first()).toHaveCSS('opacity', '1');
    }
    const badge = await page
      .locator('.next__badge')
      .first()
      .evaluate((el) => getComputedStyle(el).scale);
    expect(badge).toBe('none');

    // The colour cues are not motion, so they still work.
    const bg = () => style(page, '.channels__row', 'background-color');
    const idle = await bg();
    await page.locator('.channels__row').hover();
    await expect.poll(bg, { timeout: 2000 }).not.toBe(idle);

    // The icon nudge is movement, so it is gone.
    expect(await style(page, '.channels__icon', 'translate')).toBe('none');
  });
});

/** Field, control and submit-outcome states added with the form design pass. */
test.describe('contact form states', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 1500 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.locator('app-contact-form form.form').waitFor();
  });

  const outlineColour = (page: Page) =>
    page
      .locator('#contact-name')
      .evaluate(
        (el) =>
          getComputedStyle(
            (el as HTMLElement).closest('mat-form-field')!.querySelector('.mat-mdc-notch-piece')!,
          ).borderTopColor,
      );

  test('an input outline answers the pointer', async ({ page }) => {
    const resting = await outlineColour(page);
    await page.locator('#contact-name').hover();
    // Previously the hover colour was the resting colour, so seven controls had no affordance.
    await expect.poll(() => outlineColour(page), { timeout: 2000 }).not.toBe(resting);
  });

  test('the select panel is rounded like every other surface', async ({ page }) => {
    await page.locator('#contact-service').click();
    const panel = page.locator('.mat-mdc-select-panel');
    await expect(panel).toBeVisible();
    // Material's own value is `0 0 4px 4px`, which belongs to no step on the project's scale.
    expect(await panel.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('12px');
  });

  /**
   * The caption sits one step below the value it names and on the same line box as the text
   * below the control. It used to be Title/Small 14/20, near enough to the Body/Large 16/24
   * value to compete with it; a caption that matches its own field's hint reads as part of the
   * field instead.
   */
  test('a caption is a step below the value and shares the hint’s line box', async ({ page }) => {
    const type = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((el) => {
          const c = getComputedStyle(el);
          return { size: c.fontSize, lineHeight: c.lineHeight, weight: c.fontWeight };
        });

    const caption = await type('app-field-label label');
    expect(caption).toEqual({ size: '13px', lineHeight: '21px', weight: '600' });

    // Same metric as the text below the control, and a step under the value inside it.
    const hint = await type('#contact-timeline >> xpath=ancestor::mat-form-field//mat-hint');
    expect([hint.size, hint.lineHeight]).toEqual([caption.size, caption.lineHeight]);
    // The weight, not the size, is what keeps the caption ahead of the hint.
    expect(Number(caption.weight)).toBeGreaterThan(Number(hint.weight));

    const value = await type('#contact-name');
    expect(Number.parseFloat(value.size)).toBeGreaterThan(Number.parseFloat(caption.size));
  });

  /**
   * Material gives a select its own placeholder token, defaulting to `on-surface-variant` while
   * the text field's placeholder is the muted role - so an empty select rendered a shade darker
   * than the empty input beside it in the same row, and read as already filled.
   */
  test('an empty select and an empty input write their placeholders in one colour', async ({
    page,
  }) => {
    const inputPlaceholder = await page
      .locator('#contact-company')
      .evaluate((el) => getComputedStyle(el, '::placeholder').color);
    const selectPlaceholder = await page
      .locator('#contact-service .mat-mdc-select-placeholder')
      .evaluate((el) => getComputedStyle(el).color);

    expect(selectPlaceholder).toBe(inputPlaceholder);
  });

  test('every required field is marked, and only those', async ({ page }) => {
    // Six validators are `required`: interest, name, email, company, service, description.
    await expect(page.locator('.form__required')).toHaveCount(6);
    const marked = await page
      .locator('app-field-label:has(.form__required) label')
      .allTextContents();
    expect(marked.map((t) => t.replace(/\s+/g, ' ').trim())).toEqual([
      'I’m interested in *',
      'Full name *',
      'Work email *',
      'Company name *',
      'Service of interest *',
      'Project description *',
    ]);
    // The interest group reports requiredness to assistive tech as well as showing it.
    await expect(page.locator('mat-chip-listbox').first()).toHaveAttribute('aria-required', 'true');
  });

  test('the optional contact-method group says so', async ({ page }) => {
    await expect(page.locator('.form__hint')).toHaveText('Optional');
  });

  test('the counter warns before the cap and again at it', async ({ page }) => {
    const counter = page.locator('.form__counter');
    await expect(counter).toHaveAttribute('data-count', 'ok');

    await page.locator('#contact-description').fill('y'.repeat(1800));
    await expect(counter).toHaveAttribute('data-count', 'near');

    await page.locator('#contact-description').fill('y'.repeat(2000));
    await expect(counter).toHaveAttribute('data-count', 'full');
    // The validator projects `maxlength`, so input stops rather than becoming invalid.
    expect(await page.locator('#contact-description').inputValue()).toHaveLength(2000);
  });

  test('a successful send returns focus and clears itself', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      }),
    );

    await fillValidForm(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').click();

    // Focus lands on the heading rather than being dropped on <body>.
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.id ?? ''), { timeout: 4000 })
      .toBe('contact-form-title');
    await expect(page.locator('#contact-name')).toHaveValue('');
    // The success message has done its job, so it leaves on its own.
    await expect(page.locator('.mat-mdc-snack-bar-container')).toHaveCount(0, { timeout: 9000 });
  });

  test('a failed send keeps the visitor, their input and the message', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: false }),
      }),
    );

    await fillValidForm(page);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.mat-mdc-snack-bar-container')).toBeVisible();

    // Nothing is reset and focus is not moved: there is something here to act on.
    await expect(page.locator('#contact-name')).toHaveValue('Ada Lovelace');
    await expect(page.locator('#contact-form-title')).not.toBeFocused();
    await page.waitForTimeout(7000);
    await expect(page.locator('.mat-mdc-snack-bar-container')).toBeVisible();
  });

  // The API's own `AllExceptionsFilter` writes this body, and its DTO declares no custom
  // messages, so class-validator's defaults apply - each one starting with the property name.
  const validationRejection = (fields: readonly string[]) => ({
    status: 400,
    contentType: 'application/json',
    body: JSON.stringify({
      success: false,
      statusCode: 400,
      message: fields.map((field) => `${field} must be longer than or equal to 1 characters`),
      error: 'Bad Request',
      requestId: 'req-e2e',
    }),
  });

  test('an invalid submission focuses the first field at fault', async ({ page }) => {
    // Everything but the name, so the topmost field at fault is the one below it.
    await page.locator('#contact-email').fill('ada@example.com');
    await page.locator('#contact-company').fill('Nexora');
    await page.locator('#contact-service').click();
    await page.locator('mat-option').first().click();
    await page.locator('#contact-description').fill('Modernizing a legacy ordering platform.');

    await page.locator('button[type="submit"]').click();

    // Driven by `onInvalid`, which runs after `submit()` has marked every field touched - so the
    // error is on screen by the time focus arrives.
    await expect(page.locator('#contact-name')).toBeFocused();
    const nameError = page
      .locator('#contact-name')
      .locator('xpath=ancestor::mat-form-field')
      .locator('mat-error');
    await expect(nameError).toBeVisible();
    // Nothing was sent, and nothing was cleared.
    await expect(page.locator('#contact-company')).toHaveValue('Nexora');
  });

  test('the form opts out of native browser validation', async ({ page }) => {
    // Load-bearing, and the kind of attribute that gets tidied away. `FormField` writes the
    // schema's rules onto the controls as *native* constraint attributes (`required`,
    // `maxlength`), so without `novalidate` the browser would run its own validation, show its
    // own bubbles, and refuse to dispatch the `submit` event at all - the component's handler
    // would never run, and neither would Signal Forms.
    //
    // `FormRoot` is the directive that normally supplies this; this form sets it directly, which
    // is the same thing the official Signal Forms example does with its own `(submit)` handler.
    // See CONTACT_FORM_SUBMISSION_ARCHITECTURE_AUDIT.md.
    const noValidate = await page
      .locator('app-contact-form form.form')
      .evaluate((el) => (el as HTMLFormElement).noValidate);
    expect(noValidate).toBe(true);

    // The native constraints that make it necessary really are on the controls.
    expect(await page.locator('#contact-name').getAttribute('required')).toBe('');
    expect(await page.locator('#contact-name').getAttribute('maxlength')).toBe('120');
  });

  test('each schema limit reaches the control as a native cap', async ({ page }) => {
    // `FormField` turns a `maxLength()` rule into a native `maxlength`, so the browser refuses
    // the 121st character rather than accepting it and then complaining. That makes the limits
    // the API enforces unreachable from the UI - the `maxLength` message is a fallback for a
    // value that arrived some other way, not something a visitor is expected to see.
    const caps = await page
      .locator('#contact-name, #contact-email, #contact-company, #contact-description')
      .evaluateAll((els) => els.map((el) => el.getAttribute('maxlength')));
    expect(caps).toEqual(['120', '254', '160', '2000']);

    await page.locator('#contact-name').fill('x'.repeat(121));
    await expect(page.locator('#contact-name')).toHaveValue('x'.repeat(120));
  });

  // CT-11. Material toggles a chip on every activation, so clicking the chosen one deselected it
  // and wrote `undefined` through the value accessor - and Signal Forms answers that by removing
  // the key, which takes `form.<field>` with it. The next render then threw
  // `TypeError: ctx.form.interest is not a function`, in the browser, from an ordinary click.
  test('the chip groups keep their choice when the chosen chip is clicked again', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    for (const group of ['#contact-interest', '#contact-method']) {
      const chosen = page.locator(`${group} [role="option"][aria-selected="true"]`);
      await expect(chosen).toHaveCount(1);
      const label = (await chosen.textContent())?.trim();

      await chosen.click();

      // Still exactly one chosen, still the same one, and still announced as chosen.
      const after = page.locator(`${group} [role="option"][aria-selected="true"]`);
      await expect(after).toHaveCount(1);
      expect((await after.textContent())?.trim()).toBe(label);
    }

    // Choosing a different chip still works afterwards, so nothing was left inert.
    const other = page.locator('#contact-interest [role="option"][aria-selected="false"]').first();
    const otherLabel = (await other.textContent())?.trim();
    await other.click();
    await expect(
      page.locator('#contact-interest [role="option"][aria-selected="true"]'),
    ).toHaveText(otherLabel ?? '');

    // And the form still renders: the regression broke change detection, not just the value.
    await expect(page.locator('#contact-form-title')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('a server-rejected field is named, focused, and clears when corrected', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill(validationRejection(['email'])));

    await fillValidForm(page);
    await page.locator('button[type="submit"]').click();

    // The field the API rejected carries the error, and no other field does.
    const emailError = page
      .locator('#contact-email')
      .locator('xpath=ancestor::mat-form-field')
      .locator('mat-error');
    await expect(emailError).toBeVisible();
    await expect(emailError).not.toHaveText('');
    await expect(page.locator('app-contact-form mat-error')).toHaveCount(1);

    // Focused by name, not by hunting for `.ng-invalid`: the class binding may not have been
    // applied yet in the task `submit()` resolves in.
    await expect(page.locator('#contact-email')).toBeFocused();

    // Input is preserved, so the rejection is correctable in place.
    await expect(page.locator('#contact-name')).toHaveValue('Ada Lovelace');
    await expect(page.locator('#contact-email')).toHaveValue('ada@example.com');

    // Editing the field clears it - `submissionErrors` is a linkedSignal sourced on the value.
    await page.locator('#contact-email').fill('ada@nexora.example');
    await expect(emailError).toHaveCount(0);
  });

  test('a rejection the API does not pin to a field stays a plain failure', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          statusCode: 503,
          message: 'The message could not be stored right now. Please try again shortly.',
        }),
      }),
    );

    await fillValidForm(page);
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.mat-mdc-snack-bar-container')).toBeVisible();
    // No field is blamed for an outage, so nothing in the form turns red.
    await expect(page.locator('app-contact-form mat-error')).toHaveCount(0);
    await expect(page.locator('#contact-email')).toHaveValue('ada@example.com');
  });
});

/** Second-pass fixes: in-flight input, subscript reserve and option rhythm. */
test.describe('contact form second-pass states', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1500 } });

  test('refuses input while a submission is in flight, then restores it', async ({ page }) => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/api/contact', async (route) => {
      await held;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/contact');
    await page.locator('app-contact-form form.form').waitFor();
    await fillValidForm(page);
    await page.locator('button[type="submit"]').click();

    const typed = ['#contact-name', '#contact-email', '#contact-company', '#contact-description'];
    // The DOM property, not the attribute: Angular's binding renders `readonly="true"`, and the
    // property is what actually refuses the keystrokes.
    const readOnlyFlags = () =>
      page.evaluate(
        (selectors) =>
          selectors.map((s) => (document.querySelector(s) as HTMLInputElement).readOnly),
        typed,
      );
    expect(await readOnlyFlags()).toEqual([true, true, true, true]);

    // `readonly` rather than `disabled`: the control keeps its place in the tab order, so a
    // visitor's focus is not moved mid-send.
    expect(
      await page.locator('#contact-name').evaluate((el) => (el as HTMLInputElement).tabIndex),
    ).toBe(0);

    // Keystrokes are refused rather than accepted and then thrown away by the reset.
    await page.locator('#contact-name').click();
    await page.keyboard.type('XXXX');
    await expect(page.locator('#contact-name')).toHaveValue('Ada Lovelace');

    release();
    await expect(page.locator('app-contact-form form.form')).toHaveAttribute('aria-busy', 'false');
    await expect.poll(readOnlyFlags, { timeout: 2000 }).toEqual([false, false, false, false]);
    await expect(page.locator('#contact-name')).toHaveValue('');
  });

  test('select options follow the form’s 52px control rhythm', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('app-contact-form form.form').waitFor();
    await page.locator('#contact-service').click();
    await expect(page.locator('mat-option').first()).toBeVisible();
    const h = await page
      .locator('mat-option')
      .first()
      .evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(h).toBe(52);
  });

  /**
   * The description carries a hint and a counter at a 16px subscript, so on a narrow column they
   * wrap to two lines. Material positions that wrapper absolutely inside a 24px subscript, so the
   * overflow used to run into the gap below and leave the next field exactly 0px of clearance -
   * in hy and ru as wide as 600px.
   */
  test.describe('the description hints never crowd the next field', () => {
    for (const [locale, path] of [
      ['en', '/contact'],
      ['hy', '/hy/contact'],
      ['ru', '/ru/contact'],
    ] as const) {
      for (const width of [390, 600]) {
        test(`${locale} at ${width}px`, async ({ page }) => {
          await page.setViewportSize({ width, height: 1500 });
          await page.goto(path);
          await page.locator('app-contact-form form.form').waitFor();
          await page.evaluate(() => document.fonts.ready);

          const clearance = await page.evaluate(() => {
            const field = document
              .querySelector('#contact-description')!
              .closest('mat-form-field')!;
            const start = field.querySelector(
              '.mat-mdc-form-field-hint-start, .mat-mdc-form-field-hint',
            )!;
            const end = field.querySelector('.mat-mdc-form-field-hint-end')!;
            const next = document.querySelectorAll('.form__group')[1].querySelector('.form__row')!;
            const bottom = Math.max(
              start.getBoundingClientRect().bottom,
              end.getBoundingClientRect().bottom,
            );
            return Math.round(next.getBoundingClientRect().top - bottom);
          });
          expect(clearance, `clearance in ${locale} at ${width}px`).toBeGreaterThan(0);
          expect(await noOverflow(page)).toBeLessThanOrEqual(0);
        });
      }
    }
  });
});
