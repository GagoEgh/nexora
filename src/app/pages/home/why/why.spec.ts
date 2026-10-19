import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { Why } from './why';

const DISCIPLINES = [
  'Solution architecture',
  'Backend',
  'Frontend',
  'Mobile',
  'AI engineering',
  'DevOps',
  'UI/UX',
  'QA',
  'Technical leadership',
];

const ARCHITECTURE_REASONS = [
  'Senior & Senior+ engineers',
  'End-to-end delivery',
  'Business-first approach',
  'Flexible collaboration',
  'Long-term technical partnership',
];

describe('Why', () => {
  let fixture: ComponentFixture<Why>;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);
  const options = () => Array.from(root.querySelectorAll<HTMLElement>('mat-chip-option'));
  const selectedOptions = () =>
    options().filter((o) => o.classList.contains('mat-mdc-chip-selected'));
  const reasonTitles = () =>
    Array.from(root.querySelectorAll('.why__item h3')).map((h) => h.textContent?.trim());
  const chooseOption = async (index: number) => {
    (options()[index].querySelector('button[role="option"]') as HTMLButtonElement).click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Why],
      providers: [provideIntlayer()],
    }).compileComponents();
    fixture = TestBed.createComponent(Why);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders the copy column with one h2 and the lead paragraph', () => {
    expect(root.querySelector('.why__eyebrow')?.textContent?.trim()).toBe('Why Nexora');
    const headings = root.querySelectorAll('h2');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe(
      'Senior engineering, applied to real business problems.',
    );
    expect(root.querySelector('.why__lead')?.textContent?.trim()).toContain(
      'Good software is mostly good decisions.',
    );
  });

  it('renders the one-team card as a single-selection listbox with the first discipline selected', () => {
    const card = root.querySelector('.why__card') as HTMLElement;
    expect(card.querySelector('app-logo')?.getAttribute('data-variant')).toBe('mark');
    expect(card.querySelector('.why__card-title')?.textContent?.trim()).toBe(
      'One team, every discipline',
    );

    const listbox = card.querySelector('mat-chip-listbox');
    expect(listbox?.getAttribute('role')).toBe('listbox');
    expect(listbox?.getAttribute('aria-multiselectable')).toBe('false');
    expect(options().map((o) => o.textContent?.trim())).toEqual(DISCIPLINES);
    expect(selectedOptions().map((o) => o.textContent?.trim())).toEqual(['Solution architecture']);
    expect(options()[0].querySelector('button[role="option"]')?.getAttribute('aria-selected')).toBe(
      'true',
    );
    for (const option of options()) {
      expect(option.querySelector('.why__dot')).not.toBeNull();
    }
    expect(card.querySelector('.why__card-note')?.textContent?.trim()).toBe(
      'Combined per project — only the disciplines the work actually needs.',
    );
  });

  it("lists the selected discipline's reasons with two-digit ordinals", () => {
    expect(reasonTitles()).toEqual(ARCHITECTURE_REASONS);
    expect(
      Array.from(root.querySelectorAll('.why__number')).map((n) => n.textContent?.trim()),
    ).toEqual(['01', '02', '03', '04', '05']);
    expect(root.querySelector('.why__list')?.getAttribute('aria-live')).toBe('polite');
  });

  it('selecting another discipline moves the single active state and swaps the reasons', async () => {
    await chooseOption(4);
    expect(selectedOptions().map((o) => o.textContent?.trim())).toEqual(['AI engineering']);
    expect(options()[0].querySelector('button[role="option"]')?.getAttribute('aria-selected')).toBe(
      'false',
    );
    expect(reasonTitles()).toEqual([
      'Built into real processes',
      'Measurable and controllable',
      'Your data stays yours',
    ]);
    expect(
      Array.from(root.querySelectorAll('.why__number')).map((n) => n.textContent?.trim()),
    ).toEqual(['01', '02', '03']);

    await chooseOption(5);
    expect(selectedOptions().map((o) => o.textContent?.trim())).toEqual(['DevOps']);
    expect(reasonTitles()[0]).toBe('Releases become routine');
  });

  it('keeps the current discipline when the selected chip is clicked again', async () => {
    await chooseOption(0);
    expect(selectedOptions()).toHaveLength(1);
    expect(reasonTitles()).toEqual(ARCHITECTURE_REASONS);
  });

  it('re-renders in another locale', async () => {
    setLocale('ru');
    await fixture.whenStable();
    expect(root.querySelector('.why__eyebrow')?.textContent?.trim()).toBe('Почему Nexora');
    expect(reasonTitles()[0]).toBe('Senior и Senior+ инженеры');
    expect(options()[0].textContent?.trim()).toBe('Архитектура решений');
  });
});
