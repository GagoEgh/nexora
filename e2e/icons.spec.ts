import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { APP_ICON_NAMES } from '../src/app/core/icons/icons';

/**
 * Icon system contract.
 * - The catalogue (core/icons/icons.ts) and public/icons agree exactly.
 * - Every icon is served verbatim.
 * - Icons are monochrome line drawings that stroke with `currentColor`, so once the registry
 *   inlines them into `<mat-icon>` they take the colour of their host without any global rule.
 */
const ICONS_DIR = join(__dirname, '..', 'public', 'icons');

test.describe('icon assets', () => {
  test('the catalogue matches public/icons exactly', () => {
    const files = readdirSync(ICONS_DIR)
      .filter((f) => f.endsWith('.svg'))
      .map((f) => f.replace(/\.svg$/, ''))
      .sort();
    expect(files).toEqual([...APP_ICON_NAMES].sort());
  });

  test('every icon is served unchanged', async ({ request }) => {
    for (const name of APP_ICON_NAMES) {
      const response = await request.get(`/icons/${name}.svg`);
      expect(response.status(), name).toBe(200);
      expect(response.headers()['content-type'], name).toContain('image/svg+xml');
      expect(await response.text(), name).toBe(
        readFileSync(join(ICONS_DIR, `${name}.svg`), 'utf8'),
      );
    }
  });
});

test.describe('icon theming', () => {
  test('every icon strokes with currentColor and carries no literal colour', () => {
    for (const name of APP_ICON_NAMES) {
      const svg = readFileSync(join(ICONS_DIR, `${name}.svg`), 'utf8');
      const strokes = Array.from(svg.matchAll(/stroke="([^"]*)"/g), (m) => m[1]);
      expect(strokes.length, name).toBeGreaterThan(0);
      expect(new Set(strokes), name).toEqual(new Set(['currentColor']));
      expect(svg, name).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|style=/i);
    }
  });

  test('rendered icons take the colour of their mat-icon host on light and inverse surfaces', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('app-hero .hero__trust-icon svg')).toHaveCount(3);
    await expect(page.locator('app-hero-illustration app-icon-tile svg')).toHaveCount(5);

    const samples = await page.locator('mat-icon svg [stroke]').evaluateAll((els) =>
      els.map((el) => ({
        stroke: getComputedStyle(el).stroke,
        host: getComputedStyle(el.closest('mat-icon') as HTMLElement).color,
      })),
    );
    expect(samples.length).toBeGreaterThan(10);
    for (const sample of samples) {
      expect(sample.stroke).toBe(sample.host);
    }
    const strokes = new Set(samples.map((s) => s.stroke));
    expect(strokes).toContain('rgb(11, 19, 36)'); // on-surface: header chevron
    expect(strokes).toContain('rgb(15, 85, 232)'); // primary: trust checks, primary tiles
    expect(strokes).toContain('rgb(134, 173, 255)'); // inverse-primary: the dark hero node tile
  });
});
