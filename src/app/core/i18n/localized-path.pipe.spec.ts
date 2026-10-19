import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterLink, provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { LocalizedPathPipe } from './localized-path.pipe';

@Component({
  imports: [RouterLink, LocalizedPathPipe],
  template: `<a [routerLink]="'/services' | localizedPath">Services</a>`,
})
class Host {}

describe('LocalizedPathPipe', () => {
  let fixture: ComponentFixture<Host>;
  const href = () =>
    (fixture.nativeElement as HTMLElement).querySelector('a')?.getAttribute('href');
  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideRouter([]), provideIntlayer()],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('leaves the default locale unprefixed and prefixes the others, following locale changes', async () => {
    expect(href()).toBe('/services');

    setLocale('hy');
    await fixture.whenStable();
    expect(href()).toBe('/hy/services');

    setLocale('en');
    await fixture.whenStable();
    expect(href()).toBe('/services');
  });
});
