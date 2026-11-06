import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import { LOGO_SIZE, logoDocument } from './build-logo.mjs';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MINIMUM_SIZE = 112;

describe('build-logo', () => {
  it('draws the mark centred on an opaque square at the target size', () => {
    const html = logoDocument('<svg viewBox="0 0 10 10"></svg>');
    assert.match(html, new RegExp(`width:${LOGO_SIZE}px;height:${LOGO_SIZE}px`));
    assert.match(html, /background:#ffffff/);
    assert.match(html, /align-items:center/);
    assert.ok(html.includes('<svg viewBox="0 0 10 10"></svg>'));
  });

  it('ships a committed PNG at the size the structured data advertises', async () => {
    const png = await readFile('public/brand/logo.png');

    assert.deepEqual(
      png.subarray(0, 8),
      PNG_SIGNATURE,
      'public/brand/logo.png is not a PNG. Regenerate it with `npm run build:logo`.',
    );

    assert.equal(png.subarray(12, 16).toString('latin1'), 'IHDR');
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);

    assert.equal(width, LOGO_SIZE, 'logo.png width does not match LOGO_SIZE');
    assert.equal(height, LOGO_SIZE, 'logo.png height does not match LOGO_SIZE');
    assert.ok(width === height, 'the logo must be square');
    assert.ok(width >= MINIMUM_SIZE, `the logo must be at least ${MINIMUM_SIZE}px`);
  });

  it('keeps the source mark beside it, so the PNG can be regenerated', async () => {
    const svg = await readFile('public/brand/mark.svg', 'utf8');
    assert.match(svg, /<svg/);
  });
});
