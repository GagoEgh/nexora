import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MAX_IMAGE_BYTES, checkImages, referencedImages } from './verify-images.mjs';

/**
 * The checker's logic, exercised against made-up trees. The real tree is checked by
 * `npm run verify:images`; these pin what each rule is supposed to catch, so a rule cannot be
 * weakened into silence without a test going red.
 */

/** A clean tree: two WebP files, both named by the content, both small. */
const clean = {
  files: ['car.webp', 'watch.webp'],
  referenced: ['/images/car.webp', '/images/watch.webp'],
  sizes: new Map([
    ['car.webp', 40 * 1024],
    ['watch.webp', 60 * 1024],
  ]),
};

/** @param {Partial<typeof clean>} overrides @returns {string[]} */
const check = (overrides) => {
  const tree = { ...clean, ...overrides };
  return checkImages(tree.files, tree.referenced, tree.sizes);
};

describe('verify-images', () => {
  it('reads the image paths out of the content file', () => {
    const source = [
      "      image: '/images/infiniti.webp',",
      "      title: t({ en: 'Not an image' }),",
      "      image: '/images/meal.webp',",
    ].join('\n');
    assert.deepEqual(referencedImages(source), ['/images/infiniti.webp', '/images/meal.webp']);
  });

  it('reads nothing out of a file that names no images', () => {
    // The vacuity guard in `main()` depends on this returning empty rather than throwing.
    assert.deepEqual(referencedImages('export default { key: "x" };'), []);
  });

  it('passes a tree that is WebP, within budget and fully referenced', () => {
    assert.deepEqual(check({}), []);
  });

  it('catches a source format that was never re-encoded', () => {
    const problems = check({
      files: ['car.webp', 'infiniti.png'],
      referenced: ['/images/car.webp', '/images/infiniti.png'],
      sizes: new Map([
        ['car.webp', 40 * 1024],
        ['infiniti.png', 2200 * 1024],
      ]),
    });
    assert.match(problems.join('\n'), /infiniti\.png is not WebP/);
  });

  it('reports a non-WebP file once, rather than also as oversized and unreferenced', () => {
    // Otherwise one dropped-in PNG produces three lines that all say the same thing.
    const problems = check({
      files: ['infiniti.png'],
      referenced: ['/images/infiniti.png'],
      sizes: new Map([['infiniti.png', 2200 * 1024]]),
    });
    assert.equal(problems.length, 1);
  });

  it('catches a WebP that is still over the per-file budget', () => {
    const problems = check({
      sizes: new Map([
        ['car.webp', MAX_IMAGE_BYTES + 1],
        ['watch.webp', 60 * 1024],
      ]),
    });
    assert.match(problems.join('\n'), /car\.webp is .* over the .* budget/);
  });

  it('catches an image that ships but that nothing references', () => {
    const problems = check({
      files: ['car.webp', 'watch.webp', 'geo.webp'],
      sizes: new Map([
        ['car.webp', 40 * 1024],
        ['watch.webp', 60 * 1024],
        ['geo.webp', 43 * 1024],
      ]),
    });
    assert.deepEqual(problems, ['geo.webp is in the build but no page references it']);
  });

  it('catches a path the content names that is not on disk', () => {
    const problems = check({ referenced: [...clean.referenced, '/images/typo.webp'] });
    assert.match(problems.join('\n'), /names \/images\/typo\.webp, which is not in/);
  });

  it('reports a path named by two cards only once', () => {
    const referenced = [...clean.referenced, '/images/typo.webp', '/images/typo.webp'];
    assert.equal(check({ referenced }).length, 1);
  });
});
