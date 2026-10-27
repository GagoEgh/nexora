import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import type { ServiceCategoryId, ServiceCategorySummary } from '../service-category';
import { CategoryNav } from './category-nav';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"></svg>';

const CATEGORIES: readonly ServiceCategorySummary[] = [
  { id: 'design-product', icon: 'pen-tool', label: 'Design & Product', count: 1 },
  { id: 'software-engineering', icon: 'code', label: 'Software Engineering', count: 6 },
  { id: 'artificial-intelligence', icon: 'sparkle', label: 'Artificial Intelligence', count: 3 },
  {
    id: 'infrastructure-operations',
    icon: 'server',
    label: 'Infrastructure & Operations',
    count: 3,
  },
  { id: 'engineering-partnerships', icon: 'users', label: 'Engineering Partnerships', count: 2 },
];

@Component({
  imports: [CategoryNav],
  template: `<app-category-nav
    [categories]="categories()"
    [active]="active()"
    [label]="label"
    (categorySelect)="onSelect($event)"
  />`,
})
class Host {
  readonly categories = signal<readonly ServiceCategorySummary[]>(CATEGORIES);
  // Not fed back from the output: the real page derives this from the URL and scroll.
  readonly active = signal<ServiceCategoryId>('design-product');
  readonly label = 'Service categories';
  readonly emitted: ServiceCategoryId[] = [];

  onSelect(id: ServiceCategoryId): void {
    this.emitted.push(id);
  }
}

describe('CategoryNav', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let http: HttpTestingController;
  let root: HTMLElement;

  const links = () => Array.from(root.querySelectorAll<HTMLAnchorElement>('.category-nav__item'));
  const flushIcons = () => {
    for (const request of http.match(() => true)) {
      request.flush(ICON_SVG);
    }
  };
  const click = async (index: number) => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    links()[index].dispatchEvent(event);
    await fixture.whenStable();
    return event;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideAppIcons()],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    flushIcons();
    await fixture.whenStable();
    root = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  it('lists every category with its label, count and a decorative tile', () => {
    expect(links()).toHaveLength(CATEGORIES.length);
    expect(
      Array.from(root.querySelectorAll('.category-nav__label')).map((el) => el.textContent?.trim()),
    ).toEqual(CATEGORIES.map((category) => category.label));
    expect(
      Array.from(root.querySelectorAll('.category-nav__count')).map((el) => el.textContent?.trim()),
    ).toEqual(['1', '6', '3', '3', '2']);

    const tiles = Array.from(root.querySelectorAll('app-icon-tile'));
    expect(tiles).toHaveLength(CATEGORIES.length);
    expect(tiles.every((tile) => tile.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('is a labelled navigation landmark built from a real list', () => {
    const nav = root.querySelector('nav.category-nav');
    expect(nav?.getAttribute('aria-label')).toBe(host.label);
    expect(nav?.querySelector('ul.category-nav__list')).not.toBeNull();
    expect(root.querySelectorAll('ul.category-nav__list > li')).toHaveLength(CATEGORIES.length);
  });

  it('points every link at the matching catalogue section', () => {
    expect(links().map((link) => link.getAttribute('href'))).toEqual([
      '#services-design-product',
      '#services-software-engineering',
      '#services-artificial-intelligence',
      '#services-infrastructure-operations',
      '#services-engineering-partnerships',
    ]);
  });

  it('marks exactly one category as current, and omits the attribute elsewhere', () => {
    expect(links().map((link) => link.getAttribute('aria-current'))).toEqual([
      'location',
      null,
      null,
      null,
      null,
    ]);
    expect(root.querySelectorAll('.category-nav__item--active')).toHaveLength(1);
  });

  it('moves the current marker when the active category changes', async () => {
    host.active.set('artificial-intelligence');
    await fixture.whenStable();

    expect(links().map((link) => link.getAttribute('aria-current'))).toEqual([
      null,
      null,
      'location',
      null,
      null,
    ]);
    expect(links()[2].classList.contains('category-nav__item--active')).toBe(true);
    expect(root.querySelectorAll('.category-nav__item--active')).toHaveLength(1);
  });

  it('emits the chosen category instead of letting the browser follow the hash', async () => {
    const event = await click(2);

    expect(host.emitted).toEqual(['artificial-intelligence']);
    // The page owns the scroll, so the anchor must not navigate on its own.
    expect(event.defaultPrevented).toBe(true);
  });

  it('emits once per click, and reports each category it is given', async () => {
    await click(0);
    await click(4);

    expect(host.emitted).toEqual(['design-product', 'engineering-partnerships']);
  });

  it('re-renders when the category list itself changes', async () => {
    host.categories.set(CATEGORIES.slice(0, 2));
    await fixture.whenStable();

    expect(links()).toHaveLength(2);
    expect(links().map((link) => link.getAttribute('href'))).toEqual([
      '#services-design-product',
      '#services-software-engineering',
    ]);
  });
});
