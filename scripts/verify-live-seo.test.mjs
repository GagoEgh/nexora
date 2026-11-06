import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canonicalOf,
  checkAssetCaching,
  checkNotFound,
  checkPage,
  checkWwwRedirect,
  headerValues,
  sitemapUrls,
} from './verify-live-seo.mjs';

const ORIGIN = 'https://example.test';

describe('verify-live-seo', () => {
  it('reads the sitemap URL set', () => {
    assert.deepEqual(
      sitemapUrls('<url><loc>https://a.test/</loc></url><url><loc>https://a.test/hy</loc></url>'),
      ['https://a.test/', 'https://a.test/hy'],
    );
    assert.deepEqual(sitemapUrls('<urlset></urlset>'), []);
  });

  it('finds the canonical href and is not fooled by the other head links', () => {
    assert.equal(
      canonicalOf(
        '<link rel="preload" href="/a.js"><link rel="canonical" href="https://a.test/about">',
      ),
      'https://a.test/about',
    );
    assert.equal(canonicalOf('<link rel="alternate" hreflang="en" href="/x">'), null);
    assert.equal(canonicalOf(''), null);
  });

  it('keeps repeated headers separate, which is the point of not using fetch', () => {
    const raw = [
      'Content-Type',
      'application/javascript',
      'Cache-Control',
      'public, max-age=2592000',
      'cache-control',
      'public, max-age=31536000, immutable',
    ];
    assert.deepEqual(headerValues(raw, 'cache-control'), [
      'public, max-age=2592000',
      'public, max-age=31536000, immutable',
    ]);
    assert.deepEqual(headerValues(raw, 'Location'), []);
  });

  describe('a canonical URL', () => {
    const ok = {
      status: 200,
      headers: ['Content-Type', 'text/html; charset=utf-8'],
      body: `<link rel="canonical" href="${ORIGIN}/services">`,
    };

    it('passes when it is served directly with a matching canonical', () => {
      assert.deepEqual(checkPage(`${ORIGIN}/services`, ok), []);
    });

    it('fails on the trailing-slash redirect the audit found in production', () => {
      const problems = checkPage(`${ORIGIN}/services`, {
        status: 301,
        headers: ['Location', `${ORIGIN}/services/`],
        body: '',
      });
      assert.equal(problems.length, 2);
      assert.match(problems[0], /answered 301/);
      assert.match(problems[1], /must be served directly/);
    });

    it('fails when the body disagrees with the URL it was served at', () => {
      assert.deepEqual(checkPage(`${ORIGIN}/services/`, ok), [
        `declares canonical ${ORIGIN}/services, but was served at ${ORIGIN}/services/`,
      ]);
    });

    it('fails when there is no canonical at all', () => {
      assert.deepEqual(checkPage(`${ORIGIN}/services`, { ...ok, body: '<html></html>' }), [
        `declares canonical null, but was served at ${ORIGIN}/services`,
      ]);
    });

    it('does not complain about a missing canonical in a body it never got', () => {
      const problems = checkPage(`${ORIGIN}/services`, { status: 500, headers: [], body: '' });
      assert.deepEqual(problems, ['answered 500, expected 200']);
    });
  });

  describe('an unknown URL', () => {
    const notFound = (overrides = {}) => ({
      status: 404,
      body: '<html lang="hy"><meta name="robots" content="noindex, follow">',
      ...overrides,
    });

    it('passes when it is a hard 404, localized, and noindex', () => {
      assert.deepEqual(checkNotFound(notFound(), 'hy'), []);
    });

    it('fails on a soft 404', () => {
      assert.deepEqual(checkNotFound(notFound({ status: 200 }), 'hy'), [
        'answered 200, expected 404',
      ]);
    });

    it('fails when the 404 falls through to the wrong language', () => {
      const problems = checkNotFound(notFound({ body: '<html lang="en">' }), 'hy');
      assert.ok(problems.some((problem) => /served the 404 in "en", expected hy/.test(problem)));
    });

    it('fails when the 404 body is indexable', () => {
      const problems = checkNotFound(notFound({ body: '<html lang="hy">' }), 'hy');
      assert.ok(problems.some((problem) => /no `noindex` robots meta/.test(problem)));
    });
  });

  describe('the www hostname', () => {
    it('passes on a 301 to the apex', () => {
      assert.deepEqual(
        checkWwwRedirect({ status: 301, headers: ['Location', `${ORIGIN}/services`] }, ORIGIN),
        [],
      );
    });

    it('fails on the 200 the audit found, which is the site served twice', () => {
      const problems = checkWwwRedirect({ status: 200, headers: [] }, ORIGIN);
      assert.equal(problems.length, 1);
      assert.match(problems[0], /answered 200 -> null; expected 301/);
    });

    it('fails on a redirect that lands somewhere else', () => {
      const problems = checkWwwRedirect(
        { status: 301, headers: ['Location', 'https://elsewhere.test/'] },
        ORIGIN,
      );
      assert.equal(problems.length, 1);
    });
  });

  describe('hashed asset caching', () => {
    it('passes on exactly one immutable year', () => {
      assert.deepEqual(checkAssetCaching(['public, max-age=31536000, immutable']), []);
    });

    it('catches the duplicate header the audit found in production', () => {
      const problems = checkAssetCaching(['public, max-age=2592000', 'public, max-age=2592000']);
      assert.ok(problems.some((problem) => /sent 2 Cache-Control headers/.test(problem)));
      assert.ok(problems.some((problem) => /expected max-age=31536000/.test(problem)));
      assert.ok(problems.some((problem) => /expected it to be immutable/.test(problem)));
    });

    it('catches a missing header', () => {
      assert.ok(checkAssetCaching([]).some((problem) => /sent 0 Cache-Control/.test(problem)));
    });

    it('does not accept max-age=3153600, a digit short of a year', () => {
      assert.ok(
        checkAssetCaching(['public, max-age=3153600, immutable']).some((problem) =>
          /expected max-age=31536000/.test(problem),
        ),
      );
    });
  });
});
