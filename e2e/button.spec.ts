import { expect, test } from '@playwright/test';
import { resolveColorToken, rootTokenValue } from './support/contrast';

/**
 * Button theme contract (Button.png + agreed decisions).
 *
 * `mat.button-overrides()` emits only the overridden tokens as custom properties
 * on the root element; Material's defaults stay inside the component styles as
 * fallbacks. So the first block asserts (a) every override we rely on and (b) that
 * tokens meant to keep Material's default are NOT overridden. Rendering
 * real buttons needs a page that shows them; none exists yet.
 */
const VARIANTS = ['filled', 'tonal', 'outlined', 'text'] as const;

const untouched = async (page: Parameters<typeof rootTokenValue>[0], token: string) =>
  expect(await rootTokenValue(page, token), `${token} must keep Material's default`).toBe('');

test.describe('button theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('all variants are 48px tall and keep full padding beside a trailing icon', async ({
    page,
  }) => {
    for (const v of VARIANTS) {
      expect(await rootTokenValue(page, `--mat-button-${v}-container-height`), v).toBe('48px');
      expect(await rootTokenValue(page, `--mat-button-${v}-icon-offset`), v).toBe('0');
      await untouched(page, `--mat-button-${v}-horizontal-padding`); // Material: 24px (text: 12/16px)
      await untouched(page, `--mat-button-${v}-icon-spacing`); // Material: 8px
      await untouched(page, `--mat-button-${v}-container-shape`); // Material: corner-full (pill)
    }
  });

  test('filled: on-surface state layer, 20% hover, Material default pressed/focus', async ({
    page,
  }) => {
    expect(await resolveColorToken(page, '--mat-button-filled-state-layer-color')).toEqual(
      await resolveColorToken(page, '--mat-sys-on-surface'),
    );
    expect(await rootTokenValue(page, '--mat-button-filled-hover-state-layer-opacity')).toBe('0.2');
    await untouched(page, '--mat-button-filled-pressed-state-layer-opacity'); // system 0.12
    await untouched(page, '--mat-button-filled-focus-state-layer-opacity'); // system 0.12
    await untouched(page, '--mat-button-filled-container-color'); // primary
    await untouched(page, '--mat-button-filled-label-text-color'); // on-primary
    expect(await rootTokenValue(page, '--mat-sys-pressed-state-layer-opacity')).toBe('0.12');
  });

  test('tonal: primary-container roles with a primary state layer', async ({ page }) => {
    expect(await resolveColorToken(page, '--mat-button-tonal-container-color')).toEqual(
      await resolveColorToken(page, '--mat-sys-primary-container'),
    );
    expect(await resolveColorToken(page, '--mat-button-tonal-label-text-color')).toEqual(
      await resolveColorToken(page, '--mat-sys-on-primary-container'),
    );
    expect(await resolveColorToken(page, '--mat-button-tonal-state-layer-color')).toEqual(
      await resolveColorToken(page, '--mat-sys-primary'),
    );
    await untouched(page, '--mat-button-tonal-hover-state-layer-opacity'); // system 0.08
  });

  test('outlined and text: Material primary labels, outline border per Button.png', async ({
    page,
  }) => {
    for (const v of ['outlined', 'text'] as const) {
      await untouched(page, `--mat-button-${v}-label-text-color`); // primary
      await untouched(page, `--mat-button-${v}-state-layer-color`); // primary
      await untouched(page, `--mat-button-${v}-hover-state-layer-opacity`); // system 0.08
    }
    expect(await resolveColorToken(page, '--mat-button-outlined-outline-color')).toEqual(
      await resolveColorToken(page, '--mat-sys-outline'),
    );
    expect(await resolveColorToken(page, '--mat-sys-outline')).toEqual(
      { r: 203 / 255, g: 213 / 255, b: 225 / 255, a: 1 }, // #CBD5E1
    );
    await untouched(page, '--mat-button-outlined-outline-width'); // 1px
  });

  test('focus ring: 2px flush ring, on-surface on filled, primary elsewhere, global ring untouched', async ({
    page,
    request,
  }) => {
    // Read from the served stylesheet: the ring tokens are scoped to button hosts, not the root.
    const css = (await (await request.get('/styles.css')).text()).replace(/\s+/g, ' ');
    /** Declarations of the rule whose full selector list is exactly `selector`. */
    const rule = (selector: string) => {
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = new RegExp(`(?:^|\\}) ?${escaped} ?\\{([^}]*)\\}`).exec(css);
      expect(match, `rule for ${selector}`).not.toBeNull();
      return match?.[1] ?? '';
    };
    const hosts = ['.mat-mdc-button', '.mat-mdc-unelevated-button', '.mat-mdc-outlined-button', '.mat-tonal-button'];

    const scoped = rule(hosts.join(', '));
    expect(scoped).toContain('--mat-focus-indicator-border-width: 2px');
    expect(scoped).toContain('--mat-focus-indicator-border-color: var(--mat-sys-primary)');
    expect(rule('.mat-mdc-unelevated-button')).toContain(
      '--mat-focus-indicator-border-color: var(--mat-sys-on-surface)',
    );
    expect(
      rule(hosts.map((h) => `${h}.mat-mdc-button-base .mat-focus-indicator::before`).join(', ')),
    ).toContain('margin: calc(var(--mat-focus-indicator-border-width) * -1)');

    // Global ring settings unchanged (styles.scss).
    expect(await rootTokenValue(page, '--nx-sys-focus-ring-width')).toBe('3px');
    expect(await rootTokenValue(page, '--nx-sys-focus-ring-offset')).toBe('2px');
    expect(await rootTokenValue(page, '--mat-focus-indicator-border-width')).toBe('3px');
    expect(await resolveColorToken(page, '--mat-focus-indicator-border-color')).toEqual(
      await resolveColorToken(page, '--nx-sys-focus-ring-color'),
    );
  });

  test('disabled: on-surface at 8% containers, on-surface-muted labels, outline-variant border', async ({
    page,
  }) => {
    const onSurface = await resolveColorToken(page, '--mat-sys-on-surface');
    const muted = await resolveColorToken(page, '--nx-sys-on-surface-muted');
    for (const v of ['filled', 'tonal'] as const) {
      const container = await resolveColorToken(page, `--mat-button-${v}-disabled-container-color`);
      expect(container.r, v).toBeCloseTo(onSurface.r, 2);
      expect(container.g, v).toBeCloseTo(onSurface.g, 2);
      expect(container.b, v).toBeCloseTo(onSurface.b, 2);
      expect(container.a, v).toBeCloseTo(0.08, 2);
    }
    for (const v of VARIANTS) {
      expect(await resolveColorToken(page, `--mat-button-${v}-disabled-label-text-color`), v).toEqual(
        muted,
      );
    }
    expect(await resolveColorToken(page, '--mat-button-outlined-disabled-outline-color')).toEqual(
      await resolveColorToken(page, '--mat-sys-outline-variant'),
    );
  });

  test('labels use Label/Large 15/20 Semi Bold in Inter', async ({ page }) => {
    // Button labels bind to the label-large system tokens (Material default binding, untouched).
    for (const v of VARIANTS) {
      await untouched(page, `--mat-button-${v}-label-text-font`);
      await untouched(page, `--mat-button-${v}-label-text-size`);
      await untouched(page, `--mat-button-${v}-label-text-weight`);
    }
    expect(await rootTokenValue(page, '--mat-sys-label-large-font')).toMatch(/^Inter\b/);
    expect(await rootTokenValue(page, '--mat-sys-label-large-size')).toBe('0.9375rem');
    expect(await rootTokenValue(page, '--mat-sys-label-large-line-height')).toBe('1.25rem');
    expect(await rootTokenValue(page, '--mat-sys-label-large-weight')).toBe('600');
    expect(await rootTokenValue(page, '--mat-sys-label-large')).toMatch(
      /^600 0?\.9375rem \/ 1\.25rem Inter\b/,
    );
    // The whole type scale now uses Inter (body copy included).
    expect(await rootTokenValue(page, '--mat-sys-body-medium-font')).toMatch(/^Inter\b/);
    // The font itself is available to the page (index.html link).
    const loaded = await page.evaluate(async () => {
      await document.fonts.load('600 15px Inter');
      return document.fonts.check('600 15px Inter');
    });
    expect(loaded).toBe(true);
  });
});
