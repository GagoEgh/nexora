export const IMAGE_LADDER = [200, 400, 640, 960];

/**
 *
 * @param {string} file
 * @param {number} width
 * @returns {string}
 */
export function variantFile(file, width) {
  return file.replace(/\.webp$/, `-${width}.webp`);
}

/**
 *
 * @param {number} width
 * @returns {number[]}
 */
export function variantWidths(width) {
  return IMAGE_LADDER.filter((step) => step < width);
}

/**
 *
 * @param {string} file
 * @param {number} width
 * @returns {string[]}
 */
export function variantFiles(file, width) {
  return variantWidths(width).map((step) => variantFile(file, step));
}
