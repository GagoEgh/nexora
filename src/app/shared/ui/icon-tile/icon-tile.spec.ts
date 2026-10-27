import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { IconTile, type IconTileSize, type IconTileTone } from './icon-tile';

const CODE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M16 18L22 12L16 6" stroke="#0B1324"/><path d="M8 6L2 12L8 18" stroke="#0B1324"/></svg>';

@Component({
  imports: [IconTile],
  template: `<app-icon-tile icon="code" [tone]="tone()" [size]="size()" />`,
})
class Host {
  readonly tone = signal<IconTileTone>('primary');
  readonly size = signal<IconTileSize>('medium');
}

describe('IconTile', () => {
  let fixture: ComponentFixture<Host>;
  let http: HttpTestingController;
  let tile: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideAppIcons()],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne('icons/code.svg').flush(CODE_SVG);
    await fixture.whenStable();
    tile = (fixture.nativeElement as HTMLElement).querySelector('app-icon-tile') as HTMLElement;
  });

  afterEach(() => http.verify());

  it('renders the catalogue icon through the registry', () => {
    // The beforeEach already proved the resolution: the only request was icons/code.svg.
    expect(tile.querySelector('mat-icon')).not.toBeNull();
    expect(tile.querySelectorAll('mat-icon svg path')).toHaveLength(2);
  });

  it('is decorative: hidden from assistive technology, no role, no label', () => {
    expect(tile.getAttribute('aria-hidden')).toBe('true');
    expect(tile.getAttribute('role')).toBeNull();
    expect(tile.getAttribute('aria-label')).toBeNull();
    expect(tile.querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe('true');
    expect(tile.textContent?.trim()).toBe('');
  });

  it('reflects every tone for the stylesheet', async () => {
    for (const tone of [
      'primary',
      'secondary',
      'error',
      'neutral',
      'inverse',
      'inverse-accent',
      'inverse-container',
      'filled',
    ] as const) {
      fixture.componentInstance.tone.set(tone);
      await fixture.whenStable();
      expect(tile.getAttribute('data-tone')).toBe(tone);
    }
  });

  it('defaults to the medium size and reflects every narrower size', async () => {
    expect(tile.getAttribute('data-size')).toBe('medium');
    for (const size of ['compact', 'dense', 'small'] as const) {
      fixture.componentInstance.size.set(size);
      await fixture.whenStable();
      expect(tile.getAttribute('data-size')).toBe(size);
    }
  });
});
