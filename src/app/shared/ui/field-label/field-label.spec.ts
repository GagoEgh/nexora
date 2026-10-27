import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldLabel } from './field-label';

@Component({
  imports: [FieldLabel],
  template: `
    <app-field-label for="work-email" (activate)="activations.set(activations() + 1)">
      Work email
    </app-field-label>
    <input id="work-email" />
  `,
})
class LabelableHost {
  readonly activations = signal(0);
}

@Component({
  imports: [FieldLabel],
  template: `
    <app-field-label labelId="interest-label" (activate)="activations.set(activations() + 1)">
      I’m interested in
    </app-field-label>
    <div id="interest" role="listbox" aria-labelledby="interest-label"></div>
  `,
})
class ReferencedHost {
  readonly activations = signal(0);
}

describe('FieldLabel', () => {
  const create = async <T>(host: new () => T): Promise<ComponentFixture<T>> => {
    await TestBed.configureTestingModule({ imports: [host] }).compileComponents();
    const fixture = TestBed.createComponent(host);
    await fixture.whenStable();
    return fixture;
  };

  afterEach(() => TestBed.resetTestingModule());

  describe('for a labelable control', () => {
    let fixture: ComponentFixture<LabelableHost>;
    let root: HTMLElement;

    beforeEach(async () => {
      fixture = await create(LabelableHost);
      root = fixture.nativeElement as HTMLElement;
    });

    it('renders a native label associated with the control', () => {
      const label = root.querySelector('app-field-label label') as HTMLLabelElement;
      expect(label).not.toBeNull();
      expect(label.getAttribute('for')).toBe('work-email');
      expect(label.textContent?.trim()).toBe('Work email');
      expect(label.control).toBe(root.querySelector('#work-email'));
    });

    it('leaves click handling to the browser', () => {
      (root.querySelector('app-field-label') as HTMLElement).click();
      expect(fixture.componentInstance.activations()).toBe(0);
    });

    it('stays visible to assistive technology', () => {
      const host = root.querySelector('app-field-label') as HTMLElement;
      expect(host.getAttribute('aria-hidden')).toBeNull();
      expect(host.getAttribute('role')).toBeNull();
    });
  });

  describe('for a control named by reference', () => {
    let fixture: ComponentFixture<ReferencedHost>;
    let root: HTMLElement;

    beforeEach(async () => {
      fixture = await create(ReferencedHost);
      root = fixture.nativeElement as HTMLElement;
    });

    it('carries the id the control points at, and no dangling for', () => {
      const label = root.querySelector('app-field-label label') as HTMLLabelElement;
      expect(label.getAttribute('id')).toBe('interest-label');
      expect(label.getAttribute('for')).toBeNull();
      expect(root.querySelector('[aria-labelledby="interest-label"]')).not.toBeNull();
    });

    it('asks its owner to focus the control when clicked', () => {
      (root.querySelector('app-field-label') as HTMLElement).click();
      expect(fixture.componentInstance.activations()).toBe(1);
    });
  });
});
