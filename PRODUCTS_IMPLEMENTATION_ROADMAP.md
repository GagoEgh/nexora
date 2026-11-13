# Implementation Roadmap — interactive product cards on `/our_work`

**Project:** Nexora · **Date:** 2026-11-14 · **Angular 22.2.3 / TypeScript 6.0 / intlayer 9.7**
**Companion to:** `PRODUCTS_ANALYSIS.md` (evidence) and `PRODUCTS_UX_UI_CONCEPT.md` (design)
**Status:** plan only. No application code was modified in producing these documents.

---

## 0. Starting position

The component this roadmap builds on is **not** the one the brief describes (`PRODUCTS_ANALYSIS.md` §0). What exists in the working tree today:

```
src/app/pages/our-work/
├── our-work.ts / .html / .content.ts          page shell
├── about-products/                            projected <dl> panel
├── products/                                  ◄── app-products (the band)
│   ├── products.ts (27) / .html (24) / .scss (117)
│   ├── product.content.ts (1120)              8 fields × 19 products × 3 locales
│   ├── data/
│   │   ├── product-ids.ts (38)                PRODUCT_IDS → ProductId union + isProductId
│   │   ├── product-meta.ts (~220)             archetype, art, photo, url?, platform?
│   │   └── product-view.ts (~110)             toProductViews / toProductView / nextProductId
│   └── project-card/                          ◄── app-project-card (34 / 34 / 113)
└── product-detail/                            ◄── app-product-detail, /our_work/:slug
```

Already in place and **not to be rebuilt**: the registry → view-model → dictionary seam; 19 lazy-loaded detail routes prerendered in 3 locales (87 routes); `core ← shared ← layout ← pages` enforced by dependency-cruiser; OnPush asserted by a spec that walks `src/app`; flat-BEM stylelint with `::ng-deep` and `!important` banned; axe sweeps across 12 pages × 3 locales.

**Already removed and being deliberately reintroduced:** the flip and its back face. `_motion.scss:5-8` still carries the `flip: 520ms` token it used.

---

## 1. Constraints this roadmap holds itself to

1. **No new npm dependency.** Everything below uses what is installed.
2. **No new component.** The brief forbids it, and none is needed — the flip lives inside `ProjectCard`.
3. **No file deleted or renamed.** Additive only.
4. **No published URL changes.** 19 slugs × 3 locales are in a sitemap and 87 prerendered routes.
5. **No invented product functionality.** Every string rendered comes from `product.content.ts`, which `product-content.spec.ts` holds to id parity, three locales, character budgets and a no-authorship-claims rule.
6. **No test weakened to make a change pass.** Where a test asserts the current single-face card, it is rewritten to assert the new intent, and the new assertion must fail against the old code.
7. **Each phase ends green:** `npm run typecheck && npm run lint && npm test && npm run build && npm run e2e`.

---

## 2. Phase order

| Phase | Theme                        |       Priority        |   Risk   | Gate                                             |
| :---: | ---------------------------- | :-------------------: | :------: | ------------------------------------------------ |
| **1** | Touch-device test coverage   |        **P0**         |   Low    | A project where `(hover: none)` actually matches |
| **2** | Card-front refinements       |        **P1**         | Very low | Independent of the flip                          |
| **3** | The flip                     |        **P1**         |  Medium  | The main deliverable                             |
| **4** | No-hover expansion model     | **P0 within Phase 3** |  Medium  | Ships _with_ Phase 3, never after                |
| **5** | Product-page refinements     |        **P2**         |   Low    | Uses existing copy only                          |
| **6** | Payload and view-model split |        **P2**         |  Medium  | Pre-existing debt the flip makes worse           |
| **7** | Blocked on assets            |           —           |    —     | Decisions, not code                              |

**The one hard ordering: Phase 1 before Phase 3.** The defect that removed the flip last time — a collapsed back face left focusable on touch — was invisible because no test ran on a device where `(hover: none)` matched. Building the flip again without that project first would reproduce the same blind spot.

**Phases 3 and 4 are one deliverable.** Shipping the flip without the no-hover path is the exact failure described in `PRODUCTS_ANALYSIS.md` §3.

---

## Phase 1 — Make the no-hover branch testable **(P0)**

**Why first:** `project-card.scss` will again select between two materially different interaction models on a media feature. A desktop Playwright project matches `hover: hover` whatever viewport it sets, so without this, half the stylesheet is never executed by any test.

**Files**

- `playwright.config.ts` — add a third project; add `testIgnore` to the two desktop projects
- `e2e/our-work.touch.spec.ts` — new

```ts
{ name: 'mobile-chrome', use: { ...devices['Pixel 7'] }, testMatch: '**/*.touch.spec.ts' }
```

Pixel 7 rather than a touch-enabled desktop context: it is genuinely `isMobile`, so `(hover: none)` and `(pointer: coarse)` really match, and it is Chromium — the only browser CI installs (`.github/workflows/ci.yml:31`).

**Expected outcome:** CI executes the no-hover branch on every run.

**Acceptance**

- The spec's **first** test asserts `matchMedia('(hover: none)').matches === true`, so the file cannot pass by running on the wrong device.
- A test collects every `a` and `button` inside every card and asserts none fails `checkVisibility({ visibilityProperty: true })`. **Against the pre-removal implementation this returned ~55 controls; it must return an empty list.**
- `npm run e2e` runs all three projects green.

---

## Phase 2 — Card-front refinements **(P1, independent)**

Three small diffs, landable separately, none touching the flip.

### 2.1 Fix the delayed hover lift

**Files:** `products.scss:107`, `expertise.scss:96`, `what-we-build.scss:87`

```scss
- @include reveal.stagger(6, 60ms, 120ms);
+ @include reveal.stagger(6, 60ms, 120ms, $hover: true);
```

Without `$hover`, `_reveal.scss:67-73` emits a single `transition-delay` applying to all four transitioned properties instead of the four-value list that zeroes `translate` and `box-shadow`. Compiled today: `.projects__card:nth-child(n+7){transition-delay:.42s}`. Eight other bands already pair the two correctly — **sweep all three call sites together.**

**Acceptance:** compiled rule reads `transition-delay:.42s,.42s,0s,0s`; with reduced motion disabled the lift on the last card starts within one frame of `mouseenter`; entrance stagger visually unchanged; `npm run lint:styles` passes.

### 2.2 Name the portfolio section

**File:** `products.html:1,5` — `aria-labelledby="projects-title"` on the `<section>`, `id="projects-title"` on the `<h2>`, matching `about-products.html:1,4`.

**Acceptance:** the band appears as a named region in an accessibility-tree snapshot; axe unchanged.

### 2.3 Correct the stale registry comment

**File:** `product-meta.ts:4-9` — "eleven of nineteen products are storefronts" is wrong; it is **seven**. The same comment promises a "filter vocabulary" that was never built.

**Acceptance:** the comment matches the registry. Build the filter only if it is wanted on its own merits — `pages/services/filter-bar` is the in-house precedent.

---

## Phase 3 — The flip **(P1, the main deliverable)**

### 3.1 Component state

**File:** `project-card/project-card.ts` (34 → ~130 lines)

```ts
protected readonly flipped = signal(false);
protected readonly backId = computed(() => `project-back-${this.product().id}`);
protected readonly openLabel  = computed(() => `${this.labels().details} ${this.product().name}`);
protected readonly closeLabel = computed(() => `${this.labels().close} ${this.product().name}`);
```

Host listeners: `mouseenter` → open · `mouseleave` → close **unless focus is inside** · `keydown.escape` → close · `focusout` → close only when `relatedTarget` has left the card.

Focus choreography through `afterNextRender`, because the element being focused is revealed by the same change that hides the other one.

**Do not bind `inert` to `flipped()`.** It cannot distinguish the rotating pointer layout from the non-rotating touch expansion. The previous implementation rejected it for that reason and was right.

**Acceptance:** `change-detection.spec.ts` still passes (it walks `src/app` and fails on an unregistered component); no constructor DI introduced; `npm run lint:deps` unchanged at 0 violations.

### 3.2 Template

**File:** `project-card/project-card.html` (34 → ~110 lines)

Two faces inside one `.project-card__inner` grid cell. Front gains the flip button; back carries heading, `summary`, four numbered `highlights`, `advantage`, an optional `platform` chip, a `routerLink` to the detail route and — **only when `product().url` exists** — the outbound link.

Two rules the previous implementation broke:

- `@if (product().url; as url)` — the outbound link is **omitted**, not rendered empty. `roar-organic` and `connected-car` have no honest destination.
- The "opens in a new tab" notice goes **inside the accessible name**, not a visually-hidden span beside an `aria-label`. An `aria-label` discards element contents. Copy `product-detail.html:18-24`, which is already correct.

**Acceptance:** a card with no `url` renders one action button and no empty `href`; the outbound link's computed accessible name contains the locale's `newTab` string in `en`, `hy` and `ru`.

### 3.3 Stylesheet

**File:** `project-card/project-card.scss` (113 → ~300 lines); `products.scss` regains `perspective: 1400px` on `.projects__card`

Per `PRODUCTS_UX_UI_CONCEPT.md` §3.2–3.3. The load-bearing rule:

```scss
.project-card__face {
  visibility: hidden;
  transition: visibility 0s linear motion.duration(flip);
}
.project-card__face--front {
  visibility: visible;
}
:host(.is-flipped) .project-card__face--front {
  visibility: hidden;
}
:host(.is-flipped) .project-card__face--back {
  visibility: visible;
  transition-delay: 0s;
}
```

**Acceptance:** `npm run lint:styles` passes including `no-duplicate-selectors` (the previous implementation carried a 26-line verbatim duplicate inside `@media (hover: none)` — do not reintroduce it); both faces share one grid cell so the card sizes to the taller one; per-locale row-height e2e assertions pass in `en`, `hy`, `ru`.

### 3.4 Dictionary

**File:** `product.content.ts` — restore `detailsLabel`, `closeLabel`, `viewProject` in all three locales. `visitSite` and `newTab` already exist.

**Acceptance:** `product-content.spec.ts` passes — exact id parity, every field in `en`/`hy`/`ru`, trimmed, budgets held.

### 3.5 Band wiring

**Files:** `products.ts` (restore the `labels` computed and `ProjectCardLabels`), `products.html` (`[labels]="labels()"`).

**Acceptance:** `strictTemplates` passes; a dictionary rename breaks the build at the producer, not in the child's template.

---

## Phase 4 — The no-hover model **(ships with Phase 3, never after)**

**File:** `project-card.scss`, inside `@media (hover: none)`

The back face expands in place below the front rather than turning, via `grid-template-rows: 0fr → 1fr` — an auto-height animation that stays off the layout path.

**The rule that must not be got wrong again:**

```scss
@media (hover: none) {
  .project-card__back-inner {
    visibility: hidden;
    overflow: hidden;
  }
  :host(.is-flipped) .project-card__back-inner {
    visibility: visible;
  }
}
```

`overflow: hidden` clips content **visually**. Clipped content stays focusable and stays in the accessibility tree. That omission is what left ~55 off-screen controls reachable across nineteen cards, and it is the single reason the whole feature was removed.

**Acceptance (all automated, all on the Phase 1 project):**

- `document.activeElement` never enters a `.project-card__face--back` while `:host` lacks `.is-flipped`.
- Tabbing from one card's flip button reaches the next card's, with nothing in between.
- The flip button's `aria-expanded` matches the rendered state in both positions.
- axe WCAG 2.2 AA reports zero violations in **both** states.
- `npm run e2e` green on `chromium`, `webkit` and `mobile-chrome`.

---

## Phase 5 — Product-page refinements **(P2)**

Per `PRODUCTS_UX_UI_CONCEPT.md` §4.1. **Sections 5 (Technology & Architecture) and 7 (Visual Showcase) are not built** — see Phase 7.

### 5.1 Archetype-varied hero composition

**Files:** `product-detail.html` (`[attr.data-archetype]="item.archetype"`), `product-detail.scss`

Six layout variants delivered through CSS, not through images that do not exist. **This also gives `ProductView.archetype` its first real consumer** — it is currently assigned and never read.

**Acceptance:** all six archetypes render distinctly at 390/768/1440 px; `e2e/overflow.spec.ts` passes; `product-detail.scss` stays within its budget — **note it already exceeds the 5 kB warn threshold at 5.94 kB, so this phase must reduce elsewhere or raise the budget deliberately.**

### 5.2 Extract checkable facts into a typed field

**Files:** `product.content.ts`, `data/product-view.ts`, `product-detail.html`

Numbers already inside `advantage`/`about` prose — _"4.8/5 from 12,000+ verified reviews"_ (Hydrant), _"4.88 average"_ (LAV), _"nine Auckland stores"_ (Tai Ping), _"five showrooms"_ (Robert Irwin), _"five cities, two languages"_ (Mertel), _"seven releases Apr–Aug 2025"_ (Draculai) — surfaced as an optional `facts?: readonly LocalizedText[]`.

**This is extraction, not invention**, and it is the highest-value copy change available: these are the portfolio's most persuasive and most checkable assets, currently buried mid-paragraph.

**Acceptance:** every fact traces to an existing sentence in the same product's copy; `facts` is optional and products without one render unchanged; `product-content.spec.ts` extended to hold the new field to three locales.

### 5.3 Mezave

The only non-commercial product, and the strongest trust signal on the site. It should not render identically to a Shopify storefront. Handled by 5.1's `app` variant plus a single copy emphasis — **no new section.**

---

## Phase 6 — Payload and view-model split **(P2, own PR)**

Pre-existing debt that the flip makes worse: the back face reintroduces `summary` and `highlights` to the grid, but `about`, `advantage` and `value` remain detail-only.

**Measured today:** `/our_work/index.html` modulepreloads a **117 828 B / 36 956 B gzipped** chunk containing Armenian dictionary prose. Over `product.content.ts` (126 820 B): `about` 46.4 %, `highlights` 12.7 %, `summary` 9.4 %, `advantage` 7.3 %, `value` 7.2 %.

1. Split `ProductView` into `ProductCardView` (`id`, `archetype`, `archetypeLabel`, `icon`, `name`, `category`, `hook`, `summary`, `highlights`, `advantage`, `platform?`, `url?`, `cardImage`, `path`) and `ProductDetailView extends ProductCardView` (`value`, `about`, `mainImage`, `experienceImage`).
2. Move `about` and `value` into a second dictionary keyed `our-work-product-detail`, imported only by `product-detail.ts`.
3. Split `product-content.spec.ts` to match — nothing dropped; moved fields take their budgets with them.

**Acceptance:** no chunk preloaded by `our_work/index.html` contains a product's `about` prose (grep each for a known Armenian sentence; it currently returns a hit); `our_work/draculai/index.html` still contains the full `about`; `verify:bundle` and `verify:prerender` pass; before/after chunk sizes recorded.

**Risk: medium.** Largest blast radius here. Do it after Phase 3 so a payload regression cannot be confused with the flip.

---

## Phase 7 — Blocked on assets **(decisions, not code)**

Neither item is an engineering task. Both are in `PRODUCTS_ANALYSIS.md` §5.

| Item                                         | Blocker                                                                                | Decision needed                                                                                                                                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Visual Showcase** (brief §2.3.7)           | Zero screenshots exist; 3 images per product, 2 abstract and captioned as compositions | Capture screenshots from the 17 products with live URLs — **which first requires confirming what may be shown**, since several credit other studios (`product.content.ts:1-14`) — or drop the section |
| **Technology & Architecture** (brief §2.3.5) | Only `platform` is verified; 4 of 19 products lack even that                           | Supply verified technical facts per product, or keep `platform` as a hero chip                                                                                                                        |
| **Multi-image card front** (brief §2.1)      | One photograph per product                                                             | Unblocked by the same screenshots. The concept's media band becomes a 3-dot paged strip; nothing else changes                                                                                         |
| **Crop intent** for 3 tall photographs       | `meal.webp` loses ≈41 % of its height to a centred 16/10 crop                          | Confirm the subject survives centring, or specify a focal point per image                                                                                                                             |
| **Connected Vehicle App**                    | Its own copy records that no published presence could be established                   | Supply a listing, or accept the current level of specificity                                                                                                                                          |

---

## 3. Summary

| Phase | Priority | Files |   Risk   | Outcome                                                 |
| :---: | :------: | :---: | :------: | ------------------------------------------------------- |
|   1   |  **P0**  |   2   |   Low    | The no-hover branch is executed by CI                   |
|   2   |    P1    |  ~5   | Very low | Hover lift responsive; band named; comment true         |
|  3+4  |  **P1**  |  ~8   |  Medium  | Flip on pointer, expansion on touch, nothing hover-only |
|   5   |    P2    |  ~4   |   Low    | Varied hero compositions; checkable facts surfaced      |
|   6   |    P2    |  ~8   |  Medium  | Grid chunk ≈118 kB → ≈30 kB                             |
|   7   |    —     |   0   |    —     | Two sections unblocked, or formally dropped             |

**Deliberately not proposed:** no new component (brief rule 2), no new dependency (rule 3), no deletion or rename (rule 4), no invented functionality (rule 5), no new design token, no redesign of the 87 prerendered detail routes, and no flip that ships without its touch-device counterpart.

**The one thing that must not be compromised:** Phase 1 before Phase 3, and Phase 4 with Phase 3. The feature was removed once because hover-only content is unreachable for keyboard and touch users, and because the collapsed state stayed in the accessibility tree. Both failures were invisible to CI. Phase 1 makes them visible; Phase 4 makes them impossible.
