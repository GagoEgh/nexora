# Nexora — Technical Audit Report

**Auditor role:** Staff / Principal Angular Engineer (independent technical audit)
**Project:** `C:\Users\xXx\Desktop\Nexora`
**Audit date:** 2026-11-05
**Commit audited:** `7bada76` ("update settings"), working tree clean
**Framework:** Angular 22.2.3 · TypeScript 6.0.3 · Node 24.22.0

> **Source code was not modified.** Every finding below is derived from reading the source and
> from running the project's own verification tooling plus a read-only browser harness kept
> outside the repository. `git status --porcelain` was empty before and after the audit.

---

## 1. Executive Summary

Nexora is a three-locale (English / Armenian / Russian) marketing website for an IT services
company, built as a statically prerendered Angular 22 application. It is **3,123 lines of
production TypeScript** backed by **685 automated tests** and **8 independent CI quality gates**,
all of which pass on the audited commit.

This is an unusually disciplined codebase. The findings that matter are not the usual enterprise
complaints — there is no god component, no `any`, no leaked subscription, no circular dependency,
no `!important`. The architecture is not merely declared in a README; it is **enforced mechanically**
by eight dependency-cruiser rules that cruise 183 modules and 518 dependencies with zero violations.
Several conventions that are normally left to reviewer memory (change-detection strategy, BEM class
shape, CSP script hashes, the contact API payload) are pinned by executable assertions.

The defects that do exist are concentrated in three narrow places:

1. **Two live horizontal-overflow bugs** at 320px viewport width in Armenian only — measured, with
   the root cause isolated to a single mechanism (non-wrapping Angular Material chip labels). The
   project's own overflow regression test covers 390px and 840px, so 320px slips through.
2. **Four call sites using a deprecated API overload** (`readonly(path, fn)` in the contact form),
   which neither `tsc` nor ESLint reports as an error.
3. **Two factual drifts in the project's own documentation.** This matters more here than in an
   average codebase, because this project's quality model depends on its comments being
   trustworthy — they are written as measured claims, and two of them are no longer true.

**Overall score: 9 / 10.** The engineering quality of the architecture, typing and test strategy is
at or near reference level. The deductions are real but narrow, and none of them are architectural.

One point of context that is a product limitation rather than a code defect: **the contact form
cannot submit in production**, because `apiOrigin` ships empty and the backend is not deployed. This
is a deliberate, documented decision with a guard test protecting it (§14.5), not an oversight.

---

## 2. Project Overview

### Framework and dependency versions (verified from `node_modules`, not just `package.json`)

| Package                         | Declared          | Installed      | Note                                      |
| ------------------------------- | ----------------- | -------------- | ----------------------------------------- |
| `@angular/core`                 | `^22.2.3`         | **22.2.3**     |                                           |
| `@angular/material` / `cdk`     | `^22.2.3`         | 22.2.3         |                                           |
| `@angular/ssr`                  | `^22.2.4`         | —              | static prerender (`outputMode: "static"`) |
| `typescript`                    | `~6.0.0`          | **6.0.3**      |                                           |
| `intlayer` / `angular-intlayer` | `^9.7.0`          | 9.6.0 at build | localization                              |
| `vitest`                        | `^4.0.8`          | 4.1.12         | unit runner                               |
| `@playwright/test`              | `1.64.1` (pinned) | 1.64.1         | e2e                                       |
| `zone.js`                       | **absent**        | absent         | application is zoneless                   |

`zone.js` appears in neither `package.json` nor `angular.json` (there is no `polyfills` entry), and
the README states zoneless change detection. Confirmed: the application runs without Zone.js.

### Codebase size

| Category                                           | Files |     Lines |
| -------------------------------------------------- | ----: | --------: |
| Production TypeScript (excl. specs, excl. content) |     — | **3,123** |
| Localized content dictionaries (`*.content.ts`)    |    50 |     5,225 |
| Unit specs                                         |    43 |     6,422 |
| E2E specs                                          |    31 |     8,854 |
| SCSS                                               |    86 |     8,264 |
| HTML templates                                     |    64 |     2,163 |
| Build / verification scripts (`.mjs`)              |     6 |    ~1,600 |

**Test-to-production-code ratio: ≈ 4.9 : 1** (15,276 lines of test code against 3,123 lines of
application logic).

### Structure

```
src/app/
  core/        i18n (locale routing, switcher, path pipe) · icons · routing/paths · seo
  layout/      header · footer
  pages/       home · services · ai-agent · solutions · about ·
               engagement-models · partnerships · contact · not-found
  shared/      motion (reveal directive, scroll helper) · services-catalogue · ui/ (7 components)
  app.config.ts / app.routes.ts            ← composition root
src/styles/    tokens/ · mixins/ · theme/  ← design system
```

66 components, 1 directive (`Reveal`), 1 pipe (`LocalizedPathPipe`). One component per file. Every
component is standalone (no `NgModule` anywhere in the project).

### Build system

`@angular-builders/custom-esbuild:application` with a custom esbuild plugin hook, producing a
**static** output (`outputMode: "static"`, 27 prerendered routes = 9 pages × 3 locales). Production
budgets: 560 kB initial warning / 1 MB error, 5 kB / 8 kB per component stylesheet.

### Testing and quality tooling

Vitest (unit), Playwright + `@axe-core/playwright` (e2e + accessibility), ESLint + angular-eslint,
Stylelint (`stylelint-config-standard-scss` + 14 measured overrides), Prettier, dependency-cruiser
(architectural layering), plus two bespoke verification scripts (`verify-prerender`,
`verify-headers`) and a pre-commit formatting hook.

### Architectural approach

Layered: `core ← shared ← layout ← pages`, with `app.config.ts` / `app.routes.ts` as the composition
root above all layers. Signals-first and zoneless; RxJS retained only at the three points where the
Router's event stream is genuinely a stream. Content is co-located with components as sibling
`*.content.ts` dictionaries.

---

## 3. Overall Technical Score

# 9 / 10

**Reasoning.** A score of 9 ("excellent — high engineering quality") requires more than a successful
build and modern APIs, which the brief explicitly rules out as justification. The grounds here are
verified properties, not impressions:

- **Every quality gate passes on the audited commit** — reproduced locally, not taken from CI
  badges: Prettier clean; ESLint clean; dependency-cruiser 0 violations across 183 modules;
  Stylelint clean; `tsc --noEmit` clean across all four tsconfig projects; 43 script tests; 280 unit
  tests; production build succeeds; 27 pages verified navigable without JavaScript; CSP inline-script
  hashes verified against the actual build output.
- **Zero type-safety escape hatches in production code.** Across the whole repository there are no
  occurrences of `any`, `as any`, `<any>`, `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, or
  non-null assertions. The eight `as unknown as` casts are all confined to spec files reaching
  framework internals, which is their legitimate use.
- **Architecture is enforced, not aspirational.** Eight dependency rules including a `no-circular`
  check with `tsPreCompilationDeps: true` (so type-only cycles are caught too).
- **Conventions are pinned by executable assertions** rather than review habit — including one spec
  (`change-detection.spec.ts`) that walks the source tree so it cannot silently fall out of date.

**Why not 10.** Ten requires near-reference-level with essentially nothing to fix. There are two
reproducible layout defects at a supported viewport width (§10.3), four uses of a deprecated API
overload (§7.3), a measurable waste in font preloading on 18 of 27 prerendered pages (§12.4), and —
most consequentially for a codebase whose quality rests on documented, measured rationale — two of
those documented claims have drifted out of truth (§6.2, §7.4).

**Why not 8.** The defect inventory after a deep pass is short, shallow, and entirely localized.
Nothing found requires architectural rework; the heaviest item is a CSS one-liner plus a widened
test range.

---

## 4. Detailed Scorecard

| Category          |    Score | Evidence                                                                                                                                                                                                                                                                                     | Main Problems                                                                                                                                                                      |
| ----------------- | -------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code Quality      | **9**/10 | 3,123 LOC production TS; largest file 219 lines; 0 `any` / `@ts-ignore` / non-null assertions / `eslint-disable`; 0 lifecycle hooks; ESLint + Prettier clean                                                                                                                                 | Documentation drift in `.stylelintrc.cjs`; 1 dead icon shipped                                                                                                                     |
| Architecture      | **9**/10 | `core←shared←layout←pages` enforced by 8 depcruise rules, **0 violations / 183 modules / 518 deps**; type-only cycles covered; DI via `InjectionToken` + factories                                                                                                                           | `document-meta.ts` concentrates all SEO logic in one 188-line provider closure, making its parts individually untestable                                                           |
| Design Patterns   | **9**/10 | Null Object (`ContactSubmitter`), Strategy-by-DI, Container/Presentational (`Services` vs `FilterBar`/`CategoryNav`), Facade (`useLocaleSwitcher`), Adapter (`toConversationCopy`, `pageCrumbs`), Factory (token factories)                                                                  | Patterns are sound; the one over-concentration is the SEO closure above                                                                                                            |
| Angular 22        | **9**/10 | All 66 components resolve to OnPush (verified against compiled defs); zoneless; signals-first; 0 lifecycle hooks; functional guards; lazy routes; `@defer` with working no-JS placeholders; `takeUntilDestroyed` on all 3 subscriptions                                                      | 4 call sites use the **deprecated** `readonly(path, fn)` overload; `@defer` used only `on immediate`, never for below-fold content                                                 |
| TypeScript        | **9**/10 | `strict` + `noImplicitOverride` + `noPropertyAccessFromIndexSignature` + `noImplicitReturns` + `noFallthroughCasesInSwitch` + `strictTemplates` + `strictInjectionParameters` + `strictInputAccessModifiers`; typecheck clean on 4 projects; type guards + const-assertion unions throughout | `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` not enabled — the two remaining strictness flags                                                                       |
| SCSS / CSS        | **9**/10 | Token system with build-time validation (`@error` on unknown token); **0 `!important`**, **0 `::ng-deep`**, **0 ID selectors** (all lint-enforced); max nesting depth 4; flat BEM enforced by regex; reduced-motion handled at the token layer; every one of 14 mixins used                  | Chip labels not wrapped → root cause of the 320px overflows; stylelint header documents a mixin that no longer exists                                                              |
| Responsive Design | **7**/10 | **Measured**: 243 combinations (9 widths × 3 locales × 9 pages), 320→2560px. 241 clean                                                                                                                                                                                                       | **2 real overflows**: `/hy` home +20px and `/hy/contact` +9px at 320px. Project's own overflow spec only covers 390/840px                                                          |
| Component Design  | **9**/10 | 66 components, largest 219 lines; `input.required` × 30; clean smart/dumb split; `Home` is pure composition                                                                                                                                                                                  | `Header` keeps two mutable non-signal counters for menu state; `focusFirstInvalid` queries Material's internal `.mat-mdc-select` class                                             |
| Performance       | **8**/10 | **Measured**: initial 499.48 kB raw / **125.25 kB transfer**; 21 lazy chunks; 27 prerendered routes; fonts subset by `unicode-range` + `swap` + preload; critical CSS inlined; no leaks found                                                                                                | 476.79 kB raw main chunk is heavy for a brochure site; home chunk loads 8 sections eagerly; **wrong font preloaded on 18 of 27 pages**; no Core Web Vitals measured (NOT VERIFIED) |
| Testing           | **9**/10 | **280 unit (43 files) + 362 e2e (31 files) + 43 script tests, all passing**; axe-core WCAG 2.1 AA across all 27 page/locale pairs plus error and mobile-open states; API contract spec; no-JS prerender gate; CSP hash gate                                                                  | **Chromium only** — no Firefox/WebKit for a public site; 320px untested; unit-test builder emits an explicit unsupported-configuration warning                                     |
| Maintainability   | **9**/10 | Rationale-rich comments that record _why_ and cite measurements; single-source tokens; conventions machine-enforced; contract tests between repos                                                                                                                                            | Two documented claims have drifted false — costly specifically because this codebase's model relies on comment trustworthiness                                                     |
| Scalability       | **8**/10 | Layering enforced; lazy per-route chunks; feature isolation verified; token system single-sourced                                                                                                                                                                                            | 5,225 lines of copy compiled into the bundle (a 4th locale or CMS means rework); adding a page touches 4 coordinated files (compile-time enforced, so safe, but multi-step)        |

---

## 5. Architecture Analysis

### 5.1 Layering is mechanically enforced — verified

`.dependency-cruiser.cjs` encodes the layering as eight `forbidden` rules. This is the single most
significant architectural fact about the project: the boundaries cannot erode silently.

```
✔ no dependency violations found (183 modules, 518 dependencies cruised)
```

_(reproduced locally via `npm run lint:deps`)_

The rules, and what each prevents:

| Rule                              | Guards                                                              |
| --------------------------------- | ------------------------------------------------------------------- |
| `no-circular`                     | Cycles, **including type-only ones** (`tsPreCompilationDeps: true`) |
| `core-is-independent`             | `core/` importing `shared`/`layout`/`pages`                         |
| `shared-is-independent`           | `shared/` importing `layout`/`pages`                                |
| `layout-does-not-know-pages`      | Header/footer importing a page                                      |
| `pages-do-not-cross-import`       | One page reaching into another                                      |
| `route-table-is-composition-only` | Anything importing `app.routes.ts`                                  |
| `content-files-are-leaves`        | A `*.content.ts` importing a component                              |

`tsPreCompilationDeps: true` deserves specific credit. Most projects that run dependency-cruiser see
only runtime imports and therefore miss type-only cycles entirely; the config comment states these
are precisely the cycles this codebase has actually hit. The rule is calibrated to observed failure,
not to a generic template.

**Verified:** no circular dependencies. **Verified:** Dependency Inversion is respected at the one
place it matters — `app.config.ts:25` binds the abstraction to the implementation
(`{ provide: ContactSubmitter, useClass: HttpContactSubmitter }`), and `ContactForm` depends only on
the abstract `ContactSubmitter`.

### 5.2 Business logic placement

Checked against the brief's question "whether UI components contain business logic". The split is
clean:

- **Containers** own routing state and side effects: `Services` (query-param filter +
  IntersectionObserver), `Solutions` / `EngagementModelsPage` (scroll restoration on `Scroll`
  events), `ContactForm` (form schema + submission).
- **Presentational components** take `input.required` and emit `output` — `FilterBar`,
  `CategoryNav`, `ServiceCard`, `IconTile`, `FieldLabel`, `PageIntro`, `ChipSelect`. None injects a
  router or a service.
- **`Home` (`home.ts:42`) is `export class Home {}`** — an empty class whose only job is composing
  eight sections. That is the correct shape for a page shell and is a good signal about the
  project's discipline.

Domain logic that is neither UI nor transport lives in plain functions outside components:
`service-category.ts` (type guards, id derivation), `ordinal.ts`, `scroll-to-section.ts`,
`api-origin.ts` (`normalizeOrigin`, `isUsableOrigin`), `pageCrumbs`, `toConversationCopy`. These are
trivially unit-testable and several are directly tested.

### 5.3 Dependency injection

Modern and idiomatic throughout: 38 `inject()` calls in production code, **zero constructor
parameter injection**.

- `API_ORIGIN` and `SITE_ORIGIN` are `InjectionToken`s with `providedIn: 'root'` factories that
  validate their input (`api-origin.ts:24-30`, `site-origin.ts:14-23`). Configuration is validated
  at the injection boundary rather than trusted at the point of use.
- `provideAppIcons()` returns `EnvironmentProviders` via `provideAppInitializer` — correct Angular 22
  functional-provider style.
- `provideDocumentMeta()` uses `provideEnvironmentInitializer`.
- Component-scoped providers are used where the scope is genuinely local:
  `contact-form.ts:96-99` provides `MAT_FORM_FIELD_DEFAULT_OPTIONS` and `provideSignalFormsConfig`
  on the component, not globally. This directly answers the brief's "global services where local
  state would be sufficient" question in the project's favour.

### 5.4 API and transport layer

Three-layer separation around a 9-page brochure site, which is proportionate rather than
over-engineered:

1. `ContactInquiry` / `ContactSubmitResult` / `ContactSubmitStatus` — the contract
   (`contact-submitter.ts:3-21`), all fields `readonly`.
2. `ContactSubmitter` — an injectable **Null Object** returning `'not-configured'`
   (`contact-submitter.ts:23-29`).
3. `HttpContactSubmitter` — the real transport, swapped in at the composition root.

Error handling collapses every transport and protocol outcome into three visitor-facing states, while
preserving diagnostic detail for the log:

```ts
// http-contact-submitter.ts:45-52
this.errorHandler.handleError(
  error instanceof HttpErrorResponse
    ? new Error(
        `Contact API ${error.status === 0 ? 'unreachable' : `rejected the inquiry (HTTP ${error.status})`}: ${error.message}`,
        { cause: error },
      )
    : error,
);
```

This is better than typical: `status === 0` (transport failure) is distinguished from a protocol
rejection in the log while deliberately presenting one state to the visitor, `{ cause: error }`
preserves the chain, and the whole thing routes through Angular's `ErrorHandler` rather than
`console.error`.

In-flight submissions are coalesced by a promise latch (`http-contact-submitter.ts:31-33`), so a
visitor cannot double-submit. `provideBrowserGlobalErrorListeners()` is registered in
`app.config.ts:16`.

### 5.5 The one genuine architectural weakness

`src/app/core/seo/document-meta.ts` is a 188-line module whose entire behaviour lives inside a single
`provideEnvironmentInitializer` callback (lines 59–187), with four nested helper closures (`link`,
`jsonLd`, `breadcrumbItems`, and the main `effect`). It does six distinct jobs: route→page
resolution, title/meta tags, canonical URL, `hreflang` alternates, JSON-LD `@graph` assembly, and
breadcrumb construction.

**Why it is a problem.** None of the six pieces can be unit-tested in isolation — the only way in is
to install the whole initializer and inspect the resulting DOM. `breadcrumbItems` and the JSON-LD
graph builder are pure-ish transformations that would be straightforward to test directly if they
were module-level functions taking their inputs as parameters. The file's own exported helpers
(`pagePath`, `isDocumentMetaPage`) demonstrate the pattern the rest of the file does not follow.

**Consequence.** SEO regressions surface only through a full-DOM integration test, and the
structured-data output — the part most likely to be changed by a non-author and most expensive to
get wrong — has the weakest test seam in the codebase.

**Recommendation.** Lift `breadcrumbItems` and the `@graph` assembly to exported pure functions
taking `(page, locale, origin, content)` and returning data; keep the initializer as thin wiring.
See P2-1.

---

## 6. Code Quality Analysis

### 6.1 Strengths, with evidence

**Type-safety hygiene is absolute.** Scanning all of `src/`, `e2e/` and `scripts/`:

| Pattern                          |                   Occurrences |
| -------------------------------- | ----------------------------: |
| `: any`, `as any`, `<any>`       |                         **0** |
| `@ts-ignore`, `@ts-expect-error` |                         **0** |
| `eslint-disable` (any form)      |                         **0** |
| Non-null assertion (`x!.y`)      |                         **0** |
| `as unknown as`                  | 8 — **all in spec/e2e files** |
| `innerHTML`, `document.write`    |                         **0** |

The absence of `eslint-disable` anywhere is notable: it means no rule has been locally silenced to
make code pass, which is the usual way a clean lint report becomes meaningless.

**No lifecycle hooks at all.** `ngOnInit`, `ngOnDestroy`, `ngAfterViewInit`, `ngOnChanges`: zero
occurrences across 66 components. State is derived (64 `computed`), and teardown is handled by
`takeUntilDestroyed()` (6), `DestroyRef.onDestroy` (2) and `effect`'s `onCleanup` (1). This is what a
fully signal-migrated Angular codebase actually looks like, as opposed to one that imported `signal`
and kept its hooks.

**File sizes are disciplined.** The largest production file is 219 lines; only three exceed 150.
There is no god component — and notably, the three largest files by raw line count in the whole
repository are _specs_ (685 / 505 / 423 lines), which is the right distribution.

**Comments record rationale and cite measurement.** This is the project's most distinctive quality
practice. Examples:

- `.stylelintrc.cjs` justifies each of 14 rule overrides with a measured count ("All 363 class names
  in `src/` already match this"; "138 of 138 hex literals are six-digit") and explains why
  `no-duplicate-selectors` was re-enabled against the shared config's default — because its absence
  "let nine duplicated selectors through review".
- `app.scss:23` — `/* ':focus' rather than ':focus-visible': off-screen, the link is keyboard-reachable only. */`
  explains a non-obvious deviation in one line.
- `intlayer.config.ts:16-19` records why `typesDir` must not be a dot-directory (Angular's esbuild
  watcher ignores `/**/.*/**`, so type changes never invalidate the cache).
- `change-detection.spec.ts:85-91` explains why a hand-written component list exists and why an
  earlier `toHaveLength(66)` guard was insufficient — it caught deletions but not additions, "the
  one case the list exists for".

These are explanations a future maintainer cannot reconstruct from the code, which is exactly what
comments are for.

### 6.2 FINDING — Documentation drift in `.stylelintrc.cjs` (severity: Low)

**File:** `.stylelintrc.cjs`, lines 11–16 (header comment)

**Claimed:**

> "Coverage gap: stylelint only sees .scss files. **Seven page components keep a five-line inline
> `styles:` block** in their .ts (**six are `@include container.page()`**, home.ts is
> `display: block`). Those are not linted. Grepping only \*.scss once led to **`page()`** being
> misreported as dead code, so when auditing mixin or token usage, search .ts as well."

**Actual, measured:**

| Claim                                  | Reality                                                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Seven components with inline `styles:` | **One** — `src/app/pages/home/home.ts:33`                                                                             |
| Six use `@include container.page()`    | **Zero** — `container.page()` matches nowhere in `src/`                                                               |
| A `page()` mixin exists                | **No such mixin.** `src/styles/mixins/_container.scss` defines exactly three: `section()`, `container()`, `heading()` |

Counts: `styleUrl` appears 65 times, `styles:` once. The other six components were evidently migrated
to external stylesheets and the comment was not updated.

**Why it is a problem.** The comment's operative instruction — "when auditing mixin or token usage,
search .ts as well" — now sends a maintainer looking for a mixin that does not exist, and overstates
the lint coverage gap by 7×. In a codebase that deliberately uses measured comments as a substitute
for tribal knowledge, a stale measurement is worse than no comment, because it will be trusted.

**Consequence.** Low direct risk; erodes confidence in the surrounding (accurate) documentation.

**Recommendation.** Reduce to the true statement: one component (`home.ts`) carries a three-line
inline `:host { display: block }` block, which stylelint does not see. (See P3-1.)

### 6.3 FINDING — Dead icon shipped to production (severity: Low)

**Files:** `src/app/core/icons/icons.ts:23`, `public/icons/minus.svg`

`'minus'` is declared in `APP_ICON_NAMES` and `public/icons/minus.svg` (213 bytes) is copied into the
build, but the name is referenced nowhere outside its own declaration — verified by searching all of
`src/` and `e2e/` for `minus`, which returns only `icons.ts:23`.

All other 35 declared icons are used, and there are no orphan SVGs (36 declared, 36 files, exact
correspondence otherwise). Because icons are fetched lazily by `MatIconRegistry` on first use, the
runtime cost is zero; the cost is 213 bytes of deploy payload and one misleading entry in the
catalogue.

**Recommendation.** Delete the entry and the file, or document why it is held in reserve. (P3-2.)

### 6.4 Duplication and dead code

- **SCSS mixins: no dead code.** All 14 mixins have call sites; usage ranges from 5 (`lift`,
  `visually-hidden`) to 86 (`reveal.item`).
- **Repeated UI patterns are factored, not copy-pasted.** `container.section()` (27 call sites),
  `text.contained()` (49), `surface.outlined()` (28), `reveal.item()` (86) — the recurring
  section/card/animation shapes are mixins, which is why 86 SCSS files average only 96 lines.
- **`no-duplicate-selectors` is lint-enforced**, closing the most common SCSS duplication route.

---

## 7. Angular 22 Best Practices

### 7.1 Change detection — the claim was verified, not accepted

This warranted independent verification because a naive scan is actively misleading: **not one of
the 66 components declares `changeDetection`**, which in Angular ≤21 would mean all 66 run eager
change detection — a critical finding.

It is not a finding. `change-detection.spec.ts:70-91` asserts that Angular 22 compiles an omitted
strategy _to OnPush_. I verified this against the installed framework rather than the project's
comment:

```js
// node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:10343
onPush: componentDefinition.changeDetection !== ChangeDetectionStrategy.Eager,
```

```ts
// node_modules/@angular/core/types/_debug_node-chunk.d.ts:4966-4987
declare enum ChangeDetectionStrategy {
  OnPush = 0, // "NOTE: OnPush is enabled by default."
  Eager = 1,
  Default = 1, // @deprecated Use `Eager` instead.
}
```

`undefined !== 1` is `true`, so an omitted strategy resolves to `onPush: true`. **All 66 components
are OnPush.** Omitting the property is correct for Angular 22, and writing it would be redundant.

The project goes further than relying on this. `change-detection.spec.ts` contains three tests that
(1) pin the enum values so a future framework reversal fails loudly, (2) read `ɵcmp.onPush` off every
compiled component definition, and (3) **walk `src/app` with `readdirSync` and fail if any
`@Component` is missing from the checked list** — so the guarantee covers components that do not
exist yet. The comment at lines 85–91 explains that an earlier length assertion was dropped precisely
because it caught deletions but not additions.

This is the strongest single piece of engineering judgement in the codebase: a framework default that
changed in the current major version is converted from an assumption into an assertion.

**Zoneless** is confirmed by the absence of `zone.js` from `package.json` and of any `polyfills`
entry in `angular.json`. With zoneless + universal OnPush + signal-derived state, the change-detection
posture is optimal.

### 7.2 Signals, DI, routing, templates — all idiomatic

**Signals** (production code): 64 `computed`, 5 `signal`, 3 `effect`, 12 `toSignal`.

The ratio is the point: **state is derived, not synchronized.** All three `effect()` calls are
legitimate DOM side-effects at the edge of the system, not state mirroring — which is the main way
`effect` gets misused:

| Site                   | Purpose                                    | Cleanup                                      |
| ---------------------- | ------------------------------------------ | -------------------------------------------- |
| `app.ts:22`            | `documentElement.lang = locale()`          | n/a (idempotent write)                       |
| `document-meta.ts:118` | title / meta / link / JSON-LD updates      | n/a (idempotent writes)                      |
| `services.ts:160`      | IntersectionObserver over section elements | **`onCleanup(() => observer.disconnect())`** |

`services.ts:154-158` additionally guards the whole effect behind an SSR/feature check
(`document.defaultView` and `'IntersectionObserver' in view`) before registering it.

**DI:** 38 `inject()`, zero constructor injection, `InjectionToken` with validating factories,
`EnvironmentProviders` from functional providers, component-scoped providers where appropriate.

**Routing:** every one of 9 routes is `loadComponent`-lazy. Guards are functional (`CanMatchFn`,
`CanActivateFn` in `locale-routing.ts:15-35`). `canMatch` is used correctly — for the locale-prefix
_match_ decision — rather than abusing `canActivate` for it. Route data is typed:
`data: { meta: 'home' } satisfies DocumentMetaRouteData`, so a page added without a metadata entry
fails `tsc` rather than shipping untitled.

**Templates:** modern control flow only (`@if` / `@for` / `@defer`); every `@for` carries `track`;
no `*ngIf` / `*ngFor` / `ngClass` / `ngStyle` anywhere. Expensive work is kept out of templates —
derived values are `computed` on the class (`servicesActive()`, `visibleGroups()`,
`conversationCopy()`), so no template expression does real work per check.

Two uses of `@defer` in `header.html` (lines 27, 85) deserve specific credit for their
`@placeholder` blocks: instead of a spinner, the placeholder renders a **functional link** — the
services menu degrades to a direct link to `/services`, and the language menu to an anchor to
`#footer-languages`. The prerendered HTML is therefore navigable before any JavaScript executes,
which is also what `verify:prerender` checks across all 27 pages.

**Forms:** `@angular/forms/signals` with a typed schema, `required` / `email` / `maxLength` /
`readonly`, and a `submit()` action. Validation limits are exported constants (`DESCRIPTION_MAX`,
`NAME_MAX`, `COMPANY_MAX`, `EMAIL_MAX`) shared with the contract spec, so client and API cannot drift
silently. A honeypot field (`website`) is documented at its definition
(`contact-submitter.ts:13-14`).

**RxJS:** retained only where the source genuinely is a stream — three `router.events`
subscriptions. **All three use `takeUntilDestroyed()`** (`header.ts:81`,
`engagement-models.ts:58-63`, `solutions.ts:48-53`). The remaining 12 reactive bridges use
`toSignal`, which unsubscribes on destroy by construction. `requireSync: true` is used where a
synchronous initial value is required (`services.ts:86`, `solutions.ts:35`), and an explicit
`initialValue` where it is not (`header.ts:68`, `locale-switcher.ts:20`).

**No memory leaks were identified.** Every subscription and observer in the codebase has a verified
teardown path.

### 7.3 FINDING — Four call sites use a deprecated API overload (severity: Medium)

**File:** `src/app/pages/contact/contact-form/contact-form.ts`, lines **134–137**

```ts
readonly(inquiry.name, () => this.sending());
readonly(inquiry.email, () => this.sending());
readonly(inquiry.company, () => this.sending());
readonly(inquiry.description, () => this.sending());
```

`@angular/forms` 22.2.3 declares two `readonly` overloads
(`node_modules/@angular/forms/types/signals.d.ts:78-100`):

```ts
/** @publicApi 22.0 */
declare function readonly<...>(path: ..., config?: { when?: NoInfer<LogicFn<TValue, boolean, TPathKind>> }): void;

/** @deprecated Passing a function directly to `readonly` is deprecated. Use `{ when: ... }` instead. */
declare function readonly<...>(path: ..., logic?: NoInfer<LogicFn<TValue, boolean, TPathKind>>): void;
```

All four call sites pass a bare function, i.e. **the deprecated overload**. The same deprecation
pattern applies to `disabled` and `hidden`, but those are not used in this codebase — `readonly` is
the only affected API, and all four of its call sites are affected.

**Why it is a problem.** Neither of the project's gates catches this. `tsc` does not error on
deprecated overloads, and no ESLint deprecation rule is configured — so despite 8 passing quality
gates, these will fail silently whenever Angular removes the overload. They sit in the contact form,
the site's primary conversion path, which the README itself identifies as the most upgrade-sensitive
code in the project.

**Consequence.** On a future Angular major, the contact form's read-only-while-sending behaviour
breaks or fails to compile. The unit specs for the form would catch the behavioural half; the
compile half would simply block the upgrade.

**Recommendation.** Mechanical, four lines (P1-1):

```ts
readonly(inquiry.name, { when: () => this.sending() });
```

Consider also enabling a deprecation lint rule so the next instance is caught by CI rather than by
an audit. (P2-3.)

### 7.4 FINDING — README overstates the stability risk of Signal Forms (severity: Low)

**File:** `README.md`, lines 17–19

**Claimed:**

> "The contact form is built on **`@angular/forms/signals`, an experimental API** — `form()`,
> `submitForm()`, `required()` and `readonly()` carry no stability guarantee, and they sit in the
> site's primary conversion path."

**Actual**, from the installed type declarations — every named function is tagged `@publicApi 22.0`,
i.e. stable public API:

| API                                 | Tag in 22.2.3     | Location                     |
| ----------------------------------- | ----------------- | ---------------------------- |
| `form`                              | `@publicApi 22.0` | `_structure-chunk.d.ts:1963` |
| `submit`                            | `@publicApi 22.0` | `_structure-chunk.d.ts:2101` |
| `required`                          | `@publicApi 22.0` | `signals.d.ts:312`           |
| `email`                             | `@publicApi 22.0` | `signals.d.ts:138`           |
| `maxLength`                         | `@publicApi 22.0` | `signals.d.ts:202`           |
| `readonly` (config overload)        | `@publicApi 22.0` | `signals.d.ts:90`            |
| `readonly` (bare-function overload) | **`@deprecated`** | `signals.d.ts:98`            |

Across the entire `signals.d.ts` surface there are 28 `@publicApi` tags and exactly one
`@experimental` — and that one marks `provideWebMcpTools`-style WebMCP registration, which this
project does not use.

**Why it is a problem.** The inaccuracy is in the cautious direction, but it is still misleading in a
way that costs something: it directs upgrade attention at a non-existent stability risk while the
_actual_ upgrade risk in the same file — the deprecated overload of §7.3 — goes unmentioned. A
maintainer following this README would re-verify `form()` on every upgrade and never look at
`readonly()`.

**Recommendation.** Replace with the accurate and more useful statement: the API is stable
(`@publicApi 22.0`), but `readonly(path, fn)` is deprecated in favour of `readonly(path, { when })`
and must be migrated. Keep the existing (good) advice to run the contact-form specs on every
upgrade. (P2-2.)

### 7.5 `@defer` is under-used for performance

`@defer` appears twice, both `on immediate` in the header — used for _progressive enhancement_
(no-JS fallbacks), not for deferring work. No `on viewport`, `on interaction`, `on idle`, or
`prefetch` triggers exist anywhere.

`home.ts:23-32` composes eight sections, all eagerly imported into a 145 kB chunk, including
clearly below-the-fold content (`HowWeWork`, `EngagementModels`, `StartConversation`) and two
decorative illustration subtrees (`HeroIllustration` with `ArtNode` / `ArtPipeline` / `HeroNotes`,
and `WhatWeBuildIllustration` whose template is 177 lines).

Classified as **Potential Optimization**, not a defect — 26.45 kB transfer for the home route is
already respectable, and `@defer (on viewport)` interacts with prerendering and CLS in ways that need
measurement before adoption. See P2-4.

---

## 8. TypeScript Analysis

### 8.1 Configuration

`tsconfig.json` enables, beyond `strict`:

```
noImplicitOverride, noPropertyAccessFromIndexSignature,
noImplicitReturns, noFallthroughCasesInSwitch, isolatedModules
```

and under `angularCompilerOptions`:

```
strictTemplates, strictInjectionParameters, strictInputAccessModifiers
```

`noPropertyAccessFromIndexSignature` is a notable inclusion — it is frequently disabled because it
forces `route.data['meta']` over `route.data.meta`, and the codebase complies
(`document-meta.ts:52`, `services.ts:169`).

Four separate projects are type-checked, not just the app:

```
tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.spec.json --noEmit
  && tsc -p e2e/tsconfig.json --noEmit && tsc -p tsconfig.scripts.json --noEmit
```

**Result: clean (exit 0).** `tsconfig.scripts.json` sets `allowJs` + **`checkJs`**, so the six
`.mjs` build scripts are type-checked too — unusual and good.

### 8.2 Type design

The codebase consistently derives types from runtime values rather than declaring them twice:

```ts
// service-category.ts:3-32
export const SERVICE_CATEGORY_IDS = ['design-product' /* ... */] as const;
export type ServiceCategoryId = (typeof SERVICE_CATEGORY_IDS)[number];
export type ServiceFilter = ServiceCategoryId | typeof ALL_SERVICES;
```

The same shape recurs for `APP_ICON_NAMES`/`AppIconName`, `SERVICE_IDS`/`ServiceId`, and
`DOCUMENT_META_PAGES`/`DocumentMetaPage`. One source of truth, no drift possible between the list and
the type.

Every such union has a matching **type guard** used at the trust boundary — `isServiceCategoryId`,
`isServiceFilter`, `isChallengeId`, `isAppIconName`, `isDocumentMetaPage`. These are applied exactly
where untyped data enters: query parameters (`services.ts:90`, `solutions.ts:38`), route data
(`document-meta.ts:55`), DOM dataset reads (`services.ts:170`), and DOM event targets
(`filter-bar.ts:45`, guarded by `target instanceof HTMLSelectElement`). This is the discipline that
makes the zero-assertion count possible rather than accidental.

Other good practice: `readonly` on every DTO field (`ContactInquiry`, `Environment`,
`ServiceCategorySummary`, `ConversationCopy`); `satisfies` used for checked-but-narrow literals
(`as const satisfies Dictionary`, `satisfies DocumentMetaRouteData`, `satisfies ServiceCardCopy`);
no `enum` — const objects and literal unions instead, which is the current consensus; a precise
template-literal return type on `appIcon` (`` `${typeof APP_ICON_NAMESPACE}:${AppIconName}` ``).

`unknown` is used correctly as the input type of all five type guards.

### 8.3 FINDING — `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` not enabled (severity: Low)

**File:** `tsconfig.json`, `compilerOptions`

These are the two strictness flags not enabled. With `noUncheckedIndexedAccess` off, every indexed
read is typed as `T` rather than `T | undefined`. Actual unchecked reads in the codebase:

| Site                           | Access                             | Currently safe because                                        |
| ------------------------------ | ---------------------------------- | ------------------------------------------------------------- |
| `locale-routing.ts:16`         | `segments[0].path`                 | guarded by `segments.length > 0` on the same line             |
| `header.ts:103`                | `this.router.url.split(/[?#]/)[0]` | `String.split` always yields ≥ 1 element                      |
| `services.ts:98-100`           | `categories[id]`                   | `id` comes from `SERVICE_CATEGORY_IDS`; keys are type-coupled |
| `document-meta.ts:123`         | `content().pages[current.page]`    | `current.page` is narrowed by `isDocumentMetaPage`            |
| `document-meta.ts:126`         | `alternates[locale()]`             | returned by `getMultilingualUrls` for the declared locales    |
| `change-detection.spec.ts:187` | `match[1]`                         | capture group is non-optional in the regex                    |

**Every one is genuinely safe today** — this is a latent risk, not a live bug, and it is reported as
such. The value of the flag is that it keeps them safe under future edits: the `categories[id]` and
`pages[page]` cases are safe only because of a type coupling that a refactor could break without any
local signal.

`exactOptionalPropertyTypes` is relevant to the handful of optional fields
(`ConversationCopy.steps`, `PageIntroCrumb.path`, `SnackBarData.action`), where it would distinguish
"absent" from "explicitly `undefined`".

**Recommendation.** Enable `noUncheckedIndexedAccess` and fix the ~6 resulting diagnostics; evaluate
`exactOptionalPropertyTypes` separately as it tends to surface more. (P2-5.)

---

## 9. SCSS / CSS Audit

### 9.1 Token architecture — the strongest part of the styling layer

Tokens are defined once in `src/styles/tokens/` and exposed as CSS custom properties, but accessed
through **Sass functions that validate at build time**:

```scss
// tokens/_spacing.scss:3-10
$scale: (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96);

@function space($step) {
  @if not list.index($scale, $step) {
    @error 'Spacing step #{$step} is not in the scale (#{$scale}).';
  }
  @return var(--nx-space-#{$step});
}
```

`spacing.space(13)` fails the build. The same `@error` guard protects `layout.up()` (unknown
breakpoint) and motion's `duration()` / `easing()` / `distance()`. This closes the usual leak in
token systems, where a token system exists but nothing stops a developer writing `padding: 13px`
beside it. It is enforcement, not convention.

**Reduced motion is handled at the token layer** (`tokens/_motion.scss:49-54`):

```scss
@media (prefers-reduced-motion: reduce) {
  --nx-motion-duration-fast: 0ms;
  --nx-motion-duration-base: 0ms;
  --nx-motion-rise: 0px;
  --nx-motion-lift: 0px;
}
```

One declaration disables every animation in the application, because all durations and distances
resolve through these variables. Most codebases repeat a `prefers-reduced-motion` query per
component and miss some; here it is structurally impossible to miss.

**Material integration is via role mapping, not overrides.** `tokens/_color.scss` maps the brand
palette onto M3 system roles (`primary`, `on-primary`, `surface-container-*`, `outline`, …) and adds
14 project-specific `--nx-sys-*` roles for what M3 lacks (`success`, `warning`,
`on-surface-muted`, `inverse-*`). Components then consume `var(--mat-sys-*)` / `var(--nx-sys-*)` —
so there is no need to fight Material's specificity, which is why `::ng-deep` is at zero.
`tokens/_typography.scss` is the single source for all type (`--nx-sys-*-font` shorthands) with three
responsive roles, and its header documents the scale reduction and the reasoning behind it.

### 9.2 Measured hygiene

| Metric                         |                             Measured | Enforced by                                                           |
| ------------------------------ | -----------------------------------: | --------------------------------------------------------------------- |
| `!important`                   |                                **0** | `declaration-no-important: true`                                      |
| `::ng-deep` / `/deep/` / `>>>` |                                **0** | `selector-disallowed-list` with explanatory message                   |
| ID selectors                   |                                **0** | —                                                                     |
| Duplicate selectors            |                                **0** | `no-duplicate-selectors: true` (re-enabled against the shared config) |
| Max nesting depth              | **4** (2 files); 3 or less elsewhere | —                                                                     |
| Stylelint result               |                            **clean** | `npm run lint:styles`                                                 |
| Prettier                       |                            **clean** | `npm run format:check` + pre-commit hook                              |

Nesting is shallow by construction: 86 SCSS files total 8,264 lines (≈96 lines each), the largest
being 224. Flat BEM is enforced by regex with a helpful failure message, and the config notes all 363
class names in `src/` already conform.

**Modern CSS is used fluently and appropriately**: logical properties throughout
(`padding-block`, `inset-inline-start`, `margin-inline`, `border-block-end`), `:has()` for
layout coordination between siblings (`app.scss:36-41`, letting an `immersive` page pull itself under
the header without a JS class toggle), `dvh`, `color-mix()` for disabled states, `color-scheme`,
CSS Grid with `minmax(0, …)` (correctly preventing blowout), `translate` as an independent property,
and `font` shorthand from custom properties.

Of 33 raw `@media` queries outside `src/styles/`, the large majority are
`prefers-reduced-motion: no-preference` — the correct way to gate an animation, not a breakpoint
bypass. Breakpoints go through `layout.up()` in 51 files. The three in `header.scss:19-31` are a
deliberate and clever exception: the nav's collapse width is keyed per locale
(`map.get($widths, en|ru|hy)`), because Armenian nav labels are wider — a locale-aware breakpoint,
which is more thoughtful than a single global one.

### 9.3 FINDING — Material chip labels are not wrapped (severity: Medium — root cause of §10.3)

**Files:** `src/app/pages/home/why/why.scss` (`.why__chips`, lines 76–82),
`src/app/pages/contact/contact-form/chip-select/chip-select.scss`

The project defines a mixin for exactly this hazard and applies it diligently to its own elements:

```scss
// styles/mixins/_text.scss:1-4
@mixin contained() {
  min-width: 0;
  overflow-wrap: anywhere;
}
```

`text.contained()` has **49 call sites** — on `.why__title`, `.why__lead`, `.why__card-title`,
`.why__item-text`, and so on. It is not applied to Angular Material's chip label, which Material
styles `white-space: nowrap`. Measured min-content widths inside `.why__card` on `/hy` at 320px:

```
min-content=270px  mat-chip-option.mat-mdc-chip   "Լուծումների ճարտարապետություն"
min-content=261px  span.mdc-evolution-chip__text-label  (same label)
min-content=243px  mat-chip-option.mat-mdc-chip   "Տեխնիկական ղեկավարություն"
```

A two-word label with a 261px min-content width is proof it is not wrapping — if it were, min-content
would be the width of the longer single word (≈150px).

**Why it is a problem.** A non-wrapping descendant sets an un-shrinkable floor on its ancestors. The
author's own `contained()` mixin shows the hazard was understood; it was simply not extended across
the third-party boundary, where the project otherwise has an explicit policy (the
`selector-disallowed-list` message instructs developers to "expose a CSS custom property instead" of
piercing Material).

**Consequence.** Two reproducible page-level overflows in Armenian (§10.3), plus latent fragility for
any future locale or longer label.

**Recommendation.** Allow the chip label to wrap in both chip contexts (P0-1):

```scss
.why__chips .mdc-evolution-chip__text-label {
  white-space: normal;
  overflow-wrap: anywhere;
}
```

---

## 10. Responsive Design Audit

### 10.1 What was actually tested — and how

**Visual/browser testing WAS performed.** Method: the production build (`dist/nexora/browser`) was
served over a local static HTTP server and driven with the project's own installed Playwright 1.64.1

- Chromium 1248, using a harness written to the session scratchpad at
  `C:\Users\xXx\AppData\Local\Temp\claude\39dbc2457dd9d5bc\913dd34a-9295-47f1-a0a2-d060c40e283a\scratchpad\responsive-audit.mjs`
  — **outside the repository; no project file was added or changed.**

Each page was loaded at each width with `reducedMotion: 'reduce'`, then measured in-page for
(a) `documentElement.scrollWidth − clientWidth`, with the offending elements named, and
(b) interactive targets below 24×24 CSS px.

**Viewports tested — all nine requested by the brief:**

| Class        | Widths            |
| ------------ | ----------------- |
| Mobile       | **320, 360, 390** |
| Tablet       | **768, 1024**     |
| Laptop       | **1280, 1440**    |
| Desktop      | **1920**          |
| Wide desktop | **2560**          |

**Coverage: 243 combinations** = 9 widths × 3 locales (en / hy / ru) × 9 pages (`/`, `/services`,
`/services/ai_agent`, `/solutions`, `/about`, `/engagement-models`, `/partnerships`, `/contact`,
`/not-found`).

**Result: 241 of 243 clean. 2 horizontal-overflow failures, both Armenian at 320px.**

### 10.2 Scope limits of this audit's responsive testing (stated explicitly)

- **Chromium only.** Firefox and WebKit binaries are not installed in this workspace. Cross-browser
  rendering is **NOT VERIFIED**.
- **Programmatic measurement, not visual inspection.** Overflow and target size were measured
  numerically. Visual regressions that do not change geometry — colour contrast in context, overlap
  of equal-size elements, font-rendering quality — were **NOT VERIFIED** by this method. (The
  project's own e2e suite covers contrast via axe and has dedicated token/type-scale specs.)
- **No real-device testing.** Emulated viewports only; touch interaction, mobile browser chrome and
  dynamic viewport behaviour are **NOT VERIFIED**.
- Testing was against the **prerendered production build**, which is the right target but means
  hydrated-only interactive states (open menus, submitted forms) were not swept at every width.

### 10.3 FINDING — Horizontal overflow at 320px in Armenian (severity: High)

Two pages scroll sideways at 320px in `hy`. English and Russian are clean at every width; all other
widths are clean in all locales.

**Defect 1 — `/hy` (home), overflow 20px**

```
clientWidth=320  scrollWidth=340  overflow=20px
  h2.why__title  w=320 left=20 right=340
  p.why__lead    w=320 left=20 right=340
  div.why__card  w=320 left=20 right=340   (display:grid, 3 children)
```

Mechanism, established by measurement rather than inference:

```
app-why host : w=320, padding-inline: 20px   → content box = 280px
.why (grid)  : w=280  ✅ correct
.why__card   : w=320  ❌ overflows its own 280px track by 40px
```

`.why__card` has `padding: space(24)` and a 1px border, so its min-content is
`270 (widest chip) + 24 + 24 + 1 + 1 = 320px` — **exactly the viewport width**. A grid item cannot
shrink below min-content, so the card overflows its track; 20px of that escapes past the right
gutter. `.why__title` and `.why__lead` are reported at 320px as _consequences_ (siblings stretched to
the same over-wide area), not causes.

**Defect 2 — `/hy/contact`, overflow 9px**

```
clientWidth=320  scrollWidth=329  overflow=9px
  button.mat-mdc-chip-action  w=284 left=45 right=329
  span.mdc-evolution-chip__cell w=284 left=45 right=329
      label: "Առանձին՝ իմ նախագծին նվիրված թիմ"
```

The interest chip for `dedicated-team`. Its Armenian label is far longer than the English
("A dedicated team") or Russian ("Выделенная команда") — `contact-form.content.ts:33-40` — and the
chip does not wrap.

_(Note: the harness also flagged `input.ng-valid` at `right=344` on this page. It is **not** an
overflow contributor — `scrollWidth` is 329, so the element is clipped by an ancestor. It is the
hidden honeypot field. Reported here for completeness and explicitly excluded as a finding.)_

**Single root cause for both:** non-wrapping Material chip labels (§9.3).

**Why it is a problem.** 320px is a width this project supports — `tokens/_layout.scss:5` sets
`compact: 0`, so the compact band starts at zero, and `--nx-layout-margin` is defined there. It is
also a real device width (iPhone SE 1st gen, Galaxy Fold cover display, and any 360px device at 1.125
browser zoom). Horizontal scroll on a marketing home page is a conversion and credibility problem,
and it affects only the locale least likely to be checked by a reviewer.

**Why the project's own tests miss it.** `e2e/overflow.spec.ts` is a well-designed spec that tests
exactly this property across all three locales — but at **390px and 840px only** (lines 20–23). Its
header comment records that it was written after an 87px overflow at 390px in `hy`; the width was
fixed at the one that had failed. The class of bug recurs 70px narrower.

**Recommendation.** P0-1 (CSS fix) plus P0-2 (add 320 to `VIEWPORTS` in `overflow.spec.ts`, which
would have caught both and will catch the next one).

### 10.4 Target sizes — checked, and NOT a violation

The sweep flagged sub-24px interactive targets in all 243 combinations, which looked like a
systematic WCAG 2.2 SC 2.5.8 (Target Size (Minimum), AA) failure. **Measurement shows it is not**, and
it is reported as a non-finding rather than inflated into one.

SC 2.5.8 provides a **spacing exception**: undersized targets pass if a 24px-diameter circle centred
on each does not intersect another. Measured at 390px on `/`:

```
footer links : 142×17, 134×17, 115×17 …   vertical gaps: 19, 19, 19, 19, 19 px
→ centre-to-centre spacing = 17 + 19 = 36px  ≥ 24px  ✅ exception satisfied
expertise links : 128×19, consecutive tops 1690 → 1969 (279px apart)  ✅
breadcrumb links : inline within a trail → also covered by the "Inline" exception
```

**Conclusion: no SC 2.5.8 violation.** The targets are small but correctly spaced.

One related genuine gap, reported at low priority: `e2e/a11y.spec.ts:26` configures axe with
`['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']`. WCAG **2.2** criteria (2.5.8 target size, 3.2.6
consistent help, 3.3.7 redundant entry) are therefore outside the automated sweep. Given the above,
adding `wcag22aa` would likely pass; it would make the coverage match the current standard. (P3-3.)

### 10.5 Responsive implementation quality

The grid system is token-driven and genuinely responsive rather than a set of ad-hoc queries
(`tokens/_layout.scss:20-44`): columns, margin and gutter are defined per window-size class
(`compact` 4 cols / 20px margin → `large` 12 cols / 80px margin) and emitted as custom properties, so
components consume `var(--nx-layout-margin)` and adapt without their own media queries. Breakpoints
follow Material 3 window size classes (600 / 840 / 1200 / 1600). Header height is itself a
responsive token.

At 1920px and 2560px, content is correctly bounded by
`--nx-layout-container-max: 1280px` with `margin-inline: auto` — no stretched layouts, which the
sweep confirms (0 findings at both widths in all three locales).

---

## 11. Component Design Audit

### 11.1 Decomposition and size

66 components for 9 pages. Pages decompose into section components that mirror the page's visual
structure (`pages/home/{hero,expertise,why,what-we-build,ai-automation,how-we-work,engagement-models}`),
and section components further decompose their decorative subtrees
(`hero/illustration/{node,pipeline,notes}`). The nesting mirrors the UI, so a change has an obvious
home.

Size distribution (production files, excluding specs and content):

| File                    | Lines | Role                           |
| ----------------------- | ----: | ------------------------------ |
| `contact-form.ts`       |   219 | form schema + submit + notify  |
| `services.ts`           |   206 | filter + scroll-spy container  |
| `document-meta.ts`      |   188 | SEO provider (not a component) |
| `header.ts`             |   113 | nav + locale + mobile menu     |
| `start-conversation.ts` |    81 | CTA band with override input   |
| _all others_            |  < 81 |                                |

No oversized components. `contact-form.ts` at 219 lines is justified — ~60 lines are the validation
schema and ~25 the status-to-copy mapping, both of which are declarative.

### 11.2 Smart / presentational separation

Exemplary on the services page. `Services` (container) owns the query-param filter,
`IntersectionObserver` scroll-spy, and navigation; `FilterBar` and `CategoryNav` own nothing:

```ts
// filter-bar.ts:20-25
readonly categories = input.required<readonly ServiceCategorySummary[]>();
readonly total      = input.required<number>();
readonly value      = input.required<ServiceFilter>();
readonly label      = input.required<string>();
readonly allLabel   = input.required<string>();
readonly filterChange = output<ServiceFilter>();
```

Input contracts are precise: 30 `input.required` (so a missing binding is a compile error, not a
runtime `undefined`), `readonly` arrays, and domain union types rather than `string`. All 7
`shared/ui` components are presentational, which the `shared-is-independent` depcruise rule
guarantees — a `shared/` component _cannot_ import page data, so "needing page data means the
component should take an input instead" is enforced rather than requested.

State ownership is correct: URL-derived state is `computed` from `queryParamMap` rather than copied
into a local signal (`services.ts:88-91`, `solutions.ts:36-39`), so the URL stays the single source
of truth and back/forward navigation works without extra code.

`StartConversation` shows good composition design — an optional `copy` input overrides its default
dictionary content (`start-conversation.ts:66-80`), so one component serves both the generic home CTA
and page-specific variants, with the adapter (`toConversationCopy`) exported for callers.

### 11.3 FINDING — Imperative counter state in `Header` (severity: Low)

**File:** `src/app/layout/header/header.ts`, lines 54–55, 80–96

```ts
private navigations = 0;
private openedAtNavigation = 0;

constructor() {
  this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
    if (event instanceof NavigationStart) {
      this.navigations += 1;
    } else if (event instanceof NavigationEnd && this.navigations > this.openedAtNavigation) {
      this.closeMenu();
    }
  });
}

protected toggleMenu(): void {
  this.menuOpen.update((open) => !open);
  if (this.menuOpen()) {
    this.openedAtNavigation = this.navigations;
  }
}
```

Two plain mutable fields and a manual `router.events` subscription implement "close the mobile menu
on navigation, unless this navigation was already in flight when the menu opened". The intent is
sound (it prevents an in-flight navigation from immediately closing a just-opened menu), and the
subscription is correctly torn down.

**Why it is a problem.** It is the only non-signal mutable state in a 3,123-line signals-first
codebase, and the invariant lives in the relationship between two counters updated from two different
places — the hardest kind of state to reason about or modify safely. Its correctness is not obvious
from reading it, and there is no comment explaining the edge case it defends against (unlike the rest
of the codebase, which documents such decisions well).

**Consequence.** Low functional risk — `header.spec.ts` (247 lines) covers the behaviour. The cost is
maintainability: a future edit here is disproportionately likely to reintroduce the bug this guards
against.

**Recommendation.** At minimum, add a comment naming the edge case. Better: derive it from the
router's navigation signal, or capture the current `NavigationId` on open and compare. (P3-4.)

### 11.4 FINDING — `focusFirstInvalid` couples to Material internals (severity: Low)

**File:** `src/app/pages/contact/contact-form/contact-form.ts`, lines 194–199

```ts
const invalid = this.card().nativeElement.querySelector<HTMLElement>(
  'input.ng-invalid, textarea.ng-invalid, .mat-mdc-select.ng-invalid',
);
invalid?.focus();
```

`.mat-mdc-select` is an Angular Material **internal** class name. The `ng-invalid` part is
self-generated (the component defines `STATUS_CLASSES` at lines 70–76 to reproduce the legacy status
classes under Signal Forms), so that half is stable — but the Material selector is not covered by any
compatibility guarantee and will break silently on a Material internal rename, degrading
accessibility (focus simply will not move) without failing a build.

**Consequence.** Low severity, silent failure mode. The e2e accessibility spec checks `aria-describedby`
on error but not that focus moves to the first invalid control, so this would not be caught.

**Recommendation.** Target the project's own markup instead — e.g. a `data-invalid` attribute bound
from the field state — so the selector depends only on this codebase. (P3-5.)

---

## 12. Performance Audit

Findings are classified per the brief as **Measured Issue**, **Code-Level Risk**, or
**Potential Optimization**.

### 12.1 Measured bundle sizes

From `npm run build` (production, `outputMode: static`), reproduced locally:

```
Initial chunk files   | Names  | Raw size  | Estimated transfer size
main-5ETESG5M.js      | main   | 476.79 kB |               121.82 kB
styles-UH2SBLTT.css   | styles |  22.70 kB |                 3.43 kB
                      | TOTAL  | 499.48 kB |               125.25 kB
```

Against the configured budget (560 kB warning / 1 MB error on `initial`): **within budget, no
warning emitted.**

Lazy chunks — per-route splitting is working correctly:

| Chunk               |       Raw | Transfer |
| ------------------- | --------: | -------: |
| (shared vendor)     | 203.31 kB | 33.40 kB |
| `home`              | 145.01 kB | 26.45 kB |
| `contact`           | 107.73 kB | 24.26 kB |
| `about`             |  69.23 kB | 12.89 kB |
| `ai-agent`          |  68.07 kB | 12.94 kB |
| `engagement-models` |  56.22 kB | 11.55 kB |
| `partnerships`      |  52.40 kB | 10.17 kB |
| `solutions`         |  32.12 kB |  8.44 kB |
| `menu` (Material)   |  29.46 kB |  7.61 kB |
| `services`          |  27.96 kB |  7.34 kB |
| `not-found`         |   8.97 kB |  2.67 kB |

21 lazy chunks total; `dist/nexora/browser` is 7.0 MB on disk including all 36 icons, 3 font files and
27 prerendered HTML documents. **27 static routes prerendered.**

**Assessment.** 125 kB transfer for the initial load is a reasonable outcome for an Angular +
Angular Material site, and the route splitting is clean. It is not _small_ for a brochure site — a
comparable static marketing site without a component framework would be well under 50 kB — but that
is a consequence of the chosen stack, not of misuse, and is partly offset by full prerendering.

### 12.2 Rendering path — strong

- **All 66 components OnPush** (§7.1) and the application is **zoneless**: no change detection runs
  from timers, XHR or arbitrary DOM events; only signal invalidation schedules work.
- **No expensive template expressions.** Derived values are `computed` on the class; templates read
  signals. 64 `computed` versus 5 `signal` means the derived-state graph does the work once per
  dependency change rather than per check.
- **Critical CSS is inlined** per prerendered page (confirmed in
  `dist/nexora/browser/hy/about/index.html`, a `<style>` block of M3 tokens), with the media-restore
  inline script hash-listed in the CSP.
- **Prerendered pages work without JavaScript** — verified by the project's own gate:
  `[verify-prerender] 27 prerendered pages are navigable without JavaScript.`

### 12.3 Memory and subscriptions — clean (Code-Level Risk: none found)

Every asynchronous resource has a verified teardown path: 3 `router.events` subscriptions all with
`takeUntilDestroyed()`; 12 `toSignal` bridges (auto-unsubscribing); 1 `IntersectionObserver` in an
`effect` with `onCleanup(() => observer.disconnect())` (`services.ts:182`); 1 in the `Reveal`
directive with both `observer.disconnect()` on first intersection and
`destroyRef.onDestroy(() => observer.disconnect())` (`reveal.ts:41-48`). The `HttpContactSubmitter`
promise latch clears in a `.finally()`. **No memory leak was identified.**

### 12.4 FINDING — Wrong font preloaded on 18 of 27 prerendered pages (Measured Issue, severity: Medium)

**Files:** `src/index.html`, lines 22–28; affects all `/hy/*` and `/ru/*` output

`index.html` preloads one font, and because it is the single template for every prerendered page,
**all 27 pages** emit the same tag — verified in the build output:

```
EN  /index.html     → <link rel="preload" href="fonts/inter/inter-v20-latin.woff2" …>
HY  /hy/index.html  → <link rel="preload" href="fonts/inter/inter-v20-latin.woff2" …>   ← same
RU  /ru/index.html  → <link rel="preload" href="fonts/inter/inter-v20-latin.woff2" …>   ← same
```

`dist/nexora/browser/hy/index.html` carries `<html lang="hy">` and contains **no reference to
`noto-sans-armenian`** anywhere in the document. The Armenian face is declared only in the CSS bundle
(`_fonts.scss:21-27`), so for the 9 Armenian pages:

- the preloaded Latin subset covers almost nothing on screen (digits, punctuation, the Latin brand
  wordmark), and
- the font that actually renders the body copy — `noto-sans-armenian-v47-armenian.woff2` — is not
  discoverable until the stylesheet has been fetched and parsed, then matched by `unicode-range`.

The same applies to the 9 Russian pages and the Inter Cyrillic subset.

**Why it is a problem.** The preload hint is spent on the wrong resource on two-thirds of the site's
pages, and the correct font starts late, after CSS parse. With `font-display: swap`, the visible
result is a FOUT on exactly the locales where it is not mitigated — a measurable LCP and CLS cost for
Armenian and Russian visitors.

_Correctly done elsewhere:_ the font setup itself is good — self-hosted, `unicode-range`-subset per
script, `font-display: swap`, variable weight range `400 600` in one file per subset. This is purely
a per-locale preload gap. (`<base href="/">` precedes the preload, so the relative URL resolves
correctly — checked, not an issue.)

**Recommendation.** Emit the preload per locale (P1-2). Because `index.html` is one shared template,
this means either injecting the tag during prerender per locale, or preloading the needed subset from
the SEO initializer that already manages `<head>` (`document-meta.ts`), which has the locale
available.

### 12.5 Potential Optimizations (not defects)

- **Below-the-fold deferral on home.** `home.ts` eagerly composes 8 sections into a 145 kB chunk;
  `HowWeWork`, `EngagementModels`, `StartConversation` and the two illustration subtrees are
  candidates for `@defer (on viewport)`. Must be measured against CLS and prerender interaction
  first. (P2-4.)
- **Main chunk composition.** 476.79 kB raw is dominated by Angular + Material. `MatMenu` is already
  route-split into its own 29.46 kB chunk. Worth re-examining whether `MatSelect`/`MatChips` in the
  contact form, and `MatButton`'s usage breadth, justify their share — but any change here trades
  against the (excellent) accessibility behaviour Material provides for free.
- **Icons.** 36 SVGs fetched individually on first use via `MatIconRegistry`. Fine given HTTP/2 and
  caching; a sprite would reduce request count if ever measured as a problem.

### 12.6 NOT VERIFIED

- **Core Web Vitals (LCP, CLS, INP) — NOT VERIFIED.** No lab run (Lighthouse) and no field data (RUM)
  were collected; no such data exists in the repository. The §12.4 finding is a reasoned
  resource-loading defect, not a measured LCP regression, and is labelled accordingly.
- **Real-network performance — NOT VERIFIED.** All measurement was against a local static server.
  Transfer sizes are the build's own gzip estimates.
- **Runtime CPU / frame profiling — NOT VERIFIED.** No scripting-time or long-task profiling was
  performed.

---

## 13. Testing & QA

### 13.1 Everything was executed, not merely counted

All suites were run on the audited commit:

| Gate                                    | Command                    | Result                                                                                     |
| --------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------ |
| Formatting                              | `npm run format:check`     | ✅ "All matched files use Prettier code style!"                                            |
| ESLint (TS + templates + e2e + scripts) | `ng lint`                  | ✅ "All files pass linting."                                                               |
| Architecture                            | `npm run lint:deps`        | ✅ **0 violations** (183 modules, 518 deps)                                                |
| Styles                                  | `npm run lint:styles`      | ✅ clean                                                                                   |
| Types (4 projects)                      | `npm run typecheck`        | ✅ exit 0                                                                                  |
| Script tests                            | `npm run test:scripts`     | ✅ **43 pass, 0 fail**                                                                     |
| Unit tests                              | `npm test -- --no-watch`   | ✅ **280 pass (43 files)**, 28.8 s                                                         |
| Production build                        | `npm run build`            | ✅ 27 routes prerendered, 26.5 s                                                           |
| No-JS prerender gate                    | `npm run verify:prerender` | ✅ "27 prerendered pages are navigable without JavaScript."                                |
| CSP / headers gate                      | `npm run verify:headers`   | ✅ "27 pages: 5 inline scripts allowed by hash, 6 headers present, nginx snippet in step." |

**E2E: 362 `test()` blocks across 31 spec files, 8,854 lines.** These were **NOT EXECUTED** in this
audit — `ng e2e` starts a dev server on port 4300 and the full suite takes substantially longer than
the audit's command budget. Their _content_ was reviewed. Coverage breadth was instead verified
independently via the custom harness in §10.

### 13.2 Test quality — reviewed, not just tallied

The specs assert behaviour and contracts rather than implementation details. Four that stand out as
genuinely senior-level test design:

**`change-detection.spec.ts`** — pins a framework default that changed in the current major version,
reads `ɵcmp.onPush` off every compiled component, and **walks the source tree with `readdirSync`** so
that a newly added component cannot escape the check. Its comment explains why a simpler
`toHaveLength(66)` guard was rejected.

**`contact-contract.spec.ts`** — asserts the submitted payload carries **exactly** its ten fields.
`CONTACT_API.md` explains why this is load-bearing: the NestJS API validates with `whitelist: true`
and `forbidNonWhitelisted: true`, so one extra field makes the API return `400` for _every_
submission. A cross-repository contract failure is converted into a local build failure.

**`a11y.spec.ts`** — axe-core with `wcag2a / wcag2aa / wcag21a / wcag21aa` across **all 27
page × locale combinations**, plus two states a load-time sweep cannot reach: the contact form
_showing validation errors_ (and asserting `aria-describedby` resolves to a visible, non-empty
element) and the _mobile navigation while open_. Failures print the violating selectors.

**`overflow.spec.ts`** — tests all three locales together, with a header comment recording the
87px/390px/`hy` regression that motivated it and the insight that locale-blind narrow-viewport
assertions had missed it. Failures name the widest offending elements. Its one weakness is the fixed
width list, which is §10.3 / P0-2.

Beyond these: `api-origin.spec.ts` acts as a deliberate tripwire that fails the build if `apiOrigin`
is set to `siteOrigin` while no proxy exists (with the rationale, and the conditions for relaxing it,
documented in `CONTACT_API.md`); `verify-headers.mjs` regenerates the CSP inline-script hashes from
the real build and compares them, so an Angular upgrade cannot silently break hydration under CSP;
and the `scripts/` directory has its own 43 tests with `checkJs` type-checking.

**Mocking strategy** is sound: the `ContactSubmitter` abstraction means the form is tested against a
fake with no HTTP interception, and `reveal.spec.ts` substitutes a fake `IntersectionObserver` via a
controlled global.

**Flaky tests — CANNOT DETERMINE.** No repeat runs were performed and no historical CI data is
available. The configuration is sensible (`retries: 2` and `workers: 1` on CI, `fullyParallel`
locally, `forbidOnly` on CI).

### 13.3 CI quality gates

`.github/workflows/ci.yml` runs all ten gates above in dependency order on every push to `main` and
every PR, on Node 24. The ordering is deliberate and commented: `verify:prerender` and
`verify:headers` both read `dist/`, so they follow the build.

A second non-blocking `audit` job runs `npm audit --audit-level=high` with `continue-on-error: true`
and a comment explaining precisely why it reports rather than gates. **I verified that reasoning
rather than accepting it** (§14.6) — it is accurate.

### 13.4 FINDING — Unit-test builder reports an unsupported configuration (severity: Medium)

Emitted on every `npm test` run, captured from the local execution:

```
The 'buildTarget' is configured to use '@angular-builders/custom-esbuild:application',
which is not supported. The 'unit-test' builder is designed to work with
'@angular/build:application' or '@angular/build:ng-packagr'.
Unexpected behavior or build failures may occur.
```

`angular.json` points the `test` target's `buildTarget` at `nexora:build:development`, which uses the
third-party `@angular-builders/custom-esbuild:application` builder (needed for the project's
`esbuild.plugins.ts` hook). Angular's `unit-test` builder explicitly does not support it.

All 280 tests currently pass, so the combination works **today**. But the framework is stating it is
outside supported configuration, which means (a) no compatibility guarantee across Angular patch
releases, and (b) a future failure here would be unsupported and hard to get help with — in the
component that gates every other quality check in CI.

A related, smaller signal from the same run: jsdom prints `Not implemented: Window's scrollTo()` and
`Not implemented: navigation to another Document`. The scroll helpers (`scroll-to-section.ts`,
`locale-switcher.switchTo`) are therefore exercised as no-ops in unit tests — their real behaviour is
only covered by e2e.

**Recommendation.** Decide deliberately between keeping the custom builder (and accepting the warning,
with a comment in `angular.json` recording the trade-off) and moving the esbuild plugin need
elsewhere so `@angular/build:application` can be used for tests. Do not leave an unexplained
unsupported-configuration warning in the build output. (P1-3.)

### 13.5 FINDING — Single-browser e2e coverage (severity: Medium)

**File:** `playwright.config.ts`, lines 26–31

```ts
projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
```

with the comment: _"Only Chromium binaries are installed in this workspace … Add `firefox` / `webkit`
projects here once their binaries are installed as well."_ CI installs only
`npx playwright install --with-deps chromium`.

**Why it is a problem.** This is a **public marketing website** in three locales — a meaningful share
of its traffic will be Safari/WebKit on iOS. The codebase leans deliberately on recent CSS
(`:has()`, `color-mix()`, `dvh`, logical properties, `overflow-wrap: anywhere`, `translate` as an
independent property) and on `@defer` hydration. WebKit historically diverges on exactly these, and
the 362-test suite asserting precise geometry would be the ideal instrument to catch it. **Safari
rendering is entirely unverified** by the project and by this audit.

**Recommendation.** Add `webkit` (highest value for a public site) and ideally `firefox` to
`projects`, and extend the CI install line. (P1-4.)

### 13.6 Coverage measurement

**NOT VERIFIED — no coverage instrumentation is configured.** No `--coverage` flag, no coverage
thresholds, no reporter. Structural coverage is good by inspection (43 spec files against ~70
production modules; every `core/` module, every `shared/ui` component, and every page has a spec), and
coverage percentage is a weak metric compared with the contract and invariant tests this project
actually relies on. Still, the _number is unknown_, so no claim is made about it. Enabling
`--coverage` for visibility — without a gate — would be cheap. (P3-6.)

---

## 14. Critical Issues

Ordered by severity. Nothing found rises to P0-architectural; the two P0 items are a one-line CSS fix
and a one-line test change.

### 14.1 🔴 HIGH — Horizontal overflow at 320px in Armenian (2 pages)

Measured: `/hy` +20px, `/hy/contact` +9px at 320px viewport. Root cause: non-wrapping Material chip
labels set a min-content floor of 270px/284px, which with `.why__card`'s padding reaches exactly
320px. English and Russian clean at all widths; all other widths clean in all locales.
**Evidence:** §10.3, §9.3. **Fix:** P0-1, P0-2.

### 14.2 🟠 MEDIUM — Four uses of a deprecated API overload in the conversion path

`contact-form.ts:134-137` use `readonly(path, fn)`, which `@angular/forms` 22.2.3 marks
`@deprecated` in favour of `readonly(path, { when })`. Invisible to `tsc` and to ESLint as configured.
**Evidence:** §7.3. **Fix:** P1-1.

### 14.3 🟠 MEDIUM — Wrong font preloaded on 18 of 27 prerendered pages

All pages, including 9 Armenian and 9 Russian, preload only the Inter **Latin** subset; the fonts that
actually render those pages are not preloaded and not referenced in the document head.
**Evidence:** §12.4. **Fix:** P1-2.

### 14.4 🟠 MEDIUM — Two unsupported/untested toolchain positions

(a) The unit-test builder prints an explicit unsupported-configuration warning on every run, in the
gate that guards all other gates (§13.4). (b) E2E runs Chromium only, leaving WebKit — a major share
of a public site's traffic — unverified (§13.5). **Fix:** P1-3, P1-4.

### 14.5 🟡 Product limitation (NOT a code defect) — the contact form cannot submit in production

`environment.production.ts:6` ships `apiOrigin: ''`. `API_ORIGIN`'s factory therefore resolves to
`''`, and `HttpContactSubmitter.submit()` returns `'not-configured'` without issuing a request — so
the visitor sees a notice pointing at the published email address instead of submitting the form.

**This is deliberate, documented and guarded, and is reported as a readiness state rather than a
defect.** `CONTACT_API.md` ("Switching the form on") records that the NestJS API is written but not
deployed, that `api.nexoratechnology.org` does not resolve, and that the static host answers `405` to
a `POST /api/contact`. It documents both deployment topologies with ordered steps, and
`api-origin.spec.ts` fails the build if `apiOrigin` is set to a malformed value _or_ to `siteOrigin`
while no proxy exists — with the rationale for that tripwire, and the conditions for relaxing it,
written down.

The design is also correct in its failure mode: it issues **no request at all** and does not fall back
to a relative URL, so nothing is posted into the void, and the visitor is given a working alternative
contact route.

**Business impact is nonetheless real:** the primary conversion path of a lead-generation website is
inactive. This is a deployment task, not a code change — but it is the single highest-value open item
for the site's purpose, which is why it appears here. (P0-3.)

### 14.6 ✅ Verified NOT an issue — the 15 high-severity npm advisories

`npm audit` reports 32 advisories (15 high, 16 moderate, 1 low). The CI comment claims none reach a
visitor. **I verified this claim against the actual build output rather than accepting it:**

```
grep -rl <term> dist/nexora/browser --include=*.js
  ZodError      → 0 files
  zod           → 0 files
  launch-editor → 0 files
  vite          → 0 files
```

All 15 high-severity advisories trace to two build-time roots — `zod` (CWE-770, memory exhaustion)
reached through `@intlayer/config`, and `vite` (`launch-editor` command-execution, dev-server only) —
confirmed by the dependency paths in the audit JSON (`@intlayer/*` → `zod`; `vite` transitive).
Neither appears in the shipped browser bundle. **No runtime exposure. The project's documentation is
accurate and its decision to report rather than gate is correct.**

Standing caveat, which the CI comment itself states: re-verify the bundle claim on every `intlayer`
upgrade.

### 14.7 Security posture — reviewed, no issues found

Beyond the advisory check: the CSP is **enforced** (not report-only) with `default-src 'self'`,
`object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, and five SHA-256 hashes for the
inline scripts Angular emits — **regenerated and compared against the real build by
`verify:headers`**, so an Angular upgrade fails CI instead of silently breaking hydration in
production. HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy` and
`Cross-Origin-Opener-Policy: same-origin` are all present. `style-src 'unsafe-inline'` is retained
with a documented reason (per-page critical CSS cannot be hash-listed by a single static rule) and the
correct observation that inline _style_ is a far smaller exposure than inline script.

The single `bypassSecurityTrustResourceUrl` call (`provide-app-icons.ts:22`) is gated by the
`isAppIconName` allowlist, so only the 36 known names resolve. No `innerHTML`, no `document.write`, no
`eval`. The honeypot field is implemented and documented. No secrets in the repository;
`environment.production.ts` carries only public origins.

---

## 15. Technical Debt

Total identified debt is small and almost entirely localized. There is no architectural debt — no
layering violation, no cycle, no god object, no `any` to unwind.

| #   | Debt                                  | Location                                    | Interest it accrues                                                                  |
| --- | ------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | Non-wrapping chip labels              | `why.scss`, `chip-select.scss`              | Breaks at every new narrow width / long-label locale; already costing 2 live defects |
| 2   | Deprecated `readonly` overload ×4     | `contact-form.ts:134-137`                   | Blocks or breaks a future Angular major, in the conversion path                      |
| 3   | Shared `index.html` across locales    | `src/index.html`                            | Any per-locale `<head>` need (preload, hreflang) has nowhere to go                   |
| 4   | Unsupported unit-test builder pairing | `angular.json`                              | Unsupported surface in the gate that guards all gates                                |
| 5   | Chromium-only e2e                     | `playwright.config.ts`                      | Rendering divergence accumulates undetected on WebKit                                |
| 6   | Overflow spec's fixed width list      | `overflow.spec.ts:20-23`                    | Narrow-viewport regressions recur below 390px                                        |
| 7   | SEO logic in one provider closure     | `document-meta.ts:59-187`                   | Structured-data changes are expensive and under-tested                               |
| 8   | `noUncheckedIndexedAccess` off        | `tsconfig.json`                             | ~6 index reads safe only by type coupling that a refactor could break                |
| 9   | Documentation drift ×2                | `.stylelintrc.cjs:11-16`, `README.md:17-19` | Devalues the project's primary knowledge-transfer mechanism                          |
| 10  | Dead icon                             | `icons.ts:23`, `minus.svg`                  | Negligible; catalogue noise                                                          |
| 11  | Imperative counters in `Header`       | `header.ts:54-55,80-96`                     | Edge case is undocumented and easy to reintroduce                                    |
| 12  | Material-internal selector            | `contact-form.ts:196`                       | Silent a11y regression on a Material rename                                          |
| 13  | No coverage instrumentation           | —                                           | Blind spot, not a defect                                                             |
| 14  | Content compiled into bundle          | 50 `*.content.ts`, 5,225 lines              | A 4th locale or CMS requires rework (see §16 note)                                   |

**On items 9 and 14.** Item 9 deserves emphasis disproportionate to its severity: this codebase
substitutes well-measured comments for tribal knowledge more successfully than most, which makes a
stale measurement a load-bearing failure rather than cosmetic noise. A periodic check that the
numeric claims in `.stylelintrc.cjs`, `README.md` and `CONTACT_API.md` still hold would protect the
practice that makes this codebase maintainable.

Item 14 is a **design consequence, not a mistake** — co-locating copy with components gives
type-checked content and excellent locality, which is clearly the right trade for a 9-page site owned
by engineers. It is listed because it is the constraint most likely to be hit first if the site grows
(non-engineers editing copy, or a 4th locale).

---

## 16. Improvement Roadmap

### P0 — Critical

**P0-1 · Let Material chip labels wrap**

- **Problem:** Non-wrapping chip labels set a 270px/284px min-content floor, overflowing two pages at
  320px in Armenian (§10.3, §9.3).
- **Files:** `src/app/pages/home/why/why.scss` (`.why__chips`),
  `src/app/pages/contact/contact-form/chip-select/chip-select.scss`
- **Solution:** Apply `white-space: normal; overflow-wrap: anywhere;` to
  `.mdc-evolution-chip__text-label` within both chip contexts — consistent with the existing
  `text.contained()` policy, and via the project's own classes (no `::ng-deep`).
- **Outcome:** Both overflows resolved at the root; future long labels and locales become safe.
- **Effort:** ~2 lines each.

**P0-2 · Add 320px to the overflow regression spec**

- **Problem:** `VIEWPORTS` covers 390 and 840 only; both live defects occur at 320 (§10.3).
- **File:** `e2e/overflow.spec.ts`, lines 20–23
- **Solution:** Add `{ label: 'small-phone', width: 320, height: 568 }`. Consider extending the spec
  beyond the home page, since one of the two failures is on `/contact`.
- **Outcome:** Both current defects become failing tests before the fix and regression guards after;
  the narrowest supported width is covered permanently.
- **Effort:** 1 line (+ optional page-loop generalization).

**P0-3 · Decide and act on the contact API deployment** _(product, not code)_

- **Problem:** The site's primary conversion path is inactive in production (§14.5).
- **Files:** `src/environments/environment.production.ts`, `public/_headers`,
  `src/app/core/routing/api-origin.spec.ts`
- **Solution:** Follow the ordered steps already written in `CONTACT_API.md` for the chosen topology
  (same-origin nginx proxy is the documented recommendation — no second certificate, no DNS record,
  no preflight). Note that step 4 requires relaxing the deliberate `api-origin.spec.ts` tripwire, and
  that `verify:headers` will enforce `connect-src` agreement.
- **Outcome:** Inquiries are captured rather than deflected to email.
- **Effort:** Deployment work; the client-side change is one constant.

### P1 — High

**P1-1 · Migrate off the deprecated `readonly` overload**

- **Problem:** 4 call sites use `readonly(path, fn)`, deprecated in 22.2.3 (§7.3).
- **File:** `contact-form.ts:134-137`
- **Solution:** `readonly(inquiry.name, { when: () => this.sending() })` ×4.
- **Outcome:** Removes the only known blocker to the next Angular major in the conversion path.
- **Effort:** 4 lines.

**P1-2 · Preload the correct font per locale**

- **Problem:** 18 of 27 prerendered pages preload a subset they barely use, while the font that
  renders them is discoverable only after CSS parse (§12.4).
- **Files:** `src/index.html:22-28`; `src/app/core/seo/document-meta.ts` (which already owns `<head>`
  and knows the locale)
- **Solution:** Emit the preload per locale — `noto-sans-armenian-v47-armenian.woff2` for `hy`,
  `inter-v20-cyrillic.woff2` for `ru`, Latin for `en`. Measure LCP on `/hy` before and after.
- **Outcome:** Faster first text paint and reduced FOUT for Armenian and Russian visitors.
- **Effort:** Small; needs a per-locale injection point.

**P1-3 · Resolve the unit-test builder pairing**

- **Problem:** Angular reports the `unit-test` + `custom-esbuild` pairing as unsupported, on every run
  of the gate that guards every other gate (§13.4).
- **File:** `angular.json` (`architect.test.options.buildTarget`)
- **Solution:** Either move the `esbuild.plugins.ts` requirement out of the path needed by tests so
  `@angular/build:application` can back the test target, or keep the current pairing and record the
  trade-off in a comment next to it, as this project does elsewhere.
- **Outcome:** Either a supported configuration or a documented, deliberate exception — not an
  unexplained warning.
- **Effort:** Investigation, then small.

**P1-4 · Add WebKit (and Firefox) to the e2e matrix**

- **Problem:** A public three-locale site leaning on `:has()`, `color-mix()`, `dvh` and `@defer` is
  verified only in Chromium (§13.5).
- **Files:** `playwright.config.ts:26-31`; `.github/workflows/ci.yml:32`
- **Solution:** Add `webkit` first (highest traffic value), then `firefox`; change the install step to
  `npx playwright install --with-deps chromium webkit firefox`. Expect some initial geometry failures
  and triage them as real findings.
- **Outcome:** The existing 362-test suite starts protecting Safari users; CI time rises
  proportionally.
- **Effort:** Config small; triage of first-run failures is the real cost.

### P2 — Medium

**P2-1 · Extract pure functions from the SEO provider**

- **Problem:** All SEO behaviour lives in one 188-line closure, so breadcrumbs and JSON-LD cannot be
  unit-tested in isolation (§5.5).
- **File:** `src/app/core/seo/document-meta.ts:59-187`
- **Solution:** Lift `breadcrumbItems` and the `@graph` assembly to exported pure functions taking
  `(page, locale, origin, content)`; keep the initializer as thin DOM wiring. Follow the pattern the
  file's own `pagePath` / `isDocumentMetaPage` already establish.
- **Outcome:** Structured-data output becomes directly assertable; the highest-risk, lowest-seam code
  in the project gets a seam.

**P2-2 · Correct the README's Signal Forms claim**

- **Problem:** States the API is experimental; it is `@publicApi 22.0`, while the real risk
  (deprecated `readonly` overload) goes unmentioned (§7.4).
- **File:** `README.md:17-19`
- **Solution:** Record that the API is stable, that `readonly(path, fn)` is deprecated, and keep the
  existing advice to run the contact-form specs on every upgrade.
- **Outcome:** Upgrade attention points at the actual risk.

**P2-3 · Lint for deprecated API usage**

- **Problem:** Nothing in 8 gates caught 4 deprecated call sites (§7.3).
- **File:** `eslint.config.js`
- **Solution:** Enable a deprecation rule (e.g. `@typescript-eslint/no-deprecated`).
- **Outcome:** The next deprecation is caught by CI, not by audit.

**P2-4 · Evaluate `@defer` for below-the-fold home sections**

- **Problem:** 8 sections load eagerly in a 145 kB chunk, including clearly below-fold content and two
  decorative illustration subtrees (§7.5, §12.5).
- **Files:** `src/app/pages/home/home.ts`
- **Solution:** Trial `@defer (on viewport)` on `HowWeWork`, `EngagementModels`,
  `StartConversation`; measure LCP/CLS before and after, since the pages are prerendered and
  placeholder height affects CLS. Keep only if measured to help.
- **Outcome:** Smaller initial home payload, or a documented decision not to.

**P2-5 · Enable `noUncheckedIndexedAccess`**

- **Problem:** ~6 index reads are safe only by type coupling a refactor could break silently (§8.3).
- **File:** `tsconfig.json`
- **Solution:** Enable and fix the resulting diagnostics (the list in §8.3 is believed complete).
  Evaluate `exactOptionalPropertyTypes` separately.
- **Outcome:** The last major strictness gap closes; latent risk becomes compile-time.

### P3 — Low

**P3-1 · Fix the `.stylelintrc.cjs` header** — it claims 7 inline-style components and a
`container.page()` mixin; reality is 1 and none (§6.2). Replace with the true statement.

**P3-2 · Remove the dead `minus` icon** — `icons.ts:23` + `public/icons/minus.svg`, referenced
nowhere (§6.3). Delete both, or note why it is reserved.

**P3-3 · Add `wcag22aa` to the axe tag set** — `e2e/a11y.spec.ts:26` stops at WCAG 2.1, so 2.2
criteria are unswept. Measurement in §10.4 suggests it would pass; adding it makes coverage match the
current standard.

**P3-4 · Document or derive `Header`'s navigation counters** — `header.ts:54-55,80-96`, the only
non-signal mutable state in the codebase, guarding an undocumented edge case (§11.3).

**P3-5 · Stop targeting `.mat-mdc-select` in `focusFirstInvalid`** — `contact-form.ts:196` depends on
a Material internal; a rename silently breaks error focus (§11.4). Use the project's own attribute.

**P3-6 · Enable coverage reporting (no gate)** — coverage is currently unknown (§13.6). Visibility is
cheap; a threshold is not necessarily warranted given the project's reliance on contract tests.

**P3-7 · Periodically re-verify documented measurements** — the numeric claims in
`.stylelintrc.cjs`, `README.md` and `CONTACT_API.md` are this project's main knowledge-transfer
mechanism, and two have drifted (§15, item 9).

---

## 17. Final Engineering Verdict

### How well is the project implemented?

**Very well — materially above typical commercial Angular work, and in several respects above typical
enterprise work.** The evidence that distinguishes it is not its use of modern APIs (the brief rightly
rejects that as grounds) but the consistency with which decisions are _enforced_ rather than agreed:

- 3,123 lines of production TypeScript with **zero** `any`, zero `@ts-ignore`, zero non-null
  assertions, zero `eslint-disable`, and zero lifecycle hooks.
- Architecture guaranteed by 8 machine-checked rules across 183 modules, including type-only cycle
  detection — a configuration calibrated to failures this codebase actually had.
- Conventions that are normally reviewer-memory converted into executable assertions: the
  change-detection contract (with a source-tree walk so it covers components not yet written), the
  cross-repository API payload, the CSP inline-script hashes, the no-JavaScript navigability of all 27
  prerendered pages.
- A design-token system that fails the build on an off-scale value, and handles reduced motion once at
  the token layer rather than 20 times at the component layer.
- 685 passing automated tests at a 4.9:1 test-to-code ratio, including axe-core WCAG 2.1 AA across all
  27 page × locale pairs plus error and menu-open states.

The quality is also _legible_. Comments explain why, cite the measurement that justified the rule, and
in several places record what was tried and rejected. That is the practice that makes a codebase
survivable by its second engineer, and it is the project's strongest asset.

### How closely does the architecture follow enterprise engineering principles?

Closely, and — unusually — **without inflating a 9-page marketing site into a pseudo-enterprise
cathedral**, which the brief explicitly warned against. Layering, DI, separation of concerns and
SOLID are respected: the Dependency Inversion boundary exists at the one place it earns its keep (the
contact submitter), the Null Object pattern gives a working default, container/presentational
separation is strict and enforced for `shared/`, and single-responsibility holds at file level
(largest production file: 219 lines).

Equally important is the restraint. There is no state-management library where component signals
suffice, no repository layer over a single POST, no mapper indirection where one exported adapter
function does the job, no barrel files, no abstract base classes beyond the one that serves DI. Each
of the seven patterns identified in §4 is present because it pays for itself. On the brief's specific
tests: no circular dependencies, no business logic in presentational components, no services with
unrelated responsibilities, and no unnecessary layers.

The one genuine violation of its own standard is `document-meta.ts`, where six responsibilities share
one closure (§5.5).

### How ready is it to scale?

**Structurally ready; content-wise constrained.**

Ready: every route is lazily loaded with clean per-route chunks; feature isolation is enforced, so a
tenth page cannot accidentally couple to the ninth; the token system means a visual change has one
edit site; the layering rules make onboarding safe because the compiler and `npm run lint` reject the
most common structural mistakes before review.

Constrained: 5,225 lines of copy across 50 `*.content.ts` files are compiled into the bundle. For a
site owned by engineers this is a _good_ trade — type-checked content, excellent locality, no CMS to
operate. But it is the first wall the project will hit, in either of two likely futures: non-engineers
needing to edit copy, or a fourth locale. Adding a page today touches four coordinated files
(`app.routes.ts`, `DOCUMENT_META_PAGES`, `document-meta.content.ts`, `app.routes.server.ts`); that is
safe because `satisfies DocumentMetaRouteData` makes an omission a compile error, but it is four
steps, not one.

### Which problems are the greatest risks?

1. **WebKit is entirely unverified** (§13.5). This is the largest _unknown_, and unknowns outrank
   known small defects. A public, three-locale marketing site that deliberately uses `:has()`,
   `color-mix()`, `dvh` and `@defer` has never been rendered in Safari by any test — while possessing
   a 362-test suite that is precisely the right instrument for finding such divergence. The 320px
   Armenian overflow is instructive here: it was invisible for the same structural reason (an untested
   axis), and it was real.
2. **The contact API is not deployed** (§14.5). Not a code risk — but the business risk with the
   highest value, since the site exists to generate inquiries.
3. **The deprecated `readonly` overload** (§7.3), because it sits in the conversion path and no gate
   reports it.
4. **Documentation drift** (§6.2, §7.4). Low severity individually; corrosive to the specific
   mechanism this codebase depends on most.

### What should be improved first?

In order, and deliberately cheap at the top:

1. **P0-2 then P0-1** — add 320px to `overflow.spec.ts` (watch both defects fail), then wrap the chip
   labels (watch them pass). Two one-line changes that fix a real user-visible bug and leave a
   permanent guard. Do the test first; it is what makes the fix verifiable.
2. **P1-1** — four lines to remove the deprecated overload from the conversion path.
3. **P1-4** — add WebKit to the e2e matrix. The highest-information-per-effort action available,
   because it converts the project's largest blind spot into test results.
4. **P0-3** — deploy the contact API, following the steps already written in `CONTACT_API.md`.
5. **P1-2, P1-3**, then the P2 group, led by **P2-5** (`noUncheckedIndexedAccess`) and **P2-1** (the
   SEO extraction).

### Closing assessment

Nexora is a small application built with large-system discipline, and the discipline is real rather
than decorative — it is visible in passing gates, in zero-violation dependency cruises, in tests that
assert framework internals and cross-repository contracts, and in comments that record measurements
rather than intentions. The defects this audit found are few, shallow, and concentrated in exactly the
two places where the project's otherwise-excellent instrumentation does not look: viewports below
390px, and browsers other than Chromium. That is a strong result for a deep audit, and it is the
reason the overall score is 9 rather than 7.

**Overall: 9 / 10.** Fix the two one-line P0s, add WebKit, and the remaining gap to a 10 is the SEO
extraction, the last strictness flag, and keeping the documentation as honest as the code.

---

## Appendix A — Verification Log

### A.1 Checks performed successfully

**Static analysis and type checking**

1. `npm run format:check` (Prettier, whole repo) — ✅ clean
2. `ng lint` (ESLint: `src/**/*.ts`, `src/**/*.html`, `e2e/**/*.ts`, `scripts/**/*.mjs`) — ✅ clean
3. `npm run lint:deps` (dependency-cruiser) — ✅ 0 violations, 183 modules, 518 dependencies
4. `npm run lint:styles` (Stylelint over `src/**/*.scss`) — ✅ clean
5. `npm run typecheck` — ✅ exit 0 across `tsconfig.app`, `tsconfig.spec`, `e2e/tsconfig`,
   `tsconfig.scripts` (the last with `checkJs`)

**Test execution** 6. `npm run test:scripts` — ✅ 43 pass / 0 fail 7. `npm test -- --no-watch` — ✅ **280 pass, 43 files**, 28.83 s 8. E2E suite content reviewed; **362 `test()` blocks / 31 files / 8,854 lines** enumerated

**Build and deploy verification** 9. `npm run build` (production) — ✅ 27 routes prerendered, 26.5 s; bundle sizes recorded (§12.1) 10. `npm run verify:prerender` — ✅ "27 prerendered pages are navigable without JavaScript." 11. `npm run verify:headers` — ✅ "27 pages: 5 inline scripts allowed by hash, 6 headers present,
nginx snippet in step."

**Security** 12. `npm audit --audit-level=high` — 32 advisories (15 high / 16 moderate / 1 low), all traced to
build-time roots 13. **Independent verification** that `zod`, `vite` and `launch-editor` appear in **0** files of
`dist/nexora/browser` — the project's no-runtime-exposure claim confirmed 14. CSP, security headers, `bypassSecurityTrustResourceUrl` allowlist, sanitizer and secret review

**Framework claim verification (not accepted on trust)** 15. Angular 22.2.3 change-detection default confirmed from installed source:
`onPush: changeDetection !== ChangeDetectionStrategy.Eager`
(`fesm2022/_debug_node-chunk.mjs:10343`) with `OnPush = 0, Eager = 1, Default = 1`
(`types/_debug_node-chunk.d.ts:4966-4987`) → **all 66 components are OnPush** 16. Signal Forms stability confirmed per-function from `@angular/forms/types/*.d.ts`: `form`,
`submit`, `required`, `email`, `maxLength`, `readonly({when})` all `@publicApi 22.0`;
`readonly(path, fn)` **`@deprecated`** 17. Zoneless confirmed (no `zone.js` dependency, no `polyfills` entry)

**Responsive and browser verification (Playwright 1.64.1 + Chromium 1248, read-only harness)** 18. **243 combinations** swept — 9 widths (320/360/390/768/1024/1280/1440/1920/2560) × 3 locales ×
9 pages — for horizontal overflow and sub-24px targets: **241 clean, 2 overflow failures** 19. Root-cause diagnosis of both failures, including in-page `min-content` measurement of every
descendant of `.why__card` (§10.3) 20. Font-preload comparison across `/`, `/hy`, `/ru` prerendered documents, plus `<base href>`
ordering check (§12.4) 21. Target-size spacing measurement against WCAG 2.2 SC 2.5.8's spacing exception → **not a
violation** (§10.4)

**Source review** 22. All of `src/app/core`, `src/environments`, `src/app/shared`, the app shell and routing read in full 23. All configuration files read: `package.json`, `angular.json`, 5 tsconfigs, `eslint.config.js`,
`.stylelintrc.cjs`, `.dependency-cruiser.cjs`, `.prettierrc`, `intlayer.config.ts`,
`playwright.config.ts`, `.githooks/pre-commit`, `.github/workflows/ci.yml` 24. All of `src/styles` (tokens, mixins, theme) read in full 25. Representative deep reads of each page family, incl. the two most complex components 26. Quantitative sweeps: signal/RxJS API usage; type escape hatches; lifecycle hooks; SCSS nesting
depth per file; `!important` / `::ng-deep` / ID selectors; mixin usage; icon usage vs. declaration
vs. shipped files; subscription teardown; `effect` cleanup 27. Documentation cross-checked against code (`README.md`, `CONTACT_API.md`, `.stylelintrc.cjs`) 28. `git status --porcelain` — empty before and after

### A.2 Checks that could NOT be performed

| Check                                       | Status               | Reason                                                                                                                                      |
| ------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| E2E suite execution (362 tests)             | **NOT VERIFIED**     | Requires `ng e2e` dev server on :4300; runtime exceeds the audit's command budget. Content reviewed; breadth independently verified via §10 |
| Firefox / WebKit rendering                  | **NOT VERIFIED**     | Binaries not installed in this workspace (only `chromium-1248`, `chromium_headless_shell-1248`)                                             |
| Core Web Vitals (LCP / CLS / INP)           | **NOT VERIFIED**     | No Lighthouse run and no RUM/field data; none present in the repository                                                                     |
| Test coverage percentage                    | **NOT VERIFIED**     | No coverage instrumentation configured                                                                                                      |
| Flaky-test incidence                        | **CANNOT DETERMINE** | No repeat runs performed; no historical CI data available                                                                                   |
| Real-device / touch testing                 | **NOT VERIFIED**     | Emulated viewports only                                                                                                                     |
| Visual regression (non-geometric)           | **NOT VERIFIED**     | Measurement was numeric; no baseline screenshots exist                                                                                      |
| Real-network performance                    | **NOT VERIFIED**     | Local static server; transfer sizes are the build's gzip estimates                                                                          |
| Runtime CPU / long-task profiling           | **NOT VERIFIED**     | Not performed                                                                                                                               |
| Production deployment behaviour             | **NOT VERIFIED**     | Not accessible; `CONTACT_API.md` reports `api.nexoratechnology.org` does not resolve                                                        |
| `Nexora-back` (NestJS API) quality          | **OUT OF SCOPE**     | Separate repository (`Desktop\Nexora-back`); only the client-side contract was audited                                                      |
| Intlayer dictionary completeness per locale | **NOT VERIFIED**     | 50 dictionaries build successfully and `strictTemplates` passes; per-key translation completeness and linguistic accuracy not audited       |

### A.3 Source-modification confirmation

**No source file was created, modified, deleted or reformatted during this audit.**

- No refactoring, bug fixing, migration or formatting was performed.
- No dependency was installed and no configuration was changed.
- `git status --porcelain` returned empty output both before and after the investigation.
- All audit tooling was written to the session scratchpad
  (`C:\Users\xXx\AppData\Local\Temp\claude\39dbc2457dd9d5bc\913dd34a-9295-47f1-a0a2-d060c40e283a\scratchpad\`),
  never inside the repository.
- The commands executed were the project's own read-only npm scripts (`format:check`, `lint`,
  `typecheck`, `test:scripts`, `test`, `build`, `verify:prerender`, `verify:headers`) plus
  `npm audit`. `npm run build` wrote only to `dist/`, which `.gitignore` excludes and which is a
  build artefact, not source.
- The only two files added are the deliverables requested in the brief:
  `TECHNICAL_AUDIT_REPORT.md` and `TECHNICAL_AUDIT_SUMMARY.md`.

### A.4 Deliverable path verification

| File        | Path                                                     | Status       |
| ----------- | -------------------------------------------------------- | ------------ |
| Full report | `C:\Users\xXx\Desktop\Nexora\TECHNICAL_AUDIT_REPORT.md`  | ✅ this file |
| Summary     | `C:\Users\xXx\Desktop\Nexora\TECHNICAL_AUDIT_SUMMARY.md` | ✅ created   |

All file paths, line numbers and quoted code in this report were taken directly from the audited
working tree at commit `7bada76`. Line numbers refer to that commit.
