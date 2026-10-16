import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { APP_ICON_NAMES } from '../src/app/core/icons/icons';

/**
 * Icon system contract.
 * - The catalogue (core/icons/icons.ts) and public/icons agree exactly.
 * - Every icon is served verbatim.
 * - Rendered inside a `.mat-icon` host, strokes follow the surface colour:
 *   on-surface on light surfaces, inverse-on-surface on inverse surfaces.
 */
const ICONS_DIR = join(__dirname, '..', 'public', 'icons');

test.describe('icon assets', () => {
  test('the catalogue matches public/icons exactly', () => {
    const files = readdirSync(ICONS_DIR)
      .filter((f) => f.endsWith('.svg'))
      .map((f) => f.replace(/\.svg$/, ''))
      .sort();
    expect(files).toEqual([...APP_ICON_NAMES].sort());
  });

  test('every icon is served unchanged', async ({ request }) => {
    for (const name of APP_ICON_NAMES) {
      const response = await request.get(`/icons/${name}.svg`);
      expect(response.status(), name).toBe(200);
      expect(response.headers()['content-type'], name).toContain('image/svg+xml');
      expect(await response.text(), name).toBe(readFileSync(join(ICONS_DIR, `${name}.svg`), 'utf8'));
    }
  });
});

test.describe('icon theming', () => {
  test('strokes follow currentColor inside a mat-icon host', async ({ page, request }) => {
    await page.goto('/');
    const svg = await (await request.get('/icons/arrow-right.svg')).text();

    // Reproduce what MatIconRegistry does: the fetched SVG is inlined inside the `.mat-icon` host.
    const strokes = await page.evaluate((markup) => {
      const host = document.createElement('span');
      host.className = 'mat-icon';
      host.innerHTML = markup;
      document.body.append(host);
      const path = host.querySelector('path') as SVGPathElement;

      const light = getComputedStyle(path).stroke;
      document.body.style.color = 'var(--mat-sys-inverse-on-surface)';
      const dark = getComputedStyle(path).stroke;

      document.body.style.color = '';
      host.remove();
      return { light, dark, sourceAttribute: path.getAttribute('stroke') };
    }, svg);

    expect(strokes.sourceAttribute).toBe('#0B1324'); // file untouched
    expect(strokes.light).toBe('rgb(11, 19, 36)'); // on-surface == source colour
    expect(strokes.dark).toBe('rgb(246, 248, 251)'); // inverse-on-surface
  });
});
