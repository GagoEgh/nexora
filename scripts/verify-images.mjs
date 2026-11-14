import { readdir, readFile, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { variantFiles } from './image-ladder.mjs';
import { exit } from 'node:process';

export const IMAGES_DIR = 'public/images';
export const MAX_IMAGE_BYTES = 120 * 1024;

export const META_FILE = 'src/app/pages/our-work/products/data/product-meta.ts';

/**
 * Every photograph the product registry points at, in file order. Order is kept so the duplicate
 * check can name the second product to claim a file rather than the first.
 *
 * @param {string} source - the text of product-meta.ts
 * @returns {string[]}
 */
export function referencedPhotos(source) {
  return [...source.matchAll(/file:\s*'([^']+)'/g)].map((match) => match[1]);
}

export function photoWidths(source) {
  return new Map(
    [...source.matchAll(/file:\s*'([^']+)',\s*width:\s*(\d+)/g)].map((match) => [
      match[1],
      Number(match[2]),
    ]),
  );
}

export function checkImages(files, referenced, sizes, widths = new Map()) {
  /** @type {string[]} */
  const problems = [];
  const onDisk = new Set(files);

  // A photograph is published as itself plus the ladder steps narrower than it. Both count as
  // referenced: the registry names the photograph, and the width it records names the rest.
  /** @type {Map<string, string>} */
  const expected = new Map();
  for (const file of referenced) {
    expected.set(file, file);
    for (const variant of variantFiles(file, widths.get(file) ?? 0)) {
      expected.set(variant, file);
    }
  }
  const named = expected;

  for (const file of files) {
    if (parse(file).ext.toLowerCase() !== '.webp') {
      problems.push(
        `${file} is not WebP - run \`npm run images:optimize\` rather than committing a source`,
      );
      continue;
    }

    if (!named.has(file)) {
      problems.push(`${file} is in the build but no product references it`);
      continue;
    }

    const size = sizes.get(file) ?? 0;
    if (size > MAX_IMAGE_BYTES) {
      problems.push(
        `${file} is ${(size / 1024).toFixed(1)} kB, over the ` +
          `${(MAX_IMAGE_BYTES / 1024).toFixed(0)} kB per-file budget`,
      );
    }
  }

  /** @type {Set<string>} */
  const seen = new Set();
  for (const file of referenced) {
    if (seen.has(file)) {
      problems.push(
        `${META_FILE} points more than one product at ${file}; each product carries its own photo`,
      );
      continue;
    }
    seen.add(file);

    if (!onDisk.has(file)) {
      problems.push(`${META_FILE} names ${file}, which is not in ${IMAGES_DIR}`);
      continue;
    }

    for (const variant of variantFiles(file, widths.get(file) ?? 0)) {
      if (!onDisk.has(variant)) {
        problems.push(
          `${file} is served responsively but ${variant} is missing - run \`npm run images:optimize\``,
        );
      }
    }
  }

  return problems;
}

async function main() {
  const files = (await readdir(IMAGES_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
    .map((entry) => entry.name);

  /** @type {Map<string, number>} */
  const sizes = new Map();
  for (const file of files) {
    sizes.set(file, (await stat(join(IMAGES_DIR, file))).size);
  }

  const registry = await readFile(META_FILE, 'utf8');
  const referenced = referencedPhotos(registry);
  const widths = photoWidths(registry);
  if (referenced.length === 0) {
    console.error(`[verify-images] found no photographs in ${META_FILE}; the check is vacuous`);
    exit(1);
  }

  const problems = checkImages(files, referenced, sizes, widths);
  if (problems.length > 0) {
    console.error('[verify-images] problems:');
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    exit(1);
  }

  const total = [...sizes.values()].reduce((sum, size) => sum + size, 0);
  console.log(
    `[verify-images] ${referenced.length} photographs, ${files.length} files, ` +
      `${(total / 1024).toFixed(1)} kB in total, all WebP, all referenced, ` +
      `largest ${(Math.max(...sizes.values()) / 1024).toFixed(1)} kB.`,
  );
}

if (import.meta.filename === process.argv[1]) {
  await main();
}
