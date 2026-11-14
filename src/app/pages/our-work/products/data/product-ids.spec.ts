import { PRODUCT_IDS, isProductId } from './product-ids';
import { readFileSync } from 'node:fs';
import { ARCHETYPE_ICONS, IMAGE_LADDER, PRODUCT_META, photoSrc, photoSrcset } from './product-meta';
import { nextProductId, productPath } from './product-view';

/**
 * The registry is the one place the portfolio's structure is declared, and its slugs are
 * published URLs. These assertions are about the structure only - the words live in the
 * dictionary and are checked by `product-content.spec.ts`.
 */

/** Pinned verbatim: each of these is an indexed URL, so a rename has to be deliberate. */
const PUBLISHED_SLUGS = [
  'draculai',
  'jdm-west-coast',
  'hydrant',
  'mertel',
  'skinome',
  'mastercraft',
  'robert-irwin',
  'casamance',
  'sell-me-watch',
  'klinik-europe',
  'libra-analytics',
  'remake-templates',
  'got-matcha',
  'lav',
  'roar-organic',
  'zadeh-md',
  'tai-ping',
  'mezave',
  'connected-car',
];

describe('the product registry', () => {
  it('publishes exactly these nineteen slugs, in this order', () => {
    expect([...PRODUCT_IDS]).toEqual(PUBLISHED_SLUGS);
    expect(new Set(PRODUCT_IDS).size).toBe(PRODUCT_IDS.length);
  });

  it('uses slugs that survive being put in a URL unescaped', () => {
    for (const id of PRODUCT_IDS) {
      expect(id, id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  /**
   * `isProductId` is what stands between a route parameter and an index lookup, so it has to
   * reject anything that is not a registered slug rather than merely anything falsy.
   */
  it('narrows known slugs and nothing else', () => {
    expect(isProductId('draculai')).toBe(true);
    expect(isProductId('Draculai')).toBe(false);
    expect(isProductId('draculai/')).toBe(false);
    expect(isProductId('../contact')).toBe(false);
    expect(isProductId('')).toBe(false);
    expect(isProductId(undefined)).toBe(false);
    expect(isProductId(0)).toBe(false);
  });

  it('describes every registered product, and nothing that is not one', () => {
    expect(Object.keys(PRODUCT_META).sort()).toEqual([...PRODUCT_IDS].sort());
  });

  /**
   * Each product carries its own photograph, so two products sharing a file is a defect rather
   * than a saving - it would read as the same client's work presented twice.
   * `verify-images.mjs` makes the same check against the files on disk; this one fails faster.
   */
  it('gives every product at least one photograph, and none of them a shared one', () => {
    const files = PRODUCT_IDS.flatMap((id) => PRODUCT_META[id].photos.map((photo) => photo.file));
    expect(files.length).toBeGreaterThanOrEqual(PRODUCT_IDS.length);
    expect(new Set(files).size).toBe(files.length);

    for (const id of PRODUCT_IDS) {
      expect(PRODUCT_META[id].photos.length, id).toBeGreaterThan(0);
    }
  });

  /**
   * The intrinsic size travels with the file so that each `<img>` can declare its own box.
   * These nineteen run from 480x334 to 800x853, and a zero here would be a silent layout shift
   * rather than a visible failure.
   */
  it('records the real pixel size of every photograph', () => {
    for (const id of PRODUCT_IDS) {
      for (const photo of PRODUCT_META[id].photos) {
        expect(photo.file, id).toMatch(/^[a-z0-9-]+\.webp$/);
        expect(photo.width, `${id} ${photo.file}`).toBeGreaterThan(0);
        expect(photo.height, `${id} ${photo.file}`).toBeGreaterThan(0);
      }
    }
  });

  it('resolves every photograph to a document-relative path under /images', () => {
    for (const id of PRODUCT_IDS) {
      for (const photo of PRODUCT_META[id].photos) {
        expect(photoSrc(photo)).toBe(`images/${photo.file}`);
        // A leading slash would break the prerendered pages served from a sub-path.
        expect(photoSrc(photo).startsWith('/'), id).toBe(false);
      }
    }
  });

  /**
   * The ladder exists twice: `scripts/image-ladder.mjs` generates the files and
   * `product-meta.ts` names them in a `srcset`. A script and an application cannot import each
   * other, so this reads the script and pins them together - a step added on one side and not
   * the other would otherwise mean a `srcset` entry that 404s, or a file nothing ever asks for.
   */
  it('publishes the same widths the build script generates', () => {
    const script = readFileSync('scripts/image-ladder.mjs', 'utf8');
    const declared = script.match(/export const IMAGE_LADDER = \[([^\]]+)\]/);

    expect(declared, 'scripts/image-ladder.mjs no longer declares IMAGE_LADDER').not.toBeNull();
    expect(declared?.[1].split(',').map((step) => Number(step.trim()))).toEqual([...IMAGE_LADDER]);
  });

  it('offers every photograph at the widths narrower than itself, and itself last', () => {
    for (const id of PRODUCT_IDS) {
      for (const photo of PRODUCT_META[id].photos) {
        const entries = photoSrcset(photo).split(', ');
        const expected = IMAGE_LADDER.filter((step) => step < photo.width);

        expect(entries, `${photo.file}`).toHaveLength(expected.length + 1);
        for (const [index, step] of expected.entries()) {
          const stem = photo.file.replace('.webp', '');
          expect(entries[index]).toBe(`images/${stem}-${step}.webp ${step}w`);
        }
        expect(entries[entries.length - 1]).toBe(`images/${photo.file} ${photo.width}w`);
        // The fallback `src` has to be one of the candidates, or a browser that ignores
        // `srcset` and one that reads it fetch different files.
        expect(entries.some((entry) => entry.startsWith(`${photoSrc(photo)} `))).toBe(true);
      }
    }
  });

  it('gives every archetype in use an icon', () => {
    for (const id of PRODUCT_IDS) {
      expect(ARCHETYPE_ICONS[PRODUCT_META[id].archetype], id).toBeTruthy();
    }
  });

  /**
   * An outward link is rendered with `target="_blank"`. A relative value there would quietly
   * become an in-app navigation that resolves to the 404 page instead of leaving the site, and
   * a plain-http one would be blocked as mixed content.
   */
  it('points outward over https, or not at all', () => {
    for (const id of PRODUCT_IDS) {
      const { url } = PRODUCT_META[id];
      if (url !== undefined) {
        expect(url, id).toMatch(/^https:\/\/[^\s]+$/);
      }
    }
  });

  it('builds product routes under the published our_work segment', () => {
    expect(productPath('draculai')).toBe('/our_work/draculai');
    for (const id of PRODUCT_IDS) {
      expect(productPath(id)).toBe(`/our_work/${id}`);
    }
  });

  it('wraps "next project" round the end of the list', () => {
    const last = PRODUCT_IDS[PRODUCT_IDS.length - 1];
    expect(nextProductId(PRODUCT_IDS[0])).toBe(PRODUCT_IDS[1]);
    expect(nextProductId(last)).toBe(PRODUCT_IDS[0]);
  });

  it('never offers a product as its own next project', () => {
    for (const id of PRODUCT_IDS) {
      expect(nextProductId(id), id).not.toBe(id);
    }
  });
});
