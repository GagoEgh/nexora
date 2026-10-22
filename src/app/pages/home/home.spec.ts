import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { provideAppIcons } from '../../core/icons/provide-app-icons';
import { Home } from './home';

describe('Home', () => {
  it('renders the hero, then expertise, then why, then the what-we-build section', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter(routes),
        provideIntlayer(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    TestBed.inject(HttpTestingController)
      .match(() => true)
      .forEach((req) => req.flush('<svg xmlns="http://www.w3.org/2000/svg"></svg>'));

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('app-hero')).not.toBeNull();
    expect(root.querySelector('app-hero + app-expertise')).not.toBeNull();
    expect(root.querySelector('app-expertise + app-why')).not.toBeNull();
    expect(root.querySelector('app-why + app-what-we-build')).not.toBeNull();
    expect(root.querySelector('app-what-we-build + app-ai-automation')).not.toBeNull();
    expect(root.querySelector('app-ai-automation + app-how-we-work')).not.toBeNull();
    expect(root.querySelector('app-how-we-work + app-engagement-models')).not.toBeNull();
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    // Declares the shell layout contract that lets the hero run under the header.
    expect(root.getAttribute('data-layout')).toBe('immersive');
  });
});
