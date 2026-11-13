# `app-products` — Remediation Roadmap

**Companion to:** `PRODUCTS_TECHNICAL_AUDIT.md`
**Date:** 2026-11-14
**Posture:** targeted repair of a sound implementation. **No rewrite is proposed.** The layering, the registry pattern, the view-model seam and the SEO pipeline are all correct and are kept intact.

> **Superseded on 2026-11-14 by `PRODUCT_VERIFICATION_CHECKLIST.md`.** This document describes the card as a single face, which it no longer is: the flip and its back face were rebuilt - on hover, tap and focus, with no "Details" button - under the decisions recorded in that checklist. Statements here about the absence of a second face, of the `flipped` signal, of the host listeners or of `perspective` were true when written and are **not** true of the current code. Everything else - the image restoration, the finding register, the budgets, the dictionary measurements - still holds.

> **This revision supersedes the first.** Phase 1 (P1-01, P1-02) and parts of Phases 2 and 4 are **done** — some by the fix the first roadmap specified, some by the removal of the "Details" button and the card's second face. Completed work is kept below under **§2 What has been done**, with what actually landed, so the roadmap reads as a record rather than a plan that silently lost items. Everything in §3 onward is still outstanding.

---

## 0. Guiding constraints

1. **No new npm dependencies.** Every fix below uses what is already installed.
2. **Nothing changes a published URL.** The nineteen product slugs, `/our_work` and the locale prefixes are public contracts.
3. **No test is weakened to make a change pass.** Where a test asserted the wrong thing, it is tightened or replaced with one that asserts the new intent — never deleted to make a diff green.
4. **Each phase ends green:** `npm run typecheck && npm run lint && npm test && npm run e2e`.
5. **Fixes that span the codebase are swept, not patched locally** — `PRD-P2-01` exists in three stylesheets and all three must be corrected together.
6. **Removal counts as remediation.** Four issues below were closed by deleting the code that carried them. That is a better outcome than fixing it, and it is recorded as such.

---

## 1. Priority order — current state

| Phase | Theme                                                        | Issues                              | Status                                                                 |
| :---: | ------------------------------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------- |
| **1** | Close the mobile accessibility hole, and the gap that hid it | P1-01, P1-02                        | **Done.** See §2.1 and §2.2.                                           |
|  1b   | Remove the `Details` button                                  | — (the change that closed 4 issues) | **Done.** See §2.3.                                                    |
| **2** | Cheap, isolated, zero-risk corrections                       | P2-01, P3-02, P3-04, P3-13, P3-09   | **Outstanding.** P2-03 from this phase is closed (§2.3).               |
| **3** | Payload and view-model split                                 | P2-02, P3-01                        | **Outstanding — and now both larger in value and simpler to execute.** |
| **4** | Stylesheet consolidation                                     | P3-10                               | **Outstanding.** P2-04 is closed (§2.3).                               |
| **5** | Measured performance work                                    | P2-05, P3-08                        | **Outstanding.** P2-05 is roughly halved by §2.3 but not closed.       |
| **6** | Decisions, not necessarily changes                           | P3-06, P3-07, P3-11, P3-12, +2      | **Outstanding.** P3-03 and P3-05 are closed (§2.3).                    |

**Dependency graph (remaining work)**

```
P2-01 ─┐
P3-02 ─┤
P3-04 ─┼─ (Phase 2, mutually independent, any order)
P3-13 ─┤
P3-09 ─┘

P3-01 ──► P2-02 ──► P2-05
                      ▲
                 P3-08 (independent measurement)

P3-10 — independent, shared surface, low urgency
P3-06, P3-07, P3-11, P3-12 — decisions, no dependencies
```

The two hard orderings in the first roadmap (**P1-02 before P1-01**, **P1-01 before P2-04**) are both discharged. **Only one hard ordering remains: P3-01 before P2-02's step 2, and P2-02 before P2-05.**

---

## 2. What has been done

### 2.1 — P1-02: a touch project in the e2e matrix ✅

**Files:** `playwright.config.ts`, `e2e/our-work.touch.spec.ts` (new)

A third Playwright project was added:

```ts
{
  name: 'mobile-chrome',
  use: { ...devices['Pixel 7'] },
  testMatch: TOUCH_SPECS,          // '**/*.touch.spec.ts'
}
```

with `testIgnore: DESKTOP_IGNORE` added to both desktop projects so the touch specs do not also run there. **Pixel 7 rather than a touch-enabled desktop context**, because it is genuinely `isMobile` — so `(hover: none)` and `(pointer: coarse)` really match — and because it is Chromium, the one browser CI installs (`.github/workflows/ci.yml:31`).

`e2e/our-work.touch.spec.ts` carries seven tests. The **first asserts the premise itself** (`matchMedia('(hover: none)').matches === true`), so the file cannot silently pass by running on a desktop device and asserting nothing meaningful.

**Result:** 7 passed on `mobile-chrome`.

### 2.2 — P1-01: no off-screen focusable content on touch ✅

**File:** `project-card.scss`

Fixed twice over. First as the roadmap specified — a `visibility: hidden` rule inside `@media (hover: none)` mirroring the pointer branch, which took the collapsed back face out of the tab order and the accessibility tree. Then made structurally impossible by §2.3: there is no second face and no media branch left to get wrong.

**Verified on the rendered page, not by reading:** `our-work.touch.spec.ts` collects every `a` and `button` inside every card and asserts none fails `checkVisibility({ visibilityProperty: true })`. Before the fix this returned ~55 controls across the nineteen closed cards; it now returns an empty list.

### 2.3 — The `Details` button and the card's second face were removed ✅

**Files:** `project-card.ts`, `project-card.html`, `project-card.scss`, `products.ts`, `products.html`, `products.scss`, `product.content.ts`, plus five spec files.

The button could not be removed alone: hover was the only other trigger, so the summary, the four highlights and the outward link would have become pointer-only — a WCAG 2.1.1 failure, and a re-opening of P1-01. The face went with the button. Nothing was lost: all of that content already exists on `/our_work/:slug`, which the card title links to.

**Closed by this removal:**

| ID            | Title                                                  | Why it is closed                                                                                                                                                     |
| ------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PRD-P2-03** | "opens in a new tab" in the DOM but never announced    | The defective markup was the card's outward link. The surviving one (`product-detail.html:18-24`) has no `aria-label`, so the notice is part of the accessible name. |
| **PRD-P2-04** | 26-line duplicated declaration block                   | The duplicated selectors and the `@media (hover: none)` branch that held them are both gone.                                                                         |
| **PRD-P3-03** | `aria-controls` from inside the controlled region      | Deleted with the disclosure.                                                                                                                                         |
| **PRD-P3-05** | `ProjectCard` mixes presentation, state and focus work | The class is now one input and one computed.                                                                                                                         |

**Sizes:** `project-card.ts` 143 → 34, `project-card.html` 107 → 34, `project-card.scss` 391 → 107, `products.ts` 38 → 27.

### 2.4 — The card images were audited and deliberately left unchanged ✅

Recorded in full at `PRODUCTS_TECHNICAL_AUDIT.md` §7. All 38 images are deterministically generated per product with 19 distinct motifs and 38 distinct hashes; every motif was cross-referenced against its product and found accurate; none is stock, generic or presented as a screenshot. **No objective reason to replace any image was found, so none was replaced** — which is what the brief asks for in that case.

Whether the art should eventually become genuine interface captures is a product decision, listed in §7 below.

---

## 3. Phase 2 — Independent corrections _(outstanding)_

Five changes, no shared files — land them in any order, ideally as separate commits.

### 3.1 — P2-01: restore the hover lift

**Files:** `products.scss:107`, `expertise.scss:96`, `what-we-build.scss:87`

```scss
- @include reveal.stagger(6, 60ms, 120ms);
+ @include reveal.stagger(6, 60ms, 120ms, $hover: true);
```

All three are paired with `reveal.item(120ms, $hover: true)` and `reveal.lift()`, so all three have the same defect: the entrance delay is applied to the interaction properties too, so the lift begins 120–420 ms after `mouseenter`.

**This is the single highest value-per-line fix left in the feature** — one argument on three lines.

**Acceptance**

- Compiled output reads `.projects__card:nth-child(n+7){transition-delay:.42s,.42s,0s,0s}`.
- With reduced motion disabled, the lift on the last card begins within one frame of `mouseenter`.
- The entrance stagger is visually unchanged (cards still arrive 60 ms apart).
- `npm run lint:styles` passes.

### 3.2 — P3-02: name the portfolio section

**File:** `products.html:1,5`

```html
<section class="projects" appReveal aria-labelledby="projects-title">
  …
  <h2 class="projects__title" id="projects-title">{{ content().title }}</h2>
</section>
```

Matches `about-products.html:1,4` exactly. This is the only accessibility finding left in the band.

**Acceptance:** the section appears as a named region in an accessibility-tree snapshot; axe unchanged; `products.spec.ts:150-155` still passes.

### 3.3 — P3-04: correct the stale registry comment

**File:** `product-meta.ts:4-9`

Change "eleven of nineteen products are storefronts" to **seven**. Either build the archetype filter (`pages/services/filter-bar` is the in-house precedent) or remove the "filter vocabulary" claim. **Recommendation: remove the claim now and treat the filter as a separate feature request** — building it to satisfy a comment is the wrong reason.

**Acceptance:** the comment matches the registry.

### 3.4 — P3-13: align the English breadcrumb

**File:** `our-work.content.ts:8`

`en: 'Our works'` → `en: 'Our Work'`, matching `document-meta.content.ts:133` and the header nav label. `hy` and `ru` already agree.

While here: `our-work.content.ts:12` — the `hy` heading is missing the sentence break the `en` and `ru` versions have.

**Acceptance:** visible breadcrumb and JSON-LD `BreadcrumbList` name the same node identically in all three locales, on `/our_work` and on every `/our_work/:slug`; `sitemap.spec.ts` unaffected.

### 3.5 — P3-09: one constant for the Our Work path

**Files:** `core/routing/paths.ts`, `header.content.ts:31`, `product-detail.ts:47`, `product-view.ts:59`

```ts
export const OUR_WORK_SEGMENT = 'our_work';
export const OUR_WORK_PATH = `/${OUR_WORK_SEGMENT}`;
```

Then `product-detail.ts:47` → `OUR_WORK_PATH`, `product-view.ts:59` → `` `${OUR_WORK_PATH}/${id}` ``.

**`header.content.ts:31` is the one to check carefully.** `.dependency-cruiser.cjs:66-80` (`content-files-are-leaves`) restricts what a `*.content.ts` may import, but it only forbids `src/app/(pages|layout|shared)/…`, and `core/routing/paths.ts` is outside that, so the import should be allowed. **Run `npm run lint:deps` to confirm before committing**; if the rule does bite, leave the literal with a short comment rather than relaxing the architectural rule.

**Acceptance:** no literal `'/our_work'` outside `paths.ts` (or, if depcruise objects, exactly one, commented); `products.spec.ts:73-78` and `product-ids.spec.ts` still assert `/our_work/<id>`; `npm run lint:deps` passes.

---

## 4. Phase 3 — Payload and view-model split _(outstanding; now the largest item)_

**Goal:** the grid route stops preloading and materialising detail-page copy.

**The removal of the second face made this both more valuable and easier.** The grid used to read `summary` and `highlights` on the back face; it no longer does, so **22.1 % of the dictionary moved from the used column to the unused one**. Measured today: the grid reads **11.9 %** of `product.content.ts` and ships **100 %** of it, in three locales, on the first-paint path.

| Field        | Share of `product.content.ts` | Read by the grid? |
| ------------ | ----------------------------: | :---------------- |
| `about`      |                        46.4 % | no                |
| `highlights` |                        12.7 % | **no — changed**  |
| `summary`    |                         9.4 % | **no — changed**  |
| `advantage`  |                         7.3 % | no                |
| `value`      |                         7.2 % | no                |
| `hook`       |                         7.3 % | yes               |
| `category`   |                         3.2 % | yes               |
| `name`       |                         1.4 % | yes               |

Equally important: **no consumer straddles the line any more.** The first roadmap had to leave `summary` and `highlights` in the card view because both pages used them. They are now purely detail-page fields, so the split is clean.

**Do it as its own PR.**

### 4.1 — Split the view model _(TypeScript only, no behaviour change)_

**File:** `products/data/product-view.ts`

```ts
export interface ProductCardView {
  readonly id: ProductId;
  readonly archetypeLabel: string;
  readonly icon: AppIconName;
  readonly name: string;
  readonly category: string;
  readonly hook: string;
  readonly mainImage: string;
  readonly path: string;
}

export interface ProductDetailView extends ProductCardView {
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly advantage: string;
  readonly value: string;
  readonly about: string;
  readonly experienceImage: string;
  readonly url?: string;
  readonly platform?: string;
}
```

- `toProductViews()` returns `readonly ProductCardView[]`; `toProductView()` returns `ProductDetailView`.
- `ProjectCard.product` narrows to `ProductCardView` — **eight fields instead of seventeen**.
- Drop `ProductView.archetype` (dead field, verified unread) and the unused `PRODUCT_ARCHETYPES` export.
- `url` and `platform` move to the detail view: the grid no longer renders an outward link, and `project-card.spec.ts:151-167` already pins that the card renders identically with and without them.

**Acceptance:** `npm run typecheck` passes; `project-card.spec.ts`'s `PRODUCT` fixture drops nine fields and the file still compiles; `products.spec.ts` and `product-detail.spec.ts` pass unchanged.

### 4.2 — Split the dictionary _(P2-02 + P3-01)_

**Files:** `products/product.content.ts` → plus a new `product-detail.content.ts`

Move `about`, `advantage`, `value`, `summary` and `highlights` for all nineteen products into a second dictionary keyed `our-work-product-detail`, imported **only** by `product-detail.ts`. The grid dictionary keeps band copy, archetype labels, section headings, `visitSite`/`newTab`, and the three card fields.

Because `products.ts` and `product-detail.ts` are separate lazy routes, esbuild then emits two chunks and `our_work/index.html` preloads only the smaller one.

**Split `product-content.spec.ts` to match**, so both dictionaries keep their id-parity, three-locale and budget guarantees. Nothing in that spec should be dropped — the moved fields take their `TEXT_FIELDS` membership and their character budgets with them, and the four-highlights rule moves with `highlights`.

**Measured expectation:** the five moved fields are **83.1 %** of the 126 820-byte source, so the grid's chunk should fall from **117 828 bytes raw / 36 956 gzipped** to roughly **25–30 kB raw** (≈9–11 kB gzipped). That is a bigger win than the first roadmap projected, because two more fields now move.

**Acceptance**

- `dist/nexora/browser/our_work/index.html` no longer modulepreloads a chunk containing any product's `about` prose — grep each preloaded chunk for a known Armenian `about` sentence and get zero hits. (It currently returns a hit; that is the before-state to beat.)
- `dist/nexora/browser/our_work/draculai/index.html` still contains the full `about` text — prerendered HTML is unaffected.
- `products.spec.ts`, `project-card.spec.ts`, `product-detail.spec.ts`, both content specs, `e2e/our-work.spec.ts` and `e2e/our-work.touch.spec.ts` all pass.
- `npm run verify:bundle` and `npm run verify:prerender` pass.
- Record the before/after chunk sizes in the PR.

### 4.3 — First-row image priority _(small, lands with 4.2)_

**File:** `project-card.html:2-9`

All nineteen images are `loading="lazy"`, including any in the first row that may be in the initial viewport. Give the first row (or the first three cards) `fetchpriority="high"` and omit `loading="lazy"`.

**Measure before changing.** `products.spec.ts:80-93` asserts `loading=lazy` for _all_ images; if the first row is genuinely below the fold at the target viewports, the current code is correct and this step should be dropped. Check with a Lighthouse LCP trace on `/our_work` at 1440×900 and 390×844 first.

**Acceptance:** either a recorded LCP improvement with `products.spec.ts:80-93` updated deliberately, or a written note that the measurement showed no benefit and the step was declined.

---

## 5. Phase 4 — Stylesheet consolidation _(outstanding, reduced to one item)_

### 5.1 — P3-10: harden the shared delay mixin

**File:** `styles/mixins/_reveal.scss:67-73`

`_delay` emits a fixed four-value list that assumes `item($hover: true)` with no `$extra`. It works today only because CSS truncates surplus delay values. Either derive the list length from the property count, or add a comment stating the invariant and `@error` when `$hover: true` is used without a matching `item($hover: true)`.

**Low urgency — shared-surface change affecting every band.** Only take it on with a full visual pass. **Do it after P2-01 (§3.1)**, so the three fixed call sites are part of the regression baseline.

**Acceptance:** every existing `stagger` call site produces byte-identical compiled output; `e2e/motion.spec.ts` passes.

_P2-04, the other item in this phase, is closed — see §2.3._

---

## 6. Phase 5 — Measured performance work _(outstanding)_

### 6.1 — P2-05: defer rows below the fold

**File:** `products.html:17-23`

Only after Phase 3, and only if a measurement justifies it. Wrap rows after the first in `@defer (on viewport)` with a `@placeholder` sized to the card so the grid does not reflow.

**The case is weaker than it was.** The card is now one face instead of two — roughly half the nodes and 57 fewer controls — and the page passes every budget today. Measure before committing to this.

**Acceptance:** Lighthouse LCP and TBT on `/our_work` recorded before and after; `e2e/our-work.spec.ts` row-height and `a11y.spec.ts` pass; no card is missing after a full scroll in any locale.

### 6.2 — P3-08: confirm or dismiss the entrance flash

**File:** `shared/motion/reveal.ts:17-35`

`Reveal` sets `data-reveal="out"` in `afterNextRender`, i.e. after hydration, so a prerendered in-viewport band may briefly dip toward `opacity: 0` before animating back in. **This is a hypothesis, not an observation** — it cannot be seen in e2e because every spec runs with `reducedMotion: 'reduce'`, which neutralises `reveal.hidden()`.

Record a trace of `/our_work` with motion enabled. If the dip is real, set `data-reveal="out"` during SSR (host binding rather than `afterNextRender`). If it is not, close the issue with the trace attached.

**Acceptance:** either a fix with a before/after recording, or a written dismissal with evidence.

---

## 7. Phase 6 — Decisions, not necessarily changes

**Declining one is a valid outcome, provided the decision is recorded** — ideally as a comment next to the code, which is this codebase's established practice.

| Issue                                          | Decision to make                                           | Recommendation                                                                                                                                                                                                                                                  |
| ---------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product art**                                | Keep the generated compositions, or move to real captures? | **Keep for now.** §2.4 and audit §7 establish the current art is accurate, unique and professional. Real interface captures are a different asset class with an authorship implication the project deliberately avoids. Decide explicitly rather than by drift. |
| **P3-11** — snake_case `our_work` / `ai_agent` | Change with 301s, or accept and standardise going forward? | **Accept.** The slugs are indexed, in the sitemap and in 87 prerendered routes. Add a comment in `paths.ts` recording the inconsistency and the rule that new routes use kebab-case.                                                                            |
| **P3-12** — redirect in an `effect`            | Move to a `CanActivateFn`?                                 | **Do it** when `product-detail.ts` is next touched. More idiomatic, and it puts the decision beside `matchLocalePrefix` — but the current code is correct and the path is unreachable in production.                                                            |
| **P3-06** — hardcoded `' — '` separator        | Move to the dictionary?                                    | **Defer** until a fourth locale is added. The issue narrowed with the removal: there is one separator left instead of three.                                                                                                                                    |
| **P3-07** — 3 prerendered routes per product   | Cap the catalogue, or change render mode?                  | **Monitor only.** Track build time in CI; revisit past roughly 40 products, at which point `RenderMode.Server` for `/our_work/:slug` becomes the alternative.                                                                                                   |
| **P3-04b** — the archetype filter              | Build it, or drop the idea?                                | **Decide explicitly.** The taxonomy, icons and translations all exist; `pages/services/filter-bar` is a working precedent. Either schedule it as a feature or remove the claim from the comment — do not leave it half-stated.                                  |
| **Card density**                               | Is one face per card the final shape?                      | **Yes, unless a measured need appears.** The card now does one thing and the page it opens does the rest. If more information must live on the card, add it to the visible face — do not reintroduce a hidden one.                                              |

---

## 8. Summary

| Phase | Issues                               | Files touched |   Risk   | Status / outcome                                                                               |
| :---: | ------------------------------------ | :-----------: | :------: | ---------------------------------------------------------------------------------------------- |
|   1   | P1-02, P1-01                         |       3       |   Low    | **Done.** No off-screen focusable controls on touch; the mobile model is under test.           |
|  1b   | (removal) P2-03, P2-04, P3-03, P3-05 |      11       |  Medium  | **Done.** `Details` button and second face removed; four issues closed; full gate suite green. |
|   2   | P2-01, P3-02, P3-04, P3-13, P3-09    |      ~9       | Very low | Hover lift responsive; section named; comments and breadcrumbs truthful; one path constant.    |
|   3   | P3-01, P2-02                         |      ~8       |  Medium  | Grid chunk ≈118 kB → ≈25–30 kB raw; detail-only copy off the grid's critical path.             |
|   4   | P3-10                                |       1       |   Low    | Delay mixin hardened.                                                                          |
|   5   | P2-05, P3-08                         |       2       |   Low    | Measured, or explicitly dismissed with evidence.                                               |
|   6   | 7 decisions                          |    varies     |    —     | Each decision recorded in code.                                                                |

**Scores achieved so far:** Accessibility 7 → **9**, SCSS/CSS 7 → **8**, HTML 8 → **9**, Responsive 8 → **9**, Performance 6 → **7**, Maintainability 8 → **9**, Reusability 7 → **8** — **overall 8.0 → 8.4**.

**Expected after Phases 2–4:** SCSS/CSS 8 → 9, Performance 7 → 8, Scalability 7 → 8 — **overall ≈8.7**.

**What is deliberately not proposed:** no rewrite, no change to the layering, no new dependency, no change to any published URL, no replacement of intlayer, and no reintroduction of a hidden second face in any form. The implementation is good. This is repair work, not reconstruction.
