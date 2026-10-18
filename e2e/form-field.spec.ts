import { expect, test } from '@playwright/test';
import { resolveColorToken, rootTokenValue } from './support/contrast';

/**
 * Text field theme contract (Text Field.png + agreed decisions). Overridden
 * tokens are custom properties on the root; untouched Material defaults are
 * asserted absent; structural rules are read from the served stylesheet.
 */
const untouched = async (page: Parameters<typeof rootTokenValue>[0], token: string) =>
  expect(await rootTokenValue(page, token), `${token} must keep Material's default`).toBe('');

test.describe('text field theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('box: 52px, 12px radius, 1px outline border, 16px inset kept', async ({ page }) => {
    expect(await rootTokenValue(page, '--mat-form-field-container-height')).toBe('52px');
    expect(await rootTokenValue(page, '--mat-form-field-container-vertical-padding')).toBe('14px');
    expect(await rootTokenValue(page, '--mat-form-field-outlined-container-shape')).toBe('12px');
    await untouched(page, '--mat-form-field-outlined-outline-width'); // 1px
    expect(await resolveColorToken(page, '--mat-form-field-outlined-outline-color')).toEqual({
      r: 203 / 255,
      g: 213 / 255,
      b: 225 / 255,
      a: 1,
    }); // #CBD5E1
  });

  test('focus and error borders: 2px primary / 2px error; hover does not change the border', async ({
    page,
    request,
  }) => {
    // Error outline is 2px like focus (Material draws it 1px when unfocused).
    const css = (await (await request.get('/styles.css')).text()).replace(/\s+/g, ' ');
    expect(css).toMatch(
      /\.mdc-text-field--outlined:not\(\.mdc-text-field--disabled\)\.mdc-text-field--invalid \.mat-mdc-notch-piece \{ border-width: var\(--mat-form-field-outlined-focus-outline-width, 2px\); \}/,
    );
    await untouched(page, '--mat-form-field-outlined-focus-outline-color'); // primary
    await untouched(page, '--mat-form-field-outlined-focus-outline-width'); // 2px
    await untouched(page, '--mat-form-field-outlined-error-outline-color'); // error
    await untouched(page, '--mat-form-field-outlined-error-focus-outline-color'); // error
    expect(await resolveColorToken(page, '--mat-form-field-outlined-hover-outline-color')).toEqual(
      await resolveColorToken(page, '--mat-sys-outline'),
    );
    expect(
      await resolveColorToken(page, '--mat-form-field-outlined-error-hover-outline-color'),
    ).toEqual(await resolveColorToken(page, '--mat-sys-error'));
  });

  test('text: on-surface value, on-surface-muted placeholder, body-large size untouched', async ({
    page,
  }) => {
    await untouched(page, '--mat-form-field-outlined-input-text-color'); // on-surface
    await untouched(page, '--mat-form-field-container-text-size'); // body-large 1rem
    expect(
      await resolveColorToken(page, '--mat-form-field-outlined-input-text-placeholder-color'),
    ).toEqual(await resolveColorToken(page, '--nx-sys-on-surface-muted'));
  });

  test('disabled binds to the project disabled tokens', async ({ page }) => {
    const onSurface = await resolveColorToken(page, '--mat-sys-on-surface');
    const expectAlpha = async (token: string, alpha: number) => {
      const c = await resolveColorToken(page, token);
      expect(c.r, token).toBeCloseTo(onSurface.r, 2);
      expect(c.g, token).toBeCloseTo(onSurface.g, 2);
      expect(c.b, token).toBeCloseTo(onSurface.b, 2);
      expect(c.a, token).toBeCloseTo(alpha, 2);
    };
    await expectAlpha('--mat-form-field-outlined-disabled-outline-color', 0.12);
    await expectAlpha('--mat-form-field-outlined-disabled-input-text-color', 0.38);
    await expectAlpha('--mat-form-field-disabled-input-text-placeholder-color', 0.38);
  });

  test('hint and error: Body/Small 14/22, on-surface-variant hint, 8px below, edge-aligned', async ({
    page,
    request,
  }) => {
    expect(await rootTokenValue(page, '--mat-sys-body-small')).toMatch(
      /^400 0?\.875rem \/ 1\.375rem Inter\b/,
    );
    await untouched(page, '--mat-form-field-subscript-text-size'); // bound to body-small
    await untouched(page, '--mat-form-field-error-text-color'); // error

    const css = (await (await request.get('/styles.css')).text()).replace(/\s+/g, ' ');
    expect(css).toMatch(/\.mat-mdc-form-field-hint \{ color: var\(--mat-sys-on-surface-variant\); \}/);
    expect(css).toMatch(
      /\.mat-mdc-form-field \.mat-mdc-form-field-subscript-wrapper \{ margin-block-start: var\(--nx-space-8\); \}/,
    );
    expect(css).toMatch(
      /\.mat-mdc-form-field \.mat-mdc-form-field-hint-wrapper, \.mat-mdc-form-field \.mat-mdc-form-field-error-wrapper \{ padding-inline: 0; \}/,
    );
  });

  test('label role: title-small is 14/20 (weight raised in the component)', async ({ page }) => {
    expect(await rootTokenValue(page, '--mat-sys-title-small-size')).toBe('0.875rem');
    expect(await rootTokenValue(page, '--mat-sys-title-small-line-height')).toBe('1.25rem');
    expect(await rootTokenValue(page, '--mat-sys-title-small-weight')).toBe('500');
  });
});
