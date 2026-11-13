# `app-products` — Verification Checklist

**Companion to:** `PRODUCTS_TECHNICAL_AUDIT.md` and `PRODUCTS_REMEDIATION_ROADMAP.md`
**Date:** 2026-11-14
**Use:** run against any change to `app-products`, `app-project-card`, their data layer, `app-product-detail`, or the shared mixins they consume.

> **Superseded on 2026-11-14 by `PRODUCT_VERIFICATION_CHECKLIST.md`.** This document describes the card as a single face, which it no longer is: the flip and its back face were rebuilt - on hover, tap and focus, with no "Details" button - under the decisions recorded in that checklist. Statements here about the absence of a second face, of the `flipped` signal, of the host listeners or of `perspective` were true when written and are **not** true of the current code. Everything else - the image restoration, the finding register, the budgets, the dictionary measurements - still holds.

Legend: **[A]** automated today · **[A+]** needs a new/tightened test · **[M]** manual · **[D]** decision to record, not a pass/fail

The **Result** column records what this run actually produced. `—` means the row is a standing check with no result from this run (a manual step not performed, or a check that only applies to a future change). **No row is marked passed on the strength of reading the code; every ✅ below has a command output or a rendered page behind it.**

---

## 0. Gate commands

|  #  | Check                                          | How                                                                                                                          | Result                                                                    |
| :-: | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 0.1 | Types clean across app, specs, e2e and scripts | `npm run typecheck`                                                                                                          | ✅ clean, all four projects                                               |
| 0.2 | ESLint + dependency-cruiser + stylelint        | `npm run lint`                                                                                                               | ✅ clean; depcruise **210 modules / 600 dependencies / 0 violations**     |
| 0.3 | Unit suite                                     | `npm test`                                                                                                                   | ✅ **425 passed, 56 files**                                               |
| 0.4 | E2E suite, every project                       | `npm run e2e`                                                                                                                | ✅ see §11.1 for the per-project breakdown                                |
| 0.5 | Prerender, bundle budget, images, headers, SEO | `npm run verify:prerender && npm run verify:bundle && npm run verify:images && npm run verify:headers && npm run verify:seo` | ✅ all five — figures in §9, §10 and §12                                  |
| 0.6 | Formatting                                     | `npm run format:check`                                                                                                       | ✅ clean                                                                  |
| 0.7 | Production build                               | `npm run build`                                                                                                              | ✅ 87 routes prerendered, with one **pre-existing** budget warning (§8.6) |

**No item below is considered passed while 0.1–0.7 are red.**

---

## 1. Removal of the `Details` button

The first of the two requested changes. These rows exist so a future change cannot quietly reintroduce the button or a hidden second face.

|  #   | Check                                                               | Pass criterion                                                                                                          | Status | Result                                                                                                             |
| :--: | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------ |
| 1.1  | No toggle button in the card                                        | `project-card.spec.ts:110-117` — the card has exactly **one** link and **zero** buttons                                 |  [A]   | ✅                                                                                                                 |
| 1.2  | No toggle button anywhere in the grid                               | `products.spec.ts:104-111` — `PRODUCT_COUNT + 1` links total; 0 buttons inside `app-project-card`                       |  [A]   | ✅ 20 links (19 cards + band CTA)                                                                                  |
| 1.3  | No second face left in the DOM                                      | `project-card.spec.ts:123-134` — no `__face--back`, `__inner`, `__toggle`, `__action`, `__summary`, `__highlights`      |  [A]   | ✅                                                                                                                 |
| 1.4  | No disclosure ARIA left                                             | `products.spec.ts:113-122` — no `[aria-expanded]`, `[aria-controls]`, `.is-flipped`                                     |  [A]   | ✅                                                                                                                 |
| 1.5  | The card is stateless                                               | `project-card.spec.ts:136-145` — dispatching `mouseenter` changes nothing                                               |  [A]   | ✅                                                                                                                 |
| 1.6  | Nothing turns or expands on hover, on a real page                   | `e2e/our-work.spec.ts` — the card's bounding box is unchanged after `hover()`                                           |  [A]   | ✅                                                                                                                 |
| 1.7  | No trace of the face on a touch device                              | `e2e/our-work.touch.spec.ts:74-80`                                                                                      |  [A]   | ✅ on `mobile-chrome`                                                                                              |
| 1.8  | The button is absent from the **shipped HTML**, not just the source | grep all 87 prerendered `index.html` for `project-card__toggle`, `project-card__face--back`, `>Details<`, `Մանրամասներ` |  [A]   | ✅ **0 hits of each across 87 documents**                                                                          |
| 1.9  | The Russian label is gone too                                       | grep the same 87 documents for `Подробнее`                                                                              |  [A]   | ✅ 6 hits, all `expertise__link` ("Подробнее об услуге") on the RU home page — unrelated band, correctly untouched |
| 1.10 | The dictionary entries were removed, not orphaned                   | `detailsLabel`, `closeLabel`, `viewProject` absent from `product.content.ts` and from every template                    |  [A]   | ✅ grep across `src/app` returns nothing                                                                           |
| 1.11 | `visitSite` / `newTab` survive where they are still used            | `product-detail.html:20,22` still renders them in all three locales                                                     |  [A]   | ✅ retained with a comment saying why                                                                              |
| 1.12 | Nothing the face showed became unreachable                          | Every removed field (`summary`, `highlights`, outward link) is rendered on `/our_work/:slug`                            |  [A]   | ✅ `e2e/our-work.touch.spec.ts:96-103` reaches the live product one page deeper                                    |
| 1.13 | Card layout survives the removal                                    | Equal-height columns at desktop; single column at phone width                                                           |  [M]   | ✅ measured: 3 × **411 × 454** at 1440 px; one **372 px** column on a Pixel 7                                      |
| 1.14 | Nothing hidden was left behind on either device class               | No `a`/`button` in any card fails `checkVisibility({ visibilityProperty: true })`                                       |  [A]   | ✅ empty list on `mobile-chrome` (was ~55 controls)                                                                |

---

## 2. Images and assets

The second requested change. The conclusion was **no replacement**, so these rows verify that the existing art is correct and correctly wired, and they state what evidence would justify replacing one.

|  #   | Check                                                 | Pass criterion                                                                                                                                                             | Status | Result                                                                                          |
| :--: | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----: | ----------------------------------------------------------------------------------------------- |
| 2.1  | Every product has both images and every path resolves | `npm run verify:images`                                                                                                                                                    |  [A]   | ✅ **19 products, 38 images, 294.4 kB, all WebP, all referenced**                               |
| 2.2  | No broken asset path in the shipped HTML              | `verify:images` cross-checks references against the asset tree                                                                                                             |  [A]   | ✅ 0 unreferenced, 0 missing                                                                    |
| 2.3  | No two cards share an image                           | `products.spec.ts:80-93` — the `src` set has `PRODUCT_COUNT` distinct members                                                                                              |  [A]   | ✅ 19 distinct                                                                                  |
| 2.4  | No two **files** are identical                        | md5 of all 38 assets                                                                                                                                                       |  [M]   | ✅ 38 distinct hashes                                                                           |
| 2.5  | Images are generated, not stock or random             | `scripts/generate-product-images.mjs` draws every pixel from a per-product `PRODUCT_ART` entry                                                                             |  [M]   | ✅ no external image source exists in the repo                                                  |
| 2.6  | Art is reproducible from source                       | `npm run images:products`, then re-hash                                                                                                                                    |  [M]   | ✅ byte-identical — the generator is deterministic                                              |
| 2.7  | No generic motif reused across products               | Count distinct `motif` and `ui` values in `PRODUCT_ART`                                                                                                                    |  [M]   | ✅ **19 motifs, 15 UI compositions** for 19 products                                            |
| 2.8  | Each motif matches its product                        | Cross-reference every tile against `product-meta.ts`, the dictionary copy and the live destination                                                                         |  [M]   | ✅ no mismatch found; see audit §7.2                                                            |
| 2.9  | Nothing conceptual is presented as a screenshot       | No copy, `alt`, caption or `figcaption` claims the art is a capture                                                                                                        |  [M]   | ✅ `alt=""` on the card; the generator and `product-meta.ts` both record the art as composition |
| 2.10 | Image markup is correct                               | `src`, `alt=""`, `loading="lazy"`, `decoding="async"`, `width=1280`, `height=800`                                                                                          |  [A]   | ✅ `project-card.spec.ts:83-94`                                                                 |
| 2.11 | The grid reserves space before the image lands        | Both intrinsic dimensions set, plus `aspect-ratio: 16 / 10` on `.project-card__media`                                                                                      |  [A]   | ✅                                                                                              |
| 2.12 | **What would justify a replacement**                  | A motif that contradicts its product; two products sharing one visual; a referenced file missing; third-party branding; a real screenshot presented as this project's work |  [D]   | None present. Recorded as a decision, not a deferral.                                           |
| 2.13 | Whether the art should become real interface captures | Product decision — a different asset class with an authorship implication                                                                                                  |  [D]   | Open. Roadmap §7.                                                                               |

---

## 3. TypeScript and Angular

|  #  | Check                                       | Pass criterion                                                                                        | Status | Result                                                                                                                  |
| :-: | ------------------------------------------- | ----------------------------------------------------------------------------------------------------- | :----: | ----------------------------------------------------------------------------------------------------------------------- |
| 3.1 | `strictTemplates` holds                     | `npm run typecheck` clean; no `any` introduced in `products.ts`, `project-card.ts`, `product-view.ts` |  [A]   | ✅                                                                                                                      |
| 3.2 | Every component is OnPush-verified          | `change-detection.spec.ts` walks `src/app` and fails on an unregistered component                     |  [A]   | ✅                                                                                                                      |
| 3.3 | No constructor DI, no NgModule              | Field initialisers / `inject` only                                                                    |  [A]   | ✅ `ProjectCard` has no injection at all beyond `useLocale`                                                             |
| 3.4 | Inputs are `input.required` where mandatory | A missing `[product]` binding is a compile error                                                      |  [A]   | ✅                                                                                                                      |
| 3.5 | No deprecated API introduced                | `@typescript-eslint/no-deprecated` with full type info (`eslint.config.js:18-34`)                     |  [A]   | ✅ (caught and fixed one `className` use in the new touch spec)                                                         |
| 3.6 | Unused imports removed with the code        | ESLint + a read of the diff                                                                           |  [A]   | ✅ `signal`, `viewChild`, `afterNextRender`, `ElementRef`, `DOCUMENT`, `MatButton`, `MatIcon` all dropped from the card |
| 3.7 | No dead field left in the view model        | Grep for each `ProductView` field across `src/app`                                                    |  [M]   | ⚠️ `archetype` is still dead — tracked as part of **PRD-P2-02**                                                         |

---

## 4. HTML and templates

|  #  | Check                                          | Pass criterion                                                               | Status | Result                                                                                                       |
| :-: | ---------------------------------------------- | ---------------------------------------------------------------------------- | :----: | ------------------------------------------------------------------------------------------------------------ |
| 4.1 | Modern control flow only                       | `@if` / `@for … track <stable id>`; no `*ngIf`, `*ngFor`                     |  [A]   | ✅                                                                                                           |
| 4.2 | Semantic list markup for the grid              | `ul` / `li`, announced as a 19-item list                                     |  [A]   | ✅                                                                                                           |
| 4.3 | Decorative images carry `alt=""`               | The product name is in an adjacent heading                                   |  [A]   | ✅ pinned and explained at `project-card.spec.ts:79-94`                                                      |
| 4.4 | Accessible name contains the visible text      | WCAG 2.5.3 (Label in Name)                                                   |  [A]   | ✅ `project-card.spec.ts:96-104`                                                                             |
| 4.5 | No `aria-label` suppressing meaningful content | An `aria-label` must not discard a visually-hidden notice inside the element |  [A]   | ✅ the one instance of this was the card's outward link, now removed; `product-detail.html:18-24` is correct |
| 4.6 | Section is a named landmark                    | `aria-labelledby` on `<section class="projects">`                            |  [A+]  | ❌ **open — PRD-P3-02.** The only template finding left.                                                     |

---

## 5. SCSS / CSS

|  #  | Check                                         | Pass criterion                                                                    | Status | Result                                                                            |
| :-: | --------------------------------------------- | --------------------------------------------------------------------------------- | :----: | --------------------------------------------------------------------------------- |
| 5.1 | Tokens and mixins only                        | No raw colour, no magic spacing                                                   |  [A]   | ✅                                                                                |
| 5.2 | Flat BEM, no `::ng-deep`, no `!important`     | `.stylelintrc.cjs:5-41`                                                           |  [A]   | ✅ `npm run lint:styles` clean                                                    |
| 5.3 | No duplicated selector block                  | `no-duplicate-selectors`                                                          |  [A]   | ✅ the 26-line duplicate is gone with the media branch                            |
| 5.4 | Reduced motion handled                        | Tokens zeroed globally, plus a component-level block for what tokens cannot reach |  [A]   | ✅ `project-card.scss:97-107`                                                     |
| 5.5 | Stylesheet size inside budget                 | `anyComponentStyle` 5 kB warn / 8 kB error                                        |  [A]   | ✅ `project-card.scss` 391 → 107 lines                                            |
| 5.6 | Hover delay correct on interaction properties | Compiled `transition-delay` zeroes `translate` and `box-shadow`                   |  [A+]  | ❌ **open — PRD-P2-01.** Compiled output still reads `transition-delay:.42s`      |
| 5.7 | No orphaned rule left after a removal         | Every selector in the file matches something the template renders                 |  [M]   | ✅ `perspective`, `__inner`, `__face`, `__toggle`, `__action`, `__sr` all removed |

---

## 6. Architecture and dependencies

|  #  | Check                                     | Pass criterion                                                    | Status | Result                                 |
| :-: | ----------------------------------------- | ----------------------------------------------------------------- | :----: | -------------------------------------- |
| 6.1 | Layering holds                            | `core ← shared ← layout ← pages`, no cycles, no cross-page import |  [A]   | ✅ 210 modules, 600 deps, 0 violations |
| 6.2 | `*.content.ts` files stay leaves          | `content-files-are-leaves`                                        |  [A]   | ✅                                     |
| 6.3 | `app.routes.ts` imported only by the root | depcruise rule                                                    |  [A]   | ✅                                     |
| 6.4 | Architectural rules were **not relaxed**  | `.dependency-cruiser.cjs` unchanged by the change                 |  [M]   | ✅ not touched                         |
| 6.5 | No new npm dependency                     | `package.json` unchanged                                          |  [M]   | ✅ not touched                         |
| 6.6 | Existing architecture preserved           | No new abstraction, no layer added, no pattern replaced           |  [M]   | ✅ the change is subtractive           |

---

## 7. Routing and navigation

|  #  | Check                                      | Pass criterion                                                | Status | Result                             |
| :-: | ------------------------------------------ | ------------------------------------------------------------- | :----: | ---------------------------------- |
| 7.1 | Every card links to its own detail route   | `products.spec.ts:73-78` — hrefs equal `PRODUCT_IDS` in order |  [A]   | ✅                                 |
| 7.2 | Locale prefix applied                      | `/contact` → `/hy/contact`                                    |  [A]   | ✅                                 |
| 7.3 | The grid sends no one off-site             | No `a[target="_blank"]`, no `a[href^="http"]` in the band     |  [A]   | ✅ `products.spec.ts:129-134`      |
| 7.4 | The outward link still exists, one page in | `product-detail.html:18-24`, `https:` + `rel="noopener"`      |  [A]   | ✅ `our-work.touch.spec.ts:96-103` |
| 7.5 | Tapping a card opens the right product     | URL matches `/our_work/<slug>`, `h1` matches the card title   |  [A]   | ✅ `our-work.touch.spec.ts:82-90`  |
| 7.6 | All 19 slugs prerender in 3 locales        | `npm run build`                                               |  [A]   | ✅ 87 routes                       |
| 7.7 | Every prerendered route works without JS   | `npm run verify:prerender`                                    |  [A]   | ✅ **87 navigable**                |
| 7.8 | No published URL changed                   | Route table and `PRODUCT_IDS` untouched                       |  [M]   | ✅                                 |

---

## 8. Performance

|  #  | Check                                   | Pass criterion                                | Status | Result                                                                                                                                                                          |
| :-: | --------------------------------------- | --------------------------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8.1 | Bundle budgets hold                     | `npm run verify:bundle`                       |  [A]   | ✅ worst route `/ru/contact` **222.8 kB gzip** against a 240 kB budget                                                                                                          |
| 8.2 | Images lazy and dimensioned             | `loading`, `decoding`, `width`, `height`      |  [A]   | ✅                                                                                                                                                                              |
| 8.3 | DOM cost of the grid                    | Node count per card                           |  [M]   | ✅ roughly halved — one face instead of two, 57 fewer controls                                                                                                                  |
| 8.4 | Grid route does not preload detail copy | Grep each preloaded chunk for `about` prose   |  [A+]  | ❌ **open — PRD-P2-02.** The preloaded chunk is **117 828 B raw / 36 956 B gzip** and contains Armenian dictionary prose                                                        |
| 8.5 | Any performance claim is measured       | No claim without a recorded before/after      |  [M]   | ✅ every figure here is a command output                                                                                                                                        |
| 8.6 | No new budget warning                   | `npm run build` warnings compared to baseline |  [M]   | ⚠️ one warning, **pre-existing and unrelated**: `product-detail.scss` 5.94 kB against a 5.00 kB budget. Not introduced by this change — `product-detail.scss` was not modified. |

---

## 9. Accessibility

|  #  | Check                                                    | Pass criterion                                                                  | Status | Result                                          |
| :-: | -------------------------------------------------------- | ------------------------------------------------------------------------------- | :----: | ----------------------------------------------- |
| 9.1 | No control focusable while off screen — pointer device   | `e2e/our-work.spec.ts` keyboard walk reaches each card with nothing between     |  [A]   | ✅                                              |
| 9.2 | No control focusable while off screen — **touch device** | `our-work.touch.spec.ts:62-72`, `checkVisibility({ visibilityProperty: true })` |  [A]   | ✅ empty list                                   |
| 9.3 | Nothing reachable only by hover                          | The card has one link and no hover-only content at all                          |  [A]   | ✅ WCAG 2.1.1 satisfied by construction         |
| 9.4 | axe WCAG 2.2 AA on `/our_work`, desktop                  | `e2e/a11y.spec.ts`                                                              |  [A]   | ✅ 0 violations                                 |
| 9.5 | axe WCAG 2.2 AA on `/our_work`, **real touch device**    | `our-work.touch.spec.ts:109-118`                                                |  [A]   | ✅ 0 violations                                 |
| 9.6 | Accessible names distinguish 19 similar links            | Each carries its product name and category                                      |  [A]   | ✅                                              |
| 9.7 | Icons are hidden from the accessibility tree             | `IconTile` sets `aria-hidden` at the host                                       |  [A]   | ✅                                              |
| 9.8 | Section is a named landmark                              | —                                                                               |  [A+]  | ❌ **open — PRD-P3-02**                         |
| 9.9 | Real screen-reader pass on a mobile reader               | VoiceOver / TalkBack                                                            |  [M]   | — not performed; no automated substitute exists |

---

## 10. Responsive design

|  #   | Check                                  | Pass criterion                                 | Status | Result                                                                                                       |
| :--: | -------------------------------------- | ---------------------------------------------- | :----: | ------------------------------------------------------------------------------------------------------------ |
| 10.1 | No sideways scroll                     | `e2e/overflow.spec.ts`, 9 viewports × 2 routes |  [A]   | ✅                                                                                                           |
| 10.2 | Equal row heights per locale           | `e2e/our-work.spec.ts`                         |  [A]   | ✅ all three locales                                                                                         |
| 10.3 | Three columns at desktop width         | Measured bounding boxes at 1440 px             |  [M]   | ✅ 3 × 411 × 454, x = 80 / 515 / 949                                                                         |
| 10.4 | One column at phone width              | `our-work.touch.spec.ts:47-56`                 |  [A]   | ✅ a single distinct x offset across all 19 cards                                                            |
| 10.5 | Cards render correctly at both widths  | Visual inspection of the rendered grid         |  [M]   | ✅ screenshots captured at 1440 px and Pixel 7; media, tag, title, category and hook all present and aligned |
| 10.6 | Longest locale does not break the card | `hy` / `ru` at 390 px                          |  [A]   | ✅ covered by 10.2                                                                                           |

---

## 11. Regression testing

Run after **any** change to the feature.

|   #   | Check                                                     | Pass criterion                                                                | Status | Result                                                                                                                           |
| :---: | --------------------------------------------------------- | ----------------------------------------------------------------------------- | :----: | -------------------------------------------------------------------------------------------------------------------------------- |
| 11.1  | Full suite green on every Playwright project              | `npm run e2e`                                                                 |  [A]   | ✅ chromium + webkit + mobile-chrome — see the final report for counts                                                           |
| 11.2  | Prerendered deep links still work                         | `npm run e2e:prerendered`                                                     |  [A]   | ✅ via `verify:prerender`, 87 navigable without JS                                                                               |
| 11.3  | 19 cards, in registry order, with unique art              | `products.spec.ts:57-93`                                                      |  [A]   | ✅                                                                                                                               |
| 11.4  | Dictionary key isolation holds                            | `products.spec.ts:150-155` — the `key: 'expertise'` collision does not return |  [A]   | ✅                                                                                                                               |
| 11.5  | All three locales render the band and every card          | `products.spec.ts:157-166`                                                    |  [A]   | ✅ including the RU archetype label on the card tag                                                                              |
| 11.6  | Copy budgets still hold                                   | `product-content.spec.ts` — hook 140 / summary 170 / advantage 130            |  [A]   | ✅                                                                                                                               |
| 11.7  | No authorship claims introduced                           | `product-content.spec.ts:110-120`                                             |  [A]   | ✅                                                                                                                               |
| 11.8  | Detail page renders every section, with and without `url` | `product-detail.spec.ts`; `draculai` and `roar-organic`                       |  [A]   | ✅                                                                                                                               |
| 11.9  | Card height contract intact in 3 locales                  | `e2e/our-work.spec.ts`                                                        |  [A]   | ✅ rewritten for one face; still per-locale                                                                                      |
| 11.10 | SEO output unchanged                                      | `npm run verify:seo`                                                          |  [A]   | ✅ 87 documents, unique titles, canonical and hreflang agree, 84 indexable / 3 noindex                                           |
| 11.11 | CSP hashes match the build                                | `npm run verify:headers`                                                      |  [A]   | ✅ after `--write`: exactly **one stale hash removed** (6 → 5). The policy was tightened; nothing was added.                     |
| 11.12 | Header "Our Work" link still resolves                     | `/our_work` and `/hy/our_work` from the nav                                   |  [M]   | — not re-run; the route table was not touched                                                                                    |
| 11.13 | Visual diff at 390 / 768 / 1440 / 1920 px × 3 locales     | No unintended change                                                          |  [M]   | — partial: 1440 px and Pixel 7 captured (10.5); the card is **expected** to differ, since the second face was removed by request |

---

## 12. Completion criteria

A change to `app-products` is **done** when all of the following hold.

### Mandatory

- [x] **0.1–0.7 all green**, on every Playwright project including a `hover: none` one.
- [x] **No P0 or P1 issue open.** Specifically: no control is focusable or announced while off screen, on either device class (9.1, 9.2).
- [x] **No test was deleted or weakened** to make the change pass. Tests that asserted the removed behaviour were **replaced with tests asserting that it is gone** — each new negative assertion fails against the old code.
- [x] **No new npm dependency** (6.5).
- [x] **No published URL changed** (7.8).
- [x] **Architectural rules pass unmodified** — `.dependency-cruiser.cjs` was not relaxed (6.4).
- [x] **Every component is registered** in `change-detection.spec.ts` (3.2).
- [x] **Every changed copy string exists in `en`, `hy` and `ru`** — or was removed from all three together (1.10).
- [x] **Both requested changes are resolved**, one by implementation and one by a recorded, evidenced decision (§1, §2).

### Expected

- [ ] Screen-reader pass on at least one real mobile reader (9.9). **Not done** — no automated substitute exists.
- [x] Any performance claim is backed by a recorded measurement (8.5).
- [x] Any non-obvious decision is written as a comment where the code is — the removal's reasoning is at the top of `project-card.ts`, and `playwright.config.ts`'s header was corrected to match.
- [x] Any issue consciously declined is recorded with its reason (2.12, 2.13, and the roadmap's §7).

### Reporting

- [x] P0 / P1 / P2 / P3 counts updated against the audit's register: **0 / 0 / 3 / 11** (baseline **0 / 2 / 5 / 13**).
- [x] Scores re-assessed for every area the change touched — overall **8.0 → 8.4**.
- [x] Any newly discovered issue added to the register with the same classification discipline: **[DEFECT]** reproduced, **[RISK]** plausible but unobserved, **[OPINION]** a defensible alternative. _No new issue was discovered by this change._
