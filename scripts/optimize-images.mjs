import { readdir, stat, unlink, writeFile } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { exit } from 'node:process';
import sharp from 'sharp';
import { IMAGES_DIR, MAX_IMAGE_BYTES, MAX_IMAGE_WIDTH } from './verify-images.mjs';

const QUALITY = 78;
const CONVERTIBLE = new Set(['.png', '.jpg', '.jpeg']);

async function convert(file) {
  const source = join(IMAGES_DIR, file);
  const target = join(IMAGES_DIR, `${parse(file).name}.webp`);

  const before = (await stat(source)).size;
  const encoded = await sharp(source)
    .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer({ resolveWithObject: true });

  await writeFile(target, encoded.data);
  await unlink(source);

  return { file, from: before, to: encoded.data.length, width: encoded.info.width };
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

async function main() {
  const entries = await readdir(IMAGES_DIR);
  const sources = entries.filter((name) => CONVERTIBLE.has(parse(name).ext.toLowerCase()));

  if (sources.length === 0) {
    console.log('[optimize-images] nothing to convert: every raster is already WebP.');
    return;
  }

  const results = await Promise.all(sources.map(convert));
  results.sort((a, b) => b.from - a.from);

  const width = Math.max(...results.map((result) => result.file.length));
  for (const result of results) {
    console.log(
      `  ${result.file.padEnd(width)}  ${kb(result.from).padStart(9)} -> ` +
        `${kb(result.to).padStart(9)}  (${result.width}px wide)`,
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
