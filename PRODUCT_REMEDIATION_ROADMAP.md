# `app-product` — Remediation Roadmap

**Companion to:** `PRODUCT_TECHNICAL_AUDIT.md` and `PRODUCT_VERIFICATION_CHECKLIST.md`
**Date:** 2026-11-14
**Branch:** `main` · **HEAD:** `f766248`
**Posture:** the image restoration is **done** (§1). What follows is targeted repair of a sound implementation. **No rewrite is proposed**, and nothing below reverses the restoration.

---

## 0. Guiding constraints

1. **No new npm dependencies.** Every step below uses what is already installed — `sharp`, `prettier`, `stylelint`, `dependency-cruiser`, Playwright, Vitest.
2. **No image is ever regenerated, downloaded or substituted.** The nineteen photographs in `public/images` are the project's own, restored from `f766248`. Re-encoding one (**2.4**) is an optimisation of that exact file and must be reversible from Git.
3. **Nothing changes a published URL.** The nineteen slugs, `/our_work` and the locale prefixes are public contracts in 87 prerendered routes and a sitemap.
4. **No test is weakened to make a change pass.** Where a test asserted the pre-restoration behaviour it was rewritten to assert the new intent, and each new assertion fails against the old code.
5. **Each phase ends green:** `npm run typecheck && npm run lint && npm test && npm run build && npm run e2e`.
6. **Unrelated working-tree changes are preserved.** The tree carries a substantial amount of uncommitted work; every step below is path-scoped.

---

## 1. Completed — the image restoration

| Step                                           | Status | Evidence                                                                                             |
| ---------------------------------------------- | :----: | ---------------------------------------------------------------------------------------------------- |
| Identify when the images changed               |   ✅   | `1b67612` added JPEG/PNG; `f766248` converted to WebP; the working tree deleted all 19 (uncommitted) |
| Identify the original files and their paths    |   ✅   | 19 × `public/images/*.webp`, tracked at `HEAD`                                                       |
| Restore them, path-scoped                      |   ✅   | `git checkout HEAD -- public/images/<19 files>`; no `reset`, no branch checkout, no unrelated path   |
| Verify each matches the original byte for byte |   ✅   | `git hash-object` == `git rev-parse HEAD:<path>` for all 19; `git status -- public/images/` clean    |
| Preserve the product-to-image mapping          |   ✅   | Re-derived by joining on each product's live URL; 1:1, 19/19, no duplicates, no leftovers            |
| Wire the card to them                          |   ✅   | `ProductMeta.photo` → `ProductView.cardImage` → `project-card.html`                                  |
| Verify the paths resolve and render            |   ✅   | 19/19 HTTP 200 `image/webp`; 19/19 `naturalWidth` > 0; declared dimensions == intrinsic for all 19   |

**Nothing in this phase is outstanding.** One image could not be matched by URL — `connected-car`, because the original repeated `sell-me-watch`'s URL — and was matched on title instead, with the codebase's own comment (`product-meta.ts:166-167`) independently recording the duplicate. That is resolved, not open.

---

## 2. Phase 1 — Close the gaps the restoration exposed

Four small, independent changes. Land them in any order, ideally as separate commits. **These exist because the restoration moved the card onto a directory that no gate was watching.**

### 2.1 — PRD-IMG-05: bring `public/images` under `verify:images` _(do this first)_

**File:** `scripts/verify-images.mjs`

Add a second pass driven by the registry rather than by the directory, so the check fails on the exact scenario that prompted this task — a deleted photograph:

```js
export const PHOTO_DIR = 'public/images';

/** Every photo file the product registry names, in file order. */
export function referencedPhotos(source) {
  return [...source.matchAll(/file:\s*'([^']+\.webp)'/g)].map((m) => m[1]);
}
```

Assert for each: the file exists, its extension is `.webp`, and its size is within `MAX_IMAGE_BYTES` (already 120 kB; the largest photo is `car.webp` at 108.0 kB, so the existing budget fits without being loosened).

**Do this before 2.2 and 2.4** — it is the regression net both of those changes will be checked against.

**Acceptance**

- Deleting any one of the nineteen photographs fails `npm run verify:images`, naming that file.
- Renaming a `photo.file` in the registry without moving the file fails the same way.
- The existing generated-art pass is unchanged, and its summary line still reports 19 products / 38 images.

**Risk:** very low. The script has its own unit tests (`scripts/verify-images.test.mjs`) and the new pass is additive.

### 2.2 — PRD-IMG-01: make a mistyped photo name a compile error

**File:** `src/app/pages/our-work/products/data/product-meta.ts`

Close the one unguarded identifier in a registry that guards every other one:

```ts
export const PRODUCT_PHOTOS = [
  'car.webp',
  'got.webp',
  'infiniti.webp',
  /* … 19 in total … */ 'zadeh.webp',
] as const;

export type ProductPhotoFile = (typeof PRODUCT_PHOTOS)[number];

export interface ProductPhoto {
  readonly file: ProductPhotoFile;
  readonly width: number;
  readonly height: number;
}
```

This is the same pattern as `PRODUCT_IDS` → `ProductId` and `ARCHETYPE_ICONS` → `AppIconName`, so it introduces no new idea.

**Depends on 2.1**, which should additionally assert that `PRODUCT_PHOTOS` and the contents of `public/images` are the same set — otherwise the tuple can drift from the directory in the other direction.

**Acceptance**

- Changing one entry to `'medcal.webp'` fails `npm run typecheck`.
- `products.spec.ts`'s mapping test passes unchanged.
- No `as` cast is introduced anywhere to satisfy the new type.

**Risk:** very low. Pure type narrowing over values that already exist.

### 2.3 — PRD-IMG-03: correct the stale comment and record the decision

**File:** `scripts/verify-images.mjs:9-12`

The comment states _"The card front and the detail hero resolve `main-visual.webp`"_. Since the restoration the card resolves a photograph, and the detail hero is the only consumer left.

**Recommendation: keep the generated art for the detail page.** Its figures are captioned "an original composition, not a screenshot of the product" in all three locales (`product.content.ts:85-89`) — a sentence that is true of the illustrations and false of a photograph. Retiring the art would mean rewriting that caption in `en`, `hy` and `ru` and making the detail page claim something different about its own images.

Correct the comment to say so, and record the decision where the data is (`ProductMeta.art`), following this codebase's practice of writing the _why_ next to the code.

**Acceptance:** no comment in the repository describes the card as resolving `main-visual.webp`; the reason the two sets coexist is written down once, where a reader will meet it.

**Risk:** none — comments only.

### 2.4 — PRD-IMG-06: reduce the card payload without changing the images

**Files:** `public/images/*.webp` (re-encode in place), via `npm run images:optimize`

The restoration took the grid's image payload from **172.8 kB to 905.9 kB** — 5.2× for the same nineteen cards. That is the honest price of using real photographs and is **not** a reason to undo anything. It is a reason to encode them well.

Two levers, in order of preference:

1. **Re-encode at the same dimensions** with the project's existing optimiser. The three largest files — `car.webp` 108.0 kB, `market.webp` 95.8 kB, `watch.webp` 83.1 kB — are 44 % of the total between them.
2. **Emit a card-sized variant.** The card renders at 411 px CSS wide on a three-column desktop grid and 372 px on a phone, while the files are 480–800 px wide. A 2× card width is about 822 px, so the current files are already close to right for a high-DPI desktop — **measure before assuming there is anything to win here.**

**Measure first, in both directions.** Record the byte count and a 1440 px / 390 px visual comparison before and after. If a file gets smaller but visibly worse, keep the original — the images are the deliverable, not the budget.

**Reversibility:** every one of these files is in `f766248`. A bad re-encode is undone with the same path-scoped `git checkout HEAD -- public/images/<file>` used to restore them.

**Acceptance**

- A recorded before/after byte count per file and in total.
- No visible quality loss at 1440 px and 390 px on any of the nineteen cards.
- `npm run verify:images` passes with the new pass from 2.1 in place.
- The product-to-image mapping is untouched — `products.spec.ts` passes unchanged.

**Risk:** low, and fully reversible. **Do not take this step at the same time as 2.5** — a crop change and a re-encode in one commit make a visual regression impossible to attribute.

---

## 3. Phase 2 — Decide the crop

### 3.1 — PRD-IMG-02: verify, then correct only what needs it

**Files:** `project-card.scss`; possibly `data/product-meta.ts`

The media box is 16/10 and `object-position` is unset, so all nineteen photographs are cropped from their centre. Three are materially taller than the box:

| Photo          | Intrinsic | Ratio | Height lost to a 1.60 crop |
| -------------- | --------- | ----: | -------------------------: |
| `meal.webp`    | 800 × 853 |  0.94 |                      ≈41 % |
| `organic.webp` | 800 × 717 |  1.12 |                      ≈30 % |
| `master.webp`  | 800 × 622 |  1.29 |                      ≈19 % |

**This is a content judgement, and the audit explicitly does not make it** (`CANNOT DETERMINE`). The step is: look at all nineteen crops at 1440 px and 390 px, and decide per image whether the subject survives.

Only if one does not:

```ts
/** Optional `object-position`, when centring cuts the subject. Omitted means `center`. */
readonly focus?: string;
```

bound to `object-position` on `.project-card__img`.

**Do not add the field speculatively.** An optional knob with no caller is an invitation to use it where it is not needed.

**Acceptance:** all nineteen crops confirmed on screen at both widths; any correction is recorded next to the data with the reason, not buried in the stylesheet; `e2e/our-work.spec.ts` row-height assertions unchanged in all three locales.

**Risk:** low. Purely presentational, and the default is the current behaviour.

---

## 4. Phase 3 — Pre-existing debt, unchanged by the restoration

These predate this work and are included because the audit found them in the dependency chain. **None of them blocks the restoration.**

### 4.1 — PRD-IMG-04 + PRD-IMG-13 + PRD-IMG-08: split the view model and the dictionary

**Files:** `data/product-view.ts`; `product.content.ts` → plus a new `product-detail.content.ts`

The grid route preloads a **117 828 B / 36 956 B gzipped** chunk that is **83.1 % detail-only copy**, in three locales. `toView` assigns 18 fields; the grid reads 8.

1. Split `ProductView` into `ProductCardView` (`id`, `archetypeLabel`, `icon`, `name`, `category`, `hook`, `cardImage`, `path`) and `ProductDetailView extends ProductCardView` (`summary`, `highlights`, `advantage`, `value`, `about`, `mainImage`, `experienceImage`, `url`, `platform`). Drop the dead `archetype` field (**PRD-IMG-08**) and the unused `PRODUCT_ARCHETYPES` export while here.
2. Move `about`, `advantage`, `value`, `summary` and `highlights` into a second dictionary keyed `our-work-product-detail`, imported only by `product-detail.ts`. esbuild then splits it into a chunk the grid route does not preload.
3. Split `product-content.spec.ts` to match — nothing in it is dropped; the moved fields take their budgets and their three-locale guarantees with them.

**The split is clean now and will not get cleaner.** No consumer straddles the line: `cardImage` is the card's, `mainImage` / `experienceImage` are the detail page's, and the restoration is what made that boundary explicit.

**Measured expectation:** the grid chunk should fall to roughly **25–30 kB raw** (≈9–11 kB gzipped).

**Acceptance**

- No chunk preloaded by `dist/nexora/browser/our_work/index.html` contains a product's `about` prose — grep each for a known Armenian sentence and get zero hits. It currently returns a hit; that is the before-state to beat.
- `dist/nexora/browser/our_work/draculai/index.html` still contains the full `about` text.
- Every unit spec and both e2e projects pass; `verify:bundle` and `verify:prerender` pass.
- Before/after chunk sizes recorded in the PR.

**Risk: medium** — the largest change in this roadmap, and the only one with real blast radius. **Do it as its own PR**, after Phase 1, so a payload regression cannot be confused with an image change.

### 4.2 — PRD-IMG-07: name the portfolio section

**File:** `products.html:1,5` — `aria-labelledby="projects-title"` on the `<section>`, `id="projects-title"` on the `<h2>`, matching `about-products.html:1,4`.

**Acceptance:** the band appears as a named region in an accessibility-tree snapshot; axe unchanged.
**Risk:** none.

### 4.3 — PRD-IMG-10: restore the hover lift

**Files:** `products.scss:107`, `expertise.scss:96`, `what-we-build.scss:87`

```scss
- @include reveal.stagger(6, 60ms, 120ms);
+ @include reveal.stagger(6, 60ms, 120ms, $hover: true);
```

Without `$hover`, the entrance delay is applied to the interaction properties too, so the lift starts 120–420 ms after `mouseenter` on fourteen of nineteen cards. Eight other bands already pair the two correctly; **sweep all three call sites together.**

**Acceptance:** compiled rule reads `transition-delay: .42s,.42s,0s,0s`; with reduced motion disabled, the lift on the last card begins within one frame of `mouseenter`; the entrance stagger is visually unchanged.
**Risk:** very low — one argument on three lines. Highest value-per-line change in this document.

### 4.4 — PRD-IMG-09: correct the stale registry comment

**File:** `data/product-meta.ts:4-9` — "eleven of nineteen products are storefronts" is wrong; it is **seven** (storefront 7, app 3, configurator 3, corporate 2, lead-generation 2, trade 2). The same comment promises the archetype "gives the grid a filter vocabulary"; no filter exists.

**Recommendation:** correct the count and drop the claim. Building a filter to satisfy a comment is the wrong reason to build a filter — `pages/services/filter-bar` is the precedent if it is ever wanted on its own merits.

**Acceptance:** the comment matches the registry.
**Risk:** none.

### 4.5 — PRD-IMG-11: move the separator into the dictionary

**File:** `project-card.html:24` — the `' — '` between name and category in the card's `aria-label` is hardcoded.

**Recommendation: defer** until a fourth locale is added. Harmless for `en` / `hy` / `ru`.

### 4.6 — PRD-IMG-12: `zadeh.webp` resolution

**File:** `public/images/zadeh.webp` — 480 × 334, the smallest in the set, rendered into a 411 px-wide box, so it is close to 1:1 on a standard display and upscaled on a high-DPI one.

**Do not upscale it and do not regenerate it.** If a higher-resolution original exists outside this repository, commit that; otherwise record the limitation and leave it. An interpolated enlargement would be a new image, which rule 2 forbids.

---

## 5. Sequencing and dependencies

```
2.1 verify:images covers public/images   ──┬──► 2.2 ProductPhotoFile union
                                           └──► 2.4 re-encode (needs the net)
2.3 comment + decision        — independent
3.1 crop review               — after 2.4, never in the same commit
4.1 view-model + dictionary split  ──► its own PR, after Phase 1
4.2, 4.3, 4.4                 — independent, any order
4.5, 4.6                      — deferred decisions
```

**The only hard orderings:** 2.1 before 2.2 and 2.4; 2.4 before 3.1, and not in the same commit.

---

## 6. Summary

|    Phase     | Items                                          | Files |  Risk  | Outcome                                                                          |
| :----------: | ---------------------------------------------- | :---: | :----: | -------------------------------------------------------------------------------- |
| **1 (done)** | Image restoration                              |   6   |   —    | 19/19 originals restored byte-identically; mapping 1:1; every path resolves      |
|      2       | IMG-05, IMG-01, IMG-03, IMG-06                 |  ~4   |  Low   | The photo directory is gated, mistyped names fail the build, payload measured    |
|      3       | IMG-02                                         |  1–2  |  Low   | Every crop confirmed on screen; corrections only where needed                    |
|      4       | IMG-04, IMG-13, IMG-08, IMG-07, IMG-10, IMG-09 |  ~10  | Medium | Grid chunk ≈118 kB → ≈25–30 kB; band named; hover lift responsive; comments true |

**Expected score movement after Phases 2–4:** TypeScript 8 → 9, Performance 6 → 8, Reusability 8 → 9, Accessibility 9 → 10 — **overall 8.4 → ≈9.0**.

**What is deliberately not proposed:** no rewrite of the card or the registry, no change to the layering, no new dependency, no change to any published URL, no regeneration or substitution of any image, and no reversal of the restoration.
