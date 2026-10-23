import { OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { Router, provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { provideAppIcons } from '../../core/icons/provide-app-icons';
import { Header } from './header';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M4 6H20" stroke="#0B1324"/></svg>';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let root: HTMLElement;
  let http: HttpTestingController;
  let router: Router;

  const links = () => Array.from(root.querySelectorAll<HTMLAnchorElement>('nav a.header__link'));
  const flushIcons = () => http.match(() => true).forEach((req) => req.flush(ICON_SVG));
  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter(routes),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
        { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Header);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    flushIcons();
    await fixture.whenStable();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders the primary navigation in order with routes from the configuration', () => {
    expect(links().map((a) => a.getAttribute('href'))).toEqual([
      '/',
      '/services',
      '/solutions',
      '/about',
      '/partnerships',
      '/contact',
    ]);
    expect(links().map((a) => a.textContent?.trim())).toEqual([
      'Home',
      'Services',
      'Solutions',
      'About',
      'Partnerships',
      'Contact',
    ]);
    // The chevron sits beside Services as a menu trigger, not inside the label link.
    const chevron = root.querySelector<HTMLButtonElement>('button.header__chevron-trigger');
    expect(chevron?.querySelector('mat-icon.header__chevron')).not.toBeNull();
    expect(chevron?.getAttribute('aria-label')).toBe('Services menu');
    expect(chevron?.getAttribute('aria-haspopup')).toBe('menu');
    expect(links()[1].querySelector('mat-icon.header__chevron')).toBeNull();
    expect(root.querySelectorAll('button.header__chevron-trigger')).toHaveLength(1);
    expect(root.querySelector('a.header__cta')?.getAttribute('href')).toBe('/contact');
    expect(root.querySelector('a.header__cta')?.textContent?.trim()).toBe("Let's Talk");
  });

  it('marks only the current route as active', async () => {
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const active = () => links().filter((a) => a.classList.contains('header__link--active'));
    expect(active().map((a) => a.getAttribute('href'))).toEqual(['/']);
    expect(active()[0].getAttribute('aria-current')).toBe('page');

    await router.navigateByUrl('/services');
    await fixture.whenStable();
    expect(active().map((a) => a.getAttribute('href'))).toEqual(['/services']);
  });

  it('shows the current locale and re-renders labels when it changes', async () => {
    expect(root.querySelector('.header__lang-code')?.textContent?.trim()).toBe('EN');

    setLocale('hy');
    await fixture.whenStable();
    expect(root.querySelector('.header__lang-code')?.textContent?.trim()).toBe('HY');
    expect(links()[1].textContent?.trim()).toBe('Ծառայություններ');

    setLocale('ru');
    await fixture.whenStable();
    expect(links()[1].textContent?.trim()).toBe('Услуги');
  });

  it('opens the services menu from the chevron and routes to the AI agents page', async () => {
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const items = () => Array.from(overlay.querySelectorAll<HTMLAnchorElement>('a[mat-menu-item]'));

    // Closed until the chevron is used.
    expect(items()).toHaveLength(0);

    root.querySelector<HTMLButtonElement>('button.header__chevron-trigger')?.click();
    await fixture.whenStable();

    expect(items().map((a) => a.textContent?.trim())).toEqual(['AI Agents & Business Automation']);
    expect(items()[0].getAttribute('href')).toBe('/services/ai_agent');

    items()[0].click();
    await fixture.whenStable();
    expect(router.url).toBe('/services/ai_agent');
  });

  it('keeps the services menu item on the active locale prefix', async () => {
    setLocale('hy');
    await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();

    root.querySelector<HTMLButtonElement>('button.header__chevron-trigger')?.click();
    await fixture.whenStable();

    const item = overlay.querySelector<HTMLAnchorElement>('a[mat-menu-item]');
    expect(item?.getAttribute('href')).toBe('/hy/services/ai_agent');
  });

  it('switches the locale from the language menu and re-renders', async () => {
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const items = () =>
      Array.from(overlay.querySelectorAll<HTMLButtonElement>('button[mat-menu-item]'));

    root.querySelector<HTMLButtonElement>('button.header__lang')?.click();
    await fixture.whenStable();
    expect(items().map((b) => b.textContent?.trim())).toEqual(['English', 'Հայերեն', 'Русский']);
    expect(items().map((b) => b.getAttribute('lang'))).toEqual(['en', 'hy', 'ru']);
    expect(items().map((b) => b.getAttribute('aria-current'))).toEqual(['true', null, null]);

    items()[2].click();
    await fixture.whenStable();
    expect(router.url).toBe('/ru');
    expect(root.querySelector('.header__lang-code')?.textContent?.trim()).toBe('RU');
    expect(links()[1].textContent?.trim()).toBe('Услуги');
    expect(links().map((a) => a.getAttribute('href'))).toEqual([
      '/ru',
      '/ru/services',
      '/ru/solutions',
      '/ru/about',
      '/ru/partnerships',
      '/ru/contact',
    ]);
    expect(root.querySelector('a.header__cta')?.getAttribute('href')).toBe('/ru/contact');
    expect(root.querySelector('a.header__cta')?.textContent?.trim()).toBe('Давайте обсудим');
  });

  it('toggles the mobile menu with aria state and closes it on Escape', async () => {
    const button = root.querySelector<HTMLButtonElement>(
      'button.header__menu',
    ) as HTMLButtonElement;
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe('header-nav');
    expect(root.hasAttribute('data-open')).toBe(false);

    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(root.hasAttribute('data-open')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Close menu');

    const firstLink = links()[0];
    firstLink.focus();
    firstLink.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(root.hasAttribute('data-open')).toBe(false);
    expect(document.activeElement).toBe(button);
  });

  it('closes the mobile menu after any completed navigation', async () => {
    const button = root.querySelector<HTMLButtonElement>(
      'button.header__menu',
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    expect(root.hasAttribute('data-open')).toBe(true);

    await router.navigateByUrl('/about');
    await fixture.whenStable();
    expect(root.hasAttribute('data-open')).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
});
