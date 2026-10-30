import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { provideAppIcons } from '../../core/icons/provide-app-icons';
import { Partnerships } from './partnerships';
import partnerAudienceContent from './partner-audience/partner-audience.content';
import partnerModelContent from './partner-model/partner-model.content';
import partnerProcessContent from './partner-process/partner-process.content';
import partnerTermsContent from './partner-terms/partner-terms.content';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

const HEADING = 'Senior engineering behind your client relationships.';

const AUDIENCES = [
  'Digital Agencies',
  'Marketing Agencies',
  'IT Consultants',
  'Software Companies',
  'Independent Sales Partners',
  'Business Development Professionals',
];

const MODELS = [
  'White-Label Partnership',
  'Agency Partnership',
  'Referral Partnership',
  'Commission-Based Sales Partnership',
  'Business Development Partnership',
];

const STEPS = [
  'Introductory conversation',
  'Agree the model',
  'First opportunity',
  'Ongoing partnership',
];

const TERMS = [
  'Commercial conditions',
  'Commissions',
  'Confidentiality',
  'Responsibilities',
  'Communication model',
];

describe('Partnerships', () => {
  let harness: RouterTestingHarness;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  const text = (selector: string) =>
    Array.from(root.querySelectorAll(selector)).map((el) => el.textContent?.trim() ?? '');

  const go = async (url: string) => {
    await harness.navigateByUrl(url, Partnerships);
    TestBed.inject(HttpTestingController)
      .match(() => true)
      .forEach((request) => request.flush(ICON_SVG));
    await harness.fixture.whenStable();
    root = harness.routeNativeElement as HTMLElement;
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('opens with the shared intro: breadcrumb, eyebrow, one h1 and the lead', async () => {
    await go('/partnerships');

    expect(text('.page-intro__crumb')).toEqual(['Home', 'Partnerships']);
    expect(root.querySelector('.page-intro__crumb-link')?.getAttribute('href')).toBe('/');
    expect(root.querySelectorAll('.page-intro__crumb')[1].getAttribute('aria-current')).toBe(
      'page',
    );

    expect(root.querySelector('.page-intro__eyebrow')?.textContent?.trim()).toBe('Partnerships');

    const headings = root.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe(HEADING);

    expect(root.querySelector('.page-intro__lead')?.textContent?.trim()).toContain(
      'For agencies, consultants, software companies and sales partners',
    );
  });

  it('offers two intro actions that point at contact and the engagement models', async () => {
    await go('/partnerships');

    const actions = Array.from(root.querySelectorAll('.partnerships__actions a'));
    expect(actions.map((el) => el.textContent?.trim())).toEqual([
      'Become a Partner',
      'How partnerships work',
    ]);
    expect(actions.map((el) => el.getAttribute('href'))).toEqual([
      '/contact',
      '/engagement-models',
    ]);
  });

  it('renders the hero diagram as a named group with both sides and their chips', async () => {
    await go('/partnerships');

    const flow = root.querySelector('app-partner-flow .flow');
    expect(flow?.getAttribute('role')).toBe('group');
    expect(flow?.getAttribute('aria-label')).toBe('What each side brings');

    expect(text('app-partner-flow .flow__title')).toEqual(['Your side', 'Nexora']);
    expect(flow?.querySelectorAll('.flow__chip')).toHaveLength(8);
    expect(flow?.querySelector('.flow__badge')?.textContent?.trim()).toBe(
      'Agreed partnership model',
    );

    // The brand mark repeats the wordmark beside it, so it stays decorative.
    const mark = flow?.querySelector('.flow__mark');
    expect(mark?.getAttribute('src')).toBe('brand/mark.svg');
    expect(mark?.getAttribute('alt')).toBe('');
  });

  it('lists the six partner audiences, each with a decorative tile', async () => {
    await go('/partnerships');

    const section = root.querySelector('app-partner-audience .audience');
    expect(section?.getAttribute('aria-labelledby')).toBe('audience-title');
    expect(root.querySelector('#audience-title')?.textContent?.trim()).toBe(
      'Built for companies that sell or advise on technology.',
    );

    expect(text('app-partner-audience .audience__card-title')).toEqual(AUDIENCES);
    expect(root.querySelectorAll('app-partner-audience .audience__card')).toHaveLength(6);
    expect(
      Array.from(root.querySelectorAll('app-partner-audience app-icon-tile')).every(
        (tile) => tile.getAttribute('aria-hidden') === 'true',
      ),
    ).toBe(true);
  });

  it('lists the five partnership types and accents only the first tile', async () => {
    await go('/partnerships');

    expect(text('app-partner-model .models__row-title')).toEqual(MODELS);

    const tones = Array.from(root.querySelectorAll('app-partner-model app-icon-tile')).map((tile) =>
      tile.getAttribute('data-tone'),
    );
    expect(tones).toEqual(['inverse-accent', 'primary', 'primary', 'primary', 'primary']);

    // Every row repeats the same label and chip, so they are hoisted out of the item list.
    expect(new Set(text('app-partner-model .models__label')).size).toBe(1);
    expect(new Set(text('app-partner-model .models__chip'))).toEqual(
      new Set(['Terms agreed individually']),
    );
  });

  it('numbers the four process steps and hides the numerals from assistive technology', async () => {
    await go('/partnerships');

    expect(text('app-partner-process .process__step-title')).toEqual(STEPS);
    expect(text('app-partner-process .process__badge')).toEqual(['01', '02', '03', '04']);

    const badges = Array.from(root.querySelectorAll('app-partner-process .process__badge'));
    expect(badges.every((badge) => badge.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(badges.filter((badge) => badge.classList.contains('process__badge--lead'))).toHaveLength(
      1,
    );
  });

  it('lists the five agreed terms with four dividers between them', async () => {
    await go('/partnerships');

    const section = root.querySelector('app-partner-terms .terms');
    expect(section?.getAttribute('aria-labelledby')).toBe('terms-title');
    expect(root.querySelector('#terms-title')?.textContent?.trim()).toBe(
      'Every partnership is agreed individually.',
    );

    expect(text('app-partner-terms .terms__row-title')).toEqual(TERMS);
    expect(root.querySelectorAll('app-partner-terms .terms__row')).toHaveLength(5);
  });

  it('closes with the shared conversation band, overridden copy and no step list', async () => {
    await go('/partnerships');

    const band = root.querySelector('app-start-conversation');
    expect(band?.getAttribute('data-variant')).toBe('compact');
    expect(band?.querySelector('.start-conversation__eyebrow')?.textContent?.trim()).toBe(
      'Partnership inquiry',
    );
    expect(band?.querySelector('h2')?.textContent?.trim()).toBe(
      'Interested in partnering with Nexora?',
    );
    expect(band?.querySelectorAll('.start-conversation__step')).toHaveLength(0);

    const actions = Array.from(band?.querySelectorAll('.start-conversation__actions a') ?? []);
    expect(actions.map((el) => el.textContent?.trim())).toEqual([
      'Become a Partner',
      'White-label services',
    ]);
    expect(actions.map((el) => el.getAttribute('href'))).toEqual(['/contact', '/services']);
  });

  it('keeps one h1 and never skips a heading level', async () => {
    await go('/partnerships');

    const levels = Array.from(root.querySelectorAll('h1, h2, h3')).map((el) =>
      Number(el.tagName[1]),
    );
    expect(levels.filter((level) => level === 1)).toHaveLength(1);
    expect(levels[0]).toBe(1);
    levels.forEach((level, index) => {
      if (index > 0) {
        expect(level).toBeLessThanOrEqual(levels[index - 1] + 1);
      }
    });
  });

  it('translates the whole page and keeps the locale prefix on every link', async () => {
    setLocale('ru');
    await go('/ru/partnerships');

    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      'Инженерная экспертиза уровня Senior для реализации проектов ваших клиентов.',
    );
    expect(root.querySelector('#audience-title')?.textContent?.trim()).toBe(
      'Для компаний, которые предлагают технологические решения или консультируют в сфере технологий.',
    );

    const hrefs = Array.from(root.querySelectorAll('a')).map((el) => el.getAttribute('href'));
    expect(hrefs.every((href) => href === '/ru' || href?.startsWith('/ru/'))).toBe(true);
  });

  it('keeps the dictionaries complete: six audiences, five models, four steps, five terms', () => {
    expect(partnerAudienceContent.content.items).toHaveLength(6);
    expect(partnerModelContent.content.items).toHaveLength(5);
    expect(partnerProcessContent.content.steps).toHaveLength(4);
    expect(partnerTermsContent.content.items).toHaveLength(5);
  });
});
