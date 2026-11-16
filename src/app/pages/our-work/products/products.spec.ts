import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { CONTACT_PATH } from '../../../core/routing/paths';
import { PRODUCT_IDS } from './data/product-ids';
import { PRODUCT_META } from './data/product-meta';
import { Products } from './products';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

/**
 * The band renders one card per registered product and nothing else. Spelling all twenty-seven
 * titles out here would only restate the dictionary - that parity is `product-content.spec.ts`
 * - so what is pinned here is the join: every registry entry reaches the grid, in order, with
 * its own route and its own art.
 */
const PRODUCT_COUNT = PRODUCT_IDS.length;

/** Twenty-five of the twenty-seven have a live destination; two deliberately have none. */
const LIVE_COUNT = PRODUCT_IDS.filter((id) => PRODUCT_META[id].url !== undefined).length;

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

  it('renders one card per registered product', async () => {
    await render();

    expect(all('.projects__card')).toHaveLength(PRODUCT_COUNT);
    expect(all('app-project-card')).toHaveLength(PRODUCT_COUNT);

    const titles = text('.project-card__title');
    expect(titles).toHaveLength(PRODUCT_COUNT);
    expect(titles.every((title) => title.length > 0)).toBe(true);
  });

  /**
   * The card title now opens a page on this site rather than leaving it. A card whose link
   * fell out of registry order would send the visitor to a different product than the one they
   * clicked, which no amount of correct copy would make visible.
   */
  it('links every card at its own detail route, in registry order', async () => {
    await render();

    const hrefs = all('.project-card__link').map((el) => el.getAttribute('href') ?? '');
    expect(hrefs).toEqual(PRODUCT_IDS.map((id) => `/our_work/${id}`));
  });

  /**
   * Every card carries the photograph of its own product, restored from `public/images`. The
   * failure this guards against is the one that is invisible on the page: twenty-seven cards that
   * all render, each showing the wrong company's work.
   */
  it('gives every card its own product photograph, deferred', async () => {
    await render();

    const sources = all('.project-card__img').map((el) => el.getAttribute('src') ?? '');
    expect(sources).toHaveLength(PRODUCT_COUNT);
    expect(new Set(sources).size, 'two cards share one photograph').toBe(PRODUCT_COUNT);

    for (const [index, image] of all('.project-card__img').entries()) {
      expect(image.getAttribute('src'), `image ${index}`).toMatch(/^images\/[a-z]+\.webp$/);
      expect(image.getAttribute('loading'), `image ${index}`).toBe('lazy');
      // Declared at the file's real size, which differs per product.
      expect(Number(image.getAttribute('width')), `image ${index}`).toBeGreaterThan(0);
      expect(Number(image.getAttribute('height')), `image ${index}`).toBeGreaterThan(0);
    }
  });

  /** The mapping itself, pinned product by product, in registry order. */
  it('pairs every product with the photograph committed for it', async () => {
    await render();

    const sources = all('.project-card__img').map((el) => el.getAttribute('src'));
    expect(sources).toEqual(PRODUCT_IDS.map((id) => `images/${PRODUCT_META[id].photos[0].file}`));
  });

  /**
   * The grid's interactive surface, counted: twenty-seven detail links, one outbound link per live
   * product, and the band's own call to action. Nothing is a button - the card is its own
   * control, and there is no "Details" trigger to add a twentieth of anything.
   */
  it('exposes the detail link of every card and nothing it did not earn', async () => {
    await render();

    expect(all('app-project-card .project-card__link')).toHaveLength(PRODUCT_COUNT);
    expect(all('app-project-card .project-card__visit')).toHaveLength(LIVE_COUNT);
    expect(
      all('a'),
      'per card: one detail link, plus one per live product, plus the band CTA',
    ).toHaveLength(PRODUCT_COUNT + LIVE_COUNT + 1);
    expect(all('app-project-card button')).toHaveLength(0);
    expect(all('app-project-card [aria-expanded]')).toHaveLength(0);
  });

  /**
   * Every card has a second face, and every one of them starts turned away. The failure this
   * guards against scales with the grid: twenty-seven back faces live in the accessibility tree at
   * once, and it is the stylesheet's `visibility` - not `backface-visibility` - that keeps them
   * out of the tab order. A card rendered pre-flipped would show the back of the deck.
   */
  it('gives every card a back face, and turns none of them to begin with', async () => {
    await render();

    expect(all('.project-card__face--front')).toHaveLength(PRODUCT_COUNT);
    expect(all('.project-card__face--back')).toHaveLength(PRODUCT_COUNT);
    expect(all('app-project-card.is-flipped')).toHaveLength(0);
  });

  /** Every card is reachable by keyboard, and says which product it is before you walk in. */
  it('makes every card a tab stop with the product in its accessible name', async () => {
    await render();

    const cards = all('app-project-card');
    expect(cards.map((card) => card.getAttribute('tabindex'))).toEqual(cards.map(() => '0'));
    expect(cards.map((card) => card.getAttribute('role'))).toEqual(cards.map(() => 'group'));
    for (const [index, card] of cards.entries()) {
      expect(card.getAttribute('aria-label'), `card ${index}`).toContain(
        card.querySelector('.project-card__title')?.textContent?.trim() ?? '',
      );
    }
  });

  /**
   * The outbound links leave the site, which is the one thing on this page that can open a tab
   * the visitor did not ask for. Every one of them is rel-guarded and says so in its name.
   */
  it('sends a visitor off-site only safely, and only from a live product', async () => {
    await render();

    const external = all('app-project-card a[href^="http"]');
    expect(external).toHaveLength(LIVE_COUNT);
    for (const [index, link] of external.entries()) {
      expect(link.getAttribute('target'), `link ${index}`).toBe('_blank');
      expect(link.getAttribute('rel'), `link ${index}`).toBe('noopener');
      expect(link.getAttribute('aria-label'), `link ${index}`).toContain('new tab');
    }
  });

  it('points its call to action at the contact page, with the locale prefix', async () => {
    await render();
    expect(root.querySelector('.projects__cta')?.getAttribute('href')).toBe(CONTACT_PATH);

    setLocale('hy');
    await render();
    expect(root.querySelector('.projects__cta')?.getAttribute('href')).toBe(`/hy${CONTACT_PATH}`);
  });

  /**
   * This dictionary previously declared `key: 'expertise'`, which collided with the home page's
   * expertise band and merged the two in the built store - the home copy won every shared
   * field. The eyebrow below exists only here.
   */
  it('reads its copy from its own dictionary, not the home expertise one', async () => {
    await render();

    expect(root.querySelector('.projects__eyebrow')?.textContent?.trim()).toBe('Selected work');
    expect(root.querySelector('.projects__title')?.textContent?.trim()).toContain('Twenty-seven');
  });

  it('translates the band and every card', async () => {
    setLocale('ru');
    await render();

    expect(root.querySelector('.projects__eyebrow')?.textContent?.trim()).toBe('Избранные работы');
    expect(all('.projects__card')).toHaveLength(PRODUCT_COUNT);
    // The archetype label is the card's own translated string, and every card carries one.
    expect(text('.project-card__tag').every((label) => label.length > 0)).toBe(true);
    expect(root.querySelector('.project-card__tag')?.textContent).toContain('Мобильное приложение');
  });
});
