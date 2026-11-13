import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { provideAppIcons } from '../../core/icons/provide-app-icons';
import { OUR_WORK_SEGMENT } from '../../core/routing/paths';
import { OurWork } from './our-work';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

const HEADING = 'Our Work. Digital Solutions in Action';

const GLANCE_LABELS = [
  'Our work',
  'Project Categories',
  'Solutions We Build',
  'Technology Approach',
  'Project Scope',
];

describe('OurWork', () => {
  let harness: RouterTestingHarness;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  const text = (selector: string) =>
    Array.from(root.querySelectorAll(selector)).map((el) => el.textContent?.trim() ?? '');

  const go = async (url: string) => {
    await harness.navigateByUrl(url, OurWork);
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
    await go(`/${OUR_WORK_SEGMENT}`);

    expect(text('.page-intro__crumb')).toEqual(['Home', 'Our works']);
    expect(root.querySelector('.page-intro__crumb-link')?.getAttribute('href')).toBe('/');
    expect(root.querySelectorAll('.page-intro__crumb')[1].getAttribute('aria-current')).toBe(
      'page',
    );

    expect(root.querySelector('.page-intro__eyebrow')?.textContent?.trim()).toBe(
      'Selected projects',
    );

    const headings = root.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe(HEADING);

    expect(root.querySelector('.page-intro__lead')?.textContent?.trim()).toContain(
      'Explore the websites, applications',
    );
  });

  it('renders both of its bands: the glance table and the project grid', async () => {
    await go(`/${OUR_WORK_SEGMENT}`);

    expect(root.querySelector('app-about-products')).not.toBeNull();
    expect(text('.glance__label')).toEqual(GLANCE_LABELS);

    expect(root.querySelector('app-products')).not.toBeNull();
    expect(root.querySelectorAll('.projects__card').length).toBeGreaterThan(0);
  });

  it('reads its copy from its own dictionary, not the About page one', async () => {
    await go(`/${OUR_WORK_SEGMENT}`);

    expect(root.querySelector('h1')?.textContent?.trim()).toBe(HEADING);
    expect(root.querySelector('h1')?.textContent?.trim()).not.toContain(
      'A senior engineering partner',
    );
  });

  it('translates the intro and keeps the locale prefix on the breadcrumb link', async () => {
    setLocale('ru');
    await go(`/ru/${OUR_WORK_SEGMENT}`);

    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      'Наша работа. Цифровые решения в действии',
    );
    expect(text('.page-intro__crumb')).toEqual(['Главная', 'Наши работы']);
    expect(root.querySelector('.page-intro__crumb-link')?.getAttribute('href')).toBe('/ru');
  });
});
