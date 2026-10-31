import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { environment as production } from '../../../environments/environment.production';
import { environment as staging } from '../../../environments/environment.staging';
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

  it('names the canonical site origin, with no trailing slash', () => {
    expect(production.siteOrigin).toMatch(/^https:\/\/[^/]+$/);
  });

  it('agrees with development on the canonical origin', () => {
    // Canonical and Open Graph URLs must name the real site even from a preview build, so this
    // value is intentionally not environment-specific.
    expect(production.siteOrigin).toBe(environment.siteOrigin);
  });
});

describe('the staging environment', () => {
  it('names a usable API origin over https', () => {
    // Staging's whole purpose is to prove a submission reaches a database, so an unusable
    // origin here does not degrade gracefully - it invalidates the rehearsal.
    expect(isUsableOrigin(staging.apiOrigin)).toBe(true);
    expect(staging.apiOrigin).toMatch(/^https:\/\//);
  });

  it('points at a different API than production', () => {
    expect(staging.apiOrigin).not.toBe(production.apiOrigin);
  });

  it('carries no developer address', () => {
    for (const value of Object.values(staging)) {
      if (typeof value === 'string') {
        expect(value).not.toMatch(/localhost|127\.0\.0\.1|\[::1\]/);
      }
    }
  });

  it('still advertises the production site as canonical', () => {
    // A staging build that named itself canonical would compete with the real pages in search.
    expect(staging.siteOrigin).toBe(production.siteOrigin);
  });
});
