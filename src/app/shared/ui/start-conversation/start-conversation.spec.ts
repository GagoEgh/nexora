import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../../app.routes';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { StartConversation } from './start-conversation';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M5 12H19" stroke="currentColor"/></svg>';

const STEPS = ['Share your context', 'Discovery conversation', 'Proposed approach'];

describe('StartConversation', () => {
  let fixture: ComponentFixture<StartConversation>;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);
  const steps = () => Array.from(root.querySelectorAll('ol.start-conversation__steps > li'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartConversation],
      providers: [
        provideRouter(routes),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(StartConversation);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    TestBed.inject(HttpTestingController)
      .match(() => true)
      .forEach((req) => req.flush(ICON_SVG));
    await fixture.whenStable();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders the eyebrow, a single h2 and the lead copy', () => {
    expect(root.querySelector('.start-conversation__eyebrow')?.textContent?.trim()).toBe(
      'Start a conversation',
    );
    const headings = root.querySelectorAll('h2');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe(
      'Have a Complex Technical Challenge? Let’s Solve It Together.',
    );
    expect(root.querySelector('.start-conversation__lead')?.textContent?.trim()).toBe(
      'Tell us what you’re building, modernizing or automating. We’ll review the context and ' +
        'propose a practical next step — usually a short discovery conversation.',
    );
  });

  it('renders the three steps as an ordered list with decorative numerals', () => {
    expect(root.querySelector('ol.start-conversation__steps')).not.toBeNull();
    expect(steps()).toHaveLength(3);
    expect(steps().map((s) => s.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      '1 Share your context',
      '2 Discovery conversation',
      '3 Proposed approach',
    ]);
    const markers = steps().map((s) => s.querySelector('.start-conversation__marker'));
    expect(markers.map((m) => m?.textContent?.trim())).toEqual(['1', '2', '3']);
    expect(markers.map((m) => m?.getAttribute('aria-hidden'))).toEqual(Array(3).fill('true'));
  });

  it('exposes exactly two links, to contact and partnerships', () => {
    const links = Array.from(root.querySelectorAll('a'));
    expect(links).toHaveLength(2);

    const [primary, secondary] = links;
    expect(primary.getAttribute('href')).toBe('/contact');
    expect(primary.textContent?.trim()).toBe('Discuss Your Project');
    expect(primary.classList.contains('mat-mdc-unelevated-button')).toBe(true);
    expect(primary.querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe('true');

    expect(secondary.getAttribute('href')).toBe('/partnerships');
    expect(secondary.textContent?.trim()).toBe('Become a Partner');
    expect(secondary.classList.contains('mat-mdc-outlined-button')).toBe(true);

    expect(root.querySelectorAll('button')).toHaveLength(0);
  });

  it('renders supplied copy instead of its own, and drops the steps when none are given', async () => {
    fixture.componentRef.setInput('copy', {
      eyebrow: 'Start a conversation',
      title: 'Need several services in one project?',
      lead: 'Most projects combine disciplines.',
      primary: { label: 'Discuss Your Project', path: '/contact' },
      secondary: { label: 'Explore Our Services', path: '/services/ai_agent' },
    });
    await fixture.whenStable();

    expect(root.querySelector('.start-conversation__title')?.textContent?.trim()).toBe(
      'Need several services in one project?',
    );
    expect(root.querySelector('.start-conversation__lead')?.textContent?.trim()).toBe(
      'Most projects combine disciplines.',
    );
    // Omitted steps must remove the list element, not render an empty one.
    expect(root.querySelector('ol.start-conversation__steps')).toBeNull();
    expect(steps()).toHaveLength(0);

    const links = Array.from(root.querySelectorAll('a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/contact', '/services/ai_agent']);
    expect(links.map((a) => a.textContent?.trim())).toEqual([
      'Discuss Your Project',
      'Explore Our Services',
    ]);
    // The structure itself is untouched, so the artwork still renders.
    expect(root.querySelector('.start-conversation__ring')).not.toBeNull();
  });

  it('keeps its own steps when supplied copy includes them', async () => {
    fixture.componentRef.setInput('copy', {
      eyebrow: 'E',
      title: 'T',
      lead: 'L',
      steps: ['One', 'Two'],
      primary: { label: 'P', path: '/contact' },
      secondary: { label: 'S', path: '/partnerships' },
    });
    await fixture.whenStable();

    expect(steps().map((li) => li.textContent?.trim())).toEqual(['1 One', '2 Two']);
  });

  it('defaults to the wide variant and exposes the compact one as a host attribute', async () => {
    // The variant only switches two custom properties, so the attribute is the contract.
    expect(root.getAttribute('data-variant')).toBe('wide');

    fixture.componentRef.setInput('variant', 'compact');
    await fixture.whenStable();
    expect(root.getAttribute('data-variant')).toBe('compact');
  });

  it('hides the brand-mark artwork from assistive technology', () => {
    const art = root.querySelector('.start-conversation__art');
    expect(art?.getAttribute('aria-hidden')).toBe('true');
    const mark = art?.querySelector('img.start-conversation__mark');
    expect(mark?.getAttribute('src')).toBe('brand/mark.svg');
    expect(mark?.getAttribute('alt')).toBe('');
    expect(art?.querySelectorAll('a, button')).toHaveLength(0);
  });

  it('re-renders in another locale and keeps the locale prefix on both links', async () => {
    setLocale('hy');
    await fixture.whenStable();
    expect(root.querySelector('h2')?.textContent?.trim()).toBe(
      'Ունե՞ք բարդ տեխնիկական մարտահրավեր։ Լուծենք այն միասին։',
    );
    expect(Array.from(root.querySelectorAll('a')).map((a) => a.getAttribute('href'))).toEqual([
      '/hy/contact',
      '/hy/partnerships',
    ]);

    setLocale('ru');
    await fixture.whenStable();
    expect(root.querySelector('.start-conversation__eyebrow')?.textContent?.trim()).toBe(
      'Начнём разговор',
    );
    expect(steps().map((s) => s.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      '1 Поделитесь контекстом',
      '2 Ознакомительный разговор',
      '3 Предлагаемый подход',
    ]);
    expect(root.querySelectorAll('a')[1].getAttribute('href')).toBe('/ru/partnerships');
  });

  it('keeps the English step labels in order', () => {
    expect(
      steps().map((s) => s.textContent?.replace(/\s+/g, ' ').replace(/^\d\s/, '').trim()),
    ).toEqual(STEPS);
  });
});
