import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../../app.routes';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { EngagementModels } from './engagement-models';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M5 12H19" stroke="currentColor"/></svg>';

const TITLES = [
  'Project-Based Development',
  'Dedicated Development Teams',
  'Long-Term Technical Partnership',
  'White-Label Development',
  'Maintenance & Technical Support',
];

const DESCRIPTIONS = [
  'Scoped projects with agreed requirements and deliverables.',
  'Senior specialists integrated into your project or assigned to agreed work.',
  'Ongoing product evolution and technical collaboration.',
  'Engineering execution for agencies and partners under agreed branding.',
  'Continuous support, improvements and agreed technical responsibilities.',
];

const BEST_FOR = [
  'A defined product, feature or modernization.',
  'Extending your team with senior capacity.',
  'Products that keep evolving over years.',
  'Agencies delivering technical work to clients.',
  'Live systems that need steady care.',
];

describe('EngagementModels', () => {
  let fixture: ComponentFixture<EngagementModels>;
  let root: HTMLElement;
  let http: HttpTestingController;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);
  const cards = () => Array.from(root.querySelectorAll('.engagement-models__list > li'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EngagementModels],
      providers: [
        provideRouter(routes),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(EngagementModels);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    http.match(() => true).forEach((req) => req.flush(ICON_SVG));
    await fixture.whenStable();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders the section header with one h2, the intro and five cards', () => {
    expect(root.querySelector('.engagement-models__eyebrow')?.textContent?.trim()).toBe(
      'Engagement models',
    );
    const headings = root.querySelectorAll('h2');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe('Collaboration that fits your situation.');
    expect(root.querySelector('.engagement-models__text')?.textContent?.trim()).toBe(
      'Choose how we work together. Scope, terms and responsibilities are agreed individually for every engagement.',
    );
    expect(root.querySelector('ul.engagement-models__list')).not.toBeNull();
    expect(cards()).toHaveLength(5);
  });

  it('renders the titles, descriptions and "best for" values in order', () => {
    expect(cards().map((c) => c.querySelector('h3')?.textContent?.trim())).toEqual(TITLES);
    expect(
      cards().map((c) => c.querySelector('.engagement-models__description')?.textContent?.trim()),
    ).toEqual(DESCRIPTIONS);
    expect(
      cards().map((c) => c.querySelector('.engagement-models__value')?.textContent?.trim()),
    ).toEqual(BEST_FOR);
    expect(
      cards().map((c) => c.querySelector('.engagement-models__label')?.textContent?.trim()),
    ).toEqual(Array(5).fill('Best for'));
  });

  it('renders a decorative catalogue icon tile on every card', () => {
    const tiles = cards().map((c) => c.querySelector('app-icon-tile'));
    expect(tiles.map((t) => t?.getAttribute('data-tone'))).toEqual(Array(5).fill('primary'));
    expect(tiles.map((t) => t?.getAttribute('data-size'))).toEqual(Array(5).fill('medium'));
    expect(tiles.map((t) => t?.getAttribute('aria-hidden'))).toEqual(Array(5).fill('true'));
    expect(tiles.map((t) => t?.querySelector('svg')).filter(Boolean)).toHaveLength(5);
  });

  it('exposes exactly one link, to the about page, and no interactive cards', () => {
    const links = root.querySelectorAll('a');
    expect(links).toHaveLength(1);
    const compare = links[0];
    expect(compare.getAttribute('href')).toBe('/about');
    expect(compare.textContent?.trim()).toBe('Compare engagement models');
    expect(compare.classList.contains('mat-mdc-button')).toBe(true);
    expect(compare.querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe('true');

    expect(root.querySelectorAll('button')).toHaveLength(0);
    for (const card of cards()) {
      expect(card.getAttribute('role')).toBeNull();
      expect(card.getAttribute('tabindex')).toBeNull();
      expect(card.querySelectorAll('a, button')).toHaveLength(0);
    }
  });

  it('re-renders in another locale', async () => {
    setLocale('hy');
    await fixture.whenStable();
    expect(root.querySelector('h2')?.textContent?.trim()).toBe(
      'Համագործակցության ձևաչափեր՝ ձեր կարիքներին համապատասխան։',
    );
    expect(root.querySelector('.engagement-models__card-title')?.textContent?.trim()).toBe(
      'Նախագծային մշակում',
    );
    expect(root.querySelector('.engagement-models__label')?.textContent?.trim()).toBe('Հարմար է');
    expect(root.querySelector('a')?.getAttribute('href')).toBe('/hy/about');

    setLocale('ru');
    await fixture.whenStable();
    expect(root.querySelector('h2')?.textContent?.trim()).toBe(
      'Форматы сотрудничества под ваши задачи.',
    );
    expect(root.querySelector('.engagement-models__value')?.textContent?.trim()).toBe(
      'Разработка конкретного продукта или функциональности, а также модернизация существующей системы.',
    );
  });
});
