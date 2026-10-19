import { expect, test } from '@playwright/test';
import { parseCssColor, resolveColorToken, rootTokenValue } from './support/contrast';

/**
 * Snack bar theme contract (Snackbar.png + agreed decisions: 12px radius, level-3 shadow,
 * 60px container, 16px message, "Dismiss" in Label/Large 600, neutral/success/error icon
 * tones on the inverse surface). Overridden tokens are custom properties on the root;
 * structural rules are read from the served stylesheet.
 */
const untouched = async (page: Parameters<typeof rootTokenValue>[0], token: string) =>
  expect(await rootTokenValue(page, token), `${token} must keep Material's default`).toBe('');

test.describe('snack bar theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('container: 12px radius on the inverse surface with inverse-on-surface text', async ({
    page,
  }) => {
    expect(await rootTokenValue(page, '--mat-snack-bar-container-shape')).toBe('12px');
    expect(await rootTokenValue(page, '--mat-sys-corner-medium')).toBe('12px');
    // Material's own defaults already resolve to the Nexora inverse roles.
    await untouched(page, '--mat-snack-bar-container-color');
    await untouched(page, '--mat-snack-bar-supporting-text-color');
    await untouched(page, '--mat-snack-bar-button-color');
    expect(await resolveColorToken(page, '--mat-sys-inverse-surface')).toEqual(
      parseCssColor('rgb(6, 11, 23)'),
    );
    expect(await resolveColorToken(page, '--mat-sys-inverse-on-surface')).toEqual(
      parseCssColor('rgb(246, 248, 251)'),
    );
    expect(await resolveColorToken(page, '--mat-sys-inverse-primary')).toEqual(
      parseCssColor('rgb(134, 173, 255)'),
    );
  });

  test('message in Body/Large 16/24 Regular, action in Label/Large 15/20 Semibold', async ({
    page,
  }) => {
    expect(await rootTokenValue(page, '--mat-snack-bar-supporting-text-size')).toBe('1rem');
    expect(await rootTokenValue(page, '--mat-snack-bar-supporting-text-line-height')).toBe(
      '1.5rem',
    );
    expect(await rootTokenValue(page, '--mat-snack-bar-supporting-text-weight')).toBe('400');
    expect(await rootTokenValue(page, '--mat-snack-bar-supporting-text-font')).toMatch(/^Inter\b/);
    // The action is a Material text button: it reads label-large through the button tokens.
    await untouched(page, '--mat-button-text-label-text-size');
    await untouched(page, '--mat-button-text-label-text-weight');
    expect(await rootTokenValue(page, '--mat-sys-label-large-size')).toBe('0.9375rem');
    expect(await rootTokenValue(page, '--mat-sys-label-large-weight')).toBe('600');
  });

  test('icon tones: inverse-primary, inverse-success, inverse-error', async ({ page }) => {
    expect(await resolveColorToken(page, '--nx-sys-inverse-success')).toEqual(
      parseCssColor('rgb(110, 231, 183)'),
    ); // #6EE7B7
    expect(await resolveColorToken(page, '--nx-sys-inverse-error')).toEqual(
      parseCssColor('rgb(252, 165, 165)'),
    ); // #FCA5A5
  });

  test('structure: 60px surface with level-3 shadow and an inverse-primary focus ring', async ({
    request,
  }) => {
    const css = (await (await request.get('/styles.css')).text()).replace(/\s+/g, ' ');
    expect(css).toMatch(
      /\.mat-mdc-snack-bar-container \.mat-mdc-snackbar-surface \{ min-height: 60px; box-shadow: var\(--mat-sys-level3\); \}/,
    );
    expect(css).toMatch(
      /\.mat-mdc-snack-bar-container \.mat-mdc-button \{ --mat-focus-indicator-border-color: var\(--mat-sys-inverse-primary\); \}/,
    );
  });
});
