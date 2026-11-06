import { readFile, writeFile } from 'node:fs/promises';
import { argv, exit } from 'node:process';

export const LOGO_SIZE = 512;
const MARK_SCALE = 0.72;

export function logoDocument(svg) {
  return `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;padding:0}
    body{width:${LOGO_SIZE}px;height:${LOGO_SIZE}px;display:flex;align-items:center;
         justify-content:center;background:#ffffff}
    svg{width:${Math.round(LOGO_SIZE * MARK_SCALE)}px;height:auto;display:block}
  </style>${svg}`;
}

/**
 * @param {string} source
 * @param {string} target
 * @returns {Promise<number>}
 */
async function main(source, target) {
  const svg = await readFile(source, 'utf8');
  const { chromium } = await import('@playwright/test');

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: LOGO_SIZE, height: LOGO_SIZE },
      deviceScaleFactor: 1,
    });
    await page.setContent(logoDocument(svg), { waitUntil: 'load' });
    const png = await page.screenshot({ type: 'png' });
    await writeFile(target, png);
    console.log(`[build-logo] ${target} written at ${LOGO_SIZE}x${LOGO_SIZE} from ${source}.`);
    return 0;
  } finally {
    await browser.close();
  }
}

if (import.meta.filename === argv[1]) {
  exit(await main(argv[2] ?? 'public/brand/mark.svg', argv[3] ?? 'public/brand/logo.png'));
}
