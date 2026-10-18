import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../../app.routes';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { Hero } from './hero';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M5 12H19" stroke="#0B1324"/></svg>';

describe('Hero', () => {
  let fixture: ComponentFixture<Hero>;
  let root: HTMLElement;
  let http: HttpTestingController;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);
  const flushIcons = () => http.match(() => true).forEach((req) => req.flush(ICON_SVG));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hero],
      providers: [
        provideRouter(routes),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Hero);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    flushIcons();
    await fixture.whenStable();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders the eyebrow, the headline as the single h1 and the lead paragraph', () => {
    expect(root.querySelector('.hero__eyebrow-text--full')?.textContent?.trim()).toBe(
      'Technology development & AI solutions partner',
    );
    expect(root.querySelector('.hero__eyebrow-text--short')?.textContent?.trim()).toBe(
      'Technology & AI solutions partner',
    );
    const headings = root.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe(
      'Engineering Digital Solutions That Move Business Forward.',
    );
    expect(root.querySelector('.hero__lead')?.textContent?.trim()).toContain(
      'Nexora brings together Senior and Senior+ engineering expertise',
    );
  });

  it('offers the two calls to action as Material buttons routed to contact and services', () => {
    const actions = Array.from(root.querySelectorAll<HTMLAnchorElement>('.hero__actions a'));
    expect(actions.map((a) => a.getAttribute('href'))).toEqual(['/contact', '/services']);
    expect(actions[0].textContent?.trim()).toBe('Discuss Your Project');
    expect(actions[0].classList.contains('mat-mdc-unelevated-button')).toBe(true);
    expect(actions[0].querySelector('mat-icon')).not.toBeNull();
    expect(actions[1].textContent?.trim()).toBe('Explore Our Services');
    expect(actions[1].classList.contains('mat-mdc-outlined-button')).toBe(true);
  });

  it('lists the three trust points with decorative check icons', () => {
    const items = Array.from(root.querySelectorAll('.hero__trust-item'));
    expect(items.map((li) => li.textContent?.trim())).toEqual([
      'Senior & Senior+ engineers only',
      'End-to-end delivery',
      'Armenia & international',
    ]);
    for (const li of items) {
      expect(li.querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('embeds the decorative illustration and re-renders in another locale', async () => {
    expect(root.querySelector('app-hero-illustration')?.getAttribute('aria-hidden')).toBe('true');

    setLocale('ru');
    await fixture.whenStable();
    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      'Создаём цифровые решения, которые двигают бизнес вперёд.',
    );
    expect(root.querySelector('.hero__actions a')?.textContent?.trim()).toBe('Обсудить ваш проект');
  });
});
