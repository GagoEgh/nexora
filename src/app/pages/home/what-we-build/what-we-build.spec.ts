import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { WhatWeBuild } from './what-we-build';

const TITLES = [
  'SaaS Platforms',
  'CRM & ERP Systems',
  'Web Applications',
  'Mobile Applications',
  'AI Assistants & Agents',
  'Business Automation Platforms',
  'B2B Portals',
  'Internal Business Tools',
  'API-Connected Systems',
];

const KINDS = ['saas', 'crm-erp', 'web', 'mobile', 'ai', 'automation', 'portal', 'internal-tools', 'api'];

describe('WhatWeBuild', () => {
  let fixture: ComponentFixture<WhatWeBuild>;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatWeBuild],
      providers: [provideIntlayer()],
    }).compileComponents();
    fixture = TestBed.createComponent(WhatWeBuild);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders the section header with one h2 and the intro', () => {
    expect(root.querySelector('.what-we-build__eyebrow')?.textContent?.trim()).toBe('What we build');
    const headings = root.querySelectorAll('h2');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe('Systems shaped around how your business runs.');
    expect(root.querySelector('.what-we-build__intro')?.textContent?.trim()).toContain(
      'Representative categories of software',
    );
  });

  it('renders nine static cards, each with a decorative illustration, a title and a description', () => {
    const cards = Array.from(root.querySelectorAll('.what-we-build__card'));
    expect(cards).toHaveLength(9);
    expect(cards.map((c) => c.querySelector('h3')?.textContent?.trim())).toEqual(TITLES);

    const art = cards.map((c) => c.querySelector('app-what-we-build-illustration'));
    expect(art.map((a) => a?.getAttribute('data-kind'))).toEqual(KINDS);
    expect(art.map((a) => a?.getAttribute('aria-hidden'))).toEqual(Array(9).fill('true'));
    expect(art.map((a) => a?.querySelectorAll('svg').length)).toEqual(Array(9).fill(1));

    for (const card of cards) {
      expect(card.querySelector('.what-we-build__card-desc')?.textContent?.trim().length).toBeGreaterThan(40);
    }
    expect(root.querySelectorAll('a, button')).toHaveLength(0);
  });

  it('renders the footnote', () => {
    expect(root.querySelector('.what-we-build__note')?.textContent?.trim()).toBe(
      'Illustrations are conceptual and do not represent specific client projects.',
    );
  });

  it('re-renders in another locale', async () => {
    setLocale('hy');
    await fixture.whenStable();
    expect(root.querySelector('h2')?.textContent?.trim()).toBe(
      'Համակարգեր՝ կառուցված ձեր բիզնեսի աշխատելու ձևի շուրջ։',
    );
    expect(root.querySelector('.what-we-build__card h3')?.textContent?.trim()).toBe('SaaS հարթակներ');
  });
});
