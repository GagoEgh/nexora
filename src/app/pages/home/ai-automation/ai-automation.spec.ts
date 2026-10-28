import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../../app.routes';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { AiAutomation } from './ai-automation';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M5 12H19" stroke="currentColor"/></svg>';

const TITLES = [
  'Intelligent assistants',
  'RAG & knowledge retrieval',
  'Document processing',
  'Workflow automation',
  'CRM integrations',
  'Multi-step AI agents',
];

const ICONS = ['message-square', 'search', 'file-text', 'workflow', 'plug', 'bot'];

describe('AiAutomation', () => {
  let fixture: ComponentFixture<AiAutomation>;
  let root: HTMLElement;
  let http: HttpTestingController;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiAutomation],
      providers: [
        provideRouter(routes),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AiAutomation);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    http.match(() => true).forEach((req) => req.flush(ICON_SVG));
    await fixture.whenStable();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders the copy column with one h2, the lead and the two calls to action', () => {
    expect(root.querySelector('.ai__eyebrow')?.textContent?.trim()).toBe('AI & automation');
    const headings = root.querySelectorAll('h2');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe(
      'Practical AI, engineered into how you already work.',
    );
    expect(root.querySelector('.ai__lead')?.textContent?.trim()).toContain(
      'We treat AI as an engineering discipline',
    );

    const actions = Array.from(root.querySelectorAll<HTMLAnchorElement>('.ai__actions a'));
    expect(actions.map((a) => a.getAttribute('href'))).toEqual(['/services', '/contact']);
    expect(actions[0].textContent?.trim()).toBe('Explore AI Services');
    expect(actions[0].classList.contains('mat-mdc-unelevated-button')).toBe(true);
    expect(actions[0].querySelector('mat-icon')).not.toBeNull();
    expect(actions[1].textContent?.trim()).toBe('Discuss a use case');
    expect(actions[1].classList.contains('mat-mdc-button')).toBe(true);
  });

  it('renders six static capability cards with filled compact tiles', () => {
    const cards = Array.from(root.querySelectorAll('.ai__card'));
    expect(cards).toHaveLength(6);
    expect(cards.map((c) => c.querySelector('h3')?.textContent?.trim())).toEqual(TITLES);

    const tiles = cards.map((c) => c.querySelector('app-icon-tile'));
    expect(tiles.map((t) => t?.getAttribute('data-tone'))).toEqual(Array(6).fill('filled'));
    expect(tiles.map((t) => t?.getAttribute('data-size'))).toEqual(Array(6).fill('compact'));
    expect(tiles.map((t) => t?.getAttribute('aria-hidden'))).toEqual(Array(6).fill('true'));
    expect(
      tiles.map((t) => t?.querySelector('mat-icon')?.getAttribute('data-mat-icon-name')),
    ).toEqual(ICONS);
    for (const card of cards) {
      expect(card.querySelector('.ai__card-text')?.textContent?.trim().length).toBeGreaterThan(40);
      expect(card.querySelector('a, button')).toBeNull();
    }
  });

  it('renders the five-step pipeline with the review step highlighted and the footnote', () => {
    const steps = Array.from(root.querySelectorAll('.ai__pipeline .ai__step'));
    expect(steps.map((s) => s.querySelector('.ai__step-label')?.textContent?.trim())).toEqual([
      'input',
      'retrieve',
      'reason',
      'act',
      'human review',
    ]);
    expect(steps.map((s) => s.classList.contains('ai__step--review'))).toEqual([
      false,
      false,
      false,
      false,
      true,
    ]);
    expect(steps.map((s) => s.querySelector('mat-icon') !== null)).toEqual([
      true,
      true,
      true,
      true,
      false,
    ]);
    expect(root.querySelector('.ai__pipeline')?.getAttribute('aria-label')).toBe(
      'How an AI workflow runs',
    );
    expect(root.querySelector('.ai__note')?.textContent?.trim()).toBe(
      'Designed to be observable and testable, with human review where decisions matter.',
    );
  });

  it('re-renders in another locale', async () => {
    setLocale('ru');
    await fixture.whenStable();
    expect(root.querySelector('h2')?.textContent?.trim()).toBe(
      'Практические AI-решения, интегрированные в ваши рабочие процессы.',
    );
    expect(root.querySelector('.ai__card h3')?.textContent?.trim()).toBe(
      'Интеллектуальные AI-ассистенты',
    );
    expect(root.querySelector('.ai__actions a')?.textContent?.trim()).toBe('Наши AI-услуги');
  });
});
