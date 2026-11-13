import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { AboutProducts } from './about-products';

const LABELS = [
  'Our work',
  'Project Categories',
  'Solutions We Build',
  'Technology Approach',
  'Project Scope',
];

const VALUES = [
  'Web and mobile apps, business systems, e-commerce, and AI solutions.',
  'E-commerce, healthcare, finance, SaaS, automotive, marketing, entertainment, and business automation.',
  'Web platforms, business systems, data solutions, and AI.',
  'Performance, scalability, security, and seamless user experience.',
  'From websites to custom software and advanced digital products.',
];

const LABELS_RU = [
  'Наша работа',
  'Сферы проектов',
  'Наши IT-решения',
  'Наш подход',
  'Масштаб проектов',
];

describe('AboutProducts', () => {
  let fixture: ComponentFixture<AboutProducts>;
  let root: HTMLElement;

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  const text = (selector: string) =>
    Array.from(root.querySelectorAll(selector)).map((el) => el.textContent?.trim() ?? '');

  const render = async () => {
    fixture = TestBed.createComponent(AboutProducts);
    await fixture.whenStable();
    root = fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideIntlayer()] });
  });

  afterEach(() => {
    setLocale('en');
  });

  it('renders every row as a label and a value, in order', async () => {
    await render();

    expect(text('.glance__label')).toEqual(LABELS);
    expect(text('.glance__value')).toEqual(VALUES);
  });

  /**
   * The `dl` is what makes this band read as data rather than prose, so the structure is
   * asserted and not only the text: a `dt` that lost its `dd` is a different document.
   */
  it('keeps the definition-list structure the labels depend on', async () => {
    await render();

    expect(root.querySelector('dl.glance__rows')).not.toBeNull();
    expect(root.querySelectorAll('dt.glance__label')).toHaveLength(LABELS.length);
    expect(root.querySelectorAll('dd.glance__value')).toHaveLength(VALUES.length);
  });

  it('labels the section for assistive technology and hides the decorative mark', async () => {
    await render();

    const section = root.querySelector('section');
    expect(section?.getAttribute('aria-labelledby')).toBe('glance-title');
    expect(root.querySelector('#glance-title')?.textContent?.trim()).toBe('Nexora at a glance');
    // The heading beside it already names the band, so the mark carries no information.
    expect(root.querySelector('.glance__mark')?.getAttribute('alt')).toBe('');
  });

  /**
   * This dictionary previously declared `key: 'about-glance'`, which collided with the About
   * page's glance band and merged the two in the built store - the About copy won every shared
   * field. `Project Categories` exists only here; `Focus` only there.
   */
  it('reads its copy from its own dictionary, not the About glance one', async () => {
    await render();

    expect(text('.glance__label')).toContain('Project Categories');
    expect(text('.glance__label')).not.toContain('Focus');
  });

  it('translates every row', async () => {
    setLocale('ru');
    await render();

    expect(text('.glance__label')).toEqual(LABELS_RU);
  });
});
