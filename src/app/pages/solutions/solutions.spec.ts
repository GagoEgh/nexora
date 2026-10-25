import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { provideAppIcons } from '../../core/icons/provide-app-icons';
import { Solutions } from './solutions';
import challengesContent from './challenges.content';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

const TITLES = [
  'Launch a New Digital Product',
  'Modernize an Existing Software Platform',
  'Automate Repetitive Business Operations',
  'Introduce AI Into Existing Workflows',
  'Connect Disconnected Business Systems',
  'Scale Engineering Capacity',
  'Build a SaaS Product',
  'Improve Deployment and Infrastructure Reliability',
];

describe('Solutions', () => {
  let harness: RouterTestingHarness;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  const text = (selector: string) =>
    Array.from(root.querySelectorAll(selector)).map((el) => el.textContent?.trim() ?? '');

  const go = async (url: string) => {
    await harness.navigateByUrl(url, Solutions);
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

  it('opens with the shared intro: breadcrumb, eyebrow, one h1 and the lead in the aside', async () => {
    await go('/solutions');

    expect(text('.page-intro__crumb')).toEqual(['Home', 'Solutions']);
    expect(root.querySelector('.page-intro__crumb-link')?.getAttribute('href')).toBe('/');
    expect(root.querySelectorAll('.page-intro__crumb')[1].getAttribute('aria-current')).toBe(
      'page',
    );

    expect(root.querySelector('.page-intro__eyebrow')?.textContent?.trim()).toBe('Solutions');

    const headings = root.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe('Start from the problem, not the technology.');

    // The lead is projected into the aside, so page-intro renders no copy-column lead.
    expect(root.querySelector('.page-intro__lead')).toBeNull();
    expect(root.querySelector('.solutions__lead')?.textContent?.trim()).toBe(
      'Eight business challenges we help companies solve — each mapped to the services and engagement models that address it.',
    );
  });

  it('indexes the eight challenges with 01..08 ordinals', async () => {
    await go('/solutions');

    expect(text('.challenge-index__card .challenge-index__title')).toEqual(TITLES);
    expect(text('.challenge-index__number')).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
    ]);
  });

  it('expands every challenge into a panel with its counter, copy, help list and services', async () => {
    await go('/solutions');

    const panels = root.querySelectorAll('.challenge-details__panel');
    expect(panels).toHaveLength(8);

    // Panel titles are h2 and repeat the index, so the two sections cannot drift.
    expect(text('.challenge-details__title')).toEqual(TITLES);
    root
      .querySelectorAll('.challenge-details__title')
      .forEach((el) => expect(el.tagName).toBe('H2'));

    expect(text('.challenge-details__counter')).toEqual([
      '01 / 08',
      '02 / 08',
      '03 / 08',
      '04 / 08',
      '05 / 08',
      '06 / 08',
      '07 / 08',
      '08 / 08',
    ]);

    const first = panels[0];
    expect(first.querySelector('.challenge-details__label')?.textContent?.trim()).toBe(
      'The challenge',
    );
    expect(first.querySelector('.challenge-details__text')?.textContent?.trim()).toBe(
      'You have a validated idea or an internal need and want a working product without assembling a team from scratch.',
    );
    expect(
      Array.from(first.querySelectorAll('.challenge-details__point-text')).map((el) =>
        el.textContent?.trim(),
      ),
    ).toEqual([
      'Product discovery and scoping',
      'UX design and clickable prototype',
      'MVP built with room to scale',
    ]);
    expect(
      Array.from(first.querySelectorAll('.challenge-details__service-name')).map((el) =>
        el.textContent?.trim(),
      ),
    ).toEqual(['Web Design & UI/UX', 'Custom Software', 'SaaS Development', 'Mobile Apps']);

    // Every panel links its CTA to contact.
    const ctas = Array.from(root.querySelectorAll('.challenge-details__cta'));
    expect(ctas).toHaveLength(8);
    ctas.forEach((cta) => expect(cta.getAttribute('href')).toBe('/contact'));
  });

  it('gives the AI challenge the inverse tile and leaves the rest on the primary tone', async () => {
    await go('/solutions');

    const tones = Array.from(root.querySelectorAll('app-icon-tile')).map((el) =>
      el.getAttribute('data-tone'),
    );
    expect(tones).toEqual([
      'primary',
      'primary',
      'primary',
      'inverse-container',
      'primary',
      'primary',
      'primary',
      'primary',
    ]);
  });

  it('translates the whole page and keeps the locale prefix on its links', async () => {
    setLocale('hy');
    await go('/hy/solutions');

    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      'Սկսեք խնդրից, ոչ թե տեխնոլոգիայից։',
    );
    expect(text('.challenge-index__title')[0]).toBe('Գործարկել նոր թվային արտադրանք');
    expect(root.querySelector('.challenge-details__label')?.textContent?.trim()).toBe(
      'Մարտահրավերը',
    );
    expect(root.querySelector('.challenge-details__cta')?.getAttribute('href')).toBe('/hy/contact');
    expect(root.querySelector('.page-intro__crumb-link')?.getAttribute('href')).toBe('/hy');

    setLocale('ru');
    await go('/ru/solutions');
    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      'Начинайте с задачи, а не с технологии.',
    );
    expect(text('.challenge-index__title')[0]).toBe('Запустить новый цифровой продукт');
  });

  it('closes with the shared conversation band, overridden copy and no step list', async () => {
    await go('/solutions');

    const band = root.querySelector('app-start-conversation');
    expect(band).not.toBeNull();

    expect(band?.querySelector('.start-conversation__eyebrow')?.textContent?.trim()).toBe(
      'Start a conversation',
    );
    expect(band?.querySelector('.start-conversation__title')?.textContent?.trim()).toBe(
      'Facing a challenge that isn’t listed?',
    );
    expect(band?.querySelector('.start-conversation__lead')?.textContent?.trim()).toBe(
      'These are common starting points, not a complete list. Describe your situation and we’ll tell you honestly whether and how we can help.',
    );

    // The page omits `steps`, so the shared band must render no numbered list.
    expect(band?.querySelector('.start-conversation__steps')).toBeNull();

    const actions = Array.from(band?.querySelectorAll('.start-conversation__actions a') ?? []);
    expect(actions.map((el) => el.textContent?.trim())).toEqual([
      'Discuss Your Project',
      'Explore Our Services',
    ]);
    expect(actions.map((el) => el.getAttribute('href'))).toEqual(['/contact', '/services']);
  });

  it('translates the conversation band and keeps the locale prefix on both actions', async () => {
    const hrefs = () =>
      Array.from(
        root.querySelectorAll('app-start-conversation .start-conversation__actions a'),
      ).map((el) => el.getAttribute('href'));

    setLocale('hy');
    await go('/hy/solutions');
    expect(root.querySelector('.start-conversation__title')?.textContent?.trim()).toBe(
      'Ձեր մարտահրավերը ցանկում չկա՞։',
    );
    expect(hrefs()).toEqual(['/hy/contact', '/hy/services']);

    setLocale('ru');
    await go('/ru/solutions');
    expect(root.querySelector('.start-conversation__title')?.textContent?.trim()).toBe(
      'Не нашли свою задачу в списке?',
    );
    expect(hrefs()).toEqual(['/ru/contact', '/ru/services']);
  });

  it('keeps the dictionary complete: eight challenges, each fully populated', () => {
    const items = challengesContent.content.items;
    expect(items).toHaveLength(8);
    items.forEach((item) => {
      expect(item.help.length).toBeGreaterThanOrEqual(2);
      expect(item.services.length).toBeGreaterThanOrEqual(2);
    });
  });
});
