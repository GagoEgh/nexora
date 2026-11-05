# Nexora — Technical Audit Summary

**Project:** `C:\Users\xXx\Desktop\Nexora` · Angular 22.2.3 · TypeScript 6.0.3
**Audit date:** 2026-11-05 · **Commit:** `7bada76` (working tree clean)
**Full report:** [`TECHNICAL_AUDIT_REPORT.md`](./TECHNICAL_AUDIT_REPORT.md)

> Source code was not modified. All findings come from reading the source, running the project's own
> verification tooling, and a read-only Playwright harness kept outside the repository.

---

## Overall Project Score

# 9 / 10 — Excellent

A three-locale, statically prerendered marketing site: **3,123 lines of production TypeScript**,
**685 automated tests**, and **10 quality gates that all pass** on the audited commit.

What earns the 9 is not the modern stack but the fact that quality is **enforced rather than agreed**:
architecture layering is machine-checked (0 violations across 183 modules), the change-detection
contract is asserted against compiled component definitions, the cross-repo API payload is pinned by a
contract test, CSP script hashes are regenerated from the real build, and the design tokens fail the
build on an off-scale value. Production code contains **zero** `any`, `@ts-ignore`, non-null
assertions, `eslint-disable`, or lifecycle hooks.

What keeps it off 10: two reproducible layout defects at 320px in Armenian, four uses of a deprecated
API overload, a wasted font preload on 18 of 27 pages, and two of the project's own documented
measurements having drifted out of truth. None of the deductions are architectural.

---

## Scorecard

| Category          |    Score | Verdict                                                                                           |
| ----------------- | -------: | ------------------------------------------------------------------------------------------------- |
| Code Quality      | **9**/10 | Largest file 219 lines; zero type escape hatches anywhere in the repo                             |
| Architecture      | **9**/10 | `core←shared←layout←pages` enforced by 8 rules, 0 violations; one over-concentrated SEO module    |
| Design Patterns   | **9**/10 | Seven patterns, each earning its place; no over-abstraction                                       |
| Angular 22        | **9**/10 | Signals-first, zoneless, all 66 components OnPush, no lifecycle hooks; 4 deprecated calls         |
| TypeScript        | **9**/10 | 8 strictness flags + `strictTemplates`; `noUncheckedIndexedAccess` still off                      |
| SCSS / CSS        | **9**/10 | Build-validated tokens; 0 `!important`, 0 `::ng-deep`, max nesting 4; chip labels don't wrap      |
| Responsive Design | **7**/10 | 241 of 243 measured combinations clean — **2 real overflows at 320px**                            |
| Component Design  | **9**/10 | Strict smart/dumb split, 30 `input.required`; two small coupling smells                           |
| Performance       | **8**/10 | 125.25 kB initial transfer, 21 lazy chunks, 27 prerendered routes, no leaks; wrong font preloaded |
| Testing           | **9**/10 | 280 unit + 362 e2e + 43 script tests pass; axe WCAG 2.1 AA ×27 pages; **Chromium only**           |
| Maintainability   | **9**/10 | Rationale-rich, measurement-citing comments — two of which have drifted false                     |
| Scalability       | **8**/10 | Structurally ready; 5,225 lines of copy compiled into the bundle is the first wall                |

---

## Top 10 Issues

| #   | Severity    | Issue                                                                                                                                                                                                        | Location                                    | Evidence   |
| --- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ---------- |
| 1   | 🔴 **High** | **Horizontal overflow at 320px in Armenian** — `/hy` home +20px, `/hy/contact` +9px. Measured; English and Russian clean at all widths                                                                       | `why.scss`, `chip-select.scss`              | §10.3      |
| 2   | 🟠 Medium   | **Root cause of #1:** Material chip labels not wrapped. Armenian label min-content = 270px; `.why__card` padding brings its min-content to exactly 320px, so it cannot fit the gutter                        | `why.scss:76-82`                            | §9.3       |
| 3   | 🟠 Medium   | **320px is untested.** The project's own `overflow.spec.ts` covers only 390px and 840px — both live defects are 70px narrower                                                                                | `e2e/overflow.spec.ts:20-23`                | §10.3      |
| 4   | 🟠 Medium   | **Four calls to a deprecated API overload** in the conversion path. `readonly(path, fn)` is `@deprecated`; `readonly(path, {when})` is the public form. Invisible to `tsc` and ESLint                        | `contact-form.ts:134-137`                   | §7.3       |
| 5   | 🟠 Medium   | **Wrong font preloaded on 18 of 27 prerendered pages.** All pages preload Inter **Latin**; the Armenian and Russian pages' actual fonts are not preloaded and not referenced in the head                     | `src/index.html:22-28`                      | §12.4      |
| 6   | 🟠 Medium   | **Chromium-only e2e.** A public site using `:has()`, `color-mix()`, `dvh` and `@defer` has never been rendered in WebKit by any test                                                                         | `playwright.config.ts:26-31`                | §13.5      |
| 7   | 🟠 Medium   | **Unit-test builder reports an unsupported configuration** on every run — in the gate that guards every other gate                                                                                           | `angular.json` (test target)                | §13.4      |
| 8   | 🟡 Low      | **SEO logic concentrated in one 188-line provider closure**; breadcrumbs and JSON-LD cannot be unit-tested in isolation                                                                                      | `document-meta.ts:59-187`                   | §5.5       |
| 9   | 🟡 Low      | **Documentation drift ×2.** `.stylelintrc.cjs` claims 7 inline-style components and a `container.page()` mixin (actual: 1 and none); `README.md` calls Signal Forms experimental (actual: `@publicApi 22.0`) | `.stylelintrc.cjs:11-16`, `README.md:17-19` | §6.2, §7.4 |
| 10  | 🟡 Low      | **`noUncheckedIndexedAccess` not enabled** — 6 index reads are safe today only via type coupling a refactor could silently break                                                                             | `tsconfig.json`                             | §8.3       |

### Separately: product readiness, not a code defect

**The contact form cannot submit in production.** `environment.production.ts` ships `apiOrigin: ''`,
so `HttpContactSubmitter` returns `not-configured` and issues no request; the visitor is shown the
published email address instead. This is **deliberate, documented and guarded** — `CONTACT_API.md`
records that the NestJS API is written but not deployed, documents both deployment topologies with
ordered steps, and `api-origin.spec.ts` is a build-failing tripwire against a misconfiguration. The
failure mode is correct (no request, no relative-URL fallback, working alternative offered). But the
business impact is real: the primary conversion path of a lead-generation site is inactive. (§14.5)

### Verified NOT issues (checked, and deliberately not inflated)

- **No OnPush declarations anywhere** — not a defect. Angular 22.2.3 compiles an omitted strategy _to_
  OnPush (`onPush: changeDetection !== Eager`, with `OnPush = 0 / Eager = 1`). Verified against the
  installed framework source. All 66 components are OnPush. (§7.1)
- **15 high-severity npm advisories** — no runtime exposure. Verified independently: `zod`, `vite` and
  `launch-editor` appear in **0** files of `dist/nexora/browser`. The project's documentation is
  accurate. (§14.6)
- **243 instances of sub-24px tap targets** — **not** a WCAG 2.2 failure. Footer links measure 17px
  tall with 19px gaps = 36px centre spacing ≥ 24px, so SC 2.5.8's spacing exception is satisfied.
  (§10.4)
- **No memory leaks.** All 3 subscriptions use `takeUntilDestroyed()`, all 12 reactive bridges use
  `toSignal`, both `IntersectionObserver`s disconnect on cleanup. (§12.3)

---

## Main Architectural Risks

1. **WebKit is entirely unverified** — the largest _unknown_, and unknowns outrank known small
   defects. The 320px Armenian overflow is the cautionary precedent: invisible for exactly the same
   structural reason (an untested axis), and real. A 362-test suite asserting precise geometry already
   exists; it simply never runs in Safari.
2. **Content is compiled into the bundle** — 5,225 lines across 50 `*.content.ts` files. The right
   trade for an engineer-owned 9-page site (type-checked copy, no CMS to run), but the first wall the
   project hits if non-engineers need to edit copy or a fourth locale arrives.
3. **Documentation trust is load-bearing.** This codebase substitutes measured comments for tribal
   knowledge more successfully than most, which makes a stale measurement a structural failure rather
   than cosmetic noise. Two have already drifted.
4. **The SEO module is the lowest test seam in the codebase** and governs the output most expensive to
   get wrong (structured data, canonicals, `hreflang`).
5. **Narrow-viewport and locale interaction is under-instrumented.** Armenian compounds are
   systematically wider than English or Russian; the project knows this (its locale-aware header
   breakpoints prove it) but tests it at only two widths.

---

## Highest-Priority Recommendations

### P0 — do first

| ID       | Action                                                                                                                                                      | Files                                                                | Effort        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------- |
| **P0-2** | Add 320px to `VIEWPORTS` — **do this first**, so both defects fail before the fix                                                                           | `e2e/overflow.spec.ts:20-23`                                         | 1 line        |
| **P0-1** | Let Material chip labels wrap: `white-space: normal; overflow-wrap: anywhere` on `.mdc-evolution-chip__text-label` in both chip contexts                    | `why.scss`, `chip-select.scss`                                       | ~2 lines each |
| **P0-3** | Deploy the contact API, following the ordered steps already in `CONTACT_API.md` (same-origin nginx proxy is the documented recommendation) _(product task)_ | `environment.production.ts`, `public/_headers`, `api-origin.spec.ts` | deployment    |

### P1 — high

| ID       | Action                                                                                                                                                       | Files                                     | Effort                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | -------------------------------- |
| **P1-1** | `readonly(inquiry.x, { when: () => this.sending() })` ×4 — removes the only known Angular-major blocker in the conversion path                               | `contact-form.ts:134-137`                 | 4 lines                          |
| **P1-4** | Add `webkit` (then `firefox`) to the e2e matrix + CI install. **Highest information per unit of effort** — converts the biggest blind spot into test results | `playwright.config.ts:26-31`, `ci.yml:32` | config small; triage is the cost |
| **P1-2** | Preload the correct font per locale (Noto Sans Armenian for `hy`, Inter Cyrillic for `ru`)                                                                   | `src/index.html`, `document-meta.ts`      | small                            |
| **P1-3** | Resolve or document the unit-test builder pairing — don't leave an unexplained unsupported-configuration warning                                             | `angular.json`                            | investigate, then small          |

### P2 — medium

| ID       | Action                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| **P2-5** | Enable `noUncheckedIndexedAccess` and fix the ~6 resulting diagnostics                                           |
| **P2-1** | Extract `breadcrumbItems` and the JSON-LD `@graph` builder from `document-meta.ts` into exported pure functions  |
| **P2-2** | Correct the README's Signal Forms claim — stable API, but `readonly(path, fn)` is deprecated                     |
| **P2-3** | Enable `@typescript-eslint/no-deprecated` so the next deprecation is caught by CI, not an audit                  |
| **P2-4** | Trial `@defer (on viewport)` on the three below-fold home sections; keep only if LCP/CLS measurement supports it |

### P3 — low

Fix the `.stylelintrc.cjs` header (P3-1) · remove the dead `minus` icon (P3-2) · add `wcag22aa` to the
axe tag set (P3-3) · document or derive `Header`'s navigation counters (P3-4) · stop targeting
`.mat-mdc-select` in `focusFirstInvalid` (P3-5) · enable coverage reporting without a gate (P3-6) ·
periodically re-verify documented measurements (P3-7).

---

## Verification at a Glance

| Gate                             | Result                                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `npm run format:check`           | ✅ clean                                                                           |
| `ng lint`                        | ✅ clean                                                                           |
| `npm run lint:deps`              | ✅ **0 violations** (183 modules, 518 deps)                                        |
| `npm run lint:styles`            | ✅ clean                                                                           |
| `npm run typecheck` (4 projects) | ✅ exit 0                                                                          |
| `npm run test:scripts`           | ✅ 43 / 43                                                                         |
| `npm test -- --no-watch`         | ✅ **280 / 280** (43 files)                                                        |
| `npm run build`                  | ✅ 27 routes prerendered · 499.48 kB raw / **125.25 kB transfer**                  |
| `npm run verify:prerender`       | ✅ 27 pages navigable without JavaScript                                           |
| `npm run verify:headers`         | ✅ 5 inline-script hashes, 6 headers, nginx snippet in step                        |
| Responsive sweep (this audit)    | **243 combinations** (9 widths × 3 locales × 9 pages) → 241 clean, **2 overflows** |

**Not verified:** e2e execution (362 tests — reviewed, not run) · Firefox/WebKit rendering · Core Web
Vitals · coverage percentage · flaky-test incidence · real-device testing · non-geometric visual
regression · production deployment · `Nexora-back` API quality (out of scope) · per-locale translation
completeness.

**Source modification:** none. `git status --porcelain` empty before and after; all audit tooling
written to the session scratchpad, never into the repository.
