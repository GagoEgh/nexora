import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { App } from './app';
import { routes } from './app.routes';
import { provideAppIcons } from './core/icons/provide-app-icons';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M4 6H20" stroke="#0B1324"/></svg>';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    TestBed.inject(HttpTestingController)
      .match(() => true)
      .forEach((req) => req.flush(ICON_SVG));
    await fixture.whenStable();
  });

  afterEach(() => {
    TestBed.runInInjectionContext(() => useLocale()).setLocale('en');
  });

  it('renders the shell: header, routed main content, footer', () => {
    expect(root.querySelector('app-header')).not.toBeNull();
    expect(root.querySelector('main.app__main router-outlet')).not.toBeNull();
    expect(root.querySelector('app-footer')).not.toBeNull();
  });

  it('mirrors the active locale on the document language', async () => {
    expect(document.documentElement.lang).toBe('en');
    TestBed.runInInjectionContext(() => useLocale()).setLocale('hy');
    await fixture.whenStable();
    expect(document.documentElement.lang).toBe('hy');
  });
});
