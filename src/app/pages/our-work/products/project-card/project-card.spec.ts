import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer } from 'angular-intlayer';
import { provideAppIcons } from '../../../../core/icons/provide-app-icons';
import type { ProductView } from '../data/product-view';
import { ProjectCard, type ProjectCardLabels } from './project-card';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

const PRODUCT: ProductView = {
  id: 'draculai',
  archetype: 'app',
  archetypeLabel: 'Mobile app',
  icon: 'smartphone',
  name: 'Draculai',
  category: 'Health and substance tracking',
  hook: 'A one-sentence hook.',
  summary: 'A longer summary of what the product does.',
  highlights: ['FDA drug data lookup', 'Intake log', 'Reminders', 'No data collected'],
  advantage: 'The advantage.',
  value: 'The business value.',
  about: 'The longer about text.',
  photos: [{ src: 'images/medical.webp', width: 800, height: 450, alt: '' }],
  path: '/our_work/draculai',
  url: 'https://apps.apple.com/us/app/draculai/id6744015242',
  platform: 'iOS',
};

const LABELS: ProjectCardLabels = {
  viewProject: 'View project',
  visitSite: 'Visit site',
  newTab: 'opens in a new tab',
};

/**
 * The card turns to show a second face, and most of this file is about which half of it the
 * keyboard and a screen reader can reach at any moment.
 *
 * There is no "Details" button: hover, tap and focus are the three triggers, and each is pinned
 * here, because the flip regressed once already by being removed along with that button.
 */
describe('ProjectCard', () => {
  let fixture: ComponentFixture<ProjectCard>;
  let host: HTMLElement;

  /**
   * Makes `(hover: none)` answer `true`, which is how the component recognises touch.
   *
   * `matchMedia` is defined rather than spied on, because this environment does not implement
   * it at all - which is also why the hover tests above exercise the pointer branch: the
   * component treats a missing `matchMedia` as "not a touch device", the same as the server
   * does during prerender. Only `matches` is stubbed, because that is all it reads; it
   * re-queries on every event rather than subscribing, so there is no listener to satisfy.
   */
  const useCoarsePointer = () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: (query: string) =>
        ({ matches: query.includes('hover: none'), media: query }) as unknown as MediaQueryList,
    });
  };

  const render = async (product: ProductView = PRODUCT) => {
    fixture = TestBed.createComponent(ProjectCard);
    fixture.componentRef.setInput('product', product);
    fixture.componentRef.setInput('labels', LABELS);
    TestBed.inject(HttpTestingController)
      .match(() => true)
      .forEach((request) => request.flush(ICON_SVG));
    await fixture.whenStable();
    host = fixture.nativeElement as HTMLElement;
  };

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const hover = async () => {
    host.dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
  };

  const unhover = async () => {
    host.dispatchEvent(new MouseEvent('mouseleave'));
    await settle();
  };

  const tap = async (target: EventTarget = host) => {
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();
  };

  const flipped = () => host.classList.contains('is-flipped');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // A route that swallows anything: one test taps the detail link, and an empty router
        // configuration would fail that navigation with NG04002 rather than let it happen.
        provideRouter([{ path: '**', children: [] }]),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    });
  });

  afterEach(() => {
    // Put the window back the way this environment had it: undefined, not a stub that answers.
    Reflect.deleteProperty(window, 'matchMedia');
    vi.restoreAllMocks();
  });

  it('renders the front face from the product', async () => {
    await render();

    expect(host.querySelector('.project-card__title')?.textContent?.trim()).toBe('Draculai');
    expect(host.querySelector('.project-card__category')?.textContent?.trim()).toBe(
      PRODUCT.category,
    );
    expect(host.querySelector('.project-card__hook')?.textContent?.trim()).toBe(PRODUCT.hook);
    expect(host.querySelector('.project-card__tag')?.textContent).toContain('Mobile app');
  });

  it('renders the back face from the product', async () => {
    await render();

    expect(host.querySelector('.project-card__summary')?.textContent?.trim()).toBe(PRODUCT.summary);
    expect(host.querySelector('.project-card__advantage')?.textContent?.trim()).toBe(
      PRODUCT.advantage,
    );
    const highlights = Array.from(host.querySelectorAll('.project-card__highlight')).map((item) =>
      item.textContent?.trim(),
    );
    expect(highlights).toEqual([...PRODUCT.highlights]);
  });

  /**
   * The name sits in a heading immediately beside the image, so alt text would be read twice.
   * What it must not be is missing, which is a different failure.
   */
  it('renders the product photograph as decorative, deferred and dimensioned', async () => {
    await render();
    const image = host.querySelector('.project-card__img') as HTMLImageElement;

    expect(image.getAttribute('src')).toBe(PRODUCT.photos[0].src);
    expect(image.getAttribute('alt')).toBe('');
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.getAttribute('decoding')).toBe('async');
    // The photograph's own size, not a constant: this set has nine different shapes, and a card
    // that declared one size for all of them would be reserving the wrong box for most.
    expect(image.getAttribute('width')).toBe(String(PRODUCT.photos[0].width));
    expect(image.getAttribute('height')).toBe(String(PRODUCT.photos[0].height));
  });

  /**
   * The card shows the product's own photograph, served from `public`. Nothing generated is used
   * anywhere on this page, so a card source under `assets/images/products` is a regression.
   */
  it('shows the photograph that ships in public/images', async () => {
    await render();
    const source = host.querySelector('.project-card__img')?.getAttribute('src');

    expect(source).toBe('images/medical.webp');
    expect(source).not.toContain('assets/images/products');
  });

  it('starts unturned', async () => {
    await render();

    expect(flipped()).toBe(false);
  });

  it('turns on hover and returns when the pointer leaves', async () => {
    await render();

    await hover();
    expect(flipped()).toBe(true);

    await unhover();
    expect(flipped()).toBe(false);
  });

  /**
   * A tap on a touch device raises `mouseenter` before `click` in most browsers. Were hover live
   * there, the enter would turn the card and the click would turn it straight back.
   */
  it('ignores hover on a touch device and toggles on tap instead', async () => {
    useCoarsePointer();
    await render();

    await hover();
    expect(flipped()).toBe(false);

    await tap();
    expect(flipped()).toBe(true);

    await tap();
    expect(flipped()).toBe(false);
  });

  /**
   * The regression that shipped the first time this was built: a tap focuses the card before it
   * clicks it, so one gesture arrives as two triggers. The focus turned the card and the click
   * turned it back, and from the outside the card simply would not open on a phone.
   */
  it('turns once on a tap that also focuses the card', async () => {
    useCoarsePointer();
    await render();

    host.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await tap();
    expect(flipped()).toBe(true);

    // The next tap is a tap on its own, and still toggles.
    await tap();
    expect(flipped()).toBe(false);
  });

  it('leaves the card turned when a touch device raises a stray mouseleave', async () => {
    useCoarsePointer();
    await render();

    await tap();
    await unhover();
    expect(flipped()).toBe(true);
  });

  it('treats a tap on a link as navigation rather than as a toggle', async () => {
    useCoarsePointer();
    await render();
    await tap();

    await tap(host.querySelector('.project-card__link') as HTMLAnchorElement);
    expect(flipped()).toBe(true);
  });

  /**
   * The keyboard path, which is the whole reason the host is a tab stop: nothing on the front
   * face is focusable, so focus is what has to open the card (WCAG 2.1.1).
   */
  it('is a tab stop that announces which product it is', async () => {
    await render();

    expect(host.getAttribute('tabindex')).toBe('0');
    expect(host.getAttribute('role')).toBe('group');
    expect(host.getAttribute('aria-label')).toBe('Draculai — Health and substance tracking');
  });

  it('has nothing focusable on the front face, so turning cannot strand focus', async () => {
    await render();
    const front = host.querySelector('.project-card__face--front') as HTMLElement;

    expect(front.querySelectorAll('a, button, [tabindex], input, select, textarea')).toHaveLength(
      0,
    );
  });

  it('turns when focus enters and returns when focus leaves the card', async () => {
    await render();

    host.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await settle();
    expect(flipped()).toBe(true);

    host.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
    await settle();
    expect(flipped()).toBe(false);
  });

  it('stays turned while focus moves between the two links on the back', async () => {
    await render();
    const links = Array.from(host.querySelectorAll('a'));

    host.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await settle();

    host.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: links[1] }));
    await settle();
    expect(flipped()).toBe(true);
  });

  /**
   * `mouseleave` fires whenever the pointer wanders off, including while someone is tabbing
   * through the links. Honouring it then would pull the back face out from under the caret.
   */
  it('does not return on mouseleave while the caret is still inside', async () => {
    await render();
    document.body.append(host);
    const link = host.querySelector('.project-card__link') as HTMLAnchorElement;

    await hover();
    link.focus();
    await unhover();

    expect(flipped()).toBe(true);
    host.remove();
  });

  it('returns on Escape and keeps the caret on the card', async () => {
    await render();
    document.body.append(host);

    host.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await settle();

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();

    expect(flipped()).toBe(false);
    expect(document.activeElement).toBe(host);
    host.remove();
  });

  it('opens its own detail route, and names the product in the link', async () => {
    await render();
    const link = host.querySelector('.project-card__link') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/our_work/draculai');
    expect(link.getAttribute('aria-label')).toBe('View project: Draculai');
    // The visible text is contained in the accessible name (WCAG 2.5.3).
    expect(link.getAttribute('aria-label')).toContain(link.textContent?.trim());
  });

  /**
   * The outbound link warns about the new tab inside its own accessible name. A sibling span
   * would be computed away by `aria-label`, which replaces an element's contents.
   */
  it('sends a visitor to the live product in a safe new tab', async () => {
    await render();
    const visit = host.querySelector('.project-card__visit') as HTMLAnchorElement;

    expect(visit.getAttribute('href')).toBe(PRODUCT.url);
    expect(visit.getAttribute('target')).toBe('_blank');
    expect(visit.getAttribute('rel')).toBe('noopener');
    expect(visit.getAttribute('aria-label')).toBe('Visit site: Draculai (opens in a new tab)');
  });

  /**
   * Two of the nineteen products have no destination worth sending a visitor to, and the card
   * renders no outbound link at all for them rather than a dead one.
   */
  it('renders no outbound link when the product has no live destination', async () => {
    await render({ ...PRODUCT, url: undefined, platform: undefined });

    expect(host.querySelector('.project-card__visit')).toBeNull();
    expect(host.querySelectorAll('a[target="_blank"]')).toHaveLength(0);
    expect(host.querySelectorAll('a')).toHaveLength(1);
  });

  it('uses links rather than buttons, so the card itself is the only control', async () => {
    await render();

    expect(host.querySelectorAll('button')).toHaveLength(0);
    expect(host.querySelector('[aria-expanded]')).toBeNull();
  });
});
