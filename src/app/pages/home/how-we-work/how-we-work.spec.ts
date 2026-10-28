import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { HowWeWork } from './how-we-work';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M5 12H19" stroke="currentColor"/></svg>';

const TITLES = [
  'Discover & Understand',
  'Define the Solution',
  'Design & Architect',
  'Build & Integrate',
  'Deploy & Improve',
];

const OUTCOMES = [
  'Shared problem definition',
  'Scope & approach',
  'Designs & architecture',
  'Working software',
  'Live, supported system',
];

describe('HowWeWork', () => {
  let fixture: ComponentFixture<HowWeWork>;
  let root: HTMLElement;
  let http: HttpTestingController;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);
  const steps = () => Array.from(root.querySelectorAll('.how-we-work__steps > li'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HowWeWork],
      providers: [
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HowWeWork);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    http.match(() => true).forEach((req) => req.flush(ICON_SVG));
    await fixture.whenStable();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders the section header with one h2 and the intro', () => {
    expect(root.querySelector('.how-we-work__eyebrow')?.textContent?.trim()).toBe('How we work');
    const headings = root.querySelectorAll('h2');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe('A clear path from idea to production.');
    expect(root.querySelector('.how-we-work__intro')?.textContent?.trim()).toContain(
      'A representative engagement flow.',
    );
  });

  it('renders five ordered steps with two-digit markers, the first one emphasised', () => {
    expect(root.querySelector('ol.how-we-work__steps')).not.toBeNull();
    expect(steps()).toHaveLength(5);
    expect(
      steps().map((s) => s.querySelector('.how-we-work__marker')?.textContent?.trim()),
    ).toEqual(['01', '02', '03', '04', '05']);
    expect(steps().map((s) => s.classList.contains('how-we-work__step--first'))).toEqual([
      true,
      false,
      false,
      false,
      false,
    ]);
    expect(steps().map((s) => s.classList.contains('how-we-work__step--last'))).toEqual([
      false,
      false,
      false,
      false,
      true,
    ]);
    expect(steps().map((s) => s.querySelector('h3')?.textContent?.trim())).toEqual(TITLES);
    for (const step of steps()) {
      expect(
        step.querySelector('.how-we-work__step-text')?.textContent?.trim().length,
      ).toBeGreaterThan(40);
    }
  });

  it('renders a static outcome chip with a decorative arrow on every step', () => {
    const chips = steps().map((s) => s.querySelector('.how-we-work__outcome'));
    expect(chips.map((c) => c?.textContent?.trim())).toEqual(OUTCOMES);
    for (const chip of chips) {
      expect(chip?.querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe('true');
      expect(chip?.querySelector('mat-icon svg')).not.toBeNull();
    }
    expect(root.querySelectorAll('a, button')).toHaveLength(0);
  });

  it('re-renders in another locale', async () => {
    setLocale('hy');
    await fixture.whenStable();
    expect(root.querySelector('h2')?.textContent?.trim()).toBe(
      'Հստակ ճանապարհ՝ գաղափարից մինչև գործարկում։',
    );
    expect(root.querySelector('.how-we-work__step h3')?.textContent?.trim()).toBe(
      'Ուսումնասիրել և հասկանալ',
    );
  });
});
