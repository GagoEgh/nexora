export const IMAGE_LADDER = [400, 640, 960];

/**
 * `meal.webp` at 640 -> `meal-640.webp`.
 *
 * @param {string} file
 * @param {number} width
 * @returns {string}
 */
export function variantFile(file, width) {
  return file.replace(/\.webp$/, `-${width}.webp`);
}

/**
 * The ladder widths published for a photograph of this width, narrowest first.
 *
 * @param {number} width
 * @returns {number[]}
 */
export function variantWidths(width) {
  return IMAGE_LADDER.filter((step) => step < width);
}

/**
 * Every narrower file a photograph is published as.
 *
 * @param {string} file
 * @param {number} width
 * @returns {string[]}
 */
export function variantFiles(file, width) {
  return variantWidths(width).map((step) => variantFile(file, step));
}
