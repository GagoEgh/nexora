import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import type { ServiceCategorySummary, ServiceFilter } from '../service-category';
import { FilterBar } from './filter-bar';

const CHEVRON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M6 9L12 15L18 9" stroke="currentColor"/></svg>';

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
  imports: [FilterBar],
  template: `<app-filter-bar
    [categories]="categories()"
    [total]="total()"
    [value]="value()"
    [label]="label"
    [allLabel]="allLabel"
    (filterChange)="onFilterChange($event)"
  />`,
})
class Host {
  readonly categories = signal<readonly ServiceCategorySummary[]>(CATEGORIES);
  readonly total = signal(15);
  // Deliberately not fed back from the output: the real page drives this from the URL.
  readonly value = signal<ServiceFilter>('all');
  readonly label = 'Filter services by category';
  readonly allLabel = 'All services';
  readonly emitted: ServiceFilter[] = [];

  onFilterChange(value: ServiceFilter): void {
    this.emitted.push(value);
  }
}

describe('FilterBar', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let http: HttpTestingController;
  let root: HTMLElement;

  const chips = () => Array.from(root.querySelectorAll<HTMLElement>('mat-chip-option'));
  const selectedChips = () =>
    chips().filter((chip) => chip.classList.contains('mat-mdc-chip-selected'));
  const ariaSelected = () =>
    chips().map(
      (chip) =>
        chip.querySelector('button[role="option"]')?.getAttribute('aria-selected') === 'true',
    );
  const select = () => root.querySelector<HTMLSelectElement>('select.filter-bar__select')!;
  const clickChip = async (index: number) => {
    chips()[index].querySelector<HTMLButtonElement>('button[role="option"]')!.click();
    await settle();
  };
  const chooseOption = async (value: string) => {
    select().value = value;
    select().dispatchEvent(new Event('change'));
    await settle();
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
    http.expectOne('icons/chevron-down.svg').flush(CHEVRON_SVG);
    root = fixture.nativeElement as HTMLElement;
    await settle();
  });

  /**
   * MatChipListbox mirrors its `value` onto the options a task after the binding
   * lands. A single whenStable() leaves every chip unselected under jsdom, even
   * though the browser renders the selection correctly.
   */
  async function settle(): Promise<void> {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('offers every category plus an all-services option, in both controls', () => {
    expect(chips()).toHaveLength(CATEGORIES.length + 1);
    expect(chips().map((chip) => chip.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'All services 15',
      'Design & Product 1',
      'Software Engineering 6',
      'Artificial Intelligence 3',
      'Infrastructure & Operations 3',
      'Engineering Partnerships 2',
    ]);

    expect(Array.from(select().options).map((option) => option.textContent?.trim())).toEqual([
      'All services (15)',
      'Design & Product (1)',
      'Software Engineering (6)',
      'Artificial Intelligence (3)',
      'Infrastructure & Operations (3)',
      'Engineering Partnerships (2)',
    ]);
    expect(Array.from(select().options).map((option) => option.value)).toEqual([
      'all',
      ...CATEGORIES.map((category) => category.id),
    ]);
  });

  it('labels both controls for assistive technology', () => {
    expect(root.querySelector('mat-chip-listbox')?.getAttribute('aria-label')).toBe(host.label);
    expect(select().getAttribute('aria-label')).toBe(host.label);
  });

  it('reflects the supplied value in both controls', async () => {
    expect(ariaSelected()).toEqual([true, false, false, false, false, false]);
    expect(selectedChips()[0].textContent).toContain('All services');
    expect(select().value).toBe('all');

    host.value.set('software-engineering');
    await settle();

    expect(ariaSelected()).toEqual([false, false, true, false, false, false]);
    expect(selectedChips()[0].textContent).toContain('Software Engineering');
    expect(select().value).toBe('software-engineering');
  });

  it('emits the chosen category when a chip is picked', async () => {
    await clickChip(3);

    expect(host.emitted).toEqual(['artificial-intelligence']);
  });

  it('emits the chosen category when the native select changes', async () => {
    await chooseOption('infrastructure-operations');

    expect(host.emitted).toEqual(['infrastructure-operations']);
  });

  it('emits all-services, not a category, for the all option', async () => {
    host.value.set('software-engineering');
    await settle();

    await clickChip(0);

    expect(host.emitted).toEqual(['all']);
  });

  it('holds the current value and emits nothing when a chip is deselected', async () => {
    await clickChip(3);
    expect(host.emitted).toEqual(['artificial-intelligence']);

    // Material reports a deselection with no value; the bar must not emit that, and must
    // snap the listbox back to the value it was given rather than leaving it blank.
    await clickChip(3);

    expect(host.emitted).toEqual(['artificial-intelligence']);
    expect(selectedChips()).toHaveLength(1);
    expect(selectedChips()[0].textContent).toContain('All services');
  });

  it('ignores a select value that is not a known filter', async () => {
    await chooseOption('not-a-category');

    expect(host.emitted).toEqual([]);
  });
});
