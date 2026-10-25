import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { ServiceCard, type ServiceCardCopy } from './service-card';

const ARROW_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M7 17L17 7" stroke="currentColor"/></svg>';

const COPY: ServiceCardCopy = {
  number: '08',
  title: 'AI Development & Integration',
  summary: 'Model API integrations, assistants, RAG and document intelligence.',
  tags: ['RAG', 'Assistants', 'Document AI'],
};

@Component({
  imports: [ServiceCard],
  template: `<app-service-card [copy]="copy()" />`,
})
class Host {
  readonly copy = signal<ServiceCardCopy>(COPY);
}

describe('ServiceCard', () => {
  let fixture: ComponentFixture<Host>;
  let http: HttpTestingController;
  let card: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideAppIcons()],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne('icons/arrow-up-right.svg').flush(ARROW_SVG);
    await fixture.whenStable();
    card = (fixture.nativeElement as HTMLElement).querySelector('app-service-card') as HTMLElement;
  });

  afterEach(() => http.verify());

  it('renders the ordinal, title, summary and every tag', () => {
    expect(card.querySelector('.service-card__number')?.textContent?.trim()).toBe('08');
    expect(card.querySelector('h3.service-card__title')?.textContent?.trim()).toBe(COPY.title);
    expect(card.querySelector('.service-card__summary')?.textContent?.trim()).toBe(COPY.summary);
    expect(
      Array.from(card.querySelectorAll('.service-card__tag')).map((t) => t.textContent?.trim()),
    ).toEqual(['RAG', 'Assistants', 'Document AI']);
  });

  it('is not interactive: the arrow is decoration, not a control', () => {
    expect(card.querySelectorAll('a, button')).toHaveLength(0);
    expect(card.querySelector('.service-card__arrow')?.getAttribute('aria-hidden')).toBe('true');
    expect(card.querySelector('.service-card__arrow mat-icon')).not.toBeNull();
  });

  it('renders an empty tag list without emitting stray items', async () => {
    fixture.componentInstance.copy.set({ ...COPY, tags: [] });
    await fixture.whenStable();
    expect(card.querySelectorAll('.service-card__tag')).toHaveLength(0);
    expect(card.querySelector('.service-card__tags')).not.toBeNull();
  });

  it('re-renders when the supplied copy changes', async () => {
    fixture.componentInstance.copy.set({ ...COPY, number: '10', title: 'Claude Engineering' });
    await fixture.whenStable();
    expect(card.querySelector('.service-card__number')?.textContent?.trim()).toBe('10');
    expect(card.querySelector('h3.service-card__title')?.textContent?.trim()).toBe(
      'Claude Engineering',
    );
  });
});
