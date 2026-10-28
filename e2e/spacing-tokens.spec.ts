import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { rootTokenValue } from './support/contrast';

const SCALE = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];

interface WindowClass {
  name: string;
  /** A viewport width inside the class range. */
  width: number;
  columns: number;
  margin: number;
  gutter: number;
}

const WINDOW_CLASSES: WindowClass[] = [
  { name: 'compact (0-599)', width: 360, columns: 4, margin: 20, gutter: 16 },
  { name: 'medium (600-839)', width: 700, columns: 8, margin: 32, gutter: 24 },
  { name: 'expanded (840-1199)', width: 1000, columns: 12, margin: 40, gutter: 24 },
  { name: 'large (1200-1599)', width: 1400, columns: 12, margin: 80, gutter: 32 },
  { name: 'extra-large (1600+)', width: 1800, columns: 12, margin: 80, gutter: 32 },
];

const px = (value: string): number => {
  expect(value, `expected a px value, got "${value}"`).toMatch(/^\d+px$/);
  return Number.parseInt(value, 10);
};

test.describe('spacing tokens', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('the scale is exactly the approved steps', async ({ page }) => {
    for (const step of SCALE) {
      expect(await rootTokenValue(page, `--nx-space-${step}`), `--nx-space-${step}`).toBe(
        `${step}px`,
      );
    }
    const declared = await page.evaluate(() => {
      const names = new Set<string>();
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRule[];
        try {
          rules = Array.from(sheet.cssRules);
        } catch {
          continue; // cross-origin stylesheet (e.g. Google Fonts) - not ours
        }
        for (const rule of rules) {
          if (rule instanceof CSSStyleRule) {
            for (const name of Array.from(rule.style)) {
              if (name.startsWith('--nx-space-')) {
                names.add(name);
              }
            }
          }
        }
      }
      return Array.from(names).sort();
    });
    expect(declared).toEqual(SCALE.map((step) => `--nx-space-${step}`).sort());
  });

  for (const wc of WINDOW_CLASSES) {
    test(`grid tokens for ${wc.name} match the specification`, async ({ page }) => {
      await page.setViewportSize({ width: wc.width, height: 800 });
      expect(await rootTokenValue(page, '--nx-layout-columns')).toBe(String(wc.columns));
      const margin = px(await rootTokenValue(page, '--nx-layout-margin'));
      const gutter = px(await rootTokenValue(page, '--nx-layout-gutter'));
      expect(margin).toBe(wc.margin);
      expect(gutter).toBe(wc.gutter);
      expect(SCALE, `margin ${margin}px must be a spacing step`).toContain(margin);
      expect(SCALE, `gutter ${gutter}px must be a spacing step`).toContain(gutter);
    });
  }

  test('content container is capped at 1280px', async ({ page }) => {
    expect(await rootTokenValue(page, '--nx-layout-container-max')).toBe('1280px');
  });
});

test.describe('spacing static guard', () => {
  const SRC = join(__dirname, '..', 'src');
  const TOKENS_DIR = join(SRC, 'styles', 'tokens');
  const SPACING_PROPERTY =
    /^\s*(?:margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left)(?:-[a-z]+)*\s*:\s*([^;]+);/;

  const scssFiles = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        return path.startsWith(TOKENS_DIR) ? [] : scssFiles(path);
      }
      return entry.endsWith('.scss') ? [path] : [];
    });

  /*
   * Scope of this guard, so the next reader does not over-trust it.
   *
   * `spacing.space()` @errors on any step outside $scale (styles/tokens/_spacing.scss:6-7), so
   * an off-scale value cannot be written through the function at all. The one way to express one
   * is to compose it: `calc(#{spacing.space(24)} + #{spacing.space(4)})` yields 28px, and that
   * is deliberate - 28 sits in the 24-to-32 gap the scale leaves open. Five sites rely on it:
   *
   *   pages/about/glance/about-glance.scss:6
   *   pages/about/philosophy/philosophy.scss:67
   *   pages/ai-agent/business-value/business-value.scss:61
   *   pages/ai-agent/capabilities/capabilities.scss:51
   *   pages/ai-agent/related-services/engagement-panel/engagement-panel.scss:10
   *
   * The regex below matches px literals only, so those composed values pass it untouched. That
   * is the intended reading: the guard enforces "no raw px", not "only scale steps". Tightening
   * it to reject token-composed arithmetic would fail all five sites and is a design-system
   * decision, not a lint fix - take it by adding a 28 step to $scale if the value is wanted.
   */
  test('component and theme styles contain no px spacing literals', () => {
    const offenders: string[] = [];
    for (const file of scssFiles(SRC)) {
      readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .forEach((line, index) => {
          const match = SPACING_PROPERTY.exec(line);
          if (match && /\b[1-9]\d*px\b/.test(match[1])) {
            offenders.push(
              `${relative(SRC, file).split(sep).join('/')}:${index + 1}: ${line.trim()}`,
            );
          }
        });
    }
    expect(offenders, 'use spacing.space(<step>) instead of px literals').toEqual([]);
  });
});
