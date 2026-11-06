# Contact Form — Signal Forms Submission Audit

**Project:** Nexora Angular frontend (`C:\Users\xXx\Desktop\Nexora`)
**Subject:** submission mechanics of `app-contact-form`
**Date:** 2026-11-06
**Role:** Staff / Principal Angular Developer & Software Architect

---

## 0. Correction to the brief's premise — read first

The brief's §4.2 asks me to investigate this binding:

```html
<form [formRoot]="contactForm"></form>
```

**That code does not exist in this project.** Verified: `grep -rn "FormRoot\|formRoot" src/ e2e/` returns nothing, `FormRoot` is not among the component's imports, and the form signal is named `form`, not `contactForm`. The real element is:

```html
<form
  #card
  class="form"
  appReveal="load"
  novalidate
  [attr.aria-busy]="submitting()"
  (submit)="submit($event)"
  aria-labelledby="contact-form-title"
></form>
```

I have therefore audited the submission path **as implemented**, and investigated `FormRoot` from the installed source to answer whether it _should_ be adopted. §5.2 gives that answer, and it is **no** — adopting it would be a regression here, for reasons that are visible in its implementation. §4.3's `<input [formField]="contactForm.email">` is correct in substance: the real binding is `[formField]="form.email"`.

---

## 1. Executive Summary

The submission path is **correct and production-ready**. Signal Forms is used as designed: one writable signal model, a declarative schema, `submit()` with an `action` and an `onInvalid` hook, and `submitting()` read directly rather than mirrored into component state. The framework's own guarantees are relied on instead of being re-implemented.

This audit **found and fixed two real defects**, both in the transport layer rather than in the form:

- **S-02 `CONFIRMED` P3 — the request-coalescing latch was unkeyed**, so a second `submit()` with _different_ data received the first call's result and was never sent. Fixed and negative-tested: against the old code the new regression test fails with `expected [ TestRequest ] to have a length of 2 but got 1`, proving the second inquiry was silently dropped.
- **S-03 `CONFIRMED` P3 — a non-JSON error body was untested**, and it is the realistic production shape. `FetchBackend.parseBody` returns **raw text** when a non-2xx body fails to JSON-parse, so an HTML 502 page from a proxy arrives as a string where an object was expected. The code already survived it; nothing proved so. Now tested.

It also **disproved three plausible-sounding findings** with source evidence, including one of my own from a previous audit:

- **S-01 `FALSE POSITIVE`** — "`FormRoot` should be used." Its `onSubmit` **drops the promise `submit()` returns**, so the form could no longer await the submission and move focus to the first server-rejected field, and a throwing action would become an unhandled rejection.
- **S-05 `FALSE POSITIVE`** — "readonly-during-send hides submission errors." The suppression is real but **transient and self-correcting**; now pinned by test.
- **S-06 `NO EVIDENCE`** — "the app must guard duplicate submissions." The framework guards them, before `markAsTouched`.

One behaviour is recorded as a **deliberate trade rather than fixed** (S-04): `submit()` resolves `true` for a generic failure. The obvious fix would block a visitor from retrying after a transient outage without first editing a field. The evidence chain is in §9.

---

## 2. Installed Angular Version

Read from `node_modules`, cross-checked against `package-lock.json` — not from the manifest's `^` ranges:

| Package                              | Range in `package.json` | **Installed**     | Lockfile |
| ------------------------------------ | ----------------------- | ----------------- | -------- |
| `@angular/core`                      | `^22.2.3`               | **22.2.3**        | 22.2.3   |
| `@angular/forms`                     | `^22.2.3`               | **22.2.3**        | 22.2.3   |
| `@angular/common`                    | `^22.2.3`               | **22.2.3**        | 22.2.3   |
| `@angular/cdk` / `@angular/material` | `^22.2.3`               | **22.2.3**        | 22.2.3   |
| `typescript`                         | `~6.0.0`                | **6.0.3**         | —        |
| `zone.js`                            | —                       | **not installed** | —        |

The application is genuinely **zoneless**. This matters for submission: nothing schedules change detection around the `await` in the action, so anything reading the DOM after a submission must not assume a render has happened (see S-08).

---

## 3. Official Documentation Reviewed

| Page                                                     | Used for                                                                                                                         |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `angular.dev/guide/forms/signals/form-submission`        | `submit()` return contract, `FormSubmitOptions`, `FormRoot`'s stated role, `submitting()`, submission-error routing, concurrency |
| `angular.dev/guide/forms/signals/field-state-management` | `FieldState` signals, how `touched`/`dirty` are set, `markAsTouched({skipDescendants})`, `reset()`                               |
| `angular.dev/guide/forms/signals/form-logic`             | `readonly`/`disabled`/`hidden` and the `{when}` config form                                                                      |
| `angular.dev/guide/forms/signals/validation`             | validator signatures, the `message` option, `touched() && invalid()` display pattern                                             |
| `angular.dev/guide/forms/signals/custom-controls`        | `FormValueControl`/`FormCheckboxControl`, how `[formField]` binds a control                                                      |

**Three places where the documentation is silent or inconsistent, resolved from the installed source** (the brief's evidence hierarchy puts installed implementation first):

1. **Does `submitting()` reset if the action throws?** The submission page says only that the promise rejects. **Source is decisive:** `selfSubmitting.set(false)` is in a `finally`, so it resets on every path including a throw (`_validation_errors-chunk.mjs:1865-1867`).
2. **Do submission errors appear in `errors()`?** The submission page says yes; the field-state page does not mention it. **Source:** `syncErrors` concatenates `normalizeErrors(submitState.submissionErrors())` (`:686`).
3. **Does `readonly` skip validation?** The validation page lists only hidden and disabled; the form-logic page includes readonly. **Source:** `shouldSkipValidation = hidden() || disabled() || readonly() || isOrphaned()` (`:778`).

---

## 4. Signal Forms API Compatibility

Every API the component imports is marked `@publicApi 22.0` in the installed declarations — `form`, `submit`, `required`, `email`, `maxLength`, `readonly`, `FormField`, `FormRoot`, `provideSignalFormsConfig`, `ValidationError`, `FieldState`. **None is experimental, developer-preview, or deprecated** in 22.2.3.

One deprecated overload exists in this area and the project does **not** use it: `readonly(path, fn)` is `@deprecated` in favour of `readonly(path, {when})` (`signals.d.ts:92` vs `:95-100`). The project uses the supported form, and `@typescript-eslint/no-deprecated` is enabled project-wide to keep it that way.

---

## 5. `form()`, `FormRoot`, `FormField`

### 5.1 `form()`

```ts
private readonly model = signal<ContactInquiry>({ ...DEFAULTS });   // contact-form.ts:123
protected readonly form = form(this.model, (inquiry) => { /* schema */ });
```

- The **model is a writable signal** and is the single source of truth. `{ ...DEFAULTS }` copies, so `DEFAULTS` stays reusable by `reset()`.
- `form(model, schemaFn)` returns a **`FieldTree`**, a proxy. `form.email` is the child _tree_; calling it — `form.email()` — yields that field's **`FieldState`**. The distinction is load-bearing: `setSubmissionErrors` does `errorWithField.fieldTree()`, so an error's `fieldTree` must be the tree (`this.form.email`), never the state.
- The **schema callback runs once**, eagerly, during `form()`. It registers logic; it does not evaluate it. Validator `message` functions and `readonly({when})` predicates are stored as `LogicFn`s and called later, when field state is first read. This is what makes `const whileSending = () => this.form().submitting()` safe inside the callback that produces `this.form`.
- Field state is **derived reactively**: `syncErrors`, `syncValid`, `status`, `valid`/`invalid`, and `shouldSkipValidation` are all `computed`.

### 5.2 `FormRoot` — verified from source, and why it is not used

```js
// node_modules/@angular/forms/fesm2022/signals.mjs:1504-1552
class FormRoot {
  fieldTree = input.required({ alias: 'formRoot' });
  onSubmit(event) {
    event.preventDefault();
    untracked(() => {
      const fieldTree = this.fieldTree();
      const node = fieldTree();
      if (node.structure.fieldManager.submitOptions) {
        submit(fieldTree);
      }
    });
  }
  // selector: 'form[formRoot]'
  // host: { attributes: { novalidate: '' }, listeners: { submit: 'onSubmit($event)' } }
}
```

So it does exactly three things: sets `novalidate` as a **static attribute**, listens for the native `submit`, and calls `preventDefault()` **unconditionally** — then calls `submit(fieldTree)` **only if the form was created with a `submission` option**, with no options of its own (so `submit()` falls back to `fieldManager.submitOptions`).

The project supplies all three by hand: `novalidate` in the template, `(submit)="submit($event)"`, and `event?.preventDefault()` as the first statement of its handler. Functionally equivalent.

**Adopting `FormRoot` would be a regression, for two reasons visible above.**

1. **`onSubmit` discards the promise.** `submit(fieldTree)` returns `Promise<boolean>` and nothing awaits or catches it. The component currently does `await submitForm(...)` and _then_ focuses the first field the API rejected — that step becomes impossible. And because the promise is dropped, **a throwing action becomes an unhandled rejection** rather than something the component can handle.
2. **It requires relocating the action** into `form()`'s `submission` option, moving `notify()`, `reset()` and the focus move away from the method that owns them — for no behavioural gain.

**Verdict: `S-01 FALSE POSITIVE`.** This supersedes finding CF-03 of `CONTACT_FORM_TECHNICAL_AUDIT.md`, which rated the hand-written handler a "legitimate trade". It is better than the directive for this form, and the reason is now evidenced rather than asserted.

### 5.3 `FormField`

```html
<input matInput id="contact-email" type="email" autocomplete="email" [formField]="form.email" />
```

Verified from `signals.mjs:1250-1425`:

- **Selector `[formField]`**; the bound value is the field _tree_, and `state = computed(() => this.field()())`.
- **UI → model:** it injects `NG_VALUE_ACCESSOR` with `{optional: true, self: true}` and picks one via `_selectValueAccessor`, falling back to an `InteropNgControl` for native elements. This is why Angular Material controls work unmodified — `MatChipListbox` provides `NG_VALUE_ACCESSOR` (`material/chips.mjs:1638`) — and why `ChipSelect` needs no `FormValueControl` implementation: it forwards a `Field<string>` and owns no value.
- **Model → UI, and state → native attributes:** `FIELD_STATE_KEY_TO_CONTROL_BINDING` maps `disabled`, `readonly`, `required`, `name`, `min`, `max`, `minLength`, `maxLength`, `pattern` and more; `elementAcceptsNativeProperty()` returns `true` for `disabled`/`required`/`readonly`/`name` on any native form element, and for `minLength`/`maxLength` on textual ones.

  **Consequence, measured as well as read:** a `maxLength()` _schema rule_ becomes a native `maxlength` _attribute_. `#contact-name` carries `maxlength="120"`, and filling 121 characters yields 120. The client-side `maxLength` error is therefore **unreachable through the UI** — the browser refuses the 121st character. Those four rules are defence-in-depth for values arriving by another path, not visitor-facing messages. Pinned by `e2e/contact.spec.ts` asserting all four caps reach the DOM.

  Likewise `readonly({when})` produces `input.readOnly === true`, which is what the in-flight e2e test observes.

- **CSS state classes are applied in an `afterRenderEffect`** (`installClassBindingEffect`). The project's `provideSignalFormsConfig({classes: STATUS_CLASSES})` emits `ng-invalid`/`ng-valid`/`ng-touched`/`ng-untouched`/`ng-dirty` through it. **This is the source-level justification for S-08**: anything running synchronously inside `submit()` cannot rely on those classes being present.
- **Conditional removal:** a field detached from the tree reports `structure.isOrphaned()`, which both `shouldSkipValidation` and the class-binding effect check. No field in this form is conditionally rendered, so this path is unused here.

**All `[formField]` bindings checked** — `name`, `email`, `company`, `service`, `description`, `timeline`, `budget`, `website` directly, and `interest`/`method` forwarded through `ChipSelect` to `MatChipListbox`. All ten model fields are bound exactly once. `CONFIRMED` correct.

---

## 6. Submission Lifecycle

The runtime, verbatim (`_validation_errors-chunk.mjs:1835-1867`):

```js
async function submit(form, options) {
  const node = untracked(form);
  if (untracked(node.submitState.submitting)) return false; // (A) concurrency guard
  const field = options === undefined ? node.structure.root.fieldProxy : form;
  const detail = { root: node.structure.root.fieldProxy, submitted: form };
  options =
    typeof options === 'function'
      ? { action: options }
      : (options ?? node.structure.fieldManager.submitOptions); // (B) FormRoot's path
  const action = options?.action;
  if (!action) throw new _RuntimeError(1915, '…Cannot submit form with no submit action…');
  node.markAsTouched(); // (C) before submitting=true
  const onInvalid = options?.onInvalid;
  const shouldRun = shouldRunAction(node, options?.ignoreValidators);
  try {
    if (shouldRun) {
      node.submitState.selfSubmitting.set(true); // (D) true
      const errors = await untracked(() => action?.(field, detail));
      errors && setSubmissionErrors(node, errors); // (E) still true here
      return !errors || (isArray(errors) && errors.length === 0);
    } else {
      untracked(() => onInvalid?.(field, detail)); // (F) never becomes true
    }
    return false;
  } finally {
    node.submitState.selfSubmitting.set(false); // (G) every path, incl. throw
  }
}
```

Mapped to the brief's fourteen steps:

| #   | Step                         | Responsible                                                    | Notes                                                                                                                                                              |
| --- | ---------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | User enters data             | `FormField` + CVA                                              | §5.3                                                                                                                                                               |
| 2   | Model updates                | Signal Forms writes through to `model`                         | single source of truth                                                                                                                                             |
| 3   | User submits                 | native `submit` event                                          | `(submit)="submit($event)"`                                                                                                                                        |
| 4   | Submit event processed       | **application** `ContactForm.submit()`                         | `event?.preventDefault()`, then `submitForm(this.form, {...})`. `FormRoot` would do this (§5.2) but is not used                                                    |
| 5   | Validation runs              | `(C)` `markAsTouched()` then `(shouldRunAction)` → `!invalid`  | hidden/disabled/**readonly** fields are skipped when marking touched — harmless here, because at `(C)` `submitting()` is still `false`, so nothing is readonly yet |
| 6   | Invalid-form behaviour       | `(F)` `onInvalid` → `focusFirstInvalid()`                      | app code                                                                                                                                                           |
| 7   | Action invoked               | `(D)`/`action`                                                 | `this.submitter.submit(this.model())`                                                                                                                              |
| 8   | `submitting()` → `true`      | `(D)` framework                                                | only if the action will actually run                                                                                                                               |
| 9   | Async request                | `HttpContactSubmitter.send` → `firstValueFrom(http.post(...))` | `FetchBackend`                                                                                                                                                     |
| 10  | Success/failure processed    | app: `status`, `rejectedFields`                                | §8                                                                                                                                                                 |
| 11  | Submission errors registered | `(E)` `setSubmissionErrors`                                    | from the action's return value                                                                                                                                     |
| 12  | Action completes             | `(E)` returns                                                  | —                                                                                                                                                                  |
| 13  | `submitting()` → `false`     | `(G)` `finally`                                                | on success, failure **and throw**                                                                                                                                  |
| 14  | UI reflects final state      | `aria-busy`, `[disabled]`, `mat-error`, snackbar, focus        | —                                                                                                                                                                  |

### 6.1 The submission action

Signature for 22.2.3 (`_structure-chunk.d.ts:968-981`):

```ts
action: (
  field: FieldTree<TRootModel & TSubmittedModel>,
  detail: { root: FieldTree<TRootModel>; submitted: FieldTree<TSubmittedModel> },
) => Promise<TreeValidationResult>;
```

- It receives **field trees, not the form value.** The project therefore reads the value itself, once, from `this.model()` — captured before the `await`, so a late edit cannot change what was sent.
- `TreeValidationResult = ValidationSuccess | OneOrMany<ValidationError.WithOptionalFieldTree>`, and `ValidationSuccess` is `undefined`. Returning nothing means success.
- **Rejection:** nothing in `submit()` catches the action, so a throw propagates out of `submit()`'s promise. The project's action wraps its whole body in `try/catch`, so it **cannot** throw — which is what keeps the template's `(submit)` handler from producing an unhandled rejection. `CONFIRMED` correct.
- **Server validation errors** are returned as plain objects — there is no `customError` factory in this version; `ValidationError` is an interface (`{kind, message?}`) plus an optional `fieldTree`. The project builds them in `toFieldErrors()`.

### 6.2 `submitting()`

```js
submitting = computed(() => selfSubmitting() || (parent?.submitting() ?? false));
```

| Question                         | Answer                                                                          | Evidence                     |
| -------------------------------- | ------------------------------------------------------------------------------- | ---------------------------- |
| When `true`?                     | At `(D)` — **only if the action will run**. An invalid submission never sets it | source                       |
| Stays `true` across the `await`? | Yes                                                                             | `(D)`…`(G)` span the `await` |
| When `false`?                    | `(G)`, a `finally`                                                              | source                       |
| If the action **throws**?        | Still resets — docs are silent, source is not                                   | `finally`                    |
| If the action rejects?           | Same path                                                                       | `finally`                    |
| If the request fails?            | The project's action catches it and resolves, so this is an ordinary completion | app code                     |
| Repeated/concurrent submits?     | **The framework guards them** at `(A)`, before `markAsTouched`                  | source                       |
| Must the app also guard?         | **No**                                                                          | S-06                         |

**Project usage — `CONFIRMED` correct, with no duplicated state.** `submitting` is read straight through (`computed(() => this.form().submitting())`) and drives three things: `[disabled]` on the submit button, `[attr.aria-busy]` on the form, and `readonly({when})` on the four free-text fields. A second component-held flag was removed in earlier work precisely because the framework already owns this state; §6 of the brief's "no unnecessary manual state" requirement is met.

---

## 7. Architecture and Data Flow

```
User input
  └─ [formField]="form.x"            FormField + NG_VALUE_ACCESSOR        (Material via CVA)
       └─ FieldTree → model signal   single source of truth
            └─ schema               required / email / maxLength / readonly({when})
                 └─ errors()        → mat-error via  {{ fieldError(form.x()) }}
(submit)="submit($event)"
  └─ preventDefault → submitForm(form, { action, onInvalid })
       ├─ onInvalid  → focusFirstInvalid()            (by field name — S-08)
       └─ action     → ContactSubmitter.submit(model())        ← abstract, DI
                        └─ HttpContactSubmitter  (bound in app.config.ts:25)
                             ├─ API_ORIGIN guard → 'not-configured', no request
                             ├─ keyed coalescing latch                    (S-02)
                             └─ POST {origin}/api/contact  via FetchBackend
                                  ├─ 2xx {success:true}      → 'sent'
                                  └─ error → rejectedFieldsOf(body.message) (S-03)
                        ← { status, rejectedFields? }
       ├─ 'sent'  → reset({...DEFAULTS}) + focus heading + success snackbar
       ├─ failure → failure snackbar, input preserved
       └─ rejectedFields → toFieldErrors() → returned → setSubmissionErrors → mat-error
                            then focusField(rejected[0])
```

**Responsibility split — `CONFIRMED` sound.** The component orchestrates the form and owns presentation; the service owns transport and the error contract; the abstract `ContactSubmitter` is the seam. The component never touches `HttpClient`. The default `ContactSubmitter` is a **Null Object** returning `not-configured`, so a missing provider cannot be mistaken for success.

**Type safety.** `ContactInquiry` is the form model _and_ the wire DTO, deliberately: it is ten flat `readonly string`s, and `contact-contract.spec.ts` asserts the posted body carries exactly those ten keys because the API runs `forbidNonWhitelisted: true`. A separate form model plus a mapper would be an identity layer and would break that test's meaning. No `any` anywhere; no `@ts-ignore` in the repository.

**Validation duplication is justified and enforced.** `NAME_MAX`/`EMAIL_MAX`/`COMPANY_MAX`/`DESCRIPTION_MAX` are exported and asserted equal to the API's limits by `contact-contract.spec.ts`, so client and server cannot drift silently.

### 7.1 Backend contract — read, not guessed

`Nexora-back` is present on this machine, so the error contract is **verified rather than `CANNOT DETERMINE`**:

| Source                                          | Fact                                                                                                                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/common/filters/all-exceptions.filter.ts`   | every failure body is `{ success: false, statusCode, message: string \| string[], error, requestId }`                                                                                |
| `src/configure-app.ts`                          | `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, validationError: { target: false, value: false } })` — so `message` is a `string[]` exactly when the pipe produced it |
| `src/modules/contact/dto/create-contact.dto.ts` | **no custom `message` on any rule** → class-validator defaults apply, and each begins with the property name                                                                         |
| `src/modules/contact/contact.service.ts`        | success is `{ success: true, message }` at HTTP 200; a filled honeypot also returns success and discards the submission                                                              |
| `src/modules/contact/contact.controller.ts`     | `@HttpCode(HttpStatus.OK)`                                                                                                                                                           |

`rejectedFieldsOf()` takes the leading word of each message and keeps it only if it names a field this form can show an error against. `forbidNonWhitelisted` phrases its complaint as `"property <x> should not exist"`, whose leading word is `property` — not a field, so it falls out rather than being mapped to something arbitrary.

**Deliberately narrow, both documented in `CONTACT_API.md`:** the message shown is this app's localized `errorServer` copy (the API's wording is English in every locale, so it goes to the log with the `requestId`); and only the five fields with an error slot are routed, because the chip groups and optional selects have nowhere to show one and the honeypot is `aria-hidden` and out of the tab order — focusing it would trap the visitor.

---

## 8. Findings

| ID       | Status                               | Severity | Finding                                                                                                                                                                                                                                              |
| -------- | ------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S-01** | `FALSE POSITIVE`                     | —        | "`FormRoot` should be adopted." Its `onSubmit` discards `submit()`'s promise, so the form could not await the submission to focus the first server-rejected field, and a throwing action would become an unhandled rejection. Supersedes CF-03. §5.2 |
| **S-02** | `CONFIRMED` → **fixed**              | P3       | The coalescing latch was unkeyed: a second `submit()` with different data got the first call's result and **was never sent**. Negative-tested. §9.1                                                                                                  |
| **S-03** | `CONFIRMED` → **fixed**              | P3       | A non-JSON error body was untested. `FetchBackend.parseBody` returns raw **text** for an unparseable non-2xx body, so an HTML 502 arrives as a string. Code survived it; nothing proved so. §9.2                                                     |
| **S-04** | `RISK` → **documented, not changed** | P3       | `submit()` resolves `true` for a generic failure, because the action returns no error. The obvious fix would **block retrying without editing a field**. §9.3                                                                                        |
| **S-05** | `FALSE POSITIVE`                     | —        | "Readonly-during-send hides submission errors." Real but **transient**: errors are stored at `(E)` while the field is still readonly, and `syncErrors` is a `computed`, so they surface at `(G)`. Supersedes CF-06. Pinned by test.                  |
| **S-06** | `NO EVIDENCE`                        | —        | "The application must prevent duplicate submissions." The framework guards at `(A)`, before `markAsTouched`; the button is also `[disabled]="submitting()"`.                                                                                         |
| **S-07** | `CONFIRMED` (already fixed)          | —        | Class state is applied in an `afterRenderEffect`, so `onInvalid` — synchronous inside `submit()` — cannot query `.ng-invalid`. Focus is chosen by field name. Source now confirms what was previously inferred. Retires CF-09.                       |
| **S-08** | `CONFIRMED` correct                  | —        | All ten `[formField]` bindings present and bound once; action captures the value once, before the `await`; action cannot throw; `submitting()` not duplicated.                                                                                       |

### Verified **not** problems

Missing `withFetch()` (v22 defaults to `FetchBackend`, `_module-chunk.mjs:2036-2043`) · missing `changeDetection: OnPush` (v22 compiles omission _to_ OnPush) · `ChipSelect` not implementing `FormValueControl` (it forwards a `Field`, owns no value) · domain model used as form model (it _is_ the DTO; a mapper would be an identity layer) · unvalidated honeypot (client validation would reveal detection) · `ignoreValidators` unset (default `'pending'` is correct; no async validators exist).

---

## 9. Changes Implemented

### 9.1 S-02 — key the coalescing latch on the payload

**Problem.** `http-contact-submitter.ts:71-83` held `pending: Promise<ContactSubmitResult> | null` and did `this.pending ??= this.send(inquiry)…`. Any second caller received the first promise **whatever it passed**, so its own `inquiry` was discarded and never reached the API.

**Root cause.** The latch identified "a send is in flight" but not _which_ send, while the method's signature promises to submit the inquiry it was given.

**Fix** — smallest change that keeps the documented duplicate-row guard: the latch now stores `{ key, result }` where `key` is the serialized payload. Identical payloads coalesce, as before; different payloads get their own request, because they are not duplicates. The `finally` clears the latch only if it is still that send's, so a later inquiry cannot be cleared by an earlier one settling.

**Why correct for 22.2.3.** Independent of Angular; it restores the service's own contract without weakening the guarantee `CONTACT_API.md` records.

**Regression test + negative test.** `does not hand a different inquiry the result of the send already in flight` asserts **two** requests with the two different emails. Against the pre-fix code it fails with `expected [ TestRequest{ …(3) } ] to have a length of 2 but got 1` — executed, not assumed.

### 9.2 S-03 — cover a non-JSON error body

**Problem.** Every error-path test flushed a JSON object through `HttpTestingController`, which bypasses `FetchBackend` entirely. The production shape when the API is _not reached_ — a proxy's HTML error page — was untested.

**Root cause.** `parseBody` (`_module-chunk.mjs:945-963`) JSON-parses the body for `responseType: 'json'`, but on failure **returns the raw text if the status is outside 2xx** instead of throwing. `error.error` is then a `string`, where `ContactApiErrorBody` was expected.

**Fix.** None needed — `(error.error ?? {}) as ContactApiErrorBody` yields `undefined` for `.message` on a string, `rejectedFieldsOf` returns `[]`, and the result degrades to a plain failure. The defect was the **absent test**, so the test is the change: `survives an error body that is not JSON at all` flushes an HTML 502 and asserts `{status:'failed'}` plus exactly one logged error.

### 9.3 S-04 — why `submit()`'s `true` on a generic failure was left alone

For a 503 or a transport failure the action returns `undefined`, so `submit()` resolves **`true`** even though nothing was sent. The project ignores the return value, so nothing is broken today.

The obvious fix — return an error for generic failures — would **make things worse**, and the chain is checkable:

1. An error with no `fieldTree` is attached to the submitted field, i.e. the **root** (`addDefaultField`, `:1887`).
2. Root `syncErrors` includes `normalizeErrors(submitState.submissionErrors())` (`:686`), so the **root becomes invalid**.
3. The next submission computes `shouldRunAction` as `!untracked(node.invalid)` (`:1870-1879`) → **`false`**, so the action never runs.
4. `submissionErrors` is a `linkedSignal` sourced on `structure.value` (`:1329-1334`), so it clears only when the value **changes**.

Net effect: after a transient outage a visitor clicking Submit again _without editing anything_ would be silently refused. Preserving a usable retry is worth the inaccurate boolean. Recorded rather than "fixed".

### Files changed by this audit

| File                                                                | Change                                              |
| ------------------------------------------------------------------- | --------------------------------------------------- |
| `src/app/pages/contact/contact-form/http-contact-submitter.ts`      | S-02: payload-keyed coalescing latch                |
| `src/app/pages/contact/contact-form/http-contact-submitter.spec.ts` | S-02 regression test; S-03 non-JSON error-body test |
| `CONTACT_FORM_SUBMISSION_AUDIT.md`                                  | this report (new)                                   |

No component, template, SCSS, content, config, dependency or backend file was modified. No test was weakened or removed; no assertion was relaxed.

> **Note added after this audit.** Separate P3 work followed it (`CONTACT_FORM_TECHNICAL_AUDIT.md`,
> P3 status block) and did touch the component, template and contract spec: a `showError(state)`
> predicate replacing duplicated template expressions, `const`-array unions for the five closed
> option sets on `ContactInquiry`, and `wcag22aa` in the axe tag set. None of it changes the
> submission mechanics audited here. The counts in §10 are this audit's; the current totals are
> **306** unit tests and **51** script tests.

---

## 10. Tests and Checks Executed

All executed in this session. Counts are from the runners' own output.

| Check                                     | Command                                               | Result                                                  |
| ----------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| Formatting                                | `npm run format:check`                                | **pass** — "All matched files use Prettier code style!" |
| Types                                     | `npm run typecheck` (4 projects)                      | **pass** — exit 0, no diagnostics                       |
| ESLint (incl. type-aware `no-deprecated`) | `npm run lint`                                        | **pass** — "All files pass linting."                    |
| Dependency rules                          | `npm run lint:deps`                                   | **pass** — 0 violations, 183 modules / 518 dependencies |
| Stylelint                                 | `npm run lint:styles`                                 | **pass**                                                |
| Contact unit tests                        | `npm test -- --include "src/app/pages/contact/**"`    | **57 passed / 57**                                      |
| Full unit suite                           | `npm test -- --no-watch`                              | **304 passed / 304**, 43 files                          |
| Negative test (S-02)                      | old latch restored, contact submitter spec            | **1 failed / 18** — the intended failure, then reverted |
| Script tests                              | `npm run test:scripts`                                | **51 passed / 51**                                      |
| Contact e2e                               | `playwright test e2e/contact.spec.ts`                 | see §10.2                                               |
| Full e2e                                  | `playwright test`                                     | see §10.2                                               |
| Production build                          | `npm run build`                                       | see §10.2                                               |
| Prerender / headers / bundle gates        | `verify:prerender`, `verify:headers`, `verify:bundle` | see §10.2                                               |

### 10.1 Brief §8 scenario coverage

| #   | Scenario                           | Covered         | Where                                                                                                                                                              |
| --- | ---------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Valid submission                   | ✅              | `contact-form.spec.ts` "submits a valid form once…"; e2e "a successful send returns focus and clears itself"                                                       |
| 2   | Invalid submission                 | ✅              | `contact-form.spec.ts` "does not submit an invalid form…"; e2e "an invalid submission focuses the first field at fault"                                            |
| 3   | Required-field validation          | ✅              | `contact-form.spec.ts` "requires name, email, company, service and description"                                                                                    |
| 4   | Successful async request           | ✅              | `http-contact-submitter.spec.ts` "posts the inquiry to /api/contact…"                                                                                              |
| 5   | Failed API request                 | ✅              | "reports a failure when the API says the send did not succeed"; "never reports success when the provider is unavailable"                                           |
| 6   | Server-side validation errors      | ✅              | "reports which fields the API rejected, in form order"                                                                                                             |
| 7   | Correct mapping to fields          | ✅              | e2e "a server-rejected field is named, focused, and clears when corrected" — **through the real `FetchBackend`**, which is what de-risks §9.2's parsing assumption |
| 8   | Unknown server error               | ✅ **new**      | "survives an error body that is not JSON at all"; "ignores a whitelist complaint…"                                                                                 |
| 9   | `submitting()` true during request | ✅              | e2e "a submission in flight is announced and shown"; "refuses input while a submission is in flight…"                                                              |
| 10  | `submitting()` false after success | ✅              | e2e success test (`aria-busy='false'`)                                                                                                                             |
| 11  | `submitting()` false after failure | ✅              | `contact-form.spec.ts` "keeps the form usable when the transport throws" asserts `submitting() === false`                                                          |
| 12  | Repeated submissions               | ✅ **extended** | "coalesces a second submission into the send already in flight"; **new** "does not hand a different inquiry…"; e2e repeated-click test                             |
| 13  | UI state during submission         | ✅              | e2e `aria-busy`, `[disabled]`, readonly flags                                                                                                                      |
| 14  | Error visibility after completion  | ✅              | `contact-form.spec.ts` "still shows the error on a field that was locked during the send" (S-05)                                                                   |
| 15  | Readonly fields and validation     | ✅              | same test + e2e readonly/`tabIndex` assertions                                                                                                                     |
| 16  | Keyboard and accessibility         | ✅              | e2e `tabIndex === 0` while locked, focus-on-invalid, label-click focus, axe WCAG 2.1 AA sweeps                                                                     |

---

## 11. Remaining Risks and Limitations

| Area                         | Status             | Note                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production submission path   | `NOT VERIFIED`     | `environment.production.ts` ships `apiOrigin: ''`, so the form reports `not-configured` and issues **no request**. Field-error routing is verified against intercepted responses whose shape was read from the API's own filter. **No real inquiry was submitted.** Step 5 of _Switching the form on_ in `CONTACT_API.md` is the real confirmation. |
| Rate limiting (429)          | `CANNOT DETERMINE` | The API registers a `ThrottlerGuard`. A 429 body has a single `message`, so it degrades to a plain failure — correct, but untested end-to-end, and `Retry-After` is not surfaced to the visitor.                                                                                                                                                    |
| Non-Chromium browsers        | `NOT VERIFIED`     | Only Chromium binaries are installed (`playwright.config.ts:26-31`).                                                                                                                                                                                                                                                                                |
| `JSON.stringify` latch key   | Accepted           | Depends on stable key order. Every inquiry is built from the same `DEFAULTS` shape; a reordered object would merely fail to coalesce — the harmless direction.                                                                                                                                                                                      |
| `submit()` boolean           | `RISK`, accepted   | S-04. Any future caller reading it would be misled on a generic failure.                                                                                                                                                                                                                                                                            |
| Root-level submission errors | Unused             | No code path attaches one, and §9.3 is the reason not to. If one is ever added, note it blocks re-submission until a value changes.                                                                                                                                                                                                                 |
| Honeypot marked touched      | Harmless           | It is CSS-hidden, not Signal-Forms-`hidden`, so `markAsTouched` reaches it. It has no rules and no error slot.                                                                                                                                                                                                                                      |

---

## 12. Final Technical Assessment

**The submission implementation is correct, idiomatic for Angular 22.2.3, and production-ready.**

It uses the framework's submission model as designed and — more notably — declines to re-implement what the framework already provides: there is no second `submitting` flag, no hand-rolled duplicate-submit guard in the component, no mapper layer between form model and DTO, and no custom control interface where a `Field`-forwarding wrapper suffices. Where it _does_ diverge from the documentation's default shape, by hand-writing what `FormRoot` offers, the divergence turns out to be the better choice for a form that must await its submission and move focus afterwards — which is the opposite of what this audit set out expecting to find.

The two defects found were both in the transport layer and both of low severity, and one of them was an absent test rather than wrong code. The form logic itself yielded no confirmed defects.

What remains genuinely unproven is not the code but the deployment: the API is written and not deployed, so no inquiry has ever completed this path for real. Everything upstream of that boundary is verified against the installed framework source, the API's own implementation, and executed tests.

**Assessment: production-ready, pending deployment verification.**

---

## Appendix — Source references

`@angular/forms` 22.2.3: `fesm2022/signals.mjs:1250-1425` (`FormField`), `:1504-1552` (`FormRoot`), `:1271` (`NG_VALUE_ACCESSOR`), `:774-790` (state→control binding map), `:1406-1424` (`elementAcceptsNativeProperty`) · `fesm2022/_validation_errors-chunk.mjs:1835-1867` (`submit`), `:1870-1879` (`shouldRunAction`), `:1881-1899` (`setSubmissionErrors`), `:686` (`syncErrors`), `:778` (`shouldSkipValidation`), `:1326-1340` (`FieldSubmitState`, `submitting`), `:1673` (`readonly`) · `types/_structure-chunk.d.ts:968-1001` (`FormSubmitOptions`), `:1094` (`TreeValidationResult`), `:732-780` (`ValidationError`), `:1416-1419` (`getError`) · `types/signals.d.ts:92-100` (`readonly` overloads), `:109-124` (`BaseValidatorConfig`), `:822-827` (`FormRoot`).
`@angular/common` 22.2.3: `fesm2022/_module-chunk.mjs:945-963` (`parseBody`), `:895-918` (error path), `:2036-2043` (`FetchBackend` default).
`@angular/material` 22.2.3: `fesm2022/chips.mjs:1638`.
`Nexora-back`: `src/common/filters/all-exceptions.filter.ts`, `src/configure-app.ts`, `src/modules/contact/{contact.controller.ts,contact.service.ts,dto/create-contact.dto.ts}`.
