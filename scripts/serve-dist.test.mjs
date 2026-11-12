import assert from 'node:assert/strict';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { candidatesFor, contentTypeOf, notFoundDocumentFor } from './serve-dist.mjs';

describe('serve-dist', () => {
  it('tries a path as a file and then as a directory index, like `try_files`', () => {
    assert.deepEqual(candidatesFor('/solutions'), ['solutions', join('solutions', 'index.html')]);
    assert.deepEqual(candidatesFor('/main-ABCD1234.js'), [
      'main-ABCD1234.js',
      join('main-ABCD1234.js', 'index.html'),
    ]);
  });

  it('serves the root document for `/`, with or without the trailing slash', () => {
    assert.deepEqual(candidatesFor('/'), ['index.html']);
    assert.deepEqual(candidatesFor(''), ['index.html']);
    assert.deepEqual(candidatesFor('/solutions/'), ['solutions', join('solutions', 'index.html')]);
  });

  it('refuses a path that would escape the build directory', () => {
    assert.deepEqual(candidatesFor('/../package.json'), []);
    assert.deepEqual(candidatesFor('/../../etc/passwd'), []);
  });

  it('answers a bad URL with the not-found document for that locale', () => {
    assert.equal(notFoundDocumentFor('/no-such-page'), 'not-found/index.html');
    assert.equal(notFoundDocumentFor('/hy/no-such-page'), 'hy/not-found/index.html');
    assert.equal(notFoundDocumentFor('/ru/no-such-page'), 'ru/not-found/index.html');
    assert.equal(notFoundDocumentFor('/hy'), 'hy/not-found/index.html');
  });

  it('does not read a locale prefix out of a longer first segment', () => {
    assert.equal(notFoundDocumentFor('/running'), 'not-found/index.html');
    assert.equal(notFoundDocumentFor('/hybrid'), 'not-found/index.html');
  });

  it('labels documents and hashed assets with the types a browser needs', () => {
    assert.equal(contentTypeOf('/dist/index.html'), 'text/html; charset=utf-8');
    assert.equal(contentTypeOf('/dist/main-ABCD1234.js'), 'text/javascript; charset=utf-8');
    assert.equal(contentTypeOf('/dist/styles-ABCD1234.css'), 'text/css; charset=utf-8');
    assert.equal(contentTypeOf('/dist/sitemap.xml'), 'application/xml; charset=utf-8');
    assert.equal(contentTypeOf('/dist/brand/logo.png'), 'image/png');
    assert.equal(contentTypeOf('/dist/fonts/inter.woff2'), 'font/woff2');
    assert.equal(contentTypeOf('/dist/unknown.bin'), 'application/octet-stream');
  });
});
