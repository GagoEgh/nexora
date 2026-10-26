import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { provideAppIcons } from '../../core/icons/provide-app-icons';
import { Contact } from './contact';
import contactChannelsContent from './contact-channels/contact-channels.content';
import contactFormContent from './contact-form/contact-form.content';
import contactNextContent from './contact-next/contact-next.content';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

const HEADING = 'Let’s Build Something Meaningful.';

const STEPS = [
  'We review your inquiry',
  'We reply to arrange a conversation',
  'We suggest next steps',
];

const CHANNELS = ['Email', 'Phone', 'Office address'];

const INTERESTS = ['A new project', 'A dedicated team', 'A partnership', 'Something else'];

const METHODS = ['Email', 'Phone', 'Video call'];

describe('Contact', () => {
  let harness: RouterTestingHarness;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  const text = (selector: string) =>
    Array.from(root.querySelectorAll(selector)).map((el) => el.textContent?.trim() ?? '');

  const go = async (url: string) => {
    await harness.navigateByUrl(url, Contact);
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
    await go('/contact');

    expect(text('.page-intro__crumb')).toEqual(['Home', 'Contact']);
    expect(root.querySelector('.page-intro__crumb-link')?.getAttribute('href')).toBe('/');
    expect(root.querySelectorAll('.page-intro__crumb')[1].getAttribute('aria-current')).toBe(
      'page',
    );

    expect(root.querySelector('.page-intro__eyebrow')?.textContent?.trim()).toBe('Contact');

    const headings = root.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe(HEADING);

    expect(root.querySelector('.page-intro__lead')?.textContent?.trim()).toContain(
      'Tell us about your project, team needs or partnership idea.',
    );
  });

  it('lists the three next steps and hides the numerals from assistive technology', async () => {
    await go('/contact');

    const section = root.querySelector('app-contact-next .next');
    expect(section?.getAttribute('aria-labelledby')).toBe('contact-next-title');

    expect(text('.next__step-title')).toEqual(STEPS);
    expect(text('.next__badge')).toEqual(['1', '2', '3']);

    const badges = Array.from(root.querySelectorAll('.next__badge'));
    expect(badges.every((badge) => badge.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('lists the three contact channels as a description list of unresolved placeholders', async () => {
    await go('/contact');

    const section = root.querySelector('app-contact-channels .channels');
    expect(section?.getAttribute('aria-labelledby')).toBe('contact-channels-title');
    expect(root.querySelector('#contact-channels-title')?.textContent?.trim()).toBe(
      'Other ways to reach us',
    );

    expect(text('.channels__label')).toEqual(CHANNELS);

    // The design ships unapproved placeholders; no real contact detail may be invented.
    expect(text('.channels__value')).toEqual([
      '{CONTACT_EMAIL} — add when approved',
      '{CONTACT_PHONE} — add when approved',
      '{CONTACT_ADDRESS} — add when approved',
    ]);
  });

  it('renders the form card with every labelled control', async () => {
    await go('/contact');

    expect(root.querySelector('#contact-form-title')?.textContent?.trim()).toBe(
      'Tell us about your project',
    );

    const ids = [
      'contact-interest',
      'contact-name',
      'contact-email',
      'contact-company',
      'contact-service',
      'contact-description',
      'contact-timeline',
      'contact-budget',
      'contact-method',
    ];
    for (const id of ids) {
      expect(root.querySelector(`[for="${id}"]`), id).not.toBeNull();
      expect(root.querySelector(`#${id}`), id).not.toBeNull();
    }

    expect(text('app-chip-select mat-chip-option')).toEqual([...INTERESTS, ...METHODS]);
    expect(root.querySelectorAll('app-contact-form mat-form-field')).toHaveLength(7);
    expect(root.querySelector('app-contact-form textarea')?.getAttribute('maxlength')).toBe('2000');
  });

  it('points both privacy links at the policy route', async () => {
    await go('/contact');

    const links = Array.from(root.querySelectorAll('app-contact-form a'));
    expect(links).toHaveLength(2);
    expect(links.map((el) => el.getAttribute('href'))).toEqual([
      '/privacy-policy',
      '/privacy-policy',
    ]);
  });

  it('keeps one h1 and never skips a heading level', async () => {
    await go('/contact');

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
    await go('/ru/contact');

    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Давайте создадим что-то значимое.');
    expect(root.querySelector('#contact-channels-title')?.textContent?.trim()).toBe(
      'Другие способы связаться с нами',
    );
    expect(root.querySelector('#contact-form-title')?.textContent?.trim()).toBe(
      'Расскажите о своём проекте',
    );

    const hrefs = Array.from(root.querySelectorAll('a')).map((el) => el.getAttribute('href'));
    expect(hrefs.every((href) => href === '/ru' || href?.startsWith('/ru/'))).toBe(true);
  });

  it('keeps the dictionaries complete: three steps, three channels, four interests', () => {
    expect(contactNextContent.content.steps).toHaveLength(3);
    expect(contactChannelsContent.content.items).toHaveLength(3);
    expect(contactFormContent.content.interestOptions).toHaveLength(4);
    expect(contactFormContent.content.methodOptions).toHaveLength(3);
    expect(contactFormContent.content.serviceOptions).toHaveLength(5);
  });
});
