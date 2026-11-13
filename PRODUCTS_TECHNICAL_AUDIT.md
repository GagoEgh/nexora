# `app-products` — Technical Audit

**Project:** Nexora (`C:\Users\xXx\Desktop\nexora`)
**Scope:** `app-products` and every entity that participates in its behaviour
**Date:** 2026-11-14
**Stack as verified:** Angular `^22.2.3`, TypeScript `~6.0.0`, Angular Material/CDK `^22.2.3`, `intlayer` / `angular-intlayer` `^9.7.0`, RxJS `~7.8.0` (`package.json:36-66`)
**Method:** source reading plus inspection of the build output (`dist/nexora/browser/`), the rendered page at three viewports, and a full execution of the project's own gate commands.

> **Superseded on 2026-11-14 by `PRODUCT_VERIFICATION_CHECKLIST.md`.** This document describes the card as a single face, which it no longer is: the flip and its back face were rebuilt - on hover, tap and focus, with no "Details" button - under the decisions recorded in that checklist. Statements here about the absence of a second face, of the `flipped` signal, of the host listeners or of `perspective` were true when written and are **not** true of the current code. Everything else - the image restoration, the finding register, the budgets, the dictionary measurements - still holds.

> **This revision supersedes the first.** The first audit described a card with two faces, reached by hover or by a "Details" button. That button and that face have since been removed (§0). Every section below describes the component **as it is now**; where a finding was closed by the removal rather than by a fix, it is listed as closed with the reason, so the register stays readable against the earlier document.

---

## 0. Changes implemented in this revision

Two changes were requested. One was implemented; the other was investigated and deliberately not made, with the evidence recorded.

### 0.1 The "Details" button was removed — and the face it opened went with it

**Implemented.** `project-card.html` no longer contains a `.project-card__toggle` button, a `.project-card__face--back`, a `.project-card__inner`, a close button, a `.project-card__action` link set, or any `aria-expanded` / `aria-controls` pair.

The button could not be removed on its own. Hover was the only other trigger for the second face, so deleting the button would have left the summary, the four highlights and the outward link reachable **only** by a pointer — unreachable from any keyboard and any phone. That is a WCAG 2.1.1 (Keyboard) failure, and it would also have re-opened **PRD-P1-01**, which had just been fixed. The alternatives were:

| Option                             | Consequence                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Remove the button, keep hover      | Content reachable by pointer only. Rejected — WCAG 2.1.1.                                                     |
| Make the whole card the toggle     | The card's title link and the toggle would occupy the same target; the title link would have to go. Rejected. |
| **Remove the button and the face** | **Chosen.** The card does one thing; the page it opens does the rest.                                         |

No content was lost. Every field the back face showed — `summary`, `highlights`, the outward link to the live product — already exists on `/our_work/:slug`, which the card title links to. The outward link in particular is now rendered once per product on the detail page (`product-detail.html:18-24`) instead of twice.

What was deleted along with it: the `flipped` signal, the four host listeners that arbitrated it (`mouseenter`, `mouseleave`, `focusout`, `keydown.escape`), the `afterNextRender` focus choreography that moved the caret between faces, the `viewChild` handles both buttons needed, the `backId` / `openLabel` / `closeLabel` computeds, the `ProjectCardLabels` interface and the `labels` computed that fed it from the band, three dictionary entries (`detailsLabel`, `closeLabel`, `viewProject`) in all three locales, and both halves of the `hover` media split in the stylesheet.

**Size effect:** `project-card.ts` 143 → **34** lines; `project-card.html` 107 → **34**; `project-card.scss` 391 → **107**; `products.ts` 38 → **27**.

### 0.2 The card images were audited and left unchanged

**Deliberately not changed, on evidence.** The brief states: _"Do not replace images that already represent their corresponding products accurately unless there is an objective reason to do so."_ No such reason was found. The investigation is recorded in §7; the short version:

- All 38 images (19 × `main-visual` + `experience-visual`) are generated deterministically by `scripts/generate-product-images.mjs` from a per-product `PRODUCT_ART` table. Re-running `npm run images:products` reproduces the committed files **byte-identically**.
- Each of the 19 entries has its own palette, its own motif (19 distinct motifs) and its own UI composition (15 distinct). All 38 files have distinct md5 hashes — no image is shared, generic or repeated.
- Each motif was cross-referenced against its product's registry entry and copy, and against the live destination where one exists. Every pairing is defensible (Draculai → capsule + ECG trace; JDM West Coast → piston; Tai Ping → shelving and basket; LAV → dressing bottle, because `dresslav.com` sells salad dressings and not apparel; Mezave → a shared bowl).
- They are abstract compositions, not screenshots, and nothing in the product copy or markup presents them as screenshots. `product-meta.ts` and the generator both state this.

Replacing them would have meant substituting conceptual art for conceptual art with no accuracy gain, and the one thing that would be a real improvement — genuine interface captures — cannot be produced from this repository and would carry an authorship implication the project explicitly avoids (`product.content.ts:1-14`).

---

## 1. What the functionality is

`app-products` is the portfolio grid band of the **Our Work** page. It renders a header (eyebrow, title, intro, contact CTA) and a nineteen-item grid of `app-project-card`. Each card now shows **one face**: the generated visual, an archetype tag, the product name linked to its detail route, the category, and a one-sentence hook.

It is rendered at `/our_work` (and `/hy/our_work`, `/ru/our_work`) as the second child of `app-our-work`. It is **not** routed directly — it is a presentational band composed by its page.

### Component and entity structure

```
app-our-work                     src/app/pages/our-work/our-work.ts
├── app-page-intro               src/app/shared/ui/page-intro/page-intro.ts       (h1, breadcrumb, lead)
│   └── app-about-products       src/app/pages/our-work/about-products/           (projected <dl> panel)
└── app-products                 src/app/pages/our-work/products/products.ts      ◄── AUDIT TARGET
    └── app-project-card ×19     src/app/pages/our-work/products/project-card/
        └── app-icon-tile        src/app/shared/ui/icon-tile/icon-tile.ts
```

The band's entire interactive surface is now **twenty links**: one per card, plus the header CTA. It has no buttons, no disclosure state and no outbound destinations.

---

## 2. TypeScript analysis

### 2.1 `products.ts` (27 lines)

`src/app/pages/our-work/products/products.ts`

| Aspect                | Finding                                                                                                                                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Size / responsibility | 27 lines, four fields and one computed. It resolves copy and delegates everything else. Correct altitude for a band component.                                                                                                                |
| DI                    | No constructor. `useDictionary` / `useLocale` field initialisers only. Idiomatic Angular 22.                                                                                                                                                  |
| Lifecycle hooks       | **None.** Nothing here needs one — a deliberate absence rather than an omission.                                                                                                                                                              |
| Change detection      | No `changeDetection` declared. `change-detection.spec.ts:75-97` documents that Angular 22 compiles an omitted strategy to OnPush and pins that with three tests, one of which walks `src/app` and fails if a new component is not registered. |
| Type safety           | `products()` is `readonly ProductView[]`; the single `[product]` input is `input.required`, so a missing binding is a template compile error.                                                                                                 |
| Error handling        | None, and none is reachable: `products()` maps a compile-time-fixed tuple, and `product-content.spec.ts` fails the build if any id/field/locale is missing.                                                                                   |
| Unused imports        | None.                                                                                                                                                                                                                                         |

**Change from the previous revision.** The `labels` computed and its `ProjectCardLabels` type are gone. The band no longer fans a five-field string bag out to nineteen children; each card reads nothing from the band but its own `ProductView`.

**Remaining observation.** `products()` calls `toProductViews(this.content())`, which materialises the **full** detail-page view model for all nineteen products. The grid now reads **8 of the 17 `ProductView` fields** (`id`, `archetypeLabel`, `icon`, `name`, `category`, `hook`, `mainImage`, `path`); nine are built and never read. The removal of the back face made this worse, not better — `summary` and `highlights` moved from the grid's column into the unused one. See **PRD-P2-02**.

### 2.2 `project-card.ts` (34 lines)

`src/app/pages/our-work/products/project-card/project-card.ts`

The class is now four lines of body:

```ts
export class ProjectCard {
  readonly product = input.required<ProductView>();

  protected readonly locale = useLocale().locale;
}
```

- **No state.** The `flipped` signal is gone, with the host listeners, the focus choreography and the `viewChild` handles. There is nothing left to get into an inconsistent state, and nothing that needs a test for what happens when a pointer leaves while focus is inside.
- **No imperative DOM work.** `ElementRef`, `DOCUMENT` and `afterNextRender` are no longer imported. The component has no injection sites at all beyond `useLocale`.
- **The doc comment carries the history.** The removal is explained at the top of the file, including why the face could not survive the button, so the next reader does not reintroduce it.

**Remaining weakness.** The separator `' — '` between name and category in the card's `aria-label` is hardcoded in the template rather than in the dictionary. Harmless for `en`/`hy`/`ru`; a translation defect the day a locale with different punctuation conventions is added. **PRD-P3-06** (narrowed — the two code-side separators it also covered were deleted).

### 2.3 Data layer

`src/app/pages/our-work/products/data/`

| File                        | Responsibility                                                                                                                    | Assessment                                                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `product-ids.ts` (38)       | `PRODUCT_IDS` const tuple → `ProductId` union; `isProductId` type predicate.                                                      | Correct. The predicate is the boundary between a route parameter and an index lookup, and `product-ids.spec.ts` attacks it with `'../contact'`, `0`, `undefined`, `''`.                     |
| `product-meta.ts` (177)     | Structural facts: archetype, art folder, optional `url`, optional `platform`.                                                     | ``ExternalUrl = `https://${string}` `` makes a relative URL a compile error — the single best type in the feature. Absent `url`/`platform` are documented as "not established, never none". |
| `product-view.ts` (110)     | Joins meta + copy into `ProductView`; `productPath`, `toProductViews`, `toProductView`, `nextProductId`.                          | Still the correct seam, but now serving two consumers with sharply different needs. See **PRD-P2-02**.                                                                                      |
| `product.content.ts` (1120) | The intlayer dictionary: band copy, six archetype labels, section headings, and nineteen products × eight fields × three locales. | Complete and disciplined, but it is one 126.8 KB file, now **83 % detail-only**. See **PRD-P2-02** and **PRD-P3-01**.                                                                       |

**Confirmed issues in the data layer**

- `ProductView.archetype` is **never read** by any consumer. Only `archetypeLabel` and `icon`, both derived from it, are used.
- `PRODUCT_ARCHETYPES` (`product-meta.ts:10-17`) is exported but used only to derive its own type on the next line. No importer exists.
- The doc comment at `product-meta.ts:4-9` states _"eleven of nineteen products are storefronts"_. The registry contains **seven** (storefront 7, app 3, configurator 3, corporate 2, lead-generation 2, trade 2). The same comment says the archetype "gives the grid a filter vocabulary" — **no filter exists**. Stale documentation, not a code defect. **PRD-P3-04**.

---

## 3. HTML template analysis

### 3.1 `products.html` (24 lines)

- Modern control flow only: `@for … track product.id`. Tracking by stable id, not `$index`.
- Semantic list markup: `<ul class="projects__grid">` / `<li class="projects__card">`, so the grid is announced as a nineteen-item list.
- The child binding is now a single input: `<app-project-card [product]="product" />`.
- `contactPath | localizedPath: locale()` is a pure pipe, memoised per input pair.
- **Gap:** `<section class="projects">` has no accessible name — no `aria-labelledby`, and `.projects__title` has no `id`. The sibling band does this correctly (`about-products.html:1,4`). An unnamed `<section>` is not exposed as a landmark, so this is a missed navigation affordance rather than an axe violation. **PRD-P3-02** — the one P3 in this feature that survived the removal unchanged.

### 3.2 `project-card.html` (34 lines)

Two blocks: a `__media` figure-like div (image + archetype tag) and a `__body` (title link, category, hook).

Strong points: `width`/`height` + `loading="lazy"` + `decoding="async"` on the image; one `routerLink` through `localizedPath`; a per-product accessible name on the title link that **contains** its visible text, satisfying WCAG 2.5.3 (Label in Name) — pinned by `project-card.spec.ts:96-104`.

**The two confirmed template defects from the previous revision are closed, both by deletion:**

1. **The "opens in a new tab" notice that was never announced** (old `project-card.html:92-102`) is gone with the outward link. The surviving implementation is `product-detail.html:18-24`, which has **no** `aria-label`, so its visible text plus the visually-hidden `({{ newTab }})` span together form the accessible name — the correct behaviour, and the one the old card markup was contradicting. **PRD-P2-03 closed.**
2. **`aria-expanded` / `aria-controls` on a control nested inside the region it controlled** is gone with the disclosure. **PRD-P3-03 closed.**

`alt=""` on the card image remains **correct, not a defect** — the product name is in an adjacent heading, and `project-card.spec.ts:79-94` documents and pins the decision.

---

## 4. SCSS / CSS analysis

### 4.1 Architecture

Both stylesheets consume only tokens and mixins resolved through `stylePreprocessorOptions.includePaths: ["src/styles"]` (`angular.json:40-42`). No raw colour, no magic spacing, no `::ng-deep` — the last is machine-enforced by `.stylelintrc.cjs:34-41`, together with flat BEM and `declaration-no-important`. Encapsulation is respected.

`project-card.scss` is now **107 lines**, down from 391. The file no longer has a media split at all beyond a four-line hover-zoom rule and its reduced-motion counterpart:

```scss
@media (hover: hover) {
  :host(:hover) .project-card__img {
    scale: 1.04;
  }
}
```

### 4.2 Confirmed defect — the hover lift is delayed by up to 420 ms _(still open)_

`src/app/pages/our-work/products/products.scss:106-107`

```scss
@include reveal.item(120ms, $hover: true); // transitions: opacity, transform, translate, box-shadow
@include reveal.stagger(6, 60ms, 120ms); // ← $hover omitted
```

`reveal.stagger` forwards `$hover` to `_delay` (`src/styles/mixins/_reveal.scss:55-73`). With `$hover: true` it emits a four-value `transition-delay` that zeroes the two interaction properties; without it, it emits a single value applying to **all four**. Compiled output confirms it:

```css
.projects__card:nth-child(n + 7) {
  transition-delay: 0.42s;
}
```

versus the project's own correct pattern on the band directly above:

```css
.glance__row:nth-child(5) {
  transition-delay: 0.5s, 0.5s, 0s, 0s;
}
```

**Effect:** `reveal.lift()` animates `translate` and `box-shadow` on `:hover` / `:focus-visible` / `:focus-within`. On `.projects__card` those two inherit the entrance delay — 120 ms for the first card and **420 ms for cards 6 through 19** (fourteen of nineteen). This is a deviation from an established convention: eight other bands pair `item($hover: true)` with `stagger(…, $hover: true)`. The same omission exists at `expertise.scss:95-96` and `what-we-build.scss:86-87`, so the fix should sweep all three.

Invisible to the test suite because `playwright.config.ts` runs every spec with `reducedMotion: 'reduce'`, which zeroes `--nx-motion-lift`. **PRD-P2-01 — not fixed in this revision; it is in neither requested change and touches two files outside the audit scope.**

### 4.3 Closed — the 26-line duplicated block

The previous revision recorded a verbatim duplication of the `.project-card__toggle` / `.project-card__action` declarations inside `@media (hover: none)`. Both the selectors and the media query are gone. **PRD-P2-04 closed by deletion.**

### 4.4 Closed — the touch branch left the hidden face in the tab order

The previous revision's highest-severity finding: in `@media (hover: none)` the back face was collapsed with `grid-template-rows: 0fr` and `overflow: hidden` and **never** given `visibility`, `display` or `inert`, so roughly 38–57 off-screen controls stayed focusable and every product's summary and highlights stayed in the accessibility tree on the page's primary mobile presentation.

It was first fixed with a `visibility` rule mirroring the pointer branch. That fix is now moot: there is no second face and no media branch. **PRD-P1-01 closed.**

Verified on the rendered page rather than by reading: `e2e/our-work.touch.spec.ts` runs a genuinely `isMobile` Chromium project on `/our_work` and asserts that **no** `a` or `button` inside a card fails `checkVisibility({ visibilityProperty: true })`, and that no `.project-card__face--back`, `.project-card__toggle`, `.project-card__action`, `[aria-expanded]` or `button` exists at all.

### 4.5 Other CSS notes

- Reduced motion is handled deliberately in two layers now rather than three: the duration tokens are zeroed globally (`_motion.scss:52-58`), `reveal.hidden()` is wrapped in `prefers-reduced-motion: no-preference`, and `project-card.scss:97-107` removes the image transition and the hover zoom the tokens cannot reach.
- Modern CSS used correctly: logical properties throughout, `aspect-ratio`, `minmax(0, 1fr)` + `min-width: 0` to stop grid blowout, `scale` as an independent property.
- `products.scss` no longer sets `perspective` on the grid cell — that existed solely for the 3D flip.
- `anyComponentStyle` budget is 5 kB warn / 8 kB error (`angular.json:52-57`); both stylesheets are now far inside it.

---

## 5. Dependency analysis

Every entity below was verified to have a real relationship with `app-products`.

| Entity                              | Declared in                                                                                                      | Used by                                                                                     | Responsibility                                                        | Justified?                                                                                             | Debt / constraint                                                                                          |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `ProjectCard`                       | `products/project-card/project-card.ts`                                                                          | `products.html:20`                                                                          | Card presentation. No state.                                          | Yes                                                                                                    | None. The reusability deduction it carried in the previous revision was the disclosure logic, now deleted. |
| `toProductViews` / `ProductView`    | `products/data/product-view.ts`                                                                                  | `products.ts:21`, `product-detail.ts:59,64`                                                 | Joins registry + copy into one view model                             | Yes — the seam that keeps grid and detail consistent                                                   | Grid now reads 8 of 17 fields (**PRD-P2-02**); `archetype` field dead                                      |
| `PRODUCT_META` / `ProductMeta`      | `products/data/product-meta.ts`                                                                                  | `product-view.ts:72,81-85`                                                                  | Structural facts, art folder, outward URL                             | Yes                                                                                                    | Stale comment (**PRD-P3-04**); `PRODUCT_ARCHETYPES` export unused                                          |
| `PRODUCT_IDS` / `isProductId`       | `products/data/product-ids.ts`                                                                                   | `product-view.ts:91`, `product-detail.ts:54`, `app.routes.server.ts:5`, `sitemap.spec.ts:3` | Published URL contract and ordering                                   | Yes                                                                                                    | Each added product adds 3 prerendered routes (**PRD-P3-07**)                                               |
| `productContent`                    | `products/product.content.ts`                                                                                    | `products.ts:20`, `product-detail.ts:42`                                                    | All copy for grid + detail, 3 locales                                 | Yes                                                                                                    | 126.8 KB single file, now **83 % detail-only** (**PRD-P2-02**, **PRD-P3-01**)                              |
| `LocalizedPathPipe`                 | `core/i18n/localized-path.pipe.ts`                                                                               | `products.html:10`, `project-card.html:23`                                                  | Prefixes a route with the active locale                               | Yes — pure pipe, memoised                                                                              | None                                                                                                       |
| `useLocale` / `useDictionary`       | `angular-intlayer`                                                                                               | `products.ts:20-21`, `project-card.ts:33`                                                   | Reactive locale + dictionary access                                   | Yes                                                                                                    | Couples components to intlayer's API surface; contained by `LocalizedText`                                 |
| `Reveal`                            | `shared/motion/reveal.ts`                                                                                        | `products.html:1`                                                                           | Sets `data-reveal` via `IntersectionObserver` after render            | Yes — observer disconnects on first intersection and on destroy                                        | Entrance state applied after hydration (**PRD-P3-08**, unconfirmed)                                        |
| `IconTile`                          | `shared/ui/icon-tile/icon-tile.ts`                                                                               | `project-card.html:6-11`                                                                    | Tinted icon chip, `aria-hidden` at the host                           | Yes                                                                                                    | None                                                                                                       |
| `appIcon` / `AppIconName`           | `core/icons/icons.ts`                                                                                            | `products.ts:22`, `product-meta.ts:22-29`                                                   | Namespaced SVG icon ids, union-typed                                  | Yes — `ARCHETYPE_ICONS` is `Record<ProductArchetype, AppIconName>`, so an icon typo is a compile error | None                                                                                                       |
| `CONTACT_PATH` / `OUR_WORK_SEGMENT` | `core/routing/paths.ts`                                                                                          | `products.ts:23`, `product-view.ts:3,59`, `app.routes.ts:3`, `app.routes.server.ts:4`       | Route constants                                                       | Yes                                                                                                    | No `OUR_WORK_PATH`; `header.content.ts:31` hardcodes `'/our_work'` (**PRD-P3-09**)                         |
| `MatButton` / `MatIcon`             | `@angular/material`                                                                                              | `products.html:10,12`                                                                       | Header CTA only — the card no longer imports Material                 | Yes                                                                                                    | Material is already in the initial bundle for the header                                                   |
| `RouterLink`                        | `@angular/router`                                                                                                | `products.html:10`, `project-card.html:23`                                                  | SPA navigation with locale prefix                                     | Yes                                                                                                    | None                                                                                                       |
| Product art ×38                     | `src/assets/images/products/product-NN/`                                                                         | `product-view.ts:81-82` via `productImage`                                                  | `main-visual` (grid + detail hero), `experience-visual` (detail only) | Yes — audited in §7, unchanged                                                                         | The grid computes `experienceImage` for all 19 and uses none (**PRD-P2-02**)                               |
| Shared SCSS                         | `styles/tokens/{spacing,layout,motion}`, `styles/mixins/{container,eyebrow,reveal,text,surface,visually-hidden}` | both stylesheets                                                                            | Design system                                                         | Yes                                                                                                    | `_reveal.scss:67-73` hardcodes a four-value delay list (**PRD-P3-10**)                                     |

**Entities that left the graph with the second face:** `ProjectCardLabels` (the typed label bag), `ElementRef`, `DOCUMENT`, `afterNextRender`, `viewChild`, `signal`, and `MatButton`/`MatIcon` as card-level imports.

**Architectural boundaries are machine-enforced.** `depcruise src/app` runs in `npm run lint` and forbids cycles, `core → shared/layout/pages`, `shared → layout/pages`, `layout → pages`, cross-page imports, and any import of `app.routes.ts` outside the composition root. Verified after the change: **210 modules, 600 dependencies, 0 violations.**

---

## 6. Routing and navigation analysis

### 6.1 Route table

| Path                                                                      | File                  | Purpose                                                                            |
| ------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| `:locale` (canMatch `matchLocalePrefix`, canActivate `syncLocaleWithUrl`) | `app.routes.ts:85-90` | Wraps the whole table for `hy` / `ru`                                              |
| `''` (canActivate `syncLocaleWithUrl`)                                    | `app.routes.ts:91`    | Same table unprefixed, for the default locale `en`                                 |
| `our_work` → `''`                                                         | `app.routes.ts:56-60` | **Renders `app-products`** via `OurWork`, `loadComponent`, `data.meta: 'our_work'` |
| `our_work/:slug`                                                          | `app.routes.ts:61-69` | `ProductDetail` — one component for all nineteen products                          |
| `not-found`                                                               | `app.routes.ts:72-76` | Branded 404                                                                        |
| `**`                                                                      | `app.routes.ts:77-81` | Wildcard → `NotFound`                                                              |

Server/prerender table (`app.routes.server.ts`): 19 slugs at the default locale, 38 at the two prefixed locales, plus locale homes and page segments — **87 routes**, verified in the build.

### 6.2 Verified behaviours

- **Lazy loading** — every page uses `loadComponent`; no `loadChildren`, no NgModule.
- **Guards** — `matchLocalePrefix` is a `CanMatchFn`, so a non-locale first segment falls through to the unprefixed table instead of 404-ing. `syncLocaleWithUrl` reconciles the intlayer locale with the URL. No guard on `our_work/:slug` — see 6.3.
- **Resolvers** — none anywhere in the application.
- **Parameters** — `ProductDetail` reads `paramMap` through `toSignal` and narrows with `isProductId`. No query parameters.
- **Internal links** — **the grid's navigation surface is now simpler than it was.** The card title (`project-card.html:23`) and the band CTA (`products.html:10`) are the only links in the band, both `routerLink` + `localizedPath`. The "View project" duplicate link and the outward `[href]` both moved to the detail page with the face that carried them. `products.spec.ts:129-134` now asserts the grid contains **no** `a[target="_blank"]` and **no** `a[href^="http"]` at all.
- **Unknown routes** — `public/_redirects:15-17` serves the locale-appropriate prerendered 404 with a real HTTP 404; the client-side effect at `product-detail.ts:110-114` is a defensive net.
- **Localisation** — three locales, `prefix-no-default`, verified end-to-end by `products.spec.ts:136-143` and `e2e/our-work.spec.ts`.
- **SEO** — `provideDocumentMeta` is the single writer for the document head: canonical, `hreflang` per locale plus `x-default`, a JSON-LD `@graph`, and `noindex, follow` scoped to the 404. `public/sitemap.xml` is pinned by `core/seo/sitemap.spec.ts`, which rebuilds the expected URL set from `DOCUMENT_META_PAGES` + `PRODUCT_IDS` + `productPath`.

### 6.3 Routing findings

All four survive the change unchanged — none was related to the card's interaction model.

1. **URL vocabulary is inconsistent.** `our_work` and `ai_agent` are snake_case; everything else is kebab-case. These are published contracts; changing them needs 301s, a sitemap regeneration and a re-crawl. Recorded as a decision to accept, not a task. **PRD-P3-11**.
2. **No `OUR_WORK_PATH` constant.** Three constructions of one path, one a bare literal in a content file. **PRD-P3-09**.
3. **Navigation performed inside an `effect`.** `product-detail.ts:110-114` is the only place routing is driven by a reactive effect rather than a guard. **PRD-P3-12**.
4. **Breadcrumb label mismatch in English.** Visible "Our works" vs JSON-LD "Our Work". `hy` and `ru` match. **PRD-P3-13**.

---

## 7. The image audit

The second requested change was to update the card images so each accurately represents its product. The conclusion was to change nothing. The evidence:

### 7.1 How the images are produced

`scripts/generate-product-images.mjs` (1439 lines) renders all 38 files with `sharp` from a declarative `PRODUCT_ART` table — 19 entries, each with its own `palette` (four colours), `motif`, `ui` composition, `variant` and `frame`. Output: `src/assets/images/products/product-NN/{main-visual,experience-visual}.webp`, 1280×800, quality 74.

### 7.2 What was checked, and how

| Check                             | Method                                                                                                  | Result                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Images are not random or stock    | Read the generator; every pixel is drawn from the per-product table                                     | **Pass** — no external or stock source exists                                             |
| No two products share an image    | md5 of all 38 files                                                                                     | **Pass** — 38 distinct hashes                                                             |
| No generic repeat across products | Counted distinct `motif` and `ui` values in `PRODUCT_ART`                                               | **Pass** — 19 distinct motifs, 15 distinct UI compositions                                |
| Committed files match the source  | `npm run images:products`, then re-hash                                                                 | **Pass** — byte-identical; the generator is deterministic                                 |
| Each motif matches its product    | Rendered two contact sheets, cross-referenced each tile against `product-meta.ts` + the dictionary copy | **Pass** — no mismatch found (examples in §0.2)                                           |
| Not presented as real screenshots | Read the copy and the markup for any screenshot claim                                                   | **Pass** — none; `alt=""`, and `product-meta.ts` records the art as generated composition |
| All referenced paths resolve      | `npm run verify:images`                                                                                 | **Pass** — 19 products, 38 images, 294.4 kB, all WebP, all referenced                     |

### 7.3 What an objective reason to replace would have looked like

A product whose motif contradicts what it does; two products sharing one visual; a file referenced but missing; an image carrying another company's branding or a real screenshot presented as this project's work. None of these is present. The one visual that most invited suspicion — **LAV**, whose name reads like apparel — was checked against its live destination (`dresslav.com`, salad dressings) and its dressing-bottle motif is correct.

**This remains the one open judgement in the deliverable:** if the intent is genuine interface captures rather than abstract art, that is a different and larger piece of work, and it is listed in §11 as a decision rather than a defect.

---

## 8. Test coverage of the feature

| Suite | File                            | What it pins                                                                                                                                                                                                                                                               |
| ----- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit  | `products.spec.ts` (167)        | 19 cards, registry-ordered detail hrefs, unique art, `loading=lazy`, **one link per card and nothing else**, **no collapsed or turned-away region**, **nothing off-site**, locale-prefixed CTA, dictionary-key isolation, `ru` translation                                 |
| Unit  | `project-card.spec.ts` (168)    | Card content, `alt=""` + dimensions + `decoding`, detail href, accessible name containing visible text (WCAG 2.5.3), **exactly one link and no buttons**, **no hidden content left behind**, **statelessness under `mouseenter`**, identical render with and without `url` |
| Unit  | `product-content.spec.ts` (121) | Dictionary key, exact id parity in order, every archetype named, every field in all 3 locales, trimmed, 4 highlights each, character budgets, single-sentence hooks, no authorship claims                                                                                  |
| Unit  | `product-ids.spec.ts` (129)     | Slug list pinned, predicate hardened, `productPath`, `nextProductId` wrap                                                                                                                                                                                                  |
| E2E   | `our-work.spec.ts` (191)        | **Does not turn, open or expand on hover** (bounding box unchanged), **reaches each card in turn by keyboard with nothing in between**, **one link per card, never leaving the site**, row heights per locale                                                              |
| E2E   | `our-work.touch.spec.ts` (119)  | **New project.** Media-query premise, 19 cards in one column, nothing focusable that is not visible, no trace of the removed face, tap opens the detail page, the live product is still reachable one page deeper, axe WCAG 2.2 AA                                         |
| E2E   | `a11y.spec.ts` (118)            | axe across 12 pages × 3 locales + 390 px. The "back face showing" case was removed and replaced by a pointer to `our-work.touch.spec.ts`                                                                                                                                   |
| Unit  | `change-detection.spec.ts`      | Walks `src/app` and fails if a component is not registered as OnPush-verified                                                                                                                                                                                              |
| Unit  | `sitemap.spec.ts`               | Rebuilds the expected URL set from the route table and `PRODUCT_IDS`, both directions                                                                                                                                                                                      |

**The coverage gap that motivated PRD-P1-02 is closed.** `playwright.config.ts` now declares a third project, `mobile-chrome`, using `devices['Pixel 7']` — genuinely `isMobile`, so `(hover: none)` and `(pointer: coarse)` really match — scoped by `testMatch` to `**/*.touch.spec.ts`, with the two desktop projects given a matching `testIgnore`. Pixel 7 rather than a touch-enabled desktop context because it is Chromium, which is the one browser CI installs (`.github/workflows/ci.yml:31`). The first test in the touch spec asserts the premise itself, so the file cannot silently pass on a desktop device.

---

## 9. Scores

| Area              | Score | Justification (evidence)                                                                                                                                                                                                                                                                                                              |
| ----------------- | :---: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code Quality      | **9** | A 27-line band and a 34-line card, intention-revealing names, comments that explain _why_ and cite the failure that motivated them. Deductions: stale facts in `product-meta.ts:4-9`, one hardcoded separator in `project-card.html:24`.                                                                                              |
| Architecture      | **9** | `core ← shared ← layout ← pages` enforced by dependency-cruiser; `product-view.ts` is a genuine seam; the presentational band is correctly not routed. The card is now single-concern. Deduction: the view model still serves two consumers with different needs.                                                                     |
| Design Patterns   | **8** | View-model mapper, const-tuple registry → union type, type predicate at the route boundary, template-literal `ExternalUrl`. Deduction: the registry's archetype taxonomy still has no consumer beyond a label and an icon.                                                                                                            |
| Angular 22        | **9** | Signals, `input.required`, `computed`, `@if`/`@for` with `track`, `loadComponent`, no NgModules, no constructor DI, OnPush asserted rather than assumed. Deductions: no `@defer` in a 19-card grid; navigation in an `effect` on the sibling route.                                                                                   |
| TypeScript        | **9** | `strict` + `noPropertyAccessFromIndexSignature` + `strictTemplates`; `ExternalUrl`; `satisfies Dictionary`; `@typescript-eslint/no-deprecated` with full type info. Deductions: dead `ProductView.archetype`; `as unknown as` casts in `product-content.spec.ts`.                                                                     |
| Signals           | **9** | The card has no state at all now, which is the correct amount. Pure `computed`s in the band; `toSignal(paramMap)` on the detail route. Deduction: one of `ProductDetail`'s two effects performs navigation.                                                                                                                           |
| HTML              | **9** | `ul`/`li`, `@for … track id`, per-product accessible names that contain their visible text, correct decorative `alt=""`, dimensioned lazy images. Deduction: unnamed `<section>` (**PRD-P3-02**).                                                                                                                                     |
| SCSS / CSS        | **8** | Token-only, BEM-linted, no `::ng-deep`, documented layout decisions, modern logical properties. 391 → 107 lines with no media split left. Deduction: **PRD-P2-01**, the delay defect, is confirmed in the build output and still open.                                                                                                |
| Performance       | **7** | Prerendered HTML, lazy + dimensioned images, OnPush everywhere, 560 kB/1 MB budgets, and roughly half the card DOM removed. Deduction: `/our_work/index.html` still modulepreloads a **117 828-byte** chunk whose dictionary is now **83 % detail-only** in three locales; `toProductViews` builds 17 fields for a grid that reads 8. |
| Scalability       | **7** | Adding a product is one id + one meta entry + one content block, and four specs fail until it is complete. Deductions: one 1120-line dictionary for grid _and_ detail; 3 prerendered routes per product (87 today); no filter or pagination.                                                                                          |
| Reusability       | **8** | `IconTile`, `Reveal`, `PageIntro`, `LocalizedPathPipe` all shared; `toProductView(s)` serves both consumers. The card is now a thin presentational component with nothing portfolio-specific to carry forward except its class names.                                                                                                 |
| Accessibility     | **9** | No hidden focusable content anywhere, on either device class, verified on a real touch project rather than by reading. Per-product accessible names that satisfy WCAG 2.5.3, `aria-hidden` icons, global `:focus-visible` ring, axe across 12 pages × 3 locales + 390 px + a Pixel 7. Deduction: **PRD-P3-02**.                       |
| Responsive Design | **9** | Documented breakpoint rationale, 9 viewports × 2 routes swept for sideways scroll, equal row heights verified per locale, and now a genuinely `isMobile` project in the matrix. Measured after the change: three equal 411×454 columns at 1440 px, one 372 px column on a Pixel 7.                                                    |
| Routing           | **8** | Lazy `loadComponent`, `CanMatch` locale prefix, all 19 slugs prerendered in 3 locales, real HTTP 404, parameter narrowed by a hardened predicate, and one destination per card instead of three. Deductions: snake_case/kebab-case split; no `OUR_WORK_PATH`; navigation in an effect.                                                |
| SEO               | **8** | One writer for the head; per-product titles distinct across locales; canonical, hreflang + `x-default`, JSON-LD graph with breadcrumbs; sitemap pinned by a spec that rebuilds it. Deductions: EN breadcrumb mismatch; one shared `og:image` for all 19 product pages.                                                                |
| Maintainability   | **9** | Tests encode intent rather than restating the implementation; the removal's reasoning is written where the next reader will find it; lint, depcruise, stylelint and five verification scripts gate the build. Deductions: the 126.8 kB dictionary, the stale `product-meta.ts` comment.                                               |

### Overall

|                            |    Score     | Previous |
| -------------------------- | :----------: | -------: |
| **`app-products` overall** | **8.4 / 10** |      8.0 |
| Architecture               |    9 / 10    |        9 |
| Code quality               |    9 / 10    |        9 |
| Styling                    |    8 / 10    |        7 |
| Routing                    |    8 / 10    |        8 |

---

## 10. Issue register

Classification: **[DEFECT]** reproduced from source or build output · **[RISK]** a plausible consequence not observed · **[OPINION]** a defensible alternative, not a fault.

### P0 — Critical

**None.** No issue found blocks functionality, loses data, or creates a security exposure. The one remaining external link carries `rel="noopener"` and is type-constrained to `https:`; the route parameter is narrowed by a hardened predicate; unknown URLs answer a real 404.

### P1 — High

**None.** Both P1 issues from the previous revision are closed:

| ID            | Title                                                      | Resolution                                                                                                                                      |
| ------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **PRD-P1-01** | Collapsed back face stays focusable and announced on touch | **Closed.** Fixed first with a `visibility` rule; then made structurally impossible — the face no longer exists. Verified on a Pixel 7 project. |
| **PRD-P1-02** | The entire touch interaction model is untested             | **Closed.** `mobile-chrome` project added to `playwright.config.ts`; `e2e/our-work.touch.spec.ts` added, 7 tests, premise self-checked.         |

### P2 — Medium

---

**PRD-P2-01 · [DEFECT] · Hover lift delayed up to 420 ms on 14 of 19 cards** · _open_

- **File:** `src/app/pages/our-work/products/products.scss:107` (also `expertise.scss:96`, `what-we-build.scss:87`)
- **Problem:** `reveal.stagger(6, 60ms, 120ms)` omits `$hover: true`, so `_reveal.scss:67-73` emits a single `transition-delay` that applies to all four transitioned properties instead of the four-value list that zeroes `translate` and `box-shadow`.
- **Evidence:** compiled — `.projects__card:nth-child(n+7){transition-delay:.42s}` versus the correct `.glance__row:nth-child(5){transition-delay:.5s,.5s,0s,0s}`. Eight other bands use the correct form.
- **Consequence:** `reveal.lift()` starts 120–420 ms after hover; the grid feels unresponsive. Invisible to CI because every spec runs with `reducedMotion: 'reduce'`.
- **Why still open:** it is outside both requested changes and the fix touches two files outside the audit scope. One-line change, no behavioural risk.
- **Fix:** add `$hover: true` to the three `stagger` calls.
- **Acceptance:** compiled rules read `transition-delay: .42s,.42s,0s,0s`; a non-reduced-motion check shows the lift beginning within one frame of `mouseenter` on the last card.

---

**PRD-P2-02 · [DEFECT] · The grid route downloads and materialises detail-page copy for 19 products in 3 locales** · _open, and now larger_

- **Files:** `src/app/pages/our-work/products/data/product-view.ts:36-99`; `products.ts:21`; `product.content.ts`
- **Evidence (re-measured after the change):**
  - `dist/nexora/browser/our_work/index.html` emits `<link rel="modulepreload">` for a **117 828-byte** chunk (**36 956 bytes gzipped**) — the only preloaded chunk containing `our-work-products`.
  - Armenian dictionary prose is present in that chunk, so all three locales ship regardless of the active one. Verified by substring match.
  - Measured over `product.content.ts` (126 820 bytes): `about` **46.4 %**, `highlights` **12.7 %**, `summary` **9.4 %**, `advantage` **7.3 %**, `value` **7.2 %**. The card now reads only `name` (1.4 %), `category` (3.2 %) and `hook` (7.3 %) — **11.9 % grid-used, 83.1 % detail-only.**
  - `toView` assigns 17 fields for all 19 products; the grid template reads 8.
- **This finding got worse, not better.** Before the change the grid used `summary` and `highlights` on the back face. It no longer does, so 22.1 % of the dictionary moved from the used column to the unused one.
- **Consequence:** the grid preloads roughly eight times the copy it needs, and allocates ~170 unused strings per render. A first-paint cost, not a correctness problem.
- **Fix (incremental, no rewrite):**
  1. Split `ProductView` into `ProductCardView` (`id`, `archetypeLabel`, `icon`, `name`, `category`, `hook`, `mainImage`, `path`) and `ProductDetailView extends ProductCardView` (the rest). `toProductViews` returns the former; `toProductView` the latter. Pure TypeScript — and the split is now clean, because no consumer straddles the line.
  2. Move the detail-only fields into a second dictionary (`our-work-product-detail`) imported only by `product-detail.ts`. esbuild then splits them into a chunk the grid route does not preload. This also relieves **PRD-P3-01**.
  3. Give the first row's images `fetchpriority="high"` and drop `loading="lazy"` for them.
- **Acceptance:** `our_work/index.html` no longer preloads the `about` prose (a known Armenian sentence is absent from every chunk it preloads); `products.spec.ts` and `product-detail.spec.ts` pass unchanged; `npm run verify:bundle` stays within budget.

---

**PRD-P2-05 · [RISK] · All 19 cards render eagerly** · _open, reduced_

- **Files:** `products.html:17-23`; `project-card.html`
- **Problem:** 19 cards are in the DOM on first paint with no `@defer`, which is available and already used elsewhere (`header.html:27,85`).
- **Reduced by the change:** it used to be 19 cards × **2 faces** × (image + 4 highlights + 2–3 controls). It is now 19 cards × 1 face × (image + 3 lines + 1 link) — roughly half the nodes and 57 fewer controls.
- **Why a risk, not a defect:** no measurement here shows a failed Core Web Vital. The page is prerendered, every image is lazy and dimensioned, `e2e/overflow.spec.ts` passes, and the budgets in `angular.json:47-58` pass (worst route `/ru/contact` at 222.8 kB gzip against 240 kB).
- **Fix:** `@defer (on viewport)` around rows after the first, with `@placeholder` sized to the card.
- **Acceptance:** a Lighthouse run on `/our_work` before and after, with LCP and TBT recorded; no regression in `e2e/our-work.spec.ts` row heights or `a11y.spec.ts`.

---

**Closed in this revision:**

| ID            | Title                                                  | Resolution                                                                                                                                                                                              |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PRD-P2-03** | "opens in a new tab" is in the DOM but never announced | **Closed by deletion.** The defective markup was the card's outward link. The surviving implementation (`product-detail.html:18-24`) has no `aria-label`, so the notice is part of the accessible name. |
| **PRD-P2-04** | 26-line duplicated declaration block                   | **Closed by deletion.** Both the duplicated selectors and the `@media (hover: none)` branch that held them are gone.                                                                                    |

### P3 — Low

| ID            | Type    | Title                                                                                                          | File                                                                                          | Fix                                                                                                            | Acceptance                                                                                           |
| ------------- | ------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **PRD-P3-01** | OPINION | 1120-line / 126.8 kB dictionary holds grid _and_ detail copy                                                   | `products/product.content.ts`                                                                 | Split per **PRD-P2-02** step 2                                                                                 | `product-content.spec.ts` passes against both files                                                  |
| **PRD-P3-02** | DEFECT  | `<section class="projects">` has no accessible name                                                            | `products.html:1,5`                                                                           | `id` on the title + `aria-labelledby`, as `about-products.html:1,4` does                                       | Section appears as a named region in an a11y tree snapshot                                           |
| **PRD-P3-04** | DEFECT  | Stale comment ("eleven of nineteen are storefronts" — actually seven) and an unbuilt "filter vocabulary" claim | `product-meta.ts:4-9`                                                                         | Correct the count; either build the filter (`services/filter-bar` is the in-house precedent) or drop the claim | Comment matches the registry                                                                         |
| **PRD-P3-06** | RISK    | Hardcoded `' — '` separator in the card's accessible name                                                      | `project-card.html:24`                                                                        | Move to the dictionary                                                                                         | All three locales produce their own separator                                                        |
| **PRD-P3-07** | RISK    | Each product adds 3 prerendered routes (87 today)                                                              | `app.routes.server.ts:24-28`                                                                  | Record the build-time cost; revisit if the catalogue passes ~40 products                                       | Build time tracked in CI                                                                             |
| **PRD-P3-08** | RISK    | Entrance state applied after hydration may dip opacity on an in-view band                                      | `shared/motion/reveal.ts:17-35`                                                               | Measure first; if real, set `data-reveal="out"` during SSR                                                     | A recorded trace of `/our_work` shows no opacity dip                                                 |
| **PRD-P3-09** | DEFECT  | No `OUR_WORK_PATH`; the path is built three ways, one a bare literal                                           | `core/routing/paths.ts`, `header.content.ts:31`, `product-detail.ts:47`, `product-view.ts:59` | Add an `OUR_WORK_PATH` constant and use it everywhere                                                          | No literal `'/our_work'` outside `paths.ts`                                                          |
| **PRD-P3-10** | RISK    | `_delay` hardcodes a 4-value delay list regardless of the transition's property count                          | `styles/mixins/_reveal.scss:67-73`                                                            | Derive the list length from the property count, or document the invariant                                      | A `stagger($hover: true)` paired with two `$extra` properties still zeroes only the interaction ones |
| **PRD-P3-11** | OPINION | URL vocabulary mixes `our_work`/`ai_agent` with kebab-case elsewhere                                           | `core/routing/paths.ts:7,9`                                                                   | **Do not change without a 301 plan.** Record the decision; new routes use kebab-case                           | A written decision exists; no new snake_case route is added                                          |
| **PRD-P3-12** | OPINION | Unknown-slug redirect runs in an `effect` rather than a guard                                                  | `product-detail.ts:110-114`                                                                   | Replace with a `CanActivateFn` using `isProductId`                                                             | `/our_work/xyz` still lands on the 404 by both server and client paths                               |
| **PRD-P3-13** | DEFECT  | EN breadcrumb reads "Our works" visibly and "Our Work" in JSON-LD                                              | `our-work.content.ts:8` vs `document-meta.content.ts:133`                                     | Align the English strings (also fix the missing sentence break in the `hy` heading)                            | Visible and structured breadcrumbs match in all three locales                                        |

**Closed in this revision:** **PRD-P3-03** (`aria-controls` from inside the controlled region — deleted with the disclosure) and **PRD-P3-05** (`ProjectCard` mixing presentation, state and focus management — the class now has one field and one computed).

**Totals — P0: 0 · P1: 0 · P2: 3 · P3: 11**
_(previously P0: 0 · P1: 2 · P2: 5 · P3: 13)_

---

## 11. Architectural risks and technical debt

1. **A monolithic dictionary on the critical path — now the largest single item.** One 126.8 kB file serves two routes with different needs, in three locales, with no split point. After this change the grid reads **11.9 %** of it. It is not slow today; it is the thing that gets slower with every product added, and nothing in the build warns about it.
2. **A view model that outgrew its grid.** `ProductView` is the union of two consumers' needs rather than either one's, and the gap widened: the grid now reads 8 of 17 fields. The upside is that the split is cleaner than it was — no consumer straddles the line any more.
3. **An unrealised organising idea.** The archetype was introduced to give the grid "a filter vocabulary" (`product-meta.ts:4-9`). The taxonomy, icons and translations exist; the filter does not — while a working `app-filter-bar` sits in `pages/services/`. Half-built abstractions attract wrong assumptions.
4. **Published URL contracts.** Nineteen slugs, three locales and a sitemap are public. The debt is the snake_case/kebab-case split, which is now expensive to correct and should be formally accepted rather than left open.
5. **Stale comments in a codebase that relies on comments.** This project uses comments as a primary mechanism for carrying intent, unusually well. That makes an incorrect one costlier here than elsewhere. `product-meta.ts:4-9` is the remaining instance; the card's own comments were rewritten with the change, and `playwright.config.ts`'s header was corrected in this revision.
6. **One interaction model, fully tested — resolved.** The previous revision's largest structural risk was two interaction models with CI covering one. There is now one model and two device classes testing it.

---

## 12. Readiness for future development

**Verdict: ready.**

The two gating items from the previous revision are closed. The foundations are strong: layering is machine-enforced, the data/copy/presentation split is clean, the registry pattern makes adding a product a four-line change that four specs refuse to let you get wrong, and SEO is wired through a single writer with prerendering and a sitemap that cannot silently drift.

One item should be done before the catalogue grows: **PRD-P2-02**, the dictionary and view-model split, because its cost scales with product count and the split will never be cleaner than it is now.

Everything else is incremental. **Nothing here warrants rebuilding the feature.**

### Decisions that belong to the product owner, not to this audit

1. **Whether the generated art should eventually become real interface captures.** The current art is accurate, unique and professional, and §7 records why nothing was replaced. Real screenshots would be a different kind of asset with a different authorship implication (`product.content.ts:1-14`), and they cannot be produced from this repository.
2. **Whether the archetype filter should be built or the claim dropped.**
3. **Whether the snake_case route vocabulary is accepted permanently.**

---

## 13. Deliverables

| Document                             | Contents                                                             |
| ------------------------------------ | -------------------------------------------------------------------- |
| `PRODUCTS_TECHNICAL_AUDIT.md`        | This document                                                        |
| `PRODUCTS_REMEDIATION_ROADMAP.md`    | Sequenced remediation plan with dependencies and acceptance criteria |
| `PRODUCTS_VERIFICATION_CHECKLIST.md` | Verification checklist across all audited dimensions                 |
