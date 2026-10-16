import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { APP_ICON_NAMES, appIcon, isAppIconName } from './icons';
import { provideAppIcons } from './provide-app-icons';

const ARROW_RIGHT_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M5 12H19" stroke="#0B1324"/><path d="M12 5L19 12L12 19" stroke="#0B1324"/></svg>';

@Component({
  imports: [MatIcon],
  template: `<mat-icon [svgIcon]="icon" />`,
})
class Host {
  icon = appIcon('arrow-right');
}

describe('provideAppIcons', () => {
  let http: HttpTestingController;
  let registry: MatIconRegistry;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideAppIcons()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    registry = TestBed.inject(MatIconRegistry);
  });

  afterEach(() => http.verify());

  it('resolves every catalogued name to its file under icons/', async () => {
    for (const name of APP_ICON_NAMES) {
      const pending = firstValueFrom(registry.getNamedSvgIcon(name, 'app'));
      http.expectOne(`icons/${name}.svg`).flush(ARROW_RIGHT_SVG);
      expect((await pending).tagName.toLowerCase()).toBe('svg');
    }
  });

  it('does not resolve unknown names or other namespaces', async () => {
    await expect(firstValueFrom(registry.getNamedSvgIcon('does-not-exist', 'app'))).rejects.toThrow(
      /Unable to find icon/,
    );
    await expect(firstValueFrom(registry.getNamedSvgIcon('arrow-right', 'other'))).rejects.toThrow(
      /Unable to find icon/,
    );
    http.expectNone(() => true);
  });

  it('inlines the SVG into <mat-icon> and keeps it decorative by default', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    http.expectOne('icons/arrow-right.svg').flush(ARROW_RIGHT_SVG);
    await fixture.whenStable();

    const icon = (fixture.nativeElement as HTMLElement).querySelector('mat-icon');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.querySelectorAll('svg path')).toHaveLength(2);
  });

  it('exposes a type-safe name helper', () => {
    expect(appIcon('check')).toBe('app:check');
    expect(isAppIconName('check')).toBe(true);
    expect(isAppIconName('nope')).toBe(false);
  });
});
