import { expect, test } from '@playwright/test';
import { contrastRatio, parseCssColor, resolveColorToken, rootTokenValue } from './support/contrast';

const AA_TEXT = 4.5;
const AA_NON_TEXT = 3;

const TEXT_PAIRS: [string, string][] = [
  ['--mat-sys-on-primary', '--mat-sys-primary'],
  ['--mat-sys-on-primary-container', '--mat-sys-primary-container'],
  ['--mat-sys-on-secondary', '--mat-sys-secondary'],
  ['--mat-sys-on-secondary-container', '--mat-sys-secondary-container'],
  ['--mat-sys-on-tertiary', '--mat-sys-tertiary'],
  ['--mat-sys-on-tertiary-container', '--mat-sys-tertiary-container'],
  ['--mat-sys-on-background', '--mat-sys-background'],
  ['--mat-sys-on-surface', '--mat-sys-surface'],
  ['--mat-sys-on-surface', '--mat-sys-surface-container-high'],
  ['--mat-sys-on-surface-variant', '--mat-sys-surface'],
  ['--mat-sys-on-surface-variant', '--mat-sys-surface-container-high'],
  ['--nx-sys-on-surface-muted', '--mat-sys-surface'],
  ['--mat-sys-primary', '--mat-sys-surface'],
  ['--mat-sys-primary', '--mat-sys-background'],
  ['--mat-sys-inverse-on-surface', '--mat-sys-inverse-surface'],
  ['--mat-sys-inverse-primary', '--mat-sys-inverse-surface'],
  ['--mat-sys-inverse-primary', '--nx-sys-inverse-surface-container'],
  ['--nx-sys-inverse-on-surface-variant', '--mat-sys-inverse-surface'],
  ['--nx-sys-inverse-on-surface-variant', '--nx-sys-inverse-surface-container'],
  ['--nx-sys-inverse-success', '--mat-sys-inverse-surface'],
  ['--nx-sys-inverse-error', '--mat-sys-inverse-surface'],
  ['--mat-sys-error', '--mat-sys-surface'],
  ['--mat-sys-on-error', '--mat-sys-error'],
  ['--mat-sys-on-error-container', '--mat-sys-error-container'],
  ['--nx-sys-success', '--mat-sys-surface'],
  ['--nx-sys-on-success', '--nx-sys-success'],
  ['--nx-sys-on-success-container', '--nx-sys-success-container'],
  ['--nx-sys-warning', '--mat-sys-surface'],
  ['--nx-sys-on-warning', '--nx-sys-warning'],
  ['--nx-sys-on-warning-container', '--nx-sys-warning-container'],
];

const NON_TEXT_PAIRS: [string, string][] = [
  ['--nx-sys-outline-strong', '--mat-sys-surface'],
  ['--nx-sys-outline-strong', '--mat-sys-surface-container-high'],
  ['--nx-sys-focus-ring-color', '--mat-sys-surface'],
  ['--nx-sys-focus-ring-color', '--mat-sys-surface-container-high'],
  ['--nx-sys-focus-ring-color', '--mat-sys-inverse-surface'],
];

test.describe('colour tokens', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('contrast helper matches WCAG reference values', () => {
    const black = parseCssColor('rgb(0, 0, 0)');
    const white = parseCssColor('rgb(255, 255, 255)');
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5);
    // #767676 on white is the canonical 4.54:1 AA boundary example.
    expect(contrastRatio(parseCssColor('rgb(118, 118, 118)'), white)).toBeCloseTo(4.54, 2);
  });

  for (const [fg, bg] of TEXT_PAIRS) {
    test(`${fg} on ${bg} meets AA for normal text`, async ({ page }) => {
      const ratio = contrastRatio(
        await resolveColorToken(page, fg),
        await resolveColorToken(page, bg),
      );
      expect(ratio, `${fg} on ${bg} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_TEXT);
    });
  }

  for (const [fg, bg] of NON_TEXT_PAIRS) {
    test(`${fg} on ${bg} meets 3:1 for non-text`, async ({ page }) => {
      const ratio = contrastRatio(
        await resolveColorToken(page, fg),
        await resolveColorToken(page, bg),
      );
      expect(ratio, `${fg} on ${bg} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NON_TEXT);
    });
  }

  test('brand roles are pinned to the specification values', async ({ page }) => {
    const expected: Record<string, string> = {
      '--mat-sys-primary': 'rgb(15, 85, 232)',
      '--mat-sys-secondary': 'rgb(18, 174, 235)',
      '--mat-sys-on-surface': 'rgb(11, 19, 36)',
      '--mat-sys-background': 'rgb(250, 251, 253)',
      '--mat-sys-outline': 'rgb(203, 213, 225)',
      '--mat-sys-error': 'rgb(220, 38, 38)',
    };
    for (const [token, rgb] of Object.entries(expected)) {
      expect(await resolveColorToken(page, token), token).toEqual(parseCssColor(rgb));
    }
  });

  test('interaction states use M3 state-layer opacities, not a hover colour token', async ({
    page,
  }) => {
    expect(await rootTokenValue(page, '--mat-sys-hover-state-layer-opacity')).toBe('0.08');
    expect(await rootTokenValue(page, '--mat-sys-focus-state-layer-opacity')).toBe('0.12');
    expect(await rootTokenValue(page, '--mat-sys-pressed-state-layer-opacity')).toBe('0.12');
    expect(await rootTokenValue(page, '--mat-sys-dragged-state-layer-opacity')).toBe('0.16');
    expect(await rootTokenValue(page, '--mat-sys-primary-hover')).toBe('');
    expect(await rootTokenValue(page, '--nx-sys-primary-hover')).toBe('');
  });

  test('disabled roles derive from on-surface at the M3 opacities', async ({ page }) => {
    const onSurface = await resolveColorToken(page, '--mat-sys-on-surface');
    const content = await resolveColorToken(page, '--nx-sys-disabled-content');
    const container = await resolveColorToken(page, '--nx-sys-disabled-container');
    const outline = await resolveColorToken(page, '--nx-sys-disabled-outline');
    for (const c of [content, container, outline]) {
      expect(c.r).toBeCloseTo(onSurface.r, 2);
      expect(c.g).toBeCloseTo(onSurface.g, 2);
      expect(c.b).toBeCloseTo(onSurface.b, 2);
    }
    expect(content.a).toBeCloseTo(0.38, 2);
    expect(container.a).toBeCloseTo(0.12, 2);
    expect(outline.a).toBeCloseTo(0.12, 2);
  });

  test('focus ring tokens are defined and bound to Material strong focus indicators', async ({
    page,
  }) => {
    expect(await rootTokenValue(page, '--nx-sys-focus-ring-width')).toBe('3px');
    expect(await rootTokenValue(page, '--nx-sys-focus-ring-offset')).toBe('2px');
    expect(await resolveColorToken(page, '--mat-focus-indicator-border-color')).toEqual(
      await resolveColorToken(page, '--nx-sys-focus-ring-color'),
    );
    expect(await rootTokenValue(page, '--mat-focus-indicator-border-width')).toBe('3px');
    expect(await rootTokenValue(page, '--mat-focus-indicator-display')).toBe('block');
  });
});
