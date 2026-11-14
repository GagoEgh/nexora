import { readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { exit } from 'node:process';
import sharp from 'sharp';
import { IMAGES_DIR, MAX_IMAGE_BYTES, META_FILE, photoWidths } from './verify-images.mjs';
import { variantFile, variantWidths } from './image-ladder.mjs';

const QUALITY = 82;
const CONVERTIBLE = new Set(['.png', '.jpg', '.jpeg']);

const MAX_IMAGE_WIDTH = 1280;

async function convert(file) {
  const source = join(IMAGES_DIR, file);
  const { name } = parse(file);
  const target = join(IMAGES_DIR, `${name}.webp`);

  const before = (await stat(source)).size;
  const encoded = await sharp(source)
    .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer({ resolveWithObject: true });

  await writeFile(target, encoded.data);
  await unlink(source);

  return {
    file,
    from: before,
    to: encoded.data.length,
    width: encoded.info.width,
    height: encoded.info.height,
  };
}

/**
 * @param {number} bytes
 * @returns {string}
 */
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

async function publishVariants(file, width) {
  const source = join(IMAGES_DIR, file);
  const made = [];

  for (const step of variantWidths(width)) {
    const name = variantFile(file, step);
    const target = join(IMAGES_DIR, name);
    try {
      await stat(target);
      continue;
    } catch {
      // Not published yet.
    }

    const encoded = await sharp(source)
      .resize({ width: step, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer({ resolveWithObject: true });
    await writeFile(target, encoded.data);
    made.push({ file: name, to: encoded.data.length, width: encoded.info.width });
  }

  return made;
}

async function main() {
  const sources = (await readdir(IMAGES_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && CONVERTIBLE.has(parse(entry.name).ext.toLowerCase()))
    .map((entry) => entry.name);

  const results = await Promise.all(sources.map(convert));
  const registry = photoWidths(await readFile(META_FILE, 'utf8'));
  const variants = (
    await Promise.all([...registry].map(([file, width]) => publishVariants(file, width)))
  ).flat();

  if (variants.length > 0) {
    console.log(`[optimize-images] published ${variants.length} narrower copies:`);
    const name = Math.max(...variants.map((variant) => variant.file.length));
    for (const variant of variants.sort((a, b) => a.file.localeCompare(b.file))) {
      console.log(
        `  ${variant.file.padEnd(name)}  ${kb(variant.to).padStart(9)}  (${variant.width}px)`,
      );
    }
  }

  if (sources.length === 0) {
    console.log('[optimize-images] nothing to convert: every raster is already WebP.');
    return;
  }

  results.sort((a, b) => b.from - a.from);

  const width = Math.max(...results.map((result) => result.file.length));
  for (const result of results) {
    console.log(
      `  ${result.file.padEnd(width)}  ${kb(result.from).padStart(9)} -> ` +
        `${kb(result.to).padStart(9)}  (${result.width}x${result.height})`,
    );
  }

  const from = results.reduce((total, result) => total + result.from, 0);
  const to = results.reduce((total, result) => total + result.to, 0);
  const over = results.filter((result) => result.to > MAX_IMAGE_BYTES);

  console.log(
    `\n[optimize-images] ${results.length} files: ${kb(from)} -> ${kb(to)} ` +
      `(${Math.round((1 - to / from) * 100)}% smaller).`,
  );

  if (over.length > 0) {
    console.error(
      `[optimize-images] still over the ${kb(MAX_IMAGE_BYTES)} budget: ` +
        over.map((result) => `${result.file} at ${kb(result.to)}`).join(', '),
    );
    exit(1);
  }
}

if (import.meta.filename === process.argv[1]) {
  await main();
}
