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

describe('the production environment', () => {
  it('ships no API origin, because no contact API is deployed', () => {
    // `api.nexoratechnology.org` does not resolve and the apex serves only the static site, so
    // a configured origin here would guarantee ERR_NAME_NOT_RESOLVED on every inquiry. The
    // submitter reads the empty value as `not-configured` and says so in the visitor's language.
    expect(production.apiOrigin).toBe('');
  });

  it('carries no developer address', () => {
    for (const value of Object.values(production)) {
      if (typeof value === 'string') {
        expect(value).not.toMatch(/localhost|127\.0\.0\.1|\[::1\]/);
      }
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
