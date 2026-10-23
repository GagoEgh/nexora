import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SEO_CONFIG, SITE_ORIGIN } from './site-origin';

/**
 * The prerender guard: Angular's server DOM reports `http://ng-localhost`, so resolving the
 * origin from the document while prerendering would bake a dead host into every canonical and
 * alternate link on all 24 generated pages. The origin must come from configuration — never be
 * invented — and must resolve identically whether the page is rendered in a browser or at build
 * time, or the two would disagree about the canonical URL.
 */
describe('SITE_ORIGIN', () => {
  it('is a fully-qualified origin with no trailing slash', () => {
    expect(SEO_CONFIG.origin).toMatch(/^https?:\/\/[^/]+$/);
  });

  it('uses the configured origin in a browser', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(SITE_ORIGIN)).toBe(SEO_CONFIG.origin);
  });

  it('resolves to the same origin while prerendering, not the server placeholder', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const resolved = TestBed.inject(SITE_ORIGIN);

    expect(resolved).toBe(SEO_CONFIG.origin);
    expect(resolved).not.toMatch(/localhost/);
  });
});
