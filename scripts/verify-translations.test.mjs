import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ABBREVIATION_FIELDS,
  DELIBERATE_DIVERGENCES,
  collectRenderings,
  divergences,
  forLocale,
  walkLeaves,
} from './verify-translations.mjs';

/**
 * The checker's logic, exercised against made-up dictionaries. The real ones are checked by
 * `npm run verify:translations`; these pin what each rule catches, so a rule cannot be weakened
 * into silence without a test going red.
 */

/** Builds a dictionary in the shape intlayer generates: one translation node at the root. */
/**
 * @param {string} key
 * @param {Record<string, unknown>} perLocale
 * @returns {{ key: string, content: unknown }}
 */
const dictionary = (key, perLocale) => ({
  key,
  content: { nodeType: 'translation', translation: perLocale },
});

describe('verify-translations', () => {
  it('resolves a translation node down to one locale', () => {
    const content = { nodeType: 'translation', translation: { en: { a: 'A' }, hy: { a: 'Ա' } } };
    assert.deepEqual(forLocale(content, 'hy'), { a: 'Ա' });
  });

  it('leaves a plural node opaque, because plural categories differ by language', () => {
    // Russian carries `few` and `many` where English carries neither, so the forms are not
    // comparable string-for-string and must not be reported as a divergence.
    const content = {
      nodeType: 'translation',
      translation: { ru: { n: { nodeType: 'plural', plural: { one: 'x', few: 'y' } } } },
    };
    assert.deepEqual(forLocale(content, 'ru'), { n: { __plural: true } });
  });

  it('walks nested objects and arrays in step across locales', () => {
    /** @type {{ path: string, source: string, targets: Record<string, string> }[]} */
    const seen = [];
    walkLeaves(
      { a: 'A', list: ['one', 'two'] },
      { ru: { a: 'А', list: ['один', 'два'] } },
      '',
      (leaf) => seen.push(leaf),
    );
    assert.deepEqual(
      seen.map((leaf) => [leaf.path, leaf.source, leaf.targets['ru']]),
      [
        ['a', 'A', 'А'],
        ['list[0]', 'one', 'один'],
        ['list[1]', 'two', 'два'],
      ],
    );
  });

  it('passes a string rendered the same way everywhere', () => {
    const dictionaries = [
      dictionary('one', { en: { cta: 'Contact us' }, ru: { cta: 'Свяжитесь с нами' } }),
      dictionary('two', { en: { link: 'Contact us' }, ru: { link: 'Свяжитесь с нами' } }),
    ];
    assert.deepEqual(divergences(collectRenderings(dictionaries), []), []);
  });

  it('catches one English string rendered two ways, and names both locations', () => {
    const dictionaries = [
      dictionary('one', { en: { cta: 'Contact us' }, ru: { cta: 'Свяжитесь с нами' } }),
      dictionary('two', { en: { link: 'Contact us' }, ru: { link: 'Напишите нам' } }),
    ];
    const found = divergences(collectRenderings(dictionaries), []);
    assert.equal(found.length, 1);
    assert.equal(found[0].en, 'Contact us');
    assert.equal(found[0].locale, 'ru');
    assert.deepEqual(
      found[0].variants
        .map((variant) => variant.locations)
        .flat()
        .sort(),
      ['one:cta', 'two:link'],
    );
  });

  it('reports each locale separately, so a string can be sound in one and not the other', () => {
    const dictionaries = [
      dictionary('one', { en: { a: 'Team' }, hy: { a: 'Թիմ' }, ru: { a: 'Команда' } }),
      dictionary('two', { en: { b: 'Team' }, hy: { b: 'Թիմ' }, ru: { b: 'Состав' } }),
    ];
    const found = divergences(collectRenderings(dictionaries), []);
    assert.deepEqual(
      found.map((item) => item.locale),
      ['ru'],
    );
  });

  it('stays silent on a divergence that is listed as deliberate', () => {
    const dictionaries = [
      dictionary('one', { en: { a: 'Team' }, ru: { a: 'Команда' } }),
      dictionary('two', { en: { b: 'Team' }, ru: { b: 'Состав команды' } }),
    ];
    const allowed = [{ en: 'Team', locales: ['ru'], why: 'two different senses' }];
    assert.deepEqual(divergences(collectRenderings(dictionaries), allowed), []);
  });

  it('still reports a locale the allowlist entry does not name', () => {
    const dictionaries = [
      dictionary('one', { en: { a: 'Team' }, hy: { a: 'Թիմ' }, ru: { a: 'Команда' } }),
      dictionary('two', { en: { b: 'Team' }, hy: { b: 'Կազմ' }, ru: { b: 'Состав' } }),
    ];
    const allowed = [{ en: 'Team', locales: ['ru'], why: 'only Russian was decided' }];
    const found = divergences(collectRenderings(dictionaries), allowed);
    assert.deepEqual(
      found.map((item) => item.locale),
      ['hy'],
    );
  });

  it('ignores the deliberate short-form fields', () => {
    // `shortLabel` exists to hold an abbreviation. English is usually already short enough that
    // it repeats the long label, so comparing the two would report the feature working.
    const dictionaries = [
      dictionary('tile', {
        en: { label: 'Web App', shortLabel: 'Web App' },
        ru: { label: 'Веб-приложение', shortLabel: 'Веб' },
      }),
    ];
    assert.deepEqual(divergences(collectRenderings(dictionaries), []), []);
  });

  it('skips an empty string rather than grouping every blank together', () => {
    const dictionaries = [
      dictionary('one', { en: { a: '' }, ru: { a: '' } }),
      dictionary('two', { en: { b: '' }, ru: { b: 'что-то' } }),
    ];
    assert.deepEqual(divergences(collectRenderings(dictionaries), []), []);
  });

  it('declares its abbreviation fields and keeps every exception justified', () => {
    assert.ok(ABBREVIATION_FIELDS.includes('shortLabel'));
    for (const entry of DELIBERATE_DIVERGENCES) {
      assert.ok(entry.en.length > 0, 'an exception names the English string');
      assert.ok(entry.locales.length > 0, `${entry.en} names the locales it excuses`);
      assert.ok(entry.why.length > 40, `${entry.en} carries a real reason, not a shrug`);
    }
  });
});
