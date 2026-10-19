import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { localeFromLocation } from './locale-routing';

describe('locale routing', () => {
  const i18n = () => TestBed.runInInjectionContext(() => useLocale());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideIntlayer()],
    }).compileComponents();
  });

  afterEach(() => {
    i18n().setLocale('en');
  });

  it('serves English at the bare paths and the other locales under their prefix', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/services');
    expect(router.url).toBe('/services');
    expect(i18n().locale()).toBe('en');

    await router.navigateByUrl('/hy/services');
    expect(router.url).toBe('/hy/services');
    expect(i18n().locale()).toBe('hy');

    await router.navigateByUrl('/ru');
    expect(router.url).toBe('/ru');
    expect(i18n().locale()).toBe('ru');

    await router.navigateByUrl('/about');
    expect(router.url).toBe('/about');
    expect(i18n().locale()).toBe('en');
  });

  it('redirects unknown paths to the root of their locale', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/hy/does-not-exist');
    expect(router.url).toBe('/hy');
    expect(i18n().locale()).toBe('hy');

    await router.navigateByUrl('/does-not-exist');
    expect(router.url).toBe('/');
    expect(i18n().locale()).toBe('en');
  });

  it('honours the remembered locale on the first bare entry only', async () => {
    i18n().setLocale('ru');
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/services');
    expect(router.url).toBe('/ru/services');
    expect(i18n().locale()).toBe('ru');

    await router.navigateByUrl('/services');
    expect(router.url).toBe('/services');
    expect(i18n().locale()).toBe('en');
  });

  it('derives the start-up locale from the entry URL prefix', () => {
    expect(localeFromLocation('/hy/services')).toBe('hy');
    expect(localeFromLocation('/ru')).toBe('ru');
    expect(localeFromLocation('/services')).toBeUndefined();
    expect(localeFromLocation('/')).toBeUndefined();
  });
});
