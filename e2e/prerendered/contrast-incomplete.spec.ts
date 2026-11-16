import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import sharp from 'sharp';
import { contrastRatio, parseCssColor, type Rgba } from '../support/contrast';

/**
 * Every `color-contrast` node axe cannot compute, measured rather than assumed.
 *
 * axe returns `incomplete` for text it cannot evaluate - over a gradient, a photograph or a
 * translucent surface. An `incomplete` is neither a pass nor a failure, and the audit found 5 to
 * 49 of them on every page, so the site's contrast was partly unverified: `design-tokens.spec.ts`
 * covers the flat token pairs, and nothing covered these.
 *
 * The measurement does not reason about the stack, it looks at it:
 *   1. screenshot the element as it renders,
 *   2. screenshot it again with the text made transparent,
 *   3. the pixels that differ are exactly where the glyphs are, and the second shot holds the
 *      real background behind each one,
 *   4. contrast the text colour against every one of those background pixels.
 *
 * The worst pixel is the verdict for that node, which is the conservative reading: a ratio that
 * holds at the darkest point of a gradient holds across it.
 *
 * This runs against the built output rather than the dev server because the gradients and images
 * involved are the production assets.
 */

/** WCAG 1.4.3: large text is >=24px, or >=18.66px when bold. */
const thresholdFor = (fontSize: number, fontWeight: string): number =>
  fontSize >= 24 || (fontSize >= 18.66 && Number(fontWeight) >= 700) ? 3 : 4.5;

/** The pages the audit recorded incomplete nodes on, worst first. */
const PAGES = ['/', '/contact', '/hy/contact', '/services', '/solutions', '/about', '/our_work'];

/**
 * A node is only skipped when nothing was painted for it - an empty inline box, say. Skips are
 * counted, because a gate that measures nothing passes everything.
 */
interface Measured {
  readonly selector: string;
  readonly text: string;
  readonly worst: number;
  readonly threshold: number;
  readonly glyphPixels: number;
}

const rawPixels = async (buffer: Buffer) => {
  const { data, info } = await sharp(buffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
};

const measureNode = async (locator: Locator): Promise<Measured | undefined> => {
  const info = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      color: style.color,
      fontSize: Number.parseFloat(style.fontSize),
      fontWeight: style.fontWeight,
      text: (element.textContent ?? '').trim().slice(0, 60),
      width: box.width,
      height: box.height,
    };
  });

  if (info.width < 1 || info.height < 1) {
    return undefined;
  }

  const foreground = parseCssColor(info.color);
  const visible = await locator.screenshot();
  await locator.evaluate((element) => {
    element.setAttribute('data-contrast-probe', element.getAttribute('style') ?? '');
    element.style.setProperty('color', 'transparent', 'important');
    element.style.setProperty('text-shadow', 'none', 'important');
    element.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
  });
  const hidden = await locator.screenshot();
  await locator.evaluate((element) => {
    const saved = element.getAttribute('data-contrast-probe') ?? '';
    element.removeAttribute('data-contrast-probe');
    if (saved) {
      element.setAttribute('style', saved);
    } else {
      element.removeAttribute('style');
    }
  });

  const shown = await rawPixels(visible);
  const bare = await rawPixels(hidden);
  if (shown.width !== bare.width || shown.height !== bare.height) {
    return undefined;
  }

  let worst = Number.POSITIVE_INFINITY;
  let glyphPixels = 0;

  for (let at = 0; at < shown.data.length; at += 3) {
    const delta =
      Math.abs(shown.data[at] - bare.data[at]) +
      Math.abs(shown.data[at + 1] - bare.data[at + 1]) +
      Math.abs(shown.data[at + 2] - bare.data[at + 2]);
    // A threshold rather than any difference at all, so PNG rounding is not read as a glyph.
    if (delta <= 12) {
      continue;
    }
    glyphPixels++;
    const background: Rgba = {
      r: bare.data[at] / 255,
      g: bare.data[at + 1] / 255,
      b: bare.data[at + 2] / 255,
      a: 1,
    };
    worst = Math.min(worst, contrastRatio(foreground, background));
  }

  if (glyphPixels === 0) {
    return undefined;
  }

  return {
    selector: '',
    text: info.text,
    worst,
    threshold: thresholdFor(info.fontSize, info.fontWeight),
    glyphPixels,
  };
};

const incompleteContrastTargets = async (page: Page): Promise<string[]> => {
  const { incomplete } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  return incomplete
    .filter((entry) => entry.id === 'color-contrast')
    .flatMap((entry) => entry.nodes)
    .map((node) => (Array.isArray(node.target[0]) ? node.target[0].at(-1) : node.target[0]))
    .filter((selector): selector is string => typeof selector === 'string');
};

for (const path of PAGES) {
  test(`every incomplete contrast node on ${path} meets its WCAG threshold`, async ({ page }) => {
    test.setTimeout(240_000);

    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);

    const targets = await incompleteContrastTargets(page);
    const measurements: Measured[] = [];
    let unpainted = 0;

    for (const selector of targets) {
      const measurement = await measureNode(page.locator(selector).first());
      if (measurement === undefined) {
        unpainted++;
        continue;
      }
      measurements.push({ ...measurement, selector });
    }

    // Without this the test would pass on a page where axe reported nothing, or where every node
    // turned out to be unpaintable - neither of which is evidence that the contrast is sound.
    expect(
      measurements.length,
      `no contrast node on ${path} could be measured ` +
        `(${targets.length} reported by axe, ${unpainted} painted nothing)`,
    ).toBeGreaterThan(0);

    const failures = measurements
      .filter((entry) => entry.worst < entry.threshold)
      .sort((a, b) => a.worst - b.worst)
      .map(
        (entry) =>
          `${entry.worst.toFixed(2)}:1 needs ${entry.threshold} :: ${entry.selector} "${entry.text}"`,
      );

    expect(failures, `${measurements.length} node(s) measured on ${path}`).toEqual([]);
  });
}
