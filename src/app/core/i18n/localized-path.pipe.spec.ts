import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterLink, provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { LocalizedPathPipe } from './localized-path.pipe';

/**
 * The pipe is pure, so the host reads the locale signal itself and passes it in. That read is
 * what ties the binding to the locale: the first test changes the locale and expects the href
 * to follow, which is the behaviour a forgotten argument would lose.
 */
@Component({
  imports: [RouterLink, LocalizedPathPipe],
  template: `<a [routerLink]="'/services' | localizedPath: locale()">Services</a>`,
})
class Host {
  protected readonly locale = useLocale().locale;
}

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

  /** Pure now, so it is also just a function of its two arguments. */
  it('prefixes every declared locale but the default one', () => {
    const pipe = new LocalizedPathPipe();

    expect(pipe.transform('/services', 'en')).toBe('/services');
    expect(pipe.transform('/services', 'hy')).toBe('/hy/services');
    expect(pipe.transform('/services', 'ru')).toBe('/ru/services');
    expect(pipe.transform('/', 'hy')).toBe('/hy');
  });
});
