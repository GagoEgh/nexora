import { readdir, readFile, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { exit } from 'node:process';

export const IMAGES_DIR = 'public/images';
export const MAX_IMAGE_WIDTH = 800;
export const MAX_IMAGE_BYTES = 120 * 1024;

const CONTENT_FILE = 'src/app/pages/our-work/products/product.content.ts';

export function referencedImages(source) {
  return [...source.matchAll(/image:\s*'(\/images\/[^']+)'/g)].map((match) => match[1]);
}

export function checkImages(files, referenced, sizes) {
  /** @type {string[]} */
  const problems = [];
  const named = new Set(referenced.map((path) => path.replace('/images/', '')));

  for (const file of files) {
    if (parse(file).ext.toLowerCase() !== '.webp') {
      problems.push(
        `${file} is not WebP - run \`npm run images:optimize\` rather than committing a source`,
      );
      continue;
    }

    const size = sizes.get(file) ?? 0;
    if (size > MAX_IMAGE_BYTES) {
      problems.push(
        `${file} is ${(size / 1024).toFixed(1)} kB, over the ` +
          `${(MAX_IMAGE_BYTES / 1024).toFixed(0)} kB per-file budget`,
      );
    }

    if (!named.has(file)) {
      problems.push(`${file} is in the build but no page references it`);
    }
  }

  const onDisk = new Set(files);
  for (const path of new Set(referenced)) {
    if (!onDisk.has(path.replace('/images/', ''))) {
      problems.push(`${CONTENT_FILE} names ${path}, which is not in ${IMAGES_DIR}`);
    }
  }

  return problems;
}

async function main() {
  const files = (await readdir(IMAGES_DIR)).filter((name) => !name.startsWith('.'));
  /** @type {Map<string, number>} */
  const sizes = new Map();
  for (const file of files) {
    sizes.set(file, (await stat(join(IMAGES_DIR, file))).size);
  }

  const referenced = referencedImages(await readFile(CONTENT_FILE, 'utf8'));
  if (referenced.length === 0) {
    console.error(`[verify-images] found no image paths in ${CONTENT_FILE}; the check is vacuous`);
    exit(1);
  }

  const problems = checkImages(files, referenced, sizes);
  if (problems.length > 0) {
    console.error('[verify-images] problems:');
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    exit(1);
  }

  const total = [...sizes.values()].reduce((sum, size) => sum + size, 0);
  console.log(
    `[verify-images] ${files.length} images, ${(total / 1024).toFixed(1)} kB in total, ` +
      `all WebP, all referenced, largest ${(Math.max(...sizes.values()) / 1024).toFixed(1)} kB.`,
  );
}

if (import.meta.filename === process.argv[1]) {
  await main();
}
