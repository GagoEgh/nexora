import { expect, test } from '@playwright/test';
import { resolveColorToken, rootTokenValue } from './support/contrast';

/**
 * Checkbox theme contract (Checkbox.png + agreed decisions: 20px box, label in Body/Small
 * 14/22 starting 12px after the state layer and centred on its first line, error border when
 * touched and invalid, every other state at Material's default). Overridden tokens are custom
 * properties on the root; structural rules are read from the served stylesheet.
 */
const untouched = async (page: Parameters<typeof rootTokenValue>[0], token: string) =>
  expect(await rootTokenValue(page, token), `${token} must keep Material's default`).toBe('');

test.describe('checkbox theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('colours stay at Material defaults: on-surface-variant border, primary fill, on-primary check', async ({
    page,
  }) => {
    await untouched(page, '--mat-checkbox-unselected-icon-color');
    await untouched(page, '--mat-checkbox-selected-icon-color');
    await untouched(page, '--mat-checkbox-selected-checkmark-color');
    await untouched(page, '--mat-checkbox-label-text-color');
    await untouched(page, '--mat-checkbox-unselected-hover-state-layer-color');
    await untouched(page, '--mat-checkbox-selected-hover-state-layer-color');
    expect(await resolveColorToken(page, '--mat-sys-on-surface-variant')).toEqual({
      r: 71 / 255,
      g: 85 / 255,
      b: 105 / 255,
      a: 1,
    }); // #475569
  });

  test('label: Body/Small 14/22 through the checkbox label tokens', async ({ page }) => {
    expect(await rootTokenValue(page, '--mat-checkbox-label-text-size')).toBe('0.875rem');
    expect(await rootTokenValue(page, '--mat-checkbox-label-text-line-height')).toBe('1.375rem');
    expect(await rootTokenValue(page, '--mat-checkbox-label-text-weight')).toBe('400');
    expect(await rootTokenValue(page, '--mat-checkbox-label-text-font')).toMatch(/^Inter\b/);
    expect(await rootTokenValue(page, '--mat-checkbox-state-layer-size')).toBe('40px');
  });

  test('structure: 20px box, 12px label inset, first-line centring, error border', async ({
    request,
  }) => {
    const css = (await (await request.get('/styles.css')).text()).replace(/\s+/g, ' ');
    expect(css).toMatch(
      /\.mat-mdc-checkbox \{ --nx-checkbox-size: 20px; --nx-checkbox-inset: calc\(\(var\(--mat-checkbox-state-layer-size\) - var\(--nx-checkbox-size\)\) \/ 2\); \}/,
    );
    expect(css).toMatch(
      /\.mat-mdc-checkbox \.mdc-checkbox \{ flex-basis: var\(--nx-checkbox-size\); width: var\(--nx-checkbox-size\); height: var\(--nx-checkbox-size\); padding: var\(--nx-checkbox-inset\); \}/,
    );
    expect(css).toMatch(
      /\.mat-mdc-checkbox \.mdc-checkbox__background \{ width: var\(--nx-checkbox-size\); height: var\(--nx-checkbox-size\); top: var\(--nx-checkbox-inset\); left: var\(--nx-checkbox-inset\); \}/,
    );
    expect(css).toMatch(
      /\.mat-mdc-checkbox \.mat-internal-form-field \{ align-items: flex-start; \}/,
    );
    expect(css).toMatch(
      /\.mat-mdc-checkbox \.mat-internal-form-field > \.mat-internal-form-field-label \{ padding-inline-start: var\(--nx-space-12\); padding-block-start: calc\(\(var\(--mat-checkbox-state-layer-size\) - var\(--mat-checkbox-label-text-line-height\)\) \/ 2\); \}/,
    );
    expect(css).toMatch(
      /\.mat-mdc-checkbox\.ng-invalid\.ng-touched \.mdc-checkbox__background \{ border-color: var\(--mat-sys-error\); \}/,
    );
  });
});
