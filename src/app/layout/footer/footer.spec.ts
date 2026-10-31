import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { isChallengeId } from '../../pages/solutions/challenge';
import { isServiceCategoryId } from '../../shared/services-catalogue/service-category';
import { Footer } from './footer';

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter(routes), provideIntlayer()],
    }).compileComponents();
    fixture = TestBed.createComponent(Footer);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders the brand column, four link columns and the pending contact note', () => {
    expect(root.querySelector('app-logo')).not.toBeNull();
    expect(root.querySelector('.footer__tagline')?.textContent?.trim()).toBe(
      'Engineering the next',
    );

    const headings = Array.from(root.querySelectorAll('.footer__heading')).map((h) =>
      h.textContent?.trim(),
    );
    expect(headings).toEqual(['Services', 'Solutions', 'Company', 'Get in touch']);

    const columnLinks = Array.from(root.querySelectorAll('.footer__column a.footer__link'));
    expect(columnLinks).toHaveLength(17);
    expect(columnLinks[0].textContent?.trim()).toBe('Software Engineering');
    expect(columnLinks[0].getAttribute('href')).toBe('/services?category=software-engineering');
    expect(columnLinks.at(-1)?.textContent?.trim()).toBe('Become a partner');

    // The "contact details pending" row was removed: a public site should not advertise
    // that its own contact information is unfinished. Asserted as absent so it cannot return
    // by accident.
    expect(root.querySelector('.footer__muted')).toBeNull();
  });

  /**
   * The solutions column deep-links into a page that scrolls to the matching panel. An id the
   * page does not recognise is silently ignored - the reader lands at the top with no error -
   * so the ids are checked against the ones the page actually accepts, as the services column
   * above already is.
   */
  it('deep-links every solutions challenge to a challenge the page accepts', () => {
    const columns = root.querySelectorAll<HTMLElement>('.footer__column');
    const solutions = Array.from(columns[1].querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    );

    expect(solutions.length).toBeGreaterThan(0);
    for (const href of solutions) {
      expect(href?.startsWith('/solutions')).toBe(true);
      const challenge = href?.split('challenge=')[1];
      if (challenge) {
        expect(isChallengeId(challenge), href ?? '').toBe(true);
      }
    }
    expect(new Set(solutions).size).toBe(solutions.length);
  });

  it('deep-links every services category to its own filter on the services page', () => {
    const services = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('.footer__column')[0].querySelectorAll('a'),
    ).map((a) => a.getAttribute('href'));

    expect(services).toEqual([
      '/services?category=software-engineering',
      '/services?category=artificial-intelligence',
      '/services?category=design-product',
      '/services?category=infrastructure-operations',
      '/services?category=engineering-partnerships',
      '/services',
    ]);
    // every category id has to be one the services page accepts, or the link silently shows all
    for (const href of services.slice(0, -1)) {
      expect(isServiceCategoryId(href?.split('=')[1])).toBe(true);
    }
    expect(new Set(services).size).toBe(services.length);
  });

  it('shows the current year and no legal links', () => {
    expect(root.querySelectorAll('.footer__legal a.footer__link')).toHaveLength(0);
    expect(root.querySelector('.footer__copyright')?.textContent).toContain(
      `© ${new Date().getFullYear()} Nexora. All rights reserved.`,
    );
  });

  it('switches the locale from the language links and re-renders', async () => {
    const links = () => Array.from(root.querySelectorAll<HTMLAnchorElement>('.footer__language'));
    expect(links().map((a) => a.textContent?.trim())).toEqual(['English', 'Հայերեն', 'Русский']);
    expect(links().map((a) => a.getAttribute('aria-current'))).toEqual(['true', null, null]);

    links()[2].click();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/ru');
    expect(links().map((a) => a.getAttribute('aria-current'))).toEqual([null, null, 'true']);
    expect(root.querySelector('.footer__heading')?.textContent?.trim()).toBe('Услуги');
    expect(root.querySelector('.footer__copyright')?.textContent).toContain('Все права защищены.');
    expect(root.querySelector('.footer__column a.footer__link')?.getAttribute('href')).toBe(
      '/ru/services?category=software-engineering',
    );
  });

  // The switcher has to keep working with JavaScript off, which means every locale control needs
  // a real href rather than a click handler alone.
  it('gives every language control an href for the current page in that locale', async () => {
    const hrefs = () =>
      Array.from(root.querySelectorAll<HTMLAnchorElement>('.footer__language')).map((a) =>
        a.getAttribute('href'),
      );
    expect(hrefs()).toEqual(['/', '/hy', '/ru']);

    // A plain route change moves no signal the footer reads, so the hrefs are driven by a
    // navigation-fed signal; without it they would still point at the previous page.
    await TestBed.inject(Router).navigateByUrl('/about');
    await fixture.whenStable();
    expect(hrefs()).toEqual(['/about', '/hy/about', '/ru/about']);
  });

  it('lets the browser handle a modified click so the locale can open in a new tab', async () => {
    const link = root.querySelector<HTMLAnchorElement>('.footer__language[lang="ru"]');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
    link?.dispatchEvent(event);
    await fixture.whenStable();

    expect(event.defaultPrevented).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
