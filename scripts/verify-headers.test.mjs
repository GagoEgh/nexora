import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  apiOriginFrom,
  checkHeaders,
  hashesIn,
  inlineScriptHashes,
  isExecutableScript,
  parseCsp,
  parseHeaders,
} from './verify-headers.mjs';

/**
 * The checker's logic, exercised without a build. The artifact check itself is
 * `npm run verify:headers`, which needs `dist/` and so cannot run here.
 */
describe('verify-headers', () => {
  it('counts only the script types a browser executes', () => {
    assert.equal(isExecutableScript(''), true);
    assert.equal(
      isExecutableScript(' type="text/javascript" id="ng-event-dispatch-contract"'),
      true,
    );
    assert.equal(isExecutableScript(' type="application/javascript"'), true);
    // `ng-state` and the JSON-LD block are inert data, not code.
    assert.equal(isExecutableScript(' id="ng-state" type="application/json"'), false);
    assert.equal(isExecutableScript(' type="application/ld+json"'), false);
    // An external script is covered by 'self', not by a hash.
    assert.equal(isExecutableScript(' src="main-ABC.js" type="module"'), false);
  });

  it('hashes each executable inline script and skips the rest', () => {
    const html = [
      '<script type="application/json" id="ng-state">{"a":1}</script>',
      '<script src="main.js" type="module"></script>',
      '<script>window.go()</script>',
    ].join('');
    const hashes = inlineScriptHashes(html);
    assert.equal(hashes.length, 1);
    assert.match(hashes[0], /^sha256-[A-Za-z0-9+/]+=*$/);
  });

  it('is stable for identical bodies and different for changed ones', () => {
    const [a] = inlineScriptHashes('<script>window.go("click")</script>');
    const [b] = inlineScriptHashes('<script>window.go("click")</script>');
    const [c] = inlineScriptHashes('<script>window.go("keydown")</script>');
    assert.equal(a, b);
    assert.notEqual(a, c);
  });

  it('reads the indented header lines and ignores comments and rule paths', () => {
    const headers = parseHeaders(
      ['# a comment', '/*', '  X-Frame-Options: DENY', '  Referrer-Policy: no-referrer', ''].join(
        '\n',
      ),
    );
    assert.equal(headers.get('X-Frame-Options'), 'DENY');
    assert.equal(headers.get('Referrer-Policy'), 'no-referrer');
    // `/*` is the rule path, not a header, and must not become one.
    assert.equal(headers.has('/*'), false);
    assert.equal(headers.size, 2);
  });

  it('keeps a header value containing a colon intact', () => {
    const headers = parseHeaders(
      ['/*', '  Content-Security-Policy: default-src https:'].join('\n'),
    );
    assert.equal(headers.get('Content-Security-Policy'), 'default-src https:');
  });

  it('splits a CSP into directives', () => {
    const directives = parseCsp("default-src 'self'; object-src 'none'; upgrade-insecure-requests");
    assert.equal(directives.get('default-src'), "'self'");
    assert.equal(directives.get('object-src'), "'none'");
    assert.equal(directives.get('upgrade-insecure-requests'), '');
  });

  it('picks hash expressions out of a source list', () => {
    assert.deepEqual(hashesIn("'self' 'sha256-AAA=' https://x.test 'sha384-BBB='"), [
      'sha256-AAA=',
      'sha384-BBB=',
    ]);
    assert.deepEqual(hashesIn("'self'"), []);
  });

  it('reads the production apiOrigin out of the environment file', () => {
    assert.equal(apiOriginFrom("  apiOrigin: 'https://api.test',"), 'https://api.test');
    assert.equal(apiOriginFrom("  apiOrigin: '',"), '');
  });

  const good = () =>
    new Map([
      ['Strict-Transport-Security', 'max-age=31536000'],
      ['X-Content-Type-Options', 'nosniff'],
      ['X-Frame-Options', 'DENY'],
      ['Referrer-Policy', 'strict-origin-when-cross-origin'],
      ['Permissions-Policy', 'geolocation=()'],
      [
        'Content-Security-Policy',
        "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; " +
          "form-action 'self'; connect-src 'self'; script-src 'self' 'sha256-AAA='",
      ],
    ]);

  it('passes a header set that matches the build', () => {
    assert.deepEqual(checkHeaders(good(), new Set(['sha256-AAA=']), ''), []);
  });

  it('fails when the build emits a script the CSP does not allow', () => {
    const problems = checkHeaders(good(), new Set(['sha256-AAA=', 'sha256-NEW=']), '');
    assert.equal(problems.length, 1);
    assert.match(problems[0], /does not allow: sha256-NEW=/);
  });

  it('fails on a hash the build no longer emits', () => {
    const problems = checkHeaders(good(), new Set([]), '');
    assert.match(problems.join('\n'), /no longer emits: sha256-AAA=/);
  });

  it('fails on unsafe-inline or unsafe-eval in script-src', () => {
    const headers = good();
    headers.set(
      'Content-Security-Policy',
      `${headers.get('Content-Security-Policy') ?? ''} 'unsafe-inline'`,
    );
    assert.match(checkHeaders(headers, new Set(['sha256-AAA=']), '').join('\n'), /unsafe-inline/);
  });

  it('fails on a missing header', () => {
    const headers = good();
    headers.delete('X-Content-Type-Options');
    assert.match(
      checkHeaders(headers, new Set(['sha256-AAA=']), '').join('\n'),
      /missing header: X-Content-Type-Options/,
    );
  });

  it('refuses a Report-Only policy, which enforces nothing', () => {
    const headers = good();
    headers.set(
      'Content-Security-Policy-Report-Only',
      headers.get('Content-Security-Policy') ?? '',
    );
    headers.delete('Content-Security-Policy');
    assert.match(checkHeaders(headers, new Set(['sha256-AAA=']), '').join('\n'), /Report-Only/);
  });

  it('fails when a configured apiOrigin is missing from connect-src', () => {
    const problems = checkHeaders(good(), new Set(['sha256-AAA=']), 'https://api.test');
    assert.match(problems.join('\n'), /connect-src does not list the configured apiOrigin/);
  });

  it('passes once connect-src lists the configured apiOrigin', () => {
    const headers = good();
    const csp = headers.get('Content-Security-Policy') ?? '';
    headers.set(
      'Content-Security-Policy',
      csp.replace("connect-src 'self'", "connect-src 'self' https://api.test"),
    );
    assert.deepEqual(checkHeaders(headers, new Set(['sha256-AAA=']), 'https://api.test'), []);
  });
});
