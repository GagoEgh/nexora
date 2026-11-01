import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const PAGES = [
  '',
  'services',
  'services/ai_agent',
  'solutions',
  'about',
  'engagement-models',
  'partnerships',
  'contact',
  'not-found',
] as const;

const LOCALES = ['', 'hy', 'ru'] as const;

const urlFor = (locale: string, page: string) => `/${[locale, page].filter(Boolean).join('/')}`;

const ready = async (page: Page) => {
  await page.locator('main').waitFor();
  await page.locator('button.header__lang').waitFor({ state: 'attached' });
};

const analyse = (page: Page) =>
  new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

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
      test(`${url} has no WCAG 2.1 AA violations`, async ({ page: browserPage }) => {
        await browserPage.goto(url);
        await ready(browserPage);

        const { violations } = await analyse(browserPage);
        expect(violations, `\n    ${summarise(violations)}\n`).toEqual([]);
      });
    }
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
