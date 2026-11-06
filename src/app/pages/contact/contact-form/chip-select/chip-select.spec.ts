import { Component, signal, viewChild } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { type Interest, INTEREST_VALUES } from '../contact-submitter';
import { ChipSelect, type ChipOption } from './chip-select';

/**
 * Material's chip actions test `event.keyCode`, which a plain `new KeyboardEvent` leaves at 0 -
 * so an event built without it is ignored and any assertion about it would pass vacuously.
 * `keyCode` is not a `KeyboardEventInit` member, so it is defined the way the CDK's own test
 * helpers define it.
 */
const keyboardEvent = (key: string, keyCode: number): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  Object.defineProperty(event, 'keyCode', { get: () => keyCode });
  return event;
};

const ENTER = 13;
const SPACE = 32;
const ARROW_RIGHT = 39;
const ARROW_LEFT = 37;

const OPTIONS: readonly ChipOption[] = [
  { value: 'new-project', label: 'A new project' },
  { value: 'dedicated-team', label: 'A dedicated team' },
  { value: 'partnership', label: 'A partnership' },
];

@Component({
  imports: [ChipSelect],
  template: `
    <span id="host-label">Interest</span>
    <app-chip-select [field]="form.interest" [options]="options" labelledBy="host-label" />
  `,
})
class Host {
  /**
   * `interest` is the `Interest` union, while `ChipSelect.field` is declared `Field<string>`.
   * That this template compiles at all is the point of `accepts a narrower field than it
   * declares` below: TypeScript method parameters are bivariant, so a `Field<Interest>` is
   * assignable to a `Field<string>`. The options list is what keeps that sound in practice.
   */
  readonly model = signal<{ interest: Interest }>({ interest: 'new-project' });
  // No schema: this spec exercises the control, not validation.
  readonly form = form(this.model);
  readonly options = OPTIONS;
  readonly chips = viewChild.required(ChipSelect);
}

describe('ChipSelect', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let root: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  /**
   * Material puts the accessible option on a `button[role=option]` *inside* each
   * `mat-chip-option` - the custom element itself is `role="presentation"` and carries no
   * `aria-selected`. So both reading selection and choosing an option go through the button.
   */
  const options = () => Array.from(root.querySelectorAll<HTMLButtonElement>('[role="option"]'));

  it('renders one chip per option, in order, with the given labels', () => {
    expect(options().map((option) => option.textContent?.trim())).toEqual(
      OPTIONS.map((option) => option.label),
    );
  });

  it('names the listbox by reference rather than with a label element', () => {
    const listbox = root.querySelector('mat-chip-listbox');
    expect(listbox?.getAttribute('aria-labelledby')).toBe('host-label');
    expect(root.querySelector('label')).toBeNull();
  });

  it('shows the field value as the selected chip without being told twice', async () => {
    // Only `[field]` is bound - there is no second binding for selection, so this is the proof
    // that the listbox reads its state from the field.
    host.model.set({ interest: 'partnership' });
    await fixture.whenStable();

    const selected = options().filter((option) => option.ariaSelected === 'true');
    expect(selected).toHaveLength(1);
    expect(selected[0].textContent?.trim()).toBe('A partnership');
  });

  it('writes a chosen chip back through the field to the model', async () => {
    options()[1].click();
    await fixture.whenStable();

    expect(host.model().interest).toBe('dedicated-team');
    expect(host.form.interest().value()).toBe('dedicated-team');
  });

  it('only ever writes a value the union allows', async () => {
    // The soundness guard for the bivariance above: every value the component can produce comes
    // from `options`, so a `Field<Interest>` can only ever receive an `Interest`.
    for (const option of [...OPTIONS].reverse()) {
      options()[OPTIONS.indexOf(option)].click();
      await fixture.whenStable();

      expect(host.model().interest).toBe(option.value);
      expect(INTEREST_VALUES as readonly string[]).toContain(host.model().interest);
    }
  });

  /**
   * CT-11. Material toggles a chip on every activation, so activating the chosen one used to
   * deselect it and write `undefined` through the value accessor - and Signal Forms answers an
   * `undefined` write by removing the key, which takes `form.<field>` with it. The model went
   * from `{"interest":"new-project"}` to `{}` and the next render threw
   * `TypeError: ctx.form.interest is not a function`.
   */
  describe('a mandatory single choice cannot be cleared', () => {
    it('keeps the choice when the chosen chip is clicked again', async () => {
      const chosen = options().find((option) => option.ariaSelected === 'true');
      expect(chosen?.textContent?.trim()).toBe('A new project');

      chosen!.click();
      await fixture.whenStable();

      expect(host.model()).toEqual({ interest: 'new-project' });
      expect(typeof host.form.interest).toBe('function');
      expect(host.form.interest().value()).toBe('new-project');
      expect(options().filter((option) => option.ariaSelected === 'true')).toHaveLength(1);
    });

    it('keeps the choice when the chosen chip is activated from the keyboard', async () => {
      const chosen = options().find((option) => option.ariaSelected === 'true');

      for (const [key, keyCode] of [
        ['Enter', ENTER],
        [' ', SPACE],
      ] as const) {
        chosen!.dispatchEvent(keyboardEvent(key, keyCode));
        await fixture.whenStable();
      }

      expect(host.model()).toEqual({ interest: 'new-project' });
      expect(host.form.interest().value()).toBe('new-project');
    });

    it('refuses an activation that carries only the keyCode Material reads', async () => {
      // Material's chip actions test `event.keyCode`, not `event.key` (`chips.mjs:144`), so an
      // event with no `key` still toggles the chip. A guard that only looked at `key` would let
      // this through - which is the shape of event that made two of the tests above vacuous.
      const chosen = options().find((option) => option.ariaSelected === 'true');
      chosen!.dispatchEvent(keyboardEvent('', SPACE));
      await fixture.whenStable();

      expect(host.model()).toEqual({ interest: 'new-project' });
      expect(host.form.interest().value()).toBe('new-project');
    });

    it('keeps the selected chip reachable and announced as selected', () => {
      // The alternative fix - marking the chosen chip `[selectable]="false"` - would have made
      // Material drop `aria-selected` entirely (`chips.mjs:885`). This asserts it did not.
      const chosen = options().find((option) => option.ariaSelected === 'true');
      expect(chosen?.getAttribute('aria-selected')).toBe('true');
      expect(chosen?.getAttribute('aria-disabled')).toBe('false');
    });

    it('still lets an unselected chip be chosen from the keyboard', async () => {
      const other = options()[1];
      other.dispatchEvent(keyboardEvent(' ', SPACE));
      await fixture.whenStable();

      expect(host.model().interest).toBe('dedicated-team');
    });

    it('does not swallow the keys the listbox navigates with', async () => {
      // Arrow keys must still reach Material's key manager, so only activation is intercepted.
      let reachedListbox = 0;
      const listbox = root.querySelector('mat-chip-listbox')!;
      listbox.addEventListener('keydown', () => (reachedListbox += 1));

      options()[0].dispatchEvent(keyboardEvent('ArrowRight', ARROW_RIGHT));
      options()[0].dispatchEvent(keyboardEvent('ArrowLeft', ARROW_LEFT));
      await fixture.whenStable();

      expect(reachedListbox).toBe(2);
    });
  });

  it('moves focus into the listbox when asked, which is how its label works', async () => {
    host.chips().focus();
    await fixture.whenStable();

    const active = root.ownerDocument.activeElement;
    expect(active).not.toBeNull();
    expect(root.querySelector('mat-chip-listbox')?.contains(active)).toBe(true);
    expect(active?.getAttribute('role')).toBe('option');
  });
});
