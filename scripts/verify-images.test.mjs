import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  IMAGES_DIR,
  MAX_IMAGE_BYTES,
  checkDimensions,
  checkImages,
  photoBoxes,
  referencedPhotos,
} from './verify-images.mjs';

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

/**
 * The dimension rules, which exist because three photographs shipped declared as 1000x667
 * while being 3000x1500, 1080x1080 and 910x767, and because six "resized" candidates were
 * really full-size copies. Both classes were invisible to every other rule here - the copies
 * sat under the per-file budget, so nothing complained.
 */
describe('verify-images dimensions', () => {
  /** @param {number} width @param {number} height @returns {{ width: number, height: number }} */
  const box = (width, height) => ({ width, height });

  it('reads both declared dimensions out of the registry', () => {
    const source =
      "    photos: [{ file: 'control.webp', width: 1080, height: 1080 }, " +
      "{ file: 'serv.webp', width: 910, height: 767 }],";
    assert.deepEqual(
      [...photoBoxes(source)],
      [
        ['control.webp', box(1080, 1080)],
        ['serv.webp', box(910, 767)],
      ],
    );
  });

  it('passes a photograph that is exactly what it claims to be', () => {
    const declared = new Map([['car.webp', box(1280, 640)]]);
    const measured = new Map([['car.webp', box(1280, 640)]]);
    assert.deepEqual(checkDimensions(declared, measured), []);
  });

  it('catches a declared box that does not match the file', () => {
    const declared = new Map([['car.webp', box(1000, 667)]]);
    const measured = new Map([['car.webp', box(3000, 1500)]]);
    const problems = checkDimensions(declared, measured);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /declares car\.webp as 1000x667 but the file is 3000x1500/);
  });

  it('catches a height that is wrong while the width is right', () => {
    // The width alone drives the ladder, so a wrong height slips past every width-based rule
    // and shows up only as the page shifting while the image loads.
    const declared = new Map([['car.webp', box(1080, 667)]]);
    const measured = new Map([['car.webp', box(1080, 1080)]]);
    assert.equal(checkDimensions(declared, measured).length, 1);
  });

  it('catches a ladder candidate that was never actually resized', () => {
    const declared = new Map([['car.webp', box(1280, 640)]]);
    const measured = new Map([
      ['car.webp', box(1280, 640)],
      ['car-640.webp', box(1280, 640)],
    ]);
    const problems = checkDimensions(declared, measured);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /car-640\.webp is named as the 640w candidate but is 1280px wide/);
  });

  it('passes a ladder candidate resized to the width its name advertises', () => {
    const declared = new Map([['car.webp', box(1280, 640)]]);
    const measured = new Map([
      ['car.webp', box(1280, 640)],
      ['car-640.webp', box(640, 320)],
    ]);
    assert.deepEqual(checkDimensions(declared, measured), []);
  });

  it('says nothing about a file it could not measure', () => {
    // Absence and unreadability are `checkImages`' complaints; reporting them twice would
    // make one broken file look like two problems.
    const declared = new Map([['car.webp', box(1280, 640)]]);
    assert.deepEqual(checkDimensions(declared, new Map()), []);
  });

  it('ignores a dash-number file that belongs to no declared photograph', () => {
    const measured = new Map([['unrelated-200.webp', box(999, 999)]]);
    assert.deepEqual(checkDimensions(new Map(), measured), []);
  });
});
