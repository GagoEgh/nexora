import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { SERVICES_PATH } from '../../../core/routing/paths';
import { Products } from './products';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

/**
 * The catalogue is nineteen client products. Spelling all nineteen out here would only restate
 * the dictionary, so the count and the two ends are pinned - enough to catch an entry being
 * dropped or the order being reversed - and everything else is asserted as an invariant that
 * must hold for every card.
 */
const SERVICE_COUNT = 19;
const FIRST_TITLE = 'Connected Car & Vehicle Management Mobile App';
const LAST_TITLE = 'Premium Skincare E-commerce & Personalized Beauty Platform';
const FIRST_HREF = 'https://www.sellmewatch.com/';
const LAST_HREF = 'https://www.skinome.com/';

describe('Products', () => {
  let fixture: ComponentFixture<Products>;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  const all = (selector: string) => Array.from(root.querySelectorAll(selector));
  const text = (selector: string) => all(selector).map((el) => el.textContent?.trim() ?? '');

  const render = async () => {
    fixture = TestBed.createComponent(Products);
    TestBed.inject(HttpTestingController)
      .match(() => true)
      .forEach((request) => request.flush(ICON_SVG));
    await fixture.whenStable();
    root = fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    });
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders one card per catalogue entry, in order', async () => {
    await render();

    expect(all('.expertise__card')).toHaveLength(SERVICE_COUNT);

    const titles = text('.expertise__card-title');
    expect(titles).toHaveLength(SERVICE_COUNT);
    expect(titles[0]).toBe(FIRST_TITLE);
    expect(titles.at(-1)).toBe(LAST_TITLE);
    expect(titles.every((title) => title.length > 0)).toBe(true);
  });

  /**
   * Every card points at a live client product, so these are plain `href`s rather than
   * `routerLink`s. A relative value here would silently become an in-app navigation that
   * resolves to the 404 page instead of leaving the site.
   */
  it('links every card at an absolute external URL', async () => {
    await render();

    const hrefs = all('.expertise__link').map((el) => el.getAttribute('href') ?? '');
    expect(hrefs).toHaveLength(SERVICE_COUNT);
    expect(hrefs[0]).toBe(FIRST_HREF);
    expect(hrefs.at(-1)).toBe(LAST_HREF);

    const relative = hrefs.filter((href) => !href.startsWith('https://'));
    expect(relative, 'these would navigate inside the app').toEqual([]);
  });

  /**
   * Nineteen client screenshots sit on this one page and all but the first are below the fold.
   * Without `loading="lazy"` every one of them is fetched during the initial load, which on
   * this page is several megabytes of imagery.
   */
  it('defers every screenshot and gives it alt text that matches its card', async () => {
    await render();

    const images = all('.expertise__card-img');
    const titles = text('.expertise__card-title');
    expect(images).toHaveLength(SERVICE_COUNT);

    for (const [index, image] of images.entries()) {
      expect(image.getAttribute('loading'), `image ${index}`).toBe('lazy');
      expect(image.getAttribute('decoding'), `image ${index}`).toBe('async');
      expect(image.getAttribute('alt'), `image ${index}`).toBe(titles[index]);
      expect(image.getAttribute('src'), `image ${index}`).toMatch(/^\/images\/.+/);
    }
  });

  /**
   * `icon` is declared `satisfies AppIconName` in the dictionary, but it reaches the template
   * as a plain string, so the compile-time check does not survive the round trip. A typo would
   * surface only as Material's "Unable to find icon" at runtime; the registry is stubbed here,
   * so what this can still assert is that every card asked for one.
   */
  it('gives every card an icon tile', async () => {
    await render();
    expect(all('app-icon-tile')).toHaveLength(SERVICE_COUNT);
  });

  it('points the catalogue link at the services page, with the locale prefix', async () => {
    await render();
    expect(root.querySelector('.expertise__all')?.getAttribute('href')).toBe(SERVICES_PATH);

    setLocale('hy');
    await render();
    expect(root.querySelector('.expertise__all')?.getAttribute('href')).toBe(`/hy${SERVICES_PATH}`);
  });

  /**
   * This dictionary previously declared `key: 'expertise'`, which collided with the home page's
   * expertise band and merged the two in the built store - the home copy won every shared
   * field. The eyebrow below exists only here.
   */
  it('reads its copy from its own dictionary, not the home expertise one', async () => {
    await render();

    expect(root.querySelector('.expertise__eyebrow')?.textContent?.trim()).toBe('What we do');
    expect(all('.expertise__card')).toHaveLength(SERVICE_COUNT);
  });
});
