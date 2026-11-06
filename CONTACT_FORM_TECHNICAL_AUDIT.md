# ContactForm — Deep Technical Audit (Signal Forms, Angular 22.2.3)

**Project:** `C:\Users\xXx\Desktop\Nexora`
**Audit date:** 2026-11-05
**Subject:** `src/app/pages/contact/contact-form/` and its complete dependency ecosystem
**Auditor role:** Staff / Principal Angular Developer & Software Architect

> ## ⚠️ Objectivity disclosure — read first
>
> The working tree contains **uncommitted modifications to the audit subject itself**
> (`contact-form.ts`), made by me in the immediately preceding task at the user's explicit
> instruction to fix the P1 findings of a prior audit. Specifically: a duplicated `sending` signal
> was deleted and four `readonly(path, fn)` calls were rewritten as `readonly(path, { when })`.
>
> **This audit therefore partly grades my own recent change.** Every claim about that change is
> backed by an independent artifact — the project's own pre-existing e2e test
> (`e2e/contact.spec.ts:641`), the installed framework source, and the official documentation —
> rather than by my assessment of my own work. §6.4 states plainly where the change is now
> _confirmed correct by the documentation_ and where it is merely _not yet disproved_.
> The working tree is listed verbatim in Appendix C.

> ## Status update — 2026-11-05, after this audit
>
> The P1 roadmap item has since been implemented at the user's request. This report is left as the
> assessment **at the time of the audit**; the changes are summarised here rather than edited into
> the findings, so the record stays readable.
>
> - **CF-01 — closed.** `ContactSubmitResult` now carries `rejectedFields`; `HttpContactSubmitter`
>   recovers them from the API's validation body (shape verified against the API's own
>   `AllExceptionsFilter`, not inferred); `ContactForm` returns them from the submit action as
>   `ValidationError.WithOptionalFieldTree[]`, so Angular routes each to its field and clears it
>   when the visitor edits that field. The message shown is the localized `errorServer` copy, not
>   the API's English class-validator wording — that goes to the log with the response's
>   `requestId`. Only the five fields with an error slot are routed; see `CONTACT_API.md`.
> - **CF-06 — closed as a non-issue, by test.** §6.4 was right that readonly fields skip
>   validation and that `setSubmissionErrors` runs while `submitting()` is still true. What it did
>   not establish is that the suppression is **transient**: `submissionErrors` is a `linkedSignal`
>   and `syncErrors` a `computed`, so when the `finally` clears `submitting` the gate opens and the
>   stored error surfaces. `contact-form.spec.ts` now asserts exactly that on a field that was
>   locked during the send. **No narrowing of the `readonly` window was needed**, so the _medium_
>   regression risk in §14 did not materialise.
> - **CF-02 — partially addressed.** Focus for the server path is now by field name rather than by
>   a `.ng-invalid` DOM query, because the class binding is not guaranteed to have been applied in
>   the task `submit()` resolves in. `onInvalid` itself is still unused (still P2).
>
> **P2, 2026-11-06.** All four P2 items are now done as well.
>
> - **CF-04 — closed.** Every rule carries its `message`, supplied as a `LogicFn` so the copy
>   follows the locale, and the five error slots collapsed to one expression each:
>   `{{ fieldError(form.x()) }}`, which renders `errors()[0].message`. Declaration order is now
>   load-bearing (`required` → `email` → `maxLength`), and `contact-form.spec.ts` pins it.
>   `getError('required')` and the hand-rolled required-vs-email branch in the template are gone.
>   This also fixed a latent bug §7 did not name: the old template showed _"this field is
>   required"_ for a field that was present but too long, because the message was hardcoded beside
>   the field rather than coming from the rule that failed.
> - **CF-02 — closed.** Focus moved into `onInvalid`, and `focusFirstInvalid()` now picks the first
>   invalid field from `CONTACT_FIELDS` instead of querying the DOM. Necessary, not cosmetic:
>   `onInvalid` runs synchronously inside `submit()`, before the class bindings that would mark a
>   field `.ng-invalid` have been applied, so the old DOM query would have found nothing there.
>   **This retires CF-09 too** — nothing targets `.mat-mdc-select` any more.
> - **CF-11 — closed.** Both flakes were the same mistake, and the audit's own diagnosis of the
>   second one was incomplete. The hairline is dropped by
>   `app-header:has(+ .app__main > [data-layout='immersive'])` (`app.scss:40`), so it depends on
>   the lazily loaded routed component being in the DOM — which `goto` does not guarantee. Both
>   assertions now poll instead of reading once. 105/105 over three repeats.
> - **CF-10 — closed.** The README no longer calls Signal Forms experimental, and says so
>   explicitly rather than quietly editing the claim away.
>
> **One finding this work turned up, which the audit missed.** `FormField` propagates a
> `maxLength()` rule to the control as a **native `maxlength` attribute** (verified in-browser:
> `#contact-name` carries `maxlength="120"`, and filling 121 characters yields 120). So the
> client-side `maxLength` error is **unreachable from the UI** — the browser caps typing first.
> That makes §6.3's four `maxLength` rules defence-in-depth for values arriving by another path
> rather than a visitor-facing message, and it is now pinned by an e2e test asserting all four
> caps reach the DOM. It also means the latent bug CF-04 fixed was never visible to a visitor.
>
> **P3, 2026-11-06. Every finding in this report is now closed.**
>
> - **CF-05 — closed.** One `showError(state)` predicate replaced all **11** duplicated
>   `touched() && invalid()` expressions. The point was never the pattern — the guide recommends
>   it — but that each field needed the same answer twice, once to colour its caption and once to
>   render the message, with nothing keeping the two in step. Both halves now call the same
>   predicate, so they cannot diverge.
> - **CF-07 — closed.** The five closed option sets are `const` arrays with unions derived from
>   them, so `ContactInquiry` no longer types them as bare `string`. Proven to work: a typo in
>   `DEFAULTS` now fails `tsc` with `TS2820: Type '"new-projekt"' is not assignable to type
'"new-project" | …'. Did you mean '"new-project"'?`
>
>   §7's counterweight — that a union would have to be hand-synced with content and the API — is
>   answered rather than ignored: `contact-contract.spec.ts` now asserts each array against the
>   set the API accepts, so all three copies (content dictionary, these unions, the backend DTO)
>   are pinned together, and a union that drifted _wider_ than the backend fails a build.
>
>   One nuance worth recording: `service`, `timeline` and `budget` include `''`, the value the
>   form model holds before the visitor chooses. The API accepts `''` for the two optional
>   selects but **not** for `service`; `required(inquiry.service)` is what stops an empty one
>   being submitted. The unions describe the form model, not the wire contract.
>
>   `ChipOption.value` was deliberately left as `string`. Narrowing it would require making
>   `ChipSelect` generic and either an unsafe assertion or a lossy runtime guard at the intlayer
>   content boundary — and the contract test already pins the content values. Not worth it.
>
> - **`wcag22aa` — closed.** Added to the axe tag set. It contributes exactly one rule at
>   axe-core 4.14 — `target-size` (SC 2.5.8, the 24×24 px minimum); `wcag22a` contributes none, so
>   listing it would only imply coverage that does not exist. **All 29 a11y tests pass with it
>   enabled**, across 27 pages and the two interactive states, so the site was already clean
>   against it. The per-page test names now say "WCAG 2.2 AA".
> - **CF-09, CF-08, CF-03** were already closed — in P2, and in
>   `CONTACT_FORM_SUBMISSION_AUDIT.md` as S-02 and S-01 respectively. CF-03 is a
>   **`FALSE POSITIVE`**: `FormRoot.onSubmit` discards the promise `submit()` returns, so adopting
>   it would lose the awaited focus move and turn a throwing action into an unhandled rejection.
>
> Gates after P1: typecheck 0, lint clean, `lint:deps` 0 violations, unit **298/298** (was 280),
> full e2e **530/530**. Gates after P2: unit **302/302**, contact e2e **48/48**, full e2e below.

---

## 1. Executive Summary

`ContactForm` is a ten-field, flat, single-shot inquiry form: 216 lines of TypeScript, a 252-line
template, one reusable child control, one injectable submitter behind an abstract base, 28 unit
tests and 44 end-to-end tests.

**It is production-quality.** The model is a single writable signal, the schema is declarative and
co-located, the field-state reads follow the pattern the official documentation recommends by
name, the custom control takes a `Field<string>` as a typed input, and the submitter is swapped by
DI behind a Null Object default that cannot accidentally claim success. Accessibility is not
retrofitted: `readonly` is chosen over `disabled` specifically so controls keep their place in the
tab order, and there is a test that asserts exactly that.

**What it does not do is use the back half of the Signal Forms submission model.** Three documented
mechanisms are left on the table, and they are related:

1. **`FormRoot` is unused.** The template hand-writes `novalidate`, `(submit)`, and
   `event.preventDefault()` — the three things the `form[formRoot]` directive exists to supply.
2. **`onInvalid` is unused.** `focusFirstInvalid()` runs from a post-`await` `invalid()` re-read.
   The documentation names "focusing an invalid field" as the purpose of `onInvalid`.
3. **Server-side field errors are never mapped.** The action always returns `undefined`, so the
   documented path — return errors from the action, Angular routes them to fields, they clear when
   the user edits — is unreachable. A rejected submission degrades to one generic snackbar.

The third is the one that matters. The backend already answers `{ success: false, message? }`
(`http-contact-submitter.ts:13-16`), and the client discards the message.

A fourth, smaller gap: **validation messages live in the template, not the schema.** The installed
API accepts `message?: string | LogicFn<...>` on every validator — verified reactive, so the
i18n objection does not hold.

**Overall ContactForm Quality: 8/10. Weighted total across 21 categories: 8.3/10.**

---

## 2. Verified Angular Version and Package Compatibility

Read from installed `node_modules/*/package.json`, not the manifest ranges:

| Package             | Declared  | **Installed** |
| ------------------- | --------- | ------------- |
| `@angular/core`     | `^22.2.3` | **22.2.3**    |
| `@angular/forms`    | `^22.2.3` | **22.2.3**    |
| `@angular/material` | `^22.2.3` | **22.2.3**    |
| `@angular/cdk`      | `^22.2.3` | **22.2.3**    |
| `typescript`        | `~6.0.0`  | **6.0.3**     |
| `rxjs`              | `~7.8.0`  | **7.8.2**     |

`zone.js` is **not installed** — the application is genuinely zoneless. All 66 components resolve
to OnPush (Angular 22 compiles an omitted `changeDetection` _to_ OnPush; verified at
`node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:10343`).

**Signal Forms stability in 22.2.3.** Every function `ContactForm` imports carries
`@publicApi 22.0` in the installed `.d.ts` — `form`, `submit`, `required`, `email`, `maxLength`,
`readonly`, `FormField`, `FormRoot`, `provideSignalFormsConfig`. It is **not** experimental.
`README.md:18` still calls it "an experimental API"; that statement is incorrect for this version
(finding **CF-10**).

---

## 3. Official Documentation Research Summary

Pages fetched and read during this audit (not merely cited):

| Page                                              | What it settled                                                                                                                                                                     |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `angular.dev/guide/forms/signals/form-submission` | `submit()` sequence, `FormSubmitOptions` (`action`/`onInvalid`/`ignoreValidators`), `submitting()` auto-reset, server-error routing, concurrent-submit behaviour, `FormRoot`'s role |
| `angular.dev/guide/forms/signals/form-logic`      | `readonly`/`disabled`/`hidden` signatures; the `{when}` config object is the documented conditional form; all three skip validation                                                 |
| `angular.dev/guide/forms/signals/validation`      | Validator signatures incl. the `message` option; `touched() && invalid()` named as the recommended display pattern; async ordering; `errors()` shape                                |
| `angular.dev/guide/forms/signals/custom-controls` | `FormValueControl` / `FormCheckboxControl` contracts; how `[formField]` detects and binds; guidance that controls must not add their own state effects                              |

**Version-compatibility discipline applied.** Two places where the current documentation and the
installed 22.2.3 implementation disagree were resolved **in favour of the installed source**, per
the evidence hierarchy in the brief:

- **Does `readonly` skip validation?** The _validation_ page says "Hidden and disabled fields don't
  run validation" — omitting readonly. The _form-logic_ page says "All three skip validation."
  The installed source is unambiguous: `shouldSkipValidation = hidden() || disabled() ||
readonly() || isOrphaned()` (`_validation_errors-chunk.mjs:778`). **Readonly skips validation.**
  This is load-bearing for §6.4 and the documentation is internally inconsistent about it.
- **`getError()`** is used by the template (`contact-form.html:79`) but appears on **none** of the
  pages read. It exists and is typed in the installed API
  (`_structure-chunk.d.ts:1416-1419`). Marked `NOT DOCUMENTED` / `CONFIRMED in API`.

---

## 4. Documentation-to-Code Verification Matrix

| Topic               | Official documentation                                           | API used in Nexora                                                | Version compat.                      | Status                                                      |
| ------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------- |
| Form model          | signals/models — model is a writable signal                      | `signal<ContactInquiry>({...DEFAULTS})` `:113`                    | Verified 22.2.3                      | **Correct**                                                 |
| Form creation       | `form(model, schema)`                                            | `form(this.model, (inquiry) => …)` `:116`                         | Verified                             | **Correct**                                                 |
| Field tree          | `form.field` → `Field<T>`; `field()` → `FieldState`              | `form.name`, `form.email()…`                                      | Verified                             | **Correct**                                                 |
| Schema              | Declarative rules inside the schema callback                     | 10 rules + 4 readonly `:117-141`                                  | Verified                             | **Correct**                                                 |
| Required            | `required(path, {message?, when?})`                              | `required(path)` ×5                                               | Verified                             | **Correct**, message unused                                 |
| Email               | `email(path, {message?})`                                        | `email(inquiry.email)`                                            | Verified                             | **Correct**, message unused                                 |
| maxLength           | `maxLength(path, n, {message?})`                                 | ×4 with exported constants                                        | Verified                             | **Correct**, message unused                                 |
| minLength           | `minLength(path, n, …)`                                          | **not used**                                                      | Verified exists                      | **N/A** — no documented need                                |
| Custom `validate()` | `validate(path, fn)`                                             | **not used**                                                      | Verified exists                      | **N/A**                                                     |
| Async validation    | `validateHttp()`                                                 | **not used**                                                      | Verified exists                      | **N/A** — nothing to check server-side pre-submit           |
| Cross-field         | `valueOf()` inside `validate()`                                  | **not used**                                                      | Verified exists                      | **N/A** — no inter-field rule exists                        |
| Conditional logic   | `readonly(path, {when})`                                         | `readonly(path, {when})` ×4 `:137-140`                            | Verified                             | **Correct** (was deprecated form until this session — §6.4) |
| Field state         | `value/valid/invalid/touched/dirty/errors/pending`               | `touched()`, `invalid()`, `value()`, `getError()`, `submitting()` | Verified                             | **Correct**                                                 |
| Error display       | Docs recommend `touched() && invalid()`                          | exactly that, 14×                                                 | Verified                             | **Correct**                                                 |
| Error messages      | `message` option on each validator                               | hardcoded in template                                             | Verified `message` accepts `LogicFn` | **Deviation** — CF-04                                       |
| Submission          | `submit(form, {action, onInvalid, ignoreValidators})`            | `submit(form, {action})` `:169`                                   | Verified                             | **Partially correct** — CF-02                               |
| `submitting()`      | Auto-set/reset by `submit()`                                     | read at `:143`, drives readonly                                   | Verified                             | **Correct**                                                 |
| Server errors       | Return errors from `action`; routed to fields; clear on edit     | action returns `undefined` always `:185`                          | Verified                             | **Not implemented** — CF-01                                 |
| `FormRoot`          | `form[formRoot]` sets novalidate, prevents default, calls submit | hand-written equivalent                                           | Verified                             | **Deviation** — CF-03                                       |
| Custom controls     | `FormValueControl` / `FormCheckboxControl`                       | `ChipSelect` forwards `Field<string>`; Material via CVA           | Verified                             | **Correct** — §9                                            |
| Reset               | `form().reset(value)`                                            | `this.form().reset({...DEFAULTS})` `:177`                         | Verified                             | **Correct**                                                 |
| Nested / arrays     | Nested field trees, item paths                                   | flat model                                                        | Verified                             | **N/A** by design                                           |

---

## 5. Complete Dependency Map and Data Flow

### 5.1 Dependency graph

```
ContactForm (contact-form.ts / .html / .scss / .content.ts)
├── @angular/forms/signals ─ form, submit, required, email, maxLength, readonly,
│                            FormField, FormFieldBinding, provideSignalFormsConfig
├── ContactSubmitter            (abstract, providedIn:'root', Null Object default)
│   └── HttpContactSubmitter    (bound in app.config.ts:25 → useClass)
│       ├── HttpClient          (FetchBackend — v22 default, no withFetch() needed)
│       ├── API_ORIGIN          (core/routing/api-origin.ts — validating InjectionToken)
│       └── ErrorHandler
├── ChipSelect                  (child control; input.required<Field<string>>)
│   └── MatChipListbox / MatChipOption   (CVA-based)
├── FieldLabel                  (shared/ui; output<void> activate)
├── SnackBar + SNACK_BAR_CONFIG (shared/ui; MatSnackBar.openFromComponent)
├── Reveal                      (shared/motion directive; afterNextRender + IntersectionObserver)
├── appIcon()                   (core/icons; template-literal-typed registry key)
├── useDictionary()             (angular-intlayer; locale-reactive copy)
└── Material: MatFormField, MatInput, MatSelect/MatOption, MatButton, MatIcon, MatError, MatHint

Tests:  contact-form.spec.ts (11) · http-contact-submitter.spec.ts (7) ·
        contact-contract.spec.ts (10) · e2e/contact.spec.ts (44)
Styles: contact-form.scss → mixins/{reveal,visually-hidden,surface} + tokens/{motion,layout,spacing,typography}
        plus global src/styles/theme/{form-field,chip,button,snack-bar}.scss
```

**No HTTP interceptors exist** (`provideHttpClient()` is called with no features,
`app.config.ts:21`). `NO EVIDENCE` of interceptor-based error handling; errors are handled at the
service.

### 5.2 Data flow, stage by stage

| Stage                | Mechanism                                                                                                       | Evidence                                     | Verdict                |
| -------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------- |
| User input → control | `[formField]="form.name"` on `matInput`; `[formField]="field()"` inside `ChipSelect`                            | `contact-form.html:51`, `chip-select.html:1` | Correct                |
| Control → FieldTree  | `FormField` directive injects `NG_VALUE_ACCESSOR` and binds the CVA                                             | `signals.mjs:1271`                           | Correct — §9           |
| FieldTree → model    | Signal Forms writes through to the `model` signal                                                               | `:113,116`                                   | Single source of truth |
| Model → validation   | Schema rules re-evaluate reactively                                                                             | `:117-141`                                   | Correct                |
| Validation → UI      | `touched() && invalid()` gates `mat-error`; `provideSignalFormsConfig({classes})` emits `ng-*` for Material CSS | `:70-76, 98`; template ×14                   | Correct, doc-endorsed  |
| Submit → gating      | `submit()` marks touched, runs action only if valid                                                             | `_validation_errors-chunk.mjs:1853-1864`     | Correct                |
| Action → service     | `this.submitter.submit(this.model())`                                                                           | `:175`                                       | Correct                |
| Service → HTTP       | `POST ${origin}/api/contact`, `firstValueFrom`                                                                  | `http-contact-submitter.ts:40-41`            | Correct                |
| Response → status    | `response?.success ? 'sent' : 'failed'`                                                                         | `:43`                                        | **Lossy** — CF-01      |
| Status → UI          | 3-way snackbar; reset + focus heading on success                                                                | `:176-180, 203-220`                          | Correct                |
| Server field errors  | —                                                                                                               | none                                         | **Missing** — CF-01    |

**The payload is captured once**, at `:175`, from `this.model()` — not re-read after the await. No
race between a late edit and what was sent.

---

## 6. Signal Forms Architecture Analysis

### 6.1 Form model — **9/10**

```ts
private readonly model = signal<ContactInquiry>({ ...DEFAULTS });   // :113
```

`ContactInquiry` (`contact-submitter.ts:3-15`) is a flat interface of **ten `readonly string`
fields**, including a documented honeypot. Assessment against the brief's checklist:

- **Writable signal, used correctly** — yes; `{ ...DEFAULTS }` copies, so `DEFAULTS` cannot be
  mutated by the form and is safely reused by `reset()` at `:177`.
- **Single source of truth** — yes. After the P1 change there is no second state holder.
- **Domain model used directly as form model?** Yes — and **correctly so here.** `ContactInquiry`
  _is_ the wire DTO; `contact-contract.spec.ts:134` asserts the posted body carries exactly those
  ten keys because the API runs `forbidNonWhitelisted: true`. Introducing a separate form model
  plus a mapper would add a layer whose only job would be identity, and would break the
  single-source property that makes the contract test meaningful. **YAGNI correctly applied.**
- **Nested objects / arrays** — none. Correct for ten scalar fields.
- **`readonly` DTO** — the interface is fully `readonly`, so the model can only change through the
  signal. Good.

Held at 9 rather than 10 only because every field is typed `string`, including five that are
closed option sets (`interest`, `service`, `timeline`, `budget`, `method`). Those could be
const-assertion unions, which would make an invalid option a compile error instead of a test
failure. The project _does_ assert the exact value sets — but in a test
(`contact-contract.spec.ts:71-88`), not in the type system. See **CF-07**.

### 6.2 Schema architecture — **8/10**

```ts
protected readonly form = form(this.model, (inquiry) => {
  required(inquiry.interest);
  required(inquiry.name);     maxLength(inquiry.name, NAME_MAX);
  required(inquiry.email);    email(inquiry.email);  maxLength(inquiry.email, EMAIL_MAX);
  required(inquiry.company);  maxLength(inquiry.company, COMPANY_MAX);
  required(inquiry.service);
  required(inquiry.description); maxLength(inquiry.description, DESCRIPTION_MAX);
  const whileSending = () => this.form().submitting();
  readonly(inquiry.name, { when: whileSending });  /* ×4 */
});
```

**Strengths.** Declarative, co-located with field paths, one rule per line, no conditional
branching, no business logic. The limits are **exported constants** (`:51-55`) shared with the
backend contract test — so the number that the client enforces and the number the API enforces
cannot drift silently. That is the single best decision in this file.

**Schema composition / reuse** is absent, and correctly: there is one form and no repeated field
shape worth extracting into a reusable schema. Introducing `schema()` here would be abstraction
without a second caller.

**Lifecycle correctness — verified, not assumed.** `const whileSending = () => this.form()…`
references `this.form` _from inside the callback that produces it_. This is safe only because
schema logic functions are lazy: `readonly` is computed as
`parent.readonly() || logic.readonly.compute(ctx)` (`_validation_errors-chunk.mjs:1673`) and is
only evaluated when field state is first read — after construction. Confirmed empirically:
`npm run typecheck` exit 0 and 33/33 contact unit tests pass. **No eager evaluation, no cycle**
(`readonly` depends on `submitting`; `submitting` depends on `selfSubmitting`, a plain signal —
`:1337-1338`).

Deducted for the missing `message` option (CF-04), which belongs in the schema by design.

### 6.3 Validation — **7/10**

| Rule                         | Fields                                               | Correct?                        |
| ---------------------------- | ---------------------------------------------------- | ------------------------------- |
| `required`                   | interest, name, email, company, service, description | Yes                             |
| `email`                      | email                                                | Yes                             |
| `maxLength`                  | name 120, email 254, company 160, description 2000   | Yes, constants shared with API  |
| `minLength`                  | —                                                    | **N/A** — no documented minimum |
| custom / async / cross-field | —                                                    | **N/A** — none applicable       |

**`CONFIRMED` — client validation does not substitute for server validation.** The API runs
`whitelist: true` / `forbidNonWhitelisted: true`, and `contact-contract.spec.ts` pins the client to
it. The project explicitly does not assume the client is the gate.

**Three honest observations:**

- **`timeline` and `budget` are optional and unvalidated** — intentional, labelled "optional" in
  the UI (`contact-form.html:189,209`), and `contact-contract.spec.ts:141` asserts they are sent as
  empty strings rather than omitted (because the DTO whitelist would reject missing keys
  differently). Correct and tested.
- **The honeypot `website` has no client rule** — correct. A honeypot must accept input silently
  and be judged server-side; validating it client-side would tell a bot it had been detected.
- **Messages are not in the schema** — CF-04.

### 6.4 Field and form state — **9/10**

Reads are from the correct source throughout:

```ts
protected readonly submitting = computed(() => this.form().submitting());            // :143
protected readonly descriptionLength = computed(() => this.form.description().value().length);
protected readonly descriptionCount = computed<'ok'|'near'|'full'>(() => …);         // :147-153
```

`touched() && invalid()` is used for every error gate — the exact pattern the validation guide
names: _"The page recommends the pattern `touched() && invalid()` to avoid showing errors before
user interaction."_

**Redundant state: none, as of this session.** This is the part of the audit that grades a change I
made, so the evidence is external:

- The documentation states `submitting()` is managed by the framework: _"Once the `action` function
  succeeds or returns an error, the `submitting()` signal automatically resets back to `false`."_
  A component-held mirror of it was therefore redundant by documentation, not by opinion.
- The behaviour is asserted by a **pre-existing** project test I did not write,
  `e2e/contact.spec.ts:641` — it holds the API response open, asserts
  `readOnly === [true,true,true,true]` mid-flight, asserts `tabIndex === 0` (readonly not
  disabled), types into a locked field and asserts the value is unchanged, releases, then asserts
  the flags return to `false`. It passed in all three full e2e runs after the change.

**The one subtlety that remains, stated plainly.** Because readonly fields skip validation
(`shouldSkipValidation`, `:778`), the four locked fields report `valid` for the duration of a send,
and `syncErrors` — which _includes_ `normalizeErrors(submissionErrors())` at `:686` — would
suppress submission errors attached to them. This is **currently harmless**: the action returns
`undefined`, so `setSubmissionErrors` never runs. It becomes a live defect the moment CF-01 is
implemented. Recorded as **CF-06, RISK**, explicitly tied to a planned change rather than claimed
as a present bug.

### 6.5 Submission lifecycle — **7/10**

```ts
await submitForm(this.form, {
  action: async () => {
    try { …; this.notify(status); }
    catch (error) { this.errorHandler.handleError(error); this.notify('failed'); }
    return undefined;
  },
});
if (this.form().invalid()) { this.focusFirstInvalid(); }
```

Correct: marks touched and gates on validity (framework), captures the payload once, resets and
moves focus to the heading on success, notifies in all three outcomes, never lets an exception
escape to a broken UI.

**`ignoreValidators` is not set** — default `'pending'`. Correct: there are no async validators,
so `'pending'` and `'none'` are equivalent here, and `'all'` would be wrong.

**Concurrency is double-guarded.** `submit()` itself returns `false` if a submission is in flight
(docs: _"calls to `submit()` for the same form or any descendant return `false` immediately
without running the action"_; source `:1836-1838`), and `HttpContactSubmitter.pending` latches
independently (`:31-33`). Not redundant — the submitter is separately injectable and should not
depend on its caller's discipline — but see **CF-08** for the sharp edge.

Deducted for CF-01, CF-02, CF-03.

---

## 7. Confirmed Findings

### CF-01 — Server-side validation errors are never mapped to fields

**Severity:** Medium · **Status:** `CONFIRMED`
**Files:** `contact-form.ts:175-185`; `http-contact-submitter.ts:13-16, 43`

The API response type already declares a message:

```ts
interface ContactApiResponse {
  readonly success: boolean;
  readonly message?: string;
}
```

and the submitter discards it:

```ts
return { status: response?.success ? 'sent' : 'failed' };
```

The component's action then always `return undefined` (`:185`).

**Documentation.** `angular.dev/guide/forms/signals/form-submission` documents the supported path:
errors returned from `action` are _"routed to their target fields"_; an error carrying a
`fieldTree` property attaches to a specific field; an array reports on several; and submission
errors _"clear automatically when the user edits the field"_ and _"do not reappear unless the form
is submitted again."_

**Impact.** Every server rejection — a field the API considered invalid, a rate limit, a rejected
email domain — collapses into one generic snackbar. The visitor is told it failed and not what to
change, on the site's only conversion path.

**Recommendation.** Widen `ContactSubmitResult` to carry optional field errors, and return them
from the action so Angular routes them. Implement **with CF-06**: the readonly-skips-validation
interaction must be resolved in the same change, or the routed errors will be suppressed on the
four locked fields.

**Verification.** New unit test: action returns an error with `fieldTree` → that field's `errors()`
contains it, and editing the field clears it.

---

### CF-02 — `onInvalid` is unused; focus is driven by a post-`await` re-read

**Severity:** Low · **Status:** `CONFIRMED` · **File:** `contact-form.ts:191-193`

`FormSubmitOptions.onInvalid` exists (`_structure-chunk.d.ts:991-994`) and the documentation names
this exact use case: it _"runs after interactive fields are touched, so errors are already
visible,"_ suggesting _"scrolling to the first error or focusing an invalid field."_

**Nuance — the current code is not simply wrong.** `onInvalid` fires only on pre-submission
validation failure. The post-`await` check also fires if the action left the form invalid, which
is a deliberate-looking superset — though unreachable today because the action returns `undefined`.
Once CF-01 lands, the two diverge meaningfully and the choice must be made explicitly.
**Recommendation:** move to `onInvalid`, and if the superset behaviour is wanted, keep the extra
check with a comment saying why.

---

### CF-03 — `FormRoot` is reimplemented by hand

**Severity:** Low · **Status:** `CONFIRMED` · **Files:** `contact-form.html:1-9`; `contact-form.ts:169-170`

The template supplies `novalidate` and `(submit)="submit($event)"`; the method opens with
`event?.preventDefault()`. The `form[formRoot]` directive (`signals.d.ts:822-827`) provides
precisely those three behaviours.

**Honest counterweight:** the documentation states `FormRoot` calls `submit()` _"only if the form
has a `submission` option"_ — i.e. the action must move into `form()`'s options. That would
relocate `notify()`, `reset()` and the focus move away from the component method that currently
owns them. The hand-written version is a legitimate trade, not an error. Filed so the choice is
recorded rather than accidental.

---

### CF-04 — Validation messages live in the template, not the schema

**Severity:** Low–Medium · **Status:** `CONFIRMED`
**Files:** `contact-form.html:54-56, 77-85, 108-110, 135-137, 161-165`; schema `:117-132`

```html
@if (form.email().touched() && form.email().invalid()) {
<mat-error>
  @if (form.email().getError('required')) { {{ content().errorRequired }} } @else { {{
  content().errorEmail }} }
</mat-error>
}
```

Every validator in the installed API accepts a message, and **it is reactive** — verified at
`signals.d.ts:109-113`:

```ts
type BaseValidatorConfig<TValue, TPathKind> = {
  message?: string | LogicFn<TValue, string, TPathKind>;
  error?: never;
  when?: NoInfer<LogicFn<TValue, boolean, TPathKind>>;
} | { error?: …; message?: never; when?: … };
```

Because `message` accepts a `LogicFn`, **the usual objection — "our messages are localized and the
schema runs once" — does not apply.** `required(inquiry.email, { message: () =>
this.content().errorRequired.value })` re-evaluates with the locale.

**Why it matters.** Today the _rule_ lives in the schema and the _consequence of the rule failing_
lives in the template, 60 lines away, with the branch between `required` and `email` re-derived by
hand through `getError('required')`. Adding a rule means editing two files, and nothing fails if
you forget the second.

**Counterweight:** the current form gives explicit control over which single message shows, and
`getError()` is typed. Moving to schema messages means rendering `errors()[0].message`, which
changes prioritization semantics. **Recommendation:** move messages into the schema and render the
first error generically; verify with the existing `contact-form.spec.ts` validation tests plus the
e2e error-copy assertions.

---

### CF-05 — Error-visibility expression duplicated 14×

**Severity:** Low · **Status:** `CONFIRMED` · **File:** `contact-form.html`

`form.X().touched() && form.X().invalid()` appears twice per field for seven fields — once for
`app-field-label [invalid]`, once for the `@if` around `mat-error`. The _pattern_ is
doc-recommended; the _duplication_ is the issue: the paired expressions must stay identical and
nothing enforces it. A `shouldShowError(field)` helper would make divergence impossible.

---

### CF-06 — Readonly-during-send suppresses validation (latent, tied to CF-01)

**Severity:** Low now, Medium after CF-01 · **Status:** `RISK`
**Evidence:** `_validation_errors-chunk.mjs:778` (`shouldSkipValidation`), `:682-686` (`syncErrors`
returns `[]`, and includes `submissionErrors()`)

See §6.4. Currently unreachable; must be resolved in the same change as CF-01.

---

### CF-07 — Five closed option sets are typed as bare `string`

**Severity:** Low · **Status:** `CONFIRMED` · **File:** `contact-submitter.ts:3-15`

`interest`, `service`, `timeline`, `budget`, `method` accept any string at compile time. The exact
accepted values _are_ pinned — but by `contact-contract.spec.ts:71-88`, a test. Const-assertion
unions would move that guarantee into the type system and make `ChipSelect`'s
`input.required<Field<string>>` more precise.

**Counterweight:** the values originate in intlayer content dictionaries, so a union would have to
be kept in step with content by hand — which is what the contract test already does, against the
_backend_ rather than against a local literal. Lower value than it first appears; filed as P3.

---

### CF-08 — Coalescing latch can return another payload's result

**Severity:** Low · **Status:** `CONFIRMED` · **File:** `http-contact-submitter.ts:31-33`

```ts
this.pending ??= this.send(inquiry).finally(() => {
  this.pending = null;
});
```

A second call with _different_ data receives the first call's promise; its own `inquiry` is
silently dropped. Unreachable from this UI (single form instance, disabled button, framework
re-entry guard), and `CONTACT_API.md` records the no-deduplication decision deliberately. But the
service is independently injectable and the signature promises to submit _this_ inquiry.
**Recommendation:** key the latch on the payload, or document the precondition on the method.

---

### CF-09 — `focusFirstInvalid` couples to Material's internal class

**Severity:** Low · **Status:** `CONFIRMED` · **File:** `contact-form.ts:197-201`

```ts
'input.ng-invalid, textarea.ng-invalid, .mat-mdc-select.ng-invalid';
```

`.mat-mdc-select` is an internal Material class with no stability guarantee; a Material restyle
could silently stop selects being focused. The `ng-invalid` part is safe — the project _creates_
it via `provideSignalFormsConfig({classes: STATUS_CLASSES})` (`:70-76`). **Recommendation:** target
the project's own `#contact-service` / `[formField]` hooks instead.

---

### CF-10 — README calls Signal Forms experimental

**Severity:** Low · **Status:** `CONFIRMED` · **File:** `README.md:17-20`

Every API in use is `@publicApi 22.0` in the installed package. The stated upgrade risk is
overstated in kind, though the practical advice (run the contact tests on every upgrade) remains
sound.

### Findings deliberately **not** raised

| Candidate                                            | Why it is `FALSE POSITIVE`                                                                     |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| "Custom control should implement `FormValueControl`" | `ChipSelect` is a _forwarder_, not a control — §9                                              |
| "`provideHttpClient()` missing `withFetch()`"        | v22 defaults to `FetchBackend` (`_module-chunk.mjs:2036-2043`); `withXhr()` is the opt-out     |
| "No `changeDetection: OnPush`"                       | v22 compiles omission _to_ OnPush (`_debug_node-chunk.mjs:10343`)                              |
| "`touched() && invalid()` repeated — wrong pattern"  | It is the pattern the official guide recommends by name; only the duplication is filed (CF-05) |
| "Honeypot is unvalidated"                            | Correct by design — client-side validation would reveal detection                              |
| "Two concurrency guards is redundant"                | Defence in depth across an injectable boundary                                                 |

---

## 8. Angular 22.2.3 Best Practices

| Practice              | Status       | Evidence                                                                                                     |
| --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| Standalone components | ✅           | No NgModules anywhere                                                                                        |
| Signals-first         | ✅           | 1 writable signal (`model`), 5 `computed` in this component                                                  |
| `effect()`            | ✅ none here | Correctly absent — nothing external to sync                                                                  |
| `linkedSignal()`      | ✅ none      | No derived-writable state exists                                                                             |
| `resource()`          | ✅ none      | Only HTTP call is a **mutation**; Angular's own TSDoc warns `resource` _"could prematurely abort mutations"_ |
| OnPush                | ✅           | By v22 default; pinned by `change-detection.spec.ts`                                                         |
| Zoneless              | ✅           | `zone.js` not installed                                                                                      |
| `inject()`            | ✅           | 3 injections, zero constructor params                                                                        |
| Lifecycle hooks       | ✅ none      | `viewChild.required` replaces `ngAfterViewInit`                                                              |
| Control flow          | ✅           | `@if` / `@for` with `track`, no `*ngIf`                                                                      |
| TypeScript strictness | ✅           | 8 flags + `strictTemplates`; no `any`, no `!`, no `@ts-ignore`                                               |
| `input.required`      | ✅           | `ChipSelect` ×3, `FieldLabel` ×3                                                                             |
| `output()`            | ✅           | `FieldLabel.activate`                                                                                        |

---

## 9. Custom Controls and FormField Integration — **8/10**

```ts
export class ChipSelect {
  readonly field = input.required<Field<string>>();
  readonly options = input.required<readonly ChipOption[]>();
  readonly labelledBy = input.required<string>();
  private readonly listbox = viewChild.required(MatChipListbox);
  focus(): void {
    this.listbox().focus();
  }
}
```

**`ChipSelect` does not implement `FormValueControl`, and should not.** The documentation's
control interfaces are for components that _own_ a value. `ChipSelect` owns none — it accepts a
`Field<string>` as a typed input and forwards it to `MatChipListbox` via `[formField]`
(`chip-select.html:1`). It is a _composition wrapper_, and taking `Field<T>` as an input is the
idiomatic way to build one. The guidance that _"controls should not add their own effects for
state management"_ is honoured: `ChipSelect` has no effects and no state.

**Material integrates through ControlValueAccessor, and that is supported, not legacy debt.**
`MatChipListbox` provides `NG_VALUE_ACCESSOR` (`chips.mjs:1638`), and the `FormField` directive
itself injects it (`signals.mjs:1271`, importing `NG_VALUE_ACCESSOR` and `ɵselectValueAccessor`).
CVA is the built-in bridge for existing component libraries — `CANNOT DETERMINE` from the
custom-controls page alone, which defers to the migration guide, but **`CONFIRMED` in the installed
source**.

Deducted one point for the `focus()` escape hatch: the parent calls `interestChips.focus()` from a
template reference (`contact-form.html:20`) to implement label-click behaviour. It works and is
accessible, but it is imperative coupling where a native `<label for>` would do if the chip group
exposed a focusable id.

---

## 10. Architecture, Patterns and SOLID

| Pattern                        | Implementation                                                                             | Value                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| **Null Object**                | `ContactSubmitter` base returns `{status:'not-configured'}` (`contact-submitter.ts:25-28`) | **High.** The default cannot pretend to have sent. Tested at `contact-form.spec.ts:207`. |
| **Strategy via DI**            | `{provide: ContactSubmitter, useClass: HttpContactSubmitter}` (`app.config.ts:25`)         | **High.** Tests swap the strategy with no mocking framework.                             |
| **Container / Presentational** | `ContactForm` orchestrates; `ChipSelect`, `FieldLabel`, `SnackBar` are pure                | **High.**                                                                                |
| **Adapter**                    | `interestOptions`/`methodOptions` map intlayer dictionary → `ChipOption` (`:155-167`)      | Medium — isolates the content shape from the control.                                    |
| **Facade**                     | —                                                                                          | Not used; not needed.                                                                    |

**SOLID.** _SRP_ — the component owns orchestration, option adaptation, notification copy and
focus management; `notify()` (`:204-221`) is arguably a presentation concern that could live with
`SnackBar`, which is the main stretch. _OCP_ — a new submitter needs no change here. _LSP_ —
`HttpContactSubmitter extends ContactSubmitter` with `override`, enforced by `noImplicitOverride`.
_ISP_ — inputs are minimal and required. _DIP_ — the component depends on the abstract
`ContactSubmitter`, never on `HttpClient`; **this is the keystone**, and it is what makes the unit
tests fast and real.

No circular dependencies: `dependency-cruiser` reports 0 violations across 183 modules /
518 dependencies with `tsPreCompilationDeps: true`.

---

## 11. TypeScript, SCSS, Performance, Accessibility

**TypeScript — 9/10.** Zero `any`, zero non-null assertions, zero `@ts-ignore`/`@ts-expect-error`
in the entire repository. `readonly` DTO, `satisfies` for route data, template-literal-typed icon
keys, typed `getError<K>()`. `noUncheckedIndexedAccess` is still off (project-wide). CF-07 is the
one place types under-deliver.

**SCSS — 9/10.** `contact-form.scss` is 196 lines: flat BEM, max nesting depth 2, **zero
`!important`, zero `::ng-deep`**, every value from a token (`spacing.space()`, `--mat-sys-*`,
`--nx-sys-*`), logical properties throughout (`inset-inline`, `border-start-start-radius`,
`margin-inline-start`). `min-width: 0` appears 8× — deliberate defence against grid children
refusing to shrink. Reduced motion is honoured both at the token layer and, where a duration is
hardcoded (`form-pending`, 1200ms), by an explicit `prefers-reduced-motion` query — correct, since
the token would not cover it. Theme overrides are scoped (`--mat-button-filled-container-height`
on `.form`), and a test asserts the override does not leak to root
(`e2e/contact.spec.ts:142`).

**Responsive — 9/10.** Measured in-browser this session across 320/360/390/768/1024/1280/1440/
1920/2560 × 3 locales: `/contact` clean at every width. `form__row` collapses to one column below
`medium`; the 220px submit `min-width` fits the 232px available at 320px.

**Performance — 8/10.** No leaks (no subscriptions in the component; the submitter uses
`firstValueFrom`). Five `computed`, all cheap. `@defer` not used here — correct, the form is the
page's purpose. The honest cost: **`/contact` is the heaviest route in the application at
829.3 kB raw / 220.7 kB gzip** across 6 preloaded files (measured this session). Material's
form-field, select and chips dominate.

**Accessibility — 9/10.** `readonly` over `disabled` so focus is never stolen mid-send — with a
test asserting `tabIndex === 0`. `[attr.aria-busy]`, `aria-labelledby` on every non-native control,
`mat-error` tied to its field, the required asterisk `aria-hidden` with a test that it stays out of
the accessible name (`:433`), honeypot `aria-hidden` + `tabindex="-1"` + visually-hidden, focus
returned to the heading on success (`:178`), label-click focuses custom controls (`:249`).
axe-core WCAG 2.1 AA sweeps run over the page. Not 10: `wcag22aa` is not in the axe tag set.

---

## 12. Testing Analysis — **9/10**

**28 unit tests + 44 e2e tests**, all executed this session.

| Brief §10 scenario               | Covered? | Where                                                |
| -------------------------------- | -------- | ---------------------------------------------------- |
| 1. Empty submission              | ✅       | `contact-form.spec.ts:156`                           |
| 2. Invalid email                 | ✅       | `:122`                                               |
| 3. Missing required fields       | ✅       | `:113`                                               |
| 4. Valid submission              | ✅       | `:164`, e2e `:160`                                   |
| 5. Slow API response             | ✅       | e2e `:441`, `:641` (held promise)                    |
| 6. Failed API response           | ✅       | `:197`, e2e `:224`, `:616`                           |
| 7. Repeated submit clicks        | ✅       | `http-contact-submitter.spec.ts:97`, e2e `:189`      |
| 8. Server-side validation errors | ❌       | **Not covered — feature not implemented (CF-01)**    |
| 9. Network interruption          | ✅       | `http-contact-submitter.spec.ts:80` (`status === 0`) |
| 10. Successful submission        | ✅       | e2e `:160`                                           |
| 11. Form reset after success     | ✅       | `contact-form.spec.ts:164`, e2e `:594`               |
| 12. Editing after a server error | ❌       | **N/A until CF-01**                                  |

The two gaps are the same gap. Coverage is otherwise exemplary, and
`contact-contract.spec.ts` is unusual in a good way: it asserts the _payload shape_ against the
backend's whitelist, so adding a field fails a build here rather than breaking production.

**Suite reliability — `CONFIRMED` flakiness, pre-existing.** Three full e2e runs this session:
528/528, then 527/528 (`engagement-page.spec.ts:223`, a scroll-position assertion), then 527/528
(`layout.spec.ts:233`, a 1px hairline). **Different tests each time, neither in contact code,
both pass in isolation** (15/15 and 20/20 respectively). Root cause for the first is visible in
the source: the test reads `getBoundingClientRect().top` with no wait, while the scroll is driven
by `afterNextRender` (`engagement-models.ts:56`) — and the observed 1844px matches the unscrolled
position the component's own comment records as 1921px. CI masks this with
`retries: 2` (`playwright.config.ts:14`); local runs have none. Filed as **CF-11, P2**, outside
ContactForm but inside the gate that protects it.

---

## 13. Scoring

| Category                        |    Score | What prevents a higher score                                                                             |
| ------------------------------- | -------: | -------------------------------------------------------------------------------------------------------- |
| Overall ContactForm Quality     | **8**/10 | CF-01 unimplemented; CF-02/03/04 leave documented mechanisms unused                                      |
| Angular 22.2.3 Best Practices   | **9**/10 | Nothing in-component; −1 for README's stale "experimental" claim (CF-10)                                 |
| Signal Forms Architecture       | **8**/10 | Front half (model/schema/state) excellent; back half (submission errors, `FormRoot`, `onInvalid`) unused |
| Form Model Design               | **9**/10 | CF-07 — five closed sets typed as `string`                                                               |
| Schema Architecture             | **8**/10 | CF-04 — messages belong here                                                                             |
| Validation Implementation       | **7**/10 | CF-04; messages split across two files with a hand-rolled branch                                         |
| Field and Form State Management | **9**/10 | Clean after this session's fix; CF-06 remains latent                                                     |
| Submission Lifecycle            | **7**/10 | CF-01, CF-02, CF-03                                                                                      |
| Custom Controls Integration     | **8**/10 | Correct design; imperative `focus()` coupling                                                            |
| Component Architecture          | **8**/10 | `notify()` copy-mapping is a presentation concern in a container                                         |
| Design Patterns                 | **9**/10 | Four patterns, each earning its place; no over-abstraction                                               |
| SOLID Principles                | **8**/10 | SRP stretched by `notify()` + option adaptation + focus management                                       |
| TypeScript Quality              | **9**/10 | CF-07; `noUncheckedIndexedAccess` off project-wide                                                       |
| Service and API Integration     | **9**/10 | CF-08 latch edge                                                                                         |
| Error Handling                  | **7**/10 | CF-01 — server messages discarded                                                                        |
| SCSS Architecture               | **9**/10 | Essentially exemplary; nothing material to deduct beyond taste                                           |
| Responsive Design               | **9**/10 | Measured clean 320–2560 across 3 locales                                                                 |
| Performance                     | **8**/10 | Heaviest route in the app at 220.7 kB gzip                                                               |
| Accessibility                   | **9**/10 | `wcag22aa` not in the axe tag set                                                                        |
| Testing Quality                 | **9**/10 | Gaps only where the feature does not exist; suite flakiness (CF-11)                                      |
| Maintainability and Scalability | **8**/10 | CF-05; a 252-line template that scales linearly with field count                                         |

### Weighted overall

Signal Forms is weighted heaviest per the brief.

| Cluster                | Categories                                                                  | Mean |   Weight | Contribution |
| ---------------------- | --------------------------------------------------------------------------- | ---: | -------: | -----------: |
| **Signal Forms core**  | Architecture, Model, Schema, Validation, State, Submission, Custom Controls | 8.00 |      45% |         3.60 |
| Angular / TS / Design  | Best Practices, Component Arch., Patterns, SOLID, TypeScript                | 8.60 |      20% |         1.72 |
| UI quality             | SCSS, Responsive, Accessibility                                             | 9.00 |      12% |         1.08 |
| Service & errors       | API Integration, Error Handling                                             | 8.00 |      10% |         0.80 |
| Testing                | Testing Quality                                                             | 9.00 |       8% |         0.72 |
| Perf & maintainability | Performance, Maintainability                                                | 8.00 |       5% |         0.40 |
| **Weighted total**     |                                                                             |      | **100%** |     **8.32** |

**Weighted score: 8.3 / 10.**

---

## 14. Improvement Roadmap

### P0 — Critical

**None.** No finding threatens correctness, security or availability.

### P1 — High

**CF-01 + CF-06 — Map server-side validation errors to fields.**
_What:_ widen `ContactSubmitResult` with optional field errors; return them from the action so
Angular routes them; resolve the readonly/validation interaction in the same change.
_Why:_ the only conversion path currently tells a rejected visitor nothing actionable, and the API
already sends a message.
_Files:_ `contact-submitter.ts`, `http-contact-submitter.ts:43`, `contact-form.ts:175-193`.
_Docs:_ `guide/forms/signals/form-submission` — error routing, `fieldTree`, clear-on-edit.
_Result:_ field-level server errors that clear as the visitor fixes them.
_Regression risk:_ **Medium** — CF-06 means errors on the four readonly fields are suppressed while
`submitting()` is true. Narrow the `when` to exclude the error window, or lock via a flag that
clears before errors are applied.
_Verify:_ new unit test (error with `fieldTree` → `errors()` contains it, edit clears it); e2e with
a 422 response; re-run `contact.spec.ts:641`.

### P2 — Medium

| ID        | What                                                                                        | Files                                                       | Risk                                                          |
| --------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| **CF-04** | Move validation messages into the schema using the reactive `message` option                | `contact-form.ts:117-132`, `contact-form.html`              | Low — changes error prioritization; covered by existing tests |
| **CF-02** | Move `focusFirstInvalid()` into `onInvalid`, or comment why the superset is wanted          | `contact-form.ts:191-193`                                   | Low                                                           |
| **CF-11** | Fix the two flaky e2e assertions (`expect.poll` for the scroll; tolerance for the hairline) | `e2e/engagement-page.spec.ts:231`, `e2e/layout.spec.ts:233` | Low — test-only                                               |
| **CF-10** | Correct the README's "experimental API" claim                                               | `README.md:17-20`                                           | None                                                          |

### P3 — Low

| ID        | What                                                                       |
| --------- | -------------------------------------------------------------------------- |
| **CF-05** | One `shouldShowError(field)` helper to replace 14 duplicated expressions   |
| **CF-09** | Stop targeting `.mat-mdc-select` in `focusFirstInvalid`                    |
| **CF-08** | Key the coalescing latch on the payload, or document the precondition      |
| **CF-07** | Const-assertion unions for the five closed option sets                     |
| **CF-03** | Adopt `FormRoot` _if_ the action moves into `form()`'s `submission` option |
| —         | Add `wcag22aa` to the axe tag set                                          |

### Explicitly **not** recommended

Replacing the submitter with `resource()` (premature mutation abort — Angular's own TSDoc) ·
introducing a separate form model + mapper (identity layer; breaks the contract test's meaning) ·
`linkedSignal()` (no derived-writable state) · async validators (nothing to check pre-submit) ·
`FormValueControl` on `ChipSelect` (it forwards a `Field`, it does not own a value).

---

## 15. Final Conclusion

`ContactForm` is **genuinely well-engineered, not merely modern**. The distinction shows in the
decisions that go _against_ adding code: one flat model that is also the wire DTO, no mapper layer,
no `resource()` around a mutation, no custom control interface where a forwarder suffices, no async
validators invented to look thorough. Limits are exported constants shared with a backend contract
test. The default submitter is a Null Object that cannot lie about success. `readonly` is chosen
over `disabled` for a stated accessibility reason, and a test asserts the tab order.

Its weakness is one-sided and specific: **it implements the input half of Signal Forms thoroughly
and the submission-response half barely.** Validation flows in; server judgement does not flow
back. `FormRoot`, `onInvalid`, and error routing are all documented, all available in 22.2.3, and
all unused — and the API is already returning a `message` the client throws away.

Fix CF-01 (with CF-06) and this is a 9. The rest is refinement.

**Production-ready: yes**, with the caveat that the production form cannot currently submit at all
— `environment.production.ts:6` ships `apiOrigin: ''`, a deliberate, documented and
tripwire-guarded state (`CONTACT_API.md`), because the API is written but not deployed. That is a
deployment matter, not a defect in this component.

---

## Appendix A — Verification Log

**Executed this session:** `npm run typecheck` (4 projects, exit 0) · `npm run lint` (clean, now
with type-aware `@typescript-eslint/no-deprecated`) · `npm run lint:deps` (0 violations, 183
modules) · `npm run lint:styles` (clean) · `npm test -- --no-watch` (280/280) ·
`npm run test:scripts` (51/51) · `npm run build` (27 routes) · `verify:prerender` ·
`verify:headers` · `verify:bundle` · **3× full Playwright suite** (528/528, 527/528, 527/528) ·
isolation re-runs of both flaky specs (15/15, 20/20) · per-route JS measurement over `dist/`.

**Framework source verified:** `readonly` overloads (`signals.d.ts:92,95-100`) ·
`BaseValidatorConfig` (`:109-120`) · `FormRoot` (`:822-827`) · `FormSubmitOptions`
(`_structure-chunk.d.ts:968-1001`) · `submitting` (`:1337`) · `getError` (`:1416-1419`) ·
`submit()` runtime (`_validation_errors-chunk.mjs:1835-1867`) · `shouldSkipValidation` (`:778`) ·
`syncErrors` (`:682-686`) · `readonly` computed (`:1673`) · `FormField` CVA injection
(`signals.mjs:1271`) · `MatChipListbox` `NG_VALUE_ACCESSOR` (`chips.mjs:1638`) ·
`provideHttpClient` backend (`_module-chunk.mjs:2036-2043`).

**Documentation fetched:** 4 pages (§3).

## Appendix B — Not verified

| Area                                           | Reason                                                                                                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| WebKit / Firefox rendering                     | Only Chromium binaries installed (`playwright.config.ts:26-31`)                                                                                    |
| Core Web Vitals                                | No Lighthouse or field data collected                                                                                                              |
| Unit-test coverage %                           | Coverage reporting not enabled in the Vitest config                                                                                                |
| Real backend behaviour                         | `Nexora-back` is a separate repository, out of scope                                                                                               |
| Production submission path                     | `apiOrigin: ''`; no live API. No real inquiry was submitted.                                                                                       |
| `angular.dev` pages beyond the 4 fetched       | Models, schemas, field-state-management and comparison pages were **not** fetched; conclusions touching them rest on the installed `.d.ts` instead |
| Material `readonly` propagation to select/chip | Needed before implementing CF-05's sibling (extending `readonly` to the selects); `NOT VERIFIED`                                                   |

## Appendix C — Working tree at audit time

Per §16, no application source was modified **by this audit**. Only the two reports were created.
The tree already contained uncommitted work from the preceding task (see the disclosure at the
top):

```
 M .github/workflows/ci.yml          ← prior task: added verify:bundle gate
 M README.md                         ← prior task: documented verify:bundle
 M eslint.config.js                  ← prior task: type-aware linting + no-deprecated
 M package.json                      ← prior task: prelint, verify:bundle scripts
 M src/app/change-detection.spec.ts  ← prior task: scoped suppression for a deliberate deprecated ref
 M src/app/pages/contact/contact-form/contact-form.ts   ← prior task: AUDIT SUBJECT (see disclosure)
?? ANGULAR_22_2_3_ADVANCED_AUDIT.md  ?? ANGULAR_22_2_3_AUDIT_SUMMARY.md
?? scripts/verify-bundle-budget.mjs  ?? scripts/verify-bundle-budget.test.mjs
?? CONTACT_FORM_TECHNICAL_AUDIT.md   ?? CONTACT_FORM_AUDIT_SUMMARY.md   ← this audit
```

## Appendix D — Correction to a prior deliverable

`ANGULAR_22_2_3_ADVANCED_AUDIT.md` §5.4 states `output()` has **0 uses**. That is **wrong**: the
census regex `output\(` missed the generic call form. The correct count is **3**
(`field-label.ts:16`, `category-nav.ts:19`, `filter-bar.ts:25`), and optional `input()` is **17**,
not 2. The load-bearing zeros in that report — `linkedSignal`, `resource`, `rxResource`,
`untracked`, `asReadonly`, `model` — were re-checked with a generics-tolerant pattern and **all
hold**. §3.1 and §5.4 of that report have been corrected in place, with the correction marked
inline. `ANGULAR_22_2_3_AUDIT_SUMMARY.md` does not mention either count and needed no change.
