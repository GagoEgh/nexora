import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { isDocumentMetaPage, provideDocumentMeta } from './document-meta';

describe('provideDocumentMeta', () => {
  const metaContent = (selector: string) =>
    document.head.querySelector<HTMLMetaElement>(`meta[${selector}]`)?.content;
  const settle = () => TestBed.inject(ApplicationRef).whenStable();
  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideIntlayer(), provideDocumentMeta()],
    }).compileComponents();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('writes the title, description and Open Graph tags of the active route', async () => {
    await TestBed.inject(Router).navigateByUrl('/services');
    await settle();

    expect(document.title).toBe('Services | Nexora');
    expect(metaContent('name="description"')).toContain('Software and web development');
    expect(metaContent('property="og:title"')).toBe('Services | Nexora');
    expect(metaContent('property="og:description"')).toContain('Software and web development');
    expect(metaContent('property="og:locale"')).toBe('en_US');
    expect(metaContent('property="og:url"')).toBe(`${location.origin}/services`);
  });

  it('publishes the canonical URL and one hreflang alternate per locale', async () => {
    const href = (selector: string) =>
      document.head.querySelector<HTMLLinkElement>(`link[${selector}]`)?.getAttribute('href');
    await TestBed.inject(Router).navigateByUrl('/hy/services');
    await settle();

    expect(href('rel="canonical"')).toBe(`${location.origin}/hy/services`);
    expect(href('rel="alternate"][hreflang="en"')).toBe(`${location.origin}/services`);
    expect(href('rel="alternate"][hreflang="hy"')).toBe(`${location.origin}/hy/services`);
    expect(href('rel="alternate"][hreflang="ru"')).toBe(`${location.origin}/ru/services`);
    expect(href('rel="alternate"][hreflang="x-default"')).toBe(`${location.origin}/services`);
    expect(document.title).toBe('Ծառայություններ | Nexora');
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });

  it('follows navigation and the active locale', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/about');
    await settle();
    expect(document.title).toBe('About | Nexora');

    setLocale('ru');
    await settle();
    expect(document.title).toBe('О нас | Nexora');
    expect(metaContent('property="og:locale"')).toBe('ru_RU');

    await router.navigateByUrl('/contact');
    await settle();
    expect(document.title).toBe('Контакты | Nexora');
    expect(metaContent('name="description"')).toContain('Nexora');
  });

  it('describes every route and rejects unknown page names', () => {
    for (const route of routes.filter((r) => r.loadComponent)) {
      expect(isDocumentMetaPage(route.data?.['meta']), route.path).toBe(true);
    }
    expect(isDocumentMetaPage('dashboard')).toBe(false);
    expect(isDocumentMetaPage(undefined)).toBe(false);
  });
});
