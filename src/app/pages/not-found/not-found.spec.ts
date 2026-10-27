import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { provideAppIcons } from '../../core/icons/provide-app-icons';
import { NotFound } from './not-found';
import notFoundContent from './not-found.content';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

const HEADING = 'This page doesn’t exist — or it has moved.';

const LINKS = [
  'Solutions',
  'About Nexora',
  'Engagement models',
  'Partnerships',
  'Contact',
] as const;

describe('NotFound', () => {
  let harness: RouterTestingHarness;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  const text = (selector: string) =>
    Array.from(root.querySelectorAll(selector)).map((el) => el.textContent?.trim() ?? '');

  const go = async (url: string) => {
    await harness.navigateByUrl(url, NotFound);
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

  it('is what the wildcard route renders, without changing the URL', async () => {
    await go('/no/such/page');

    expect(TestBed.inject(Router).url).toBe('/no/such/page');
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelector('h1')?.textContent?.trim()).toBe(HEADING);
  });

  it('shows the error eyebrow and the explanatory lead', async () => {
    await go('/no/such/page');

    expect(root.querySelector('.notfound__eyebrow')?.textContent?.trim()).toBe('Error 404');
    expect(root.querySelector('.notfound__lead')?.textContent?.trim()).toContain(
      'The link may be outdated',
    );
  });

  it('renders the broken-link diagram as a single labelled image', async () => {
    await go('/no/such/page');

    const diagram = root.querySelector('.notfound__diagram');
    expect(diagram?.getAttribute('role')).toBe('img');
    expect(diagram?.getAttribute('aria-label')).toBe('The requested link could not be resolved');

    expect(text('.notfound__node-text')).toEqual(['/your-link', 'page not found']);

    // The failing side is the error-toned tile; the requested side is the primary one.
    const tones = Array.from(root.querySelectorAll('.notfound__diagram app-icon-tile')).map(
      (tile) => tile.getAttribute('data-tone'),
    );
    expect(tones).toEqual(['primary', 'error']);
  });

  it('offers both recovery actions', async () => {
    await go('/no/such/page');

    const actions = Array.from(root.querySelectorAll('.notfound__actions a'));
    expect(actions.map((el) => el.textContent?.trim())).toEqual([
      'Back to homepage',
      'Browse services',
    ]);
    expect(actions.map((el) => el.getAttribute('href'))).toEqual(['/', '/services']);
  });

  it('lists the five shortcut links in a labelled nav', async () => {
    await go('/no/such/page');

    const nav = root.querySelector('.notfound__links');
    expect(nav?.tagName).toBe('NAV');
    expect(nav?.getAttribute('aria-label')).toBe('Popular pages');

    expect(text('.notfound__chip')).toEqual([...LINKS]);
    expect(
      Array.from(root.querySelectorAll('.notfound__chip')).map((el) => el.getAttribute('href')),
    ).toEqual(['/solutions', '/about', '/engagement-models', '/partnerships', '/contact']);
  });

  it('translates the page and keeps the locale prefix on every link', async () => {
    setLocale('ru');
    await go('/ru/no/such/page');

    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      'Этой страницы не существует — или она была перемещена.',
    );

    const hrefs = Array.from(root.querySelectorAll('a')).map((el) => el.getAttribute('href'));
    expect(hrefs.every((href) => href === '/ru' || href?.startsWith('/ru/'))).toBe(true);
  });

  it('keeps the dictionary complete: five shortcut links', () => {
    expect(notFoundContent.content.links).toHaveLength(5);
  });
});
