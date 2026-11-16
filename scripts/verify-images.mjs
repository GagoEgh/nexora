import { readdir, readFile, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';
import { variantFiles } from './image-ladder.mjs';
import { exit } from 'node:process';

export const IMAGES_DIR = 'public/images';
export const MAX_IMAGE_BYTES = 120 * 1024;

export const META_FILE = 'src/app/pages/our-work/products/data/product-meta.ts';

/**
 * @param {string} source - the text of product-meta.ts
 * @returns {string[]}
 */
export function referencedPhotos(source) {
  return [...source.matchAll(/file:\s*'([^']+)'/g)].map((match) => match[1]);
}

/**
 *
 * @param {string} source - the text of product-meta.ts
 * @returns {Map<string, number>}
 */
export function photoWidths(source) {
  return new Map(
    [...source.matchAll(/file:\s*'([^']+)',\s*width:\s*(\d+)/g)].map((match) => [
      match[1],
      Number(match[2]),
    ]),
  );
}

export function photoBoxes(source) {
  return new Map(
    [...source.matchAll(/file:\s*'([^']+)',\s*width:\s*(\d+),\s*height:\s*(\d+)/g)].map((match) => [
      match[1],
      { width: Number(match[2]), height: Number(match[3]) },
    ]),
  );
}

export function checkDimensions(declared, measured) {
  /** @type {string[]} */
  const problems = [];

  for (const [file, box] of declared) {
    const actual = measured.get(file);
    if (!actual) {
      continue; // Absence is already reported by `checkImages`; not this rule's business.
    }
    if (actual.width !== box.width || actual.height !== box.height) {
      problems.push(
        `${META_FILE} declares ${file} as ${box.width}x${box.height} but the file is ` +
          `${actual.width}x${actual.height} - the reserved box and its srcset descriptors are ` +
          `both wrong; correct the registry to the measured size`,
      );
    }
  }

  for (const [file, actual] of measured) {
    const variant = /^(.*)-(\d+)\.webp$/.exec(file);
    if (!variant) {
      continue;
    }
    const origin = `${variant[1]}.webp`;
    const step = Number(variant[2]);
    if (!declared.has(origin)) {
      continue; // Not a ladder variant of a known photograph.
    }
    if (actual.width !== step) {
      problems.push(
        `${file} is named as the ${step}w candidate but is ${actual.width}px wide - it was ` +
          `never resized; delete it and run \`npm run images:optimize\``,
      );
    }
  }

  return problems;
}

export function checkImages(files, referenced, sizes, widths = new Map()) {
  /** @type {string[]} */
  const problems = [];
  const onDisk = new Set(files);
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
  const declared = photoBoxes(registry);
  if (referenced.length === 0) {
    console.error(`[verify-images] found no photographs in ${META_FILE}; the check is vacuous`);
    exit(1);
  }

  /** @type {Map<string, { width: number, height: number }>} */
  const measured = new Map();
  for (const file of files) {
    try {
      const { width, height } = await sharp(join(IMAGES_DIR, file)).metadata();
      if (typeof width === 'number' && typeof height === 'number') {
        measured.set(file, { width, height });
      }
    } catch {
      // Unreadable or not an image; `checkImages` owns that complaint.
    }
  }

  const problems = [
    ...checkImages(files, referenced, sizes, widths),
    ...checkDimensions(declared, measured),
  ];
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
