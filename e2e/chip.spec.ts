import { expect, test } from '@playwright/test';
import { resolveColorToken, rootTokenValue } from './support/contrast';

/**
 * Chip theme contract (Chip.png + agreed decisions: action chips, #CBD5E1 border,
 * 12px before the leading icon, 13px label). Overridden tokens are custom
 * properties on the root; structural rules are read from the served stylesheet.
 */
const untouched = async (page: Parameters<typeof rootTokenValue>[0], token: string) =>
  expect(await rootTokenValue(page, token), `${token} must keep Material's default`).toBe('');

test.describe('chip theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('container: 36px, 8px radius, surface fill, outline border', async ({ page }) => {
    expect(await rootTokenValue(page, '--mat-chip-container-height')).toBe('36px');
    await untouched(page, '--mat-chip-container-shape-radius'); // Material default 8px = Foundations chips 8px
    await untouched(page, '--mat-chip-outline-width'); // 1px
    expect(await resolveColorToken(page, '--mat-chip-elevated-container-color')).toEqual(
      await resolveColorToken(page, '--mat-sys-surface'),
    );
    expect(await resolveColorToken(page, '--mat-chip-outline-color')).toEqual({
      r: 203 / 255,
      g: 213 / 255,
      b: 225 / 255,
      a: 1,
    }); // #CBD5E1
  });

  test('label: on-surface in Label/Medium 13/18 Medium (Inter)', async ({ page }) => {
    expect(await resolveColorToken(page, '--mat-chip-label-text-color')).toEqual(
      await resolveColorToken(page, '--mat-sys-on-surface'),
    );
    expect(await rootTokenValue(page, '--mat-chip-label-text-size')).toBe('0.8125rem');
    expect(await rootTokenValue(page, '--mat-chip-label-text-line-height')).toBe('1.125rem');
    expect(await rootTokenValue(page, '--mat-chip-label-text-weight')).toBe('500');
    expect(await rootTokenValue(page, '--mat-chip-label-text-font')).toMatch(/^Inter\b/);
    expect(await rootTokenValue(page, '--mat-sys-label-medium')).toMatch(
      /^500 0?\.8125rem \/ 1\.125rem Inter\b/,
    );
  });

  test('leading icon: 18px box in primary, 12px inset', async ({ page, request }) => {
    expect(await resolveColorToken(page, '--mat-chip-with-icon-icon-color')).toEqual(
      await resolveColorToken(page, '--mat-sys-primary'),
    );
    expect(await rootTokenValue(page, '--mat-chip-with-avatar-avatar-size')).toBe('18px');
    await untouched(page, '--mat-chip-with-icon-icon-size'); // 18px

    const css = (await (await request.get('/styles.css')).text()).replace(/\s+/g, ' ');
    expect(css).toMatch(
      /\.mat-mdc-chip\.mat-mdc-standard-chip\.mdc-evolution-chip--with-primary-graphic \.mdc-evolution-chip__graphic \{ padding-inline-start: var\(--nx-space-12\); \}/,
    );
    expect(css).toMatch(/button\.mat-mdc-chip \{[^}]*appearance: none;[^}]*border: 0;[^}]*padding: 0;[^}]*font: inherit;/);
  });

  test('active (highlighted): primary-container with on-primary-container content', async ({
    page,
  }) => {
    const onActive = await resolveColorToken(page, '--mat-sys-on-primary-container');
    expect(await resolveColorToken(page, '--mat-chip-elevated-selected-container-color')).toEqual(
      await resolveColorToken(page, '--mat-sys-primary-container'),
    );
    for (const token of [
      '--mat-chip-selected-label-text-color',
      '--mat-chip-with-icon-selected-icon-color',
      '--mat-chip-selected-trailing-icon-color',
      '--mat-chip-selected-hover-state-layer-color',
      '--mat-chip-selected-focus-state-layer-color',
    ]) {
      expect(await resolveColorToken(page, token), token).toEqual(onActive);
    }
    await untouched(page, '--mat-chip-flat-selected-outline-width'); // 0: no border when active
    await untouched(page, '--mat-chip-hover-state-layer-color'); // on-surface-variant
    await untouched(page, '--mat-chip-hover-state-layer-opacity'); // system 0.08
  });
});
