import { readFileSync, readdirSync } from 'node:fs';

/**
 * Dictionary keys are a global namespace.
 *
 * Intlayer merges every `*.content.ts` that declares the same `key` into one dictionary, and
 * the merge is silent: three pages of the `our-work` feature shipped declaring `key: 'about'`,
 * `'about-glance'` and `'expertise'` - copied along with the files they were cloned from - and
 * the build quietly turned 53 content files into 50 dictionaries, with the About and home copy
 * winning every field the pairs had in common.
 *
 * Nothing caught it because `useDictionary(ourWorkContent)` is handed the module object, so the
 * pages still rendered their own text; only the built store, the generated types and anything
 * that looks a dictionary up *by key* saw the collision. That is a fault that would have
 * surfaced first in the translation tooling, which is the worst place to find it.
 *
 * So the invariant is asserted at the source: one key, one file.
 */

/** Every `key: '...'` declared by a `*.content.ts` file under `root`, with its file. */
function declaredKeys(root: string): { key: string; file: string }[] {
  const found: { key: string; file: string }[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = `${root}/${entry.name}`;

    if (entry.isDirectory()) {
      found.push(...declaredKeys(path));
      continue;
    }
    if (!entry.name.endsWith('.content.ts')) {
      continue;
    }

    const source = readFileSync(path, 'utf8');
    // The dictionary's own `key`, which sits at the top level of the default export. Nested
    // `key:` properties would be indented further, so the two-space prefix is what selects it.
    for (const match of source.matchAll(/^ {2}key: '([^']+)',$/gm)) {
      found.push({ key: match[1], file: path });
    }
  }

  return found;
}

const KEYS = declaredKeys('src/app');

describe('intlayer dictionary keys', () => {
  it('finds a key in every content file', () => {
    // Guards the regex: a format change that stopped matching would make the duplicate check
    // below pass against an empty list.
    const files = new Set(KEYS.map((entry) => entry.file));
    expect(KEYS.length).toBeGreaterThan(0);
    expect(files.size, 'a *.content.ts file declares no key, or declares two').toBe(KEYS.length);
  });

  it('never declares the same key in two files', () => {
    const byKey = new Map<string, string[]>();
    for (const { key, file } of KEYS) {
      byKey.set(key, [...(byKey.get(key) ?? []), file]);
    }

    const collisions = [...byKey.entries()]
      .filter(([, files]) => files.length > 1)
      .map(([key, files]) => `'${key}' in ${files.join(' and ')}`);

    expect(collisions, 'these dictionaries would be merged into one').toEqual([]);
  });
});
