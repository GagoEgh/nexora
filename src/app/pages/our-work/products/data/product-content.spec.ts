import productContent from '../product.content';
import { PRODUCT_IDS } from './product-ids';
import { PRODUCT_META } from './product-meta';

/**
 * The dictionary read as data rather than through a rendered component: every product has to
 * carry every field in all three locales, because a missing translation does not fail the
 * build - it falls back to English and ships a half-translated card.
 *
 * The length budgets exist because both faces of a card share one grid cell, so every card in
 * a row is as tall as the longest copy in the current locale. Armenian and Russian run longer
 * than English, which is where an unbudgeted sentence shows up first.
 */

const LOCALES = ['en', 'hy', 'ru'] as const;
type Locale = (typeof LOCALES)[number];

/** `t({ en, hy, ru })` compiles to `{ nodeType: 'translation', translation: { … } }`. */
interface TranslationNode {
  readonly translation: Partial<Record<Locale, string>>;
}

const tr = (node: unknown): Partial<Record<Locale, string>> =>
  (node as TranslationNode).translation;

const copy = productContent.content;
const products = copy.products as unknown as Record<string, Record<string, unknown>>;

/** Fields every product carries as a single translated string. */
const TEXT_FIELDS = ['name', 'category', 'hook', 'summary', 'advantage', 'value', 'about'];

/** Per-field character ceilings, measured against the current copy with headroom. */
const BUDGETS: Record<string, number> = {
  hook: 140,
  summary: 170,
  advantage: 130,
};

const HIGHLIGHTS_PER_PRODUCT = 4;

describe('the product dictionary', () => {
  it('declares a key of its own', () => {
    // It previously collided with the home page's band, and the home copy won every shared
    // field in the built store.
    expect(productContent.key).toBe('our-work-products');
  });

  it('covers exactly the registered products, in registry order', () => {
    expect(Object.keys(products)).toEqual([...PRODUCT_IDS]);
  });

  it('names every archetype the registry actually uses', () => {
    const used = new Set(PRODUCT_IDS.map((id) => PRODUCT_META[id].archetype));
    const named = copy.archetypes as unknown as Record<string, unknown>;
    for (const archetype of used) {
      for (const locale of LOCALES) {
        expect(tr(named[archetype])[locale], `${archetype} in ${locale}`).toBeTruthy();
      }
    }
  });

  it.each(LOCALES)('gives every product every field in %s', (locale) => {
    for (const id of PRODUCT_IDS) {
      for (const field of TEXT_FIELDS) {
        const value = tr(products[id][field])[locale];
        expect(value, `${id}.${field} in ${locale}`).toBeTruthy();
        expect(value?.trim(), `${id}.${field} in ${locale}`).toBe(value);
      }
    }
  });

  it.each(LOCALES)('gives every product four highlights in %s', (locale) => {
    for (const id of PRODUCT_IDS) {
      const highlights = products[id]['highlights'] as readonly unknown[];
      expect(highlights, id).toHaveLength(HIGHLIGHTS_PER_PRODUCT);
      for (const [index, highlight] of highlights.entries()) {
        expect(tr(highlight)[locale], `${id}.highlights[${index}] in ${locale}`).toBeTruthy();
      }
    }
  });

  it.each(Object.entries(BUDGETS))(
    'keeps %s within %i characters in every locale',
    (field, max) => {
      for (const id of PRODUCT_IDS) {
        for (const locale of LOCALES) {
          const value = tr(products[id][field])[locale] ?? '';
          expect(value.length, `${id}.${field} in ${locale}: "${value}"`).toBeLessThanOrEqual(max);
        }
      }
    },
  );

  /**
   * The card front shows one sentence. Two sentences there wrap to a third line in Armenian and
   * push the grid row taller for every card beside it.
   */
  it('keeps the card hook to a single sentence', () => {
    for (const id of PRODUCT_IDS) {
      for (const locale of LOCALES) {
        const hook = tr(products[id]['hook'])[locale] ?? '';
        // `.` inside a decimal or an abbreviation is not a sentence break, so count only a
        // terminator followed by a space and a capital - plus the Armenian full stop.
        const breaks = [...hook.matchAll(/[.!?](?=\s+[A-ZА-ЯЁԱ-Ֆ])|։(?=\s)/g)];
        expect(breaks.length, `${id}.hook in ${locale}: "${hook}"`).toBe(0);
      }
    }
  });

  /**
   * A photograph with no description renders as `alt=""`, which tells assistive technology the
   * picture is decorative. This file used to accept that for a lone hero, on the reading that
   * the heading beside it already names the subject. It does not: the heading names the
   * product, while the picture shows a warehouse floor, a row of serums or a supermarket
   * aisle - and the same file is the card cover on the portfolio grid, where it is the only
   * visual a link carries. So every photograph is described, hero included.
   *
   * `ProductCopy.photoAlts` is required, so a product with no descriptions at all is a compile
   * error rather than a failure here. What this still catches is the quieter one: a photograph
   * added to `product-meta.ts` with no line added beside it, which leaves the array shorter
   * than the set it describes and the last picture silently unlabelled.
   */
  it('describes every photograph of every product', () => {
    for (const id of PRODUCT_IDS) {
      const photos = PRODUCT_META[id].photos.length;
      const alts = products[id]['photoAlts'] as readonly unknown[] | undefined;

      expect(alts, `${id} has ${photos} photographs and no descriptions`).toBeDefined();
      if (alts === undefined) {
        continue;
      }

      expect(alts.length, `${id} has ${photos} photographs`).toBe(photos);
      for (const [index, alt] of alts.entries()) {
        for (const locale of LOCALES) {
          const text = tr(alt)[locale] ?? '';
          expect(text, `${id}.photoAlts[${index}] in ${locale}`).toBeTruthy();
          // A description that repeats the product name tells a screen reader nothing the
          // heading has not already said.
          expect(
            text.trim().toLowerCase(),
            `${id}.photoAlts[${index}] in ${locale} is just the product name`,
          ).not.toBe((tr(products[id]['name'])[locale] ?? '').trim().toLowerCase());
        }
      }
    }
  });

  it('makes no authorship or ownership claim anywhere in the copy', () => {
    // Several of these products credit other studios publicly. The copy describes the work; it
    // does not say who owns it. This is the check that keeps a later edit from drifting.
    const claims = /\b(we built|we created|we developed|our client|built by us|our product)\b/i;
    for (const id of PRODUCT_IDS) {
      for (const field of TEXT_FIELDS) {
        const value = tr(products[id][field])['en'] ?? '';
        expect(claims.test(value), `${id}.${field}: "${value}"`).toBe(false);
      }
    }
  });
});
