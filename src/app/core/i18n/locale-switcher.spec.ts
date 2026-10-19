import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { useLocaleSwitcher } from './locale-switcher';

describe('useLocaleSwitcher', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideIntlayer()],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.runInInjectionContext(() => useLocale()).setLocale('en');
  });

  it('moves the current route under the new prefix without letting the router scroll', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/services?ref=footer');
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl');

    const switcher = TestBed.runInInjectionContext(() => useLocaleSwitcher());
    await switcher.switchTo('ru');

    expect(router.url).toBe('/ru/services?ref=footer');
    expect(switcher.locale()).toBe('ru');
    expect(navigateByUrl).toHaveBeenCalledWith('/ru/services?ref=footer', { scroll: 'manual' });
  });
});
