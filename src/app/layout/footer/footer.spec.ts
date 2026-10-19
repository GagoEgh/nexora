import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { routes } from '../../app.routes';
import { Footer } from './footer';

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter(routes), provideIntlayer()],
    }).compileComponents();
    fixture = TestBed.createComponent(Footer);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders the brand column, four link columns and the pending contact note', () => {
    expect(root.querySelector('app-logo')).not.toBeNull();
    expect(root.querySelector('.footer__tagline')?.textContent?.trim()).toBe(
      'Engineering the next',
    );

    const headings = Array.from(root.querySelectorAll('.footer__heading')).map((h) =>
      h.textContent?.trim(),
    );
    expect(headings).toEqual(['Services', 'Solutions', 'Company', 'Get in touch']);

    const columnLinks = Array.from(root.querySelectorAll('.footer__column a.footer__link'));
    expect(columnLinks).toHaveLength(17);
    expect(columnLinks[0].textContent?.trim()).toBe('Software Engineering');
    expect(columnLinks[0].getAttribute('href')).toBe('/services');
    expect(columnLinks.at(-1)?.textContent?.trim()).toBe('Become a partner');

    const pending = root.querySelector('.footer__muted');
    expect(pending?.textContent?.trim()).toBe('Contact details — pending');
    expect(pending?.querySelector('a')).toBeNull();
  });

  it('shows the legal links and the current year', () => {
    const legal = Array.from(root.querySelectorAll('.footer__legal a.footer__link'));
    expect(legal.map((a) => a.getAttribute('href'))).toEqual(['/privacy-policy', '/terms-of-use']);
    expect(root.querySelector('.footer__copyright')?.textContent).toContain(
      `© ${new Date().getFullYear()} Nexora. All rights reserved.`,
    );
  });

  it('switches the locale from the language buttons and re-renders', async () => {
    const buttons = () => Array.from(root.querySelectorAll<HTMLButtonElement>('.footer__language'));
    expect(buttons().map((b) => b.textContent?.trim())).toEqual(['English', 'Հայերեն', 'Русский']);
    expect(buttons().map((b) => b.getAttribute('aria-current'))).toEqual(['true', null, null]);

    buttons()[2].click();
    await fixture.whenStable();
    expect(buttons().map((b) => b.getAttribute('aria-current'))).toEqual([null, null, 'true']);
    expect(root.querySelector('.footer__heading')?.textContent?.trim()).toBe('Услуги');
    expect(root.querySelector('.footer__copyright')?.textContent).toContain('Все права защищены.');
  });
});
