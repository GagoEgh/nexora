import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatKb,
  loadedScripts,
  measureDocument,
  MAX_ROUTE_GZIP_BYTES,
} from './verify-bundle-budget.mjs';

/**
 * The measurement logic, exercised without a build. The artifact check itself is
 * `npm run verify:bundle`, which needs `dist/` and so cannot run here.
 */
describe('verify-bundle-budget', () => {
  it('counts the entry script and every modulepreload', () => {
    const html = `<!DOCTYPE html><html><head>
      <link rel="modulepreload" href="chunk-A.js">
      <link rel="modulepreload" href="chunk-B.js">
      <link rel="stylesheet" href="styles.css">
    </head><body><script src="main.js" type="module"></script></body></html>`;

    assert.deepEqual(loadedScripts(html).sort(), ['chunk-A.js', 'chunk-B.js', 'main.js']);
  });

  it('ignores preloads that are not JavaScript, and non-preload links', () => {
    const html = `
      <link rel="modulepreload" href="chunk-A.js">
      <link rel="preload" href="font.woff2" as="font">
      <link rel="modulepreload" href="data.json">
      <link rel="canonical" href="https://example.test/page.js">`;

    assert.deepEqual(loadedScripts(html), ['chunk-A.js']);
  });

  it('strips a leading slash so the path joins to the output directory', () => {
    assert.deepEqual(loadedScripts('<script src="/main.js"></script>'), ['main.js']);
  });

  it('counts a chunk once when a document references it twice', () => {
    const html = `<link rel="modulepreload" href="chunk-A.js">
      <link rel="modulepreload" href="chunk-A.js">
      <script src="chunk-A.js"></script>`;

    assert.deepEqual(loadedScripts(html), ['chunk-A.js']);
  });

  it('sums raw and gzip sizes across the scripts a document loads', async () => {
    /** @type {Record<string, { raw: number, gzip: number }>} */
    const sizes = {
      'main.js': { raw: 1000, gzip: 300 },
      'chunk-A.js': { raw: 500, gzip: 150 },
    };
    const html = `<script src="main.js"></script><link rel="modulepreload" href="chunk-A.js">`;

    const measured = await measureDocument(html, async (path) => sizes[path]);

    assert.deepEqual(measured, { files: 2, raw: 1500, gzip: 450 });
  });

  it('reports a document that loads nothing as zero rather than failing', async () => {
    const measured = await measureDocument('<html></html>', async () => {
      throw new Error('should not be called');
    });

    assert.deepEqual(measured, { files: 0, raw: 0, gzip: 0 });
  });

  it('formats bytes as kB to one decimal', () => {
    assert.equal(formatKb(1024), '1.0 kB');
    assert.equal(formatKb(220.7 * 1024), '220.7 kB');
    assert.equal(formatKb(0), '0.0 kB');
  });

  it('keeps the budget within sight of the measurement it was set from', () => {
    // The worst route measured 220.7 kB when the ceiling was chosen, and 221.7 kB after the
    // contact form gained server-side field errors. A budget that drifts far above the real
    // figure stops being a regression gate, so this fails if someone quietly doubles it instead
    // of investigating. Update both numbers together, deliberately.
    const measuredWorst = 221.7 * 1024;
    assert.ok(MAX_ROUTE_GZIP_BYTES > measuredWorst, 'budget must leave headroom');
    assert.ok(MAX_ROUTE_GZIP_BYTES < measuredWorst * 1.25, 'budget has drifted from reality');
  });
});
