import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { PRODUCT_IDS } from '../src/app/pages/our-work/products/data/product-ids';

/**
 * The two product pages that also get the full locale and phone-width sweep: one that links out
 * to a live product and one with no destination, which render a different set of controls.
 * Every product page is swept at the default locale by `PRODUCT_PAGES` below.
 */
const REPRESENTATIVE_PRODUCTS = ['our_work/draculai', 'our_work/roar-organic'] as const;

/**
 * Every product page, derived from the route table rather than hand-picked.
 *
 * This list used to name two of the twenty-four, and the critical violation this suite exists to
 * catch (three gallery buttons with no accessible name, on `connected-car`) sat on one of the
 * seventeen that were never swept. Deriving it means a product cannot be added without being
 * checked.
 */
const PRODUCT_PAGES = PRODUCT_IDS.map((id) => `our_work/${id}`);

const PAGES = [
  '',
  'services',
  'services/ai_agent',
  'solutions',
  'about',
  'engagement-models',
  'partnerships',
  'contact',
  'our_work',
  ...REPRESENTATIVE_PRODUCTS,
  'not-found',
] as const;

const LOCALES = ['', 'hy', 'ru'] as const;

const urlFor = (locale: string, page: string) => `/${[locale, page].filter(Boolean).join('/')}`;

const ready = async (page: Page) => {
  await page.locator('main').waitFor();
  await page.locator('button.header__lang').waitFor({ state: 'attached' });
};

const analyse = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

const summarise = (violations: Awaited<ReturnType<typeof analyse>>['violations']) =>
  violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}) x${violation.nodes.length}: ${violation.help}\n` +
        violation.nodes
          .slice(0, 3)
          .map((node) => `      ${node.target.join(' ')}`)
          .join('\n'),
    )
    .join('\n    ');

test.describe('accessibility', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const locale of LOCALES) {
    for (const page of PAGES) {
      const url = urlFor(locale, page);
      test(`${url} has no WCAG 2.2 AA violations`, async ({ page: browserPage }) => {
        await browserPage.goto(url);
        await ready(browserPage);

        const { violations } = await analyse(browserPage);
        expect(violations, `\n    ${summarise(violations)}\n`).toEqual([]);
      });
    }
  }
});

test.describe('accessibility at a phone width', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const page of PAGES) {
    const url = urlFor('', page);
    test(`${url} has no WCAG 2.2 AA violations at 390px`, async ({ page: browserPage }) => {
      await browserPage.goto(url);
      await ready(browserPage);

      const { violations } = await analyse(browserPage);
      expect(violations, `\n    ${summarise(violations)}\n`).toEqual([]);
    });
  }
});

test.describe('accessibility of every product page', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // The default locale only: a missing `photoAlts` entry shortens the array for all three
  // locales at once, so it shows up here whichever one is swept. The two representatives above
  // carry the per-locale and phone-width coverage.
  for (const page of PRODUCT_PAGES) {
    const url = urlFor('', page);
    test(`${url} has no WCAG 2.2 AA violations`, async ({ page: browserPage }) => {
      await browserPage.goto(url);
      await ready(browserPage);

      const { violations } = await analyse(browserPage);
      expect(
        violations,
        `
    ${summarise(violations)}
`,
      ).toEqual([]);
    });
  }
});

test.describe('accessibility of states the sweep cannot reach on load', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the contact form is accessible once it is showing its errors', async ({ page }) => {
    await page.goto('/contact');
    await ready(page);
    await page.locator('app-contact-form button[type="submit"]').click();
    await page.locator('app-contact-form mat-error').first().waitFor();

    const { violations } = await analyse(page);
    expect(violations, `\n    ${summarise(violations)}\n`).toEqual([]);
    const email = page.locator('#contact-email');
    await expect(email).toHaveClass(/ng-invalid/);

    const describedBy = await email.getAttribute('aria-describedby');
    expect(describedBy, 'the email field must name its error').toBeTruthy();

    const description = page.locator(`#${describedBy}`);
    await expect(description).toBeVisible();
    await expect(description).not.toBeEmpty();
  });

  // A project card used to hide half of itself behind a flip, and that hidden half needed its
  // own sweep here. The second face was removed with the "Details" button that opened it, so
  // the card has no state the sweep above cannot already see. `our-work.touch.spec.ts` covers
  // the one context this file cannot reach: a device where `hover: none` matches.

  /**
   * The full-size image view, which exists only after a click: the sweeps above never see the
   * dialog's own tree. A modal `<dialog>` is also where the accessible name and a reachable
   * close control matter most, because the rest of the page is unreachable while it is up.
   */
  test('the full-size image view is accessible while it is open', async ({ page }) => {
    await page.goto('/our_work/libra-analytics');
    await ready(page);

    await page.locator('.gallery__viewport').click();
    await expect(page.locator('dialog.gallery__lightbox')).toBeVisible();

    const { violations } = await analyse(page);
    expect(
      violations,
      `
    ${summarise(violations)}
`,
    ).toEqual([]);
  });

  test('the mobile navigation is accessible while open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await ready(page);

    const toggle = page.locator('app-header button.header__menu');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const { violations } = await analyse(page);
    expect(violations, `\n    ${summarise(violations)}\n`).toEqual([]);
  });
});
