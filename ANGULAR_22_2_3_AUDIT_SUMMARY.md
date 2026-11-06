# Nexora — Angular 22.2.3 Audit Summary

**Project:** `C:\Users\xXx\Desktop\Nexora` · Angular **22.2.3** · TypeScript **6.0.3** · rxjs **7.8.2**
**Audit date:** 2026-11-05 · **Commit:** `f5abc3b` (working tree clean)
**Full report:** [`ANGULAR_22_2_3_ADVANCED_AUDIT.md`](./ANGULAR_22_2_3_ADVANCED_AUDIT.md)

> Read-only audit. No source file was modified. Every claim is grounded in installed framework
> source under `node_modules/`, project source, or a command actually executed.

---

## Overall Angular Architecture Score

# 8 / 10

**Nexora uses Angular 22.2.3 deliberately, not decoratively.**

The decisive evidence is negative. A project adopting modern Angular for appearance shows a
predictable signature: `resource()` wrapped around a mutation, `linkedSignal()` where `computed()`
suffices, `effect()` used to compute values, writable signals exposed publicly. Nexora shows
**none** of these. It holds **3 writable signals (all private/protected), 30 `computed()`, and 3
`effect()`** — every one of which synchronises state into a system the template cannot reach.

What costs it two points: four calls to a **deprecated** Signal Forms overload reached production
in the site's only conversion path and passed all ten CI gates, because nothing looks for
deprecation. And the real first-load JavaScript is **~1.7× the figure the build reports**, which
nothing in the project acknowledges.

---

## API Scorecard

| Category                      |    Score | Verdict                                                                                                                                                                                                                                                                                           |
| ----------------------------- | -------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Signal Forms**              | **8**/10 | Typed `form()` over a signal model, reusable `Field<T>`-accepting child, limits shared with the backend by test, `provideSignalFormsConfig` for the Material bridge. Deducted: deprecated overload ×4, state duplicated against `submitting()`, `onInvalid` unused, `readonly()` on 4 of 9 fields |
| **Signals Architecture**      | **9**/10 | 3 writable signals, **none public**; 30 `computed()`; 3 effects all external-sync; no side effects in `computed()`; no circular deps (machine-verified)                                                                                                                                           |
| **linkedSignal() Usage**      | **8**/10 | **0 uses — correct.** 3 of 4 candidate sites would be actively wrong; the one real candidate is solved by a documented clamp                                                                                                                                                                      |
| **Lazy Loading**              | **7**/10 | All 9 routes `loadComponent`, 21 named chunks, Material out of `main`. Deducted: real first load ~1.7× the reported figure; `@defer` serves prerendering, not bundle size                                                                                                                         |
| **Routing Architecture**      | **9**/10 | 27 routes × 3 locales in **73 lines**; `canMatch` used for exactly its purpose; `satisfies`-typed route data; correct restraint on resolvers                                                                                                                                                      |
| **Resource API**              | **9**/10 | **0 uses — correct, and adoption would be a defect.** The only HTTP call is a POST; Angular's own TSDoc warns `resource` "could prematurely abort mutations"                                                                                                                                      |
| **RxJS Integration**          | **9**/10 | Conversion at every boundary, `takeUntilDestroyed` on 3/3 subscriptions, 0 `toObservable`, and correct _retention_ of RxJS where event occurrence matters                                                                                                                                         |
| **Cross-API Integration**     | **8**/10 | One coherent reactive story; no duplicate requests, races or round-trips. Deducted: the one state redundancy; query-param pattern repeated 3×                                                                                                                                                     |
| **Angular 22.2.3 Compliance** | **8**/10 | Genuinely zoneless (no zone.js), OnPush throughout by v22 semantics, `provideHttpClient()` correct for the fetch default, 30 `input.required`, zero constructor injection. Deducted: deprecated overload, no lint rule to catch the next                                                          |

---

## Top 10 Findings

| #   | ID       | Severity  | Finding                                                                                                                                                                                                                                                   | Location                             |
| --- | -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1   | **A-01** | 🟠 Medium | **Deprecated API in production.** `readonly(path, fn)` is `@deprecated` (`signals.d.ts:95-100`); `readonly(path, {when})` is the supported form. 4 call sites in the only conversion path — invisible to `tsc`, ESLint and all 10 gates                   | `contact-form.ts:134-137`            |
| 2   | **A-02** | 🟠 Medium | **Duplicated submission state.** `sending` mirrors the `submitting()` signal Signal Forms already sets — verified in the runtime (`_validation_errors-chunk.mjs:1853-1864`). The component already reads it at `:140`. No reactive cycle prevents merging | `contact-form.ts:114, 140, 171, 183` |
| 3   | **A-03** | 🟠 Medium | **Reported initial bundle understates real cost ~1.7×.** Build prints "125.31 kB transfer"; the home page references **6 JS files, 818 kB raw / ~215 kB gzip**, all `modulepreload`ed into the critical path                                              | `dist/nexora/browser/index.html`     |
| 4   | **A-09** | 🟡 Low    | **No deprecation detection.** `@typescript-eslint/no-deprecated` is not enabled, which is why A-01 passed every gate — in a project that otherwise machine-enforces its architecture                                                                      | `eslint.config.js`                   |
| 5   | **A-05** | 🟡 Low    | **`readonly()` applied to 4 of 9 editable fields.** The two selects and two chip groups stay live during submit, so a mid-flight change shows a value that was not sent                                                                                   | `contact-form.ts:134-137`            |
| 6   | **A-06** | 🟡 Low    | **`Header` subscribes to `router.events` twice**, via two different lifecycle mechanisms, for one concern                                                                                                                                                 | `header.ts:63-69, 80-87`             |
| 7   | **A-07** | 🟡 Low    | **Non-signal mutable counters** (`navigations`, `openedAtNavigation`) — the only non-signal mutable state in the codebase, driving UI behaviour, uncommented                                                                                              | `header.ts:54-55`                    |
| 8   | **A-04** | 🟡 Low    | **`onInvalid` submit hook unused**; a post-`await` `invalid()` check is used instead. Not equivalent — the current form is a deliberate-looking superset, but undocumented                                                                                | `contact-form.ts:189-191`            |
| 9   | **A-08** | 🟡 Low    | **`CanActivateFn` used primarily to mutate global locale state** and return `true`. Timing is load-bearing, so the mechanism is justified; the mixed responsibility is not named                                                                          | `locale-routing.ts:18-35`            |
| 10  | **A-10** | 🟡 Low    | **Documentation inaccuracy.** `CONTACT_API.md` says the form "posts with XHR"; v22 defaults to `FetchBackend`. The `connect-src` conclusion still holds, so no deployment step changes                                                                    | `CONTACT_API.md`                     |

---

## Verified NOT issues — three conventional findings that dissolved

Each required reading installed framework source. Suppressing them is part of the result.

- **"No component declares `OnPush`."** In v22, omission **is** OnPush:
  `onPush: changeDetection !== ChangeDetectionStrategy.Eager` with `OnPush = 0 / Eager = 1`
  (`_debug_node-chunk.mjs:10343`). All 66 components are OnPush, and a test pins the contract
  against compiled definitions.
- **"`provideHttpClient()` is missing `withFetch()`."** Correct for Angular ≤19, wrong for 22.
  `provideHttpClient()` unconditionally provides `FetchBackend`
  (`_module-chunk.mjs:2036-2043`); `withXhr()` is now the opt-_out_.
- **"The `Scroll` subscription should be a signal."** It must not be. The handler must fire on
  _every_ `Scroll` event including repeat navigation to the same `?challenge=` value — which a
  `computed`/`effect` would not do. RxJS is the correct primitive here.

Also verified absent: memory leaks (3/3 subscriptions use `takeUntilDestroyed`, 2/2
`IntersectionObserver`s disconnect), side effects in `computed()`, circular reactive dependencies,
duplicate requests, and public writable signals.

---

## Critical Architectural Risks

1. **Deprecation is unguarded.** A-01 is not serious in itself; the fact that it reached production
   through ten gates is. This project substitutes machine enforcement for convention everywhere
   else — layered imports, change-detection strategy, design tokens, CSP hashes, the cross-repo
   payload. Deprecated APIs are the one hole, and Signal Forms is the fastest-moving API it uses.
2. **The performance number in circulation is wrong by 1.7×.** Decisions made against "125 kB"
   are being made against a figure that excludes the 198 kB Material chunk and the 141 kB home
   chunk that the page preloads anyway.
3. **The SEO module is the lowest test seam in the codebase** and governs the output most
   expensive to get wrong. `breadcrumbItems` and the JSON-LD `@graph` builder are pure functions
   trapped inside a provider closure (`document-meta.ts:58-187`), reachable only by booting an
   environment injector.
4. **Content is compiled into the bundle** — 50 `*.content.ts` dictionaries. Correct for a 9-page
   engineer-owned site; the first wall if a fourth locale or non-engineer editors arrive.
5. **`Header` concentrates three mechanisms for one concern** (a `toSignal` pipeline, a second
   subscription, two plain counters) and is the hardest component in the codebase to reason about.

---

## Recommended Improvements

### P1 — High

| ID              | Action                                                                                            | Benefit                                                                               | Risk                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **A-01 + A-02** | Delete `sending`; write `readonly(path, { when: () => this.form().submitting() })` ×4             | Removes the only Angular-major blocker **and** the only state duplication in one edit | Low — no cycle (verified); covered by `contact-form.spec.ts` + `contact.spec.ts` |
| **A-09**        | Enable `@typescript-eslint/no-deprecated` — needs type-aware parsing, **not** yet configured here | The next deprecation is caught by CI, not by an audit                                 | Low — may surface others; triage is the cost                                     |
| **A-03**        | Record the measured per-route figure (~215 kB gzip home); add a matching `budgets` entry          | Performance decisions made against the real number                                    | None — measurement only                                                          |

### P2 — Medium

- **§14.1** — Export `breadcrumbItems()` and the JSON-LD builder from `document-meta.ts` as pure
  functions; the initializer calls them. Three new unit tests become possible; zero behaviour change.
- **A-05** — Extend `readonly()` to the selects and chip groups, or comment why they are excluded.
- **A-06 + A-07** — Derive menu-closing from the existing `currentPath` pipeline; convert the
  counters to signals or document the mechanism.
- **A-10** — Correct the XHR claim in `CONTACT_API.md`.

### P3 — Low

`onInvalid` for focus management (A-04) · one `shouldShowError(field)` helper to replace 14
duplicated `touched() && invalid()` expressions (A-11) · a `canDeactivate` dirty-form guard on
`/contact` (A-12) · rename `syncLocaleWithUrl` to express intent (A-08) · trial a `contact`-only
preloading strategy · extract `queryParam(name, guard)` **only if a fourth page needs it**.

### Explicitly NOT recommended

Replacing `HttpContactSubmitter` with `resource()` (premature mutation abort) · introducing
`linkedSignal()` (no site benefits) · adding resolvers (content is prerendered) · enabling
`withComponentInputBinding()` (saves one line per page against a global config change) · converting
the `Scroll` subscription to a signal (breaks repeat navigation).

---

## Verification at a Glance

| Check                                         | Result                                                                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Installed versions (11 `@angular/*` packages) | ✅ all `22.2.3`, `@angular/ssr` `22.2.4` — no skew                                                                                                     |
| `zone.js` installed?                          | ❌ absent → **genuinely zoneless**                                                                                                                     |
| `npm run build`                               | ✅ 27 routes prerendered                                                                                                                               |
| `npm run lint` · `lint:styles` · `lint:deps`  | ✅ clean · clean · **0 violations** (183 modules, 518 deps)                                                                                            |
| `npm run typecheck` (4 projects)              | ✅ exit 0                                                                                                                                              |
| `npm test -- --no-watch`                      | ✅ **280 / 280**                                                                                                                                       |
| `npm run test:scripts`                        | ✅ 43 / 43                                                                                                                                             |
| **Full Playwright e2e suite**                 | ✅ **528 / 528** (5.5 min)                                                                                                                             |
| `verify:prerender` · `verify:headers`         | ✅ 27 pages without JS · 5 hashes, 6 headers                                                                                                           |
| Per-route JS measured from `dist/`            | 4 routes (`/`, `/contact`, `/services`, `/hy`)                                                                                                         |
| Framework source verified                     | `readonly` overloads · `submit()` runtime · `shouldSkipValidation` · `provideHttpClient` backend · `resource()` TSDoc · `ChangeDetectionStrategy` enum |

**Not verified:** Core Web Vitals · Firefox/WebKit · coverage percentage · bundle duplicate-dependency
analysis (needs an analyzer dependency, excluded by the brief) · runtime reactive-graph profiling ·
Material `readonly` propagation to select/chip · `Nexora-back` API quality (out of scope).

**Source modification:** none. `git status --porcelain` empty before and after; only the two
deliverables were created.

> **Baseline disclosure.** The audited commit `f5abc3b` contains two source changes made in the
> **previous** task of this session at the user's explicit request (320px viewport added to
> `e2e/overflow.spec.ts`; chip-label wrapping in `src/styles/theme/_chip.scss`). They were committed
> before this audit began, are CSS/test-only, and touch no Angular API discussed here.
