import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldLabel } from './field-label';

@Component({
  imports: [FieldLabel],
  template: `
    <app-field-label for="work-email">Work email</app-field-label>
    <input id="work-email" />
  `,
})
class Host {}

describe('FieldLabel', () => {
  let fixture: ComponentFixture<Host>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('renders a native label associated with the control', () => {
    const label = root.querySelector('app-field-label label') as HTMLLabelElement;
    expect(label).not.toBeNull();
    expect(label.getAttribute('for')).toBe('work-email');
    expect(label.textContent?.trim()).toBe('Work email');
    expect(label.control).toBe(root.querySelector('#work-email'));
  });

  it('stays visible to assistive technology', () => {
    const host = root.querySelector('app-field-label') as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBeNull();
    expect(host.getAttribute('role')).toBeNull();
  });
});
