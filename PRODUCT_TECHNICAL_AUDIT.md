# `app-product` — Technical Audit and Image Restoration

**Project:** Nexora (`C:\Users\xXx\Desktop\nexora`)
**Date:** 2026-11-14
**Branch:** `main` · **HEAD:** `f766248` ("updat our-work page", Nov 13 2026 21:06 +0400)
**Stack as verified:** Angular `^22.2.3`, TypeScript `~6.0.0`, Angular Material/CDK `^22.2.3`, `intlayer` / `angular-intlayer` `^9.7.0` (`package.json`)
**Method:** source reading, Git history inspection, the project's own gate commands, and the rendered page at desktop and phone widths.

---

## 0. Naming — what was audited

**There is no component whose selector is `app-product`.** Verified by grep over `src/app`:

| Selector             | File                                            | Role                                        |
| -------------------- | ----------------------------------------------- | ------------------------------------------- |
| `app-products`       | `src/app/pages/our-work/products/products.ts`   | The portfolio **band** — 19 cards           |
| `app-project-card`   | `src/app/pages/our-work/products/project-card/` | **One product card** — the image lives here |
| `app-product-detail` | `src/app/pages/our-work/product-detail/`        | The `/our_work/:slug` **page**              |

The task names "the `app-product` component" and "product card images". The product card is `app-project-card`, so that component and the data layer behind it are the subject of this audit; `app-products` and `app-product-detail` are audited where they participate. This is a naming clarification, not a finding.

---

## 1. The restoration — what was wrong, and what was done

### 1.1 What the repository showed

`git status` at the start of this work:

```
 D public/images/car.webp
 D public/images/got.webp
 ... 19 deletions in total
?? src/assets/
?? scripts/generate-product-images.mjs
?? src/app/pages/our-work/products/data/
?? src/app/pages/our-work/products/project-card/
```

Read together with the history, the sequence is unambiguous:

| Commit                                     | Date          | What it did to the images                                                                                            |
| ------------------------------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `1b67612` "create our-works page"          | Nov 13, 03:22 | Added 21 source images as `.jpeg` / `.png` / `.jpg` (`infiniti.png` alone was 2 261 661 B)                           |
| `f766248` "updat our-work page" **(HEAD)** | Nov 13, 21:06 | Converted 19 of them to WebP and deleted every source file. `geo.jpeg` and `myInf.jpeg` were dropped, not converted. |
| _working tree, uncommitted_                | —             | Deleted all 19 WebP files; added an untracked generated-art set under `src/assets/images/products/`                  |

So **the version that existed in Git before the recent image change is HEAD (`f766248`)** — the 19 WebP files. The earlier JPEG/PNG generation is not the restore target: the repository's own author superseded it one commit later, and restoring it would undo their optimisation rather than the change in question. This is stated explicitly because the task asks which revision each file came from.

### 1.2 What was restored

All 19 files were restored from `HEAD` with a **path-scoped** checkout — no `git reset`, no branch checkout, no unrelated path touched:

```
git checkout HEAD -- public/images/car.webp public/images/got.webp … public/images/zadeh.webp
```

**Verification that each restored file is the original, byte for byte.** `git hash-object` of the working-tree file was compared to `git rev-parse HEAD:<path>` for all 19; every pair matched, and `git status -- public/images/` is clean:

| File            | Blob SHA (`HEAD` = working tree)           |   Bytes | Intrinsic size |
| --------------- | ------------------------------------------ | ------: | -------------- |
| `car.webp`      | `2bf4589226212db3160690e8e275baaec313be5a` | 110 572 | 800 × 533      |
| `got.webp`      | `21ff1c4e04215839620df6819cb7ca04cab929ce` |  27 654 | 800 × 600      |
| `infiniti.webp` | `a9dbb29153eb0691676e02d0630e1f4f30e4bef6` |  53 870 | 800 × 450      |
| `interier.webp` | `ac77e0e81a7f96dea64b6f390b919746ac9418ef` |  47 268 | 800 × 437      |
| `je.webp`       | `ff4ab0ad4ef98d98ab3797396854ad3dd4574042` |  31 654 | 640 × 524      |
| `juce.webp`     | `9b38f9e8b8e637cb12afeb8efd6cf067403e9364` |  45 688 | 756 × 600      |
| `klinik.webp`   | `02bf0f7ba2a912c5c37ac0bbb95026ad860b0ff1` |  17 588 | 800 × 463      |
| `lave.webp`     | `7fb00fa8c3614aeb387cc3a3e9fca0b391868b98` |  67 122 | 800 × 450      |
| `market.webp`   | `03eb419f1ea559d7e443afab6994e9b68821f253` |  98 084 | 800 × 453      |
| `master.webp`   | `baea205eb40f7e7ff07289f5c0490e41c4fdc71f` |  74 322 | 800 × 622      |
| `meal.webp`     | `d1e26b5b8e1a7905c2f6139e0e717aa54ca8a51d` |  43 290 | 800 × 853      |
| `medical.webp`  | `99825e5f760ec078fef5f17576f301fd6e2e37cb` |  20 368 | 800 × 450      |
| `mertal.webp`   | `feab414166557508166a55a5f2adf436b29e9224` |  52 324 | 800 × 420      |
| `muzic.webp`    | `3e51c2642fc669bad60c1c9dfc1c55b0a4a8b350` |  30 636 | 800 × 450      |
| `organic.webp`  | `b8ec02139e2664cba712d79e948e84cb22a6da42` |  50 546 | 800 × 717      |
| `power.webp`    | `7efe59c25738dc62c7d7bbc50828a816ff5344ce` |  24 026 | 800 × 569      |
| `skay.webp`     | `f5a2f874c7882de77fffd0e86e73ebe945bb9705` |  26 316 | 800 × 533      |
| `watch.webp`    | `b3d480d479a78afe12e1d00cc1a7a5bd698a4413` |  85 136 | 800 × 800      |
| `zadeh.webp`    | `28f1bb794030b4d1b2a0038c9a4659641170e407` |  21 156 | 480 × 334      |

**19 of 19 restored. None is missing from Git history. Nothing was generated, downloaded or substituted.**

### 1.3 The product-to-image mapping, and how it was reconstructed

The card component was rewritten since `f766248`, so the mapping could not simply be copied across — it had to be re-derived. The original `product.content.ts` at HEAD carried a flat `services` array where each entry held an `image` and a `path` (the product's live URL). **The live URL is the join key**, because it survived the rewrite into `PRODUCT_META[id].url`:

| Current `ProductId` | Restored image  | Join evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `draculai`          | `medical.webp`  | `apps.apple.com/us/app/draculai/id6744846504` — identical in both revisions                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `jdm-west-coast`    | `car.webp`      | `www.jdmwestcoast.com/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `hydrant`           | `juce.webp`     | `www.drinkhydrant.com/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `mertel`            | `mertal.webp`   | `mertel.agency/sk/en/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `skinome`           | `skay.webp`     | `www.skinome.com/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `mastercraft`       | `master.webp`   | `www.mastercraftjewelers.com/` — **and the photo is the Mastercraft Jewelers storefront, with the name legible on the building**                                                                                                                                                                                                                                                                                                                                                                                           |
| `robert-irwin`      | `je.webp`       | `www.rijewelers.com/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `casamance`         | `interier.webp` | `www.casamance.com/en/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `sell-me-watch`     | `watch.webp`    | `www.sellmewatch.com/` + HEAD title "Luxury Watch Trading & Valuation Platform"                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `klinik-europe`     | `klinik.webp`   | `klinikeurope.co.uk/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `libra-analytics`   | `power.webp`    | `www.libraanalytics.com/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `remake-templates`  | `muzic.webp`    | HEAD `abletonremakes.com/`; current `remaketemplates.com/`. `product-meta.ts:123` records the 301 between them, and the HEAD title is "Digital Music Production E-commerce & Subscription Platform"                                                                                                                                                                                                                                                                                                                        |
| `got-matcha`        | `got.webp`      | `www.gotmatcha.com/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `lav`               | `lave.webp`     | `dresslav.com/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `roar-organic`      | `organic.webp`  | HEAD `roar-organic.myshopify.com/`; the current entry drops the URL, and `product-meta.ts:142-143` explains why (the default host's catalogue reads "sold out")                                                                                                                                                                                                                                                                                                                                                            |
| `zadeh-md`          | `zadeh.webp`    | `shopzadehmdskin.com/` — **and the photo's product labels read "ZADEH MD SKIN"**                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `tai-ping`          | `market.webp`   | `www.taiping.co.nz/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `mezave`            | `meal.webp`     | `play.google.com/store/apps/details?id=org.mezave`                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `connected-car`     | `infiniti.webp` | **The one entry the URL cannot resolve.** At HEAD this product's `path` was `https://www.sellmewatch.com/` — the same URL as `sell-me-watch`, i.e. a copy-paste error in the original. `product-meta.ts:166-167` independently records this: _"this card previously linked to the luxury-watch platform's site, which belongs to a different product."_ The pairing is therefore made on the HEAD title, "Connected Car & Vehicle Management Mobile App", against the only remaining image and the only remaining product. |

The mapping is **1:1 and complete**: 19 products, 19 images, no image used twice, none left over. It is pinned by a test that compares the rendered `src` list against `PRODUCT_META` in registry order (`products.spec.ts`), so a future reordering cannot silently shuffle it.

### 1.4 Scope decision — the card, not the detail page

The restored photographs are wired to the **card only**. The detail page keeps the generated illustrations. This is not an omission; it is forced by the page's own copy:

```html
<!-- product-detail.html:45, 78 -->
<figcaption class="product__caption">{{ content().sections.illustrative }}</figcaption>
```

```ts
// product.content.ts:85-89
illustrative: t({
  en: 'Illustration — an original composition, not a screenshot of the product.',
  hy: 'Պատկերազարդում՝ ինքնուրույն ստեղծված կոմպոզիցիա, ոչ թե արտադրանքի սքրինշոթ։',
  ru: 'Иллюстрация — оригинальная композиция, а не скриншот продукта.',
}),
```

Every figure on the detail page is captioned **"an original composition, not a screenshot of the product"**, in all three locales. That sentence is true of the generated art and false of a photograph of the real product. Pointing the detail page's hero at a restored photograph would have made the page contradict itself in print — a worse defect than the one being fixed, and outside what was asked ("restore only the affected **product card** images").

So the two sets now live side by side, with the boundary written into the type:

| Field                         | Source                                                | Consumer                                |
| ----------------------------- | ----------------------------------------------------- | --------------------------------------- |
| `ProductView.cardImage`       | `public/images/<photo>` — **restored from Git**       | `project-card.html` (the grid)          |
| `ProductView.mainImage`       | `assets/images/products/<art>/main-visual.webp`       | `product-detail.html` hero              |
| `ProductView.experienceImage` | `assets/images/products/<art>/experience-visual.webp` | `product-detail.html` experience figure |

**Consequence that must be decided, not assumed:** the 19 generated `main-visual.webp` files are now referenced by the detail page only, and nothing else changed about them. See **PRD-IMG-03**.

### 1.5 Code changes made to wire the restoration

| File                                | Change                                                                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data/product-meta.ts`              | Added `ProductPhoto { file, width, height }` and `ProductMeta.photo`; 19 entries; added `productPhoto(meta)`. Doc comments record the Git provenance and the caption constraint from §1.4. |
| `data/product-view.ts`              | Added `ProductView.cardImage`, derived in `toView` from `productPhoto(meta)` and the photo's own dimensions.                                                                               |
| `project-card/project-card.html`    | `[src]="product().cardImage.src"`; `width`/`height` bound to the photo's real size instead of the hardcoded `1280`/`800`.                                                                  |
| `project-card/project-card.scss`    | Comment only — records that the photo set is not a uniform shape and that `object-fit: cover` is what normalises it.                                                                       |
| `project-card/project-card.spec.ts` | Fixture gains `cardImage`; the image test asserts the photo's own dimensions; a new test asserts the card does **not** render `mainImage`.                                                 |
| `products.spec.ts`                  | Image test rewritten for `images/*.webp`; a new test pins the whole product-to-photo mapping in registry order.                                                                            |

**No other file was modified.** No dependency was added. No published URL changed. The architecture is unchanged — the restoration adds one field to an existing registry and one derived field to an existing view model.

---

## 2. Technical audit

### 2.1 TypeScript and component logic

`project-card.ts` is **34 lines** and holds one input and one computed:

```ts
export class ProjectCard {
  readonly product = input.required<ProductView>();
  protected readonly locale = useLocale().locale;
}
```

| Aspect                    | Finding                                                                                                                                                                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Responsibility boundaries | Clean. The card renders; the registry holds structural facts; the dictionary holds copy; `product-view.ts` joins them. Four files, four jobs.                                                                                                                           |
| Angular 22 compliance     | `input.required`, signals, `@if`/`@for … track`, standalone, no NgModule, no constructor DI. `changeDetection` omitted, which Angular 22 compiles to OnPush — pinned by `change-detection.spec.ts`, which walks `src/app` and fails on an unregistered component.       |
| Type safety               | `strict`, `noPropertyAccessFromIndexSignature`, `strictTemplates` (`tsconfig.json`). `ProductId` is a union from a const tuple; `ExternalUrl` is `` `https://${string}` ``, so a relative URL in `[href]` is a compile error. `ProductPhoto` is now typed the same way. |
| Reactive state            | **None in the card** — it has no `signal`, no lifecycle hook, no subscription, so there is nothing to leak or to get out of sync.                                                                                                                                       |
| Lifecycle / resources     | No hooks. Correct, and deliberate rather than omitted.                                                                                                                                                                                                                  |
| Error handling            | None, and none is reachable: `products()` maps a compile-time-fixed tuple, and `product-content.spec.ts` fails the build if any id, field or locale is missing.                                                                                                         |
| Duplication               | None found in the card. `toView` assigns 18 fields; the grid reads 8 — see **PRD-IMG-04**.                                                                                                                                                                              |

**Weakness found.** `ProductPhoto.file` is a bare `string`. A typo — `'medcal.webp'` — compiles cleanly and fails at runtime as a 404. Every other identifier in this registry is protected against exactly that (`ProductId` union, `AppIconName` union, `ExternalUrl` template type), so this is an inconsistency with the file's own standard. **PRD-IMG-01.**

### 2.2 HTML and templates

```html
<img
  class="project-card__img"
  [src]="product().cardImage.src"
  alt=""
  [width]="product().cardImage.width"
  [height]="product().cardImage.height"
  loading="lazy"
  decoding="async"
/>
```

- **`alt=""` is correct, not a defect.** The product name is in the adjacent `<h3>`, so alt text would be announced twice. Documented and pinned at `project-card.spec.ts:79-94`. (At `f766248` the markup used `[alt]="service.title.value"`, which duplicated the heading; the current form is an improvement and was left alone.)
- **`width`/`height` are now truthful.** Before the restore they were hardcoded `1280`/`800` for every card — correct for the uniform generated art, and wrong for all nineteen photographs, which range from 480 × 334 to 800 × 853. Verified on the rendered page: `naturalWidth × naturalHeight` equals the declared attributes for all 19.
- Semantic structure is intact: `<ul>` / `<li>` in the band, one `<h3>` per card, one link per card whose `aria-label` contains its visible text (WCAG 2.5.3).
- **Gap:** `<section class="projects">` has no accessible name, so it is not exposed as a landmark. The sibling band does this correctly (`about-products.html:1,4`). **PRD-IMG-07.**

### 2.3 CSS / SCSS and image presentation

```scss
.project-card__media {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
}
.project-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

This is the right shape for the restored set and is **why the grid survived a change of image source without a layout change** — measured before and after: three columns of exactly 411 × 454 px at 1440 px, one 372 px column on a Pixel 7, identical in both runs.

| Aspect                | Finding                                                                                                                                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture          | Tokens and mixins only; no raw colour, no magic spacing, no `::ng-deep`, flat BEM — all machine-enforced by `.stylelintrc.cjs`.                                                                                                                                                                                     |
| Aspect ratio          | Fixed at 16/10 on the container rather than taken from the file, so nineteen mismatched sources still produce one grid.                                                                                                                                                                                             |
| `object-fit`          | `cover` — correct. Without it the photos would letterbox or distort.                                                                                                                                                                                                                                                |
| **`object-position`** | **Not set, so every crop is centred.** For the three tall images this is a real loss: `meal.webp` (800 × 853, ratio 0.94) cropped to 1.60 loses about 41 % of its height, and `organic.webp` and `master.webp` lose a third. Whether the subject survives centring has not been verified per image. **PRD-IMG-02.** |
| Responsive            | Verified at 1440 px and at Pixel 7; no sideways scroll (`e2e/overflow.spec.ts`).                                                                                                                                                                                                                                    |
| Conflicts             | None. `stylelint` passes, including `no-duplicate-selectors`.                                                                                                                                                                                                                                                       |

### 2.4 Dependencies and integration

| Entity                                                  | Relationship to the card                        | Affected by the restore?                            |
| ------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------- |
| `PRODUCT_META` / `ProductMeta`                          | Structural facts incl. the new `photo`          | **Yes** — one field added                           |
| `toProductViews` / `ProductView`                        | Joins registry + copy                           | **Yes** — one derived field added                   |
| `productContent` (`product.content.ts`)                 | All copy, 3 locales                             | No                                                  |
| `app-product-detail`                                    | Renders `mainImage` / `experienceImage`         | **No** — deliberately, see §1.4                     |
| `IconTile`, `Reveal`, `LocalizedPathPipe`, `RouterLink` | Shared presentation                             | No                                                  |
| `scripts/verify-images.mjs`                             | Validates `src/assets/images/products` only     | **Does not cover `public/images`** — **PRD-IMG-05** |
| `angular.json` assets                                   | `public/**` → root, `src/assets/**` → `/assets` | No change needed; both globs already existed        |
| Routing                                                 | 19 slugs × 3 locales, 87 prerendered routes     | No                                                  |
| Localisation                                            | `en` / `hy` / `ru`                              | No — the photo is not localised copy                |

**Architectural boundaries hold.** `depcruise src/app` after the change: **210 modules, 601 dependencies, 0 violations.** The one extra dependency versus the pre-change run is `product-view.ts → product-meta.ts` for `productPhoto`, which is an existing edge reinforced, not a new layer crossing.

**Regression surface considered:** the detail page (unchanged binding, unchanged files), the sitemap and SEO pipeline (no URL changed), `verify:images` (its folder set is untouched), and the prerendered HTML (checked — see the checklist).

---

## 3. Architecture and quality scores

Every score is tied to evidence above.

| Area                                      | Score | Evidence                                                                                                                                                                                                                                                                                          |
| ----------------------------------------- | :---: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component design & separation of concerns | **9** | 34-line stateless card; registry / copy / view-model / presentation in four files. The photo-vs-illustration boundary is now expressed in the type system and explained where it is declared. Deduction: `ProductView` still serves two consumers with different needs.                           |
| Reusability & maintainability             | **8** | Adding a product is one id + one meta entry + one content block, and five specs fail until it is complete. Deduction: two parallel image systems must now be kept straight by a reader, and the generated `main-visual` set lost one of its two consumers (**PRD-IMG-03**).                       |
| Angular 22 best practices                 | **9** | Signals, `input.required`, modern control flow, `loadComponent`, no NgModules, no constructor DI, OnPush asserted rather than assumed. Deduction: no `@defer` in a 19-card grid.                                                                                                                  |
| TypeScript quality & type safety          | **8** | `strict` + `strictTemplates`; union ids; `ExternalUrl`; `ProductPhoto` typed. Deductions: `photo.file` is an unconstrained `string` (**PRD-IMG-01**); `ProductView.archetype` is still dead (verified unread by grep).                                                                            |
| Performance & rendering efficiency        | **6** | Lazy + correctly dimensioned images, OnPush everywhere, prerendered HTML. Deductions: the card payload went from **172.8 kB to 905.9 kB** (5.2×) for the same nineteen cards, largest file 108.0 kB (**PRD-IMG-06**); the grid route still preloads detail-only dictionary copy (**PRD-IMG-04**). |
| Accessibility                             | **9** | `alt=""` correct and justified; one named link per card containing its visible text; no hidden focusable content; axe clean on desktop and on a real touch device. Deduction: unnamed `<section>` (**PRD-IMG-07**).                                                                               |
| Responsive design                         | **9** | Measured identical geometry before and after the restore at two widths; `cover` normalises nine different source shapes. Deduction: centred crop unverified per image (**PRD-IMG-02**).                                                                                                           |
| Code consistency & project conventions    | **9** | Lint, stylelint, dependency-cruiser and Prettier all pass unmodified; new comments follow the codebase's practice of recording _why_.                                                                                                                                                             |
| Integration with application architecture | **9** | 0 dependency violations; no route, sitemap, locale or build-config change required; both asset globs already existed.                                                                                                                                                                             |

### Overall

|                                |                                    Score                                     |
| ------------------------------ | :--------------------------------------------------------------------------: |
| **`app-project-card` overall** |                                 **8.4 / 10**                                 |
| Image restoration correctness  | **10 / 10** — 19/19 byte-identical to `HEAD`, mapping 1:1, all paths resolve |

---

## 4. Issue register

**P0 — Critical: none.** Nothing found blocks functionality, loses data or creates a security exposure. All 19 images resolve (verified over HTTP), the build succeeds, and no published URL changed.

### P1 — High

**None.** The one candidate was the payload increase, classified P2 below because every affected image is lazy-loaded and the project's bundle budget still passes — it is a measured cost, not a failure.

### P2 — Medium

---

**PRD-IMG-01 · [DEFECT] · A mistyped photo file name is a runtime 404, not a compile error**

- **File:** `src/app/pages/our-work/products/data/product-meta.ts` — `ProductPhoto.file`
- **Problem:** `file` is `string`. `photo: { file: 'medcal.webp', … }` type-checks and ships a broken image.
- **Technical impact:** a silent blank card in production. This registry protects every other identifier against exactly this: `ProductId` is a union from a const tuple, `AppIconName` is a union, `ExternalUrl` is a template-literal type. The new field is the only unguarded one.
- **Recommended solution:** derive a union from a const tuple of the nineteen file names, as `PRODUCT_IDS` does — `const PRODUCT_PHOTOS = ['car.webp', …] as const; type ProductPhotoFile = (typeof PRODUCT_PHOTOS)[number];` — and extend `verify-images.mjs` (**PRD-IMG-05**) to assert the tuple matches the directory.
- **Acceptance:** a deliberately mistyped file name fails `npm run typecheck`; `products.spec.ts`'s mapping test still passes unchanged.

---

**PRD-IMG-02 · [RISK] · Tall photographs are centre-cropped by 30–41 % with no per-image control**

- **File:** `src/app/pages/our-work/products/project-card/project-card.scss` — `.project-card__media` / `.project-card__img`
- **Problem:** the media box is 16/10 (1.60) and `object-position` is unset, so every photo is cropped from its centre. `meal.webp` is 800 × 853 (0.94) and loses ≈41 % of its height; `organic.webp` (1.12) and `master.webp` (1.29) lose roughly a third.
- **Why a risk, not a defect:** the grid renders correctly and the crop is visually clean. Whether the _subject_ of each tall photo survives centring has **not** been verified image by image — that is a judgement about the content, and it was not made here.
- **Technical impact:** a product could be represented by a crop that omits the thing it is about.
- **Recommended solution:** review the three tall images on screen; if any subject is cut, add an optional `focus?: string` to `ProductPhoto` bound to `object-position`, defaulting to `center`. Do not add it speculatively.
- **Acceptance:** each of the nineteen crops is confirmed on screen at 1440 px and 390 px, and any correction is recorded next to the data rather than in the stylesheet.

---

**PRD-IMG-03 · [OPINION] · The generated `main-visual` set lost one of its two consumers**

- **Files:** `src/assets/images/products/product-NN/main-visual.webp` (19 files, 172.8 kB); `scripts/verify-images.mjs:9-12`
- **Problem:** `main-visual.webp` used to serve both the card and the detail hero. The card now uses a photograph, so the detail hero is its only consumer. The script's doc comment still says _"The card front and the detail hero resolve `main-visual.webp`"_, which is no longer true.
- **Technical impact:** none at runtime. `verify:images` requires both kinds per folder, so the files must stay where they are; the cost is a stale comment and a set of assets whose purpose has narrowed.
- **Recommended solution:** a decision, not a change — either keep the illustrations for the detail page (and correct the comment), or retire them and give the detail page the photographs too, which would also require rewriting the `illustrative` caption in three locales. **Recommendation: keep them.** The caption is the honest description of generated art, and the detail page is where a visitor is told what they are looking at.
- **Acceptance:** the comment in `verify-images.mjs` matches reality, and the decision is recorded in the repository.

---

**PRD-IMG-04 · [DEFECT] · The grid route downloads and materialises detail-page copy for 19 products in 3 locales**

- **Files:** `data/product-view.ts`; `products.ts`; `product.content.ts`
- **Evidence:** `/our_work/index.html` modulepreloads a chunk that is **117 828 B raw / 36 956 B gzipped** and contains Armenian dictionary prose (verified by substring match against a known `about` sentence). Measured over `product.content.ts` (126 820 B): `about` 46.4 %, `highlights` 12.7 %, `summary` 9.4 %, `advantage` 7.3 %, `value` 7.2 %. The card reads only `name` (1.4 %), `category` (3.2 %) and `hook` (7.3 %) — **11.9 % used, 83.1 % detail-only**. `toView` assigns 18 fields; the grid template reads 8.
- **Technical impact:** a first-paint cost on the grid route, not a correctness problem. Pre-existing; unchanged by this work.
- **Recommended solution:** split `ProductView` into `ProductCardView` / `ProductDetailView`, and move the detail-only fields into a second dictionary imported only by `product-detail.ts`. The split is clean now because no consumer straddles the line.
- **Acceptance:** no chunk preloaded by `/our_work/index.html` contains a product's `about` prose; `verify:bundle` still passes.

---

**PRD-IMG-05 · [DEFECT] · `public/images` is not covered by any verification script**

- **File:** `scripts/verify-images.mjs:5` — `IMAGES_DIR = 'src/assets/images/products'`
- **Problem:** the restored photographs are now a rendering dependency of every card, and nothing checks that they exist, are WebP, or stay within a size budget. `verify:images` looks only at the generated-art tree.
- **Technical impact:** deleting a photo (exactly the failure that prompted this task) passes every gate and is caught only by eye, or by the mapping unit test if the registry is edited too.
- **Recommended solution:** extend the script with a second pass over `public/images`, driven by `PRODUCT_META[*].photo.file`: assert each file exists, is WebP, and is within a budget. `MAX_IMAGE_BYTES` is already 120 kB and the largest photo is 108.0 kB, so the existing budget fits without being loosened.
- **Acceptance:** removing one photo fails `npm run verify:images` with that file named.

---

**PRD-IMG-06 · [DEFECT] · The grid's image payload grew 5.2× with the restoration**

- **Files:** `public/images/*.webp`
- **Evidence:** 19 generated `main-visual.webp` totalled **172.8 kB**; the 19 restored photographs total **905.9 kB**. Largest: `car.webp` 108.0 kB, `market.webp` 95.8 kB, `watch.webp` 83.1 kB.
- **Technical impact:** real but bounded. Every card image is `loading="lazy"` and correctly dimensioned, so only the first row is fetched on load (`medical` 20.4 + `car` 108.0 + `juce` 45.7 = **174.1 kB** above the fold at 1440 px). `verify:bundle` is unaffected — it measures JS, not assets — and still passes.
- **Why this is not a reason to undo the restoration:** these are the project's own committed images and the task required them. The cost is worth recording, not reverting.
- **Recommended solution:** run the restored set through `npm run images:optimize` (already in the project, no new dependency) and/or emit a smaller width for the card, which renders at 411 px CSS on a three-column desktop grid while the files are 480–800 px wide. Measure before and after.
- **Acceptance:** a recorded before/after byte count, with no visible quality loss at 1440 px and 390 px.

---

**PRD-IMG-07 · [DEFECT] · `<section class="projects">` has no accessible name**

- **File:** `src/app/pages/our-work/products/products.html:1,5`
- **Problem:** no `aria-labelledby`, and `.projects__title` has no `id`, so the band is not exposed as a navigable landmark. `about-products.html:1,4` does this correctly.
- **Technical impact:** a missed navigation affordance for screen-reader users. Not an axe violation, which is why the sweep passes.
- **Recommended solution:** `aria-labelledby="projects-title"` on the section, `id="projects-title"` on the `<h2>`.
- **Acceptance:** the section appears as a named region in an accessibility-tree snapshot; axe unchanged.

### P3 — Low

| ID             | Type    | Title                                                                                                                           | File                                                              | Fix                                                                                                  | Acceptance                                                     |
| -------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **PRD-IMG-08** | DEFECT  | `ProductView.archetype` is assigned and never read                                                                              | `data/product-view.ts`                                            | Drop it with the view-model split (**PRD-IMG-04**)                                                   | Grep for `.archetype` finds only derivations                   |
| **PRD-IMG-09** | DEFECT  | Stale registry comment: "eleven of nineteen are storefronts" — it is seven; the "filter vocabulary" it promises was never built | `data/product-meta.ts:4-9`                                        | Correct the count; drop the claim or build the filter (`pages/services/filter-bar` is the precedent) | Comment matches the registry                                   |
| **PRD-IMG-10** | DEFECT  | Hover lift delayed 120–420 ms on 14 of 19 cards                                                                                 | `products.scss:107`, `expertise.scss:96`, `what-we-build.scss:87` | Add `$hover: true` to the three `stagger` calls                                                      | Compiled rule reads `transition-delay:.42s,.42s,0s,0s`         |
| **PRD-IMG-11** | RISK    | Hardcoded `' — '` separator in the card's accessible name                                                                       | `project-card.html:24`                                            | Move to the dictionary                                                                               | Each locale supplies its own separator                         |
| **PRD-IMG-12** | OPINION | `zadeh.webp` is 480 × 334, the smallest in the set, rendered into a 411 px-wide box                                             | `public/images/zadeh.webp`                                        | Re-export from the source if one exists; **do not upscale or regenerate**                            | A sharper original is committed, or the limitation is recorded |
| **PRD-IMG-13** | DEFECT  | `product.content.ts` is 1120 lines / 126.8 kB serving two routes                                                                | `products/product.content.ts`                                     | Split per **PRD-IMG-04**                                                                             | `product-content.spec.ts` passes against both files            |

**Totals — P0: 0 · P1: 0 · P2: 7 · P3: 6**

**`CANNOT DETERMINE`:** whether the centre crop preserves the subject of each tall photograph (**PRD-IMG-02**) — this is a content judgement that requires someone who knows each client's work to look at the nineteen crops. **`NO EVIDENCE`:** that any restored image is wrong for its product — the two independently checkable cases (Mastercraft's storefront sign, Zadeh MD's product labels) both confirm the mapping.

---

## 5. Readiness

**Verdict: the restoration is complete and correct; the component is ready for further development.**

The images are the originals, byte for byte, from the only revision that holds them. The mapping is 1:1, pinned by a test, and corroborated by two photographs that carry their client's name. The layout, routing, SEO, localisation and accessibility surfaces are all unchanged, and every gate the project defines passes.

The open items are a payload cost that is now measured (**PRD-IMG-06**), a type hole that should be closed the way the rest of the registry already closes it (**PRD-IMG-01**), a verification gap around the restored directory (**PRD-IMG-05**), and one decision about the generated art that belongs to whoever owns the portfolio's presentation (**PRD-IMG-03**).
