import { readFileSync } from 'node:fs';
import type { ProductImage } from '../products/data/product-view';
import {
  CONTAINER_MAX,
  LIGHTBOX_CHROME,
  LIGHTBOX_GUTTER,
  NEXT_COVER_SIZES,
  NEXT_COVER_WIDTH,
  STAGE_HEIGHT,
  SWIPE_THRESHOLD,
  THUMB_SIZES,
  THUMB_WIDTH,
  lightboxSizes,
  stageSizes,
  toTiles,
} from './gallery-layout';

const shot = (width: number, height: number): ProductImage => ({
  src: `images/${width}x${height}.webp`,
  srcset: `images/${width}x${height}.webp ${width}w`,
  width,
  height,
  alt: `${width} by ${height}`,
});

const LAYOUT_TOKENS = 'src/styles/tokens/_layout.scss';
const GALLERY_SHEET = 'src/app/pages/our-work/product-detail/product-gallery/product-gallery.scss';
const NEXT_SHEET = 'src/app/pages/our-work/product-detail/product-next/product-next.scss';

/**
 * A `sizes` attribute's own entries. It cannot be split on commas: every entry is a `min()` of
 * three candidates, so the commas inside the brackets have to be stepped over.
 */
const entries = (sizes: string): readonly string[] => {
  const found: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < sizes.length; index += 1) {
    const character = sizes[index];
    if (character === '(') {
      depth += 1;
    } else if (character === ')') {
      depth -= 1;
    } else if (character === ',' && depth === 0) {
      found.push(sizes.slice(start, index).trim());
      start = index + 1;
    }
  }
  found.push(sizes.slice(start).trim());
  return found;
};

/** The `(min-width: Npx)` conditions a `sizes` attribute is split on. */
const conditions = (sizes: string): readonly number[] =>
  [...sizes.matchAll(/\(min-width: (\d+)px\)/g)].map((match) => Number(match[1]));

/** The `100vw - Npx` content boxes it measures against. */
const gutters = (sizes: string): readonly number[] =>
  [...sizes.matchAll(/100vw - (\d+)px/g)].map((match) => Number(match[1]));

describe('gallery layout', () => {
  /**
   * The property every `sizes` attribute has to hold: the browser reads the first condition that
   * matches, so the entries have to descend, and the last one has to carry no condition at all
   * or a narrow viewport matches nothing and falls back to `100vw`.
   */
  describe('the stage', () => {
    it('descends through the window size classes and ends unconditional', () => {
      const sizes = stageSizes(shot(1280, 800));
      const parts = entries(sizes);

      expect(parts).toHaveLength(4);
      expect(conditions(sizes)).toEqual([1200, 840, 600]);
      expect(parts[parts.length - 1], 'the last entry is conditional').not.toContain('min-width');
    });

    /**
     * What makes this per-photograph rather than per-page. Contained in a band of a fixed
     * height, an upright picture is laid out far narrower than a landscape one, and asking for
     * the band's full width would download a file four times the size that is used.
     */
    it('bounds each photograph by what its own ratio gives it in the band', () => {
      const upright = stageSizes(shot(637, 1104));
      const landscape = stageSizes(shot(860, 645));

      expect(upright).not.toBe(landscape);
      expect(upright).toContain(`calc(${STAGE_HEIGHT.large}px * 0.5770)`);
      expect(landscape).toContain(`calc(${STAGE_HEIGHT.large}px * 1.3333)`);
      expect(upright).toContain(`calc(${STAGE_HEIGHT.compact}px * 0.5770)`);
    });

    it('never asks for more detail than the file carries', () => {
      // 480x334 is the smallest original in the set; the band would otherwise ask for 748px.
      const small = shot(480, 334);
      const parts = entries(stageSizes(small));
      expect(parts).toHaveLength(4);
      expect(parts.every((part) => part.includes('480px'))).toBe(true);
      expect(Math.round((small.width / small.height) * STAGE_HEIGHT.large)).toBeGreaterThan(
        small.width,
      );
    });

    it('caps the widest class at the container, not at the viewport', () => {
      const widest = entries(stageSizes(shot(1280, 720)))[0];
      expect(widest).toContain(`${CONTAINER_MAX}px`);
      expect(widest).toContain(`100vw - ${80 * 2}px`);
    });

    it('gives every photograph the sizes its own place asks for', () => {
      const shots = [shot(800, 600), shot(600, 800)];
      const tiles = toTiles(shots);

      expect(tiles.map((tile) => tile.shot)).toEqual(shots);
      expect(tiles[0].sizes).toBe(stageSizes(shots[0]));
      expect(tiles[0].sizes).not.toBe(tiles[1].sizes);
      expect(toTiles([])).toEqual([]);
    });
  });

  describe('the lightbox and the strip', () => {
    it('measures the full-size picture against the height the controls leave', () => {
      const sizes = lightboxSizes(shot(1280, 720));
      expect(sizes).toContain(`calc((100vh - ${LIGHTBOX_CHROME}px) * 1.7778)`);
      expect(sizes).toContain(`100vw - ${LIGHTBOX_GUTTER * 2}px`);
      expect(sizes).toContain('1280px');
      expect(conditions(sizes), 'the lightbox is one size at every width').toEqual([]);
    });

    it('states the thumbnail and the next-product cover as the fixed sizes they are', () => {
      expect(THUMB_SIZES).toBe(`${THUMB_WIDTH}px`);
      expect(NEXT_COVER_SIZES).toBe(`${NEXT_COVER_WIDTH}px`);
    });

    it('asks for a swipe long enough not to be a tap', () => {
      expect(SWIPE_THRESHOLD).toBeGreaterThan(24);
      expect(SWIPE_THRESHOLD).toBeLessThan(120);
    });
  });

  /**
   * These numbers describe something a stylesheet owns. They are duplicated on purpose - a
   * `sizes` attribute is arithmetic and cannot read a Sass variable - so they are pinned
   * against the files that own them instead. A change on either side fails here rather than
   * quietly shipping a picture at twice the bytes it needs.
   */
  describe('the numbers the stylesheets own', () => {
    it('matches the container width in the layout tokens', () => {
      expect(readFileSync(LAYOUT_TOKENS, 'utf8')).toContain(`$container-max: ${CONTAINER_MAX}px;`);
    });

    it('measures against the page margins the layout tokens declare', () => {
      const tokens = readFileSync(LAYOUT_TOKENS, 'utf8');
      const declared = new Set(
        [...tokens.matchAll(/margin: (\d+),/g)].map((match) => Number(match[1])),
      );

      expect(declared.size, 'the $grid map no longer declares margins').toBeGreaterThan(0);
      for (const gutter of gutters(stageSizes(shot(1280, 800)))) {
        expect(declared, `100vw - ${gutter}px is not twice any declared margin`).toContain(
          gutter / 2,
        );
      }
    });

    it('breaks at the window size classes the layout tokens declare', () => {
      const tokens = readFileSync(LAYOUT_TOKENS, 'utf8');
      for (const condition of conditions(stageSizes(shot(1280, 800)))) {
        expect(tokens, `${condition}px is not a declared breakpoint`).toMatch(
          new RegExp(`: ${condition},`),
        );
      }
    });

    it('matches the stage heights the gallery stylesheet lays out', () => {
      const sheet = readFileSync(GALLERY_SHEET, 'utf8');
      for (const [size, height] of Object.entries(STAGE_HEIGHT)) {
        expect(sheet, `$stage-height.${size}`).toContain(`${size}: ${height}px`);
      }
    });

    it('matches the thumbnail, gutter and control-bar sizes the gallery stylesheet uses', () => {
      const sheet = readFileSync(GALLERY_SHEET, 'utf8');
      expect(sheet).toContain(`$thumb-size: ${THUMB_WIDTH}px;`);
      expect(sheet).toContain(`$lightbox-gutter: ${LIGHTBOX_GUTTER}px;`);
      expect(sheet).toContain(`$lightbox-chrome: ${LIGHTBOX_CHROME}px;`);
      expect(sheet, 'the lightbox no longer leaves the control bar its room').toContain(
        'max-height: calc(100vh - #{$lightbox-chrome})',
      );
    });

    it('matches the next-product cover its own stylesheet lays out', () => {
      expect(readFileSync(NEXT_SHEET, 'utf8')).toContain(`$cover: ${NEXT_COVER_WIDTH}px;`);
    });
  });
});
