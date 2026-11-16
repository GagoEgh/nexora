import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { exit } from 'node:process';

export const DICTIONARY_DIR = '.intlayer/dictionary';
export const SOURCE_LOCALE = 'en';
export const TARGET_LOCALES = ['hy', 'ru'];
export const ABBREVIATION_FIELDS = ['shortLabel', 'eyebrowShort'];

export const DELIBERATE_DIVERGENCES = [
  {
    en: 'Mobile Applications',
    locales: ['hy', 'ru'],
    why:
      'Two lists that English names identically and the other two languages do not. ' +
      '`what-we-build` is headed "What we build" and names artefacts (SaaS Platforms, Web ' +
      'Applications), so it reads "mobile applications". `expertise` is headed "What we do" ' +
      'and names activities (UI/UX Design, AI Engineering & Automation), so it reads ' +
      '"development of mobile applications". Forcing one rendering would make one list wrong.',
  },
  {
    en: 'Team',
    locales: ['hy', 'ru'],
    why:
      'Two table rows with different senses. In `about-glance` the row answers who Nexora is ' +
      '("Senior and Senior+ engineers only"), so the label is plainly "team". In ' +
      '`engagement-models-comparison` the row answers how the team is put together per model ' +
      '("Assembled per project", "Specialists you direct"), so the label names its composition.',
  },
  {
    en: 'Engagement',
    locales: ['hy', 'ru'],
    why:
      'A navigation item beside a descriptive table row. `header` is one of eight top-level ' +
      'links and takes a short label; the `about-glance` row spells the formats out. Note the ' +
      'nav wording and the Engagement Models page title do not currently use the same term - ' +
      'that is brand copy, raised in the audit report rather than rewritten here.',
  },
];

export function forLocale(node, locale) {
  if (node === null || typeof node !== 'object') {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map((item) => forLocale(item, locale));
  }
  const record = /** @type {Record<string, any>} */ (node);
  if (record['nodeType'] === 'translation') {
    return forLocale(record['translation']?.[locale], locale);
  }
  if (record['nodeType'] === 'plural') {
    return { __plural: true };
  }
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const key of Object.keys(record)) {
    if (key === 'nodeType') {
      continue;
    }
    out[key] = forLocale(record[key], locale);
  }
  return out;
}

export function walkLeaves(source, targets, path, emit) {
  if (typeof source === 'string') {
    /** @type {Record<string, string>} */
    const rendered = {};
    for (const [locale, tree] of Object.entries(targets)) {
      if (typeof tree === 'string') {
        rendered[locale] = tree;
      }
    }
    emit({ path, source, targets: rendered });
    return;
  }
  if (Array.isArray(source)) {
    source.forEach((item, index) => {
      /** @type {Record<string, unknown>} */
      const next = {};
      for (const [locale, tree] of Object.entries(targets)) {
        next[locale] = Array.isArray(tree) ? tree[index] : undefined;
      }
      walkLeaves(item, next, `${path}[${index}]`, emit);
    });
    return;
  }
  if (source === null || typeof source !== 'object') {
    return;
  }
  for (const key of Object.keys(source)) {
    /** @type {Record<string, unknown>} */
    const next = {};
    for (const [locale, tree] of Object.entries(targets)) {
      next[locale] = tree && typeof tree === 'object' ? /** @type {any} */ (tree)[key] : undefined;
    }
    walkLeaves(/** @type {any} */ (source)[key], next, path ? `${path}.${key}` : key, emit);
  }
}

export function collectRenderings(dictionaries) {
  /** @type {Map<string, Map<string, Map<string, string[]>>>} */
  const byEnglish = new Map();

  for (const dictionary of dictionaries) {
    const source = forLocale(dictionary.content, SOURCE_LOCALE);
    /** @type {Record<string, unknown>} */
    const targets = {};
    for (const locale of TARGET_LOCALES) {
      targets[locale] = forLocale(dictionary.content, locale);
    }

    walkLeaves(source, targets, '', (leaf) => {
      const english = leaf.source.trim();
      if (english === '') {
        return;
      }
      const field = leaf.path.split('.').pop() ?? '';
      if (ABBREVIATION_FIELDS.includes(field)) {
        return;
      }
      let perLocale = byEnglish.get(english);
      if (!perLocale) {
        perLocale = new Map();
        byEnglish.set(english, perLocale);
      }
      for (const [locale, rendering] of Object.entries(leaf.targets)) {
        const trimmed = rendering.trim();
        if (trimmed === '') {
          continue;
        }
        let perRendering = perLocale.get(locale);
        if (!perRendering) {
          perRendering = new Map();
          perLocale.set(locale, perRendering);
        }
        const where = perRendering.get(trimmed) ?? [];
        where.push(`${dictionary.key}:${leaf.path}`);
        perRendering.set(trimmed, where);
      }
    });
  }

  return byEnglish;
}

/**
 * @param {Map<string, Map<string, Map<string, string[]>>>} renderings
 * @param {{ en: string, locales: string[], why: string }[]} [allowed]
 * @returns {{ en: string, locale: string, variants: { text: string, locations: string[] }[] }[]}
 */
export function divergences(renderings, allowed = DELIBERATE_DIVERGENCES) {
  /** @type {{ en: string, locale: string, variants: { text: string, locations: string[] }[] }[]} */
  const found = [];
  for (const [english, perLocale] of renderings) {
    for (const [locale, perRendering] of perLocale) {
      if (perRendering.size < 2) {
        continue;
      }
      if (allowed.some((entry) => entry.en === english && entry.locales.includes(locale))) {
        continue;
      }
      found.push({
        en: english,
        locale,
        variants: [...perRendering].map(([text, locations]) => ({ text, locations })),
      });
    }
  }
  return found.sort((a, b) => a.en.localeCompare(b.en) || a.locale.localeCompare(b.locale));
}

async function main() {
  /** @type {{ key: string, content: unknown }[]} */
  const dictionaries = [];
  /** @type {string[]} */
  let files;
  try {
    files = (await readdir(DICTIONARY_DIR)).filter((file) => file.endsWith('.json'));
  } catch {
    console.error(
      `[verify-translations] ${DICTIONARY_DIR} is not there; run \`npx intlayer build\` first`,
    );
    exit(1);
    return;
  }

  for (const file of files) {
    const parsed = JSON.parse(await readFile(join(DICTIONARY_DIR, file), 'utf8'));
    dictionaries.push({ key: parsed.key ?? file, content: parsed.content });
  }

  if (dictionaries.length === 0) {
    console.error(`[verify-translations] found no dictionaries in ${DICTIONARY_DIR}; vacuous`);
    exit(1);
    return;
  }

  const problems = divergences(collectRenderings(dictionaries));

  if (problems.length > 0) {
    console.error(
      `[verify-translations] ${problems.length} English string(s) render more than one way:`,
    );
    for (const problem of problems) {
      console.error(`\n  "${problem.en}"  [${problem.locale}]`);
      for (const variant of problem.variants) {
        console.error(`    - "${variant.text}"`);
        for (const location of variant.locations) {
          console.error(`        ${location}`);
        }
      }
    }
    console.error(
      '\n  Pick one rendering per string. A difference that is deliberate belongs in ' +
        'DELIBERATE_DIVERGENCES in scripts/verify-translations.mjs, with its reason.',
    );
    exit(1);
    return;
  }

  console.log(
    `[verify-translations] ${dictionaries.length} dictionaries, ` +
      `${collectRenderings(dictionaries).size} English strings, each rendered one way in ` +
      `${TARGET_LOCALES.join(' and ')}` +
      (DELIBERATE_DIVERGENCES.length > 0
        ? `, ${DELIBERATE_DIVERGENCES.length} deliberate exception(s)`
        : '') +
      '.',
  );
}

if (import.meta.filename === process.argv[1]) {
  await main();
}
