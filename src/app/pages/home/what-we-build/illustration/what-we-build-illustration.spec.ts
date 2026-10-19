import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  WHAT_WE_BUILD_ILLUSTRATION_KINDS,
  WhatWeBuildIllustration,
  isWhatWeBuildIllustrationKind,
} from './what-we-build-illustration';

describe('WhatWeBuildIllustration', () => {
  let fixture: ComponentFixture<WhatWeBuildIllustration>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatWeBuildIllustration],
    }).compileComponents();
    fixture = TestBed.createComponent(WhatWeBuildIllustration);
    host = fixture.nativeElement as HTMLElement;
  });

  it('draws every kind as one decorative SVG on the shared 368 x 168 canvas, without text', async () => {
    for (const kind of WHAT_WE_BUILD_ILLUSTRATION_KINDS) {
      fixture.componentRef.setInput('kind', kind);
      await fixture.whenStable();

      const svgs = host.querySelectorAll('svg');
      expect(svgs, kind).toHaveLength(1);
      expect(svgs[0].getAttribute('viewBox'), kind).toBe('0 0 368 168');
      expect(svgs[0].querySelector('text'), kind).toBeNull();
      expect(svgs[0].querySelectorAll('rect, circle, path').length, kind).toBeGreaterThan(5);
      expect(host.getAttribute('aria-hidden')).toBe('true');
      expect(host.getAttribute('data-kind')).toBe(kind);
    }
  });

  it('exposes a guard for ids coming from the dictionary', () => {
    expect(isWhatWeBuildIllustrationKind('saas')).toBe(true);
    expect(isWhatWeBuildIllustrationKind('internal-tools')).toBe(true);
    expect(isWhatWeBuildIllustrationKind('dashboard')).toBe(false);
  });
});
