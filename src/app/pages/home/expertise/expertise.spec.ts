import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../../app.routes';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { Expertise } from './expertise';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M5 12H19" stroke="#0B1324"/></svg>';

const TITLES = [
  'Software & Web Development',
  'Mobile Applications',
  'AI Engineering & Automation',
  'UI/UX Design',
  'Cloud Infrastructure & DevOps',
  'Dedicated Engineering Teams',
];

describe('Expertise', () => {
  let fixture: ComponentFixture<Expertise>;
  let root: HTMLElement;
  let http: HttpTestingController;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Expertise],
      providers: [
        provideRouter(routes),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Expertise);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    http.match(() => true).forEach((req) => req.flush(ICON_SVG));
    await fixture.whenStable();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders the section header with one h2, the intro and the Material "view all" link', () => {
    expect(root.querySelector('.expertise__eyebrow')?.textContent?.trim()).toBe('What we do');
    const headings = root.querySelectorAll('h2');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe('End-to-end engineering, under one roof.');
    expect(root.querySelector('.expertise__text')?.textContent?.trim()).toContain(
      'Six capability areas',
    );

    const all = root.querySelector<HTMLAnchorElement>('a.expertise__all');
    expect(all?.getAttribute('href')).toBe('/services');
    expect(all?.textContent?.trim()).toBe('View all 15 services');
    expect(all?.classList.contains('mat-mdc-button')).toBe(true);
    expect(all?.querySelector('mat-icon')).not.toBeNull();
  });

  it('renders six service cards with tiles, titles, descriptions and links to the services page', () => {
    const cards = Array.from(root.querySelectorAll('.expertise__card'));
    expect(cards).toHaveLength(6);
    expect(cards.map((c) => c.querySelector('h3')?.textContent?.trim())).toEqual(TITLES);

    const tiles = cards.map((c) => c.querySelector('app-icon-tile'));
    expect(tiles.map((t) => t?.getAttribute('data-tone'))).toEqual(Array(6).fill('primary'));
    expect(tiles.map((t) => t?.getAttribute('data-size'))).toEqual(Array(6).fill('medium'));
    expect(tiles.map((t) => t?.querySelector('svg')).filter(Boolean)).toHaveLength(6);

    for (const card of cards) {
      expect(card.querySelector('.expertise__card-text')?.textContent?.trim().length).toBeGreaterThan(40);
      const link = card.querySelector<HTMLAnchorElement>('a.expertise__link');
      expect(link?.getAttribute('href')).toBe('/services');
      expect(link?.textContent?.trim()).toBe('Explore service');
      expect(link?.querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('re-renders in another locale', async () => {
    setLocale('hy');
    await fixture.whenStable();
    expect(root.querySelector('h2')?.textContent?.trim()).toBe('Ամբողջական ինժեներիա՝ մեկ հարկի տակ։');
    expect(root.querySelector('.expertise__card h3')?.textContent?.trim()).toBe('Ծրագրային և վեբ մշակում');
    expect(root.querySelector('a.expertise__link')?.textContent?.trim()).toBe('Ծանոթանալ ծառայությանը');
  });
});
