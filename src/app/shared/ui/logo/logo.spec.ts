import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Logo } from './logo';

describe('Logo', () => {
  let fixture: ComponentFixture<Logo>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Logo] }).compileComponents();
    fixture = TestBed.createComponent(Logo);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('renders the lockup (mark + wordmark) by default', () => {
    const mark = host.querySelector<HTMLImageElement>('img.app-logo__mark');
    expect(mark?.getAttribute('src')).toBe('brand/mark.svg');
    expect(mark?.getAttribute('alt')).toBe('');
    expect(host.querySelector('svg.app-logo__wordmark')).not.toBeNull();
    expect(host.querySelectorAll('svg.app-logo__wordmark path')).toHaveLength(9);
    expect(host.getAttribute('data-variant')).toBe('lockup');
    expect(host.getAttribute('data-tone')).toBe('auto');
  });

  it('exposes a single accessible image named "Nexora"', () => {
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Nexora');
    expect(host.querySelector('img')?.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders only the mark for the mark variant', async () => {
    fixture.componentRef.setInput('variant', 'mark');
    await fixture.whenStable();
    expect(host.querySelector('img.app-logo__mark')).not.toBeNull();
    expect(host.querySelector('svg.app-logo__wordmark')).toBeNull();
    expect(host.getAttribute('data-variant')).toBe('mark');
  });

  it('binds the wordmark to currentColor and reflects the tone for the theme', async () => {
    for (const path of Array.from(host.querySelectorAll('svg.app-logo__wordmark path'))) {
      expect(path.getAttribute('fill')).toBe('currentColor');
    }
    fixture.componentRef.setInput('tone', 'dark');
    await fixture.whenStable();
    expect(host.getAttribute('data-tone')).toBe('dark');
  });
});
