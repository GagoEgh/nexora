import { readFileSync } from 'node:fs';
import type { ProductImage } from '../products/data/product-view';
import {
  CONTAINER_MAX,
  GALLERY_ASIDE,
  GALLERY_COLUMN_GAP,
  GALLERY_COLUMN_MAX,
  GALLERY_ROW_MAX,
  SHOT_MAX_HEIGHT,
  experienceColumns,
  galleryRowSizes,
  proportionalColumns,
  toGalleryRows,
} from './gallery-layout';

const shot = (width: number, height: number): ProductImage => ({
  src: `images/${width}x${height}.webp`,
  srcset: `images/${width}x${height}.webp ${width}w`,
  width,
  height,
  alt: `${width} by ${height}`,
});

/** The `fr` share each published column asks for. */
const shares = (columns: string | null): readonly number[] =>
  [...(columns ?? '').matchAll(/minmax\(0,\s*([\d.]+)fr\)/g)].map((match) => Number(match[1]));

describe('gallery layout', () => {
  describe('rows', () => {
    it('balances rather than chunks, so no row is left an orphan', () => {
      expect(galleryRowSizes(0)).toEqual([]);
      expect(galleryRowSizes(1)).toEqual([1]);
      expect(galleryRowSizes(2)).toEqual([2]);
      expect(galleryRowSizes(3)).toEqual([3]);
      // The case the rule exists for: chunking would give 3-1, a wide orphan under a pair.
      expect(galleryRowSizes(4)).toEqual([2, 2]);
      expect(galleryRowSizes(5)).toEqual([3, 2]);
      expect(galleryRowSizes(6)).toEqual([3, 3]);
      expect(galleryRowSizes(7)).toEqual([3, 2, 2]);
    });

    it('keeps every row within the maximum and within one of its neighbours', () => {
      for (let count = 1; count <= 24; count += 1) {
        const sizes = galleryRowSizes(count);
        expect(
          sizes.reduce((total, size) => total + size, 0),
          `${count} photographs`,
        ).toBe(count);
        expect(Math.max(...sizes), `${count} photographs`).toBeLessThanOrEqual(GALLERY_ROW_MAX);
        expect(Math.max(...sizes) - Math.min(...sizes), `${count} photographs`).toBeLessThanOrEqual(
          1,
        );
      }
    });

    it('hands each row the columns its own photographs ask for', () => {
      const rows = toGalleryRows([shot(1280, 720), shot(900, 600), shot(600, 900), shot(800, 800)]);

      expect(rows.map((row) => row.tiles.length)).toEqual([2, 2]);
      expect(rows[0].columns).not.toBe(rows[1].columns);
      expect(rows[0].columns).toBe('minmax(0, 1.7778fr) minmax(0, 1.5000fr)');
    });
  });

  describe('columns', () => {
    it('leaves a row of fewer than two to the stylesheet', () => {
      expect(proportionalColumns([])).toBeNull();
      expect(proportionalColumns([shot(800, 600)])).toBeNull();
    });

    /**
     * The property the whole scheme exists for. A track sized `R fr` takes `R / ΣR` of the row,
     * so dividing that width back by the photograph's own ratio has to give the same height for
     * every picture in the row - whatever their shapes.
     */
    it('resolves a row of mixed shapes to one shared height', () => {
      const row = [shot(637, 1104), shot(454, 679), shot(860, 645)];
      const fr = shares(proportionalColumns(row));
      const total = fr.reduce((sum, share) => sum + share, 0);

      expect(fr).toHaveLength(row.length);
      const heights = row.map((image, index) => (fr[index] / total) * (image.height / image.width));
      for (const height of heights) {
        // Four decimal places, because that is what the published ratio carries - any tighter
        // and this asserts a precision `toFixed(4)` never promised.
        expect(height).toBeCloseTo(heights[0], 4);
      }
    });
  });

  describe('the experience section', () => {
    const copyBesideGallery = `minmax(0, ${GALLERY_ASIDE}px) minmax(0, 1fr)`;

    it('says nothing when the product has no gallery', () => {
      expect(experienceColumns([])).toBeNull();
    });

    it('gives the whole width to a gallery past a pair', () => {
      expect(experienceColumns([shot(800, 600), shot(800, 600), shot(800, 600)])).toBe(
        'minmax(0, 1fr)',
      );
    });

    it('puts the copy beside a pair', () => {
      expect(experienceColumns([shot(1280, 854), shot(1000, 667)])).toBe(copyBesideGallery);
    });

    /**
     * An upright photograph on its own is the case that inverted the hierarchy: given half the
     * section it stood taller than the copy beside it. Its column is cut to whatever keeps it
     * under the bound.
     */
    it('cuts a lone upright photograph down to the height bound', () => {
      const upright = shot(900, 1350);
      const columns = experienceColumns([upright]);
      const bounded = Math.round((upright.width / upright.height) * SHOT_MAX_HEIGHT);

      expect(columns).toBe(`minmax(0, 1fr) minmax(0, ${bounded}px)`);
      expect(bounded).toBeLessThan(GALLERY_COLUMN_MAX);
    });

    it('never asks for a column wider than the photograph itself', () => {
      const small = shot(480, 334);
      expect(experienceColumns([small])).toBe(`minmax(0, 1fr) minmax(0, ${small.width}px)`);
    });

    it('leaves a photograph already wider than its column to fill it', () => {
      // 2.54:1 - bounding it to 440px tall would ask for 1118px, past the column's 796px.
      expect(experienceColumns([shot(1280, 504)])).toBe(copyBesideGallery);
    });
  });

  /**
   * Two of these numbers describe something the stylesheet still owns. They are duplicated on
   * purpose - arithmetic cannot read a Sass variable - so they are pinned against the files
   * that own them instead. A change on either side fails here rather than quietly mislaying a
   * column.
   */
  describe('the numbers the stylesheet owns', () => {
    it('matches the container width in the layout tokens', () => {
      const tokens = readFileSync('src/styles/tokens/_layout.scss', 'utf8');
      expect(tokens).toContain(`$container-max: ${CONTAINER_MAX}px;`);
    });

    it('matches the column gap the experience section is laid out with', () => {
      const sheet = readFileSync(
        'src/app/pages/our-work/product-detail/product-detail.scss',
        'utf8',
      );
      const gallery = sheet.slice(sheet.indexOf('.product__experience--gallery'));
      const gap = gallery
        .slice(0, gallery.indexOf('\n}'))
        .match(/column-gap: spacing\.space\((\d+)\)/);

      expect(gap, 'the experience section no longer sets a column gap').not.toBeNull();
      expect(Number(gap?.[1])).toBe(GALLERY_COLUMN_GAP);
    });
  });
});
