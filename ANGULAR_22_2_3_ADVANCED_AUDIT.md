# Nexora — Angular 22.2.3 Advanced Architecture Audit

**Project:** `C:\Users\xXx\Desktop\Nexora`
**Audit date:** 2026-11-05
**Commit audited:** `f5abc3b` (working tree clean — verified before and after)
**Auditor role:** Staff / Principal Angular Engineer & Software Architect
**Scope:** Angular 22.2.3 API usage, reactive architecture, routing, loading architecture

> **Method.** Every claim below is grounded in the installed framework source under `node_modules/`,
> the project's own source, or a command actually executed during this audit. Where a conclusion
> could not be established, it is labelled rather than guessed. Three findings that a conventional
> Angular review would have raised were investigated and **disproved**; they are recorded in §3.3
> as `FALSE POSITIVE` because suppressing them is part of the result.

---

## 1. Executive Summary

Nexora is a three-locale, statically prerendered marketing site: 66 components, 3,094 lines of
production TypeScript, one form, one HTTP call. The question this audit exists to answer is
whether it uses Angular 22.2.3 deliberately or decoratively.

**It is deliberate.** The strongest evidence is not the APIs the project uses but the ones it
**correctly declines to use**:

- `resource()` / `rxResource()` — **0 uses.** The app's only HTTP call is a `POST`. Angular's own
  TSDoc in the installed package states `resource` "is intended for _read_ operations, not
  operations which perform mutations" and warns it "could prematurely abort mutations." Adopting
  it here would introduce a defect. Absence is the correct answer. (§9)
- `linkedSignal()` — **0 uses.** Exactly one site in the codebase is a plausible candidate
  (`why.ts`), and it is solved with a clamped `computed()` that is simpler and preserves selection
  across locale changes. (§6)
- `asReadonly()` — **0 uses**, and correctly so: all three writable signals in the codebase are
  `private` or `protected`, so there is no public surface to protect. (§5)

The reactive model is unusually disciplined: **3 writable signals, 30 `computed()`, 3 `effect()`**.
All three effects synchronise signal state into systems Angular's template cannot reach (the
`<html lang>` attribute, `document.head`, an `IntersectionObserver`) — which is what `effect()` is
for. There are no side effects inside `computed()`, no `untracked()` escape hatches, and no
signal-to-observable conversions.

**What holds the score down** is concentrated in three places:

1. **Four calls to a deprecated Signal Forms overload** (`contact-form.ts:134-137`), invisible to
   `tsc`, ESLint and all 10 CI gates, sitting in the site's only conversion path. (§13)
2. **Duplicated submission state.** The component maintains a `sending` signal that mirrors the
   `submitting()` signal Signal Forms already provides, verified in the framework runtime. (§4.4)
3. **The reported initial bundle understates the real cost by ~1.7×.** The build prints
   "Initial total 499.68 kB raw / 125.31 kB transfer," but the prerendered home page references
   **6 JavaScript files totalling 818 kB raw / ~215 kB gzip**, all `modulepreload`ed. (§7.3)

None of these are architectural. The layering, the state ownership and the routing design are
sound and would survive significant growth.

**Overall Angular Architecture: 8 / 10.**

---

## 2. Verified Angular Version and Package Compatibility

Read from `node_modules/*/package.json` (installed truth, not the manifest range):

| Package                     | Declared  | **Installed** |
| --------------------------- | --------- | ------------- |
| `@angular/core`             | `^22.2.3` | **22.2.3**    |
| `@angular/common`           | `^22.2.3` | **22.2.3**    |
| `@angular/forms`            | `^22.2.3` | **22.2.3**    |
| `@angular/router`           | `^22.2.3` | **22.2.3**    |
| `@angular/platform-browser` | `^22.2.3` | **22.2.3**    |
| `@angular/compiler-cli`     | `^22.2.3` | **22.2.3**    |
| `@angular/build`            | `^22.2.3` | **22.2.3**    |
| `@angular/material`         | `^22.2.3` | **22.2.3**    |
| `@angular/cdk`              | `^22.2.3` | **22.2.3**    |
| `@angular/ssr`              | `^22.2.4` | **22.2.4**    |
| `typescript`                | `~6.0.0`  | **6.0.3**     |
| `rxjs`                      | `~7.8.0`  | **7.8.2**     |

`CONFIRMED` — all `@angular/*` packages are at an identical minor/patch (`22.2.3`) except
`@angular/ssr` at `22.2.4`, which is the intended independent cadence for that package. No version
skew. TypeScript 6.0.3 is within the range `@angular/compiler-cli@22.2.3` supports (verified: the
`typecheck` script runs four `tsc` projects to exit 0).

`zone.js` is **not installed** — `CONFIRMED` by directory check. The application is therefore
genuinely zoneless; in Angular 22 no `provideZonelessChangeDetection()` call is required when
zone.js is absent, and `app.config.ts` correctly omits it.

---

## 3. Angular 22.2.3 API Compatibility Analysis

### 3.1 API census (production code, `src/app`, excluding specs and `*.content.ts`)

| API                             |  Uses | Assessment                                               |
| ------------------------------- | ----: | -------------------------------------------------------- |
| `computed()`                    |    30 | Primary derivation mechanism                             |
| `inject()`                      |    37 | Exclusive DI style; zero constructor-parameter injection |
| `input.required<T>()`           |    30 | Every presentational input is required-typed             |
| `viewChild` / `viewChildren`    |    13 | Signal queries only                                      |
| `toSignal()`                    |     6 | 3 with `requireSync: true`                               |
| `form()` (Signal Forms)         |     5 | One form, correctly structured                           |
| `signal()` (writable)           | **3** | All `private`/`protected`                                |
| `effect()`                      | **3** | All external-system synchronisation                      |
| `takeUntilDestroyed()`          |     3 | Every manual subscription                                |
| `afterNextRender()`             |     2 | Post-render DOM reads                                    |
| `@defer`                        |     2 | Prerender-compatibility, not perf (§7.4)                 |
| `linkedSignal()`                | **0** | §6 — correct restraint                                   |
| `resource()` / `rxResource()`   | **0** | §9 — correct, and adoption would be a defect             |
| `untracked()`                   |     0 | Not needed; no read-without-track situations             |
| `asReadonly()`                  |     0 | Not needed; no writable signal is public                 |
| `toObservable()`                |     0 | No signal→observable conversions                         |
| `output()` / `model()`          | 3 / 0 | §5.4                                                     |
| `input()` (optional)            |    17 | Defaults rather than required bindings                   |
| `changeDetection:` declarations | **0** | §3.3 — correct in v22                                    |

### 3.2 Deprecated API usage

`CONFIRMED` — one deprecated API is in use. Full detail in §13.

### 3.3 Three findings investigated and disproved

These matter because each is what a version-unaware review would report as a defect.

**`FALSE POSITIVE` — "No component declares `changeDetection: OnPush`."**
Zero of 66 components declare a strategy. In Angular 22 this _is_ OnPush. Verified in the installed
runtime, `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:10343`:

```js
onPush: componentDefinition.changeDetection !== ChangeDetectionStrategy.Eager,
```

with the enum at `node_modules/@angular/core/types/_debug_node-chunk.d.ts:4966-4987` defining
`OnPush = 0`, `Eager = 1`, and `Default = 1` marked `@deprecated`. Omission yields OnPush. The
project additionally pins this contract with a test (`src/app/change-detection.spec.ts`) that reads
`ɵcmp.onPush` off every compiled component. **Not a defect.**

**`FALSE POSITIVE` — "`provideHttpClient()` is missing `withFetch()`."**
Correct advice for Angular ≤19; wrong for 22. Verified in
`node_modules/@angular/common/fesm2022/_module-chunk.mjs:2036-2043`, `provideHttpClient()`
unconditionally provides:

```js
{ provide: HttpBackend, useFactory: () => inject(FetchBackend) }
```

`FetchBackend` is now the default and `withXhr()` is the opt-_out_. `app.config.ts:21` is already
modern. **Not a defect.**

**`FALSE POSITIVE` — "The `Scroll` event subscription in `solutions.ts:48-58` should be a signal."**
It should not. The handler must fire on _every_ `Scroll` event, including a repeat navigation to
the same `?challenge=` value. A `computed()`/`effect()` on that value would not re-run when the
value is unchanged, silently breaking re-navigation to the same anchor. RxJS is the correct
primitive for an event stream whose _occurrences_ matter rather than its current value. **Correct
as written** — and a genuine display of judgment.

---

## 4. Signal Forms Audit — **8 / 10**

Subject: `src/app/pages/contact/contact-form/` (the application's only form).

### 4.1 What is implemented correctly

**Model and schema** (`contact-form.ts:113-138`). The model is a `signal<ContactInquiry>` of a
flat, fully `readonly` interface (`contact-submitter.ts:3-15`), and the schema is declared once in
the `form()` callback:

```ts
private readonly model = signal<ContactInquiry>({ ...DEFAULTS });

protected readonly form = form(this.model, (inquiry) => {
  required(inquiry.interest);
  required(inquiry.name);     maxLength(inquiry.name, NAME_MAX);
  required(inquiry.email);    email(inquiry.email);  maxLength(inquiry.email, EMAIL_MAX);
  ...
});
```

Validation is declarative and co-located with the field paths — the intended Signal Forms shape.
Type safety is end-to-end: `form.email` is a typed `Field<string>` derived from `ContactInquiry`,
so a renamed model property is a compile error at every template binding.

**The limits are shared, not restated.** `NAME_MAX`, `EMAIL_MAX`, `COMPANY_MAX`, `DESCRIPTION_MAX`
are exported (`contact-form.ts:51-55`) and asserted against the backend DTO by
`contact-contract.spec.ts`. The validation constants therefore live in exactly one place and
cross-repo drift fails a build. This is the single best thing about the form.

**Reusable form component — `ChipSelect`** (`chip-select/chip-select.ts:16-27`):

```ts
export class ChipSelect {
  readonly field = input.required<Field<string>>();
  readonly options = input.required<readonly ChipOption[]>();
  readonly labelledBy = input.required<string>();
}
```

Accepting `Field<string>` as a required input and binding it with `[formField]` in its own template
is the correct composition pattern for Signal Forms. The component is purely presentational, knows
nothing about `ContactInquiry`, and is reused for two different fields (`interest`, `method`).

**Material integration via the supported config API** (`contact-form.ts:70-76, 96-99`):

```ts
providers: [
  { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
  provideSignalFormsConfig({ classes: STATUS_CLASSES }),
];
```

`STATUS_CLASSES` maps `ng-invalid` / `ng-valid` / `ng-touched` / `ng-untouched` / `ng-dirty` onto
Signal Forms field state. This is the documented bridge (`FormFieldBinding` →
`{ [className: string]: (formField: FormFieldBinding) => boolean }`, verified at
`_structure-chunk.d.ts:1791`) that lets Material's CSS, which expects the legacy `ng-*` classes,
work with Signal Forms. Using the provided hook rather than hand-rolled `[class.]` bindings is the
right call.

**Accessibility choices are deliberate.** `readonly()` rather than `disabled()` during submission
keeps the inputs focusable and announced; `[attr.aria-busy]="submitting()"` on the form;
per-field error identity via `form.email().getError('required')` (`contact-form.html:79`) to
distinguish _required_ from _malformed_ rather than showing one generic message.

### 4.2 `CONFIRMED` — Deprecated overload, 4 call sites

See §13 for full detail. `contact-form.ts:134-137`.

### 4.3 `CONFIRMED` — Duplicated submission state

**Severity:** Medium · **Type:** Architectural Weakness / Redundant State
**Files:** `src/app/pages/contact/contact-form/contact-form.ts:114, 140, 171, 183`

The component declares its own flag:

```ts
private readonly sending = signal(false);        // :114
```

set at `:171` and cleared at `:183`, and used to drive the four `readonly()` rules. But Signal
Forms already tracks this. Verified in the runtime,
`node_modules/@angular/forms/fesm2022/_validation_errors-chunk.mjs:1853-1864`:

```js
try {
  if (shouldRun) {
    node.submitState.selfSubmitting.set(true);
    const errors = await untracked(() => action?.(field, detail));
    ...
} finally {
  node.submitState.selfSubmitting.set(false);
}
```

and exposed as `readonly submitting: Signal<boolean>` (`_structure-chunk.d.ts:1337`). The component
_already reads it_ at `:140`:

```ts
protected readonly submitting = computed(() => this.form().submitting());
```

So two signals track the same fact, set in two places, with `sending` strictly contained within
`submitting`'s window. **Why it is a problem:** the two can diverge. If the `action` closure ever
gains an early `return` that bypasses the `finally`, or a second submission path is added, the
`readonly()` rules and the disabled button will disagree about whether a send is in flight.

**No reactive cycle prevents the merge.** `readonly` is computed from
`parent.readonly() || logic.readonly.compute(ctx)` (`_validation_errors-chunk.mjs:1673`) and
`submitting` from `selfSubmitting() || parent.submitting()` (`:1337-1338`). Neither depends on the
other; `readonly` reading `submitting` creates no loop.

**Recommended:** delete `sending`, and write the rules as
`readonly(inquiry.name, { when: () => this.form().submitting() })` — which also discharges the
deprecation in §13 in the same edit.

### 4.4 `CONFIRMED` — `onInvalid` hook unused

**Severity:** Low · **Type:** Best Practice Deviation
**File:** `src/app/pages/contact/contact-form/contact-form.ts:169-191`

```ts
await submitForm(this.form, { action: async () => { ... } });

if (this.form().invalid()) {
  this.focusFirstInvalid();
}
```

`FormSubmitOptions` provides `onInvalid?: (field, detail) => void`
(`_structure-chunk.d.ts:991-994`), invoked by `submit()` precisely when validation blocks the
action (`_validation_errors-chunk.mjs:1861`).

**Nuance, stated honestly:** these are _not_ equivalent, and the current code is not simply wrong.
`onInvalid` fires only on pre-submission validation failure. The post-`await` check also fires when
the action itself attached submission errors via `setSubmissionErrors`. Since this action returns
`undefined` (`:185`), that branch is currently unreachable — but it is a deliberate-looking
superset. Classified as **Potential Improvement**, not a defect: moving to `onInvalid` is more
idiomatic and removes a re-read of form state, but the author may have intended the broader
behaviour. Worth a one-line comment either way.

### 4.5 `CONFIRMED` — `readonly()` applied asymmetrically

**Severity:** Low · **Type:** Confirmed Inconsistency
**File:** `contact-form.ts:134-137` vs `contact-form.html:124-134, 178-208, 219-225`

`readonly()` locks `name`, `email`, `company`, `description` during submission. It is **not**
applied to `interest`, `service`, `timeline`, `budget` or `method` — the two `mat-select`s and the
two `app-chip-select`s.

The payload is captured once at `:173` (`this.submitter.submit(this.model())`). A visitor who
changes the Service dropdown while the request is in flight sees a UI state that does not match
what was sent. The submit button is disabled, so this cannot cause a double-send; the impact is
limited to a display/actual mismatch in a window of a few hundred milliseconds. Low, but
unexplained — the asymmetry reads as an oversight rather than a decision.

### 4.6 `FALSE POSITIVE` — `readonly()` suppressing validation is harmless _here_

Worth recording because it looks alarming. `shouldSkipValidation` is
`hidden() || disabled() || readonly() || isOrphaned()`
(`_validation_errors-chunk.mjs:778`), and `syncErrors` returns `[]` when it is true (`:682-686`).
So while `sending` is true, the four readonly fields report **valid regardless of content**, and
submission errors attached to them would be suppressed.

Verified not to bite: `submit()` only runs the action when the form is already valid
(`shouldRunAction`, `:1871-1880`), and the component clears `sending` in its own `finally` _before_
`submit()` reaches `setSubmissionErrors`. **Currently safe.** It becomes a live hazard the moment
the action starts returning validation errors from the server — which is a documented future step
in `CONTACT_API.md`. Flagged as a latent risk tied to a planned change, not a present defect.

### 4.7 Not implemented, and correctly so

Cross-field validation, async validation (`validateAsync`, `validateHttp`), `debounce()`, nested
forms, form arrays — all absent. For a ten-field, flat, single-shot inquiry form there is no
requirement for any of them. `NO EVIDENCE` of a missing capability.

### 4.8 Minor: duplicated error-visibility expression

`form.X().touched() && form.X().invalid()` appears **14 times** across `contact-form.html` (once
for the `app-field-label [invalid]` binding and once for the `@if` guarding `mat-error`, for each
of 7 fields). Correct and consistent today, but it is the kind of paired expression that drifts
when one of the two is edited. A `shouldShowError(field)` helper or a small computed per field
would make divergence impossible. **Maintainability Issue, low.**

**Score justification — 8/10.** Correct API selection, genuine type safety, a properly reusable
field component, a shared contract with the backend, and deliberate a11y. Deducted for a deprecated
overload in production, state duplicated against a framework-provided signal, an unused lifecycle
hook, and one unexplained asymmetry.

---

## 5. Signals Architecture Audit — **9 / 10**

### 5.1 State ownership and encapsulation — exemplary

`CONFIRMED` — the entire application holds **three** writable signals:

| Signal     | File                                             | Visibility  |
| ---------- | ------------------------------------------------ | ----------- |
| `menuOpen` | `layout/header/header.ts:52`                     | `protected` |
| `sending`  | `pages/contact/contact-form/contact-form.ts:114` | `private`   |
| `selected` | `pages/home/why/why.ts:20`                       | `protected` |

**Not one is public.** A grep for a writable signal declared without `private`/`protected` returns
zero results. This is why `asReadonly()` has no uses: there is no public writable surface to
protect. Absence of the API here is a _consequence of good design_, not a gap — the distinction
matters, and a census-style review would score it backwards.

Everything else derived is a `computed()` (30 of them). The ratio — 30 derived to 3 owned — is the
clearest single indicator that the reactive graph was designed rather than accumulated.

### 5.2 `effect()` — three uses, all legitimate

The common failure mode is `effect()` used to compute values. None of these do.

| Location                         | Purpose                                                                                          | Verdict                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `app.ts:22-24`                   | Writes `document.documentElement.lang` from the locale signal                                    | **Correct.** `<html>` is outside the component tree; a host binding cannot reach it.                          |
| `core/seo/document-meta.ts:118`  | Writes `title`, `meta`, `link[rel]`, JSON-LD into `document.head`                                | **Correct.** DOM outside Angular's rendering.                                                                 |
| `pages/services/services.ts:160` | Builds an `IntersectionObserver` over `viewChildren()`; `onCleanup(() => observer.disconnect())` | **Correct, and textbook.** Depends on a signal, owns an external resource, releases it on re-run and destroy. |

All three synchronise signal state into a system Angular's template cannot express. That is the
documented purpose of `effect()`. **No effect in this codebase computes a value, and none writes a
signal during its own execution** — the `scrolled.set(id)` in `services.ts:168` happens inside the
IntersectionObserver callback, which runs outside the effect's reactive context.

### 5.3 Derived state quality

`services.ts:85-150` is the most complex reactive graph in the project and composes cleanly:

```
params (toSignal, requireSync)
  └─ filter ──┬─ visibleGroups ── visibleCount
              └─ active ◄── scrolled (signal, set by IntersectionObserver)
groups ◄── content + catalogue (dictionaries)
  └─ categories
```

`active = computed(() => filter() === ALL ? scrolled() : filter())` (`:148-151`) is a good example
of composing owned and derived state without duplicating either. No circular dependencies exist —
`CONFIRMED` by `dependency-cruiser` (0 violations, 183 modules, 518 dependencies, with
`tsPreCompilationDeps: true`) and by inspection of the graph above.

`why.ts:24-28` defends against content drift at the point of derivation:

```ts
protected readonly reasons = computed(() => {
  const items = this.disciplines().items;
  // Clamped: a content edit that shortens the list must not throw on a stale selection.
  return items[Math.min(this.selected(), items.length - 1)]?.reasons ?? [];
});
```

### 5.4 `output()` sparse, `model()` unused

> **Correction (2026-11-05).** This section previously stated `output()` had **zero** uses. That
> was wrong: the census regex `output\(` missed the generic call form `output<void>()`. The correct
> count is **3**, and optional `input()` is **17**, not the 2 originally counted. The load-bearing
> zeros in this report — `linkedSignal`, `resource`, `rxResource`, `untracked`, `asReadonly`,
> `model` — were re-checked with a generics-tolerant pattern and **all hold**. The conclusion below
> is unchanged in substance; the numbers are now accurate.

`NOT A FINDING.` Child→parent communication exists and uses `output()` in all three places it is
needed: `field-label.ts:16` (`activate`), `category-nav.ts:19` and `filter-bar.ts:25`. The codebase
has 66 components, of which the overwhelming majority are leaf presentational components rendering
localized copy — so `input.required()` ×30 against `output()` ×3 reflects a deliberately
one-directional data flow rather than an omission. `model()` (two-way) is correctly avoided —
Signal Forms owns the two-way binding for the only form.

### 5.5 `CONFIRMED` — Mutable non-signal state in `Header`

**Severity:** Low · **Type:** Best Practice Deviation
**File:** `src/app/layout/header/header.ts:54-55, 80-96`

```ts
private navigations = 0;
private openedAtNavigation = 0;
```

Two plain mutable numbers participating in UI behaviour (whether a navigation closes the mobile
menu) in an otherwise entirely signal-based codebase. It works — they are written and read only
inside event callbacks, never during change detection, so no staleness is possible. But they are
the single inconsistency in the reactive model, and the mechanism ("close on navigation, but not
on the navigation that opened the menu") is non-obvious enough to deserve either signals or a
comment. It currently has neither.

**Score justification — 9/10.** Near-perfect state ownership, correct and minimal `effect()` use,
no computed side effects, no circular dependencies, clean derivation. Deducted for the two
non-signal mutable counters and the `sending`/`submitting` duplication in §4.3.

---

## 6. `linkedSignal()` Audit — **8 / 10**

`CONFIRMED` — **zero uses in the entire repository** (production, specs and e2e).

The brief asks whether this is correct. Assessed candidate by candidate — `linkedSignal()` applies
to _writable state derived from a source that must reset when the source changes_.

| Candidate                       | State                      | Source                                   | Verdict                                            |
| ------------------------------- | -------------------------- | ---------------------------------------- | -------------------------------------------------- |
| `why.ts:20` `selected`          | index of chosen discipline | `disciplines().items` (locale-dependent) | **Plausible candidate** — see below                |
| `services.ts:85` `scrolled`     | scroll-spy category        | none; written by `IntersectionObserver`  | **No.** Not derived from anything.                 |
| `header.ts:52` `menuOpen`       | menu open/closed           | none                                     | **No.** Pure UI state.                             |
| `contact-form.ts:114` `sending` | in-flight flag             | none                                     | **No** — and it should be deleted entirely (§4.3). |

### 6.1 The one genuine candidate

`why.selected` is writable state whose valid range depends on `disciplines().items`. The canonical
`linkedSignal()` form would be:

```ts
protected readonly selected = linkedSignal({
  source: () => this.disciplines().items,
  computation: (items, previous) =>
    previous && previous.value < items.length ? previous.value : 0,
});
```

**The project's choice is defensible and arguably better.** The current code keeps `selected` as a
plain signal and clamps at the point of _read_ (`why.ts:27`). Two concrete consequences:

- **In favour of the current code:** the dictionary identity changes on every locale switch. A
  `linkedSignal` whose `source` is `items` would re-run its computation on each language change.
  With the `previous.value < items.length` guard above the selection survives — but this is a
  subtlety that must be got right, whereas the plain signal cannot lose the selection at all.
- **In favour of `linkedSignal`:** the current clamp corrects the _view_ but leaves `selected`
  itself out of range. If the list later grows, a stale high index silently returns. This is
  unreachable with compile-time content, so it is theoretical today.

**Verdict:** the clamped `computed()` is simpler, documented with a comment explaining the hazard
it defends against, and has no live defect. Not a finding. The one honest observation is that the
clamp lives in the consumer rather than the state, which would matter if a second consumer of
`selected` ever appeared.

### 6.2 Is the absence a knowledge gap?

`CANNOT DETERMINE` by inspection whether the authors knew about `linkedSignal()` and declined it or
never considered it. What _can_ be determined is that the outcome is correct: there is no site in
this codebase where `linkedSignal()` would remove complexity, and three of the four writable-state
candidates would be actively wrong. Scored on outcome.

**Score justification — 8/10.** Correct restraint — no gratuitous adoption, and no place where its
absence causes a defect. Held at 8 rather than higher because the one real candidate is handled by
clamping at the consumer rather than constraining the state itself, which is the slightly weaker of
two valid designs.

---

## 7. Lazy Loading and Bundle Splitting Audit — **7 / 10**

### 7.1 Route-level splitting — complete

`CONFIRMED` — all 9 page routes use `loadComponent` with a dynamic import
(`app.routes.ts:9, 17, 22, 29, 34, 39, 45, 50, 55, 60`). No page component is statically imported
into the route table. `dependency-cruiser` enforces this structurally via the
`route-table-is-composition-only` rule (0 violations).

`loadChildren` is **not** used, and correctly: the `pages` array is shared by both the `:locale`
branch and the bare branch (`app.routes.ts:65-73`). `loadChildren` would require either duplicating
the table or an extra module boundary for no benefit.

Build output: **21 lazy chunks**, named per feature (`home`, `contact`, `about`, `ai-agent`,
`engagement-models`, `partnerships`, `solutions`, `menu`, `services`, `not-found`, `index`).
Feature boundaries map cleanly onto chunk boundaries.

### 7.2 Angular Material is not in the initial bundle

`CONFIRMED` by marker search over `dist/nexora/browser/*.js`: Material form-field, chips and the
Signal Forms status classes appear in `chunk-JWnqeP6j.js` (contact, 107.73 kB) and
`chunk-PNKN5fCV.js` (shared, 203.31 kB) — both **lazy** chunks per the build manifest, neither
referenced by `<script src>` in `index.html`.

### 7.3 `CONFIRMED` — The reported initial bundle understates real cost by ~1.7×

**Severity:** Medium · **Type:** Performance Risk / Measurement Accuracy

The build prints:

```
Initial total | 499.68 kB raw | 125.31 kB transfer
```

That figure counts `main` + `styles` only. The prerendered home page, measured directly from
`dist/nexora/browser/index.html`, references **six** JavaScript files — one `<script src>` and five
`<link rel="modulepreload">`:

| Chunk                                   |        Raw |        gzip |
| --------------------------------------- | ---------: | ----------: |
| `main-5ETESG5M.js`                      |     465 KB |      138 KB |
| `chunk-PNKN5fCV.js` (shared / Material) |     198 KB |       38 KB |
| `chunk-HxgcnUV_.js` (home)              |     141 KB |       34 KB |
| `chunk-BqiTorfA.js`                     |       9 KB |        3 KB |
| `chunk-BRrYsyF2.js`                     |       2 KB |       ~0 KB |
| `chunk-DASytMcq.js`                     |      <1 KB |       ~0 KB |
| **Total**                               | **818 KB** | **~215 KB** |

Measured equally for other routes: `/contact` 829 KB raw, `/hy` 818 KB raw, `/services` 726 KB raw
across 9 files.

**Why it matters.** `modulepreload` is a high-priority fetch issued during initial page load, not a
deferral — the browser downloads all six before the page is interactive, and hydration requires
them. The lazy chunks are real and correctly split, but on a _prerendered_ site the first route's
chunks are pulled into the critical path by design. The headline 125 kB is therefore not the number
to reason about when judging load performance; ~215 kB gzip is.

This is not a bug in the splitting — it is the honest cost of Angular Material on the home page.
It is a finding because the 125 kB figure is the one quoted when the project's performance is
discussed, and it is 1.7× optimistic.

**Recommended:** cite the per-route measured figure in performance documentation, and treat
~215 kB gzip as the home-page budget. If that is too high, the lever is §7.5.

### 7.4 `@defer` — used for prerender compatibility, not performance

Both `@defer` blocks (`header.html:27, 85`) wrap `matMenuTriggerFor` buttons and use
`(on immediate)` with a plain-link `@placeholder`. The purpose, documented in `README.md`, is that
**the placeholder is what gets prerendered**, so the Services and language controls work before
Angular boots.

`on immediate` begins loading as soon as the client renders, so it defers past hydration but does
not reduce total transferred JavaScript — the `menu` chunk (29.46 kB) loads on every page
regardless of whether the menu is opened.

**Potential Optimization (not a defect):** `(on interaction)` or `(on hover)` would load the menu
chunk only when the user engages with it. The trade-off is real and argues for the current choice:
with `on interaction` the first click lands on the placeholder link and navigates instead of
opening the menu. `on hover` has no touch equivalent. The current choice is defensible; it should
simply not be mistaken for a bundle-size optimization.

### 7.5 Preloading strategy — absent, and that is the right default

`provideRouter(routes, withInMemoryScrolling(...))` (`app.config.ts:19`) specifies no
`withPreloading()`. For a 9-page prerendered marketing site this is correct: `PreloadAllModules`
would pull all 21 lazy chunks on every visit, inflating a site whose visitors typically read one or
two pages. **Potential Improvement:** a custom strategy preloading only `contact` (the conversion
target) from the home page would be a targeted, measurable win. Classified as optional.

### 7.6 Duplicate dependencies across chunks

`CANNOT DETERMINE` with the evidence available. String markers for Material internals appear in
both the contact chunk and the shared chunk, but production class names are minified and the
matches are consistent with component-scoped SCSS (which references `.mat-mdc-form-field` and
`.mdc-evolution-chip`) being inlined into the feature chunk — not with duplicated runtime code.
Establishing this properly requires `--stats-json` plus a bundle analyzer, which would mean
installing a dependency; out of scope per §10 of the brief. **Recorded as unverified, not as a
finding.**

**Score justification — 7/10.** Route splitting is complete, consistent and structurally enforced;
Material is correctly out of the initial bundle. Deducted because the real first-load cost is ~1.7×
the reported figure and is not acknowledged anywhere, and because `@defer` is doing prerender work
rather than the loading work its presence implies.

---

## 8. Routing Architecture Audit — **9 / 10**

### 8.1 Design

`app.routes.ts` is 73 lines for 27 prerendered routes. The locale dimension is expressed once:

```ts
export const routes: Routes = [
  {
    path: ':locale',
    canMatch: [matchLocalePrefix],
    canActivate: [syncLocaleWithUrl],
    children: pages,
  },
  { path: '', canActivate: [syncLocaleWithUrl], children: pages },
];
```

**`canMatch` is the correct guard here, and the choice is load-bearing.** `matchLocalePrefix`
(`core/i18n/locale-routing.ts:15-16`) returns false for a non-locale first segment, so the router
_declines the branch and continues matching_ rather than failing navigation — which is what lets
`/about` and `/hy/about` coexist with one shared `pages` array. `canActivate` could not do this.

Other correct choices:

- **Typed route data.** `data: { meta: 'home' } satisfies DocumentMetaRouteData` on every route
  (`:10, 18, 23, 30, 35, 41, 46, 51, 56, 61`). `satisfies` gives compile-time key checking without
  widening the literal type — the right operator.
- **Functional guards** (`CanMatchFn`, `CanActivateFn`), no class-based guards.
- **Composition-only route table**, enforced by `dependency-cruiser`, not convention.
- **Explicit `not-found` route plus `**` wildcard** both pointing at the same lazy component, so
  the 404 is a real prerendered page per locale rather than a redirect.

### 8.2 Guards, resolvers, route providers

| Mechanism               | Uses | Assessment                                                                                                                                              |
| ----------------------- | ---: | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CanMatchFn`            |    1 | Correct — branch selection                                                                                                                              |
| `CanActivateFn`         |    1 | Correct — but see §8.3                                                                                                                                  |
| `CanActivateChildFn`    |    0 | Not needed; no nested authorization                                                                                                                     |
| `CanDeactivateFn`       |    0 | See §8.4                                                                                                                                                |
| `ResolveFn`             |    0 | **Correct.** All content is compiled in; there is nothing to resolve. A resolver would add a navigation-blocking step for data that is already present. |
| Route-level `providers` |    0 | Correct. The only scoped provider need is the form's, and it is on the component (`contact-form.ts:96`) where it belongs.                               |

No authorization logic exists anywhere — this is a public marketing site. `NO EVIDENCE` of
duplicated or missing auth.

### 8.3 `syncLocaleWithUrl` performs a side effect in a guard

**Severity:** Low · **Type:** Best Practice Deviation
**File:** `src/app/core/i18n/locale-routing.ts:18-35`

```ts
if (i18n.locale() !== target) {
  i18n.setLocale(target);
}
return true;
```

A `CanActivateFn` is contractually a predicate; this one mutates global locale state as its primary
purpose and returns `true` unconditionally (except for one redirect branch). Guards that always
return true are usually better expressed as a router-event subscription or an
`withNavigationErrorHandler`-adjacent concern.

**Counter-argument, which largely holds:** the locale must be set _before_ the lazy component
renders, or the first paint uses the wrong dictionary. `canActivate` is the only hook with that
timing guarantee that also runs per-navigation. The redirect branch (`:23-30`) genuinely needs
guard semantics — it returns a `UrlTree`. So the mechanism is justified; the naming and the mixed
responsibility (redirect decision + state mutation) are what cost it a mark.

### 8.4 `canDeactivate` — a real gap on the contact form

**Severity:** Low · **Type:** Potential Improvement
**File:** `app.routes.ts:48-52`

The contact form can hold up to ~2,500 characters of visitor-authored input across ten fields.
There is no `CanDeactivateFn` warning on navigation away with a dirty, unsubmitted form. Signal
Forms exposes `dirty()` per field and at the root, so the guard is cheap to write.

Honest counterweight: this is a marketing site, browsers already warn on tab close for some
interactions, and an over-eager guard is itself a UX problem. Classified as **Potential
Improvement**, priority P3 — flagged because the conversion path is the one place where losing
input has a business cost.

### 8.5 `withComponentInputBinding()` is not enabled

**Severity:** Low · **Type:** Potential Improvement
**Files:** `app.config.ts:19`; `solutions.ts:35-39`, `services.ts:86-91`, `engagement-models.ts:38`

Three pages read query parameters through the same hand-written pattern:

```ts
private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });
protected readonly current = computed<ChallengeId | null>(() => {
  const value = this.params().get(CHALLENGE_PARAM);
  return isChallengeId(value) ? value : null;
});
```

With `withComponentInputBinding()` the first line disappears and the parameter arrives as a signal
input. **However** — the second line would remain, because the validating type guard
(`isChallengeId`, `isServiceFilter`) is the part doing the real work, and that is the better half of
this pattern. The saving is one line per page, against a global router configuration change.

**Assessment:** genuinely optional. The existing pattern is explicit, type-safe at the boundary, and
`requireSync: true` correctly eliminates the `| undefined` that route params would otherwise carry.
Recommended only if a fourth page adopts the same shape — at which point a shared
`queryParam(name, guard)` helper would beat both options.

**Score justification — 9/10.** A 73-line route table covering 27 routes across three locales, with
`canMatch` used for exactly the job it exists for, typed route data, functional guards, machine-
enforced composition purity, and correct restraint on resolvers and route providers. Deducted for
the guard that is really a state mutation and the absent dirty-form guard on the conversion path.

---

## 9. Resource API Audit — **9 / 10**

`CONFIRMED` — `resource()`, `rxResource()`, `ResourceRef`, `ResourceStatus` have **zero uses**.

### 9.1 This is correct, and adoption would introduce a defect

The complete inventory of HTTP in production code:

| Call             | File                                 | Method            |
| ---------------- | ------------------------------------ | ----------------- |
| Contact inquiry  | `http-contact-submitter.ts:41`       | **POST**          |
| SVG icon fetches | inside `MatIconRegistry` (framework) | GET, not app code |

**One application HTTP call, and it is a mutation.** Angular's own TSDoc on `resource()`, read from
the installed `@angular/core` types:

> Note that `resource` is intended for _read_ operations, not operations which perform mutations.
> `resource` will cancel in-progress loads via the `AbortSignal` when destroyed or when a new
> request object becomes available, which could prematurely abort mutations.

Converting the contact submission to `resource()` would mean a visitor navigating away mid-submit
has their inquiry aborted — losing a lead, which is the exact business outcome the site exists to
produce. The framework documents this hazard explicitly.

**Verdict: `FALSE POSITIVE` against the expectation that a modern Angular 22 app should use the
Resource API.** The project's `Promise`-based `HttpContactSubmitter` is the correct shape for a
mutation. This is the clearest single data point that the codebase's API choices are reasoned
rather than fashionable.

### 9.2 Were there read operations, the verdict would differ

`NO EVIDENCE` of any reactive read-data requirement: all copy is compiled into the bundle as
`*.content.ts` dictionaries (50 files), and all 27 routes are prerendered at build time. There is
no list to fetch, no detail view to load, no search to debounce. The architectural precondition for
`resource()` does not exist.

If the site later gains a dynamic surface — a case-studies feed, a careers listing — `rxResource()`
over `HttpClient` would be the right tool and the `toSignal(..., { requireSync: true })` +
type-guard pattern already in place would compose with it cleanly.

### 9.3 Race conditions and cancellation in the current implementation

Examined because the brief asks, even absent the Resource API.

`http-contact-submitter.ts:31-33`:

```ts
this.pending ??= this.send(inquiry).finally(() => {
  this.pending = null;
});
return this.pending;
```

A promise-latch that coalesces concurrent submissions. **Two observations:**

- It is a _second_ guard. `submit()` already refuses re-entry:
  `if (untracked(node.submitState.submitting)) return false;`
  (`_validation_errors-chunk.mjs:1836-1838`). Defence in depth, not redundancy — the submitter is
  independently injectable and shouldn't rely on its caller.
- **Latent trap:** a second call with _different_ data silently receives the first call's result.
  Unreachable from this UI (one form instance, disabled button, framework re-entry guard), and
  `CONTACT_API.md` records the no-deduplication decision deliberately. Noted, not filed as a defect.

No cancellation is implemented, and none should be — see §9.1.

**Score justification — 9/10.** The API is absent for a verified, documented reason, and its
adoption would be actively harmful. The existing async implementation handles coalescing, error
discrimination (`status === 0` → unreachable vs rejected) and three distinct outcome states
correctly. Not 10 only because the coalescing latch silently drops a differing second payload —
safe today, but a sharp edge in a reusable service.

---

## 10. RxJS Integration Audit — **9 / 10**

rxjs 7.8.2. Used narrowly and correctly.

| Pattern                 | Count | Assessment                                                                   |
| ----------------------- | ----: | ---------------------------------------------------------------------------- |
| `toSignal()`            |     6 | 3 with `requireSync: true` on route params — correct, removes `\| undefined` |
| `takeUntilDestroyed()`  |     3 | **Every** manual `.subscribe()` is covered                                   |
| `toObservable()`        |     0 | No signal→observable conversions                                             |
| Manual `.unsubscribe()` |     0 | None needed                                                                  |
| `async` pipe            |     0 | Consistent with a signals-first template strategy                            |
| `firstValueFrom()`      |     1 | `http-contact-submitter.ts:40` — correct for a single-shot POST              |

**No memory leaks.** `CONFIRMED` — all three subscriptions use `takeUntilDestroyed()`
(`header.ts:81`, `engagement-models.ts:61`, `solutions.ts:51`); both `IntersectionObserver`
instances disconnect via `onCleanup`.

**The boundary is drawn in the right place.** RxJS is confined to where Angular's own API is
observable-based (`router.events`, `route.queryParamMap`, `HttpClient`) and converted to signals at
the first opportunity. There is no RxJS state management, no `BehaviorSubject` acting as a store,
no `combineLatest` graph — all of which signals now replace.

### 10.1 `CONFIRMED` — `Header` subscribes to `router.events` twice

**Severity:** Low · **Type:** Architectural Weakness
**File:** `src/app/layout/header/header.ts:63-69` and `:80-87`

```ts
private readonly currentPath = toSignal(
  this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map(() => ...)),
  { initialValue: this.pathWithoutLocale() },
);                                                        // subscription 1

constructor() {
  this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => { ... });  // subscription 2
}
```

Two independent subscriptions to the same stream in one component, using two different lifecycle
mechanisms (`toSignal`'s implicit teardown; `takeUntilDestroyed`). Both are leak-free. The problem
is comprehension cost: a reader must notice both to understand the component's navigation
behaviour, and the second one's purpose (`navigations` counter, §5.5) is already the least obvious
code in the file.

**Recommended:** derive both from one subscription, or move the menu-closing rule into the
`currentPath` pipeline. Low priority — this is tidiness, not correctness.

**Score justification — 9/10.** Correct conversion boundary, universal teardown discipline, zero
unnecessary conversions in either direction, and correct retention of RxJS where event _occurrence_
matters (§3.3). Deducted only for the duplicated subscription in `Header`.

---

## 11. Cross-API Architectural Analysis — **8 / 10**

The brief's central question: do these APIs compose, or merely coexist?

| Interaction                         | Evidence                                                                                                                                                  | Verdict                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Signal Forms + Signals**          | `form(this.model, ...)` over a `signal<ContactInquiry>`; `descriptionLength`/`descriptionCount` as `computed` off field state (`contact-form.ts:142-150`) | **Consistent.** Form state is read as signals, never imperatively.      |
| **Signal Forms + `computed()`**     | `interestOptions`/`methodOptions` computed from the i18n dictionary and passed to `ChipSelect` (`:152-164`)                                               | **Correct.** Options recompute on locale change without a subscription. |
| **Signal Forms + Material**         | `provideSignalFormsConfig({ classes })` bridging to Material's `ng-*` CSS expectations                                                                    | **Correct** — uses the supported hook.                                  |
| **Signal Forms + `linkedSignal()`** | No interaction                                                                                                                                            | Correct — nothing to link.                                              |
| **Signals + RxJS**                  | `toSignal` at every framework boundary; `takeUntilDestroyed` on every manual subscription                                                                 | **Consistent**, except §10.1.                                           |
| **Signals + Resource API**          | No interaction                                                                                                                                            | Correct — §9.                                                           |
| **`resource()` + `linkedSignal()`** | Neither used                                                                                                                                              | N/A                                                                     |
| **Resource API + Routing**          | No resolvers, no resources                                                                                                                                | **Correct** — fully prerendered content.                                |
| **Routing + Lazy Loading**          | Every route `loadComponent`; chunk names match feature names                                                                                              | **Consistent.**                                                         |
| **Route providers + DI**            | Zero route-level providers; form-scoped providers on the component                                                                                        | **Correct scoping.**                                                    |
| **Lazy Loading + Bundle Splitting** | 21 lazy chunks; Material out of `main`                                                                                                                    | Correct, but see §7.3.                                                  |

### 11.1 `CONFIRMED` — The one genuine cross-API redundancy

The `sending` / `form().submitting()` duplication (§4.3) is precisely a cross-API failure: component
signal state duplicating framework form state. It is the only instance of its kind in the codebase.

### 11.2 `CONFIRMED` — A repeated pattern that has earned an abstraction

The query-param → validated-signal pattern appears three times, near-identically
(`solutions.ts:35-39`, `services.ts:86-91`, `engagement-models.ts:38`). Each instance is correct.
At three occurrences this is on the boundary; a fourth would make it a maintenance liability.

```ts
// Suggested, when a fourth appears:
function queryParam<T>(name: string, guard: (v: string | null) => v is T): Signal<T | null>;
```

Deliberately **not** recommended now — extracting at two or three sites often costs more in
indirection than it saves. Recorded as a watch item.

### 11.3 Absent anti-patterns

Checked for and `NO EVIDENCE` of: duplicate API requests, race conditions, incorrect state
ownership, unnecessary Observable↔Signal round-trips, side effects in `computed()`, circular
reactive dependencies, excessive abstraction layers.

**Score justification — 8/10.** The APIs genuinely compose; the reactive story is one story, not
several. Deducted for the one real redundancy (§11.1) and the duplicated router subscription
(§10.1).

---

## 12. Confirmed Technical Issues

| ID       | Severity  | Issue                                                                      | Location                             | Type                    |
| -------- | --------- | -------------------------------------------------------------------------- | ------------------------------------ | ----------------------- |
| **A-01** | 🟠 Medium | Deprecated `readonly(path, fn)` overload, 4 call sites                     | `contact-form.ts:134-137`            | Deprecated API Usage    |
| **A-02** | 🟠 Medium | `sending` duplicates framework `submitting()`                              | `contact-form.ts:114, 140, 171, 183` | Redundant State         |
| **A-03** | 🟠 Medium | Real first-load JS is ~1.7× the reported initial bundle                    | `dist/` measurement; `index.html`    | Performance Risk        |
| **A-04** | 🟡 Low    | `onInvalid` submit hook unused; post-hoc `invalid()` check instead         | `contact-form.ts:189-191`            | Best Practice Deviation |
| **A-05** | 🟡 Low    | `readonly()` locks 4 of 9 editable fields during submit                    | `contact-form.ts:134-137`            | Confirmed Inconsistency |
| **A-06** | 🟡 Low    | `Header` subscribes to `router.events` twice                               | `header.ts:63-69, 80-87`             | Architectural Weakness  |
| **A-07** | 🟡 Low    | Non-signal mutable counters in a signals-only codebase                     | `header.ts:54-55`                    | Best Practice Deviation |
| **A-08** | 🟡 Low    | `CanActivateFn` used primarily to mutate global locale state               | `locale-routing.ts:18-35`            | Best Practice Deviation |
| **A-09** | 🟡 Low    | No `@typescript-eslint/no-deprecated`; A-01 escaped 10 CI gates            | `eslint.config.js`                   | Maintainability         |
| **A-10** | 🟡 Low    | `CONTACT_API.md` states the form "posts with XHR"; v22 defaults to `fetch` | `CONTACT_API.md`                     | Documentation Accuracy  |
| **A-11** | 🔵 Info   | Error-visibility expression duplicated 14× in template                     | `contact-form.html`                  | Maintainability         |
| **A-12** | 🔵 Info   | No `canDeactivate` on a form holding ~2,500 chars of input                 | `app.routes.ts:48-52`                | Potential Improvement   |

**A-10 detail.** `CONTACT_API.md` ("Switching the form on") reasons: _"The form posts with XHR, so a
CSP that does not list it blocks the request."_ Verified false in v22 —
`provideHttpClient()` provides `FetchBackend` by default
(`_module-chunk.mjs:2036-2043`). The **operational conclusion is still correct** (`connect-src`
governs `fetch` and XHR alike), so no deployment step changes; the stated mechanism is wrong. Filed
because this codebase substitutes precise written rationale for tribal knowledge, which makes an
inaccurate mechanism more costly here than in an average repo.

---

## 13. Deprecated API Usage

### A-01 — `readonly(path, logicFn)` is deprecated in Angular 22.2.3

**Severity:** Medium · **Type:** Deprecated API Usage · **Evidence:** `CONFIRMED`

**Actual implementation** — `src/app/pages/contact/contact-form/contact-form.ts:134-137`:

```ts
readonly(inquiry.name, () => this.sending());
readonly(inquiry.email, () => this.sending());
readonly(inquiry.company, () => this.sending());
readonly(inquiry.description, () => this.sending());
```

**Evidence** — `node_modules/@angular/forms/types/signals.d.ts`:

```ts
// line 92 — current, supported
declare function readonly<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  config?: { when?: NoInfer<LogicFn<TValue, boolean, TPathKind>> },
): void;

// line 95-100 — the overload in use
/**
 * @deprecated Passing a function directly to `readonly` is deprecated. Use `{ when: ... }` instead.
 */
declare function readonly<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  logic?: NoInfer<LogicFn<TValue, boolean, TPathKind>>,
): void;
```

**Why it is a problem.** A `@deprecated` overload is the Angular team's announced removal path.
These four calls sit in the site's only conversion path, in the API family `README.md` itself
identifies as the most upgrade-sensitive part of the codebase. Critically, **nothing in the project
detects it**: `tsc` compiles deprecated overloads without complaint, and the ESLint configuration
does not enable `@typescript-eslint/no-deprecated` (A-09). All ten CI gates pass on this code. The
first signal will be a failed major upgrade.

**Potential impact.** Build failure on the Angular release that removes the overload, in the
component whose tests `README.md` instructs maintainers to treat as a blocking upgrade issue.

**Recommended** — combined with A-02, the whole correction is:

```ts
// delete:  private readonly sending = signal(false);
// delete:  this.sending.set(true) / this.sending.set(false) in submit()

readonly(inquiry.name, { when: () => this.form().submitting() });
readonly(inquiry.email, { when: () => this.form().submitting() });
readonly(inquiry.company, { when: () => this.form().submitting() });
readonly(inquiry.description, { when: () => this.form().submitting() });
```

**Regression risk: low but non-zero.** Verified that no reactive cycle results (§4.3) and that the
timing windows are near-identical. The difference: `submitting()` becomes true marginally earlier
(before the action's first statement) and false marginally later (after the action resolves) than
`sending` did. Given §4.6 — readonly fields skip validation — this slightly widens the window in
which those four fields report valid. Harmless while the action returns `undefined`; it should be
re-examined if server-side field errors are ever introduced. `contact-form.spec.ts` and the
`contact.spec.ts` e2e suite both cover submit/failure/duplicate paths and should be run.

**No other deprecated Angular API is in use.** `ChangeDetectionStrategy.Default` is deprecated in
v22 — and is referenced nowhere in the project (0 `changeDetection` declarations, §3.3).

---

## 14. Architectural Weaknesses

### 14.1 SEO logic concentrated in one provider closure

**File:** `src/app/core/seo/document-meta.ts:58-187`

`provideDocumentMeta()` returns `provideEnvironmentInitializer(() => { ... })` containing, as local
closures: `link()`, `jsonLd()`, `breadcrumbItems()`, and a ~70-line `effect()` that writes title,
description, five Open Graph tags, canonical, `hreflang` alternates and a JSON-LD `@graph`.

**Why it is a problem.** `breadcrumbItems` and the JSON-LD builder are pure functions of
`(page, content, locale)` with non-trivial logic — the breadcrumb builder does prefix-accumulation
with a `value is keyof` type guard. Trapped inside the closure they cannot be unit-tested; the only
way to exercise them is to boot an environment injector and inspect `document.head`. This is the
lowest test seam in the codebase, governing the output most expensive to get wrong.

**Recommended:** export `breadcrumbItems(page, names)` and `buildGraph(...)` as pure functions from
the same file; the initializer calls them. No behaviour change, three new unit tests become
possible. **Regression risk: very low.**

### 14.2 The duplicated-submission-state weakness

§4.3 / A-02. The only place where component state shadows framework state.

### 14.3 `Header` carries three mechanisms for one concern

`toSignal(router.events)`, a second `router.events` subscription, and two plain counters all exist
to answer "where are we, and should the menu close?" Each is individually fine; together they make
the component the hardest in the codebase to reason about, at 96 lines.

### 14.4 Imperative write-back into a Material component

**File:** `src/app/pages/home/why/why.ts:30-37`

```ts
protected onSelection(change: MatChipListboxChange): void {
  if (typeof change.value === 'number') { this.selected.set(change.value); return; }
  this.listbox().value = this.selected();   // imperative restore
}
```

When Material reports a deselection, the component force-writes its own state back into the
Material component's `value` property, bypassing the reactive graph. The intent — "this listbox
cannot be empty" — is correct and the comment-free line is the only way to express it against a
non-signal Material API. Recorded as the one place where the signals-first model meets a component
that predates it. **Not a defect**; a note that `MatChipListbox` is the reactive model's rough edge.

---

## 15. Performance Risks

| ID   | Classification             | Finding                                                                                                                                                                            |
| ---- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A-03 | **Measured Issue**         | Home page loads 6 JS files, 818 kB raw / ~215 kB gzip, against a reported "initial total" of 125 kB transfer. Measured from `dist/nexora/browser/index.html` + `stat` + `gzip -c`. |
| P-02 | **Code-Level Risk**        | `@defer (on immediate)` loads the 29.46 kB `menu` chunk on every page view regardless of use (§7.4).                                                                               |
| P-03 | **Potential Optimization** | No preloading strategy; a targeted `contact`-only preload from home would warm the conversion path (§7.5).                                                                         |
| P-04 | **Potential Optimization** | 50 `*.content.ts` dictionaries are compiled into the bundle. Correct for a 9-page engineer-owned site; the first wall if a fourth locale or non-engineer editors arrive.           |
| —    | **Verified NOT a risk**    | No memory leaks: 3/3 subscriptions use `takeUntilDestroyed()`, 2/2 `IntersectionObserver`s disconnect on cleanup, 6/6 `toSignal` conversions self-manage.                          |
| —    | **Verified NOT a risk**    | All 66 components are OnPush (§3.3), with a test pinning the contract against compiled definitions.                                                                                |

**Core Web Vitals: `NOT VERIFIED`.** No Lighthouse or field-data run was performed; §15 reasons
about transferred bytes, not LCP/INP/CLS.

---

## 16. Detailed Scoring Table

| Category                         |    Score | Justification                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------- | -------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Signal Forms**                 | **8**/10 | Correct `form()` over a signal model, end-to-end type safety, a genuinely reusable `Field<T>`-accepting child component, backend contract shared via exported constants, `provideSignalFormsConfig` for the Material bridge, deliberate a11y. Deducted: 4 deprecated `readonly` calls (A-01), state duplicated against `submitting()` (A-02), `onInvalid` unused (A-04), `readonly` applied to 4 of 9 fields (A-05). |
| **Signals Architecture**         | **9**/10 | 3 writable signals, all private/protected; 30 `computed()`; 3 `effect()` all synchronising to systems outside the template; no side effects in `computed()`; no circular dependencies (machine-verified); `asReadonly()` correctly unnecessary. Deducted: non-signal counters (A-07), the A-02 duplication.                                                                                                          |
| **linkedSignal() Usage**         | **8**/10 | Zero uses, and zero places where its absence causes a defect — 3 of 4 candidate sites would be actively wrong. The one genuine candidate (`why.selected`) is solved by a documented clamp. Held at 8: the clamp constrains the consumer rather than the state, the slightly weaker of two valid designs.                                                                                                             |
| **Lazy Loading**                 | **7**/10 | All 9 routes `loadComponent`, 21 named lazy chunks, Material verified out of `main`, composition purity machine-enforced. Deducted: real first-load is ~1.7× the reported figure and unacknowledged (A-03); `@defer` serves prerendering rather than the loading benefit its presence implies.                                                                                                                       |
| **Routing Architecture**         | **9**/10 | 73 lines for 27 routes across 3 locales; `canMatch` used for exactly its purpose; `satisfies`-typed route data; functional guards; correct restraint on resolvers and route providers. Deducted: guard used as a state mutator (A-08); no dirty-form guard on the conversion path (A-12).                                                                                                                            |
| **Resource API**                 | **9**/10 | Zero uses — verified correct against Angular's own TSDoc ("intended for _read_ operations… could prematurely abort mutations"); the sole HTTP call is a POST. Adoption would be a defect. Existing async code handles coalescing, transport-vs-rejection discrimination and three outcome states. Not 10: the coalescing latch silently drops a differing second payload.                                            |
| **RxJS Integration**             | **9**/10 | Conversion at every framework boundary, `requireSync` where provable, `takeUntilDestroyed` on 3/3 subscriptions, zero `toObservable`, zero RxJS state management — and correct _retention_ of RxJS where event occurrence matters. Deducted: double subscription in `Header` (A-06).                                                                                                                                 |
| **Cross-API Integration**        | **8**/10 | One coherent reactive story; no duplicate requests, race conditions or round-trip conversions. Deducted: the A-02 redundancy is specifically a cross-API failure; query-param pattern repeated 3× (watch item).                                                                                                                                                                                                      |
| **Angular 22.2.3 Compliance**    | **8**/10 | Genuinely zoneless (no zone.js), OnPush throughout by v22 semantics, `provideHttpClient()` correct for v22's fetch default, `provideBrowserGlobalErrorListeners()`, `provideSignalFormsConfig`, functional providers, `input.required` ×30, zero constructor injection. Deducted: a deprecated overload in production (A-01) with no lint rule to catch the next one (A-09).                                         |
| **Overall Angular Architecture** | **8**/10 | See §18.                                                                                                                                                                                                                                                                                                                                                                                                             |

---

## 17. Prioritized Improvement Roadmap

### P0 — Critical

**None.** No finding in this audit threatens correctness, security or availability.

### P1 — High

| ID              | Problem                                                                     | Files                                    | Implementation                                                                                                  | Benefit                                                                                      | Regression risk                                                                                                              |
| --------------- | --------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **A-01 + A-02** | Deprecated `readonly` overload ×4, and `sending` duplicating `submitting()` | `contact-form.ts:114, 134-137, 171, 183` | Delete `sending`; use `readonly(path, { when: () => this.form().submitting() })`                                | Removes the only known Angular-major blocker **and** the only state duplication, in one edit | Low — no cycle (verified §4.3); slightly wider readonly window (§4.6); covered by `contact-form.spec.ts` + `contact.spec.ts` |
| **A-09**        | Nothing detects deprecated APIs; A-01 passed 10 gates                       | `eslint.config.js`                       | Enable `@typescript-eslint/no-deprecated`; it needs type information, which this config does **not** yet set up | The _next_ deprecation is caught by CI, not by an audit                                      | Low — may surface other warnings; triage is the cost                                                                         |
| **A-03**        | Reported initial bundle understates real first load by ~1.7×                | documentation; `angular.json` budgets    | Record the measured per-route figure (~215 kB gzip for home); set a `budgets` entry against it                  | Performance decisions made against the real number                                           | None (measurement only)                                                                                                      |

### P2 — Medium

| ID              | Problem                                                                    | Files                              | Implementation                                                                                                      | Benefit                                                       | Regression risk                                                     |
| --------------- | -------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| **14.1**        | SEO breadcrumb and JSON-LD builders untestable inside a provider closure   | `core/seo/document-meta.ts:58-187` | Export `breadcrumbItems()` and the `@graph` builder as pure functions; initializer calls them                       | Unit tests for the highest-consequence, lowest-covered output | Very low — pure extraction                                          |
| **A-05**        | `readonly()` locks 4 of 9 editable fields during submit                    | `contact-form.ts:134-137`          | Extend to `interest`, `service`, `timeline`, `budget`, `method` — or comment why selects are intentionally excluded | Display matches what was actually submitted                   | Low — verify Material select/chip honour `readonly` via `FormField` |
| **A-06 + A-07** | `Header` has two `router.events` subscriptions and two non-signal counters | `header.ts:54-55, 63-69, 80-96`    | Derive menu-closing from the existing `currentPath` pipeline; convert counters to signals or document the mechanism | The codebase's least-readable component becomes readable      | Low — behaviour is covered by e2e header specs                      |
| **A-10**        | `CONTACT_API.md` states the form posts with XHR                            | `CONTACT_API.md`                   | Correct to `fetch` (v22 default); conclusion about `connect-src` is unchanged                                       | Keeps load-bearing documentation accurate                     | None                                                                |

### P3 — Low

| ID       | Problem                                 | Implementation                                                                                                                     |
| -------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **A-04** | `onInvalid` hook unused                 | Move `focusFirstInvalid()` into `onInvalid`, **or** comment that the post-`await` check deliberately also covers submission errors |
| **A-11** | `touched() && invalid()` duplicated 14× | Introduce one `shouldShowError(field)` helper                                                                                      |
| **A-12** | No dirty-form navigation guard          | Add a `CanDeactivateFn` reading `form().dirty()` on the `contact` route                                                            |
| **A-08** | `CanActivateFn` used as a state mutator | Keep the mechanism (timing is load-bearing) but rename to express intent, e.g. `applyLocaleForUrl`                                 |
| **7.5**  | No preloading strategy                  | Custom strategy preloading only `contact` from home; measure before keeping                                                        |
| **11.2** | Query-param pattern repeated 3×         | Extract `queryParam(name, guard)` **only if a fourth page appears**                                                                |

### Explicitly **not** recommended

- Replacing `HttpContactSubmitter` with `resource()`/`rxResource()` — would introduce premature
  mutation abort (§9.1).
- Introducing `linkedSignal()` — no site benefits (§6).
- Adding resolvers — all content is prerendered (§8.2).
- Enabling `withComponentInputBinding()` — saves one line per page against a global config change
  (§8.5).
- Converting the `Scroll` subscription in `solutions.ts` to a signal — would break repeat
  navigation to the same anchor (§3.3).

---

## 18. Final Staff / Principal Engineering Verdict

> **Does Nexora represent a genuinely high-quality Angular 22.2.3 implementation, or a project that
> uses modern APIs without understanding their architectural purpose?**

**Genuinely high quality.** The evidence that settles it is negative evidence.

A project adopting modern Angular decoratively shows a predictable signature: `resource()` wrapped
around a mutation, `linkedSignal()` where `computed()` suffices, `effect()` used to compute values,
signals exposed publicly as writable, and `@defer` sprinkled for a bundle-size claim it does not
deliver. Nexora shows **none** of these. It has three writable signals, all private; three effects,
all synchronising to systems outside the template; zero `resource()` against an HTTP surface
consisting of one POST — a decision Angular's own documentation vindicates.

Three times during this audit a conventional finding dissolved under verification: the missing
`OnPush` declarations (v22 compiles omission _to_ OnPush), the missing `withFetch()` (v22 defaults
to `FetchBackend`), and the RxJS subscription that "should be a signal" (it must fire on repeat
navigation, which a signal cannot). Each required reading installed framework source. A codebase
that survives that process has been reasoned about.

**What keeps it from a 9.** Four calls to a deprecated overload reached production in the
application's only conversion path and passed ten CI gates, because no rule looks for deprecation —
in a project that otherwise machine-enforces its architecture (`dependency-cruiser`, a compiled
change-detection contract, a cross-repo payload test, build-time design-token validation). That is
a gap in an otherwise excellent enforcement story rather than a lapse in judgment, which is why it
costs a point and not three. The second cost is honesty of measurement: the real first-load JS is
~1.7× the figure the build prints, and nothing in the project acknowledges it.

**What would most improve it,** in order: enable `@typescript-eslint/no-deprecated`; merge the
duplicated submission state while discharging the deprecation; extract the SEO pure functions so
the highest-consequence output becomes testable.

The architecture itself needs no work. Layering is enforced rather than agreed, state ownership is
unambiguous, the routing table expresses three locales and 27 routes in 73 lines, and the reactive
graph is small enough to hold in your head. It would absorb a fourth locale, a dozen more pages, or
a genuine data-fetching surface without redesign — and at that point `rxResource()` and
`linkedSignal()` would become correct answers, which is a different thing from being correct
answers today.

**Overall Angular Architecture: 8 / 10.**

---

## Appendix A — Verification Log

### A.1 Checks successfully performed

| Check                                                              | Result                                                                                                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Installed package versions read from `node_modules/*/package.json` | 11 packages confirmed                                                                                                                             |
| `zone.js` presence check                                           | Not installed — zoneless confirmed                                                                                                                |
| `npm run build`                                                    | ✅ 27 routes prerendered, 46.1 s                                                                                                                  |
| `npm run lint` (ESLint + templates)                                | ✅ clean                                                                                                                                          |
| `npm run lint:deps` (dependency-cruiser)                           | ✅ 0 violations, 183 modules, 518 deps                                                                                                            |
| `npm run lint:styles` (stylelint)                                  | ✅ clean                                                                                                                                          |
| `npm run typecheck` (4 tsc projects)                               | ✅ exit 0                                                                                                                                         |
| `npm test -- --no-watch` (Vitest)                                  | ✅ 280/280, 43 files                                                                                                                              |
| `npm run test:scripts`                                             | ✅ 43/43                                                                                                                                          |
| `npm run verify:prerender`                                         | ✅ 27 pages navigable without JS                                                                                                                  |
| `npm run verify:headers`                                           | ✅ 5 hashes, 6 headers, nginx in step                                                                                                             |
| **Full Playwright e2e suite**                                      | ✅ **528/528 passed (5.5 min)**                                                                                                                   |
| Per-route JS measurement (`stat` + `gzip -c` over `dist/`)         | 4 routes measured                                                                                                                                 |
| Framework source verification                                      | `readonly` overloads, `submit()` runtime, `shouldSkipValidation`, `provideHttpClient` backend, `resource()` TSDoc, `ChangeDetectionStrategy` enum |
| API census across `src/app`                                        | 24 APIs counted                                                                                                                                   |
| Signal encapsulation audit                                         | 0 public writable signals                                                                                                                         |

### A.2 Checks that could NOT be performed

| Check                                                    | Reason                                                                                                                            |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Bundle duplicate-dependency analysis**                 | Requires `--stats-json` + an analyzer dependency; installing one is excluded by §10 of the brief. §7.6 marked `CANNOT DETERMINE`. |
| **Core Web Vitals (LCP / INP / CLS)**                    | No Lighthouse or field data collected. `NOT VERIFIED`.                                                                            |
| **Firefox / WebKit behaviour**                           | Only Chromium binaries installed (`playwright.config.ts:26-31`). `NOT VERIFIED`.                                                  |
| **Unit-test coverage percentage**                        | Coverage reporting not enabled in the Vitest config. `NOT VERIFIED`.                                                              |
| **Runtime Signal Forms profiling**                       | No instrumentation; reactive-graph claims are from source reading, not runtime tracing.                                           |
| **`Nexora-back` API quality**                            | Separate repository, out of scope.                                                                                                |
| **Whether `linkedSignal()` was considered and rejected** | `CANNOT DETERMINE` — no commit message or comment records intent (§6.2).                                                          |
| **Material `readonly` propagation to select/chip**       | A-05's fix needs this verified at runtime before implementing. `NOT VERIFIED`.                                                    |

### A.3 Source modification confirmation

**No source file was modified by this audit.** All investigation was read-only; the only commands
executed were the project's own existing build, test, lint and verification scripts.

Working tree state, verified at audit start and end:

```
$ git status --porcelain
(empty)

$ git diff --stat
(empty)
```

The only files created are the two deliverables in §A.4.

**Disclosure — prior-task changes present in the audited commit.** Commit `f5abc3b`, the commit
audited here, contains two source changes made during the **previous** task in this session, at the
user's explicit instruction to fix the P0 findings of the earlier responsive audit:

- `e2e/overflow.spec.ts` — added a 320px viewport to `VIEWPORTS` (+5 lines)
- `src/styles/theme/_chip.scss` — chip labels wrap; `container-height` becomes a minimum (+19 lines)

These were committed before this audit began and are therefore part of the baseline, not changes
made by it. They are CSS and test-only and touch no Angular API discussed in this report.

### A.4 Deliverable path verification

| File        | Path                                                           | Status     |
| ----------- | -------------------------------------------------------------- | ---------- |
| Full report | `C:\Users\xXx\Desktop\Nexora\ANGULAR_22_2_3_ADVANCED_AUDIT.md` | ✅ created |
| Summary     | `C:\Users\xXx\Desktop\Nexora\ANGULAR_22_2_3_AUDIT_SUMMARY.md`  | ✅ created |

### A.5 File-reference index

Every file and line cited above, for re-verification:

```
src/app/app.config.ts:19, 21
src/app/app.routes.ts:9-73
src/app/app.ts:22-24
src/app/core/i18n/locale-routing.ts:15-16, 18-35
src/app/core/seo/document-meta.ts:58-187, 67, 118
src/app/layout/header/header.ts:52, 54-55, 63-69, 80-96
src/app/pages/contact/contact-form/contact-form.ts:51-55, 113-138, 140, 142-164, 169-191
src/app/pages/contact/contact-form/contact-form.html:79, 124-134, 178-208, 219-225
src/app/pages/contact/contact-form/contact-submitter.ts:3-15
src/app/pages/contact/contact-form/chip-select/chip-select.ts:16-27
src/app/pages/contact/contact-form/http-contact-submitter.ts:31-33, 40-41
src/app/pages/home/why/why.ts:20, 24-28, 30-37
src/app/pages/services/services.ts:85-151, 160-168
src/app/pages/solutions/solutions.ts:35-39, 48-58
src/app/layout/header/header.html:27, 85

node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:10343
node_modules/@angular/core/types/_debug_node-chunk.d.ts:4966-4987
node_modules/@angular/common/fesm2022/_module-chunk.mjs:2036-2043
node_modules/@angular/forms/types/signals.d.ts:92, 95-100
node_modules/@angular/forms/types/_structure-chunk.d.ts:991-994, 1337, 1791
node_modules/@angular/forms/fesm2022/_validation_errors-chunk.mjs:778, 682-686, 1337-1338,
                                                                1673, 1836-1838, 1853-1880
```
