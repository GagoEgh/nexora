# Nexora — Comprehensive Technical Audit

**Audit date:** 2026-11-16
**Auditor role:** Staff / Principal Angular Engineer & Software Architect (independent technical audit)
**Subject:** `C:\Users\xXx\Desktop\Nexora` — git branch `main`, HEAD `34df6bb` ("create product-gallery")
**Revised:** 2026-11-16, after remediation — see §1.1 and §4.0

> **Document status.** This report has two layers, kept deliberately separate.
>
> - **The audit** (§2–§10) records the project **as found** at HEAD `34df6bb`, conducted strictly read-only. Its findings are preserved as written, including those since fixed. An audit that quietly deletes the defects it found is not a record of anything.
> - **The remediation** (§1.1, §4.0, and the `RESOLVED` markers) records the fixes applied **after** the audit, on request, with the evidence that each one works.
>
> Scores and issue counts appear in both their **as-audited** and **current** form throughout. Where only one number is given, it is the current one.

---

## 1. Executive Summary

### Overall score: **8.9 / 10** — Strong, now passing its own gates

### _As audited (before remediation): 7.8 / 10 · after the first two passes: 8.5_

Nexora is an unusually well-engineered Angular 22 marketing and portfolio site. The codebase shows deliberate, senior-level discipline: a mechanically enforced layer architecture, a token-driven design system, zero `any` and zero non-null assertions in application code, and a test suite that encodes _contracts_ (change-detection strategy, sitemap↔route-table agreement, contact-API parity, font coverage for Armenian) rather than just asserting that components render. The static quality gates — TypeScript across four projects, ESLint with type information, Prettier, Stylelint, dependency-cruiser — all pass cleanly.

**As audited**, the score was held down because the repository's own gates were red on `main`, for a concrete reason: the nineteenth portfolio product, `connected-car`, was extended from one photograph to four without completing the accompanying work. That single unfinished change produced, in the shipped production artifact, three failing unit tests, three images with no alternative text, three accessibility violations that axe rates _critical_, six `srcset` candidates returning HTTP 404, and a product labelled "Android · Google Play" while linking to the Apple App Store. It reached a built artifact because the verification script that detects it, `npm run verify:images`, was not wired into CI.

**That cluster has since been fixed and verified** (§1.1). Two further passes followed: the flaky tests were fixed at the cause (§1.2), and then the register itself was worked through (§1.3), closing fifteen findings — the localisation divergences and the translation gate, the service taxonomy, the two strictness flags, the sampling gap in the accessibility sweep, the blind spot in `verify:images`, and the contrast nodes axe could not compute, which are now measured rather than unknown.

The suite is green at **505/505**, every static gate exits 0, and the verification scripts are all wired into CI. Six items remain and none of them is a product defect: one build non-determinism that has not been reproduced (`BUILD-001`), two performance changes that are specified but need a browser to prove safe (`NG-002`, `PERF-002`), two changes to the designed appearance that are the owner's call (`STYLE-001`, `STYLE-002`), and one documented complexity deliberately left intact (`CODE-001`). §1.3.2 gives the reasoning for each.

### Key findings

**Strengths**

1. **Architecture is enforced, not just documented.** `core ← shared ← layout ← pages` is checked by dependency-cruiser on every lint run: 215 modules, 623 dependencies, zero violations, with type-only cycles caught because `tsPreCompilationDeps` is deliberately enabled.
2. **Type safety is near-absolute.** Zero occurrences of `any`, `as any` or non-null assertion (`!.`) in 11,200 lines of application TypeScript. Domain identifiers are const tuples with type guards; `NonEmpty<T> = readonly [T, ...T[]]` makes `photos[0]` provably safe without `noUncheckedIndexedAccess`.
3. **Modern Angular used correctly and without ceremony.** Standalone components throughout, zoneless (no zone.js polyfill), signals/`computed`/`linkedSignal`/`afterRenderEffect`, Signal Forms with `provideSignalFormsConfig`, signal inputs and queries, `@defer` for the Material menu bundle, SSG via `@angular/ssr` with `outputMode: "static"`. Only **four** `effect()` calls exist in the whole codebase, each justified.
4. **SEO and prerendering are production-grade.** 87 routes prerendered and verified navigable without JavaScript; unique titles, agreeing canonical/hreflang/`x-default`, a JSON-LD `@graph` (Organization, WebSite, WebPage, BreadcrumbList, CreativeWork), an enforced CSP whose inline-script hashes are regenerated and re-checked mechanically.
5. **The test suite encodes intent.** `change-detection.spec.ts` reads the compiled `ɵcmp.onPush` flag _and_ walks the source tree so a new component cannot escape the check. `fonts.spec.ts` exists because Inter has no Armenian glyphs and that failure is otherwise invisible. This is the test discipline of a mature team.

**Weaknesses** (status after remediation)

1. ~~**`main` does not pass its own test suite.** 3 of 491 unit tests fail, deterministically, on the committed state.~~ — **RESOLVED.** 491/491.
2. ~~**One product page ships broken** — missing alt text, unnamed buttons, 404 image candidates, contradictory platform metadata.~~ — **RESOLVED.**
3. ~~**A quality gate exists but is not wired to CI** (`verify:images`).~~ — **RESOLVED.**
4. **Translation terminology drifts across dictionaries.** 24 English strings — including primary navigation labels and the site's main call to action — have two different Armenian and/or Russian renderings depending on which dictionary the visitor happens to hit. — **OPEN.**
5. **Verification coverage is uneven.** The accessibility and e2e suites sample 2 of 19 product pages; the critical violation found in this audit sat on one of the 17 unsampled pages. — **OPEN.**
6. **The pipeline is not yet trustworthy.** A production build fails intermittently on unchanged inputs, and one e2e test fails non-deterministically — **on the unmodified baseline as well**, 6 runs out of 6. Both were identified by this audit and neither is fixed. — **OPEN.**

### Issue counts

| Priority          | As audited |   New | Resolved |   Open |
| ----------------- | ---------: | ----: | -------: | -----: |
| **P0 — Critical** |          2 |     0 |        2 |      0 |
| **P1 — High**     |          4 |     1 |        4 |      1 |
| **P2 — Medium**   |          4 |     2 |        1 |      5 |
| **P3 — Low**      |         15 |     1 |        2 |     14 |
| **Total**         |     **25** | **4** |    **9** | **20** |

Four issues were identified **during** remediation: `DATA-001` (P1) and `TEST-005` (P2) were fixed, `TEST-004` (P2) and `TEST-006` (P3) remain open. Totals reconcile as 25 audited + 4 new = **29 identified, 9 resolved, 20 open**.

> **Correction.** The first version of this report gave the as-audited total as 21 (P3 = 11). That was a miscount of my own summary against my own table: the consolidated table in §4 listed 15 P3 items, not 11, partly because `SEO-001/002/003` occupies one row but is three issues. The findings themselves never changed — only the arithmetic over them. The figures above are counted directly from the table.

### Audit limitations

These are stated up front and repeated in the areas they affect:

- **No field data.** All Core Web Vitals figures are _laboratory_ measurements taken against a local static server. They are not field CWV and must not be presented as such.
- **Local server does not compress.** `scripts/serve-dist.mjs` sends no `Content-Encoding`. Measured transfer sizes for JS/CSS/HTML are therefore uncompressed and overstate production by roughly 4×. The project's own `verify:bundle` (gzip-aware) is cited instead for code weight. Image figures are unaffected (WebP is already compressed).
- **Browser coverage.** Runtime checks ran in Chromium only. The project's own config also covers WebKit and a real `isMobile` Pixel 7 profile; those were not re-executed here.
- **Translation naturalness.** Structural, terminological, punctuation and consistency properties of the Armenian and Russian copy were verified mechanically across all 1,196 entries. **Native-speaker fluency and tone-of-voice were not independently verified** and are marked as such; the Localization score reflects what was verifiable.
- **Contrast.** 5–31 `color-contrast` checks per page returned axe's _incomplete_ verdict (axe could not compute a ratio, typically over gradients or translucency). These are **unverified**, not failures, and are reported as a Potential Risk requiring manual review.
- **Build non-determinism.** A production build failed once and succeeded once on identical inputs. The root cause was not conclusively isolated; it is reported as **Cannot Determine** with full reproduction context.

---

## 1.1 Remediation Applied

Carried out after the audit, on request. Scope was limited to the `connected-car` defect cluster and the CI gate; **no other finding in this report was touched**.

### What changed

| #   | Issue                    | Change                                                                       | Files                                                           |
| --- | ------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | `FUNC-001` (P0)          | Added the three missing `photoAlts` in EN/HY/RU                              | `products/product.content.ts`                                   |
| 2   | `A11Y-001` (P0)          | Resolved by #1 — the thumbnail button takes its accessible name from the alt | —                                                               |
| 3   | `FUNC-002` (P1)          | Removed `url` and `platform`, with a comment recording why                   | `products/data/product-meta.ts`                                 |
| 4   | `PERF-001` (P1)          | Regenerated the image ladder; downscaled the oversized original              | `public/images/*`, `docs/legacy-product-screenshots/infin.webp` |
| 5   | `CI-001` (P1)            | Added `- run: npm run verify:images` after `verify:bundle`                   | `.github/workflows/ci.yml`                                      |
| 6   | `DATA-001` (P1, **new**) | Corrected three wrong declared dimensions                                    | `products/data/product-meta.ts`                                 |

### Why `url` and `platform` were removed rather than corrected

The audit flagged this as needing a decision (`FUNC-002`). Four independent sources settled it, all agreeing the product has no listing:

1. **The product's own copy**, in all three locales: _"Of all nineteen products this is the one whose published presence could not be established, so what is described here is its intended scope rather than a feature set verified against a live listing."_
2. **`product-detail.spec.ts:283`** — `// connected-car has no destination that can be opened, so it states none.`
3. **`product-detail.spec.ts:289-291`** — _"Four of the nineteen have no platform on record"_. Only three others lack one, so the count is correct only when `connected-car` is the fourth.
4. **`e2e/our-work.spec.ts:197`** — asserts exactly **17** outbound links. This test was **failing on `main`** with 18 and passes now.

Git corroborates the mechanism: `34df6bb` added `url` and `platform` in a single hunk, and the platform string is byte-identical to `mezave`'s immediately above it in the same file — a copy-paste. The Apple URL with an Android label was never a deliberate pairing.

### `DATA-001` — a defect the audit missed

While regenerating the ladder, the declared dimensions proved wrong for **all three** new photographs:

| File           | Declared   | Actual                   |
| -------------- | ---------- | ------------------------ |
| `infin.webp`   | 1000 × 667 | **3000 × 1500**          |
| `control.webp` | 1000 × 667 | **1080 × 1080** (square) |
| `serv.webp`    | 1000 × 667 | **910 × 767**            |

`width`/`height` become the `<img>` attributes that reserve layout space, and `width` drives the `srcset` `w` descriptors. Wrong values mean a wrong reserved aspect ratio (CLS) and wrong candidate selection — `infin.webp` was advertised as `1000w` while actually being 3000 px wide. Corrected to the measured values; `infin.webp` was downscaled to the pipeline's own `MAX_IMAGE_WIDTH` (1280) at its own quality (82), taking it from 229.5 kB to 65.3 kB. The 3000 px original was archived to `docs/legacy-product-screenshots/` first, so nothing was discarded.

**This is the audit's own miss, and worth naming as such:** §3.9 measured the _transferred bytes_ and caught the oversized file, but never compared declared dimensions against the images themselves. Neither does the project's tooling — see `TEST-004`.

### Note on the image pipeline

`scripts/optimize-images.mjs` **skips any variant file that already exists**. The six bad variants were full-size copies of their originals, not resizes, so the optimizer would have skipped straight over them. They had to be removed before regeneration. This is a sharp edge worth knowing about: a wrong variant is invisible to `images:optimize` and is only caught by `verify:images` finding it over budget.

### Evidence that the fixes work

| Check                                               | As audited                | Now                                                      |
| --------------------------------------------------- | ------------------------- | -------------------------------------------------------- |
| `npm test`                                          | 488/491, 3 failed         | **491/491, 0 failed**                                    |
| `npm run verify:images`                             | exit 1, 10 problems       | **exit 0** — 46 photographs, 200 files, largest 116.9 kB |
| axe `button-name` on `connected-car` (×3 locales)   | **3 critical**            | **0**                                                    |
| axe violations, 8 page/viewport/locale combinations | 3                         | **0**                                                    |
| `srcset` candidates returning HTTP 404              | 6                         | **0** (all 14 return 200)                                |
| `infin-200.webp` (the 200w candidate)               | 230 kB                    | **2.8 kB**                                               |
| Broken images across 7 viewports × 3 locales        | 9 / 9 / 9 / 6 / 6 / 3 / 3 | **0 at every width**                                     |
| `format:check`, `lint`, `typecheck`, `build`        | build red on first run    | **all exit 0**                                           |
| `verify:prerender` / `seo` / `headers` / `bundle`   | 0                         | **0** (87 routes, worst 223.7 kB gzip)                   |
| Outbound portfolio links (`our-work.spec.ts:197`)   | 18, **test failing**      | **17, passing**                                          |

The CI gate was verified to actually bite: removing `control-640.webp` makes `verify:images` exit 1 naming the missing file; restoring it returns exit 0.

### Corrections to the audit text

Three counting errors in the original, none of which changes a finding:

1. §2.4 and `CI-001` said `verify:images` was "the only `verify:*` script missing from CI" and that "five appear above". **Four** were wired (`prerender`, `seo`, `headers`, `bundle`); **two** were absent. The second, `verify:live-seo`, queries a deployed origin and is correctly absent from a pipeline that has none — the substance stands, the count did not.
2. The issue totals were given as 21 (P3 = 11) when the table listed 25 (P3 = 15). See the note under §1 Issue counts.
3. The `TEST-005` entry recommended waiting on `toHaveClass(/is-flipped/)`. Measurement showed that would not have worked — the class is already true at that point. Corrected in place in §4.

### What was deliberately **not** changed

`BUILD-001`, `I18N-001`/`002`, `ARCH-001`, `TEST-001`, and every P3 remain open and untouched. `TEST-005` was subsequently fixed in a second pass (§1.2). `TEST-004` and `TEST-006` are new and open.

---

## 1.2 Remediation — Second Pass (flaky tests)

A follow-up pass, on request, targeting `TEST-005`. Scope was the e2e tests only; **no application code was changed.**

### What changed

| Test                                                                | Line | Fault                                                              | Fix                          |
| ------------------------------------------------------------------- | ---- | ------------------------------------------------------------------ | ---------------------------- |
| _walks card → detail link → live link → next card_                  | 156  | `Tab` pressed in the frame before the back face became focusable   | await the back face visible  |
| _opens on focus, and holds while the caret moves between its links_ | 127  | same race; `focus()` on a hidden link silently does nothing        | await the back face visible  |
| _holds the page still while it is open…_                            | 720  | read the style once, using focus as a signal that was already true | poll the computed `overflow` |

All three are the same shape of defect: **an assertion made before the thing it depends on is true.** Full mechanism, measurements and the two corrections to my own earlier reasoning are in the `TEST-005` entry in §4.

### Result

| Check                                       | Before           | After              |
| ------------------------------------------- | ---------------- | ------------------ |
| `walks card`, on untouched `main`           | **0 / 6 passed** | —                  |
| `walks card` × 20                           | —                | **20 / 20**        |
| `walks card` + `opens on focus` × 15 each   | —                | **30 / 30**        |
| `holds the page still` × 12                 | 11 / 12          | **12 / 12**        |
| Full `our-work.spec.ts`, 4 consecutive runs | 155 / 156 each   | **156 / 156 each** |

### One finding raised, not fixed

Diagnosing the third test surfaced `TEST-006`: the gallery's `lock()` has no guard against a second call, so a double lock would restore `overflow: 'hidden'` and leave the page unscrollable. **It was investigated as the suspected cause and ruled out** — 12 instrumented cycles, 0 stuck. It is recorded as a latent P3, not as a defect, and deliberately left alone: changing component code was outside this pass.

### Scope note

Only `TEST-005` was named in the request. The test at line 127 shares its exact root cause, and the one at 720 had to be fixed for `npm run e2e` to go green at all — which was the evident point of the request. Both are flagged here rather than folded in silently.

---

## 1.3 Remediation — Third Pass (resolve the register)

A third pass, on request: _resolve the issues described in the report, **provided they actually exist**_ — verify each against the codebase first, fix it, validate the fix, then move on. Every item below was checked before it was touched, and two of the audit's own claims did not survive that check (§1.3.3).

### 1.3.1 Resolved

| ID           | Verified to exist as                                                                              | Fix                                                                               | Validation                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **TEST-004** | `verify:images` never compared declared dimensions against the files                              | dimension rule + per-variant width rule, via `sharp`                              | 18/18 script tests; on the pre-fix tree it caught an unresized variant that sat under the size budget |
| **TEST-006** | `lock()` unguarded while `unlock()` was guarded, and `openLightbox` locks before `showModal()`    | guard `lock()`, plus a double-open regression test                                | 505/505 unit                                                                                          |
| **TEST-001** | `a11y.spec.ts` listed 2 of 19 product pages by hand                                               | sweep derived from `PRODUCT_IDS`, so a new product cannot be unchecked            | 19/19 product pages, 0 axe violations                                                                 |
| **SEC-001**  | the `audit` job carried `continue-on-error: true`                                                 | removed; `--audit-level=high` is the gate                                         | 9 moderate / 0 high / 0 critical, so it passes today and fails on a high                              |
| **I18N-001** | one English string rendering two or more ways in `hy`/`ru`, in 24 groups                          | unified to the house form — **and 10 further groups the audit missed**            | `verify:translations`: 1202 English strings, each rendered one way per locale                         |
| **I18N-002** | Russian hero CTA `наши услуги` — lowercase, not a verb phrase                                     | `Ознакомиться с нашими услугами`, matching the other three pages                  | same gate                                                                                             |
| **I18N-003** | nothing prevented the drift from coming back                                                      | new `scripts/verify-translations.mjs`, wired into `npm` and CI                    | 11 own tests; 139 script tests overall                                                                |
| **ARCH-001** | the five service categories declared twice and labelled three times, nothing linking them         | `service-taxonomy.spec.ts`                                                        | 22 invariants across `en`/`hy`/`ru`; several would have failed before the I18N fixes                  |
| **SEO-003**  | `index.html` carried English defaults with nothing pinning them to the dictionary                 | `index-template.spec.ts` + a comment saying what owns the file                    | 6 tests, negative-tested by editing the template                                                      |
| **CODE-004** | `page` shadowed twice in the meta effect; `inject` written two ways                               | renamed to `pageMeta`/`webPageNode`; `inject` unified to the 2-of-3 majority form | `typecheck` exit 0                                                                                    |
| **CODE-002** | `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` both unset                            | enabled in `tsconfig.app.json`, and the **9 real errors** they found fixed        | `tsc` exit 0 with both flags; 505/505 unit; `lint` clean                                              |
| **CODE-003** | two counters (`navigations`, `openedAtNavigation`) and an inequality standing in for one question | one named flag, `closeOnArrival`                                                  | 505/505, including both semantics the spec pins                                                       |
| **CODE-001** | three fields over seven handlers, "the hardest code in the repository to modify safely"           | the invariants written down — see §1.3.4 for why not a refactor                   | comment-only; `prettier` and `typecheck` clean                                                        |
| **RESP-001** | worse than reported — see §1.3.3                                                                  | one viewport per declared breakpoint band (3 → 6)                                 | `e2e` typecheck clean                                                                                 |
| **A11Y-002** | 174 `color-contrast` nodes returning axe _incomplete_ across 7 pages — neither pass nor fail      | **measured**, then gated permanently                                              | **174/174 at or above threshold**, tightest 5.00:1 against 4.5; gate 7/7 in 20.7 s                    |

#### A11Y-002 is the one worth reading

The audit could not claim a contrast failure and did not: axe returns `incomplete` when it cannot compute a ratio — text over a gradient, a photograph or a translucent surface — and there were 5 to 49 such nodes on every page. That left a real part of the site's contrast simply unknown.

It is no longer unknown. Each node is now measured by looking at it rather than reasoning about it: screenshot the element, screenshot it again with its text made transparent, and the pixels that differ are exactly where the glyphs are — with the second shot holding the true background behind each one, gradient and photograph included. The text colour is then contrasted against **every** one of those background pixels, and the worst pixel is the verdict.

| Page          | Incomplete nodes | Worst measured |
| ------------- | ---------------- | -------------- |
| `/`           | 49               | 5.21:1         |
| `/contact`    | 34               | 5.45:1         |
| `/hy/contact` | 34               | 5.45:1         |
| `/services`   | 26               | **5.00:1**     |
| `/solutions`  | 13               | 5.46:1         |
| `/about`      | 13               | 5.45:1         |
| `/our_work`   | 5                | 5.51:1         |

174 measured, 0 unmeasurable, **0 below threshold**. The tightest node on the site is the active category pill on `/services` at 5.00:1 against a 4.5 requirement — 11 % of headroom, not a comfortable margin, but a pass on evidence rather than on assumption.

It is now `e2e/prerendered/contrast-incomplete.spec.ts`, which runs against the built output because the gradients and photographs involved are the production assets. It carries a vacuity guard: a gate that measures nothing would pass everything, so the test fails if a page yields no measurable node. `npm run e2e:prerendered` was already in CI, so no workflow change was needed.

### 1.3.2 Not applied, and why

| ID            | Status           | Reason                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **BUILD-001** | **INVESTIGATED** | Four things established, no reproduction. See §1.3.5.                                                                                                                                                                                                                                                                                                                                                                          |
| **NG-001**    | **BY DESIGN**    | The audit's own text calls the hand-rolled ladder "reasonable for prerendered static output", and it is now backed by a `verify:images` that checks dimensions too. Migrating to `NgOptimizedImage` would discard a tested design to fix a problem that no longer exists. Recorded as examined and kept, not as outstanding.                                                                                                   |
| **NG-002**    | **SPECIFIED**    | The mechanism in the audit would break the site. See §1.3.6.                                                                                                                                                                                                                                                                                                                                                                   |
| **PERF-002**  | **SPECIFIED**    | Real and worth doing: 39 icons, ~23 kB raw, would go from 15 requests to 1 on the home page and 33 to 1 on `/our_work`. Not applied because every icon relies on `fill="none"` on its root `<svg>`, and `<symbol>` extraction may not carry that attribute — guess wrong and all 39 icons render as filled black shapes on every page. Verifying it needs a browser pass over the built output, which this pass could not run. |
| **STYLE-001** | **DEFERRED**     | `clamp()` would change the rendered size of three type roles at **every** width between 430 px and 1199 px, across the whole site. The audit calls the current discrete step "legible and intentional" and the change an improvement in how the range is used — that is a change to the designed appearance, and the owner's decision rather than the auditor's.                                                               |
| **STYLE-002** | **DEFERRED**     | Container queries are an architectural change to all component SCSS, for cards that currently adapt correctly. Same reasoning, larger blast radius.                                                                                                                                                                                                                                                                            |

The distinction being drawn: `SPECIFIED` means I know what to do and could not prove it safe here. `DEFERRED` means it is not mine to decide. Neither is a claim that the work is unnecessary, and neither is recorded as resolved.

### 1.3.3 Two corrections to this report's own text

**The `label` / `shortLabel` pairs were never defects.** Group #23 (`AI Orchestrator`) and the `Web App` group were listed under `I18N-001` as divergent translations of one English string. They are not: each is a full `label` paired with a deliberately shorter `shortLabel` or `eyebrowShort` for a tight slot. An abbreviation differing from the thing it abbreviates is the feature. Rather than argue the case per group, `verify:translations` excludes abbreviation fields structurally, so the distinction cannot be re-litigated by the next reader.

**`Mobile Applications` was genuine context, not drift.** Two discipline lists use different English registers — `about-quality` says `UI/UX design`, `Backend & APIs`, `Cloud & DevOps`; `why-disciplines` says `UI/UX`, `Backend`, `DevOps`. Where the English coincides, the Russian and Armenian now coincide too, which is the correct outcome: the translation tracks its source. Three groups genuinely need to differ by context and are allowlisted in the gate with the reason written out, not suppressed.

**And one correction in the other direction — `RESP-001` was understated.** The audit reported that 430, 768, 1024 and 1920 px sit in no regression check. The real gap was larger: the stylesheet declares five bands (`compact: 0`, `medium: 600`, `expanded: 840`, `large: 1200`, `extra-large: 1600`), and the overflow sweep covered `compact` twice and `expanded` at its boundary — **three of the five bands had no viewport at any width.** The fix therefore sweeps one viewport per declared band, at the band's own minimum where its grid is tightest, rather than the four device widths the audit named: a width that shares a band with one already listed re-tests the same grid, while a band with nothing listed is a grid nothing asserts.

### 1.3.4 Why `CODE-001` was documented rather than refactored

The finding is that the flip interaction is three fields across seven handlers and is the hardest code here to change safely. That is accurate. It is also _correct_ code, and the three fields are not redundant — they exist because three input devices reach the same interaction and one device's events must not be read as another's: `openOnFocus` is a re-entrancy gate for the programmatic `focus()` inside `dismiss()`, and `openedByFocus` stops the click half of a touch tap from undoing the open that the focus half just performed.

Its coverage is a touch-specific Playwright project, which is exactly the suite this pass could not run. Rewriting interaction logic whose only proof is a suite I cannot execute would be trading a documented complexity for an unverified regression on a live site. So the invariants are now written down — what each field means, which handler keeps which rule, and why the two gates are plain fields rather than signals. That addresses the stated harm, which was opacity, at zero behavioural risk. The structural refactor remains available to anyone who can run the touch project.

### 1.3.5 `BUILD-001` — what is now known

Still the one P1 not closed. Not reproduced, but no longer a blank:

- **A concurrent wipe would be silent.** `prepareIntlayer` runs `cleanOutputDir()` _before_ it logs "Preparing Intlayer", so a second process clearing `.intlayer/dictionary` leaves nothing in the log to see it by.
- **The duplicate `@intlayer/config` is not the cause.** A nested 9.6.0 beside the root 9.7.0 — an upstream exact-pin conflict across `@intlayer/engine`, `core`, `api`, `analytics` and `editor` — explains the "v9.6.0" banner, but both copies resolve to **identical** configuration.
- **The two esbuild passes share one promise.** `loadPlugins` is called once per builder run, so both passes await the same `preparePromise`; they cannot race each other.
- **A `prebuild: intlayer build` step would make things worse, not better.** That CLI generates _dev_ dictionaries, which a production build could then reuse inside the 30-second cache window.
- **Not reproduced** with a live `ng serve` content watcher running concurrently with a production build; the Intlayer phase completed without error.

Separately, and worth recording because it bit this work twice: a force-killed or stopped build leaves `intlayer-task.lock` behind and orphaned `node`/`esbuild`/`dart-sass` processes alive. Once, a surviving `ng test` held the lock — `ng test` is not matched by `WATCH_COMMAND`, so it does not take the early-release path — and `intlayer build` hung past 600 s; clearing the trees returned it to 3.6 s and freed 2 GB. That is a genuine determinism hazard in its own right, and a plausible neighbour of the original one-off failure.

### 1.3.6 `NG-002` — the right mechanism is not the one the audit named

The audit recommends `@defer (on viewport)` on the below-fold illustrations and calls it the highest-leverage remaining performance change. The leverage is real; the mechanism as written would break the site.

Output is static: 87 routes are prerendered. A plain `@defer (on viewport)` block renders its `@placeholder` at prerender time, so the illustrations would be **absent from all 87 prerendered pages** and appear only after the client hydrates and scrolls. That breaks 8 geometry assertions in `e2e/what-we-build.spec.ts`, which measure the illustration's box and count its `svg` children on a page Playwright reaches by `goto` and never scrolls.

The correct mechanism is **incremental hydration**: `provideClientHydration(withIncrementalHydration())` — hydration is already configured — with `@defer (hydrate on viewport)`. The full illustration then stays in the prerendered HTML, so nothing is lost for crawlers, layout or those assertions, while the JavaScript chunk is neither downloaded nor hydrated until the block is scrolled to. Three candidates, all genuinely below the fold: `what-we-build-illustration` (host already `aspect-ratio: 368 / 168`, so a placeholder can reserve its exact space), `conversation-art` (`aspect-ratio: 1`, `max-width: 460px`, and it sits at the foot of many pages, so it is the broadest win) and `ai-pipeline` (content-driven height — needs a measured `min-height` or it will shift on client-side navigation). `hero-illustration` stays eager; it is above the fold.

It is specified and not applied because it changes hydration behaviour application-wide, interacts with the `appReveal` directive inside one of the blocks and with the `@for` loop around another, and its entire payoff — bytes not downloaded until scroll — can only be confirmed in a browser. Shipping an app-wide hydration mode change to a live marketing site on the strength of a type check would be the wrong trade.

### 1.3.7 Result

| Check                                 | Result                                                           |
| ------------------------------------- | ---------------------------------------------------------------- |
| `npm test`                            | **505 / 505** in 60 files (491 at the start of the pass)         |
| `npm run typecheck`                   | exit 0, all four projects, with two new strict flags on app code |
| `npm run lint`                        | exit 0 — eslint, 217 modules dependency-cruised, stylelint       |
| `npm run test:scripts`                | **139 / 139**                                                    |
| `npx tsc -p e2e/tsconfig.json`        | exit 0                                                           |
| `verify:images`                       | exit 0 — 46 photographs, 200 files, largest 116.9 kB             |
| `verify:translations`                 | exit 0 — 1202 strings, 3 documented exceptions                   |
| `e2e:prerendered contrast-incomplete` | **7 / 7** in 20.7 s, 174 nodes measured                          |
| axe sweep, all product pages          | **19 / 19** clean                                                |
| `prettier --check`                    | clean on every touched path                                      |

The full e2e suite was **not** run in this pass: a prior run was stopped by the harness when the machine ran critically low on memory, with an instruction not to restart it. Everything claimed above was executed; nothing is reported as validated on the strength of a suite that did not run.

---

## 2. Project Overview

### 2.1 Technology stack and versions

Read from `package.json` and verified against `node_modules`.

| Package                                                  | Declared                         | Installed     | Latest | Note                               |
| -------------------------------------------------------- | -------------------------------- | ------------- | ------ | ---------------------------------- |
| `@angular/core`, `common`, `router`, `forms`, `compiler` | `^22.2.3`                        | 22.2.3        | 22.2.6 | 3 patches behind                   |
| `@angular/material`, `@angular/cdk`                      | `^22.2.3`                        | 22.2.3        | 22.2.7 | 4 patches behind                   |
| `@angular/ssr`                                           | `^22.2.4`                        | 22.2.4        | —      | static output mode                 |
| `@angular/build`, `@angular/cli`                         | `^22.2.3`                        | 22.2.3        | 22.2.7 |                                    |
| `@angular-builders/custom-esbuild`                       | `^22.0.1`                        | 22.0.1        | —      | enables `esbuild.plugins.ts`       |
| `typescript`                                             | `~6.0.0`                         | 6.0.x         | —      |                                    |
| `intlayer` / `angular-intlayer`                          | `^9.7.0`                         | 9.7.0         | 9.8.1  | i18n engine                        |
| `rxjs`                                                   | `~7.8.0`                         | 7.8.x         | —      | used sparingly, router events only |
| `vitest`                                                 | `^4.0.8`                         | 4.1.12        | —      | unit runner                        |
| `@playwright/test`                                       | `1.64.1`                         | 1.64.1        | 1.65.1 | pinned exactly                     |
| `@axe-core/playwright`                                   | `^4.14.0`                        | 4.14.x        | —      | WCAG automation                    |
| `eslint` / `typescript-eslint` / `angular-eslint`        | `^10.12.0` / `8.71.0` / `22.6.0` | —             | —      |                                    |
| `stylelint` + `stylelint-config-standard-scss`           | `^17.16.0` / `^17.0.0`           | —             | —      |                                    |
| `dependency-cruiser`                                     | `^18.7.0`                        | 18.7.0        | 18.7.2 | architecture gate                  |
| `sharp`                                                  | `^0.35.5`                        | —             | —      | image pipeline                     |
| Node (CI)                                                | 24                               | local 24.22.0 | —      |                                    |

**No runtime production dependency is outdated by more than a patch release**, and nothing is on an unsupported major.

### 2.2 Project structure (actual, as inspected)

```
Nexora/
├─ src/
│  ├─ app/
│  │  ├─ core/            i18n/ icons/ routing/ seo/        (bottom layer, independent)
│  │  ├─ shared/          motion/ services-catalogue/ ui/   (may depend on core only)
│  │  ├─ layout/          header/ footer/                   (may not import pages)
│  │  ├─ pages/           home about services ai-agent solutions
│  │  │                   engagement-models partnerships contact
│  │  │                   our-work not-found
│  │  ├─ app.routes.ts    composition root, lazy loads every page
│  │  ├─ app.config.ts    provider composition
│  │  └─ app.routes.server.ts  87 prerender targets
│  ├─ styles/             tokens/ mixins/ theme/ _fonts.scss
│  ├─ environments/       environment{,.production,.model}.ts
│  └─ assets/images/products/  38 WebP source visuals
├─ public/                brand/ fonts/ icons/ images/ _headers _redirects robots.txt sitemap.xml
├─ e2e/                   37 Playwright specs + prerendered/ + support/
├─ scripts/               12 Node ESM tools, each with a sibling .test.mjs
└─ docs/legacy-product-screenshots/
```

**Size:** 421 files under `src`. 11,200 lines of application TypeScript, 9,856 lines of spec TypeScript (**0.88 : 1 test-to-source ratio**), 9,209 lines of SCSS, 2,527 lines of HTML templates.

### 2.3 Architectural overview

- **Routing.** Two sibling route trees share one `pages` array: `:locale` (guarded by `matchLocalePrefix`, which only matches non-default locales) and the bare path. Every page is `loadComponent`-lazy. Each route carries `data: { meta: '…' } satisfies DocumentMetaRouteData`, giving the SEO layer a type-checked key. The product route uses `canMatch: [matchProductSlug]` so an unknown slug falls through to the 404 route rather than rendering an empty page.
- **i18n.** `intlayer` in `prefix-no-default` mode (`en` unprefixed, `hy`/`ru` prefixed). Copy lives in 53 `*.content.ts` dictionaries co-located with the component that uses them. `syncLocaleWithUrl` is a `CanActivateFn` that reconciles the active locale with the URL. Generated declarations are redirected out of `.intlayer/` into `intlayer-types/` with a comment explaining exactly why (Angular's esbuild watcher ignores dot-directories).
- **SEO.** `provideDocumentMeta()` registers one environment initializer holding a single `effect()` that, per navigation, sets title, description, Open Graph, Twitter, `canonical`, per-locale `alternate` + `x-default`, conditional `robots: noindex` for 404, and a JSON-LD `@graph`. `DocumentMetaOverride` is a root signal service that lets the product page contribute a `CreativeWork` node and its own breadcrumb.
- **API integration.** `ContactSubmitter` is an abstract-by-convention base returning `{ status: 'not-configured' }` (Null Object). `provideContactForm()` swaps in `HttpContactSubmitter`, which de-duplicates identical in-flight submissions, maps `HttpErrorResponse` bodies to rejected field names, and routes every failure through Angular's `ErrorHandler`.
- **State.** Signals only. No NgRx, no store, no global mutable state beyond one root signal service for meta overrides. This is correct for the problem size.

### 2.4 Existing quality gates

| Gate                                        | Command                           | Status at audit                                 | After remediation                   |
| ------------------------------------------- | --------------------------------- | ----------------------------------------------- | ----------------------------------- |
| Formatting                                  | `npm run format:check`            | **Pass**                                        | Pass                                |
| Lint (ESLint + templates + a11y rules)      | `ng lint`                         | **Pass** — "All files pass linting"             | Pass                                |
| Architecture                                | `npm run lint:deps`               | **Pass** — 0 violations, 215 modules / 623 deps | Pass                                |
| Styles                                      | `npm run lint:styles` (Stylelint) | **Pass**                                        | Pass                                |
| Types (4 projects: app, spec, e2e, scripts) | `npm run typecheck`               | **Pass**                                        | Pass                                |
| Unit tests                                  | `npm test`                        | **FAIL — 3 of 491**                             | **Pass — 491/491**                  |
| Script tests                                | `npm run test:scripts`            | **Pass**                                        | Pass                                |
| Production build                            | `npm run build`                   | **Pass on retry** (1 failure in 2 runs)         | Pass — _still non-deterministic_    |
| Prerender                                   | `npm run verify:prerender`        | **Pass** — 87 pages navigable without JS        | Pass — 87 pages                     |
| Bundle budget                               | `npm run verify:bundle`           | **Pass** — worst route 223.7 kB gzip vs 240 kB  | Pass — 223.7 kB gzip                |
| Headers / CSP                               | `npm run verify:headers`          | **Pass** — 7 inline scripts hashed, 6 headers   | Pass                                |
| SEO                                         | `npm run verify:seo`              | **Pass** — 87 docs, 84 indexable, 3 noindex     | Pass                                |
| Images                                      | `npm run verify:images`           | **FAIL — exit 1, 10 problems**                  | **Pass — exit 0, largest 116.9 kB** |
| E2E (a11y + overflow, chromium)             | Playwright                        | **Pass — 312/312**                              | Pass — 312/312                      |
| E2E (`our-work.spec.ts`, chromium)          | Playwright                        | _not run during the audit_                      | **Pass — 156/156, 4 runs running**  |

Notable configuration quality: ESLint enables `@typescript-eslint/no-deprecated` **with full type information across three tsconfig projects**, with a comment recording that this rule was added after four deprecated Signal Forms overloads passed every other gate. Stylelint forbids `!important` and shadow-piercing selectors outright and enforces flat BEM. These are gates a team adds after being burned, which is the right reason to add them.

### 2.5 Testing infrastructure

- **Unit:** Vitest 4 via `@angular-builders/custom-esbuild:unit-test`, 58 spec files, 491 tests, 15 s timeout.
- **E2E:** Playwright, 37 specs, three projects — `chromium`, `webkit`, and `mobile-chrome` (Pixel 7, genuinely `isMobile` so `hover: none` / `pointer: coarse` really match; the config carries a long comment explaining why a phone-sized desktop context is not a phone).
- **Prerendered E2E:** separate config serving `dist/` over `scripts/serve-dist.mjs`.
- **Accessibility:** `@axe-core/playwright` across `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`, 12 pages × 3 locales, at 1440 px and 390 px.
- **Scripts:** every `scripts/*.mjs` has a sibling `*.test.mjs` run by `node --test`.
- **Not present:** any coverage instrumentation, reporting or threshold.

---

## 3. Detailed Technical Assessment

### 3.1 Code Quality — **9 / 10** (Confidence: High)

**Assessment.** Among the cleanest Angular codebases this auditor has reviewed. The discipline is consistent rather than localised, and the comments explain _why_ rather than restating the code.

**Evidence.**

- `grep` for `: any`, `as any`, `<any>` across all `src/**/*.ts` including specs: **0 matches**.
- `grep` for non-null assertion in application code: **0 matches**.
- `as unknown as` appears 11 times, **all in spec files**, each reaching into a framework internal (`ɵcmp`, `HTMLDialogElement.prototype`) where no safe alternative exists.
- `eslint-disable` appears exactly twice, both with a multi-line justification (`chip-select.ts:22` documents that Angular Material's chip action reads only the deprecated `event.keyCode`, with a pointer to the spec that pins the bug).
- `effect()` count across the codebase: **4** (`app.ts`, `document-meta.ts`, `product-detail.ts`, `services.ts`). Each is a genuine DOM/outside-world synchronisation; none is a disguised `computed`.
- Largest non-dictionary TypeScript file: `contact-form.ts` at 263 lines. Largest template: `contact-form.html` at 234 lines. No god components.
- `npm run typecheck` (4 projects), `ng lint`, `format:check`, `lint:styles` — all clean.

**Findings.** `CODE-001` (ProjectCard interaction state machine), `CODE-002` (two strictness flags unused), `CODE-003` (header menu-close heuristic), `CODE-004` (minor style inconsistency and variable shadowing). All P3.

**Recommendations.** Enable `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` and fix the fallout; extract `ProjectCard`'s flip behaviour into a tested helper. Neither is urgent.

**Verification.** `npm run typecheck && npm run lint && npm run format:check` must stay green; add the two flags to `tsconfig.json` and confirm `typecheck` still passes.

---

### 3.2 Architecture — **9 / 10** (Confidence: High)

**Assessment.** The layering is real, declared, explained, and machine-checked. Dependency direction is correct and cohesion is high. The architecture is proportionate — there is no speculative abstraction anywhere.

**Evidence.**

- `.dependency-cruiser.cjs` declares seven rules, each with a comment giving the concrete incident that motivated it. `npm run lint:deps` reports **"no dependency violations found (215 modules, 623 dependencies cruised)"**.
- The `content-files-are-leaves` rule prevents a copy dictionary importing a component — with a named exemption list for id/type leaves, so a dictionary entry can name its own identifier instead of being matched by position. That is a subtle, well-reasoned constraint.
- `route-table-is-composition-only` forbids anything but `app.config.ts`/`app.routes.ts` importing the route table; features import `core/routing/paths.ts` instead.
- Environment configuration is typed (`environment.model.ts`) and the production variant deliberately sets `apiOrigin: ''`, which `API_ORIGIN`'s factory validates via `isUsableOrigin()` and degrades to the Null Object submitter — a safe default rather than a runtime crash.
- `app.routes.server.ts` documents why 19 slugs × 3 locales must be enumerated (a parameterised path cannot be crawled), taking the build from 30 to 87 routes.

**Findings.** `ARCH-001` (P2) — the five service categories are declared independently in `shared/services-catalogue/service-category.ts` (`SERVICE_CATEGORY_IDS`) and in `pages/contact/contact-form/contact-submitter.ts` (`SERVICE_VALUES`), with their display labels written a third time in `layout/footer/footer.content.ts`. `contact-contract.spec.ts:110` pins `SERVICE_VALUES` to the documented API contract, and `service-category.spec.ts` pins the catalogue — but **nothing ties the two to each other**, and nothing ties their three sets of labels together. This is the structural cause of localisation finding `I18N-001`.

**Recommendation.** Derive one from the other, or add a spec asserting `SERVICE_VALUES` equals `['', ...SERVICE_CATEGORY_IDS]` and that the three label sources resolve to the same strings per locale.

**Verification.** `npm run lint:deps` stays at zero violations; new spec fails if either list is edited alone.

---

### 3.3 Design Patterns — **9 / 10** (Confidence: High)

**Assessment.** Patterns are applied where they pay for themselves and nowhere else. No pattern is present for its own sake, and no anti-patterns were found.

**Evidence.**

- **Null Object + Strategy via DI.** `ContactSubmitter` returns `not-configured`; `provideContactForm()` substitutes `HttpContactSubmitter`. The form is testable without HTTP and safe before the API exists.
- **Facade.** `useLocaleSwitcher()` composes `Router`, `ViewportScroller`, `ApplicationRef` and `useLocale()` into `{ locale, locales, names, urlFor, switchTo }`; `switchTo` preserves scroll position across the locale navigation by capturing it, awaiting `app.whenStable()`, and restoring — a real problem solved in one place and reused by header and footer.
- **Composition over inheritance.** Inheritance appears exactly once (`HttpContactSubmitter extends ContactSubmitter`) and is the DI substitution point. Everything else composes.
- **Custom validators.** `contact-rules.ts` implements `notBlank` and `emailTld` against the Signal Forms `SchemaPath` generic signature, each with a stable `kind` constant — correctly typed, not stringly-typed.
- **Consistent domain-id idiom.** `PRODUCT_IDS`, `CHALLENGE_IDS`, `MODEL_IDS`, `SERVICE_CATEGORY_IDS` each pair a `as const` tuple with a derived union, a type guard, and a `*SectionId()` helper. The repetition is four small modules; extracting a generic factory would add indirection without removing meaningful duplication, so leaving it is the correct call.
- **Presentational/container split.** `ServiceCard`, `IconTile`, `PageIntro`, `ProjectCard`, `StartConversation` take `input.required<T>()` and own no data fetching. `Products` resolves shared labels once (`labels` computed) "rather than nineteen times in the child" — the comment is accurate.

**Findings.** `CODE-001` (P3) — `ProjectCard` is the one place where a pattern is strained: `flipped` (signal) plus `openOnFocus` and `openedByFocus` (plain mutable fields) form a three-variable state machine spread over six host handlers with a `try/finally` around `focus()`. It is correct and covered by a touch-specific Playwright project, but it is the hardest code in the repository to modify safely.

**Verification.** Extract to a directive or helper with unit tests covering: hover-open, focus-open, Escape-dismiss, tap-toggle, and focus-out-close.

---

### 3.4 Functionality & Business Logic — **9 / 10** (Confidence: High)

> _As audited: **6 / 10**. Raised to 9 after remediation: the `connected-car` cluster is fixed and 491/491 unit tests pass. Not 10 — the wrong-dimension class of error (`DATA-001`) went undetected by every existing gate, and still would (`TEST-004`)._

**Assessment.** The eight content pages and the contact workflow are correct and thoroughly exercised. One of nineteen product pages ships materially broken, in four distinct ways, and the repository's own tests say so.

**Evidence — what works.**

- 488 of 491 unit tests pass; 312 of 312 executed e2e tests pass against the production artifact.
- Contact form: validation parity with the documented API is asserted field by field (`contact-contract.spec.ts` — presence with trimming, email TLD rules, maximum lengths, the exact ten-field payload, optional selects sent as empty strings, honeypot left empty). Submission handles `sent` / `not-configured` / `failed`, focuses the first invalid field on `onInvalid`, focuses the first server-rejected field after a rejection, resets and moves focus to the heading on success, and de-duplicates identical in-flight requests.
- Language switching preserves scroll position and the current route; `localeFromLocation()` seeds the locale from `location.pathname` at bootstrap; `syncLocaleWithUrl` reconciles on every activation.
- Loading/empty/error states: the gallery guards `many()`, the product route guards unknown slugs via `canMatch`, `_redirects` returns a real 404 status for unknown URLs with a comment explaining why a 200 rewrite would be wrong for crawlers.

**Evidence — what is broken.** All of the following concern `connected-car` and were confirmed against `dist/nexora/browser/` built during this audit:

```
AssertionError: connected-car has 4 photographs: expected 1 to be 4
  src/app/pages/our-work/products/data/product-content.spec.ts:133

AssertionError: connected-car photograph 1 renders alt="": expected 0 to be greater than 0
  src/app/pages/our-work/product-detail/product-detail.spec.ts:238

AssertionError: expected 'https://apps.apple.com/us/app/myinfin…' to be undefined
  src/app/pages/our-work/product-detail/product-detail.spec.ts:285
```

`product-meta.ts:193-203` declares four photos for `connected-car`; `product.content.ts` supplies one `photoAlts` entry. `product-meta.ts:201-202` sets `url: 'https://apps.apple.com/us/app/myinfiniti-app/id1529917696'` alongside `platform: 'Android · Google Play'`, and the spec at `product-detail.spec.ts:283` states in a comment that this product "has no destination that can be opened, so it states no url".

**Findings.** `FUNC-001` (P0), `FUNC-002` (P1), and the downstream `A11Y-001` (P0) and `PERF-001` (P1).

**Recommendation.** Complete the `connected-car` entry: add three `photoAlts` in all three locales, reconcile `url`/`platform` against the intended truth, and regenerate the image ladder.

**Verification.** `npm test` returns 491/491; `npm run verify:images` exits 0.

---

### 3.5 Angular 22 Best Practices — **8 / 10** (Confidence: High)

**Assessment.** The project tracks current Angular guidance closely and in several places exceeds it. Deductions are for two specific, defensible-but-costly omissions, one of which produced a shipped defect.

**Evidence — conformance.**

| Area             | Observation                                                                                                                                                                                                                                                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standalone       | Every component; no NgModule anywhere                                                                                                                                                                                                                                                                                                    |
| Change detection | **No component declares `changeDetection`.** Angular 22 compiles an omitted strategy to OnPush. `change-detection.spec.ts` pins the enum semantics (`OnPush === 0`, `Eager === 1`, `Default === Eager`), asserts all 73 registered components resolve to OnPush, **and walks `src/app` to fail if a new `@Component` is not registered** |
| Zoneless         | `angular.json` declares no `polyfills` — zone.js is not loaded                                                                                                                                                                                                                                                                           |
| Signals          | `signal`, `computed`, `linkedSignal` (gallery index resets when `shots` changes), `toSignal` with `requireSync`/`initialValue`, `afterRenderEffect`, `afterNextRender`                                                                                                                                                                   |
| Inputs/queries   | `input()`, `input.required()`, `viewChild.required()`, `viewChildren()` throughout; `withComponentInputBinding()` binds `:slug` straight to `ProductDetail.slug`                                                                                                                                                                         |
| Forms            | Signal Forms (`form()`, `required`, `email`, `maxLength`, `readonly`, `submit`, `validate`, `provideSignalFormsConfig`) — no `ReactiveFormsModule`                                                                                                                                                                                       |
| DI               | `provideEnvironmentInitializer`, `provideAppInitializer`, `makeEnvironmentProviders`, `InjectionToken` with `providedIn: 'root'` factories                                                                                                                                                                                               |
| Templates        | `@if` / `@for` with `track` / `@defer (on immediate)`; zero `*ngIf` / `*ngFor`                                                                                                                                                                                                                                                           |
| Host bindings    | `host: {}` metadata object; zero `@HostListener` / `@HostBinding`                                                                                                                                                                                                                                                                        |
| SSR/SSG          | `@angular/ssr` `withRoutes`, `RenderMode.Prerender`, `outputMode: "static"`, `provideClientHydration()`                                                                                                                                                                                                                                  |
| Deprecations     | `@typescript-eslint/no-deprecated: error` **with type information** — the strongest available guard                                                                                                                                                                                                                                      |

**Findings.**

- `NG-001` (P3): **`NgOptimizedImage` is not used.** Responsive images are hand-rolled (`photoSrc`/`photoSrcset` in `product-meta.ts` plus an offline `sharp` ladder). The approach is reasonable for prerendered static output and is backed by `verify:images` — but it is also exactly where `PERF-001` originated, because a hand-rolled `srcset` emits candidates for files that may not exist, whereas `NgOptimizedImage` would not have invented the four byte-identical widths.
- `NG-002` (P3): **`@defer` is used only twice**, both in the header. Heavy decorative subtrees (`HeroIllustration` with `ArtNode`/`ArtPipeline`/`HeroNotes`, `WhatWeBuildIllustration` at 177 template lines, `ConversationArt`, `AiPipeline`) are all eagerly rendered in the initial route chunk. `@defer (on viewport)` on the below-fold illustrations is the single highest-leverage remaining performance change.

**Verification.** After adopting `@defer (on viewport)` for below-fold illustrations, `npm run verify:bundle` should show a reduced initial route payload with the 240 kB budget still met, and `verify:prerender` must still report 87 navigable pages.

---

### 3.6 SCSS & Styling — **9 / 10** (Confidence: High)

**Assessment.** A genuine design system, not a stylesheet collection. Tokens are the single source of truth and the system fails loudly on misuse.

**Evidence.**

- **Tokens with guard rails.** `spacing.space($step)` and `motion.duration/easing/distance($name)` `@error` on an unknown value, so an off-scale spacing or an undeclared duration is a **compile error**, not a silent fallback. `layout.up($class)` likewise errors on an unknown breakpoint.
- **One place for type.** `_typography.scss` emits every role as a `--nx-sys-*` custom property; the header comment records that the scale was reduced 8–10 % while preserving inter-role ratios. No component defines its own type.
- **Reduced motion is a token concern.** `_motion.scss` zeroes durations and distances inside `@media (prefers-reduced-motion: reduce)` at the token layer, so every consumer inherits it automatically.
- **Enforced hygiene.** `!important`: **0 occurrences**. `::ng-deep` / `>>>` / `/deep/`: **0 occurrences** (Stylelint forbids them with a message directing authors to expose a custom property instead). Flat-BEM class pattern enforced. `no-duplicate-selectors: true`.
- **Modern CSS in use.** 77 logical-property declarations (`padding-inline`, `margin-inline`, `inset-inline`), 154 `display: grid` vs 73 `display: flex` (grid-first), `minmax()` across 42 files, `aspect-ratio` / `:has()` / `subgrid` in 8 places, `scroll-snap-type` with `proximity` in the gallery, `clip-path: inset(50%)` for visually-hidden.
- **Material integration is token-mediated.** `mat.strong-focus-indicators()` is driven by `--nx-sys-focus-ring-*`; theme overrides live under `styles/theme/`.
- Largest component stylesheet: 250 lines (`product-gallery.scss`). `anyComponentStyle` budget: 5 kB warn / 8 kB error — not breached by the build.

**Findings.**

- `STYLE-001` (P3): **No `clamp()` anywhere.** Typography steps discretely at the `large` (1200 px) breakpoint for exactly three roles (`display-hero`, `display-page`, `body-lead`). Between 430 px and 1199 px the hero is pinned at the compact size — legible and intentional, but a fluid `clamp()` would use the intermediate range better.
- `STYLE-002` (P3): **No container queries.** `@container` / `container-type`: 0 occurrences. Components like `ServiceCard` and `ProjectCard` render in differently-sized grid tracks but adapt only to viewport width.

**Recommendation.** Neither warrants a rewrite. Introduce `clamp()` for the three responsive roles only; consider `container-type: inline-size` on the card wrappers if card layouts diverge further.

**Verification.** `npm run lint:styles` stays green; `e2e/type-scale.spec.ts` and `e2e/spacing-tokens.spec.ts` continue to pass.

---

### 3.7 Responsive Design — **8 / 10** (Confidence: High)

**Assessment.** Verified directly at all seven requested viewports. No page-level horizontal overflow was found anywhere. The deduction is for regression protection, not for current behaviour.

**Method.** Chromium, production artifact served from `dist/nexora/browser`, 7 viewports × 3 locales × 11 pages = **231 page loads**. For each: document-level horizontal scroll (`scrollWidth > clientWidth`), every element's bounding box against the viewport, interactive-target dimensions, and failed image loads.

| Device        | Width | Pages | Document h-scroll | Elements wider than viewport      | Broken images |
| ------------- | ----: | ----: | ----------------- | --------------------------------- | ------------: |
| Small Mobile  |   320 |    33 | **None**          | 12 (all inside scroll containers) |             9 |
| Mobile        |   375 |    33 | **None**          | 9 (all inside scroll containers)  |             9 |
| Large Mobile  |   430 |    33 | **None**          | 3 (comparison table)              |             9 |
| Tablet        |   768 |    33 | **None**          | 3 (comparison table)              |             6 |
| Laptop        |  1024 |    33 | **None**          | 0                                 |             6 |
| Desktop       |  1440 |    33 | **None**          | 0                                 |             3 |
| Large Desktop |  1920 |    33 | **None**          | 0                                 |             3 |

**Interpretation of the "wider than viewport" column — this is not a defect.** Every flagged element is inside a deliberate horizontal scroll region, confirmed in source: `model-comparison.scss:57` sets `overflow-x: auto` on the comparison table wrapper, and `product-gallery.scss:145-147` sets `overflow-x: auto` with `scroll-snap-type: x proximity` on the thumbnail strip. `document.documentElement` never exceeded `clientWidth` on any of the 231 loads. The broken-image column is `PERF-001`, confined to `connected-car`.

**Corroboration.** The project's own `e2e/overflow.spec.ts` asserts `documentElement.scrollWidth - clientWidth === 0` across all 84 sitemap paths plus three 404 paths, at 320/390/840 px — **312 tests, all passing** in this audit's run. Its header comment documents a real past incident: Armenian compounds overflowed the home page by 87 px at 390 px, and by 20 px at 320 px, which is why the sweep covers every locale and every page.

**Touch targets.** The sweep counted 565–741 interactive elements under 24 × 24 px per viewport (for example `a.footer__link` at 142 × 17, `a.page-intro__crumb-link` at 36 × 16). **These are not WCAG failures.** axe-core's `target-size` rule (WCAG 2.2 AA, SC 2.5.8) was confirmed to execute and returned **PASSED** on every page tested, covering 25–51 nodes each — the spacing exception is satisfied. Reported here for transparency, not as a finding.

**Findings.** `RESP-001` (P3) — the project's own regression suite covers 320/390/840 px for overflow and 1440/390 px for accessibility. **430, 768, 1024 and 1920 px are not in any automated check.** They are correct today (verified above) but unprotected tomorrow.

**Verification.** Add 430/768/1024/1920 to `VIEWPORTS` in `e2e/overflow.spec.ts` (sampling a subset of paths to control runtime) and confirm the suite stays green.

---

### 3.8 Localization & Translation — **7 / 10** (Confidence: Medium-High for structure, Medium for naturalness)

**Assessment.** Structurally excellent and complete; terminologically inconsistent in a way a visitor will notice. See §5 for the full per-language report.

**Method.** All 53 `*.content.ts` dictionaries parsed; **1,196 `t({ en, hy, ru })` entries** extracted and compared for locale completeness, placeholder parity, untranslated values, script leakage, sentence-terminator convention, whitespace defects, and cross-dictionary consistency of identical English source strings.

**Evidence — strengths.**

- **Zero missing locales.** All 1,196 entries carry all three languages. No fallback is ever exercised.
- **Zero placeholder mismatches.** Every `{max}`, `{current}`, `{total}` interpolation appears identically in all three languages.
- **Armenian punctuation is handled correctly.** Of 347 Armenian sentences long enough to require a terminator, **347 use the Armenian full stop `։` (U+0589)** and 1 uses a Latin period. This is a detail most trilingual projects get wrong throughout.
- **IT terminology is correctly retained in Latin script** where that is the professional norm (`white-label`, `frontend`, `backend`, `e-commerce`, `DevOps`, `SaaS`, `Senior`/`Senior+`, `AI`). The 184 "Latin in HY/RU" matches raised by the scan were manually reviewed and are **all legitimate**, not defects.
- **Brand names are correctly left untranslated** in all three locales (19 product names, `Linux`, `Docker`, `Android`, `Claude API`).
- **Localised routing is correct.** `prefix-no-default` means `en` is unprefixed; `getLocalizedUrl` drives every internal link through `LocalizedPathPipe`; hreflang and sitemap agree (verified by `verify:seo`).
- **The Armenian font is present and contractually tested.** `public/fonts/noto-sans-armenian/noto-sans-armenian-v47-armenian.woff2` exists, is declared with the correct `unicode-range: U+0530-058F, U+FB13-FB17`, sits second in `$plain-family`, and `e2e/fonts.spec.ts` asserts no Inter subset claims the Armenian block and that the Armenian face actually downloads and resolves.

**Evidence — the defect.** **24 English strings have two or more different Armenian and/or Russian renderings** depending on which dictionary serves them. These are not synonymous variations in body prose; they include navigation labels and the primary call to action. Full table in §5.3. Highest-impact examples:

| English                     | Divergence                                                                                                                                               | Impact                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| "Engagement Models"         | HY `Համագործակցության ձևաչափեր` (page title, meta) vs `Համագործակցության մոդելներ` (footer, 404). RU `Форматы сотрудничества` vs `Модели сотрудничества` | The footer link and the page it leads to carry different names |
| "Discuss Your Project"      | HY `Քննարկենք…` (2 pages) vs `Քննարկել…` (4 pages). RU `Обсудить проект` vs `Обсудить ваш проект`                                                        | Primary CTA, 6 pages, inconsistent verb aspect                 |
| "Explore Our Services"      | RU `Ознакомиться с нашими услугами` (3 pages) vs **`наши услуги`** (hero)                                                                                | Hero CTA is lowercase and not a verb phrase                    |
| The five service categories | Each has one label in the footer, a different one in the contact-form dropdown, sometimes a third on the services page                                   | Same taxonomy, three names                                     |

**Findings.** `I18N-001` (P2, consistency), `I18N-002` (P2, the lowercase Russian hero CTA), `I18N-003` (P3, no automated consistency gate).

**Explicitly not assessed.** Native fluency, idiom and tone-of-voice in Armenian and Russian were **not** verified by a native speaker. Everything above is mechanically verifiable. The Localization score reflects the verifiable portion; a native review could move it in either direction.

**Verification.** Add a spec that groups all `t()` entries by English value and asserts each group has exactly one `hy` and one `ru` value. It would fail today with 24 cases and prevent recurrence.

---

### 3.9 Performance — **8 / 10** (Confidence: Medium — laboratory measurements only)

> _As audited: **7 / 10**. Raised to 8: `PERF-001` is fixed — the 200w candidate went from 230 kB to 2.8 kB and six 404s are gone. Held at 8, not 9: still no field data, 39 icons still fetched individually, below-fold illustrations still render eagerly._

**Assessment.** Code weight is well controlled and within self-imposed budgets; prerendering removes server latency. One page carries a quantifiable image regression.

**Build output (production, this audit's run).**

```
Initial chunk files   Raw size    Estimated transfer
main-4G57EL5G.js      485.18 kB   124.07 kB
styles-LDLDTVIK.css    23.09 kB     3.52 kB
Initial total         508.27 kB   127.59 kB     (budget: 560 kB warn / 1 MB error)

Largest lazy chunks: 203.55 kB, 149.44 kB, home 144.84 kB, contact 109.20 kB,
about 69.26 kB, ai-agent 68.08 kB, engagement-models 56.25 kB, menu 29.49 kB
Prerendered 87 static routes.   Build time 22.9 s
```

`npm run verify:bundle`: **87 routes, worst `/ru/contact` at 223.7 kB gzip against a 240 kB budget.**

**Laboratory Core Web Vitals.** Chromium, 390 × 844, Slow-4G emulation (1.6 Mbps, 150 ms RTT) with 4× CPU throttling, median of 3 runs, local static server.

| Path                      |     FCP |     **LCP** |    **CLS** |
| ------------------------- | ------: | ----------: | ---------: |
| `/`                       | 1480 ms | **1480 ms** | **0.0128** |
| `/our_work`               | 1024 ms | **1196 ms** | **0.0003** |
| `/our_work/connected-car` | 1048 ms | **1628 ms** | **0.0004** |
| `/contact`                | 1356 ms | **1592 ms** | **0.0003** |
| `/hy`                     | 1336 ms | **1448 ms** | **0.0046** |

> **These are not field Core Web Vitals.** TTFB is ~3 ms because the server is local; a real CDN origin adds latency that would shift LCP upward. CLS is largely network-independent and the ≤ 0.013 figures are meaningful: every `<img>` carries explicit `width`/`height`, and the fonts use `font-display: swap` with a preloaded Latin subset. INP was **not measured** (no interaction script) — marked N/A within this area rather than guessed.

**Positive factors.** 87 prerendered documents (no SSR round-trip); per-page critical CSS inlined by the build; Latin font subset preloaded with `crossorigin`; Inter split into Latin/Cyrillic subsets by `unicode-range` so Russian pages fetch 18.7 kB extra and Armenian pages 26 kB rather than one combined file; `loading="lazy"` + `decoding="async"` on card imagery; immutable `Cache-Control` for hashed assets.

**Findings.**

- `PERF-001` (P1): on `/our_work/connected-car`, the `200w` candidate `infin-200.webp` is **230 kB** — byte-identical to the 1000 px original — and three further candidates return 404, each costing a ~101 kB `not-found/index.html` body served with `Content-Type: image/webp`. Measured image payload on that page: **1030 kB**, versus 941 kB for the entire 19-card `/our_work` index.
- `PERF-002` (P3): all 39 icons are fetched individually over HTTP by `MatIconRegistry` on first use (`provide-app-icons.ts` resolves `app:<name>` to `icons/<name>.svg`). The home page issues 15 requests and `/our_work` 33; a sprite sheet or inlined symbol set would cut request count materially on icon-dense pages.
- `NG-002` (P3, §3.5): below-fold illustrations are not deferred.

**Verification.** After regenerating images, re-run `npm run verify:images` (exit 0) and confirm `/our_work/connected-car` image payload drops to the ~150–250 kB range typical of the other product pages.

---

### 3.10 SEO — **9 / 10** (Confidence: High)

**Assessment.** Comprehensive, mechanically verified, and better than most commercial sites of this size.

**Evidence.** `npm run verify:seo` → **"87 documents: unique titles, canonical and hreflang agree, 84 indexable and in the sitemap, 3 noindex."** `npm run verify:prerender` → **"87 prerendered pages are navigable without JavaScript."**

| Item                     | Status                                                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title / meta description | Per page, per locale, from `document-meta.content.ts`; uniqueness asserted across all 87                                                                                                          |
| Canonical                | `origin + alternates[locale]`, verified to agree with hreflang                                                                                                                                    |
| hreflang                 | `en` / `hy` / `ru` + `x-default` → default locale, emitted per page and mirrored in `sitemap.xml`                                                                                                 |
| Open Graph               | `og:type`, `og:site_name`, `og:title`, `og:description`, `og:locale` (mapped `en_US`/`hy_AM`/`ru_RU`), `og:url`, `og:image` with `width`/`height`/`alt`                                           |
| Twitter                  | `summary_large_image` + title/description/image/alt                                                                                                                                               |
| Structured data          | JSON-LD `@graph`: Organization (with ContactPoint and `availableLanguage`), WebSite, WebPage, BreadcrumbList, and CreativeWork on product pages, cross-linked by `@id`                            |
| Sitemap                  | 84 `<url>` entries with per-entry `xhtml:link` alternates; `sitemap.spec.ts` pins it to `DOCUMENT_META_PAGES` and `PRODUCT_IDS`, which `route-meta.spec.ts` pins to the route table               |
| robots.txt               | `Allow: /` + absolute `Sitemap:`                                                                                                                                                                  |
| 404 handling             | `_redirects` returns genuine **404** status (not a 200 rewrite) with a comment explaining the crawler consequence; locale-specific 404 documents; `robots: noindex, follow` on the 404 route only |
| Indexability             | Prerendered static HTML — full content without JS                                                                                                                                                 |
| Headings                 | Verified `main h1` present on every one of the 87 pages (precondition of `overflow.spec.ts`, all passing)                                                                                         |

**Findings.**

- `SEO-001` (P3): the `CreativeWork` node for `connected-car` emits a `url` that `product-detail.spec.ts:283-285` states should be absent — structured data asserting a destination the project considers invalid. Resolved by fixing `FUNC-002`.
- `SEO-002` (P3): three gallery images on `connected-car` have `alt=""`, removing them from image search. Resolved by fixing `FUNC-001`. **Note:** the `alt=""` on project cards and "next product" covers elsewhere is **correct** — those images are decorative, with the accessible name carried by adjacent text and `aria-label`; this was verified and is not a finding.
- `SEO-003` (P3): `src/index.html` hard-codes an English `<title>`, description and `<html lang="en">`. Harmless for the 87 prerendered documents (each is rendered with its own locale and metadata), but the template default would surface if a route were ever served unprerendered.

---

### 3.11 Accessibility — **9 / 10** (Confidence: High)

> _As audited: **7 / 10**. Raised to 9 by the first pass: the three critical `button-name` violations are gone, and all 8 page/viewport/locale combinations re-tested report zero violations._
>
> _**Now 10** (§1.3). The two reasons it was held at 9 are both closed. The `color-contrast` *incomplete* nodes are no longer unverified: all **174** of them across 7 pages were measured by isolating the glyph pixels and reading the real background behind each one, and every node clears its WCAG threshold, the tightest at 5.00:1 against 4.5. And the suite no longer samples 2 of 19 product pages — it derives the sweep from `PRODUCT_IDS`, and all 19 report zero violations. Both measurements are now permanent gates rather than one-off findings._

**Assessment.** Strong, deliberate accessibility engineering with automated enforcement — undermined by one critical violation on a page the suite does not sample.

**Evidence — what passes.** Independent axe-core runs (`wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`) against the production artifact:

| Page                         | Viewport | Violations                       |
| ---------------------------- | -------- | -------------------------------- |
| `/`                          | 375      | **0**                            |
| `/contact`                   | 375      | **0**                            |
| `/our_work`                  | 375      | **0**                            |
| `/engagement-models`         | 375      | **0**                            |
| `/hy/contact`                | 320      | **0**                            |
| `/services`                  | 1920     | **0**                            |
| `/solutions`                 | 1024     | **0**                            |
| `/ru/our_work/connected-car` | 1440     | **3 × `button-name` (critical)** |

The project's own `e2e/a11y.spec.ts` (12 pages × 3 locales at 1440 px and 390 px) passed **all 312 executed e2e tests**. `target-size` (SC 2.5.8) was confirmed to execute and **PASS** on every page.

Design-level provisions verified in source: skip link to `#main-content` with `tabindex="-1"` on `<main>`; `mat.strong-focus-indicators()` plus a `:where(:focus-visible)` fallback outline; Escape closes the header menu and returns focus to the trigger (`header.ts:105-111`); the gallery uses a native `<dialog>` with `showModal()`, restores focus to the stage on close, locks and restores scroll position, and supports arrow-key navigation; the contact form moves focus to the first invalid field on failed submit and to the first server-rejected field after a rejection; `aria-busy` on the form during submission; `FieldLabel` wires `labelId`/`for` with an `(activate)` output so clicking a label focuses a non-native control; the honeypot is `aria-hidden` **and** `tabindex="-1"`; `prefers-reduced-motion` is honoured at the token layer; `eslint` runs `angular.configs.templateAccessibility`.

**Evidence — the violation.**

```
### /our_work/connected-car     (also /hy/… and /ru/…)
   button-name (critical) x3
     - <button type="button" class="gallery__thumb-button" aria-label="">
     - <button type="button" class="gallery__thumb-button" aria-label="">
     - <button type="button" class="gallery__thumb-button" aria-label="">

### /our_work/mezave      (4 photos, all described)  → no violations
### /our_work/draculai                               → no violations
```

The thumbnail button derives its accessible name from the photo's alt text. Three photos have none, so three buttons have none. A screen-reader user hears three unlabelled buttons. **WCAG 2.2 AA, SC 4.1.2 Name, Role, Value.**

**Findings.** `A11Y-001` (P0), `A11Y-002` (P3, Potential Risk), `TEST-001` (P2 — the sampling gap that let this through: `a11y.spec.ts` tests `our_work/draculai` and `our_work/roar-organic`, 2 of 19).

**`A11Y-002` — Potential Risk, unverified.** axe returned `color-contrast` as **incomplete** (not failed) on every page: 31 nodes on `/`, 26 on `/contact`, 30 on `/hy/contact`, 26 on `/services`, 13 on `/solutions`, 5–7 elsewhere. axe reports _incomplete_ when it cannot compute a ratio — typically text over a gradient, image or translucent surface. **These are neither passes nor failures.** The project has `e2e/support/contrast.ts` and `e2e/design-tokens.spec.ts` asserting token-level contrast, which covers the flat cases, but the incomplete nodes need manual review with a contrast tool. No contrast failure is claimed here, because none was demonstrated.

**Verification.** `npm run e2e` with `a11y.spec.ts` extended to all 19 product slugs (or at minimum every slug with more than one photograph) must report zero violations.

---

### 3.12 Testing & Reliability — **8 / 10** (Confidence: High)

> _As audited: **6 / 10**. Raised to 8 by the first two passes: the unit suite is green, `verify:images` is wired into CI, and the two flaky e2e tests are fixed at the cause — `our-work.spec.ts` ran 156/156 four consecutive times._
>
> _**Now 9** (§1.3). Four of the five reasons it was held at 8 are closed: `verify:images` now checks declared dimensions and per-variant widths (`TEST-004`), the a11y sweep covers all 19 products (`TEST-001`), the unguarded scroll lock is guarded and has a regression test (`TEST-006`), and four new gates exist that did not before — translation consistency, the `index.html` template, the service taxonomy, and the measured contrast of every node axe cannot compute. Not 10: `BUILD-001` is still not reproduced, and there is still no coverage signal._

**Assessment.** The _quality_ of the tests is excellent — among the best this auditor has seen for a site of this size. The _reliability of the pipeline_ is not, because the suite is red, a gate is unwired, and the build is intermittently non-deterministic.

**Evidence — quality.**

- 58 unit spec files / 491 tests; 37 e2e specs; 12 script tools each with a sibling `*.test.mjs`. Test-to-source ratio **0.88 : 1**.
- Tests assert _contracts_, not implementation: `change-detection.spec.ts` pins framework enum semantics and walks the source tree so an unregistered component fails the build; `sitemap.spec.ts` ↔ `route-meta.spec.ts` chain the sitemap to the route table; `contact-contract.spec.ts` pins the client to the documented API field-by-field; `fonts.spec.ts` proves the Armenian face is reachable; `dictionary-keys.spec.ts` guards dictionary shape.
- E2E is honest about device capability: a dedicated `mobile-chrome` (Pixel 7) project exists specifically because a phone-sized desktop context still matches `hover: hover`, with a comment explaining that the portfolio card's tap-to-flip branch is reachable from no other project.
- `scripts/intlayer-lock.mjs` is a 177-line mutex preventing concurrent Intlayer generation, with stale-PID detection and a documented special case for watch tasks.

**Evidence — reliability.**

| Problem                         | Evidence                                                                                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Suite is red on `main`          | `npm test` → `Test Files 2 failed \| 56 passed (58)`, `Tests 3 failed \| 488 passed (491)`. Reproduced twice, identical failures. Working tree clean — the failure is in the committed state                                   |
| A gate exists but is not wired  | `.github/workflows/ci.yml` runs `verify:prerender`, `verify:seo`, `verify:headers`, `verify:bundle` — **`verify:images` is absent**, and it is the one that fails                                                              |
| Build is non-deterministic      | One failure, one success, identical inputs (see `BUILD-001`)                                                                                                                                                                   |
| Product-page sampling           | `a11y.spec.ts` and `e2e/our-work.spec.ts` sample 2 of 19 slugs                                                                                                                                                                 |
| No coverage signal              | No `coverage` reference in `package.json`, `angular.json`, `vitest-base.config.ts` or `ci.yml`; no thresholds                                                                                                                  |
| 38 units without a sibling spec | Mostly presentational page sections covered by their page spec and e2e. Genuine gaps: `page-intro.ts` (shared, used on every page, has conditional lead-placement logic), `document-meta-override.ts`, `contact-submitter.ts`  |
| Dependency audit never blocks   | The `audit` job is `continue-on-error: true`; `npm audit` reports **9 moderate** advisories (all dev-only: `eslint` → `minimatch`, `@typescript-eslint/*` → `typescript-estree`). No production runtime dependency is affected |

**Findings.** `TEST-001` (P2), `TEST-002` (P3), `TEST-003` (P3), `SEC-001` (P3), plus `CI-001` (P1) and `BUILD-001` (P1).

---

## 4. Critical Findings

### 4.0 Status key

`RESOLVED` — fixed and verified (§1.1, §1.2, §1.3). `DOCUMENTED` — the finding was that the code is hard to change safely, and that was addressed without altering behaviour. `INVESTIGATED` — root-caused as far as the evidence allows, not reproduced, not fixed. `SPECIFIED` — the change is designed and justified below but **not applied**, because validating it needs something this pass could not run. `BY DESIGN` — examined and deliberately left alone, with the reason given. `DEFERRED` — a change to the designed appearance, which is the owner's call, not the auditor's. `OPEN` — untouched.

Findings are kept in full either way; the detailed write-ups below are the audit's original text, with a status line added. Where the audit's own text turned out to be wrong, the correction is recorded in §1.3 rather than quietly edited out.

### Consolidated issue table

| ID                  | Priority | Status           | Location                                                           | Summary                                                                                                                         |
| ------------------- | -------- | ---------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **FUNC-001**        | **P0**   | **RESOLVED**     | `pages/our-work/products/product.content.ts`                       | `connected-car` declares 4 photos but supplies 1 `photoAlts`; 3 images render `alt=""`; 3 unit tests fail                       |
| **A11Y-001**        | **P0**   | **RESOLVED**     | `pages/our-work/product-detail/product-gallery/`                   | 3 gallery buttons with no accessible name on `connected-car`, all 3 locales (axe `button-name`, critical)                       |
| **PERF-001**        | **P1**   | **RESOLVED**     | `public/images/`, `product-meta.ts`                                | `connected-car` ladder not generated: 4 byte-identical "resized" files + 6 `srcset` candidates returning 404                    |
| **FUNC-002**        | **P1**   | **RESOLVED**     | `products/data/product-meta.ts:193-203`                            | `platform: 'Android · Google Play'` contradicts an Apple App Store `url`; spec expects no `url` at all                          |
| **CI-001**          | **P1**   | **RESOLVED**     | `.github/workflows/ci.yml`                                         | `verify:images` is the only `verify:*` script missing from CI — the gate that detects PERF-001                                  |
| **BUILD-001**       | **P1**   | **INVESTIGATED** | Intlayer / build pipeline                                          | Production build failed once and succeeded once on identical inputs (root cause: Cannot Determine)                              |
| **I18N-001**        | **P2**   | **RESOLVED**     | 24 locations across 18 dictionaries                                | Identical English source renders as 2+ different HY/RU strings, incl. nav labels and the primary CTA                            |
| **I18N-002**        | **P2**   | **RESOLVED**     | `pages/home/hero/hero.content.ts:32`                               | Russian hero CTA is `наши услуги` — lowercase, not a verb phrase, inconsistent with 3 other pages                               |
| **ARCH-001**        | **P2**   | **RESOLVED**     | `service-category.ts`, `contact-submitter.ts`, `footer.content.ts` | Service taxonomy declared 3× with no shared source and no test linking them                                                     |
| **TEST-001**        | **P2**   | **RESOLVED**     | `e2e/a11y.spec.ts:10-18`                                           | Accessibility suite samples 2 of 19 product pages; A11Y-001 sits on an unsampled page                                           |
| **CODE-001**        | P3       | **DOCUMENTED**   | `products/project-card/project-card.ts:46-111`                     | Flip interaction is a 3-variable state machine across 6 handlers                                                                |
| **CODE-002**        | P3       | **RESOLVED**     | `tsconfig.json`                                                    | `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` not enabled                                                         |
| **CODE-003**        | P3       | **RESOLVED**     | `layout/header/header.ts:53-95`                                    | Menu-close uses hand-maintained navigation counters                                                                             |
| **CODE-004**        | P3       | **RESOLVED**     | `core/seo/document-meta.ts:126,224`                                | `page` shadowed inside the meta effect; `inject(ElementRef<T>)` vs `inject<T>(ElementRef)` inconsistent                         |
| **NG-001**          | P3       | **BY DESIGN**    | `products/data/product-meta.ts`                                    | `NgOptimizedImage` unused; hand-rolled `srcset` is where PERF-001 originated                                                    |
| **NG-002**          | P3       | **SPECIFIED**    | hero / illustration components                                     | `@defer` used only twice; below-fold illustrations render eagerly                                                               |
| **PERF-002**        | P3       | **SPECIFIED**    | `core/icons/provide-app-icons.ts`                                  | 39 icons fetched as individual HTTP requests; no sprite                                                                         |
| **STYLE-001**       | P3       | **DEFERRED**     | `styles/tokens/_typography.scss`                                   | No `clamp()`; type steps only at 1200 px for 3 roles                                                                            |
| **STYLE-002**       | P3       | **DEFERRED**     | all component SCSS                                                 | No container queries; cards adapt to viewport, not to their track                                                               |
| **RESP-001**        | P3       | **RESOLVED**     | `e2e/overflow.spec.ts:42-46`                                       | 430/768/1024/1920 px correct today but in no regression check                                                                   |
| **A11Y-002**        | P3       | **RESOLVED**     | multiple pages                                                     | 5–31 `color-contrast` checks per page return axe _incomplete_ — **unverified**, needs manual review                             |
| **SEC-001**         | P3       | **RESOLVED**     | `.github/workflows/ci.yml:35-45`                                   | 9 moderate dev-only advisories; the `audit` job is `continue-on-error: true`                                                    |
| **SEO-001/002/003** | P3       | **RESOLVED**     | see §3.10                                                          | Structured-data `url`, missing image alts, English defaults in `index.html`                                                     |
| **DATA-001**        | **P1**   | **RESOLVED**     | `products/data/product-meta.ts:197-203`                            | Declared dimensions wrong for all 3 new photos (`infin` 1000×667 vs actual 3000×1500) — wrong CLS box and `srcset` descriptors  |
| **TEST-004**        | **P2**   | **RESOLVED**     | `scripts/verify-images.mjs:40-100`                                 | `verify:images` never compares declared dimensions against the actual files — the gap that hid `DATA-001`                       |
| **TEST-005**        | **P2**   | **RESOLVED**     | `e2e/our-work.spec.ts:156`, `:127`, `:720`                         | Three tests asserted before their precondition held — two raced the flip `visibility` transition, one misread focus as a signal |
| **TEST-006**        | P3       | **RESOLVED**     | `product-gallery/product-gallery.ts:167-174`                       | `lock()` is unguarded: a second call saves `overflow: 'hidden'` as the restore value — latent, **not** observed in 12 runs      |

### Detailed findings

---

**ID:** FUNC-001
**Title:** `connected-car` product dictionary is missing three photograph descriptions
**Priority:** **P0 — Critical**
**Location:** `src/app/pages/our-work/products/product.content.ts` (the `connected-car` entry); data contract in `src/app/pages/our-work/products/data/product-meta.ts:193-203`
**Lines:** `product-meta.ts:193-203` declares the four photos; `product-content.spec.ts:133` and `product-detail.spec.ts:238` are the assertions that fail

**Evidence:**

```
AssertionError: connected-car has 4 photographs: expected 1 to be 4
 ❯ src/app/pages/our-work/products/data/product-content.spec.ts:133:62

AssertionError: connected-car photograph 1 renders alt="": expected 0 to be greater than 0
 ❯ src/app/pages/our-work/product-detail/product-detail.spec.ts:238:72

$ grep -o 'alt="[^"]*"' dist/nexora/browser/our_work/connected-car/index.html | sort | uniq -c
     11 alt=""
      1 alt="A dark SUV on wet tarmac against a city skyline at night, …"
```

By contrast, `/our_work/mezave` (also 4 photos) and `/our_work/draculai` produce no such failure. Reproduced on two independent `npm test` runs: `Tests 3 failed | 488 passed (491)`.

**Problem:** `PRODUCT_META['connected-car'].photos` lists four `ProductPhoto` entries (`infiniti.webp`, `infin.webp`, `control.webp`, `serv.webp`). The dictionary supplies one `photoAlts` entry. `toImages()` in `product-view.ts:74-80` maps `alts[index]` positionally and falls back to `alt: ''` when undefined, so three images are emitted with empty alt text in all three locales.

**Impact:** Three informative photographs are invisible to screen-reader users and to image search. The empty alt propagates to the gallery thumbnail buttons, producing **A11Y-001** (critical). The repository's own test suite is red on `main`, which means CI either fails on every push or has not run since the change — and in both cases the project has lost its regression signal.

**Recommendation:** Add three `photoAlts` entries (EN/HY/RU) to the `connected-car` dictionary describing `infin.webp`, `control.webp` and `serv.webp`. Follow the existing house style: a concrete description of what the screenshot shows, unique per image (`product-detail.spec.ts:240` additionally asserts no product repeats a description).

**Acceptance criteria:**

- `npm test` reports 491 passed, 0 failed.
- `dist/nexora/browser/our_work/connected-car/index.html` contains no `alt=""` on a gallery image.
- All four descriptions are distinct and present in `en`, `hy` and `ru`.

**Verification:** `npm test` and `grep -c 'alt=""' dist/nexora/browser/our_work/connected-car/index.html` after a rebuild.

---

**ID:** A11Y-001
**Title:** Three gallery thumbnail buttons have no accessible name on `connected-car`, in every locale
**Priority:** **P0 — Critical** (WCAG 2.2 Level AA — SC 4.1.2 Name, Role, Value)
**Location:** `src/app/pages/our-work/product-detail/product-gallery/product-gallery.html`; root cause in the dictionary (FUNC-001)

**Evidence:** axe-core `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`, Chromium 1440 × 900, against the production artifact:

```
### /our_work/connected-car
   button-name (critical) x3
     - <button type="button" class="gallery__thumb-button" aria-label="">
     - <button type="button" class="gallery__thumb-button" aria-label="">
     - <button type="button" class="gallery__thumb-button" aria-label="">
### /hy/our_work/connected-car   → identical, 3 violations
### /our_work/mezave             → no violations
### /our_work/draculai           → no violations
```

**Problem:** The thumbnail button's `aria-label` is derived from the photograph's alt text. Where the alt is empty the label is empty, leaving an interactive control with no accessible name. The project's own `a11y.spec.ts` does not catch this because it samples only `our_work/draculai` and `our_work/roar-organic`.

**Impact:** A screen-reader user navigating the `connected-car` gallery encounters three buttons announced only as "button", with no way to tell which image each selects. This is a _critical_-impact, Level AA conformance failure present on three live URLs.

**Recommendation:** Fix FUNC-001 (the alt text is the accessible name's source). Additionally, make the gallery defensive: fall back to the positional label already available in the dictionary (`gallery.position`, "{current} / {total}") when an alt is empty, so a future data gap degrades to a usable name rather than no name.

**Acceptance criteria:**

- axe reports 0 `button-name` violations on `/our_work/connected-car`, `/hy/…` and `/ru/…`.
- Every `button.gallery__thumb-button` has a non-empty accessible name on all 19 product pages.

**Verification:** Extend `e2e/a11y.spec.ts` to cover every slug in `PRODUCT_IDS` (or every slug with more than one photograph) and run `npm run e2e`.

---

**ID:** PERF-001
**Title:** `connected-car` responsive image ladder was never generated — oversized candidates and six 404s
**Priority:** **P1 — High**
**Location:** `public/images/` (`infin*`, `control*`, `serv*`); generator `scripts/optimize-images.mjs`; `srcset` emitted by `product-meta.ts:photoSrcset`

**Evidence:**

```
$ npm run verify:images      # exit code 1
[verify-images] problems:
  - infin-200.webp is 229.5 kB, over the 120 kB per-file budget
  - infin-640.webp is 229.5 kB, over the 120 kB per-file budget
  - infin-960.webp is 229.5 kB, over the 120 kB per-file budget
  - infin.webp    is 229.5 kB, over the 120 kB per-file budget
  - infin.webp is served responsively but infin-400.webp is missing
  - control.webp is served responsively but control-400/-640/-960.webp are missing
  - serv.webp is served responsively but serv-400/-640.webp are missing

$ ls -la public/images/ | grep -E 'infin|control|serv'
 235029  infin-200.webp     235029  infin-640.webp
 235029  infin-960.webp     235029  infin.webp        ← four identical byte counts
  99610  control-200.webp    99610  control.webp      ← identical
  69130  serv-200.webp       69130  serv-960.webp     69130  serv.webp   ← identical
   6400  infiniti-200.webp   20474  infiniti-400.webp
  35788  infiniti-640.webp   53870  infiniti.webp     ← a correct ladder, for contrast

$ curl -s -o /dev/null -w "%{http_code}" http://localhost:4411/images/control-640.webp
404
```

Network capture at 390 × 844 against the production artifact: `/our_work/connected-car` downloads **230 kB for `infin-200.webp`** and three further ~101 kB bodies for the missing candidates; total image payload **1030 kB**, versus 941 kB for the entire 19-card index page.

**Problem:** `photoSrcset()` emits a candidate for every ladder step smaller than the declared width (`IMAGE_LADDER = [200, 400, 640, 960]`), regardless of whether the file exists. The three photographs added to `connected-car` were copied into `public/images/` rather than passed through `npm run images:optimize`, so some ladder names exist as byte-identical copies of the full-size original and others do not exist at all. Because `_redirects` maps unknown URLs to `/not-found/index.html` with status 404, each missing candidate returns a ~101 kB HTML document with `Content-Type: image/webp` — the browser downloads it, fails to decode it, and renders nothing.

**Impact:** A phone on a 390 px viewport may select the `200w` candidate and download **230 kB instead of ~6 kB** (the correctly-generated `infiniti-200.webp` is 6,400 bytes). Up to ~300 kB of additional useless HTML is transferred for the 404 candidates, and the affected images fail to render for whichever candidate the browser picks. The per-file budget in the project's own tooling is 120 kB; `infin*` is at 229.5 kB.

**Recommendation:** Run `npm run images:optimize` to generate the full ladder for `infin`, `control` and `serv`, then re-run `npm run verify:images`. Separately, consider making `photoSrcset()` emit only steps whose files exist (or have `verify:images` run as a build step) so a hand-copied asset cannot produce a 404 candidate again.

**Acceptance criteria:**

- `npm run verify:images` exits 0.
- No file in a ladder is byte-identical to its original.
- A network capture of `/our_work/connected-car` shows zero 4xx responses and an image payload comparable to other multi-photo products (`mezave`).

**Verification:** `npm run build && npm run verify:images`; re-run the responsive sweep and confirm the "broken images" column is 0 at every viewport.

---

**ID:** FUNC-002
**Title:** `connected-car` platform label contradicts its destination URL, and the URL contradicts the test suite
**Priority:** **P1 — High**
**Location:** `src/app/pages/our-work/products/data/product-meta.ts:193-203`
**Lines:** 201-202

**Evidence:**

```ts
'connected-car': {
  archetype: 'app',
  photos: [ /* 4 entries */ ],
  url: 'https://apps.apple.com/us/app/myinfiniti-app/id1529917696',   // Apple App Store
  platform: 'Android · Google Play',                                   // contradicts the URL
},
```

```
AssertionError: expected 'https://apps.apple.com/us/app/myinfin…' to be undefined
 ❯ src/app/pages/our-work/product-detail/product-detail.spec.ts:285:69
   // spec comment, line 283:
   // `connected-car` has no destination that can be opened, so it states no url
```

For comparison, `draculai` (also an Apple URL) is labelled `'iOS · App Store'`, and `mezave` (a Google Play URL) is labelled `'Android · Google Play'` — the convention is applied correctly everywhere else.

**Problem:** Three sources disagree about this product. The template renders the `platform` value as a definition-list entry and the `url` as a "Visit site" button (`product-detail.html:17-32`), and the SEO layer publishes the `url` inside a `CreativeWork` node. The test states the product should have no `url` at all.

**Impact:** A visitor reads "Android · Google Play" and is sent to the Apple App Store. The `CreativeWork` structured data publishes a destination the project's own contract says should not exist (**SEO-001**). Whichever of the three is right, two are wrong and are shipping.

**Recommendation:** Establish the intended truth and make all three agree. If the product has a public iOS listing, set `platform: 'iOS · App Store'` and update `product-detail.spec.ts:283-285`. If it has no openable destination, remove `url`. Do not change the test to match the data without first confirming which is correct — the test comment reads as a deliberate statement of intent.

**Acceptance criteria:** `npm test` passes; `platform` and `url` refer to the same store; the `CreativeWork` node for this product matches the decision.

**Verification:** `npm test` and inspection of the JSON-LD in `dist/nexora/browser/our_work/connected-car/index.html`.

---

**ID:** CI-001
**Title:** `verify:images` is the only verification gate missing from CI
**Priority:** **P1 — High**
**Location:** `.github/workflows/ci.yml:27-33`

**Evidence:**

```yaml
- run: npm run verify:prerender
- run: npm run verify:seo
- run: npm run verify:headers
- run: npm run verify:bundle
- run: npx playwright install --with-deps chromium
- run: npm run e2e
- run: npm run e2e:prerendered
```

`package.json` defines six `verify:*` scripts. **Four** appear above. `verify:images` does not — and it is the script that exits 1 today. (The sixth, `verify:live-seo`, queries a deployed origin and is correctly absent from a pipeline that has none. An earlier draft of this report said "five appear above"; that count was wrong, though the finding it supports is not.)

**Problem:** The project built a tool that detects exactly the defect described in PERF-001, documented it in `README.md`, gave it its own unit tests (`scripts/verify-images.test.mjs`), and then left it out of the pipeline. An unwired gate provides no protection.

**Impact:** This is the proximate cause of PERF-001 reaching a built artifact. Any future image added without running `images:optimize` will ship the same way.

**Recommendation:** Add `- run: npm run verify:images` after `verify:bundle`. Note that it must run _after_ `npm run build`, which it already would.

**Acceptance criteria:** CI fails on a branch that adds an unoptimised image; CI passes once the ladder is generated.

**Verification:** Push a branch with the current `connected-car` images and confirm the pipeline fails at the new step.

---

**ID:** BUILD-001
**Title:** Production build is non-deterministic — one failure and one success on identical inputs
**Priority:** **P1 — High**
**Location:** Intlayer dictionary generation / esbuild plugin boundary
**Root cause:** **Cannot Determine**

**Evidence.** First run, immediately following `npm test` in the same shell session:

```
[intlayer]  Preparing Intlayer (v9.6.0)
[intlayer]  Dictionaries built (2707ms)
Prerendered 0 static routes.
Application bundle generation failed. [4.778 seconds]

X [ERROR] Cannot find module '../dictionary/ai-agent-business-value.json'
  Require stack:
  - .intlayer\main\dictionaries.cjs
  - node_modules\@intlayer\config\dist\esm\utils\ESMxCJSHelpers.mjs [plugin intlayer]
BUILD_EXIT=1
```

Second run, no inputs changed, no cache cleared:

```
[intlayer]  Dictionaries built (1158ms)
Initial total   508.27 kB   127.59 kB
Prerendered 87 static routes.
Application bundle generation complete. [22.947 seconds]
BUILD2_EXIT=0
```

Post-hoc inspection: `.intlayer/dictionary/ai-agent-business-value.json` **exists**, and `.intlayer/dictionary/` contains all 53 files. Installed `intlayer`, `angular-intlayer`, `@intlayer/config` and `@intlayer/core` are all 9.7.0, while the build banner reports "Preparing Intlayer (v9.6.0)".

**Problem:** The failing run resolved `dictionaries.cjs` while a dictionary it requires was not resolvable, despite the file existing afterwards — consistent with a read/write race during regeneration, or with a stale resolution cache. The version-string discrepancy (9.6.0 reported vs 9.7.0 installed) may be cosmetic or may indicate a second copy being consulted; **this was not established, and no root cause is claimed.** The existence of `scripts/intlayer-lock.mjs` — a 177-line mutex written specifically to stop two Intlayer runs rewriting `.intlayer/` and `intlayer-types/` concurrently — shows the team has already encountered concurrency problems in this area.

**Impact:** A build that fails once in two attempts on unchanged inputs makes CI results untrustworthy and will produce intermittent red pipelines that invite the habit of re-running rather than investigating.

**Recommendation:** Reproduce under controlled conditions (build immediately after a test run; build with `.intlayer/` pre-populated vs removed) and capture whether the failure correlates with the preceding task. Resolve the 9.6.0/9.7.0 banner discrepancy — confirm no nested older copy is being loaded. Consider having the lock cover the dictionary read as well as the write, or make the build fail fast with a clearer message when a dictionary cannot be resolved.

**Acceptance criteria:** Ten consecutive `npm run build` runs, including runs immediately following `npm test`, all exit 0.

**Verification:** A scripted loop of ten builds recording each exit code.

---

**ID:** I18N-001
**Title:** The same English string is translated differently in different dictionaries, including navigation labels and the primary CTA
**Priority:** **P2 — Medium**
**Location:** 24 groups across 18 dictionaries — full table in §5.3

**Evidence:** All 1,196 `t()` entries were grouped by English value; 24 groups contain more than one Armenian and/or Russian rendering. Representative cases:

```
EN "Engagement Models"  (3 occurrences)
  HY  "Համագործակցության ձևաչափեր"  ← document-meta.content.ts:126, engagement-models.content.ts:8
      "Համագործակցության մոդելներ"   ← footer.content.ts:116
  RU  "Форматы сотрудничества"       ← document-meta.content.ts:126, engagement-models.content.ts:8
      "Модели сотрудничества"         ← footer.content.ts:116

EN "Discuss Your Project"  (6 occurrences)
  HY  "Քննարկենք ձեր նախագիծը"  ← about:36, hero:27
      "Քննարկել ձեր նախագիծը"    ← engagement-models:44, services:74, solutions:36, start-conversation:38
  RU  "Обсудить проект"           ← about:36
      "Обсудить ваш проект"       ← 5 other locations

EN "Software Engineering"  (3 occurrences)
  HY  "Ծրագրային ինժեներիա"              ← footer.content.ts:18
      "Ծրագրային ապահովման մշակում"      ← contact-form:108, services:97
```

**Problem:** There is no shared source for strings that appear in more than one dictionary. Each dictionary was translated independently, so the same concept acquired different names. The service-category group is the structural case described in **ARCH-001**: the five categories are labelled in the footer, in the contact-form dropdown and on the services page, from three separate dictionaries.

**Impact:** An Armenian or Russian visitor sees the footer link "Համագործակցության մոդելներ" and lands on a page titled "Համագործակցության ձևաչափեր". The same five service categories are named differently depending on whether the visitor reads the footer, the services page or the contact form's dropdown. This undermines perceived quality on a site whose explicit proposition is senior-level rigour, and it weakens keyword consistency for non-English SEO.

**Recommendation:** Pick one canonical rendering per concept and converge. Move genuinely shared strings (navigation labels, the five service-category labels, the shared CTAs) into one dictionary and reference it, rather than re-declaring the copy. Then add the consistency spec described below so the problem cannot return.

**Acceptance criteria:** Every English source string that appears in more than one dictionary resolves to exactly one Armenian and one Russian string.

**Verification:** A new spec that groups all `t()` entries by English value and asserts `new Set(group.map(e => e.hy)).size === 1` and likewise for `ru`. It fails today with 24 cases.

---

**ID:** I18N-002
**Title:** Russian hero call-to-action is lowercase and not a verb phrase
**Priority:** **P2 — Medium**
**Location:** `src/app/pages/home/hero/hero.content.ts:32`

**Evidence:**

```
EN "Explore Our Services"  (4 occurrences)
  RU  "Ознакомиться с нашими услугами"  ← engagement-models:49, services:79, solutions:41
      "наши услуги"                      ← hero.content.ts:32
  HY  "Ծանոթանալ մեր ծառայություններին" ← engagement-models:49, services:79, solutions:41
      "Մեր ծառայությունները"             ← hero.content.ts:32
```

**Problem:** The Russian secondary CTA on the home-page hero reads `наши услуги` — lowercase initial letter, and a noun phrase where the other three occurrences use an infinitive verb phrase. The Armenian variant is also a noun phrase, but at least begins with a capital.

**Impact:** The lowercase initial is a visible typographic defect on the most-viewed button on the site for Russian-speaking visitors. It is the single most noticeable copy error found in this audit.

**Recommendation:** Use `Ознакомиться с нашими услугами` for consistency with the other three pages, or at minimum capitalise to `Наши услуги`. Align the Armenian to `Ծանոթանալ մեր ծառայություններին` at the same time.

**Acceptance criteria:** All four occurrences of "Explore Our Services" resolve to one Russian and one Armenian string, each beginning with a capital letter.

**Verification:** The consistency spec from I18N-001, plus visual check of `/ru` and `/hy`.

---

**ID:** ARCH-001
**Title:** The five service categories are declared in three places with no shared source and no linking test
**Priority:** **P2 — Medium**
**Location:** `src/app/shared/services-catalogue/service-category.ts:3-9`; `src/app/pages/contact/contact-form/contact-submitter.ts:10-17`; `src/app/layout/footer/footer.content.ts:18-46`

**Evidence:** `SERVICE_CATEGORY_IDS` and `SERVICE_VALUES` contain the same five slugs (the latter prefixed by `''` for the empty pre-selection), declared independently. `contact-contract.spec.ts:110` pins `SERVICE_VALUES` to the documented API contract; `service-category.spec.ts` pins the catalogue. A `grep` for both symbols confirms **no module and no spec references both**. Their display labels are written a third time in the footer dictionary.

**Problem:** Three parallel declarations of one domain concept, each independently tested against a different authority, with nothing asserting they agree.

**Impact:** Renaming a category in the catalogue silently desynchronises the contact form, which would then post a value the API does not recognise — caught only if someone remembers to update both. The label duplication is the structural cause of four of the 24 I18N-001 groups.

**Recommendation:** Derive `SERVICE_VALUES` from `SERVICE_CATEGORY_IDS` (`['', ...SERVICE_CATEGORY_IDS] as const`) if the API contract genuinely uses the same slugs, keeping `contact-contract.spec.ts` as the check that this remains true. Move the five display labels into `services-catalogue.content.ts` and have the footer and contact form read them from there.

**Acceptance criteria:** One declaration of the five slugs; one declaration of the five labels per locale; existing contract spec still passes.

**Verification:** `npm test`, `npm run lint:deps`.

---

**ID:** TEST-001
**Title:** Accessibility and e2e suites sample 2 of 19 product pages
**Priority:** **P2 — Medium**
**Location:** `e2e/a11y.spec.ts:10-18`

**Evidence:**

```ts
'our_work',
// Two of the nineteen product pages: one that links out to a live product and one that has
// no destination, which is the branch that renders a different set of controls.
'our_work/draculai',
'our_work/roar-organic',
```

`A11Y-001` (3 critical violations) is on `our_work/connected-car`, one of the 17 unsampled pages. The sampling rationale is sound for _control variants_ but does not cover _data-shape_ variants: `draculai` and `roar-organic` both have ≤ 2 photographs, so neither exercises the multi-thumbnail gallery where the defect lives.

**Problem:** The sample was chosen to cover rendering branches, not data completeness. Per-product data is exactly the kind of content that drifts.

**Impact:** A critical, Level AA accessibility failure shipped to three live URLs undetected.

**Recommendation:** Run the axe sweep across all 19 slugs in at least one locale (19 extra page loads is cheap relative to the existing 312-test run), keeping the full 3-locale sweep for the two representative pages. Add at least one multi-photograph product to the detailed sample.

**Acceptance criteria:** `a11y.spec.ts` covers every entry in `PRODUCT_IDS` and reports zero violations.

**Verification:** `npm run e2e`.

---

**Remaining P3 findings** are summarised in the consolidated table above; each states its location and the condition for resolution. They are genuine improvements rather than defects, and none blocks release.

---

**ID:** TEST-004
**Title:** `verify:images` does not check that declared dimensions match the actual images
**Priority:** **P2 — Medium**
**Status:** **OPEN**
**Location:** `scripts/verify-images.mjs`, `checkImages()`

**Evidence:** `checkImages()` validates four things — that every file is WebP, that every file is referenced by some product, that no file exceeds the 120 kB budget, and that every expected ladder variant exists. It receives a `widths` map parsed from `product-meta.ts` by `photoWidths()`, but uses it **only** to decide which variant filenames to expect:

```js
for (const variant of variantFiles(file, widths.get(file) ?? 0)) {
  expected.set(variant, file);
}
```

Nothing ever opens an image to compare its intrinsic size against the declared `width`/`height`. The declared numbers are taken on trust.

**Problem:** `product-meta.ts` is the single source for both the `<img width height>` attributes and the `srcset` `w` descriptors, and it is maintained by hand. A wrong value is invisible to every gate in the project: it passes `typecheck` (both numbers are still `number`), passes `lint`, passes `verify:images`, and produces a page that renders.

**Impact:** This is precisely how `DATA-001` survived — three photographs declared `1000 × 667` while actually being `3000 × 1500`, `1080 × 1080` and `910 × 767`. The consequences are a wrong reserved aspect ratio (layout shift) and a `srcset` whose `w` descriptors misdescribe the candidates, so the browser's selection is made on false information. `infin.webp` was offered to the browser as a 1000-pixel-wide image while being three times that.

**Recommendation:** Have `verify-images.mjs` read each referenced photograph's intrinsic dimensions — `sharp` is already a dependency and already used by `optimize-images.mjs` — and fail when either declared value disagrees. Extend `checkImages()` to take the measured sizes and add cases to `scripts/verify-images.test.mjs`, which already covers the other four rules.

**Acceptance criteria:**

- `verify:images` exits 1 when a declared `width` or `height` differs from the file.
- It exits 0 on the current, corrected registry.
- The new rule is covered by `verify-images.test.mjs`.

**Verification:** Temporarily alter one declared width and confirm the gate fails naming the file; restore and confirm it passes.

---

**ID:** TEST-005
**Title:** Three e2e tests assert before their precondition holds
**Priority:** **P2 — Medium**
**Status:** **RESOLVED** (§1.2) — pre-existing; identified during remediation, not introduced by it

**Location:** `e2e/our-work.spec.ts:156` — _"walks card → detail link → live link → next card"_; mechanism in `project-card.scss:37-39`

**Evidence:** Measured against a freshly started dev server, Chromium, `--workers=1`:

| Working tree                                  | Runs | Result                 |
| --------------------------------------------- | ---- | ---------------------- |
| **HEAD `34df6bb`, unmodified**                | 6    | **0 passed, 6 failed** |
| After remediation                             | 3    | 1 passed, 2 failed     |
| After remediation (earlier, parallel workers) | 1    | passed                 |

The failure is always the same:

```
Error: expect(locator).toBeFocused() failed
Locator: locator('app-project-card').first().locator('.project-card__link')
Expected: focused
Received: inactive
13 × locator resolved to <a href="/our_work/draculai" class="project-card__link" …>
```

**Problem:** The card's two faces share a grid cell and the turned-away face is hidden with `visibility`, which is what makes it genuinely gone rather than merely rotated away. `project-card.scss:37-39` delays that change by the flip duration:

```scss
visibility: hidden;
transition: visibility 2s linear motion.duration(flip);
```

The test calls `first.focus()` and presses `Tab` on the very next line, with nothing in between. Whether `.project-card__link` is focusable yet depends on whether the delayed `visibility` change has been applied — a race the test does not wait on. Under `reducedMotion: 'reduce'` the delay is zeroed at the token layer, but the style recalculation still has to land before the keypress is dispatched.

**Impact:** A test that fails 6 times out of 6 on untouched `main` makes the e2e suite unusable as a merge signal: a red run carries no information, which trains a team to re-run rather than read it. It also masked attribution during this remediation — the failure first appeared alongside a real change and had to be traced back to the baseline before it could be ruled out.

**This is reported as a defect in the test, not in the card.** The behaviour it checks — that Tab walks card → detail link → visit link → next card — is correct in a browser; only the assertion's timing is unsound.

**Correction to the recommendation originally given here.** This entry first suggested waiting on `toHaveClass(/is-flipped/)`. **That would not have worked**, and the measurement says why: the class is applied synchronously by the signal, and it is the painted result that trails it. A test waiting on the class would have waited for something already true. The fix had to wait on the face.

**Why the lag exists at all.** `visibility` is revealed by a _transition_, and a transition reports its from-value at `t=0`. Even with `transition-delay: 0s` — which `:host(.is-flipped) .project-card__face--back` sets explicitly — the face reads `hidden` for the first frame after the class lands, and a `visibility: hidden` subtree holds no tab stops. Measured directly: sampling the computed style immediately after `focus()` showed `back=hidden` on 3 of 6 runs, flipping to `visible` by the next observation.

**A note on measurement.** The first probe written for this reported `back=visible` on every run and appeared to disprove the hypothesis. It was wrong: reading the value through a CDP round-trip inserted enough delay to let the transition start, so the probe destroyed the state it was measuring. The second probe, which read before and after a single `Tab`, reproduced the lag. Worth recording because the failure mode is easy to repeat.

**Recommendation (as applied):** wait on the state each test actually depends on. Do not paper over it with a fixed `waitForTimeout`.

**Acceptance criteria:** 20 consecutive runs pass on an unmodified tree.

**Verification:** `npx playwright test e2e/our-work.spec.ts --project=chromium -g "walks card" --repeat-each=20`.

**Resolution (§1.2).** Three tests shared the underlying fault — each asserted before the thing it depended on was true. Two raced the `visibility` transition; the third misread focus as a completion signal.

| Test                                                                | Line | What it waited on before                    | Now waits on                    |
| ------------------------------------------------------------------- | ---- | ------------------------------------------- | ------------------------------- |
| _walks card → detail link → live link → next card_                  | 156  | nothing — `Tab` immediately after `focus()` | the back face being visible     |
| _opens on focus, and holds while the caret moves between its links_ | 127  | `is-flipped` (already true; proves nothing) | the back face being visible     |
| _holds the page still while it is open…_                            | 720  | the stage being focused                     | the computed `overflow`, polled |

The third was a different fault with the same shape. Its comment claimed focus returning to the stage was a safe signal for the unlock handler having run — but the test **clicks the stage** to open the lightbox, so the stage is already the active element, and `<dialog>` restores focus there on close _before_ Angular's `close` listener runs. The signal was true before the thing it was standing in for. Measured: 1 failure in 12, and the lock always cleared within one frame. It now polls the computed `overflow` directly, which still fails if the lock is genuinely left on.

**Measured result after the fix** (fresh dev server, Chromium, `--workers=1`):

| Check                                       | Result                  |
| ------------------------------------------- | ----------------------- |
| `-g "walks card"` × 20                      | **20 / 20 passed**      |
| `-g "walks card\|opens on focus"` × 15 each | **30 / 30 passed**      |
| `-g "holds the page still"` × 12            | **12 / 12 passed**      |
| Full `our-work.spec.ts`, 4 consecutive runs | **156 / 156 each time** |

Compare the pre-fix baseline in the table above: 0 of 6 on untouched `main`.

**Harness note.** `our-work.spec.ts` must be run against the dev server (`npm run e2e`). It is not part of `playwright.prerendered.config.ts`, whose `testDir` is `./e2e/prerendered`. Running it against the built artifact produces failures that mean nothing — a mistake made twice during this work, once at the start of the investigation and once while verifying the fix.

---

**ID:** TEST-006
**Title:** The gallery's scroll lock is unguarded against a second lock
**Priority:** **P3 — Low** — latent; **not** observed in practice
**Status:** **OPEN**
**Location:** `src/app/pages/our-work/product-detail/product-gallery/product-gallery.ts:167-174`

**Evidence:**

```ts
private lock(): void {
  const root = this.document.documentElement;
  this.locked = {
    overflow: root.style.overflow,   // <- saves whatever is there now
    offset: this.document.defaultView?.scrollY ?? 0,
  };
  root.style.overflow = 'hidden';
}
```

**Problem:** `lock()` records the current inline `overflow` as the value to restore, then overwrites it. There is no guard against being called while already locked. A second `lock()` without an intervening `unlock()` would therefore record `'hidden'` as the value to restore, and the matching `unlock()` would faithfully put `'hidden'` back — leaving the page permanently unscrollable with the lightbox shut. `unlock()` is correctly guarded (`if (!locked) return`); `lock()` is not.

**This was investigated as the suspected cause of the `TEST-005` third failure and ruled out.** Across 12 instrumented open/close cycles the lock was released every time, within one frame; 0 runs were stuck. No path was found that calls `lock()` twice — `openLightbox()` is the only caller, and the stage sits behind the modal once it is open. **No defect is claimed here**, only an unguarded invariant that the rest of the component is careful about.

**Recommendation:** Return early when already locked, mirroring `unlock()`:

```ts
if (this.locked) return;
```

**Acceptance criteria:** calling `lock()` twice then `unlock()` once leaves `documentElement` scrollable; covered by a unit test alongside the existing gallery specs.

---

**Note on `NG-001`.** The audit recorded that the hand-rolled `srcset` is where `PERF-001` originated. Remediation strengthens that finding: `photoSrcset()` emits a candidate for every ladder step below the declared width **whether or not the file exists**, and the declared width itself is unchecked (`TEST-004`). Two of the three defects in this cluster — the 404 candidates and the mis-descriptive `w` values — are consequences of hand-rolling what `NgOptimizedImage` would compute. `NG-001` remains P3 because the current code is now correct and gated, but it is the structural fix.

---

## 5. Localization Quality Report

**Corpus:** 53 dictionaries, **1,196 `t({ en, hy, ru })` entries**, all parsed and compared. No translation was modified.

### 5.1 Structural results (all three languages)

| Check                                                | Result                                                                         | Verdict                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Entries carrying all three locales                   | 1,196 / 1,196                                                                  | **Pass** — no missing keys, fallback never used                                                |
| Placeholder parity (`{max}`, `{current}`, `{total}`) | 0 mismatches                                                                   | **Pass**                                                                                       |
| Leading/trailing whitespace, double spaces           | 0                                                                              | **Pass**                                                                                       |
| Untranslated non-brand strings                       | 0                                                                              | **Pass** (30 identical-across-locales values reviewed; all brand names or standard tech terms) |
| Locale switching / fallback logic                    | `prefix-no-default`, `syncLocaleWithUrl`, `localeFromLocation`                 | **Pass**                                                                                       |
| Localised URLs                                       | `getLocalizedUrl` via `LocalizedPathPipe` everywhere; hreflang + sitemap agree | **Pass** (`verify:seo`)                                                                        |
| Cross-dictionary term consistency                    | **24 divergent groups**                                                        | **Fail** — see §5.3                                                                            |

### 5.2 Per-language assessment

**English (EN) — reference language**

| Property           | Result                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Role               | Default locale, unprefixed, `x-default` target                                                                                  |
| Entries            | 1,196                                                                                                                           |
| Spelling / grammar | No errors found                                                                                                                 |
| Capitalisation     | Consistent Title Case for headings and CTAs — **except** that it is the source for the lowercase Russian divergence in I18N-002 |
| Terminology        | Consistent and professional                                                                                                     |
| **Issues**         | None in the English copy itself                                                                                                 |

**Russian (RU)**

| Property             | Result                                                                                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entries              | 1,196 — complete                                                                                                                                                                                               |
| Script               | Cyrillic, with Latin retained for IT terms (`white-label`, `frontend`, `backend`, `DevOps`, `SaaS`, `Senior+`) — correct professional register                                                                 |
| Typography           | `ё` used correctly (`надёжной`, `объём`); em-dashes and `«»` handled appropriately                                                                                                                             |
| Sentence terminators | Latin `.` throughout — correct for Russian                                                                                                                                                                     |
| Compound forms       | `AI-агенты`, `White-label-разработка`, `SaaS-разработка` — correct hyphenation                                                                                                                                 |
| **Issues**           | `I18N-002` lowercase hero CTA `наши услуги`; 20 of the 24 I18N-001 groups affect Russian; `White-label-разработка` vs `White-label разработка` (`services-catalogue.content.ts:269`) hyphenation inconsistency |

**Armenian (HY)**

| Property             | Result                                                                                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entries              | 1,196 — complete                                                                                                                                                                                                                   |
| Font support         | `Noto Sans Armenian` present, correct `unicode-range`, second in `$plain-family`, **contractually tested** by `e2e/fonts.spec.ts`                                                                                                  |
| Sentence terminators | **347 of 348** long sentences end with the Armenian full stop `։` (U+0589); 1 uses a Latin `.`                                                                                                                                     |
| Script               | Armenian with Latin IT terms retained — correct register                                                                                                                                                                           |
| Layout safety        | Armenian compounds are the longest of the three languages; `overflow.spec.ts` asserts no overflow in `hy` at 320/390/840 px across all 87 paths — **passing**, and this audit confirmed no overflow at 430/768/1024/1920 px either |
| **Issues**           | 21 of the 24 I18N-001 groups affect Armenian; the single Latin-period outlier; `I18N-002`'s Armenian counterpart (`Մեր ծառայությունները` vs `Ծանոթանալ մեր ծառայություններին`)                                                     |

> **Limitation.** Native-speaker fluency, idiom and tone-of-voice in Armenian and Russian were **not** independently verified. Everything reported above is mechanically verifiable. No claim is made about how natural the copy reads to a native professional audience.

### 5.3 Translation consistency defects (I18N-001) — all 24 groups

Format: EN source → divergent renderings with their locations. **No translation was changed.**

| #   | English source                                                     | Lang  | Variant A (locations)                                                                                   | Variant B (locations)                                                                | Recommended                                   | Justification                                                                 |
| --- | ------------------------------------------------------------------ | ----- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | Company boilerplate ("Nexora brings together Senior and Senior+…") | HY    | `…համախմբում է… փորձը…` (document-meta:13)                                                              | `…միավորում է… փորձառությունը…` (hero:22)                                            | document-meta version                         | It is the meta description — the one search engines index                     |
| 1   | —                                                                  | RU    | `…экспертизу инженеров… заказного ПО…` (document-meta:13)                                               | `…опыт инженеров… программного обеспечения на заказ…` (hero:22)                      | document-meta version                         | Same reason; also more concise                                                |
| 2   | AI Agents & Business Automation                                    | HY    | `…բիզնես գործընթացների ավտոմատացում` (document-meta:119, ai-agent:9)                                    | `…բիզնես ավտոմատացում` (header:47, services-catalogue:155)                           | Variant A                                     | Matches the page title the nav links to                                       |
| 2   | —                                                                  | RU    | `…автоматизация бизнес-процессов` (same)                                                                | `…автоматизация бизнеса` (same)                                                      | Variant A                                     | Same                                                                          |
| 3   | Engagement Models                                                  | HY    | `Համագործակցության ձևաչափեր` (document-meta:126, engagement-models:8)                                   | `Համագործակցության մոդելներ` (footer:116)                                            | Variant A                                     | The page title must match the link to it                                      |
| 3   | —                                                                  | RU    | `Форматы сотрудничества` (same)                                                                         | `Модели сотрудничества` (footer:116)                                                 | Variant A                                     | Same                                                                          |
| 4   | Engagement models (lowercase)                                      | HY/RU | Variant A (about:41, engagement-models:7/13)                                                            | Variant B (not-found:39)                                                             | Variant A                                     | Same concept as #3                                                            |
| 5   | Software Engineering                                               | HY    | `Ծրագրային ինժեներիա` (footer:18)                                                                       | `Ծրագրային ապահովման մշակում` (contact-form:108, services:97)                        | Variant B                                     | Majority; matches the services page                                           |
| 5   | —                                                                  | RU    | `Разработка ПО` (footer:18, services:97)                                                                | `Разработка программного обеспечения` (contact-form:108)                             | `Разработка ПО`                               | Majority; fits a nav/dropdown width                                           |
| 6   | Design & Product                                                   | HY    | `Դիզայն և պրոդուկտ` (footer:34, services:88)                                                            | `Դիզայն և թվային արտադրանք` (contact-form:100)                                       | Variant A                                     | Majority                                                                      |
| 6   | —                                                                  | RU    | `Дизайн и продукт` (footer:34, services:88)                                                             | `Дизайн и цифровые продукты` (contact-form:100)                                      | Variant A                                     | Majority                                                                      |
| 7   | Infrastructure & Operations                                        | HY    | `Ենթակառուցվածք և շահագործում` (footer:38)                                                              | `Ենթակառուցվածքներ և շահագործում` (contact-form:124, services:123)                   | Variant B                                     | Majority; plural matches the category's scope                                 |
| 8   | Engineering Partnerships                                           | HY    | `Ինժեներական գործընկերություն` (footer:46, services:136)                                                | `Ինժեներական համագործակցություն` (contact-form:132)                                  | Variant A                                     | Majority; `գործընկերություն` matches the Partnerships page                    |
| 9   | Discuss Your Project                                               | HY    | `Քննարկենք…` (about:36, hero:27)                                                                        | `Քննարկել…` (engagement-models:44, services:74, solutions:36, start-conversation:38) | Variant B                                     | Majority (4 vs 2); infinitive is the house CTA form                           |
| 9   | —                                                                  | RU    | `Обсудить проект` (about:36)                                                                            | `Обсудить ваш проект` (5 locations)                                                  | Variant B                                     | Majority (5 vs 1)                                                             |
| 10  | Explore Our Services                                               | HY    | `Ծանոթանալ մեր ծառայություններին` (3 locations)                                                         | `Մեր ծառայությունները` (hero:32)                                                     | Variant A                                     | Majority; verb phrase matches the CTA convention                              |
| 10  | —                                                                  | RU    | `Ознакомиться с нашими услугами` (3 locations)                                                          | **`наши услуги`** (hero:32)                                                          | Variant A                                     | **Also fixes the lowercase defect (I18N-002)**                                |
| 11  | Discuss this service                                               | HY    | `Քննարկել…` (ai-agent:24, 51)                                                                           | `Քննարկենք…` (ai-agent:36)                                                           | Variant A                                     | Majority, and within a single file                                            |
| 11  | —                                                                  | RU    | `Обсудить эту услугу` (24, 51)                                                                          | `Обсудим эту услугу` (36)                                                            | Variant A                                     | Same                                                                          |
| 12  | Business-first approach                                            | HY    | `Բիզնեսի կարիքներից բխող մոտեցում` (business-flow:7)                                                    | `Բիզնեսից ելնող մոտեցում` (why-disciplines:39)                                       | business-flow version                         | More precise rendering of "business-first"                                    |
| 12  | —                                                                  | RU    | `Подход, ориентированный на бизнес` (business-flow:7)                                                   | `Подход от бизнеса` (why-disciplines:39)                                             | business-flow version                         | Variant B is not idiomatic Russian                                            |
| 13  | Technical leadership                                               | HY    | `Տեխնիկական ղեկավարում` (quality-capability:115)                                                        | `Տեխնիկական ղեկավարություն` (why-disciplines:364)                                    | Either — pick one                             | Both valid; consistency is the point                                          |
| 13  | —                                                                  | RU    | `Техническое руководство` (quality-capability:115)                                                      | `Техническое лидерство` (why-disciplines:364)                                        | `Техническое руководство`                     | Standard business Russian                                                     |
| 14  | Long-Term Partnership                                              | HY/RU | `Երկարաժամկետ գործընկերություն` / `Долгосрочное партнёрство` (related-services:44, model-comparison:25) | `…տեխնոլոգիական…` / `…технологическое…` (model-finder:51)                            | Variant A                                     | It is an engagement-model name — must be stable                               |
| 15  | Maintenance & Support                                              | RU    | `Техническое сопровождение и поддержка` (3 locations)                                                   | `Техническое обслуживание и поддержка` (challenges:367)                              | Variant A                                     | Majority; "сопровождение" is correct for software                             |
| 16  | Dedicated Engineering Teams                                        | HY    | `Նախագծին նվիրված…` (model-details:62)                                                                  | `Ձեր նախագծին նվիրված…` (expertise:107)                                              | Variant A                                     | Service-name form should not embed "your"                                     |
| 17  | Dedicated Development Teams                                        | HY    | `Նախագծին նվիրված մշակման թիմեր` (home/engagement-models:53)                                            | `Նվիրված մշակման թիմեր` (services-catalogue:250)                                     | Variant A                                     | More explicit; matches #16                                                    |
| 18  | Ongoing product evolution…                                         | RU    | `Непрерывное развитие…` (model-details:110)                                                             | `Постоянное развитие…` (home/engagement-models:76)                                   | Either — pick one                             | Synonymous; consistency only                                                  |
| 19  | Continuous support, improvements…                                  | HY    | `…նախապես համաձայնեցված տեխնիկական պարտավորությունների…` (model-details:153)                            | `…համաձայնեցված պարտավորությունների…` (home/engagement-models:112)                   | Longer form on the detail page, short on home | Acceptable if deliberate; otherwise unify                                     |
| 20  | White-Label Development                                            | RU    | `White-label-разработка` (3 locations)                                                                  | `White-label разработка` (services-catalogue:269)                                    | Hyphenated                                    | Russian compounds with a Latin element take a hyphen                          |
| 21  | Mobile Applications                                                | HY    | `Բջջային հավելվածների մշակում` (expertise:51)                                                           | `Բջջային հավելվածներ` (what-we-build:69)                                             | Context-dependent                             | "development of" vs the category name — arguably correct as-is; verify intent |
| 21  | —                                                                  | RU    | `Разработка мобильных приложений` (expertise:51)                                                        | `Мобильные приложения` (what-we-build:69)                                            | Same                                          | Same                                                                          |
| 22  | End-to-end delivery                                                | HY    | `Նախագծի իրականացում՝ սկզբից մինչև վերջ` (hero:43)                                                      | `Ամբողջական մատակարարում` (why-disciplines:27)                                       | hero version                                  | `մատակարարում` means physical supply — wrong sense here                       |
| 22  | —                                                                  | RU    | `Полный цикл реализации проекта` (hero:43)                                                              | `Полный цикл поставки` (why-disciplines:27)                                          | hero version                                  | `поставки` likewise implies goods delivery                                    |
| 23  | AI Orchestrator                                                    | HY    | `AI համակարգերի համակարգող` (hero:84)                                                                   | `AI համակարգող` (hero:89)                                                            | Either — pick one                             | Two renderings five lines apart in one file                                   |
| 23  | —                                                                  | RU    | `Оркестратор AI-систем` (hero:84)                                                                       | `AI-оркестратор` (hero:89)                                                           | Same                                          | Same                                                                          |
| 24  | SaaS Development                                                   | HY    | `SaaS լուծումների մշակում` (challenges:59, 315)                                                         | `SaaS մշակում` (services-catalogue:83)                                               | Variant A                                     | Majority; reads better                                                        |
| 24  | —                                                                  | RU    | `Разработка SaaS-продуктов` (challenges:59, 315)                                                        | `SaaS-разработка` (services-catalogue:83)                                            | Variant A                                     | Majority                                                                      |

**Highest priority within this set:** #3/#4 (navigation label vs page title), #10 (lowercase Russian CTA), #5–#8 (service taxonomy), #22 (`մատակարարում` / `поставки` carry the wrong sense).

---

## 6. Responsive & UI/UX Report

**Method.** Chromium, production artifact from `dist/nexora/browser` served over `scripts/serve-dist.mjs`. 7 viewports × 3 locales × 11 pages = **231 page loads**. Measured per load: document horizontal scroll, every element's bounding box, interactive target sizes, and failed image loads. Corroborated by the project's own 312 passing e2e assertions.

### 6.1 Viewport matrix

| Device        | Width | Pages | H-scroll | Nav  | Header/Footer | Cards | Forms | Buttons | Dialog | Gallery              | Typography | Touch targets | Result   |
| ------------- | ----: | ----: | -------- | ---- | ------------- | ----- | ----- | ------- | ------ | -------------------- | ---------- | ------------- | -------- |
| Small Mobile  |   320 |    33 | **None** | Pass | Pass          | Pass  | Pass  | Pass    | Pass   | Pass (strip scrolls) | Pass       | Pass (axe)    | **Pass** |
| Mobile        |   375 |    33 | **None** | Pass | Pass          | Pass  | Pass  | Pass    | Pass   | Pass                 | Pass       | Pass          | **Pass** |
| Large Mobile  |   430 |    33 | **None** | Pass | Pass          | Pass  | Pass  | Pass    | Pass   | Pass                 | Pass       | Pass          | **Pass** |
| Tablet        |   768 |    33 | **None** | Pass | Pass          | Pass  | Pass  | Pass    | Pass   | Pass                 | Pass       | Pass          | **Pass** |
| Laptop        |  1024 |    33 | **None** | Pass | Pass          | Pass  | Pass  | Pass    | Pass   | Pass                 | Pass       | Pass          | **Pass** |
| Desktop       |  1440 |    33 | **None** | Pass | Pass          | Pass  | Pass  | Pass    | Pass   | Pass                 | Pass       | Pass          | **Pass** |
| Large Desktop |  1920 |    33 | **None** | Pass | Pass          | Pass  | Pass  | Pass    | Pass   | Pass                 | Pass       | Pass          | **Pass** |

Pages covered per viewport: `/`, `/services`, `/solutions`, `/about`, `/engagement-models`, `/partnerships`, `/contact`, `/our_work`, `/our_work/connected-car`, `/our_work/mezave`, `/not-found` — each in `en`, `hy` and `ru`.

### 6.2 Scenario results

| Scenario                                        | Result                            | Evidence                                                                                                                                |
| ----------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Horizontal page overflow, any width, any locale | **None**                          | `documentElement.scrollWidth === clientWidth` on all 231 loads; project's `overflow.spec.ts` green across 87 paths × 3 widths           |
| Armenian long-compound overflow                 | **None**                          | Explicitly covered: `hy` included at every width above; a past 87 px overflow at 390 px is pinned by the existing spec                  |
| Comparison table at narrow widths               | **Scrolls internally, by design** | `model-comparison.scss:57` → `overflow-x: auto`; the 960 px table never pushes the document                                             |
| Gallery thumbnail strip                         | **Scrolls internally, by design** | `product-gallery.scss:145-147` → `overflow-x: auto` + `scroll-snap-type: x proximity`; active thumb auto-centred by `afterRenderEffect` |
| Lightbox dialog                                 | Pass                              | Native `<dialog>` + `showModal()`; scroll locked and restored; focus returned to stage; backdrop click and Escape close                 |
| Contact form at 320 px                          | Pass                              | No document overflow; inputs reflow to single column                                                                                    |
| Touch targets (WCAG 2.2 SC 2.5.8)               | **Pass**                          | axe `target-size` rule confirmed to execute and PASS on 25–51 nodes per page                                                            |
| Image responsiveness                            | **Fail on 1 page**                | 9 broken images at ≤375 px, 3 at ≥1440 px — all on `connected-car` (PERF-001)                                                           |
| Mobile interaction (tap-to-flip card)           | Not re-run                        | Covered by the project's `mobile-chrome` (Pixel 7) project and `our-work.touch.spec.ts`                                                 |
| Reduced motion                                  | Pass                              | Durations and distances zeroed at the token layer                                                                                       |

### 6.3 UI/UX observations (not defects)

- The typographic scale steps only at 1200 px for three roles, so 430–1199 px shares one size set. Correct, but a `clamp()` range would use that span better (`STYLE-001`).
- The comparison table and gallery strip rely on horizontal scrolling without a visible affordance (no fade edge or scroll hint). Functional and `scroll-snap`-assisted, but discoverability on a non-touch device at 768 px could be improved.
- 430/768/1024/1920 px are correct today but absent from the regression suite (`RESP-001`).

---

## 7. Scoring Summary

| Area                       |            Score | Confidence                                     | Principal justification                                                                                                                                                      |
| -------------------------- | ---------------: | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code Quality               |         **9**/10 | High                                           | 0 `any`, 0 non-null assertions, 4 justified `effect()`s, all static gates green; minor state-machine complexity and two unused strictness flags                              |
| Architecture               |         **9**/10 | High                                           | Layering machine-enforced (215 modules, 0 violations); deduction for the triplicated service taxonomy                                                                        |
| Design Patterns            |         **9**/10 | High                                           | Null Object, Strategy-via-DI, Facade, consistent domain-id idiom, no over-abstraction; `ProjectCard` is the one strained case                                                |
| Functionality              | **6** → **9**/10 | High                                           | Core flows correct and well tested; one of 19 product pages broken in four ways, suite red on `main`                                                                         |
| Angular 22 Best Practices  |         **8**/10 | High                                           | Zoneless, signals, Signal Forms, SSG, OnPush pinned by test, `no-deprecated` with type info; `NgOptimizedImage` unused and `@defer` barely used                              |
| SCSS & Styling             |         **9**/10 | High                                           | Token system that errors on misuse, 0 `!important`, 0 `::ng-deep`, BEM enforced, logical properties; no `clamp()` or container queries                                       |
| Responsive Design          |         **8**/10 | High                                           | Zero page overflow at all 7 widths × 3 locales; 4 of 7 widths unprotected by regression tests                                                                                |
| Localization & Translation |         **7**/10 | Medium-High (structure) / Medium (naturalness) | 1,196 entries complete, 0 missing keys, 0 placeholder errors, Armenian punctuation 347/348; 24 terminology divergences incl. nav and primary CTA; native fluency unverified  |
| Performance                | **7** → **8**/10 | Medium (lab only)                              | 508 kB initial / 128 kB transfer within budget, 87 routes prerendered, CLS ≤ 0.013; one page ships a 230 kB image into a 200w slot plus six 404s                             |
| SEO                        |         **9**/10 | High                                           | 87 docs verified — unique titles, canonical/hreflang agreement, JSON-LD graph, sitemap pinned to the route table, genuine 404 status                                         |
| Accessibility              | **7** → **9**/10 | High                                           | 0 violations on 7 of 8 independently tested pages, `target-size` passes, strong focus/keyboard/motion handling; 3 **critical** `button-name` violations on 3 URLs            |
| Testing & Reliability      | **6** → **8**/10 | High                                           | Outstanding contract-style tests (0.88:1 ratio); but suite red on `main`, `verify:images` unwired, 2-of-19 product sampling, no coverage signal, one non-deterministic build |

Scores shown as `x → y` were raised by the remediation in §1.1; the justification column describes the **as-audited** state, and each area's own subsection in §3 carries the reasoning for the new figure.

### Overall score

**Methodology.** Each of the 12 areas was scored independently against the evidence gathered. **All 12 areas had sufficient supporting evidence to be scored; none is marked N/A.** The overall score is the unweighted arithmetic mean, as specified.

**As audited:**

```
(9 + 9 + 9 + 6 + 8 + 9 + 8 + 7 + 7 + 9 + 7 + 6) / 12  =  94 / 12  =  7.83
```

**After remediation** — Functionality 6→9, Performance 7→8, Accessibility 7→9, Testing 6→8:

```
(9 + 9 + 9 + 9 + 8 + 9 + 8 + 7 + 8 + 9 + 9 + 8) / 12  =  102 / 12  =  8.5
```

> ### **Overall: 8.5 / 10 — Strong** _(as audited: 7.8 / 10)_
>
> **Areas evaluated: 12. Areas marked N/A: 0.**

**Why four areas moved and eight did not.** Remediation fixed one defect cluster and three flaky tests; it did not change the architecture, the patterns, the type discipline, the stylesheet system, the SEO implementation, the responsive behaviour, the Angular idioms or the translations, so those eight scores are untouched. Testing ends at 8 rather than 9 because `BUILD-001` is still open, `verify:images` is still blind to wrong dimensions (`TEST-004`), the a11y sweep still samples 2 of 19 products (`TEST-001`), and there is still no coverage signal.

### After the third pass

The third pass (§1.3) closed fifteen findings, so four more areas move. The justification column above still describes the **as-audited** state throughout; this table states only what changed and what is still holding each figure down.

| Area                       | After §1.1–1.2 |    Now | What moved it, or what still holds it                                                                                                                                                                                 |
| -------------------------- | -------------: | -----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accessibility              |              9 | **10** | Both reasons for holding it at 9 are closed: 174 of 174 `incomplete` contrast nodes measured and passing, and all 19 product pages swept.                                                                             |
| Localization & Translation |              7 |  **9** | All 24 reported divergence groups converged, plus 10 the audit missed, and `verify:translations` now holds 1202 strings to one rendering per locale. Still 9, not 10: native fluency remains unverified by a speaker. |
| Testing & Reliability      |              8 |  **9** | `TEST-004`, `TEST-001` and `TEST-006` closed; four new gates added. Still 9: `BUILD-001` is not reproduced and there is no coverage signal.                                                                           |
| Responsive Design          |              8 |  **9** | The overflow sweep now covers every declared breakpoint band rather than two of five. Still 9: no visual-regression check, so only overflow and geometry are guarded, not appearance.                                 |
| Code Quality               |              9 |      9 | One of the two stated deductions is gone — both strictness flags are on, and the nine real errors they exposed are fixed. The other stands: `ProjectCard` is documented, not simplified.                              |
| Architecture               |              9 |      9 | The taxonomy is now machine-checked across all three declarations in all three locales, but it is still declared three times rather than once.                                                                        |
| Angular 22 Best Practices  |              8 |      8 | Unchanged on purpose: `NgOptimizedImage` is kept by design (§1.3.2) and the `@defer` work is specified but not applied (§1.3.6).                                                                                      |
| SCSS & Styling             |              9 |      9 | `clamp()` and container queries are deferred as design decisions (§1.3.2).                                                                                                                                            |
| Performance                |              8 |      8 | The icon sprite is specified but not applied; nothing was measured again, so nothing is claimed.                                                                                                                      |

Functionality (9), Design Patterns (9) and SEO (9) are untouched by this pass.

```
(9 + 9 + 9 + 9 + 8 + 9 + 9 + 9 + 8 + 9 + 10 + 9) / 12  =  107 / 12  =  8.92
```

> ### **Overall after the third pass: 8.9 / 10 — Strong** _(as audited: 7.8; after the first two passes: 8.5)_

**What 8.9 is not.** It is not a claim that the remaining six items are unimportant — two are specified and ready to implement, two are design decisions waiting on the owner, one is a documented complexity, and one is a build non-determinism that has not been reproduced. It is also not a verdict on anything this pass could not execute: the full e2e suite did not run, so no score moved on the strength of it.

One sub-metric is marked N/A _within_ an area rather than excluded from the mean: **INP was not measured** (no interaction-driven measurement was scripted) and is excluded from the Performance assessment's basis, which rests on LCP, CLS, bundle budgets and payload analysis.

---

## 8. Improvement Roadmap

Effort: **S** ≤ half a day · **M** ≤ two days · **L** > two days.

> **This roadmap is the audit's original plan and is kept unedited.** Much of it has since been carried out, and a few entries were superseded by something better once the code was examined — `R2.6` became a sweep of every declared breakpoint band rather than the four device widths it named, and `R3.6` was answered by documenting `ProjectCard`'s invariants rather than extracting them. **The consolidated table in §4 is the authoritative status; §1.3 records what the third pass did and why.**

### Phase 1 — Immediate fixes (P0 and the most important P1) — **COMPLETE except R1.6**

> **Status:** R1.1–R1.5 were applied and verified on 2026-11-16 (§1.1). **R1.6 (build non-determinism) was not attempted and remains the one open P1.** R1.7 is new, added from a defect found while doing the rest.

| ID       | Pri | Task                                                                                          | Files                                                                              | Expected outcome                              | Acceptance criteria                                                                                     | Depends on         | Effort |
| -------- | --- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------ | ------ |
| **R1.1** | P0  | Add the three missing `photoAlts` for `connected-car` in EN/HY/RU                             | `pages/our-work/products/product.content.ts`                                       | 4 described photographs; red suite goes green | `npm test` 491/491; no `alt=""` on gallery images in the built page; 4 distinct descriptions per locale | —                  | **S**  |
| **R1.2** | P0  | Verify the gallery thumbnail buttons now have accessible names, and add a positional fallback | `product-gallery/product-gallery.html`                                             | 0 `button-name` violations on all 19 products | axe reports 0 violations on `/our_work/connected-car` in all 3 locales                                  | R1.1               | **S**  |
| **R1.3** | P1  | Regenerate the `connected-car` image ladder                                                   | `public/images/{infin,control,serv}*` via `npm run images:optimize`                | No 404 candidates; no oversized `200w` file   | `npm run verify:images` exits 0; no ladder file byte-identical to its original                          | —                  | **S**  |
| **R1.4** | P1  | Reconcile `platform` and `url` for `connected-car`                                            | `products/data/product-meta.ts:193-203`, possibly `product-detail.spec.ts:283-285` | Label, destination and structured data agree  | `npm test` passes; store in the label matches the store in the URL                                      | Decision on intent | **S**  |
| **R1.5** | P1  | Add `npm run verify:images` to CI                                                             | `.github/workflows/ci.yml`                                                         | The gate that catches R1.3 actually runs      | Pipeline fails on an unoptimised image, passes after R1.3                                               | R1.3               | **S**  |
| **R1.6** | P1  | Investigate the non-deterministic build                                                       | build pipeline, `scripts/intlayer-lock.mjs`, Intlayer version                      | Deterministic builds                          | 10 consecutive `npm run build` runs exit 0, including runs immediately after `npm test`                 | —                  | **M**  |
| **R1.7** | P1  | _(new)_ Correct the three wrong declared photo dimensions                                     | `products/data/product-meta.ts:197-203`                                            | Correct CLS box and `srcset` descriptors      | Declared `width`/`height` equal each file's intrinsic size — **DONE**, see `DATA-001`                   | —                  | **S**  |

**Phase 1 exit criterion:** `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run verify:prerender && npm run verify:seo && npm run verify:headers && npm run verify:bundle && npm run verify:images && npm run e2e` completes green end to end.

**Exit criterion status:** every command in that chain now exits 0, and `our-work.spec.ts` ran 156/156 four consecutive times after `R2.9`. Phase 1 is closed **except `R1.6`** — the build still fails intermittently on unchanged inputs, which is the last thing standing between this pipeline and a result that can be trusted without a human reading the log.

### Phase 2 — Short-term improvements (quality, functionality, UI)

| ID        | Pri | Task                                                               | Files                                                                                               | Expected outcome                                                      | Acceptance criteria                                                                                      | Depends on         | Effort |
| --------- | --- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------ | ------ |
| **R2.1**  | P2  | Fix the lowercase Russian hero CTA and its Armenian counterpart    | `pages/home/hero/hero.content.ts:32`                                                                | Primary CTA consistent across 4 pages                                 | All 4 occurrences resolve to one RU and one HY string, capitalised                                       | —                  | **S**  |
| **R2.2**  | P2  | Converge the 24 divergent translation groups on one rendering each | 18 dictionaries — see §5.3                                                                          | Nav labels, CTAs and the service taxonomy read identically everywhere | Consistency spec (R2.3) passes                                                                           | R2.3 written first | **M**  |
| **R2.3**  | P2  | Add a cross-dictionary translation-consistency spec                | new `src/app/i18n-consistency.spec.ts`                                                              | Divergence cannot return                                              | Groups all `t()` entries by EN value; asserts one `hy` and one `ru` per group; fails today with 24 cases | —                  | **S**  |
| **R2.4**  | P2  | Extend the a11y sweep to all 19 product pages                      | `e2e/a11y.spec.ts:10-18`                                                                            | Data-shape defects caught, not just control-branch ones               | Every `PRODUCT_IDS` entry covered; 0 violations                                                          | R1.1, R1.2         | **S**  |
| **R2.5**  | P2  | Unify the service taxonomy                                         | `service-category.ts`, `contact-submitter.ts`, `footer.content.ts`, `services-catalogue.content.ts` | One declaration of slugs, one of labels per locale                    | `contact-contract.spec.ts` still passes; `lint:deps` clean                                               | R2.3               | **M**  |
| **R2.6**  | P3  | Add 430/768/1024/1920 px to the overflow regression sweep          | `e2e/overflow.spec.ts:42-46`                                                                        | Four verified-correct widths protected                                | Suite green at 7 widths (sample paths to control runtime)                                                | —                  | **S**  |
| **R2.7**  | P3  | Fix `White-label разработка` hyphenation                           | `services-catalogue.content.ts:269`                                                                 | Consistent Russian compound                                           | R2.3 passes for this group                                                                               | R2.3               | **S**  |
| **R2.8**  | P3  | Fix the single Armenian Latin-period outlier                       | dictionary identified by the scan                                                                   | 348/348 Armenian terminators correct                                  | A spec asserting Armenian sentences end with `։` passes                                                  | —                  | **S**  |
| **R2.9**  | P2  | _(new)_ Fix the flaky portfolio focus test                         | `e2e/our-work.spec.ts:156`                                                                          | The e2e suite becomes a usable merge signal                           | 20 consecutive runs pass on an unmodified tree; no fixed `waitForTimeout` used                           | —                  | **S**  |
| **R2.10** | P2  | _(new)_ Make `verify:images` check declared dimensions             | `scripts/verify-images.mjs`, `scripts/verify-images.test.mjs`                                       | The gap that hid `DATA-001` is closed                                 | Gate exits 1 when a declared `width`/`height` disagrees with the file; covered by a script test          | —                  | **S**  |

### Phase 3 — Mid-term improvements (architecture, scalability, performance, testing)

| ID       | Pri | Task                                                                   | Files                                                                                                         | Expected outcome                                   | Acceptance criteria                                                                                          | Depends on | Effort |
| -------- | --- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- | ------ |
| **R3.1** | P3  | Defer below-fold illustrations with `@defer (on viewport)`             | `hero/illustration/*`, `what-we-build/illustration/*`, `start-conversation/art/*`, `ai-automation/pipeline/*` | Smaller initial route payload, faster LCP          | `verify:bundle` shows reduced initial payload within the 240 kB budget; `verify:prerender` still 87 pages    | —          | **M**  |
| **R3.2** | P3  | Replace 39 individual icon fetches with a sprite or inlined symbol set | `core/icons/provide-app-icons.ts`, `public/icons/`                                                            | Fewer requests on icon-dense pages                 | `/our_work` request count materially below 33; `e2e/icons.spec.ts` passes                                    | —          | **M**  |
| **R3.3** | P3  | Enable `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`     | `tsconfig.json` + fallout                                                                                     | Indexed access and optional properties proven safe | `npm run typecheck` passes with both flags on                                                                | —          | **M**  |
| **R3.4** | P3  | Add coverage measurement and a threshold                               | `vitest-base.config.ts`, `ci.yml`                                                                             | Test gaps become visible                           | Coverage reported in CI; a threshold set at or just below the current level and enforced                     | —          | **S**  |
| **R3.5** | P3  | Unit-test the three genuinely untested shared units                    | `page-intro.ts`, `document-meta-override.ts`, `contact-submitter.ts`                                          | Shared UI logic covered                            | `page-intro`'s `copyLead`/`asideLead` branches covered                                                       | R3.4       | **S**  |
| **R3.6** | P3  | Extract `ProjectCard`'s flip behaviour into a tested helper            | `products/project-card/project-card.ts:46-111`                                                                | Interaction logic comprehensible and unit-tested   | Hover-open, focus-open, Escape-dismiss, tap-toggle and focus-out-close each covered; touch spec still passes | —          | **M**  |
| **R3.7** | P3  | Manually resolve the `color-contrast` incomplete results               | pages listed in §3.11                                                                                         | Contrast status known rather than unverified       | Every incomplete node measured; any failure fixed or documented as conforming                                | —          | **M**  |
| **R3.8** | P3  | Make the `audit` CI job blocking, or triage its 9 advisories           | `ci.yml:35-45`                                                                                                | Dependency risk tracked rather than ignored        | `continue-on-error` removed, or a documented allowlist with review dates                                     | —          | **S**  |

### Phase 4 — Long-term improvements (architecture, design system, maturity)

| ID       | Pri | Task                                                                   | Expected outcome                                                                                       | Acceptance criteria                                                                       | Effort |
| -------- | --- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------ |
| **R4.1** | P3  | Introduce `clamp()` for `display-hero`, `display-page` and `body-lead` | Fluid type across 430–1199 px instead of one step at 1200 px                                           | `e2e/type-scale.spec.ts` updated and green; no overflow regression at any of the 7 widths | **M**  |
| **R4.2** | P3  | Adopt container queries for card components                            | Cards adapt to their grid track, not the viewport                                                      | `ServiceCard`/`ProjectCard` render correctly in every track width they occupy             | **M**  |
| **R4.3** | P3  | Evaluate `NgOptimizedImage` for the product gallery                    | Framework-managed `srcset`/`sizes`/priority; a hand-copied asset can no longer produce a 404 candidate | `verify:images` and the gallery e2e specs pass unchanged                                  | **M**  |
| **R4.4** | P3  | Document the design system (tokens, mixins, component inventory)       | Onboarding and consistency as the site grows                                                           | A `docs/design-system.md` enumerating every `--nx-*` token and its intended use           | **M**  |
| **R4.5** | P3  | Add scroll affordances to horizontal scroll regions                    | Discoverable internal scrolling on non-touch devices                                                   | Fade edge or hint on the comparison table and gallery strip; no overflow regression       | **S**  |
| **R4.6** | P3  | Establish field RUM for real Core Web Vitals                           | Replace lab estimates with field data                                                                  | LCP/CLS/INP reported from real users across all three locales                             | **L**  |
| **R4.7** | P3  | Native-speaker review of Armenian and Russian copy                     | The one localisation dimension this audit could not verify                                             | Both languages reviewed by a native professional; findings logged                         | **M**  |

> No calendar timelines are given. Effort sizes reflect implementation scope only; there is insufficient information about team size and availability to estimate delivery dates responsibly.

---

## 9. Testing & Verification Plan

For each category: what must be verified, with which tool, which scenarios, the expected result, and the pass criterion.

### 9.1 TypeScript

- **Verify:** all four projects compile under strict settings, including after R3.3.
- **Tool:** `npm run typecheck` (`tsc -p` × 4, preceded by `intlayer build`).
- **Scenarios:** app, spec, e2e, scripts; with and without `noUncheckedIndexedAccess`.
- **Expected:** no diagnostics.
- **Pass:** exit 0.

### 9.2 ESLint

- **Verify:** no lint errors; no deprecated API reaches the codebase.
- **Tool:** `npm run lint` (`ng lint` + `lint:deps` + `lint:styles`).
- **Scenarios:** TS, inline and external templates, `scripts/*.mjs`; confirm `@typescript-eslint/no-deprecated` still has type information (it degrades silently without `intlayer-types/`).
- **Expected:** "All files pass linting"; "no dependency violations found".
- **Pass:** exit 0 and dependency-cruiser reports 0 violations.

### 9.3 Prettier

- **Verify:** formatting is canonical.
- **Tool:** `npm run format:check`.
- **Pass:** exit 0.

### 9.4 Stylelint

- **Verify:** BEM naming, no `!important`, no shadow-piercing selectors, no duplicate selectors.
- **Tool:** `npm run lint:styles`.
- **Pass:** exit 0.

### 9.5 Unit tests

- **Verify:** all behavioural and contract assertions.
- **Tool:** `npm test` (Vitest 4).
- **Scenarios:** the existing 491, plus the new consistency spec (R2.3) and the shared-unit specs (R3.5). Must include: every product has one alt per photograph in every locale; every component resolves to OnPush; every `@Component` under `src/app` is registered in `change-detection.spec.ts`.
- **Expected:** 491 → ~500 tests.
- **Pass:** **0 failures.** This is currently not met.

### 9.6 Integration tests

- **Verify:** composed behaviour across the DI graph.
- **Tool:** Vitest with `TestBed`.
- **Scenarios:** contact submission end-to-end through `HttpContactSubmitter` for `sent` / `not-configured` / `failed` / field-rejected; `DocumentMetaOverride` set and cleared by `ProductDetail` across navigations; locale switching preserving route and scroll.
- **Pass:** 0 failures; `DocumentMetaOverride` is `undefined` after leaving a product page.

### 9.7 End-to-end tests

- **Verify:** real user journeys in a real browser.
- **Tool:** `npm run e2e` (chromium + webkit + mobile-chrome) and `npm run e2e:prerendered`.
- **Scenarios:** all 37 existing specs; the tap-to-flip card on the Pixel 7 project; deep links into prerendered documents.
- **Pass:** 0 failures across all three projects.

### 9.8 Responsive tests

- **Verify:** no document-level horizontal overflow, in any locale, at any supported width.
- **Tool:** `e2e/overflow.spec.ts` extended per R2.6.
- **Scenarios:** 320, 375, 390, 430, 768, 840, 1024, 1440, 1920 px × `en`/`hy`/`ru`; paths drawn from `sitemap.xml` plus the three 404 paths.
- **Expected:** `documentElement.scrollWidth - clientWidth === 0`.
- **Pass:** 0 failures. Elements inside declared `overflow-x: auto` containers are not failures and must not be asserted against.

### 9.9 Accessibility tests

- **Verify:** WCAG 2.2 AA conformance to the extent automation can establish it.
- **Tool:** `@axe-core/playwright` with `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`.
- **Scenarios:** all 12 current pages × 3 locales at 1440 and 390 px, **plus all 19 product pages** (R2.4). Manual: full keyboard traversal of header menu, contact form, gallery lightbox and portfolio card; screen-reader pass over the gallery; manual contrast measurement of the axe-incomplete nodes (R3.7).
- **Expected:** `violations` is `[]`; `target-size` continues to pass.
- **Pass:** 0 violations on every page/locale; `button-name` specifically 0 on all 19 products.

### 9.10 Localization tests

- **Verify:** completeness, placeholder parity, terminology consistency, Armenian punctuation.
- **Tool:** Vitest specs over the dictionaries (`dictionary-keys.spec.ts` plus R2.3).
- **Scenarios:** all 1,196 entries carry `en`/`hy`/`ru`; placeholders identical across locales; each English source maps to one HY and one RU string; Armenian sentences end with `։`; locale switching preserves route and scroll; hreflang matches the sitemap.
- **Expected:** currently 0 missing keys, 0 placeholder mismatches, **24 consistency failures**, 1 punctuation outlier.
- **Pass:** all four checks at 0.

### 9.11 Production build

- **Verify:** the build is deterministic and within budget.
- **Tool:** `npm run build`, then `verify:prerender`, `verify:seo`, `verify:headers`, `verify:bundle`, **`verify:images`**.
- **Scenarios:** cold build; build immediately after `npm test`; ten consecutive builds (R1.6).
- **Expected:** "Prerendered 87 static routes"; initial total under the 560 kB warning; worst route under 240 kB gzip.
- **Pass:** all six commands exit 0, ten times in a row.

### 9.12 SEO verification

- **Verify:** metadata, canonicals, hreflang, structured data, sitemap and indexability.
- **Tool:** `npm run verify:seo`, `npm run verify:prerender`, plus `verify:live-seo` against a deployed origin.
- **Scenarios:** 87 documents; title uniqueness; canonical/hreflang agreement; `x-default`; JSON-LD validity; 404 returns status 404; `CreativeWork` nodes match product data (R1.4).
- **Expected:** "87 documents: unique titles, canonical and hreflang agree, 84 indexable and in the sitemap, 3 noindex".
- **Pass:** exit 0, and JSON-LD passes an external structured-data validator.

### 9.13 Performance verification

- **Verify:** payload budgets and laboratory vitals; then field vitals.
- **Tool:** `npm run verify:bundle`, `npm run verify:images`, Playwright + CDP under Slow-4G with 4× CPU throttling, and — for the real answer — field RUM (R4.6).
- **Scenarios:** every route's gzip weight; per-page image payload; LCP and CLS on `/`, `/our_work`, each product page, `/contact`, and the `hy`/`ru` equivalents; a capture confirming zero 4xx responses.
- **Expected (lab, current):** LCP 1.2–1.6 s, CLS ≤ 0.013, worst route 223.7 kB gzip.
- **Pass:** bundle and image budgets met; zero 4xx; lab LCP under 2.5 s and CLS under 0.1. **Field CWV must be measured before any claim about real-user Core Web Vitals is made.**

---

## 10. Final Assessment

### Overall Nexora score: **8.5 / 10** _(as audited, before remediation: 7.8 / 10)_

### Current quality level

**Strong — an engineering culture well above the average for a site of this size.** The architecture, type discipline, design system and test philosophy are what one would expect from a good senior or staff team: constraints are enforced by machines rather than convention, and the code comments record _why_ a rule exists by naming the incident that motivated it. On its structural merits this codebase scores 9.

**As audited** it came in at 7.8, because an audit scores the state of a project rather than the quality of its intentions, and that state had a red test suite, a broken page in the production output, and a safety net that had been built but never attached. All three have since been fixed and verified (§1.1), and the flaky e2e tests with them (§1.2), which is what moves the figure to 8.5.

It is not higher because two things remain true. The build is still not reproducible — it fails intermittently on unchanged inputs (`BUILD-001`), now the single largest obstacle to trusting this pipeline, and the one Phase 1 item still open. And the copy still disagrees with itself across dictionaries in 24 places (`I18N-001`), including the primary call to action.

### Production readiness: **Ready to ship, with a caveat about CI rather than about the product**

Both P0 issues and three of the four P1s are closed and verified. What a release today would carry:

1. **No known user-facing defects.** 491/491 unit tests pass, every verification gate exits 0, axe reports zero violations across all tested pages and locales, and no viewport shows a broken image or a sideways scroll.
2. **A build that cannot yet confirm that on demand.** `npm run build` still fails intermittently on unchanged inputs. The e2e suite no longer has this problem — `our-work.spec.ts` now runs 156/156 repeatably — but until the build is deterministic, a red pipeline still cannot be read at face value.

The distinction matters for the release decision. **Nothing blocks shipping the product.** What is partly blocked is the ability to _prove_, repeatably and without a human reading the logs, that nothing is broken — and that is now `R1.6` alone.

### What the remediation demonstrated about the codebase

Worth recording, because it is evidence about the project rather than about the defect: when the `connected-car` data was wrong, **four independent parts of the repository said so** — the product's own copy in three languages, two unit-test assertions, a documented count in a spec comment, and an e2e link-count test. The data was wrong; the codebase was not confused about it. That density of self-description is the reason a defect of this kind took under a day to diagnose and fix with confidence, and it is the strongest single signal in this report.

### Main risks

1. **A non-deterministic build — now the top risk.** `BUILD-001` fails intermittently on unchanged inputs. It trains a team to re-run rather than investigate, and a pipeline that cries wolf eventually hides a real failure. The e2e half of this risk is closed (§1.2); the build half is not, and it is the only Phase 1 item left.
2. ~~**Process risk.** A finished verification tool sat outside CI.~~ — **CLOSED.** `verify:images` now runs in the pipeline and was confirmed to fail on a missing variant.
3. **Sampling blindness.** Testing 2 of 19 data-driven pages means per-product data errors are invisible by construction. This audit found one that way; the sampling gap is the reason it survived to a built artifact. **Still open** — the fix was to the data, not to the sample.
4. **Gates that trust their inputs.** `verify:images` validates the files but not the registry describing them (`TEST-004`), which is how three wrong dimensions passed every check. A gate that cannot see a whole class of error is worth less than its green tick suggests.
5. **Terminology drift in HY/RU.** Not a technical fault, but on a site selling engineering rigour to an international B2B audience, a footer link that disagrees with the page it opens is read as carelessness.
6. **Unverified contrast.** 5–31 nodes per page that axe could not evaluate. Not a known failure — but also not a known pass, and it is the one accessibility dimension still open.

### Five most important recommendations

_Items 1 and 2 of the original five are done (§1.1), as is the flaky-test item (§1.2). These are the five that matter now._

1. **Make the build deterministic** (R1.6). Until a build either always passes or always fails, every other gate's result is provisional — including the green ones in this report. This is now the only open Phase 1 item.
2. **Guard the gallery's scroll lock** (`TEST-006`). A one-line early return. Latent rather than observed, but the failure mode — a visitor left unable to scroll — is bad enough to be worth closing cheaply.
3. **Extend accessibility and e2e coverage to all 19 product pages** (R2.4). The current sample covers control-flow branches but not data completeness, and data is what drifts. This remains exactly as true after the fix as before it.
4. **Teach `verify:images` to check declared dimensions** (R2.10). `sharp` is already a dependency and the script already has a test harness; this closes the gap that hid `DATA-001`.
5. **Add the translation-consistency spec, then converge the 24 groups** (R2.3, R2.2). Write the test first so the cleanup is verifiable and the drift cannot return.

### What it would take to reach 9–10 / 10

**To reach 9.0** — complete Phase 1 and Phase 2. That alone moves Functionality 6 → 9, Accessibility 7 → 9, Testing 6 → 8 and Localization 7 → 8, lifting the mean to roughly **8.6**. Adding R3.1 (deferred illustrations), R3.4 (coverage), R3.7 (contrast resolution) and R2.6 (full-width regression sweep) carries Performance to 8, Testing to 9 and Responsive to 9 — **a mean of about 9.0**.

**To reach 9.5+** — the remaining distance is in dimensions this audit could only partly verify:

- **Field Core Web Vitals** (R4.6). Laboratory numbers cap Performance confidence at Medium. Real-user data across all three locales is the only thing that converts an estimate into a fact.
- **Native-speaker review of Armenian and Russian** (R4.7). Localization cannot honestly exceed 8 while fluency and tone remain unverified, however clean the structure is.
- **Coverage-driven test completion** (R3.4, R3.5) so that "well tested" is a measurement rather than an impression.
- **Design-system documentation** (R4.4) and modern CSS adoption — `clamp()` and container queries (R4.1, R4.2) — to take Styling from excellent-but-stepped to genuinely fluid.
- **Sustained determinism**: ten consecutive green pipelines, and a `main` branch that has not been red since.

The gap between 7.8 and 9.5 here is unusually small in engineering terms and unusually clear in direction. Almost none of it is rework; nearly all of it is finishing work that was correctly scoped and then left incomplete.

---

## Appendix A — Audit scope and method

**Read-only compliance.** No source file, stylesheet, dictionary, configuration file, lock file or dependency was modified. No git operation beyond `status`, `log` and `branch --show-current` was performed. No commit was created. `git status --porcelain` was empty at audit start and at audit end.

**Artifacts written outside the project.** All analysis scripts and logs were written to the session scratchpad at `C:\Users\xXx\AppData\Local\Temp\claude\39dbc2457dd9d5bc\9b233f88-c1f5-445f-a1b0-260fbaae692e\scratchpad`, never into the repository.

**Generated directories touched.** `npm run build`, `npm test`, `npm run lint` and `npm run typecheck` regenerate `dist/`, `.intlayer/` and `intlayer-types/`. All three are listed in `.gitignore` and are build outputs, not source. The first build attempt failed and cleared `dist/`; the second rebuilt it in full (87 prerendered routes), so `dist/` is in a complete, current state.

**Commands executed:** `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test` (×2), `npm run test:scripts`, `npm run build` (×2), `npm run verify:prerender`, `npm run verify:bundle`, `npm run verify:images`, `npm run verify:headers`, `npm run verify:seo`, `npm audit`, `npm outdated`, `npx playwright test e2e/a11y.spec.ts e2e/overflow.spec.ts --project=chromium`, plus purpose-written read-only Playwright and Node scripts for the 7-viewport sweep, the axe deep-dive, the performance measurements and the 1,196-entry translation scan.

**Evidence standard.** Every finding in this report cites a command's output, a file and line, or a measurement taken during the audit. Where a root cause could not be established it is marked **Cannot Determine** (BUILD-001). Where a condition could not be verified it is marked **unverified** and excluded from any pass/fail claim (A11Y-002 contrast; Armenian and Russian fluency; field Core Web Vitals; INP). No issue in this report is hypothetical, and no line number was invented.

**Corrections made during the audit.** Two initial hypotheses were investigated and disproved rather than reported: (1) that the Armenian font file was missing — it is present, correctly declared, and covered by a dedicated e2e contract; (2) that the widespread `alt=""` on project cards and "next product" covers indicated an accessibility defect — those images are decorative, with the accessible name carried by adjacent text and `aria-label`, which is the correct pattern. Both are recorded here because an audit that reports only its confirmed suspicions is not showing its work.
