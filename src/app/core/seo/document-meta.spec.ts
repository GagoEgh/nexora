import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { isDocumentMetaPage, provideDocumentMeta } from './document-meta';
import { SITE_ORIGIN } from './site-origin';

describe('provideDocumentMeta', () => {
  const metaContent = (selector: string) =>
    document.head.querySelector<HTMLMetaElement>(`meta[${selector}]`)?.content;
  const settle = () => TestBed.inject(ApplicationRef).whenStable();
  const origin = () => TestBed.inject(SITE_ORIGIN);
  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);
  const robots = () => document.head.querySelector('meta[name="robots"]');
  const graph = (): Record<string, unknown>[] => {
    const blocks = document.head.querySelectorAll('script[type="application/ld+json"]');
    expect(blocks).toHaveLength(1);
    return JSON.parse(blocks[0].textContent ?? '')['@graph'];
  };
  const node = (type: string) =>
    graph().find((entry) => entry['@type'] === type) as Record<string, unknown> | undefined;

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
    expect(metaContent('property="og:url"')).toBe(`${origin()}/services`);
  });

  it('publishes the canonical URL and one hreflang alternate per locale', async () => {
    const href = (selector: string) =>
      document.head.querySelector<HTMLLinkElement>(`link[${selector}]`)?.getAttribute('href');
    await TestBed.inject(Router).navigateByUrl('/hy/services');
    await settle();

    expect(href('rel="canonical"')).toBe(`${origin()}/hy/services`);
    expect(href('rel="alternate"][hreflang="en"')).toBe(`${origin()}/services`);
    expect(href('rel="alternate"][hreflang="hy"')).toBe(`${origin()}/hy/services`);
    expect(href('rel="alternate"][hreflang="ru"')).toBe(`${origin()}/ru/services`);
    expect(href('rel="alternate"][hreflang="x-default"')).toBe(`${origin()}/services`);
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

  it('writes the Twitter card tags rather than leaning on the Open Graph fallback', async () => {
    await TestBed.inject(Router).navigateByUrl('/about');
    await settle();

    expect(metaContent('name="twitter:title"')).toBe('About | Nexora');
    expect(metaContent('name="twitter:description"')).toBe(metaContent('name="description"'));
    expect(metaContent('name="twitter:image"')).toBe(metaContent('property="og:image"'));
    expect(metaContent('name="twitter:image:alt"')).toBe('Nexora');
  });

  it('asks for noindex only on the 404, and clears it on the way out', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/about');
    await settle();
    expect(robots()).toBeNull();

    await router.navigateByUrl('/no-such-page');
    await settle();
    expect(robots()?.getAttribute('content')).toBe('noindex, follow');

    await router.navigateByUrl('/not-found');
    await settle();
    expect(robots()?.getAttribute('content')).toBe('noindex, follow');
    await router.navigateByUrl('/contact');
    await settle();
    expect(robots()).toBeNull();
  });

  it('publishes one JSON-LD graph whose nodes reference each other by @id', async () => {
    await TestBed.inject(Router).navigateByUrl('/about');
    await settle();

    expect(graph().map((entry) => entry['@type'])).toEqual([
      'Organization',
      'WebSite',
      'WebPage',
      'BreadcrumbList',
    ]);

    const organization = node('Organization');
    expect(organization?.['@id']).toBe(`${origin()}/#organization`);
    expect(organization?.['logo']).toBe(`${origin()}/brand/logo.png`);
    expect(organization?.['email']).toBe('info@nexoratechnology.org');
    expect(organization?.['contactPoint']).toEqual({
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'info@nexoratechnology.org',
      availableLanguage: ['en', 'hy', 'ru'],
    });

    expect(node('WebSite')?.['publisher']).toEqual({ '@id': `${origin()}/#organization` });

    const page = node('WebPage');
    expect(page?.['@id']).toBe(`${origin()}/about#webpage`);
    expect(page?.['url']).toBe(`${origin()}/about`);
    expect(page?.['name']).toBe('About | Nexora');
    expect(page?.['isPartOf']).toEqual({ '@id': `${origin()}/#website` });
    expect(page?.['about']).toEqual({ '@id': `${origin()}/#organization` });
    expect(page?.['breadcrumb']).toEqual({ '@id': `${origin()}/about#breadcrumb` });
    expect(node('BreadcrumbList')?.['@id']).toBe(`${origin()}/about#breadcrumb`);
  });

  it('drops the breadcrumb reference on the home page, which has no trail', async () => {
    await TestBed.inject(Router).navigateByUrl('/');
    await settle();

    expect(graph().map((entry) => entry['@type'])).toEqual(['Organization', 'WebSite', 'WebPage']);
    expect(node('WebPage')?.['breadcrumb']).toBeUndefined();
    expect(node('WebPage')?.['url']).toBe(`${origin()}/`);
  });

  it('declares the active locale on the site and page nodes', async () => {
    await TestBed.inject(Router).navigateByUrl('/ru/about');
    await settle();

    expect(node('WebSite')?.['inLanguage']).toBe('ru');
    expect(node('WebPage')?.['inLanguage']).toBe('ru');
    expect(node('WebPage')?.['url']).toBe(`${origin()}/ru/about`);
  });

  it('describes every route and rejects unknown page names', () => {
    for (const route of routes.filter((r) => r.loadComponent)) {
      expect(isDocumentMetaPage(route.data?.['meta']), route.path).toBe(true);
    }
    expect(isDocumentMetaPage('dashboard')).toBe(false);
    expect(isDocumentMetaPage(undefined)).toBe(false);
  });
});
