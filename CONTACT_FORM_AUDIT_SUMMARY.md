# ContactForm Audit — Executive Summary

**Subject:** `src/app/pages/contact/contact-form/` · **Angular 22.2.3** (verified installed)
**Date:** 2026-11-05 · **Full report:** [CONTACT_FORM_TECHNICAL_AUDIT.md](CONTACT_FORM_TECHNICAL_AUDIT.md)

> **Objectivity disclosure.** The working tree carries an uncommitted change to `contact-form.ts`
> that I made in the previous task at the user's instruction (removing a duplicated `sending`
> signal, moving to `readonly(path, {when})`). This audit therefore partly grades my own recent
> edit. Claims about it rest on the project's own pre-existing test `e2e/contact.spec.ts:641`, the
> installed framework source, and the official documentation — not on my judgement of my own work.

> **Status update — 2026-11-05, after this audit.** The P1 item has been implemented at the user's
> request: **CF-01 is closed** (the API's rejected field names are now routed through Signal Forms
> to the fields, with the localized `errorServer` message, cleared on edit) and **CF-06 is closed
> as a non-issue, by test**. The readonly-skips-validation suppression is real but _transient_: the
> framework stores submission errors before clearing `submitting()`, and `syncErrors` is a
> `computed`, so the error surfaces as soon as the lock lifts. `contact-form.spec.ts` now pins
> that. No narrowing of the `readonly` window was needed, so the regression risk this report
> estimated as _medium_ did not materialise.
>
> **2026-11-06 — the four P2 items are now done too.** **CF-04** closed (messages moved onto the
> rules as reactive `LogicFn`s; the five error slots collapsed to `{{ fieldError(form.x()) }}`;
> declaration order pinned by test). **CF-02** closed (focus via `onInvalid`, choosing the field
> by name because the hook runs before the `.ng-invalid` class binding is applied) — which
> **retires CF-09** as well. **CF-11** closed (both flakes were the same mistake: reading a value
> once that the app settles asynchronously; both now poll). **CF-10** closed.
>
> One thing this work found that the audit missed: `FormField` turns a `maxLength()` rule into a
> **native `maxlength` attribute**, so the client-side length error is unreachable from the UI —
> the browser caps typing first. The four `maxLength` rules are defence-in-depth, not a
> visitor-facing message. Now pinned by an e2e test.
>
> **2026-11-06 — every finding in this report is now closed.** **CF-05** closed (one
> `showError(state)` predicate replaced all 11 duplicated expressions, so the paired caption and
> message gates cannot drift). **CF-07** closed (the five option sets are now `const` arrays with
> derived unions; a typo fails `tsc` with `TS2820`, and `contact-contract.spec.ts` pins each array
> against the set the API accepts, so content, types and the backend DTO stay in step).
> **`wcag22aa`** added — it contributes exactly one rule at axe-core 4.14, `target-size`, and all
> 29 a11y tests pass with it on, so the site was already clean. **CF-09/CF-08/CF-03** were closed
> earlier; CF-03 is a `FALSE POSITIVE` (see `CONTACT_FORM_SUBMISSION_AUDIT.md` S-01).
>
> The scores and findings below are the assessment **as of the audit**, left intact as the record.

---

## Verdict

**Overall ContactForm Quality: 8/10 · Weighted total: 8.3/10 · Production-ready: yes.**

Ten flat fields, 216 lines of TypeScript, 28 unit tests, 44 e2e tests. The model is one writable
signal, the schema is declarative with limits exported as constants shared with a backend contract
test, field-state reads follow the pattern the official docs recommend by name, and the default
submitter is a Null Object that cannot falsely claim success.

The weakness is one-sided: **the input half of Signal Forms is implemented thoroughly, the
submission-response half barely.** `FormRoot`, `onInvalid` and server-error routing are all
documented, all stable in 22.2.3, and all unused — while the API already returns a `message` the
client discards.

---

## Scorecard (21 categories)

|   # | Category                        |    Score |
| --: | ------------------------------- | -------: |
|   1 | Overall ContactForm Quality     | **8**/10 |
|   2 | Angular 22.2.3 Best Practices   | **9**/10 |
|   3 | Signal Forms Architecture       | **8**/10 |
|   4 | Form Model Design               | **9**/10 |
|   5 | Schema Architecture             | **8**/10 |
|   6 | Validation Implementation       | **7**/10 |
|   7 | Field and Form State Management | **9**/10 |
|   8 | Submission Lifecycle            | **7**/10 |
|   9 | Custom Controls Integration     | **8**/10 |
|  10 | Component Architecture          | **8**/10 |
|  11 | Design Patterns                 | **9**/10 |
|  12 | SOLID Principles                | **8**/10 |
|  13 | TypeScript Quality              | **9**/10 |
|  14 | Service and API Integration     | **9**/10 |
|  15 | Error Handling                  | **7**/10 |
|  16 | SCSS Architecture               | **9**/10 |
|  17 | Responsive Design               | **9**/10 |
|  18 | Performance                     | **8**/10 |
|  19 | Accessibility                   | **9**/10 |
|  20 | Testing Quality                 | **9**/10 |
|  21 | Maintainability and Scalability | **8**/10 |

**Weighting** (Signal Forms heaviest, per brief): Signal Forms core 45% (mean 8.00) · Angular/TS/
design 20% (8.60) · UI quality 12% (9.00) · service & errors 10% (8.00) · testing 8% (9.00) ·
perf & maintainability 5% (8.00) → **8.32**.

---

## Findings

| ID        | Severity | Finding                                                                                                                                                                        | Status      |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| **CF-01** | Medium   | Server-side validation errors never mapped to fields; the action always returns `undefined`, so a rejection becomes one generic snackbar even though the API sends a `message` | `CONFIRMED` |
| **CF-02** | Low      | `FormSubmitOptions.onInvalid` unused; focus is driven by a post-`await` `invalid()` re-read                                                                                    | `CONFIRMED` |
| **CF-03** | Low      | `FormRoot` (`form[formRoot]`) reimplemented by hand (`novalidate`, `(submit)`, `preventDefault()`)                                                                             | `CONFIRMED` |
| **CF-04** | Low–Med  | Validation messages live in the template, not in the schema's `message` option — which the installed API accepts as a reactive `LogicFn`, so the i18n objection does not apply | `CONFIRMED` |
| **CF-05** | Low      | `touched() && invalid()` duplicated 14× with no helper; paired expressions must stay identical and nothing enforces it                                                         | `CONFIRMED` |
| **CF-06** | Low→Med  | Readonly fields skip validation, so submission errors on the four locked fields would be suppressed — harmless today, a real defect the moment CF-01 lands                     | `RISK`      |
| **CF-07** | Low      | Five closed option sets typed as bare `string`; the value sets are pinned by a test, not the type system                                                                       | `CONFIRMED` |
| **CF-08** | Low      | `pending ??=` latch can return another payload's result; unreachable from this UI but the signature promises otherwise                                                         | `CONFIRMED` |
| **CF-09** | Low      | `focusFirstInvalid` selector couples to Material's internal `.mat-mdc-select` class                                                                                            | `CONFIRMED` |
| **CF-10** | Low      | `README.md:18` calls Signal Forms experimental; every API in use is `@publicApi 22.0`                                                                                          | `CONFIRMED` |
| **CF-11** | Low      | Two pre-existing e2e flakes outside ContactForm (`engagement-page.spec.ts:223`, `layout.spec.ts:233`) masked by `retries: 2` in CI only                                        | `CONFIRMED` |

### Verified **not** issues

`FormValueControl` on `ChipSelect` (it forwards a `Field<string>`; it does not own a value) ·
missing `withFetch()` (v22 defaults to `FetchBackend`) · missing `changeDetection: OnPush` (v22
compiles omission _to_ OnPush) · repeated `touched() && invalid()` as a pattern (doc-recommended) ·
unvalidated honeypot (correct by design) · domain model used as form model (it _is_ the wire DTO;
a mapper would be an identity layer and would break the contract test's meaning) · two concurrency
guards (defence in depth across an injectable boundary) · absence of `resource()` (Angular's own
TSDoc warns it can prematurely abort mutations).

---

## Roadmap

**P0 — none.** No finding threatens correctness, security or availability.

**P1 — CF-01 + CF-06: map server-side validation errors to fields.** Widen
`ContactSubmitResult`, return errors from the action so Angular routes them, and resolve the
readonly/skip-validation interaction in the same change. _Regression risk: medium_ — errors on
readonly fields are suppressed while `submitting()` is true. Verify with a new unit test (error
with `fieldTree` → `errors()` contains it, editing clears it), an e2e 422 case, and a re-run of
`contact.spec.ts:641`.

**P2** — CF-04 (schema messages via the reactive `message` option) · CF-02 (`onInvalid`) ·
CF-11 (fix the two flaky assertions) · CF-10 (README).

**P3** — CF-05 (`shouldShowError` helper) · CF-09 (stop targeting `.mat-mdc-select`) ·
CF-08 (key the latch on the payload) · CF-07 (const-assertion unions) · CF-03 (`FormRoot`, only if
the action moves into `form()`'s `submission` option) · add `wcag22aa` to the axe tag set.

---

## Top three improvements

1. **Return server-side field errors and route them through Signal Forms** (CF-01+CF-06) — the
   only change with user-visible value; today a rejected visitor on the site's sole conversion path
   is told nothing actionable.
2. **Move validation messages into the schema** (CF-04) — the rule and its failure message
   currently live 60 lines apart in two files, with the required/email branch re-derived by hand.
3. **Adopt `onInvalid`** (CF-02) — replaces a post-`await` re-read with the hook the documentation
   designates for exactly this.

---

## Documentation research

Four `angular.dev` Signal Forms pages were fetched and read: `form-submission`, `form-logic`,
`validation`, `custom-controls`. Two places where current documentation and the installed 22.2.3
implementation disagree were resolved **in favour of the installed source**:

- **Readonly skips validation.** The validation page omits readonly; the form-logic page includes
  it; the installed source is decisive — `shouldSkipValidation = hidden() || disabled() ||
readonly() || isOrphaned()` (`_validation_errors-chunk.mjs:778`). This is load-bearing for CF-06.
- **`getError()` is undocumented but real.** Used at `contact-form.html:79`, absent from all four
  pages, typed in the installed API (`_structure-chunk.d.ts:1416-1419`).

The `models`, `schemas`, `field-state-management` and `comparison` pages were **not** fetched;
conclusions touching them rest on the installed `.d.ts` instead. Stated rather than glossed.

---

## Verification

**Executed:** `typecheck` (exit 0) · `lint` · `lint:deps` (0 violations / 183 modules) ·
`lint:styles` · unit **280/280** · scripts **51/51** · `build` (27 routes) · `verify:prerender` ·
`verify:headers` · `verify:bundle` · **3× full Playwright suite** (528/528, 527/528, 527/528 — two
_different_ single-test flakes, neither in contact code, both 100% in isolation) · per-route JS
measurement (`/contact` worst at 220.7 kB gzip).

**Brief §10 test scenarios:** 10 of 12 covered. The two gaps (server-side validation errors;
editing after a server error) are the same gap — CF-01 is not implemented.

**Not verified:** WebKit/Firefox rendering (Chromium only installed) · Core Web Vitals · unit
coverage % (not enabled) · real backend behaviour (separate repo) · production submission path
(`apiOrigin: ''`; **no real inquiry was submitted**) · Material `readonly` propagation to
select/chip controls.

**Source modification:** no application source, SCSS, HTML, config or dependency was modified by
this audit. Only the two reports were created. A pre-existing factual error in my earlier
deliverable `ANGULAR_22_2_3_ADVANCED_AUDIT.md` was corrected in place (`output()` is 3, not 0;
optional `input()` is 17, not 2) — an audit report of mine, not project source; the correction is
marked inline and in Appendix D of the full report. The working tree's prior uncommitted P1 changes
are listed verbatim in Appendix C.
