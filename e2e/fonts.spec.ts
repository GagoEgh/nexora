import { expect, test } from '@playwright/test';
import { rootTokenValue } from './support/contrast';

/**
 * Font coverage contract.
 *
 * Inter carries no Armenian glyphs, so the Armenian locale depends on a second family being
 * declared and reachable through the plain-family stack. These assertions exist because that
 * failure is invisible: without them Armenian copy silently renders in whatever the system
 * picks, at the wrong metrics and outside the type scale.
 */
const ARMENIAN_BLOCK = /U\+530-58F|U\+0530-058F/i;
const ARMENIAN_SAMPLE = 'Հայերեն';

interface FontFace {
  family: string;
  range: string;
}

const fontFaces = (page: Parameters<typeof rootTokenValue>[0]): Promise<FontFace[]> =>
  page.evaluate(() =>
    Array.from(document.styleSheets)
      .flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules);
        } catch {
          return [];
        }
      })
      .filter((rule): rule is CSSFontFaceRule => rule instanceof CSSFontFaceRule)
      .map((rule) => ({
        family: rule.style.getPropertyValue('font-family').replace(/["']/g, '').trim(),
        range: rule.style.getPropertyValue('unicode-range'),
      })),
  );

test.describe('font coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('the type scale falls back from Inter to an Armenian family', async ({ page }) => {
    for (const token of ['--mat-sys-body-medium-font', '--nx-sys-body-copy-font']) {
      // The unminified dev build wraps the family list over several lines, and Sass quotes the
      // multi-word family inconsistently between configurations; the order is what matters.
      const family = (await rootTokenValue(page, token)).replace(/\s+/g, ' ').replace(/["']/g, '');
      expect(family, token).toBe('Inter, Noto Sans Armenian, sans-serif');
    }
  });

  test('no Inter subset claims the Armenian block, and Noto Sans Armenian does', async ({
    page,
  }) => {
    const faces = await fontFaces(page);
    expect(faces.length).toBeGreaterThan(0);

    const inter = faces.filter((face) => face.family === 'Inter');
    expect(inter.length).toBeGreaterThan(0);
    for (const face of inter) {
      expect(face.range, 'Inter has no Armenian glyphs to serve').not.toMatch(ARMENIAN_BLOCK);
    }

    const armenian = faces.filter((face) => face.family === 'Noto Sans Armenian');
    expect(armenian).toHaveLength(1);
    expect(armenian[0].range).toMatch(ARMENIAN_BLOCK);
  });

  test('Armenian text resolves to a loadable Armenian face', async ({ page }) => {
    const loaded = await page.evaluate(async (sample) => {
      await document.fonts.load('400 16px "Noto Sans Armenian"', sample);
      return document.fonts.check('400 16px "Noto Sans Armenian"', sample);
    }, ARMENIAN_SAMPLE);

    expect(loaded, 'the Armenian subset should download for Armenian code points').toBe(true);
  });
});
