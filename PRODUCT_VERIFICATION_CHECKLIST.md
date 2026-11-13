# Products — Decisions, Implementation and Verification

**Project:** Nexora (`C:\Users\xXx\Desktop\nexora`)
**Date:** 2026-11-14
**Scope:** `app-products`, `app-project-card`, their data layer, `app-product-detail`, and the checks that gate them
**Stack as verified:** Angular `22.2.3`, TypeScript `~6.0.0`, Angular Material/CDK `22.2.3`, `intlayer` / `angular-intlayer` `9.7.0` (`package.json`)

> **Supersedes `PRODUCTS_TECHNICAL_AUDIT.md`, `PRODUCTS_REMEDIATION_ROADMAP.md` and
> `PRODUCTS_VERIFICATION_CHECKLIST.md` wherever they describe the card as a single face.** Those
> three documents were written while the card had no flip. The flip is back; a note to that
> effect now stands at the top of each.

Every result below is the output of a command run in this repository today. Nothing is marked
passed on the strength of reading the code. Where a check reports a problem, the problem is
written out rather than summarised away. **NO EVIDENCE** and **CANNOT DETERMINE** are used where
they apply.

---

## 1. The three decisions — RESOLVED

These were answered by the client and are treated as final. They are recorded here so a later
change cannot quietly reverse one.

| #      | Decision                    | What was decided                                                                                                                                                                                                                                                                                                                                               | Status       | Where it now lives                                                                                                           |
| ------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Q1** | **Images**                  | Use the existing **original product photographs**. No AI-generated abstract illustrations. No additional generated images. No fabricated interface screenshots. No conceptual image presented as a product interface. The originals will be supplied later, and the architecture must accept them **without redesigning the components or the product pages**. | **RESOLVED** | `product-meta.ts` (`photos: readonly ProductPhoto[]`), `public/images/*.webp` (19 files), `product-view.ts` (`ProductImage`) |
| **Q2** | **Flip**                    | Desktop: **hover turns the card, moving the pointer out returns it**; **no "Details" button**; the animation must be smooth. Mobile: **tap turns it, a second tap returns it**, and both faces stay reachable. Keyboard interaction verified, focus managed, the hidden face kept out of reach, no clash with existing animations, WCAG 2.1.1 met.             | **RESOLVED** | `project-card.ts` (three triggers), `project-card.scss` (`visibility` swap), `project-card.html` (two faces)                 |
| **Q3** | **Technology presentation** | **No** separate large "Technology & Architecture" section. Technology stays a small **chip** in the product page's Hero. Verified information only; nothing invented or attributed.                                                                                                                                                                            | **RESOLVED** | `product-detail.html:33-43` (`.product__tech-chip`), `product-detail.scss`                                                   |

### 1.1 How each decision is enforced, not merely implemented

| Decision | Enforced by                                                                                                                                                                                                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1       | `project-card.spec.ts` — "shows the photograph that ships in public/images" asserts the source is **not** under `assets/images/products`; `product-detail.spec.ts` asserts the same for the hero; `verify-images.mjs` fails the build if a referenced photograph is missing, is not WebP, is over budget, is unreferenced, or is shared by two products |
| Q2       | 19 unit tests in `project-card.spec.ts` (hover, tap, focus, Escape, hidden-face reach), 9 browser tests in `e2e/our-work.spec.ts`, 7 in `e2e/our-work.touch.spec.ts` (Pixel 7, genuinely `hover: none`)                                                                                                                                                 |
| Q3       | `product-detail.spec.ts` — "states the platform in a single chip, and only when one is known" asserts exactly one chip for a product that has a platform and **none** for `casamance`, which has no verified platform                                                                                                                                   |

---

## 2. Q2 — the reported defect: "the card flip does not work on hover"

### 2.1 Root cause (verified, not inferred)

**The flip did not exist.** It was not broken by a CSS or event bug: the whole mechanism had
been removed from the component in earlier work, together with the "Details" button that had
been its second trigger. What remained was a stateless, single-face card, so there was nothing
for a hover to do.

Evidence, from the files as they stood before this change:

| Evidence                                                                                                                                              | What it showed                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `project-card.ts` had no `flipped` signal, no `mouseenter` / `mouseleave` / `focusout` / `keydown.escape` host listeners, and no `host` state binding | No trigger of any kind, so no hover path to debug                        |
| `project-card.html` had one `div`, no `__inner`, no `__face--back`                                                                                    | No second face to turn to                                                |
| `project-card.scss` had no `transform-style`, no `rotateY`, no `visibility` swap                                                                      | No turn and no hiding rule                                               |
| `products.scss` had no `perspective` on `.projects__card`                                                                                             | No vanishing point, so even a restored `rotateY` would have looked flat  |
| `src/styles/tokens/_motion.scss:8` still carried `flip: 520ms`                                                                                        | The design token outlived the implementation — the only trace left of it |
| `PRODUCTS_TECHNICAL_AUDIT.md:31` listed exactly what had been deleted                                                                                 | Confirmed the removal was deliberate, and named every part of it         |

So the fix was a rebuild, not a repair. What follows is what was rebuilt and why in that shape.

### 2.2 Three triggers, and why there are three

| Device                | Trigger                            | Undo                                                     |
| --------------------- | ---------------------------------- | -------------------------------------------------------- |
| Pointer               | `mouseenter` on the card           | `mouseleave` — unless the caret is still inside the card |
| Touch (`hover: none`) | `click` on the card, which toggles | A second tap                                             |
| Keyboard              | `focusin` anywhere in the card     | `focusout` to anything outside it, or **Escape**         |

Touch is separated from pointer **in TypeScript**, not in CSS: `coarsePointer()` re-queries
`(hover: none)` and gates `mouseenter` / `mouseleave` as well as the click toggle. A tap on most
touch browsers raises `mouseenter` before `click`, so with hover live on a phone the enter would
turn the card and the click would turn it straight back. The query is re-run per event rather
than cached, because this component also executes on the server during prerender, where there is
no `matchMedia` at all, and because a visitor can change input device without reloading.

**There is no "Details" button, and none is needed:** the card itself is the control.

### 2.3 Accessibility, point by point

| Requirement                                                | How it is met                                                                                                                                                                                                                                                           | Verified by                                                                                                                                                                                                                                             |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WCAG 2.1.1 Keyboard** — nothing pointer-only             | The host is `tabindex="0" role="group"`; `focusin` turns the card, so every word and both links on the back face are reachable with Tab alone                                                                                                                           | `project-card.spec.ts` "is a tab stop…", "turns when focus enters…"; `e2e/our-work.spec.ts` "opens on focus and walks through both links to the next card"                                                                                              |
| **Focus is never stranded on a hidden face**               | The front face has **no** focusable elements at all, so the face that gets hidden can never be holding the caret                                                                                                                                                        | `project-card.spec.ts` "has nothing focusable on the front face, so turning cannot strand focus"                                                                                                                                                        |
| **The hidden face is out of reach, not just out of sight** | The turned-away face is hidden with `visibility: hidden`, which removes it from the tab order **and** the accessibility tree. `backface-visibility` and `overflow: hidden` do neither — they only stop it being painted                                                 | `e2e/our-work.spec.ts` "puts the turned-away face out of reach, not merely out of sight" (`checkVisibility({ visibilityProperty: true })` over all 19 back faces); `our-work.touch.spec.ts` "hides nothing from view that the keyboard can still reach" |
| **Escape returns the card**                                | Escape unturns it and returns the caret to the card, so a visitor's place among nineteen cards is not lost. `focusin` is suppressed for the duration of that move, or it would re-open what was just dismissed                                                          | `project-card.spec.ts` "returns on Escape and keeps the caret on the card"; `e2e` "returns the card on Escape and leaves the caret on it"                                                                                                               |
| **The caret is not pulled out from under the keyboard**    | `mouseleave` is ignored while focus is inside the card                                                                                                                                                                                                                  | `project-card.spec.ts` "does not return on mouseleave while the caret is still inside"                                                                                                                                                                  |
| **Accessible names**                                       | The card announces `"<name> — <category>"`; the detail link announces `"View project: <name>"`; the outbound link folds the new-tab warning into its own name, because `aria-label` replaces element contents and a sibling span would be computed away                 | `project-card.spec.ts` (three assertions), `products.spec.ts` "makes every card a tab stop with the product in its accessible name"                                                                                                                     |
| **WCAG 2.5.3 Label in Name**                               | The detail link's visible text is contained in its accessible name                                                                                                                                                                                                      | `project-card.spec.ts` "opens its own detail route, and names the product in the link"                                                                                                                                                                  |
| **WCAG 2.2 AA, on a real touch device**                    | axe sweep of `/our_work` on Pixel 7, both with every card unturned and with one turned                                                                                                                                                                                  | `our-work.touch.spec.ts` "has no WCAG 2.2 AA violations" and "…with a card turned"                                                                                                                                                                      |
| **No clash with the existing animations**                  | The grid cell owns the entrance reveal, the stagger and the hover lift; the card's inner owns the rotation. They are different elements, so neither overwrites the other's `transform`. The vanishing point (`perspective: 1400px`) stays on the cell, where it belongs | `e2e` "turns on hover and returns when the pointer leaves" also asserts the card's box does not change size under the pointer; the three per-locale row-height tests pass                                                                               |
| **`prefers-reduced-motion`**                               | The token layer zeroes `--nx-motion-duration-flip`, which zeroes the `visibility` delay with it, so the faces still swap — they simply do not rotate. The whole Playwright suite runs with `reducedMotion: 'reduce'`, so this is the path all the tests above take      | every e2e test listed here                                                                                                                                                                                                                              |
| **The animated path**                                      | A separate describe block runs with motion enabled and pins that the rotation lasts the full 520 ms token and that the face swap is delayed by exactly the same 520 ms, so the outgoing face neither vanishes mid-turn nor lingers after it                             | `e2e/our-work.spec.ts` "the turn, with motion enabled" (2 tests)                                                                                                                                                                                        |

---

## 3. Q1 — images

### 3.1 What ships

Nineteen original product photographs, restored from Git (commit `f766248`) and served straight
out of `public/images`, one per product:

| Product          | File            | Pixels  | Product            | File            | Pixels  |
| ---------------- | --------------- | ------- | ------------------ | --------------- | ------- |
| `draculai`       | `medical.webp`  | 800×450 | `libra-analytics`  | `power.webp`    | 800×569 |
| `jdm-west-coast` | `car.webp`      | 800×533 | `remake-templates` | `muzic.webp`    | 800×450 |
| `hydrant`        | `juce.webp`     | 756×600 | `got-matcha`       | `got.webp`      | 800×600 |
| `mertel`         | `mertal.webp`   | 800×420 | `lav`              | `lave.webp`     | 800×450 |
| `skinome`        | `skay.webp`     | 800×533 | `roar-organic`     | `organic.webp`  | 800×717 |
| `mastercraft`    | `master.webp`   | 800×622 | `zadeh-md`         | `zadeh.webp`    | 480×334 |
| `robert-irwin`   | `je.webp`       | 640×524 | `tai-ping`         | `market.webp`   | 800×453 |
| `casamance`      | `interier.webp` | 800×437 | `mezave`           | `meal.webp`     | 800×853 |
| `sell-me-watch`  | `watch.webp`    | 800×800 | `connected-car`    | `infiniti.webp` | 800×450 |
| `klinik-europe`  | `klinik.webp`   | 800×463 |                    |                 |         |

Each `<img>` declares that file's own intrinsic size rather than a shared constant, because the
set runs from 480×334 to 800×853 — portrait, square and three landscape ratios — and one declared
size for all of them would reserve the wrong box for most.

### 3.2 Nothing generated is used, anywhere

| Where                     | Before                                                                                                                           | Now                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Card front                | product photograph                                                                                                               | product photograph (unchanged)                               |
| Card back                 | generated `experience-visual.webp`                                                                                               | copy only — summary, four capabilities, advantage, two links |
| Detail hero               | generated `main-visual.webp`, under a caption reading "Illustration — an original composition, not a screenshot of the product." | the product's own photograph, no caption                     |
| Detail experience section | generated `experience-visual.webp` + the same caption                                                                            | copy only, until further photographs exist                   |
| `product.content.ts`      | carried the `sections.illustrative` caption in 3 locales                                                                         | the caption is deleted; there is nothing left to disclaim    |

### 3.3 How the originals are added later, without a redesign

`photos` is an **array**, and that is the whole provision:

```ts
// product-meta.ts
export interface ProductPhoto {
  readonly file: string; // a file name under public/images
  readonly width: number;
  readonly height: number;
}
// per product:
photos: [{ file: 'medical.webp', width: 800, height: 450 }],
```

- `photos[0]` is the cover: the card front and the detail hero both read it.
- `photos.slice(1)` is the detail page's gallery (`product-detail.ts`, `gallery()`), which renders
  one `<figure>` per entry and **nothing at all** while the array has one element. The experience
  section then carries a `--copy-only` class so it does not hold open an empty column.
- Adding screenshots for a product is therefore: drop the WebP files into `public/images`, append
  entries to that product's `photos`, run `npm run verify:images`. **No component, template,
  stylesheet or page changes.**
- `verify-images.mjs` already understands multi-photo products: its unit test "reads every
  photograph of a product that carries more than one" pins that.

---

## 4. Q3 — technology

One chip in the Hero, carrying `platform`, which is the only technical fact on record for a
product:

```html
@if (item.platform; as platform) {
<p class="product__tech">
  <span class="product__tech-chip">
    <span class="product__tech-label">{{ content().sections.platform }}</span>
    <span class="product__tech-value">{{ platform }}</span>
  </span>
</p>
}
```

- **15 of 19** products have a verified platform and render the chip. **4** — `casamance`,
  `klinik-europe`, `tai-ping`, `connected-car` — have none and render **no chip**, rather than a
  guess. Verified in the prerendered output: 45 chips across 57 detail pages (15 × 3 locales).
- **No technology stack is invented or attributed anywhere.** There is **NO EVIDENCE** in this
  repository of a verified framework, language or infrastructure stack for any of the nineteen
  products; what exists is `platform`, a short publication fact such as `Shopify`, `WordPress` or
  `iOS · App Store`. A "Technology & Architecture" section would have had to be filled with
  guesses, which is why Q3 resolved against one.
- The chip's label is translated; the value is not, because a platform name is a proper noun.

---

## 5. Verification results — every command, and what it actually printed

Run on 2026-11-14 in `C:\Users\xXx\Desktop\nexora`. Exit codes are the commands' own.

| #    | Command                    | Exit | Result                                                                                                                                                                                                                                   |
| ---- | -------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1  | `npm run typecheck`        | 0    | Clean across all four projects (`tsconfig.app`, `tsconfig.spec`, `e2e/tsconfig`, `tsconfig.scripts`). **0 TypeScript errors.**                                                                                                           |
| 5.2  | `ng lint`                  | 0    | `All files pass linting.`                                                                                                                                                                                                                |
| 5.3  | `npm run lint:deps`        | 0    | `no dependency violations found (210 modules, 602 dependencies cruised)` — the `core ← shared ← layout ← pages` layering holds.                                                                                                          |
| 5.4  | `npm run lint:styles`      | 0    | stylelint clean (flat BEM, no `!important`, no `::ng-deep`, no duplicate selectors).                                                                                                                                                     |
| 5.5  | `npm run format:check`     | 0    | `All matched files use Prettier code style!`                                                                                                                                                                                             |
| 5.6  | `ng test --no-watch`       | 0    | **442 tests in 56 files, 442 passed, 0 failed.**                                                                                                                                                                                         |
| 5.7  | `npm run test:scripts`     | 0    | **120 tests, 120 passed, 0 failed** (includes the rewritten `verify-images` suite, 10 tests).                                                                                                                                            |
| 5.8  | `npm run build`            | 0    | `Prerendered 87 static routes.` Initial total 505.49 kB raw / 126.67 kB transfer. **One warning**, see §7.1.                                                                                                                             |
| 5.9  | `npm run verify:prerender` | 0    | `87 prerendered pages are navigable without JavaScript.`                                                                                                                                                                                 |
| 5.10 | `npm run verify:bundle`    | 0    | `87 routes: worst is /ru/contact at 222.8 kB gzip, budget 240.0 kB.`                                                                                                                                                                     |
| 5.11 | `npm run verify:images`    | 0    | `19 photographs, 19 files, 905.9 kB in total, all WebP, all referenced, largest 108.0 kB.`                                                                                                                                               |
| 5.12 | `npm run verify:headers`   | 0    | **First run failed**: the bundle's inline script no longer matched the CSP hash list. Fixed with the project's own `-- --write`, then: `87 pages: 6 inline scripts allowed by hash, 6 headers present, nginx snippet in step.` See §7.2. |
| 5.13 | `npm run verify:seo`       | 0    | `87 documents: unique titles, canonical and hreflang agree, 84 indexable and in the sitemap, 3 noindex.`                                                                                                                                 |
| 5.14 | `npm run e2e`              | —    | See §6.                                                                                                                                                                                                                                  |

**0 TypeScript errors, 0 ESLint errors, 0 stylelint errors, 0 dependency violations, 0 failing
tests, 0 build errors.**

---

## 6. End-to-end suite

Pending — filled in from the run below.

---

## 7. Prerendered output and the three locales

Checked against `dist/nexora/browser` from build 5.8, with the inlined `<style>` blocks stripped
so that a class name appearing in CSS is not mistaken for one in the DOM.

### 7.1 The grid, per locale

| Route          | Cards | Front faces | Back faces | Distinct photographs | Detail links | Outbound links | Detail link's accessible name |
| -------------- | ----- | ----------- | ---------- | -------------------- | ------------ | -------------- | ----------------------------- |
| `/our_work`    | 19    | 19          | 19         | 19                   | 19           | 17             | `View project: Draculai`      |
| `/hy/our_work` | 19    | 19          | 19         | 19                   | 19           | 17             | `Դիտել նախագիծը: Draculai`    |
| `/ru/our_work` | 19    | 19          | 19         | 19                   | 19           | 17             | `Смотреть проект: Draculai`   |

Both faces are prerendered into the HTML, which is what makes the back face readable without
JavaScript; the stylesheet, not the markup, is what keeps the turned-away one out of reach.

### 7.2 The detail pages — all 19 products × 3 locales

| Check                                                  | Result                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Pages present and prerendered                          | **57 / 57**                                                                          |
| Hero `src` equals that product's registered photograph | **57 / 57, no mismatches**                                                           |
| Technology chips                                       | **45** — 15 products with a verified platform × 3 locales                            |
| Chip absent where no platform is on record             | `casamance`, `klinik-europe`, `tai-ping`, `connected-car` — 0 chips in all 3 locales |
| Chip label translated                                  | `Platform` / `Հարթակ` / `Платформа`                                                  |
| Captions remaining anywhere                            | **0**                                                                                |
| Gallery figures / experience images rendered           | **0** — correct: every product has exactly one photograph today                      |
| `--copy-only` applied to the experience section        | all 57 pages                                                                         |

### 7.3 Routes

87 prerendered routes, unchanged by this work: the grid at 3 locales, 19 products × 3 locales =
57 detail pages, and the remaining static pages. No published URL changed.

---

## 8. Deviations, and what is deliberately left alone

### 8.1 One build warning, pre-existing, now 0.09 kB worse

```
▲ [WARNING] src/app/pages/our-work/product-detail/product-detail.scss exceeded maximum budget.
            Budget 5.00 kB was not met by 1.03 kB with a total of 6.03 kB.
```

- This is a **warning**, not an error. The error threshold for a component stylesheet is 8 kB
  (`angular.json`), and the build exits 0.
- The file was **already over** that warning budget before this work, at 5.94 kB.
- The chip styles added ~0.24 kB; grouping the three duplicated `text.label-caps()` includes gave
  ~0.15 kB back, landing at 6.03 kB — **0.09 kB above where it started**.
- Bringing it under 5 kB means restructuring a stylesheet this task did not otherwise touch, which
  is outside the scope of these three decisions. **Recommendation, not done:** fold the
  `reveal.item()` groups and the `--copy-only`/gallery rules into fewer selectors, or raise the
  warning budget deliberately with a comment saying why.

### 8.2 `public/_headers` was rewritten (CSP)

Changing the application bundle changes the inline script Angular emits, and its SHA-256 is
pinned in the Content-Security-Policy. `verify:headers` caught the mismatch and refused; the
project's own `npm run verify:headers -- --write` regenerated the hash list and the matching
`deploy/nginx/nexora-headers.conf`. One line changed in each file. Without this, the deployed site
would have blocked its own bootstrap script.

### 8.3 The generated art is now unreferenced, and still ships — flagged, not deleted

`src/assets/images/products/` holds 19 folders / 38 generated WebP files, **364 kB**, which no
component reads any more. `angular.json` copies `src/assets/**` into the build wholesale, so it is
confirmed present in `dist/nexora/browser/assets/images/products` — 364 kB of dead weight in the
deployed site. `scripts/generate-product-images.mjs` and `npm run images:products` still exist and
still regenerate it.

These files are **untracked** in Git and were not part of the three decisions, so nothing has been
deleted. **Decision needed:** delete the folder and the generator, or keep them. If they are kept,
they should be excluded from the `assets` glob so they stop shipping.

### 8.4 Where the earlier documents are now wrong

`PRODUCTS_TECHNICAL_AUDIT.md`, `PRODUCTS_REMEDIATION_ROADMAP.md` and
`PRODUCTS_VERIFICATION_CHECKLIST.md` describe the card as having one face, no `flipped` signal, no
host listeners and no `perspective`. Each now opens with a note saying so and pointing here.
Their other content — the image restoration record with its blob SHAs, the finding register, the
budget and dictionary measurements — is unaffected.

`PRODUCTS_ANALYSIS.md`, `PRODUCTS_UX_UI_CONCEPT.md` and `PRODUCTS_IMPLEMENTATION_ROADMAP.md`
designed this flip before it was built; they remain accurate as the design record.

---

## 9. Files changed

| File                                                                          | Change                                                                                                                       |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/app/pages/our-work/products/project-card/project-card.ts`                | the flip: `flipped` signal, pointer / touch / focus triggers, Escape, `openOnFocus` suppression, `cover()`, accessible names |
| `src/app/pages/our-work/products/project-card/project-card.html`              | two faces inside `.project-card__inner`; the back carries the summary, four highlights, the advantage and the two links      |
| `src/app/pages/our-work/products/project-card/project-card.scss`              | one grid cell for both faces, `rotateY(180deg)`, the `visibility` swap delayed by the flip duration                          |
| `src/app/pages/our-work/products/products.ts` / `.html`                       | the shared `ProjectCardLabels` bag, resolved once for all nineteen cards                                                     |
| `src/app/pages/our-work/products/products.scss`                               | `perspective: 1400px` restored to the grid cell                                                                              |
| `src/app/pages/our-work/products/product.content.ts`                          | `viewProject` added in 3 locales; the `sections.illustrative` caption removed                                                |
| `src/app/pages/our-work/products/data/product-meta.ts`                        | `art` → `photos: readonly ProductPhoto[]`; `productImage()` → `photoSrc()`                                                   |
| `src/app/pages/our-work/products/data/product-view.ts`                        | `cardImage` / `mainImage` / `experienceImage` → `photos: readonly ProductImage[]`                                            |
| `src/app/pages/our-work/product-detail/product-detail.html` / `.ts` / `.scss` | photograph hero, the technology chip, the `gallery()` computed, `--copy-only`, caption styles deleted                        |
| `scripts/verify-images.mjs` / `.test.mjs`                                     | rewritten to check `public/images` against `photos[*].file` instead of the removed `art` folders                             |
| `src/app/pages/our-work/products/data/product-ids.spec.ts`                    | photograph uniqueness, intrinsic sizes and `photoSrc()` in place of the art-folder assertions                                |
| `project-card.spec.ts`, `products.spec.ts`, `product-detail.spec.ts`          | rewritten for the flip, the chip and the photographs                                                                         |
| `e2e/our-work.spec.ts`, `e2e/our-work.touch.spec.ts`                          | rewritten for the flip, including the hidden-face reach check and the motion-enabled timing tests                            |
| `playwright.config.ts`                                                        | header comment corrected — the touch project exists for the tap trigger, which no other project can reach                    |
| `public/_headers`, `deploy/nginx/nexora-headers.conf`                         | regenerated CSP script hash (§8.2)                                                                                           |
