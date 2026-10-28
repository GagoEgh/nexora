import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Reveal } from './reveal';

/**
 * A stand-in for the real observer, so the directive's contract can be driven directly:
 * what it observes, when it reveals, and whether it lets go afterwards.
 */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly observed: Element[] = [];
  disconnectCalls = 0;

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  disconnect(): void {
    this.disconnectCalls += 1;
  }

  enter(): void {
    this.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }

  leave(): void {
    this.callback(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

@Component({
  imports: [Reveal],
  template: `<section appReveal>scroll</section>`,
})
class ScrollHost {}

@Component({
  imports: [Reveal],
  template: `<section appReveal="load">load</section>`,
})
class LoadHost {}

/** Two animation frames: what the directive waits for before flipping the attribute. */
const frames = () =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

describe('Reveal', () => {
  let original: typeof IntersectionObserver | undefined;

  const create = async <T>(host: new () => T): Promise<ComponentFixture<T>> => {
    const fixture = TestBed.createComponent(host);
    await fixture.whenStable();
    return fixture;
  };

  const section = (fixture: ComponentFixture<unknown>): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('section') as HTMLElement;

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    original = window.IntersectionObserver;
    window.IntersectionObserver =
      FakeIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    if (original) {
      window.IntersectionObserver = original;
    } else {
      delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
    }
  });

  it('marks the element as pending and observes it', async () => {
    const fixture = await create(ScrollHost);

    expect(section(fixture).getAttribute('data-reveal')).toBe('out');
    expect(FakeIntersectionObserver.instances).toHaveLength(1);
    expect(FakeIntersectionObserver.instances[0].observed).toEqual([section(fixture)]);
  });

  it('reveals when the element enters the viewport', async () => {
    const fixture = await create(ScrollHost);

    FakeIntersectionObserver.instances[0].enter();

    // The reveal is deferred by two frames so the browser paints the hidden state first;
    // flipping the attribute in the same frame would skip the transition entirely.
    expect(section(fixture).getAttribute('data-reveal')).toBe('out');
    await frames();

    expect(section(fixture).getAttribute('data-reveal')).toBe('in');
  });

  it('stays pending while the element is out of view', async () => {
    const fixture = await create(ScrollHost);

    FakeIntersectionObserver.instances[0].leave();

    expect(section(fixture).getAttribute('data-reveal')).toBe('out');
  });

  /** Reveals are one-way: scrolling back past an element must not replay it. */
  it('disconnects after the first reveal', async () => {
    await create(ScrollHost);
    const observer = FakeIntersectionObserver.instances[0];

    observer.enter();

    expect(observer.disconnectCalls).toBe(1);
  });

  it('disconnects when the host is destroyed', async () => {
    const fixture = await create(ScrollHost);
    const observer = FakeIntersectionObserver.instances[0];

    fixture.destroy();

    expect(observer.disconnectCalls).toBeGreaterThanOrEqual(1);
  });

  it('reveals without an observer when asked to run on load', async () => {
    const fixture = await create(LoadHost);

    expect(FakeIntersectionObserver.instances).toHaveLength(0);
    expect(section(fixture).getAttribute('data-reveal')).toBe('out');

    await frames();

    expect(section(fixture).getAttribute('data-reveal')).toBe('in');
  });

  /**
   * The page is prerendered, so the hidden state must never be applied unless this directive
   * is in a position to take it back off again.
   */
  it('leaves the element untouched where IntersectionObserver is unavailable', async () => {
    delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;

    const fixture = await create(ScrollHost);

    expect(section(fixture).hasAttribute('data-reveal')).toBe(false);
  });
});
