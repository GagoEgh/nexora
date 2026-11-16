import { readFileSync } from 'node:fs';
import { locales } from 'intlayer';
import { SERVICE_CATEGORY_IDS } from './service-category';
import { SERVICE_VALUES } from '../../pages/contact/contact-form/contact-submitter';

/**
 * The five service categories are declared in two places and labelled in three.
 *
 * `SERVICE_CATEGORY_IDS` drives the catalogue and its filters. `SERVICE_VALUES` drives the
 * contact form's select and is pinned, in `contact-contract.spec.ts`, to the API contract -
 * deliberately a second, independent statement of what the endpoint accepts. Nothing tied the
 * two lists to each other, so a category could be added to the catalogue and never offered to
 * anyone trying to ask about it.
 *
 * The labels are written a third time: once per category on the services page, once per option
 * in the contact form, and once per link in the footer. Those three were allowed to drift, and
 * drift in the Armenian and Russian renderings is what the localisation findings came down to.
 *
 * `verify:translations` now guarantees that one English string renders one way per locale. This
 * covers the half it cannot: that all three sources use the *same* English label for the same
 * category in the first place, in every locale, and that each source covers exactly these five.
 *
 * Specs are exempt from the layering rules, which is why this one may reach into `pages/`.
 */

/** The resolved dictionary for a key, as `intlayer build` generates it. */
const dictionary = (key: string): Record<string, Record<string, unknown>> => {
  const path = `.intlayer/dictionary/${key}.json`;
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    throw new Error(`${path} is missing - run \`npm run pretypecheck\` to generate it`);
  }
  const translation = JSON.parse(raw).content?.translation;
  if (!translation) {
    throw new Error(`${path} has no translation node`);
  }
  return translation;
};

const services = dictionary('services');
const contactForm = dictionary('contact-form');
const footer = dictionary('footer');

/** `/services?category=<id>` is how a footer link names the category it opens. */
const footerPath = (id: string) => `/services?category=${id}`;

interface Option {
  readonly value: string;
  readonly label: string;
}
interface Link {
  readonly path: string;
  readonly label: string;
}

const categoryLabels = (locale: string, id: string) => {
  const categories = services[locale]?.['categories'] as
    Record<string, { label: string }> | undefined;
  const options = contactForm[locale]?.['serviceOptions'] as readonly Option[] | undefined;
  const columns = footer[locale]?.['columns'] as readonly { links?: readonly Link[] }[] | undefined;
  const links = (columns ?? []).flatMap((column) => column.links ?? []);

  return {
    services: categories?.[id]?.label,
    contactForm: options?.find((option) => option.value === id)?.label,
    footer: links.find((link) => link.path === footerPath(id))?.label,
  };
};

describe('the service taxonomy', () => {
  it('offers the contact form exactly the categories the catalogue declares', () => {
    // `''` is the form model's value before the visitor chooses; everything after it is a
    // category. Adding one to the catalogue without offering it here now fails.
    expect([...SERVICE_VALUES]).toEqual(['', ...SERVICE_CATEGORY_IDS]);
  });

  for (const locale of locales) {
    describe(`in ${locale}`, () => {
      it('labels every category identically in all three places', () => {
        for (const id of SERVICE_CATEGORY_IDS) {
          const labels = categoryLabels(locale, id);
          expect(labels.services, `${id} has no services-page label`).toBeTruthy();
          expect(labels.contactForm, `${id} is not offered by the contact form`).toBe(
            labels.services,
          );
          expect(labels.footer, `${id} is not linked from the footer`).toBe(labels.services);
        }
      });

      it('offers these five categories and no others', () => {
        const options = contactForm[locale]?.['serviceOptions'] as readonly Option[];
        expect(options.map((option) => option.value)).toEqual([...SERVICE_CATEGORY_IDS]);

        const categories = services[locale]?.['categories'] as Record<string, unknown>;
        expect(Object.keys(categories).sort()).toEqual([...SERVICE_CATEGORY_IDS].sort());
      });
    });
  }
});
