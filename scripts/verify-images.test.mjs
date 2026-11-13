import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { IMAGES_DIR, MAX_IMAGE_BYTES, checkImages, referencedPhotos } from './verify-images.mjs';

/**
 * The checker's logic, exercised against made-up trees. The real tree is checked by
 * `npm run verify:images`; these pin what each rule is supposed to catch, so a rule cannot be
 * weakened into silence without a test going red.
 */

const META_FILE = 'src/app/pages/our-work/products/data/product-meta.ts';

/** A clean tree: two products, each with its own photograph, both small. */
const clean = {
  files: ['car.webp', 'watch.webp'],
  referenced: ['car.webp', 'watch.webp'],
  sizes: new Map([
    ['car.webp', 12 * 1024],
    ['watch.webp', 12 * 1024],
  ]),
};

/** @param {Partial<typeof clean>} overrides @returns {string[]} */
const check = (overrides) => {
  const tree = { ...clean, ...overrides };
  return checkImages(tree.files, tree.referenced, tree.sizes);
};

describe('verify-images', () => {
  it('reads the photograph names out of the registry', () => {
    const source = [
      "    photos: [{ file: 'medical.webp', width: 800, height: 450 }],",
      "    category: t({ en: 'Not a file' }),",
      "    photos: [{ file: 'infiniti.webp', width: 800, height: 450 }],",
    ].join('\n');
    assert.deepEqual(referencedPhotos(source), ['medical.webp', 'infiniti.webp']);
  });

  it('reads every photograph of a product that carries more than one', () => {
    // `photos` is an array so the detail page's gallery can grow without a registry change.
    const source =
      "    photos: [{ file: 'car.webp', width: 1, height: 1 }, " +
      "{ file: 'car-2.webp', width: 1, height: 1 }],";
    assert.deepEqual(referencedPhotos(source), ['car.webp', 'car-2.webp']);
  });

  it('reads nothing out of a file that names no photographs', () => {
    // The vacuity guard in `main()` depends on this returning empty rather than throwing.
    assert.deepEqual(referencedPhotos('export const PRODUCT_META = {};'), []);
  });

  it('passes a tree that is WebP, within budget and fully referenced', () => {
    assert.deepEqual(check({}), []);
  });

  it('catches a source format that was never re-encoded', () => {
    const files = ['car.webp', 'watch.png'];
    const problems = check({
      files,
      sizes: new Map(files.map((file) => [file, 12 * 1024])),
    });
    assert.match(problems.join('\n'), /watch\.png is not WebP/);
  });

  it('reports a non-WebP file once, rather than also as unreferenced and oversized', () => {
    // Otherwise one dropped-in PNG produces three lines that all say the same thing.
    const files = ['car.webp', 'watch.webp', 'stray.png'];
    const problems = check({
      files,
      sizes: new Map(files.map((file) => [file, file.endsWith('.png') ? 2200 * 1024 : 12 * 1024])),
    });
    assert.equal(problems.length, 1);
  });

  it('catches a WebP that is still over the per-file budget', () => {
    const sizes = new Map(clean.sizes);
    sizes.set('car.webp', MAX_IMAGE_BYTES + 1);
    const problems = check({ sizes });
    assert.match(problems.join('\n'), /car\.webp is .* over the .* budget/);
  });

  it('catches a photograph that ships but that no product references', () => {
    const files = [...clean.files, 'orphan.webp'];
    const problems = check({
      files,
      sizes: new Map(files.map((file) => [file, 12 * 1024])),
    });
    assert.deepEqual(problems, ['orphan.webp is in the build but no product references it']);
  });

  it('catches a photograph the registry names that is not on disk', () => {
    const problems = check({ referenced: [...clean.referenced, 'missing.webp'] });
    assert.deepEqual(problems, [`${META_FILE} names missing.webp, which is not in ${IMAGES_DIR}`]);
  });

  it('catches two products sharing one photograph', () => {
    // Nineteen products, nineteen pictures: a copied file name reads as the same work twice.
    const problems = check({ referenced: ['car.webp', 'car.webp', 'watch.webp'] });
    assert.match(problems.join('\n'), /points more than one product at car\.webp/);
  });
});
