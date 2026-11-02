import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { environment as production } from '../../../environments/environment.production';
import { API_ORIGIN, isUsableOrigin, normalizeOrigin } from './api-origin';

/**
 * The origin now comes from `src/environments`, swapped by `fileReplacements` in the production
 * configuration, rather than from sniffing the browser hostname at runtime. These cover the two
 * things that can go wrong with that: the production file claiming an endpoint that does not
 * exist, and a developer address surviving into it.
 */
describe('normalizeOrigin', () => {
  it('trims trailing slashes so the request path is not doubled', () => {
    expect(normalizeOrigin('https://nexoratechnology.org//')).toBe('https://nexoratechnology.org');
    expect(normalizeOrigin('https://nexoratechnology.org/')).toBe('https://nexoratechnology.org');
  });

  it('leaves a well-formed origin alone, and passes an empty one through', () => {
    expect(normalizeOrigin('https://nexoratechnology.org')).toBe('https://nexoratechnology.org');
    expect(normalizeOrigin('')).toBe('');
  });
});

describe('isUsableOrigin', () => {
  it('accepts an absolute http(s) origin, with or without a path prefix', () => {
    expect(isUsableOrigin('https://api.nexoratechnology.org')).toBe(true);
    expect(isUsableOrigin('http://localhost:3000')).toBe(true);
    expect(isUsableOrigin('https://api.nexoratechnology.org/v1')).toBe(true);
  });

  it('rejects a value that would be resolved against the current page', () => {
    // Without a scheme these are relative URLs: `${origin}/api/contact` would POST the inquiry
    // at the static host, which answers with the prerendered 404 document rather than an error.
    expect(isUsableOrigin('api.nexoratechnology.org')).toBe(false);
    expect(isUsableOrigin('localhost:3000')).toBe(false);
    expect(isUsableOrigin('/api')).toBe(false);
    expect(isUsableOrigin('')).toBe(false);
  });

  it('rejects a non-http scheme and a query or fragment', () => {
    expect(isUsableOrigin('ftp://api.nexoratechnology.org')).toBe(false);
    expect(isUsableOrigin('javascript:alert(1)')).toBe(false);
    expect(isUsableOrigin('https://api.nexoratechnology.org?key=1')).toBe(false);
    expect(isUsableOrigin('https://api.nexoratechnology.org#x')).toBe(false);
  });
});

describe('API_ORIGIN', () => {
  it('resolves from the active environment', () => {
    expect(TestBed.inject(API_ORIGIN)).toBe(normalizeOrigin(environment.apiOrigin));
  });

  it('is only ever empty or a usable origin', () => {
    // The submitter's single guard is `if (!this.origin)`, so an unusable value has to arrive
    // here as the empty string rather than as something it will happily post to.
    const resolved = TestBed.inject(API_ORIGIN);
    expect(resolved === '' || isUsableOrigin(resolved)).toBe(true);
  });
});

/*
 * These assert invariants rather than today's value, so they hold both while no API is deployed
 * and after one is. The failure they exist to prevent is specific: `API_ORIGIN` collapses an
 * unusable value to the empty string, and the submitter reads the empty string as
 * `not-configured`. A typo in a deployed origin therefore produces a page that looks like it is
 * working and simply never sends an inquiry - no console error, no failed request, nothing to
 * alert on. Checking the invariant here turns that silence into a failed build.
 */
describe('the production environment', () => {
  it('ships an API origin that is either absent or actually usable', () => {
    expect(production.apiOrigin === '' || isUsableOrigin(production.apiOrigin)).toBe(true);
  });

  it('never ships a plaintext or non-production API origin', () => {
    if (production.apiOrigin !== '') {
      expect(production.apiOrigin).toMatch(/^https:\/\//);
      expect(production.apiOrigin).not.toMatch(/staging|preview/);
    }
  });

  it('carries no developer address', () => {
    for (const value of Object.values(production)) {
      if (typeof value === 'string') {
        expect(value).not.toMatch(/localhost|127\.0\.0\.1|\[::1\]/);
      }
    }
  });

  it('never points the API at the static site that serves this bundle', () => {
    /*
     * The one unusable value every other check in this file waves through. `siteOrigin` is a
     * well-formed, resolving https origin, so `isUsableOrigin` accepts it and the submitter
     * treats it as configured - then posts `/api/contact` at the host that serves this bundle.
     * Verified while writing this: that host answers every path from one static placeholder, so
     * the POST comes back `405`. Every inquiry becomes `failed`, which is worse than the
     * `not-configured` notice it replaced: that one at least gives the visitor a published
     * email address. Nothing about the value looks wrong, which is exactly why it needs
     * asserting.
     *
     * This is a tripwire, not a permanent rule. The API's README recommends serving it from
     * the site's own origin behind an nginx `/api/` proxy, and in that topology this value is
     * correct. No unit test can see whether that proxy is installed, so relaxing this
     * assertion is a deliberate step of that deployment - after `curl -i -X POST
     * https://<site>/api/contact` returns a validation `400` rather than `405` or HTML. See
     * CONTACT_API.md, "Switching the form on".
     */
    if (production.apiOrigin !== '') {
      expect(production.apiOrigin).not.toBe(production.siteOrigin);
      expect(new URL(production.apiOrigin).host).not.toBe(new URL(production.siteOrigin).host);
    }
  });

  it('names the canonical site origin, with no trailing slash', () => {
    expect(production.siteOrigin).toMatch(/^https:\/\/[^/]+$/);
  });

  it('agrees with development on the canonical origin', () => {
    // Canonical and Open Graph URLs must name the real site even from a preview build, so this
    // value is intentionally not environment-specific.
    expect(production.siteOrigin).toBe(environment.siteOrigin);
  });
});
