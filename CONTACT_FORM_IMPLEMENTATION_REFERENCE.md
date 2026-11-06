# `ContactForm` — Complete Implementation Reference

**Subject:** `src/app/pages/contact/contact-form/contact-form.ts` and every entity it depends on
**Project:** Nexora (`C:\Users\xXx\Desktop\nexora`), Angular **22.2.3**, TypeScript **~6.0**, rxjs **~7.8**
**Backend read for the contract:** `C:\Users\xXx\Desktop\Nexora-back` (NestJS)
**Role:** Staff / Principal Angular Developer & Software Architect
**Date:** 2026-11-06

---

## 0. Scope, method, and reading rules

### 0.1 What this document is

A function-by-function and step-by-step reference for the contact form. Every function reachable
from `ContactForm` is documented, including module-level helpers, closures created inside the form
schema, event handlers, computed properties, and the framework functions the implementation leans
on. Where behaviour depends on Angular or Material internals, the internal implementation was read
and is cited by file and line, because several of the form's design decisions are only correct in
light of what those internals actually do.

### 0.2 Method

- Every claim about project code cites `path:line` and was read from the working tree at commit
  `a637274` (`git status` clean).
- Every claim about framework behaviour cites the **installed** bundle under `node_modules`
  (`@angular/forms/fesm2022/signals.mjs`, `_validation_errors-chunk.mjs`,
  `@angular/material/fesm2022/chips.mjs`, and so on) — not documentation, and not a different
  version.
- Every claim about the server contract cites the NestJS source in `Nexora-back`.
- Where something genuinely cannot be established from source, it is marked
  **"Cannot be determined from the source code."** Section 10 collects all such items.

### 0.4 What writing this changed

Documenting the form turned up work, and the work was done rather than listed. Two kinds:

1. **One defect.** `isActivation` in `ChipSelect` tested `event.key` while Material tests
   `event.keyCode`, so an event carrying only `keyCode` reached Material and bypassed the guard —
   reproducing the original `TypeError` the guard exists to prevent. Fixed, and pinned by a test
   that fails without the fix (2.24).
2. **Four undocumented intents.** Behaviour that was clear from the code but whose _reasoning_
   lived nowhere, so this document had to mark it undeterminable. Each is now recorded where it
   applies — as a comment, and where a comment could go stale, as a test as well. Section 10.2
   lists them; section 10.1 holds the two items that remain genuinely open.

One further correction belongs here because it was mine, not the codebase's: the first draft said
`ContactForm` "does not declare OnPush". In Angular 22 an omitted `changeDetection` **is** OnPush,
and this repository already pins that for every component in `src/app/change-detection.spec.ts`.
Corrected in 2.6.

### 0.3 Two naming conventions you need to read the rest

**`FieldTree` versus `FieldState`.** `form` is a `FieldTree`. `form.name` is the _child_
`FieldTree` for the `name` key. Calling it — `form.name()` — yields the `FieldState`, which is the
object carrying `value()`, `touched()`, `invalid()`, `errors()`, and the rest. So
`form.name().value()` is three steps: tree → state → signal read. The template and the class both
use this consistently; `[formField]="form.name"` is given the _tree_ (the directive's input is
`Field<T>`), while `showError(form.name())` is given the _state_.

**intlayer nodes versus strings.** `useDictionary()` returns a signal of a dictionary whose leaves
are _nodes_, not strings. A node renders as its text in an interpolation (`{{ content().title }}`)
but must be unwrapped with `.value` anywhere a real `string` is required — a property binding
(`[placeholder]="content().namePlaceholder.value"`) or TypeScript. This is why the codebase appears
to mix the two forms; it is not an inconsistency, it is the only way to satisfy
`strictTemplates`. Evidence: `src/app/pages/contact/contact-form/contact-form.ts:70` types the
option leaves as `{ readonly value: string }` and compiles under `strict` + `strictTemplates`
against `this.content().interestOptions`.

---

## 1. Entity inventory and dependency graph

### 1.1 Files that make up the form

| Path                                                              | Kind            | Role                                                                                    |
| ----------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------- |
| `src/app/pages/contact/contact-form/contact-form.ts`              | Component       | The form. Model, schema, submission orchestration, focus, notification.                 |
| `src/app/pages/contact/contact-form/contact-form.html`            | Template        | 10 controls, labels, errors, counter, honeypot, submit.                                 |
| `src/app/pages/contact/contact-form/contact-form.scss`            | Styles          | Layout, counter colour states, honeypot clipping.                                       |
| `src/app/pages/contact/contact-form/contact-form.content.ts`      | i18n dictionary | All copy in `en` / `hy` / `ru`, plus the option lists.                                  |
| `src/app/pages/contact/contact-form/contact-rules.ts`             | Validators      | `notBlank`, `emailTld` and their bare predicates.                                       |
| `src/app/pages/contact/contact-form/contact-submitter.ts`         | Domain + port   | Value unions, `ContactInquiry`, `ContactSubmitter` abstract port (with a safe default). |
| `src/app/pages/contact/contact-form/http-contact-submitter.ts`    | Adapter         | The real HTTP transport, error classification, in-flight de-duplication.                |
| `src/app/pages/contact/contact-form/chip-select/chip-select.ts`   | Component       | Single-choice chip group bound to a `Field<string>`.                                    |
| `src/app/pages/contact/contact-form/chip-select/chip-select.html` | Template        | `mat-chip-listbox` + one `mat-chip-option` per option.                                  |
| `src/app/pages/contact/contact.providers.ts`                      | Providers       | `provideContactForm()` — binds the port to the adapter.                                 |

### 1.2 Shared entities the form uses

| Path                                                 | Kind              | Used for                                               |
| ---------------------------------------------------- | ----------------- | ------------------------------------------------------ |
| `src/app/shared/ui/field-label/field-label.ts`       | Component         | Label that can focus a non-native control.             |
| `src/app/shared/ui/snack-bar/snack-bar.ts` + `.html` | Component         | Result notification body.                              |
| `src/app/shared/motion/reveal.ts`                    | Directive         | `appReveal="load"` entrance animation on the `<form>`. |
| `src/app/core/icons/icons.ts`                        | Utilities         | `appIcon()` name→`app:name` for `[svgIcon]`.           |
| `src/app/core/routing/api-origin.ts`                 | Token + utilities | `API_ORIGIN`, `normalizeOrigin`, `isUsableOrigin`.     |
| `src/environments/environment*.ts`                   | Config            | `apiOrigin`.                                           |

### 1.3 Framework entities

- `@angular/forms/signals`: `form`, `submit`, `required`, `email`, `maxLength`, `readonly`,
  `validate`, `FormField`, `provideSignalFormsConfig`, and the types `FieldState`,
  `FormFieldBinding`, `ValidationError`, `Field`, `SchemaPath`, `PathKind`, `SchemaPathRules`.
- `@angular/material`: `MatFormField`, `MatInput`, `MatSelect`/`MatOption`, `MatHint`, `MatError`,
  `MatButton`, `MatIcon`, `MatSnackBar`, `MatChipListbox`/`MatChipOption`.
- `@angular/common/http`: `HttpClient`, `HttpErrorResponse` (FetchBackend — see 3.9).
- `@angular/core`: `signal`, `computed`, `inject`, `viewChild`, `ErrorHandler`, `DestroyRef`,
  `ElementRef`, `afterNextRender`, `makeEnvironmentProviders`.
- `rxjs`: `firstValueFrom` — **the only direct RxJS use in the whole chain** (3.10).

### 1.4 Dependency graph

```
app.config.ts
  └─ provideContactForm()                  contact.providers.ts:5
       └─ { ContactSubmitter -> HttpContactSubmitter }

Contact (page)                             pages/contact/contact.ts
  └─ ContactForm                           contact-form/contact-form.ts:113
       ├─ inject ContactSubmitter   ──────▶ HttpContactSubmitter
       │                                     ├─ inject HttpClient
       │                                     ├─ inject API_ORIGIN  ──▶ environment.apiOrigin
       │                                     └─ inject ErrorHandler
       ├─ inject ErrorHandler
       ├─ inject MatSnackBar        ──────▶ SnackBar (openFromComponent)
       ├─ useDictionary(contactFormContent)
       ├─ form(model, schema)       ──────▶ required/email/maxLength/readonly (Angular)
       │                                     notBlank/emailTld (contact-rules.ts)
       └─ template
            ├─ Reveal                        appReveal="load"
            ├─ FieldLabel            × 8
            ├─ ChipSelect            × 2  ──▶ MatChipListbox / MatChipOption
            ├─ MatFormField+MatInput × 3
            ├─ MatFormField+MatSelect× 3
            └─ FormField directive   × 10 (one per bound field)
```

`ChipSelect` has exactly two consumers, both in this template
(`contact-form.html:26` and `:201`). `src/app/pages/services/.../filter-bar.ts` and the home
`why.ts` import `MatChipListbox` **directly** and do not go through `ChipSelect` — relevant when
reasoning about the blast radius of anything done inside `ChipSelect`.

---

## 2. Function reference

Every function is given as: purpose · location · signature · execution flow · callees · state
written · side effects · error handling · architectural relationship.

---

### 2.1 `chipOptions`

**Purpose.** Convert an intlayer option list into the plain `{value, label}` shape `ChipSelect`
accepts. Solves a concrete translation-layer problem: the dictionary gives nodes, the child
component's input is typed with primitives, and both chip groups need the same conversion.

**Location.** `src/app/pages/contact/contact-form/contact-form.ts:64-71`

**Signature.**

```ts
function chipOptions(
  options: readonly {
    readonly value: { readonly value: string };
    readonly label: { readonly value: string };
  }[],
): readonly ChipOption[];
```

Accepts the dictionary's option array. Returns a new array of `ChipOption`
(`chip-select/chip-select.ts:5-8`).

**Execution flow.**

1. `options.map(...)` — one pass, no early exit.
2. For each option, read `option.value.value` (the stable machine value, e.g. `'new-project'`) and
   `option.label.value` (the translated text).
3. Return the new array.

**Callees.** `Array.prototype.map` only. No signals are read inside; it is a pure function of its
argument.

**State written.** None. Pure.

**Side effects.** Allocates one array and _n_ objects per call. Because it is only ever called from
inside a `computed` (2.9, 2.10), that allocation happens once per locale change, not once per
change-detection pass.

**Error handling.** None, and none is needed: the parameter type makes a missing `.value`
a compile error, and the dictionary is a static module, not external input.

**Relationship.** This function is the single reason `interestOptions` and `methodOptions` are not
duplicated code. It is the conversion seam between the i18n layer and the presentational layer.

---

### 2.2 The form schema function

**Purpose.** Declare every validation and state rule for the ten model fields, once, in one place,
with locale-reactive messages. This is the form's specification.

**Location.** `src/app/pages/contact/contact-form/contact-form.ts:127-165` — the second argument to
`form(this.model, ...)`.

**Signature.** `(inquiry: SchemaPath<ContactInquiry, ...>) => void`. The parameter is **not** the
model value; it is a path proxy. `inquiry.name` is a `FieldPathNode` proxy
(`_validation_errors-chunk.mjs:466`, `483-488`) that rule functions unwrap to attach logic to.
Returns `void`; all effect is via the rule calls.

**Execution flow.** This function runs **exactly once**, synchronously, while the `form` field
initializer executes — i.e. during `ContactForm` construction, inside the component's injection
context. It does not run again on value changes.

1. **Lines 128-131 — build three message closures.**
   - `isRequired = () => this.content().errorRequired.value`
   - `notAnEmail = () => this.content().errorEmail.value`
   - `tooLong = (max) => () => this.content().errorMaxLength.value.replace('{max}', String(max))`
     — a curried factory: `tooLong(120)` returns the thunk that will later produce
     `"…at most 120 characters"`.

   None of these are _called_ here. They are stored on the rule configs and invoked later through
   `getOption(config?.message, ctx)` (`signals.mjs:75-77`). That laziness is what makes error
   messages follow a locale change without rebuilding the form: each call re-reads
   `this.content()`, which is the intlayer `computed` over `intlayer.locale()`
   (`angular-intlayer/dist/esm/client/useDictionary.mjs`).

2. **Line 133 — `required(inquiry.interest, …)`.** Interest is always pre-filled (2.6), so this is
   a guard against programmatic clearing rather than something a visitor normally trips.

3. **Lines 135-137 — `name`:** `required` → `notBlank` → `maxLength(120)`.
4. **Lines 139-142 — `email`:** `required` → `email` → `emailTld` → `maxLength(254)`.
5. **Lines 144-146 — `company`:** `required` → `notBlank` → `maxLength(160)`.
6. **Line 148 — `service`:** `required` only. The model's `Service` union includes `''`
   (`contact-submitter.ts:11`) purely so the select can start unchosen; `required` is what forbids
   submitting `''`.
7. **Lines 150-152 — `description`:** `required` → `notBlank` → `maxLength(2000)`.
8. **Line 156 — `whileSending = () => this.form().submitting()`.**
9. **Lines 161-164 — `readonly(…, { when: whileSending })`** for `name`, `email`, `company`,
   `description`.

**Declaration order is observable behaviour**, not style. `FieldState.errors()` is
`[...parseErrors, ...syncErrors, ...asyncErrors]` (`_validation_errors-chunk.mjs:735`) and
`syncErrors` is `[...own rules in registration order, ...tree errors, ...submissionErrors]`
(`:686`). Since `fieldError()` (2.12) returns `errors()[0]?.message`, the order above decides which
message a visitor sees: for an empty `name`, "required" wins over "too long"; for
`"   "`, `required` does **not** fire (`isEmpty` is `value === '' || value === false || value == null`,
`signals.mjs:78-83` — it does not trim) so `notBlank` fires; and a server error is only ever shown
when the field has no client error, because `submissionErrors` are appended last.

**Callees.** `required` (`signals.mjs:458-475`), `email` (`:208-227`), `maxLength` (`:297-…`),
`readonly` (`:64-69`), `notBlank` and `emailTld` (2.4, 2.5).

**State written.** Builds the rule graph on the `FieldPathNode` builders; `required` and `maxLength`
additionally register _metadata_ keys (`REQUIRED`, `MAX_LENGTH` — `signals.mjs:459-462`, `298-306`)
which is how the native `required` and `maxlength` attributes later reach the DOM (3.6).

**Side effects.** Three closures and one curried factory retained for the component's lifetime.

**Error handling.** `assertPathIsCurrent(path)` inside each rule function throws if a path from a
different schema is passed — unreachable here.

**One real fragility, stated as a fact.** `whileSending` (line 156) reads `this.form`, the very
field whose initializer is running. It is safe _only because_ `readonly` stores the predicate and
never calls it during construction (`signals.mjs:64-69` → `addReadonlyRule(logic)`). If a future
rule evaluated its `when` eagerly, this line would throw `this.form is not a function`. The same
applies to the three message closures, which also capture `this`.

**The asymmetry is deliberate, and now says so.** `readonly` covers exactly the four free-text
fields; the three `mat-select`s, the two chip groups and the honeypot stay interactive during a
send. A text field is the only kind that can be mid-edit when the send starts, and the only kind
whose half-finished content the reset on success would throw away. The practical consequence for
the others is bounded: the payload is captured by `this.model()` at line 223 _before_ the `await`,
and model writes replace the object rather than mutating it (`valueForWrite`, 3.15), so a
mid-flight change cannot alter what was sent; on success the form is reset to `DEFAULTS` anyway;
only on a failure does the mid-flight edit survive, which is what makes the rejection correctable.

Both halves of that are asserted rather than argued — `contact-form.spec.ts`, "locks the text
fields during a send and keeps the payload it captured", records which fields are locked in flight
and that changing an unlocked one does not reach the transport.

---

### 2.3 `ContactSubmitter.submit` (the default port implementation)

**Purpose.** Make the unconfigured state _safe by default_. If nothing provides a real transport,
the form must not pretend it sent anything.

**Location.** `src/app/pages/contact/contact-form/contact-submitter.ts:81-84`

**Signature.** `async submit(inquiry: ContactInquiry): Promise<ContactSubmitResult>`

**Execution flow.** `void inquiry;` (explicitly discards the argument so the unused-parameter lint
rule is satisfied without an underscore rename that would break the subclass signature), then
returns `{ status: 'not-configured' }`.

**Callees / state / side effects.** None. It is a Null Object.

**Error handling.** Cannot throw.

**Relationship.** `@Injectable({ providedIn: 'root' })` on the abstract-by-intent class means
`inject(ContactSubmitter)` always resolves, even in a test or a bundle that never calls
`provideContactForm()`. `contact-form.spec.ts:433` pins exactly this: _"defaults to a submitter that
refuses to pretend it sent anything."_ This is the single design decision that makes the rest of the
submission path testable without HTTP mocking.

---

### 2.4 `isOnlyWhitespace` and `notBlank`

**Purpose.** Close a real client/server divergence. The API trims before validating
(`Nexora-back/src/modules/contact/dto/create-contact.dto.ts:51-52`, `@trim()` + `@MinLength(1)`),
so `"   "` is rejected server-side. Angular's `required` uses `isEmpty`, which does **not** trim
(`signals.mjs:78-83`), so `"   "` passed client validation and was sent, only to come back 400.

**Location.** `src/app/pages/contact/contact-form/contact-rules.ts:10-11` (predicate) and `:21-28`
(rule).

**Signatures.**

```ts
const isOnlyWhitespace: (value: string) => boolean;
function notBlank<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>,
  config: { readonly message: () => string },
): void;
```

**Execution flow — `isOnlyWhitespace`.** `value.length > 0 && value.trim().length === 0`. The first
clause is what divides responsibilities: an _empty_ string is `required`'s business, a _blank_ one
is this rule's. Both are configured with the same message (`isRequired`), so a visitor is told the
same thing either way — pinned by `contact-form.spec.ts:380`, _"tells a blank field and an empty one
apart but says the same thing."_

**Execution flow — `notBlank`.** Calls `validate(path, logic)`
(`signals.mjs:94-100`), which unwraps the path and pushes a sync error rule. The `logic` closure
runs on every validation pass for that field: reads `ctx.value()`, and returns either
`{ kind: 'blank', message: config.message() }` or `undefined` (`ValidationSuccess` is `undefined`).
`validate` wraps the result with `addDefaultField(..., ctx.fieldTree)`, which is what attaches the
error to the right field automatically.

**Callees.** `validate` → `FieldPathNode.unwrapFieldPath` → `builder.addSyncErrorRule`.
The returned closure calls `isOnlyWhitespace` and `config.message()`.

**State written.** The rule graph at schema time; a `ValidationError` object per failing pass at
run time.

**Side effects.** None beyond allocation.

**Error handling.** `assertPathIsCurrent` throws for a stale path. `config.message()` is called only
on the failing branch, so a message lookup never runs for a valid field.

**Relationship.** Exported as a _reusable rule_, generic over `TPathKind`, so it composes anywhere
in a schema rather than only at the root. The bare predicate is exported separately for exactly one
reason: `contact-contract.spec.ts:143` **executes both sides' predicates against the same corpus**
rather than reading them, which is the only way this class of divergence gets caught.
`PathKind`, `SchemaPath` and `SchemaPathRules` are type-only namespaces and must be imported with
`import type` (`contact-rules.ts:1-6`) under `isolatedModules`.

---

### 2.5 `isMissingEmailTld` and `emailTld`

**Purpose.** Close the second divergence. Angular's `EMAIL_REGEXP` (`signals.mjs:207`) makes the
dotted domain suffix **optional**, so `john@example` is valid to Angular. The API uses
`class-validator`'s `@IsEmail()` (`create-contact.dto.ts:70`), whose underlying
`validator.isEmail` defaults to `require_tld: true`, so `john@example` is a 400.

**Location.** `src/app/pages/contact/contact-form/contact-rules.ts:13-19` (predicate), `:30-39`
(rule).

**Signature.** Mirrors `notBlank` exactly.

**Execution flow — `isMissingEmailTld`.**

1. `const at = value.lastIndexOf('@')`.
2. If `at < 0` → return `false`. **Deliberate narrowing:** a string with no `@` is not this rule's
   problem; `email()` already reports it, and returning `true` here would produce two errors for one
   defect. Pinned by `contact-contract.spec.ts:175`, _"leaves the shape of an address to `email()`
   and only judges the domain."_
3. Otherwise test `/\.[a-z]{2,}$/i` against `value.slice(at + 1)` and negate.

`lastIndexOf` rather than `indexOf` matters for quoted local parts containing `@`.

**Execution flow — `emailTld`.** Identical to `notBlank` with `kind: 'emailTld'`.

**Callees / state / side effects / error handling.** As 2.4.

**Relationship.** Ordered **after** `email()` in the schema (`contact-form.ts:140-141`) and given the
**same** message thunk (`notAnEmail`). Consequence: a malformed address produces one message
regardless of which of the two rules caught it. Pinned by `contact-form.spec.ts:404`.

---

### 2.6 `ContactForm` construction and field initializers

Not a function, but the ordered sequence that everything else assumes. Field initializers run
top-to-bottom in the constructor, inside the component's injection context.

| Line    | Initializer                                       | Effect                                                                      |
| ------- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| 114     | `submitter = inject(ContactSubmitter)`            | `HttpContactSubmitter` in the app; the Null Object in a bare test.          |
| 115     | `errorHandler = inject(ErrorHandler)`             | Where swallowed exceptions actually go.                                     |
| 116     | `snackBar = inject(MatSnackBar)`                  | Overlay service.                                                            |
| 118     | `content = useDictionary(contactFormContent)`     | A `computed` depending on `intlayer.locale()`.                              |
| 119     | `arrowIcon = appIcon('arrow-right')`              | Eager and constant — `'app:arrow-right'`.                                   |
| 120     | `descriptionMax = DESCRIPTION_MAX`                | Template-visible constant.                                                  |
| 122-123 | `card`, `heading` = `viewChild.required(...)`     | Signals; **empty until first render**.                                      |
| 125     | `model = signal<ContactInquiry>({ ...DEFAULTS })` | A fresh copy, so the module constant can never be mutated by a later write. |
| 127-165 | `form = form(this.model, schemaFn)`               | Runs the schema once; builds the field tree.                                |
| 167-185 | the five `computed`s                              | Lazy; nothing evaluates until read.                                         |

`DEFAULTS` (`:73-84`) pre-selects `interest: 'new-project'` and `method: 'email'`, and gives every
other field `''`. This is why the form is never in a state where a chip group has nothing selected —
until the defect described in 4.5 was fixed.

The component declares no `changeDetection`, and in Angular 22 that **is** OnPush:
`ɵɵdefineComponent` stores
`onPush: componentDefinition.changeDetection !== ChangeDetectionStrategy.Eager`
(`@angular/core/fesm2022/_debug_node-chunk.mjs:10343`), so an omitted strategy resolves to OnPush
and only `Eager` — for which `Default` is a deprecated alias — opts out. The repository does not
leave that to a framework default it cannot control: `src/app/change-detection.spec.ts` pins the
enum's numeric semantics, asserts that **every** component in the application resolves to OnPush
(`ContactForm` at `:151`, `ChipSelect` at `:152`), and walks the source tree so that a new
`@Component` nobody registered fails the suite rather than going silently unchecked.

The application is also genuinely zoneless: `zone.js` is not a dependency (absent from both
`package.json` and `node_modules`), and neither `provideZoneChangeDetection` nor
`provideZonelessChangeDetection` appears anywhere in `src/`. Change detection is therefore driven
entirely by signal notification, which is what makes `showError` and `fieldError` safe as plain
methods: they are only re-evaluated when this view is checked, and this view is only checked when
one of the signals its template reads has changed.

---

### 2.7 `submitting`

**Purpose.** One named handle on "a send is in flight", used twice in the template.

**Location.** `contact-form.ts:167` · `computed(() => this.form().submitting())` · returns `boolean`.

**Execution flow.** Root tree → root state → `submitting()`, which is itself
`selfSubmitting() || parent?.submitting()` (`_validation_errors-chunk.mjs:1337-1339`). On the root
there is no parent, so it is exactly `selfSubmitting`, set `true`/`false` by `submit()` around the
action (`:1857`, `:1866`).

**Callees.** The framework's `submitting` computed. **State written.** None. **Side effects.** None.
**Error handling.** None needed.

**Relationship.** Drives `[attr.aria-busy]` on the `<form>` (`contact-form.html:6`) and
`[disabled]` on the submit button (`:229`). Note the button's `disabled` is bound to _submitting_,
not to _invalid_ — deliberately. A permanently disabled submit button is an accessibility
regression: it is unreachable by keyboard and announces nothing, so a visitor relying on a screen
reader gets no error summary. Here the button stays live, the submission is refused by
`submit()`'s own validity gate, and `onInvalid` moves focus to the offending field (2.15).

---

### 2.8 `descriptionLength` and `descriptionCount`

**Purpose.** Live character counter with a two-stage warning.

**Location.** `contact-form.ts:169` and `:171-177`.

**`descriptionLength`** · `computed(() => this.form.description().value().length)` · `number`.
Tree → state → `value()` → `.length`.

**`descriptionCount`** · `computed<'ok' | 'near' | 'full'>` ·

1. Read `descriptionLength()` (so this computed depends on that one, not on the model directly).
2. `>= 2000` → `'full'`.
3. `>= 1800` → `'near'`, else `'ok'`. `DESCRIPTION_WARN_AT = Math.floor(2000 * 0.9)` (`:59`).

**State written.** None. **Side effects.** None. **Error handling.** None needed — `value()` is typed
`string` and can never be `null`.

**Relationship.** `descriptionCount()` feeds `[attr.data-count]` on the end-aligned hint
(`contact-form.html:148`), which the stylesheet turns into colour: `near` →
`--mat-sys-on-surface`, `full` → `--mat-sys-error` (`contact-form.scss:123-133`). Styling by data
attribute rather than by class keeps the state machine in TypeScript and the presentation in SCSS.

**Reachability of `'full'`.** The `<textarea>` carries a native `maxlength="2000"` — written by
`nativeControlCreate` because `elementAcceptsNativeProperty('maxLength')` is true for textual
elements (`signals.mjs:1406-1424`, `:1121-1129`). The browser therefore caps typing and pasting at
2000, so `'full'` is reachable but `> 2000` is not through the UI. The corollary is that the
`maxLength` **message** is effectively unreachable in a browser; it exists for programmatic writes
and is pinned by a unit test (`contact-form.spec.ts:188`) rather than by an e2e test.

---

### 2.9 / 2.10 `interestOptions` and `methodOptions`

**Purpose.** Supply each chip group with its translated options.

**Location.** `contact-form.ts:179-181` and `:183-185`.

**Signature.** `computed<readonly ChipOption[]>`.

**Execution flow.** Read `this.content()` → take `interestOptions` / `methodOptions` → hand to
`chipOptions()` (2.1).

**Callees.** `chipOptions`, `useDictionary`'s computed.

**State written.** None. **Side effects.** Allocation, memoized per locale.

**Error handling.** None. The content module is static and typed.

**Relationship.** Because both are `computed`, a locale change re-maps the labels and
`@for (… track option.value)` in `chip-select.html:2` keeps the DOM nodes — the chip _labels_ change
without the chips being destroyed and re-created, so the current selection and focus survive.
Tracking by the stable machine value rather than by the translated label is what makes that true.

---

### 2.11 `showError`

**Purpose.** One rule for _when_ a validation message is allowed to appear.

**Location.** `contact-form.ts:194-196` · `protected showError(state: FieldState<string>): boolean`
· returns `state.touched() && state.invalid()`.

**Execution flow.** Two signal reads, `&&`-short-circuited: an untouched field never has
`invalid()` read.

**Callees.** `FieldState.touched`, `FieldState.invalid`.

**State written.** None — _reading_ `touched()` does not mark anything.

**Side effects.** None.

**Error handling.** None. It is a method rather than a per-field computed, so it is re-evaluated on
each check of this view rather than memoized; with 11 call sites × 2 signal reads that is the right
trade against 11 extra `computed` instances.

**Relationship — the important part, and it is sharper than it first looks.** This predicate is
_identical_ to Material's own `ErrorStateMatcher.isSignalErrorState(field)`, which is
`invalid && touched` (`@angular/material/fesm2022/_error-options-chunk.mjs:48-54`).

The obvious reading — "Material colours the outline, the component renders the message" — is
**wrong**, and the difference matters. `MatFormField` projects the error content only inside the
`@case ('error')` branch of its own template, selected by `_getSubscriptMessageType()` from
`_control.errorState` (`@angular/material/fesm2022/_form-field-chunk.mjs`). So Material decides
whether a `mat-error` is **shown**, and `showError` only decides whether there is one to show.

That makes the agreement load-bearing in both directions:

- were `showError` **stricter** than Material, the form field would reserve an error wrapper with
  nothing projected into it — visible empty space;
- were it **looser**, the `<mat-error>` would be instantiated and `fieldError()` evaluated for a
  message that is never projected — an invisible error.

The two agree by construction, which is not luck; and the source now says so, at `showError`
itself. The equivalence is also asserted end to end rather than left to the identical wording of
two files — `contact-form.spec.ts`, "decides a message is due exactly when Material decides to show
one", compares `showError`, the `.mat-form-field-invalid` class and the rendered message text
across untouched, touched-and-invalid, and corrected.

A note on how **not** to test this: probing only the presence of a `mat-error` element in the DOM
measures Material against itself, because the element is absent whenever `errorState` is false
regardless of `showError`. The first version of that test did exactly that and passed with
`showError` reduced to `state.invalid()`.

Call sites: `contact-form.html:21` (interest), `:38`/`:51` (name), `:58`/`:71` (email),
`:80`/`:93` (company), `:103`/`:120` (service), `:130`/`:143` (description). Each field uses it
twice — once to colour its `app-field-label`, once to gate its `mat-error`.

---

### 2.12 `fieldError`

**Purpose.** Pick the one message to show.

**Location.** `contact-form.ts:205-207` ·
`protected fieldError(state: FieldState<string>): string | undefined` ·
`state.errors()[0]?.message`.

**Execution flow.** Read the errors array, take the first, read `.message`.

**Which error is first** is fully determined and is the whole point of the function:
`errors()` = `[...parseErrors, ...syncErrors, ...asyncErrors]`
(`_validation_errors-chunk.mjs:735`), and `syncErrors` =
`[...own sync rules in registration order, ...syncTreeErrors, ...submissionErrors]` (`:686`).
Therefore:

1. A **parse** error (unparseable native input) wins — not reachable for these text fields.
2. Then **client** errors in schema declaration order.
3. Then the **server** error from `setSubmissionErrors`.
4. There are no async validators in this schema.

So a server rejection is shown only while the field has nothing locally wrong with it — which is
exactly right, because a local error is actionable and specific while the server error is generic.

**State written.** None. **Side effects.** None.

**Error handling.** `?.` guards the empty-array case even though the template only calls it behind
`showError(...)`. Note `noUncheckedIndexedAccess` is **not** enabled (`tsconfig.json`), so
`errors()[0]` is typed non-`undefined` and the `?.` is a deliberate runtime guard rather than
something the compiler demanded.

---

### 2.13 `submit` (the component method)

**Purpose.** The orchestrator: suppress the native submit, run the framework submission, and move
focus to whatever the visitor must fix.

**Location.** `contact-form.ts:209-244` ·
`protected async submit(event?: Event): Promise<void>`

The parameter is optional so tests can call `component.submit()` with no event; the template always
passes one (`contact-form.html:7`).

**Execution flow.**

1. **`event?.preventDefault()`** — stops the browser's native navigation. `novalidate` on the form
   (`:5`) additionally disables native constraint bubbles, so the only validation UI is the
   component's.
2. **`let rejected: readonly ContactField[] | undefined`** — declared in this scope so the `action`
   closure can publish the rejected-field list _out_ of the framework call. This is the mechanism by
   which step 4 knows what to focus.
3. **`await submitForm(this.form, { action, onInvalid })`.** The framework's sequence is fixed and
   was read at `_validation_errors-chunk.mjs:1835-1867`:

   | #   | Step                                                                    | Line            |
   | --- | ----------------------------------------------------------------------- | --------------- |
   | A   | Re-entrancy guard: if already submitting, return `false` immediately    | 1837-1839       |
   | B   | `node.markAsTouched()` — the whole tree, so every error becomes visible | 1852            |
   | C   | `shouldRunAction(node, undefined)` → `!untracked(node.invalid)`         | 1854, 1872-1880 |
   | D   | If valid: `selfSubmitting.set(true)`, then `await action(...)`          | 1857-1858       |
   | E   | If the action returned errors: `setSubmissionErrors(node, errors)`      | 1859            |
   | F   | If invalid: `onInvalid(...)` instead                                    | 1862            |
   | G   | `finally { selfSubmitting.set(false) }`                                 | 1865-1866       |

   Step B is why an untouched, empty form shows all its errors at once after the first click. Step C
   is why `action` never runs for an invalid form — the component does not need its own guard. Step G
   is why `submitting()` is reliable even if the action throws.

4. **`if (rejected?.length) this.focusField(rejected[0])`.** Runs after the framework call settles,
   which matters: `setSubmissionErrors` (step E) must have run before focus moves, otherwise focus
   would land on a field whose error is not yet rendered. `rejected[0]` is the first in
   `CONTACT_FIELDS` order because `rejectedFieldsOf` normalizes to that order (2.20).

**Callees.** `submitForm` (aliased from `submit` at import to avoid colliding with the method name,
`contact-form.ts:20`), the two inline closures (2.14, 2.15), `focusField`.

**State written.** Indirectly, via the framework: `touched` on every field, `submitting` on the
root, `submissionErrors` on named fields. Directly: the local `rejected`.

**Side effects.** Focus moves. A snack bar opens (from inside `action`). An HTTP request may be
issued.

**Error handling.** `submit` itself has no `try`. It does not need one: everything that can throw is
inside the action's own `try` (2.14), and `selfSubmitting` is restored in the framework's `finally`.
The returned `boolean` is discarded — see 10 for why that is a deliberate call and not an oversight.

---

### 2.14 The `action` closure

**Purpose.** Do the send, and translate its outcome into the three things the rest of the system
needs: a notification, a field-error list, and a reset-plus-focus on success.

**Location.** `contact-form.ts:220-237` ·
`async () => Promise<ValidationError.WithOptionalFieldTree[] | undefined>`

The return value is the framework's contract: `undefined` or an empty array means "submission
succeeded"; a non-empty array means "these fields were rejected" and is fed to
`setSubmissionErrors`.

**Execution flow.**

1. `let result: ContactSubmitResult` — declared, not assigned, so the `try` can be narrow.
2. **`try { result = await this.submitter.submit(this.model()); }`** — note `this.model()`, the raw
   signal, not `this.form().value()`. Both hold the same object; reading the model keeps the
   transport independent of the form library.
3. **`catch (error)`** — `errorHandler.handleError(error)`, `notify('failed')`, `return undefined`.
   Returning `undefined` rather than an error array is correct: nothing is known about _which_ field
   is at fault, so no field should be marked.
4. **`if (result.status === 'sent')`** → `this.form().reset({ ...DEFAULTS })` then
   `this.heading().nativeElement.focus()`.
5. **`this.notify(result.status)`** — for all three statuses.
6. **`rejected = result.rejectedFields`** — publishes to the enclosing scope.
7. **`return this.toFieldErrors(rejected)`**.

**Why the `try` wraps only line 223.** This is a correctness fix, not tidiness, and the code carries
a comment saying so. If the `try` also covered steps 4-7, then a throw from `reset`, from
`focus`, from `notify`, or from `toFieldErrors` — all of which run _after_ the message has already
been delivered — would be reported as a failed submission. The visitor would be told their message
did not arrive when it did, and invited to send it twice. A narrow `try` makes that impossible.

**Callees.** `ContactSubmitter.submit` (2.22/2.24), `ErrorHandler.handleError`, `notify` (2.21),
`FieldState.reset` (3.4), `HTMLElement.focus`, `toFieldErrors` (2.16).

**State written.** `rejected` in the enclosing scope. On success: every field's `value`, `touched`,
`dirty` (via `reset`) and the DOM focus.

**Side effects.** HTTP request; snack bar; focus move; `ErrorHandler` call.

**Error handling.** As above. Note what is _not_ caught: an exception from `reset`/`notify` would
propagate out of `action`, out of `await` inside `submitForm`, and out of `ContactForm.submit` as a
rejected promise — surfacing in `provideBrowserGlobalErrorListeners` (`app.config.ts:15`) rather
than being silently swallowed. That is the desired outcome for a programming error.

---

### 2.15 The `onInvalid` closure

**Location.** `contact-form.ts:238` · `() => this.focusFirstInvalid()` · returns `void`.

**Purpose.** The accessibility counterpart to leaving the submit button enabled. The framework calls
this only when `shouldRunAction` returned `false` (`_validation_errors-chunk.mjs:1862`) — i.e. the
form was invalid and nothing was sent. By then `markAsTouched()` (step B) has already run, so every
error is rendered and focus can safely be placed on the first one.

**Callees.** `focusFirstInvalid` (2.18). **State written.** DOM focus only. **Side effects.** Focus
move. **Error handling.** None needed; `focusFirstInvalid` is total.

---

### 2.16 `toFieldErrors`

**Purpose.** Convert the transport's field-name list into Signal Forms `ValidationError` objects
bound to the right fields, with the localized server message.

**Location.** `contact-form.ts:246-259` ·
`private toFieldErrors(rejected: readonly ContactField[] | undefined): ValidationError.WithOptionalFieldTree[] | undefined`

**Execution flow.**

1. `if (!rejected?.length) return undefined;` — one guard covering `undefined` and `[]`. Returning
   `undefined` rather than `[]` matters: `submit()` treats an empty array as success
   (`:1860`, `!errors || isArray(errors) && errors.length === 0`), and so would skip
   `setSubmissionErrors` either way, but `undefined` is the clearer signal.
2. `const message = this.content().errorServer.value;` — read **once**, outside the map.
3. `rejected.map(field => ({ kind: 'server', message, fieldTree: this.form[field] }))`.

**The critical detail is `this.form[field]` — the tree, not the state.** `setSubmissionErrors`
calls `errorWithField.fieldTree()` to find the node to attach to
(`_validation_errors-chunk.mjs:1888-1889`). Passing `this.form[field]()` would hand it a
`FieldState`, and calling that would fail. This is also why the field-error path cannot be
unit-tested by inspection alone — `contact-form.spec.ts:274` asserts the message actually lands on
the field.

**Callees.** `useDictionary`'s computed; the `FIELD_PROXY_HANDLER` get trap
(`_validation_errors-chunk.mjs:935-966`) for `this.form[field]`.

**State written.** Nothing directly; the returned objects cause `submissionErrors.set(...)` in the
framework.

**Side effects.** None.

**Error handling.** None. The `ContactField` union guarantees every key exists on the tree, and
`rejectedFieldsOf` narrows to that union before any value reaches here (2.20).

**How the error clears.** `submissionErrors` is a `linkedSignal` whose source is the field value
(`_validation_errors-chunk.mjs:1326-1333`), so editing the field drops its server error
automatically — no code in this component does that. Pinned both ways:
`contact-form.spec.ts:308` ("clears the rejection as soon as the visitor edits the field") and
`:316` ("does not clear it when a different field is edited").

---

### 2.17 `focusField`

**Location.** `contact-form.ts:261-263` · `private focusField(field: ContactField): void`

**Execution flow.** `this.card().nativeElement.querySelector<HTMLElement>('#contact-' + field)?.focus()`.

**Callees.** The `card` view-child signal, `querySelector`, `focus`.

**Design points.**

- The query is scoped to `card()` — the `<form>` element itself (`contact-form.html:2`) — not to
  `document`. Two instances of the form on one page would not steal each other's focus.
- The id convention `#contact-<field>` is a _contract_ between `ContactField`
  (`contact-submitter.ts:64`) and the template ids at `contact-form.html:45`, `:65`, `:87`, `:111`,
  `:137`. Nothing in the type system enforces it, so it is enforced by a test instead:
  `contact-form.spec.ts:421` iterates `CONTACT_FIELDS`, resolves each id, focuses it, and asserts it
  became `activeElement` — which also catches the non-obvious case of `#contact-service`, where the
  id sits on the `mat-select` host rather than on a native control.
- `?.` absorbs a missing element; `viewChild.required` means `card()` itself throws if read before
  the first render, which cannot happen because every caller is reached from a user event.

**State written.** DOM focus. **Side effects.** Focus move; may scroll the field into view.
**Error handling.** Silent no-op on a missing element.

---

### 2.18 `focusFirstInvalid`

**Location.** `contact-form.ts:265-270` · `private focusFirstInvalid(): void`

**Execution flow.** `CONTACT_FIELDS.find(field => this.form[field]().invalid())`, then
`focusField(first)` if found.

**Callees.** `Array.prototype.find`, the field proxy, `FieldState.invalid`, `focusField`.

**Design points.**

- Iterating `CONTACT_FIELDS` rather than the DOM gives a deterministic, source-defined order that
  matches visual order (`name`, `email`, `company`, `service`, `description`).
- It deliberately does **not** check `interest` or `method`. Both always have a value from
  `DEFAULTS`, so neither can be invalid under normal operation. Consequence, stated as a fact: if
  `interest` were cleared programmatically it would be invalid, the form would refuse to submit, and
  `focusFirstInvalid` would find nothing and move no focus — the form would appear inert. The chip
  guard (2.28) is what makes that state unreachable from the UI.

**State written.** DOM focus. **Side effects.** Focus move. **Error handling.** `find` returning
`undefined` is handled by the `if`.

---

### 2.19 `notify`

**Purpose.** Map a submission status onto a localized, toned, icon-bearing snack bar.

**Location.** `contact-form.ts:272-289` · `private notify(status: ContactSubmitStatus): void`

**Execution flow.**

1. `const copy = this.content()` — one dictionary read for the whole function.
2. Build an object literal with one entry per status and immediately index it with `[status]`.
   `sent` → `{icon:'check', tone:'success'}`; `not-configured` → `{icon:'mail', tone:'error'}`;
   `failed` → `{icon:'x', tone:'error'}`.
3. `this.snackBar.openFromComponent(SnackBar, { ...SNACK_BAR_CONFIG, ...(status === 'sent' ? { duration: SENT_DURATION_MS } : {}), data: tone })`.

**The duration asymmetry is deliberate and verifiable.** `SNACK_BAR_CONFIG` is
`{ verticalPosition: 'top' }` (`snack-bar.ts:15`) and sets no duration;
`MatSnackBarConfig.duration` defaults to `0` (`@angular/material/fesm2022/snack-bar.mjs:90`) and
`_attach` only schedules an auto-dismiss when `duration > 0` (`:694-695`). So a **success** toast
disappears after 6 s, while **error** toasts stay until the visitor dismisses them. An error message
a visitor can miss is an error message that produces a duplicate submission.

**Because the dictionary type is an exhaustive record keyed by `ContactSubmitStatus`, adding a fourth
status becomes a compile error here** — the lookup would no longer be total. That is the main reason
to prefer the record over a `switch`.

**Callees.** `useDictionary`'s computed, `MatSnackBar.openFromComponent`.

**State written.** None on the component. Creates an overlay and a `SnackBar` component instance.

**Side effects.** A floating overlay; any previously open snack bar is replaced (`MatSnackBar`
dismisses the current ref on a new `open`).

**Error handling.** None. Every branch is statically present; the `as const` on each entry keeps
`tone` and `icon` narrowed to `SnackBarTone` and `AppIconName` rather than widening to `string`.

**Cost, stated honestly.** All three objects and all three `.value` reads are evaluated on every
call, even though two are discarded. Three allocations per submission is not worth restructuring
into a `switch`; the exhaustiveness guarantee is worth more.

---

### 2.20 `errorBodyOf`, `isFieldName`, `rejectedFieldsOf`

#### `errorBodyOf`

**Purpose.** Narrow an _untrusted_ HTTP error body to the two properties this adapter reads, without
a type assertion.

**Location.** `http-contact-submitter.ts:25-42` ·
`function errorBodyOf(raw: unknown): ContactApiErrorBody`

**Why `unknown` and not a cast.** `HttpErrorResponse.error` is genuinely unknown: when the response
body is not valid JSON, `FetchBackend.parseBody` returns the **raw text string** for any non-2xx
status (`@angular/common/fesm2022/_module-chunk.mjs:950-963`, the `catch` at `:959-963`). A proxy
error page, a gateway's HTML, or an empty body all arrive here. `(error.error ?? {}) as Body` would
have typed a string as an object and `body.message` would have been `undefined` at best.

**Execution flow.**

1. `typeof raw !== 'object' || raw === null` → return `{}`. This is the branch that catches the raw
   HTML/text case. Pinned by `http-contact-submitter.spec.ts:240`, _"survives an error body that is
   not JSON at all."_
2. Read `body['message']` and `body['requestId']` with bracket access —
   `noPropertyAccessFromIndexSignature` is on (`tsconfig.json`), so dotted access on a
   `Record<string, unknown>` would not compile.
3. `message`: if it is an array, keep only the string elements via a type-predicate filter; else keep
   it if it is a string; else `undefined`.
4. `requestId`: keep if a string.

**Callees.** `Array.isArray`, `Array.prototype.filter`. **State written.** None — pure.
**Side effects.** None. **Error handling.** Total: every input shape has a defined output.

#### `isFieldName`

**Location.** `http-contact-submitter.ts:44-45` ·
`(value: string) => value is ContactField` · `(CONTACT_FIELDS as readonly string[]).includes(value)`.

A single-expression type guard. The widening assertion is required because
`readonly ContactField[]).includes(string)` is a type error. This is a narrowing of a _runtime_ value
against the source-of-truth array — the one legitimate use of an assertion here.

#### `rejectedFieldsOf`

**Purpose.** Work out which form fields the API rejected, from a `class-validator` message array.

**Location.** `http-contact-submitter.ts:47-60` ·
`export function rejectedFieldsOf(message: string | readonly string[] | undefined): ContactField[]`

**Execution flow.**

1. `if (!Array.isArray(message)) return []` — handles `undefined` and the single-string case. A
   single string is a non-validation failure (e.g. the 503 from
   `Nexora-back/src/modules/contact/contact.service.ts:43`), which names no field.
2. `const fields = new Set<ContactField>()` — de-duplicates, since one field can break several
   rules at once.
3. For each line: `String(line).trim().split(/\s+/, 1)[0] ?? ''` → the first whitespace-delimited
   token. `class-validator` messages are of the form
   `"name must be longer than or equal to 1 characters"`, so the first token is the property name.
   The `String(...)` is belt-and-braces for a non-string element that slipped past `errorBodyOf`;
   the `?? ''` is similarly defensive (`split` with a limit always yields at least one element, and
   `noUncheckedIndexedAccess` is off, so the compiler did not require it).
4. `if (isFieldName(leading)) fields.add(leading)`.
5. `return CONTACT_FIELDS.filter(field => fields.has(field))` — **re-orders** the result into the
   canonical field order, so `submit()`'s `rejected[0]` is the first field in _form_ order rather
   than in server-message order.

**Design consequence.** Fields the form has nowhere to show an error — `interest`, `timeline`,
`budget`, `method`, `website` — are silently dropped, because `CONTACT_FIELDS`
(`contact-submitter.ts:66-72`) contains only the five. A `forbidNonWhitelisted` complaint
("property foo should not exist") likewise names nothing matchable. Both are deliberate and pinned:
`http-contact-submitter.spec.ts:277` and `:184`.

**State written.** None — pure. **Side effects.** None. **Error handling.** Total for every input
shape; `export`ed precisely so it can be tested directly (`:267-310`, five cases).

---

### 2.21 `HttpContactSubmitter.submit`

**Purpose.** Guarantee that one inquiry is sent at most once concurrently, and refuse to send at all
when no API origin is configured.

**Location.** `http-contact-submitter.ts:70-91` ·
`override async submit(inquiry: ContactInquiry): Promise<ContactSubmitResult>`

**Execution flow.**

1. **`if (!this.origin) return { status: 'not-configured' }`.** `API_ORIGIN` resolves to `''`
   whenever `environment.apiOrigin` is absent or unusable (`api-origin.ts:24-30`). In **production**
   `apiOrigin` is `''` (`src/environments/environment.production.ts:5`), so the deployed site takes
   this branch and never issues a request; in development it is `http://localhost:3000`
   (`environment.ts:5`), which with the backend's `app.setGlobalPrefix('api')`
   (`Nexora-back/src/configure-app.ts:79`) makes `${origin}/api/contact` the correct URL.
2. **`const key = JSON.stringify(inquiry)`** — the de-duplication identity.
3. **`if (this.pending?.key === key) return this.pending.result`** — a second click with _identical_
   content joins the in-flight promise instead of posting again. Pinned by
   `http-contact-submitter.spec.ts:123`.
4. **Build `entry`** with `result: this.send(inquiry).finally(…)`.
5. **`this.pending = entry`**, then return `entry.result`.

**The `finally` callback** (`:82-86`) clears `this.pending` _only if_ `this.pending === entry`. The
identity check is what makes it safe: if a _different_ inquiry started in the meantime, that newer
entry must not be cleared by an older send's completion. Pinned by `:217` ("does not hand a
different inquiry the result of the send already in flight") and `:253` ("accepts a new submission
once the previous one has settled").

**Is `JSON.stringify` a stable key?** Yes, within this implementation. Property order follows the
object's own insertion order, and Signal Forms writes a child value with
`{ ...sourceValue, [prop]: newPropValue }` (`_validation_errors-chunk.mjs:997-1008`), which keeps an
existing key in its original position. `reset({ ...DEFAULTS })` restores `DEFAULTS` order. So the
same logical inquiry always stringifies identically.

**Belt and braces, not redundancy.** This guard and the framework's own re-entrancy guard
(`_validation_errors-chunk.mjs:1837-1839`) cover different cases. The framework's covers a second
click while `submitting` is `true` through the _same_ form instance; this one covers two form
instances, a programmatic call, or any path that bypasses `submitForm`.

**State written.** `this.pending`. **Side effects.** Via `send`. **Error handling.** None here; it
cannot throw. `.finally` runs on both settle paths.

---

### 2.22 `HttpContactSubmitter.send`

**Purpose.** Perform the POST and classify every possible outcome into `ContactSubmitResult`,
logging everything a developer needs and showing a visitor nothing they cannot act on.

**Location.** `http-contact-submitter.ts:93-129` ·
`private async send(inquiry: ContactInquiry): Promise<ContactSubmitResult>`

**Execution flow.**

1. `await firstValueFrom(this.http.post<ContactApiResponse>(`${this.origin}${CONTACT_PATH}`, inquiry))`
   — `CONTACT_PATH = '/api/contact'` (`:13`). The whole `ContactInquiry` goes on the wire as the
   body, including the honeypot.
2. **`if (response?.success) return { status: 'sent' }`.** The `?.` covers a 200 with a `null` body,
   which `FetchBackend.parseBody` produces for an empty response (`_module-chunk.mjs:954-956`).
   The server's success shape is `{ success: true, message }`
   (`Nexora-back/src/modules/contact/contact.service.ts:12-20`).
3. **A 200 that does not report success** is a contract violation, not a visitor error. It is logged
   with the actual body — `handleError(new Error('Contact API answered HTTP 200 without success: ' + JSON.stringify(response ?? null)))`
   — and returned as `failed`. Without this, the only trace of a broken deployment would be a
   generic toast. Pinned by `http-contact-submitter.spec.ts:82`.
4. **`catch (error)` → `error instanceof HttpErrorResponse`:**
   - `errorBodyOf(error.error)` → safe body (2.20).
   - `rejectedFieldsOf(body.message)` → the fields to mark.
   - Log a single `Error` whose message distinguishes **unreachable** (`error.status === 0`) from
     **rejected** (`HTTP <status>`), appends `error.message`, appends `describe(body)`, and carries
     `{ cause: error }` so the original response survives in the chain.
   - Return `{ status: 'failed', rejectedFields }` when there is at least one field, else
     `{ status: 'failed' }`. The conditional avoids putting an empty array on the result, which
     keeps the `rejected?.length` check in `ContactForm.submit` meaningful.
5. **Any other throw** — `handleError(error)` and `failed`.

**The division of information is the design.** The _visitor_ gets one localized sentence
(`errorServer`) on the fields they can fix. The _developer_ gets the status, the server's own
wording, and the `requestId` in `ErrorHandler`. The server's English validation prose is never shown
to a visitor who may be reading Armenian or Russian. Pinned by
`http-contact-submitter.spec.ts:162`, _"logs the server wording and request id it does not show the
visitor."_

**Callees.** `HttpClient.post`, `firstValueFrom`, `errorBodyOf`, `rejectedFieldsOf`, `describe`,
`ErrorHandler.handleError`, `JSON.stringify`.

**State written.** None on the instance. **Side effects.** Network request; `ErrorHandler` calls.

**Error handling.** Total: success, unsuccessful 200, `HttpErrorResponse`, and non-HTTP throw are
all classified. `send` never rejects, which is what lets `submit` attach `.finally` without a
`.catch` and what lets the component's narrow `try` be narrow.

---

### 2.23 `describe`

**Location.** `http-contact-submitter.ts:132-136` ·
`function describe(body: ContactApiErrorBody): string`

**Execution flow.** Join an array `message` with `'; '`, or take the string; build
`[detail, requestId && 'requestId ' + requestId].filter(Boolean)`; return `' - ' + parts.join(', ')`
or `''` when nothing is known.

**Purpose.** Keep the log line readable whether the server sent a validation array, one sentence, or
nothing at all — and never emit a dangling separator. Pure; no side effects; cannot throw. A module
function rather than a method because it needs nothing from the instance.

---

### 2.24 `isActivation` (chip-select)

**Location.** `chip-select/chip-select.ts:17-30` · `(event: Event) => boolean`

**Execution flow.** `true` for a `click`; `false` for anything that is not a `KeyboardEvent`;
otherwise `true` when `event.key` is `'Enter'` or `' '` **or** `event.keyCode` is `ENTER` or
`SPACE` (the CDK's constants, `@angular/cdk/keycodes`).

**Purpose.** Distinguish "the visitor is trying to toggle this chip" from "the visitor is navigating
between chips". Everything that is not an activation must pass through untouched, or arrow-key
navigation inside the listbox would break.

**Callees.** None. Pure.

**Why both forms are checked.** Material's handler tests `event.keyCode`, not `event.key`
(`@angular/material/fesm2022/chips.mjs:144`, `ENTER`/`SPACE`). Real browser events carry both, so
an earlier version that tested only `key` agreed with Material in a browser — but an event carrying
only `keyCode` was still acted on by Material and ignored by the guard. That was not theoretical:
reverting the `keyCode` clause and dispatching `{ key: '', keyCode: SPACE }` at the selected chip
reproduces the original crash verbatim, `TypeError: this.field(...) is not a function`. The guard
now matches exactly the set of events Material toggles on, so it cannot be weaker than the
behaviour it exists to counter.

`keyCode` is deprecated, and the one reference carries a scoped
`// eslint-disable-next-line @typescript-eslint/no-deprecated` with that reasoning rather than a
file-wide suppression, so an accidental use elsewhere still fails lint. The same divergence is also
why `chip-select.spec.ts` defines `keyCode` explicitly the way the CDK's own test helpers do: two
of its tests first passed **vacuously** without it.

---

### 2.25 `ChipSelect` constructor and `refuseDeselect`

**Purpose.** Make a mandatory single choice impossible to clear. This is the fix for a P1 crash, and
it is the one place in the form where framework behaviour had to be actively countered.

**Location.** `chip-select/chip-select.ts:46-66`; `refuseDeselect` is `:48-58`.

**The defect it prevents, traced end to end.**

1. `MatChipOption._handlePrimaryActionInteraction` calls `toggleSelected(true)` **unconditionally**
   when the chip is selectable (`chips.mjs:906-913`), and `toggleSelected` is
   `_setSelectedState(!this.selected, …)` (`:902-905`). Activating the _already selected_ chip
   therefore **deselects** it.
2. With nothing selected, `MatChipListbox._propagateChanges` computes
   `valueToEmit = this.selected ? this.selected.value : undefined` and pushes it through the value
   accessor via `_onChange(valueToEmit)` (`:1776-1787`).
3. `cvaControlCreate`'s `registerOnChange` callback writes that `undefined` into the field's
   `controlValue` (`signals.mjs:985-988`), which writes `{ ...model, interest: undefined }` into the
   model (`_validation_errors-chunk.mjs:997-1008`).
4. On the next materialization pass, a child whose value is `undefined` is **un-materialized** —
   `materializedChildren.byPropertyKey.delete(key)` (`_validation_errors-chunk.mjs:1167-1177`).
5. `FIELD_PROXY_HANDLER.get` then finds no child and returns `undefined` (`:935-966`), so
   `form.interest` is `undefined` and the next render of `showError(form.interest())` throws
   **`TypeError: form.interest is not a function`**.

**Execution flow of the constructor.**

1. `const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement` — the
   `<app-chip-select>` host, an ancestor of every chip.
2. Define `refuseDeselect`:
   - `if (!isActivation(event)) return` — arrow keys, Tab, Home/End, pointer moves all fall through
     to Material's key manager untouched.
   - `const target = event.target instanceof Element ? event.target : null` — `event.target` is
     `EventTarget | null`; the `instanceof` narrows it without an assertion.
   - `if (target?.closest('[role="option"]')?.getAttribute('aria-selected') === 'true')` →
     `event.stopPropagation(); event.preventDefault();`
3. Register it for `click` and `keydown` **with `{ capture: true }`**.
4. `inject(DestroyRef).onDestroy(...)` removes both listeners with the same `capture` flag — a
   different flag would fail to match and leak the listener.

**Why the capture phase is the mechanism, not a detail.** Material's handlers live on the chip
_action_ element, a descendant, and fire in the bubble phase. A capture-phase listener on the
ancestor runs **before** the event reaches the target at all, so `stopPropagation()` there prevents
the event from ever arriving — `stopImmediatePropagation` is unnecessary. `preventDefault()`
additionally suppresses the page scroll that `Space` would otherwise cause.

**Why `aria-selected` on `[role="option"]` is the right probe.** `mat-chip-option` renders as
`role="presentation"`; the accessible option is an inner `<button role="option">`. Its
`aria-selected` comes from `MatChipOption.ariaSelected`, which is
`this.selectable ? this.selected.toString() : null` (`chips.mjs:884-886`) — i.e. the attribute is
Material's own authoritative view of selection, read straight from the DOM at the moment of the
event, with no second source of truth to drift.

**Three alternatives rejected, each on source evidence.**

| Alternative                                 | Why it fails                                                                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[selectable]="false"` on the selected chip | `ariaSelected` returns `null` when `selectable` is false (`chips.mjs:885`), so the DOM would stop announcing the selection at all.                            |
| Restore the value in `(change)`             | `_propagateChanges` emits `change` **before** calling `_onChange` (`chips.mjs:1784-1785`), so the restore runs before the clearing write it is meant to undo. |
| Re-select in `(selectionChange)`            | Correctness would depend on subscriber ordering relative to the value accessor — unspecified.                                                                 |

**State written.** None in the component. Prevents a write to the model.

**Side effects.** Two DOM listeners for the component's lifetime, removed on destroy.

**Error handling.** Every step is `?.`-guarded or `instanceof`-narrowed; the handler cannot throw.

**Blast radius.** `ChipSelect` is used only by this form's two groups. The services filter bar and
the home "why" section use `MatChipListbox` directly, so they are unaffected — their chips remain
clearable, which is correct for a multi-select filter.

---

### 2.26 `ChipSelect.focus`

**Location.** `chip-select/chip-select.ts:68-70` · `focus(): void` · `this.listbox().focus()`

**Purpose.** Let a label that is not a native `<label for>` still move focus into the control. Called
from the template as `interestChips.focus()` / `methodChips.focus()`
(`contact-form.html:20`, `:198`).

**Execution flow.** `viewChild.required(MatChipListbox)` (`:44`) → `MatChipListbox.focus()`
(`chips.mjs:1721-1733`): if disabled, nothing; else focus the first selected chip; else activate the
first item via the key manager; else focus the host. Because these groups always have a selection,
the selected chip receives focus — the behaviour a visitor expects from clicking a group label.

**State written.** DOM focus (and the CDK key manager's active item). **Side effects.** Focus move.
**Error handling.** `viewChild.required` throws if read before the first render; unreachable, since
the only caller is a click on a rendered label. Public rather than `protected` because the parent
template calls it through a template reference variable — **not** dead code.

---

### 2.27 `provideContactForm`

**Location.** `src/app/pages/contact/contact.providers.ts:5-7` · `(): EnvironmentProviders` ·
`makeEnvironmentProviders([{ provide: ContactSubmitter, useClass: HttpContactSubmitter }])`

**Purpose.** Give the application root one named seam to wire the port to the adapter, instead of the
root config reaching two levels into a page folder.

**Execution flow.** Called once, at `app.config.ts:24`. `EnvironmentProviders` (rather than a raw
array) means it can only be used where environment providers are legal — it cannot be dropped into a
component's `providers`, which would create a second, per-component transport and defeat the
in-flight de-duplication in 2.21.

**Relationship.** `app.config.ts` now imports one symbol from one path (`:11`). The adapter stays
private to the page folder, and the composition root reads as a list of capabilities.

---

### 2.28 `FieldLabel.onClick`

**Location.** `src/app/shared/ui/field-label/field-label.ts:18-22` · `protected onClick(): void`

**Execution flow.** `if (!this.for()) this.activate.emit()`.

**Purpose.** A `<label for="id">` already moves focus natively, so emitting then would double-handle
the click. A label for a `mat-select` or a chip listbox has no `for` target — those controls are not
labelable elements — so the component falls back to an explicit `activate` output, which the parent
wires to `focus()`.

**Callees.** `OutputEmitterRef.emit`. **State written.** None. **Side effects.** Emits an event; the
parent's handler moves focus. **Error handling.** None needed.

**Relationship.** Used eight times in `contact-form.html`. With `for`: name (`:38`), email (`:58`),
company (`:80`), description (`:130`). With `labelId` + `(activate)`: interest (`:18-20`), service
(`:100-102`), timeline (`:156`), budget (`:176`), method (`:198`). In the second group the
`labelId` is also referenced by the control's `aria-labelledby`, so the accessible name and the
click-to-focus behaviour come from the same element. The host binding
`[class.field-label--invalid]="invalid()"` is what `showError(...)` colours.

---

### 2.29 `SnackBar.action` and `SnackBar.dismiss`

**Location.** `src/app/shared/ui/snack-bar/snack-bar.ts:41` and `:43-45`.

**`action`** · `computed(() => this.data.action ?? this.content().dismiss.value)` · `Signal<string>`.
Prefers a caller-supplied label, else the translated "dismiss". It must be a `computed`, not an
eagerly-initialized field: a field initializer would read `content()` once at construction and
freeze the label in whatever locale was active when the toast opened. `ContactForm` never passes
`data.action` (2.19), so in this form the right-hand branch always wins. Template:
`{{ action() }}` (`snack-bar.html:7`).

By contrast `svgIcon = appIcon(this.data.icon)` (`:40`) is correctly eager — `data.icon` is a
constant for the lifetime of the toast and `appIcon` is pure.

**`dismiss`** · `(): void` · `this.snackBarRef.dismissWithAction()`. Chosen over `dismiss()` so the
ref's `onAction()` observable fires — the semantics are "the visitor acted", which a caller can
distinguish from a timeout. No current caller does, but the information is not discarded.

---

### 2.30 `Reveal` — `appReveal="load"` on the form element

**Location.** `src/app/shared/motion/reveal.ts`. Applied at `contact-form.html:4`.

**Constructor → `afterNextRender` callback** (`:16-49`):

1. Read the host element and `document.defaultView`.
2. **`if (!view || !('IntersectionObserver' in view)) return`** — the SSR/prerender guard. The form
   is prerendered; with no `view` the element simply never gets `data-reveal`, so it renders in its
   final state and is fully usable without JavaScript.
3. `element.setAttribute('data-reveal', 'out')` — the pre-animation state.
4. Define `revealNextFrame`: two nested `requestAnimationFrame` calls, then `reveal()`. Two frames,
   not one: the first lets the browser commit the `out` state, the second starts the transition from
   it. A single frame can be coalesced, producing no animation at all.
5. **`if (this.appReveal() === 'load')`** — which is this form's case — call `revealNextFrame()` and
   return. No observer is created at all.
6. Otherwise build an `IntersectionObserver`, reveal on first intersection, `disconnect()`
   immediately, and also disconnect via `destroyRef.onDestroy`.

**`reveal`** (`:52-54`): `setAttribute('data-reveal', 'in')`. All motion is CSS; the directive only
flips a data attribute.

For `ContactForm` specifically: no observer, no listener, no `DestroyRef` registration — two frames
and one attribute write.

---

### 2.31 `normalizeOrigin`, `isUsableOrigin`, and the `API_ORIGIN` factory

**Location.** `src/app/core/routing/api-origin.ts`.

**`normalizeOrigin(configured: string): string`** (`:4-6`) — `configured.replace(/\/+$/, '')`.
Strips _all_ trailing slashes, so `http://x/` and `http://x///` both become `http://x` and
`${origin}/api/contact` can never produce a double slash.

**`isUsableOrigin(value: string): boolean`** (`:8-22`) —

1. `new URL(value)` inside `try`; `catch` → `false`. An empty string, a bare host, or a relative
   path all fail here.
2. Require `protocol` to be `https:` or `http:` — rejects `javascript:`, `data:`, `file:`.
3. Require a non-empty `host`.
4. Reject any `search` or `hash` — an origin with a query string is a configuration mistake, and
   appending a path to it would produce a nonsense URL.

Pure, total, no side effects.

**The `API_ORIGIN` factory** (`:24-30`) — `providedIn: 'root'`, runs once:
`normalizeOrigin(environment.apiOrigin)`, then return it if usable, **else `''`**. Returning the
empty string rather than throwing is what turns a misconfiguration into the visible, honest
`not-configured` state rather than a boot failure or a request to a bogus URL.

**Concrete values in this repo:** development `http://localhost:3000`
(`src/environments/environment.ts:5`); production `''`
(`src/environments/environment.production.ts:5`).

---

### 2.32 `appIcon` and `isAppIconName`

**Location.** `src/app/core/icons/icons.ts:48-50` and `:44-46`.

**`appIcon(name: AppIconName)`** returns the template-literal type
`` `app:${AppIconName}` ``. Used at `contact-form.ts:119` (`arrowIcon`) and `snack-bar.ts:40`.
Pure. The payoff is that a typo is a compile error rather than a silently missing icon, and the
return _type_ — not just the value — stays narrow for `[svgIcon]`.

**`isAppIconName(name: string): name is AppIconName`** — runtime guard over `APP_ICON_NAMES`; not
used by the contact form, listed for completeness of the module.

---

### 2.33 `Contact.crumbs` (the hosting page)

**Location.** `src/app/pages/contact/contact.ts:19` · `computed(() => pageCrumbs(this.content()))`.
The page renders `<app-contact-form />` with no inputs (`contact.html:13`) — `ContactForm` takes no
inputs and emits no outputs, which is why it can be reasoned about in isolation.

`ContactNext` and `ContactChannels` are siblings inside `contact.html`, not dependencies of
`ContactForm`; nothing flows between them.

---

## 3. Framework functions the implementation depends on

Verified in the installed bundles. These are listed because several of the component's decisions are
only correct in light of them.

| #    | Function                               | Location                                               | What the form relies on                                                                                                                                                                                                                                                                           |
| ---- | -------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1  | `submit(form, options)`                | `_validation_errors-chunk.mjs:1835-1867`               | Re-entrancy guard, `markAsTouched`, validity gate, `setSubmissionErrors`, `finally`. See the table in 2.13.                                                                                                                                                                                       |
| 3.2  | `shouldRunAction`                      | `:1872-1880`                                           | With no `ignoreValidators`, it is `!untracked(node.invalid)` — the reason `action` cannot run on an invalid form.                                                                                                                                                                                 |
| 3.3  | `setSubmissionErrors`                  | `:1882-1900`                                           | Calls `errorWithField.fieldTree()`, so `toFieldErrors` must pass the **tree**. Groups by field, then `submissionErrors.set(...)`.                                                                                                                                                                 |
| 3.4  | `FieldState.reset(value)`              | `:1506-1523`                                           | Aborts pending sync, sets the value, pushes it to the control, `markAsUntouched` + `markAsPristine`, resets every `FormField` binding, recurses into children. One call restores the whole form.                                                                                                  |
| 3.5  | `markAsTouched`                        | `:1473-1496`                                           | Recurses to every child, so the first submit reveals every error.                                                                                                                                                                                                                                 |
| 3.6  | `required` / `maxLength`               | `signals.mjs:458-475`, `:297-…`                        | Register metadata keys (`REQUIRED`, `MAX_LENGTH`) in addition to validators — the source of the native `required` / `maxlength` attributes.                                                                                                                                                       |
| 3.7  | `isEmpty`                              | `signals.mjs:78-83`                                    | `value === '' \|\| value === false \|\| value == null` — **no trim**. The entire reason `notBlank` exists.                                                                                                                                                                                        |
| 3.8  | `EMAIL_REGEXP`                         | `signals.mjs:207`                                      | The dotted suffix is optional. The entire reason `emailTld` exists.                                                                                                                                                                                                                               |
| 3.9  | `validate(path, logic)`                | `signals.mjs:94-100`                                   | `addDefaultField(logic(ctx), ctx.fieldTree)` — custom rules get their `fieldTree` for free.                                                                                                                                                                                                       |
| 3.10 | `readonly(path, cfg)`                  | `signals.mjs:64-69`                                    | Stores the predicate (`addReadonlyRule`); never calls it eagerly — why `whileSending` is safe.                                                                                                                                                                                                    |
| 3.11 | `FieldState.errors`                    | `:735` + `:686`                                        | The ordering that makes `fieldError()` deterministic (2.12).                                                                                                                                                                                                                                      |
| 3.12 | `submissionErrors`                     | `:1326-1333`                                           | A `linkedSignal` sourced from the field value — server errors self-clear on edit, with no component code.                                                                                                                                                                                         |
| 3.13 | `FIELD_PROXY_HANDLER.get`              | `:935-966`                                             | Returns the child's `fieldTree`, else `undefined`. The last step of the chip defect.                                                                                                                                                                                                              |
| 3.14 | child materialization                  | `:1167-1177`                                           | A child whose value is `undefined` is deleted. The root cause of the chip defect.                                                                                                                                                                                                                 |
| 3.15 | `valueForWrite`                        | `:997-1008`                                            | `{ ...source, [prop]: value }` — preserves key order, which is what makes `JSON.stringify` a stable de-dup key.                                                                                                                                                                                   |
| 3.16 | `FormField`                            | `signals.mjs:1252-…`                                   | Injects `NG_VALUE_ACCESSOR` self-optional; provides `NgControl` via `InteropNgControl`; `state = computed(() => this.field()())`.                                                                                                                                                                 |
| 3.17 | `nativeControlCreate`                  | `signals.mjs:1086-1139`                                | Binds `input`/`blur` listeners (blur → `markAsTouched`), and writes `required`/`maxlength`/`readonly` to the DOM for accepted keys.                                                                                                                                                               |
| 3.18 | `cvaControlCreate`                     | `signals.mjs:983-1030`                                 | The `mat-select` / `mat-chip-listbox` path: `registerOnChange` → `controlValue.set`, `registerOnTouched` → `markAsTouched`, and `writeValue` on the way back.                                                                                                                                     |
| 3.19 | `elementAcceptsNativeProperty`         | `signals.mjs:1406-1424`                                | `maxLength` only for textual elements; `required`/`readonly`/`disabled`/`name` always — but only for _native_ form elements, so `mat-select` gets no native attributes.                                                                                                                           |
| 3.20 | `installClassBindingEffect`            | `signals.mjs:1320-1345`                                | **One `afterRenderEffect` per bound field, holding one `computed` per configured class.** With 10 bound fields, each entry in `STATUS_CLASSES` costs 10 computeds — which is why that object has exactly one entry (`contact-form.ts:86-88`) rather than the five from the documentation example. |
| 3.21 | `ErrorStateMatcher.isSignalErrorState` | `@angular/material/.../_error-options-chunk.mjs:48-54` | `invalid && touched` — byte-for-byte the same predicate as `showError`.                                                                                                                                                                                                                           |
| 3.22 | `MatSnackBarConfig.duration`           | `@angular/material/.../snack-bar.mjs:90`, `:694-695`   | Defaults to `0`; auto-dismiss only when `> 0`. Why error toasts persist.                                                                                                                                                                                                                          |
| 3.23 | `provideHttpClient()`                  | `@angular/common/.../_module-chunk.mjs:2036-2043`      | Binds `HttpBackend` to **`FetchBackend`** with no `withFetch()` needed.                                                                                                                                                                                                                           |
| 3.24 | `FetchBackend.parseBody`               | `:950-963`                                             | Returns raw **text** for an unparseable non-2xx body — why `errorBodyOf` takes `unknown`.                                                                                                                                                                                                         |

### 3.25 The only RxJS in the chain

`firstValueFrom(this.http.post(...))` at `http-contact-submitter.ts:95-97`. `HttpClient.post`
returns a cold, single-emission observable: nothing is sent until subscription, which `firstValueFrom`
performs. It resolves on the first `next`, then unsubscribes — so there is no subscription to manage
and no leak. On an HTTP error it rejects with `HttpErrorResponse`; if the observable completed
without emitting it would reject with `EmptyError`, which is unreachable for `post`.

**The deliberate consequence:** there is **no cancellation**. If the component is destroyed
mid-flight the request is not aborted, and the `.finally` in `submit` still runs on the (now
orphaned) adapter — harmless, because the adapter is root-scoped and the callback only clears a
field. Making the send abortable would mean a `takeUntil`/`AbortSignal` plumbed through the port,
which would complicate the interface for no visitor-facing benefit: an inquiry that is already on
the wire _should_ arrive.

Elsewhere RxJS appears only inside Material internals the form does not touch directly
(`FocusMonitor`, the chip key manager, `MatChipListbox.change`, `snackBarRef.afterOpened()`).

---

## 4. The complete lifecycle, step by step

### 4.1 Initialization

1. **Bootstrap.** `main.ts` → `bootstrapApplication(App, appConfig)`. `app.config.ts:24` runs
   `provideContactForm()`, binding `ContactSubmitter` → `HttpContactSubmitter`.
2. **Route activation.** The `/contact` route renders `Contact`, whose template instantiates
   `ContactForm`.
3. **Construction.** Field initializers run in the order tabulated in 2.6. By the end:
   `model` holds a copy of `DEFAULTS`; `form` exists with its full rule graph; the five computeds are
   declared but unevaluated; `card` and `heading` are empty signals.
4. **First template pass.** Each `[formField]` instantiates a `FormField` directive, which calls
   `ɵngControlCreate` → `nativeControlCreate` for the three inputs, the textarea and the honeypot, or
   `cvaControlCreate` for the three `mat-select`s and the two `mat-chip-listbox`es. Each registers
   itself in `formFieldBindings`, installs the class-binding effect (one `ng-invalid` computed each),
   and writes the initial value into the control. `required` and `maxlength` land on the native
   elements at this point.
5. **`afterNextRender`.** `Reveal` sets `data-reveal="out"`, then after two frames `"in"`.
6. **Resting state.** `form().invalid()` is `true` (name, email, company, service, description are
   all empty), but nothing is `touched`, so `showError` is `false` everywhere and the form looks
   clean. `interest` shows "A new project" selected; `method` shows "Email". Pinned by
   `contact-form.spec.ts:120`.

### 4.2 Data entry in a text field

1. Keystroke → native `input` event → the listener installed at `signals.mjs:1099` →
   `parser.setRawValue(undefined)` → `controlValue.set(newValue)`.
2. `controlValueSignal`'s setter (`_validation_errors-chunk.mjs:1539-1546`) writes the value, calls
   `markAsDirty()`, and schedules `debounceSync`.
3. The model signal updates via `valueForWrite` (3.15), preserving key order.
4. Dependents recompute lazily: that field's validators, `invalid()`, the `ng-invalid` class effect,
   and — for the textarea — `descriptionLength` → `descriptionCount` → the counter's
   `data-count`.
5. **No error appears yet.** `touched` is still `false`.
6. **Blur** → the listener at `signals.mjs:1101` → `markAsTouched()` → `showError` flips to `true`
   for that field → `app-field-label` turns red and `<mat-error>` renders
   `fieldError(...)` = the first error in schema order.

### 4.3 Validation, in the order a visitor meets it

For `name` with the schema at `contact-form.ts:135-137`:

| Value     | `required`                           | `notBlank`                  | `maxLength`              | Message shown            |
| --------- | ------------------------------------ | --------------------------- | ------------------------ | ------------------------ |
| `''`      | fires (`isEmpty`)                    | silent (`length > 0` fails) | silent (`isEmpty` guard) | required                 |
| `'   '`   | **silent** — `isEmpty` does not trim | **fires**                   | silent                   | required (same text)     |
| `'Ada'`   | silent                               | silent                      | silent                   | none                     |
| 121 chars | silent                               | silent                      | fires                    | "at most 120 characters" |

For `email` (`:139-142`): `''` → required; `'nope'` → `email()`; `'john@example'` → `email()`
passes but `emailTld` fires, same message; `'john@example.com'` → clean.

Each row of this table is an executed test, not an inspection:
`contact-form.spec.ts:366-419` and `contact-contract.spec.ts:134-181`, the latter asserting the
client predicate and the **server's own installed `validator.isEmail`** agree case by case.

### 4.4 Choosing a service (the `mat-select` path)

1. Click the label → `FieldLabel.onClick` → no `for()` → `activate` → `serviceSelect.focus()`
   (`contact-form.html:102`).
2. Choosing an option → `MatSelect` → `_onChange` → `cvaControlCreate`'s `registerOnChange`
   (`signals.mjs:985-988`) → `controlValue.set(value)` → model.
3. Closing the overlay → `registerOnTouched` → `markAsTouched()` → any error becomes visible.
4. `required` is satisfied as soon as the value is not `''`. Note that `required` here produces only
   `aria-required` behaviour on the Material host — `elementAcceptsNativeProperty` returns `false`
   for a non-native element (3.19) — so the _visible_ requirement cue comes from the `*` in the label
   and from `showError`.

### 4.5 Choosing an interest or a contact method (the chip path)

**Choosing a different chip.**

1. Click (or `Enter`/`Space`) on an unselected chip.
2. `refuseDeselect` runs first, in the capture phase. The target's `aria-selected` is `"false"`, so
   it returns without interfering.
3. `MatChipAction` → `_handlePrimaryActionInteraction` → `toggleSelected(true)` →
   `_clearSelection(skip)` deselects the others → `_propagateChanges` → `_onChange(newValue)` →
   `controlValue.set` → model.
4. `registerOnTouched` marks the field touched.

**Re-activating the already selected chip — the guarded case.**

1. `refuseDeselect` runs in the capture phase, finds `aria-selected="true"` on the
   `[role="option"]` ancestor of the target, and calls `stopPropagation()` + `preventDefault()`.
2. The event never reaches Material. No toggle, no `undefined` write, no key deletion, no
   `TypeError`. The selection simply stays.

Without the guard, the five-step chain in 2.25 ends in
`TypeError: form.interest is not a function` on the next render — reproduced in a real browser on
the real form for **both** groups, and now pinned by `chip-select.spec.ts:121` (click) and `:134`
(keyboard), plus an e2e test in `e2e/contact.spec.ts` that also asserts no page error was logged.

**Navigation is untouched.** `chip-select.spec.ts:165` asserts the guard does not swallow the keys
the listbox navigates with, and `:157` that an unselected chip can still be chosen from the
keyboard.

### 4.6 Submission — the invalid path

1. `click` on the submit button (enabled unless a send is in flight) → native `submit` →
   `submit($event)`.
2. `event.preventDefault()`.
3. `submitForm` → not already submitting → `markAsTouched()` on the whole tree → **every** error
   renders at once.
4. `shouldRunAction` → `!invalid` → `false`, so `action` **never runs**: no request, no snack bar.
5. `onInvalid` → `focusFirstInvalid` → first field in `CONTACT_FIELDS` order whose `invalid()` is
   true → `focusField` → `#contact-<field>.focus()`.
6. `finally` → `selfSubmitting` back to `false`.
7. `rejected` is still `undefined`, so step 4 of `submit` does nothing.

Pinned by `contact-form.spec.ts:215`.

### 4.7 Submission — the valid path

1. Steps 1-3 as above; `shouldRunAction` returns `true`.
2. `selfSubmitting.set(true)` → `submitting()` → `aria-busy="true"` on the form and the button
   disabled; the four text fields become `readonly` via `whileSending`.
3. `action` runs: `this.submitter.submit(this.model())`.
4. `HttpContactSubmitter.submit`: origin check → de-dup key → `send`.
5. `send`: `POST ${origin}/api/contact` with all ten fields as the body.
6. Server: `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`
   (`Nexora-back/src/configure-app.ts:82-88`) → `CreateContactDto` → `ContactController.create`
   (`@HttpCode(200)`) → `ContactService.submit`. If `website` is non-empty the submission is
   **discarded but reported as success** (`contact.service.ts:29-32`) — a honeypot must not tell a
   bot it was caught. Otherwise the repository stores it and `{ success: true, message }` comes back.

### 4.8 Success — notification, reset, focus

1. `send` returns `{ status: 'sent' }`.
2. `action` → `this.form().reset({ ...DEFAULTS })`. One call: sets every value, pushes each to its
   control, clears `touched` and `dirty` everywhere, resets each `FormField` binding, recurses
   (3.4). The chips return to "A new project" / "Email"; the counter returns to `0 / 2000`; no error
   is left behind.
3. `this.heading().nativeElement.focus()`. The `<h2>` carries `tabindex="-1"`
   (`contact-form.html:11`) specifically to be programmatically focusable without entering the tab
   order. This is the accessible success announcement: focus lands on "Tell us about your project",
   so a screen-reader user hears where they are instead of being left on a now-empty field. Note
   the order — reset _then_ focus, because resetting re-writes the controls and could otherwise move
   focus itself.
4. `notify('sent')` → green `check` toast, auto-dismissed after 6 s.
5. `rejected` stays `undefined`; `toFieldErrors` returns `undefined`; `submit()` resolves `true`.
6. `finally` → `submitting` false → fields writable again.

Pinned by `contact-form.spec.ts:223`.

### 4.9 The API rejects specific fields

1. The server's `ValidationPipe` throws; `AllExceptionsFilter`
   (`Nexora-back/src/common/filters/all-exceptions.filter.ts:64-71`) responds
   `{ success: false, statusCode, message: string | string[], error, requestId }` with the
   validation **array** as `message`.
2. `send`'s `catch` → `HttpErrorResponse` → `errorBodyOf(error.error)` → `rejectedFieldsOf` reads
   the leading token of each line and returns the matching `ContactField`s **in form order**.
3. One `Error` is logged carrying status, server wording and `requestId`; `{ status: 'failed',
rejectedFields }` is returned.
4. `action` → `notify('failed')` (persistent red `x` toast) → `rejected = result.rejectedFields` →
   `toFieldErrors` builds one `{ kind: 'server', message: errorServer, fieldTree: form[field] }`
   per field.
5. `submitForm` → `setSubmissionErrors` → each field's `submissionErrors.set([...])`.
6. `finally` → `submitting` false.
7. Back in `submit`: `rejected?.length` is truthy → `focusField(rejected[0])` → focus lands on the
   first rejected field, whose error is already rendered.
8. **Nothing is reset.** What the visitor typed is intact, so the rejection is correctable
   (`contact-form.spec.ts:303`). Editing the field clears its server error automatically via the
   `linkedSignal` (3.12), and a corrected form can be submitted again (`:323`).

The `readonly` fields deserve a note: a field locked during the send can still receive and show a
server error afterwards, because `readonly` only gates _writes_. Pinned by `:288`.

### 4.10 Error paths that name no field

| Situation                        | Where it is detected                      | Result                                | Visitor sees                                                         |
| -------------------------------- | ----------------------------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| No API origin                    | `http-contact-submitter.ts:71`            | `not-configured`, no request          | persistent `mail` toast, form untouched (`contact-form.spec.ts:245`) |
| Network down (`status === 0`)    | `send`'s `catch`                          | `failed`, logged as "unreachable"     | persistent `x` toast                                                 |
| 503 from the service             | `send`'s `catch`, single-string `message` | `failed`, no fields                   | persistent `x` toast                                                 |
| HTTP 200 without `success`       | `send` step 2-3                           | `failed`, logged with the body        | persistent `x` toast                                                 |
| Non-JSON error body              | `errorBodyOf` returns `{}`                | `failed`, no fields                   | persistent `x` toast                                                 |
| Transport **throws**             | `action`'s `catch`                        | `undefined` returned; no field marked | persistent `x` toast, form usable (`:256`)                           |
| `forbidNonWhitelisted` complaint | `rejectedFieldsOf` finds no match         | `failed`, no fields                   | persistent `x` toast                                                 |

In every row the visitor's content survives and the form stays usable. No path clears the form
except a confirmed success.

### 4.11 A locale change mid-session

`useDictionary` returns a `computed` over `intlayer.locale()`
(`angular-intlayer/dist/esm/client/useDictionary.mjs`). On a locale change:
labels, placeholders and hints re-render; `interestOptions`/`methodOptions` recompute, and because
`@for` tracks `option.value` the chip DOM nodes are reused, so **selection and focus survive**; and
any currently displayed validation message re-renders in the new language, because the message
thunks (2.2) re-read `this.content()` on each evaluation rather than having captured a string at
schema time. An open snack bar's action label follows too, because `action` is a `computed` (2.29).

---

## 5. State map — every piece of state and who writes it

| State                | Owner                          | Written by                                                                 | Read by                                           |
| -------------------- | ------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------- |
| `model`              | `contact-form.ts:125`          | `FormField` → `controlValue.set` (both control paths); `reset`             | the field tree; `submitter.submit(this.model())`  |
| `value` per field    | framework                      | as above                                                                   | validators, `descriptionLength`, the controls     |
| `touched` per field  | framework                      | `blur` (native), `registerOnTouched` (CVA), `markAsTouched` in `submit`    | `showError`, Material's error state               |
| `dirty` per field    | framework                      | `controlValueSignal` setter                                                | `reset`; nothing in this form reads it            |
| `errors` per field   | framework                      | the schema's validators + `setSubmissionErrors`                            | `fieldError`, `invalid()`, the `ng-invalid` class |
| `submissionErrors`   | framework (`linkedSignal`)     | `setSubmissionErrors`; **self-clears on value change**                     | `errors()`                                        |
| `readonly` per field | framework                      | `whileSending` predicate                                                   | the native `readonly` attribute                   |
| `submitting` (root)  | framework                      | `submit`'s `selfSubmitting` set/reset                                      | `submitting()`, `whileSending`                    |
| `rejected`           | `submit`'s scope               | the `action` closure                                                       | `submit` step 4                                   |
| `pending`            | `http-contact-submitter.ts:67` | `submit` + its `finally`                                                   | `submit`'s de-dup check                           |
| DOM focus            | browser                        | `focusField`, `focusFirstInvalid`, `heading().focus()`, `ChipSelect.focus` | —                                                 |
| `data-reveal`        | `Reveal`                       | `afterNextRender` + rAF                                                    | CSS                                               |
| `data-count`         | `descriptionCount`             | — (derived)                                                                | `contact-form.scss:123-133`                       |

Note what is absent: no `effect()`, no manual subscription, no `ngOnInit`, no `ngOnDestroy`, no
component-held copy of form state. Every derived value is a `computed`; every write originates in a
user event or the submission flow.

---

## 6. Call graph

```
submit(event)                                       contact-form.ts:209
├─ event.preventDefault()
├─ submitForm(form, {action, onInvalid})             _validation_errors-chunk.mjs:1835
│   ├─ [guard] submitting? → return false                             :1837
│   ├─ node.markAsTouched()                                           :1852
│   ├─ shouldRunAction(node)                                          :1854
│   ├─ valid ──▶ action()                            contact-form.ts:220
│   │            ├─ try submitter.submit(model())
│   │            │   └─ HttpContactSubmitter.submit  http-contact-submitter.ts:70
│   │            │       ├─ [!origin] → not-configured
│   │            │       ├─ [same key in flight] → join
│   │            │       └─ send()                                    :93
│   │            │           ├─ firstValueFrom(http.post)
│   │            │           ├─ success → sent
│   │            │           ├─ 200 w/o success → handleError + failed
│   │            │           └─ catch HttpErrorResponse
│   │            │               ├─ errorBodyOf(error.error)          :25
│   │            │               ├─ rejectedFieldsOf(body.message)    :47
│   │            │               │   └─ isFieldName                   :44
│   │            │               ├─ describe(body)                    :132
│   │            │               └─ handleError + failed[+fields]
│   │            ├─ catch → handleError + notify('failed') + undefined
│   │            ├─ [sent] form().reset({...DEFAULTS})                _v_e:1506
│   │            ├─ [sent] heading().focus()
│   │            ├─ notify(status)                   contact-form.ts:272
│   │            │   └─ snackBar.openFromComponent(SnackBar)
│   │            ├─ rejected = result.rejectedFields
│   │            └─ toFieldErrors(rejected)          contact-form.ts:246
│   ├─ errors ──▶ setSubmissionErrors(node, errors)  _v_e:1882
│   ├─ invalid ─▶ onInvalid()                        contact-form.ts:238
│   │              └─ focusFirstInvalid()                            :265
│   │                   └─ focusField(field)                         :261
│   └─ finally selfSubmitting(false)                 _v_e:1865
└─ [rejected?.length] focusField(rejected[0])        contact-form.ts:242
```

---

## 7. Design patterns actually present

| Pattern                                | Where                                                        | Note                                                                        |
| -------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| **Ports and Adapters**                 | `ContactSubmitter` (port) / `HttpContactSubmitter` (adapter) | The component depends on neither `HttpClient` nor a URL.                    |
| **Null Object**                        | `ContactSubmitter.submit` → `not-configured`                 | Safe default: never reports a false success.                                |
| **Composition root**                   | `provideContactForm()`                                       | One named seam; the adapter stays private to the folder.                    |
| **Declarative schema / specification** | the schema function                                          | All rules in one place, order-significant, locale-reactive.                 |
| **Strategy (injected)**                | `provideSignalFormsConfig({ classes })`                      | CSS-state policy supplied at the component, not hard-coded in the template. |
| **Adapter (presentational)**           | `chipOptions`                                                | i18n nodes → primitive props.                                               |
| **Facade**                             | `ChipSelect`                                                 | Hides Material's chip wiring _and_ corrects its single-select behaviour.    |
| **Guard / interceptor**                | `refuseDeselect` in the capture phase                        | Countering third-party behaviour without forking it.                        |
| **Type-safe enumeration**              | `*_VALUES as const` + derived unions                         | One source for the union, the runtime array and the contract test.          |
| **Honeypot**                           | `website` field + server-side discard                        | Client renders it hidden; server reports success regardless.                |

---

## 8. Contract alignment with the API

Field-by-field, client rule versus server rule.

| Field         | Client (`contact-form.ts`)                        | Server (`create-contact.dto.ts`)            | Aligned                                             |
| ------------- | ------------------------------------------------- | ------------------------------------------- | --------------------------------------------------- |
| `interest`    | `required`; union of 4                            | `@IsIn(INTEREST_VALUES)` — same 4           | yes                                                 |
| `name`        | `required`, `notBlank`, `maxLength(120)`          | `@trim() @MinLength(1) @MaxLength(120)`     | yes (via `notBlank`)                                |
| `email`       | `required`, `email`, `emailTld`, `maxLength(254)` | `@trimLower() @IsEmail() @MaxLength(254)`   | yes (via `emailTld`)                                |
| `company`     | `required`, `notBlank`, `maxLength(160)`          | `@trim() @MinLength(1) @MaxLength(160)`     | yes (via `notBlank`)                                |
| `service`     | `required`; union includes `''`                   | `@IsIn(SERVICE_VALUES)` — **excludes** `''` | yes: `required` forbids `''`, so `''` is never sent |
| `description` | `required`, `notBlank`, `maxLength(2000)`         | `@trim() @MinLength(1) @MaxLength(2000)`    | yes (via `notBlank`)                                |
| `timeline`    | union includes `''`; no rule                      | `@IsIn(TIMELINE_VALUES)` — includes `''`    | yes                                                 |
| `budget`      | union includes `''`; no rule                      | `@IsIn(BUDGET_VALUES)` — includes `''`      | yes                                                 |
| `method`      | union of 3; no rule (always defaulted)            | `@IsIn(METHOD_VALUES)` — same 3             | yes                                                 |
| `website`     | always `''`                                       | `@IsOptional() @trim() @IsString()`         | yes                                                 |

`forbidNonWhitelisted: true` means an extra property is a 400, so the payload must be **exactly**
these ten keys — which is why `ContactInquiry` is sent as-is with no spread of anything else, and why
`contact-contract.spec.ts:215` asserts the key set.

Client leniency never exceeds the server's on any field: a value the client accepts is a value the
server accepts. The reverse is intentionally not true — the client is stricter about trimming only in
the sense that it _predicts_ the server's trim, which is the point.

---

## 9. Test coverage of the behaviour described here

| File                              | Count | Covers                                                                                                                                                                                                                                     |
| --------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `contact-form.spec.ts`            | 30    | validity, messages, counter, submission (all four outcomes), server rejections (9 cases), validation parity, focusable-id contract, the in-flight lock and payload snapshot, the Material error-state equivalence, the Null Object default |
| `contact-contract.spec.ts`        | 15    | the five enumerations, derived unions, `''` placement, maximums, **predicate parity against the server's own `validator.isEmail`**, payload key set                                                                                        |
| `http-contact-submitter.spec.ts`  | 19    | URL, success, unsuccessful 200, unreachable, no origin, de-dup (3 cases), field extraction (5 cases), logging, non-JSON body                                                                                                               |
| `chip-select/chip-select.spec.ts` | 12    | rendering, labelling, both directions of binding, union safety, **the re-activation guard (click, keyboard, and a `keyCode`-only event)**, aria, navigation not swallowed, `focus()`                                                       |
| `contact.spec.ts`                 | 7     | page composition                                                                                                                                                                                                                           |
| `e2e/contact.spec.ts`             | 50    | the whole journey in Chromium, including the chip guard with a `pageerror` listener                                                                                                                                                        |

Whole repository, as executed for this document: **330 unit tests in 44 files**, `typecheck` exit 0,
`ng lint` "All files pass linting.", dependency-cruiser clean over 186 modules and 524 dependencies.

The distinction worth drawing: the contract spec pins **predicates**, not just data. Pinning the
enumerations and the maximums — which three earlier reviews did — cannot catch a trimming or TLD
divergence, because those live in functions rather than in values. Executing both sides' predicates
over a shared corpus is what caught them.

---

## 10. Cannot be determined from the source code

### 10.1 Still open

1. **What the production API origin is meant to be.** `environment.production.ts:5` sets
   `apiOrigin: ''`, so `API_ORIGIN` resolves to `''` and the deployed site takes the
   `not-configured` branch on the first line of `HttpContactSubmitter.submit` — it never issues a
   request. Whether that is a placeholder awaiting deployment or a deliberate hold cannot be read
   from source, and it is the one item here that needs a decision rather than a comment.
2. **Whether any inquiry has ever reached a live API.** Nothing in the repository records a real
   round trip; every verification is a unit test, a contract test, or an e2e test against a stub.
   The contract is pinned against the backend's _source_ and its own installed `validator`, which
   is as far as static evidence reaches.

### 10.2 Resolved — intent is now recorded in the source

The first draft of this document listed five further items as undeterminable because the behaviour
was clear but the _reasoning_ existed nowhere a reader could find it. That is a fixable condition,
and each has since been recorded at the place it applies:

| Was undeterminable                                                         | Now recorded as                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Whether the `readonly` asymmetry is deliberate                             | A comment at the `readonly` rules naming what is locked and why, plus `contact-form.spec.ts`, "locks the text fields during a send and keeps the payload it captured" — which asserts the asymmetry _and_ the reason it is safe |
| Why `submitForm`'s return value is discarded                               | A comment at the call site: the boolean cannot tell a delivered message from one that never left, so the outcome comes from `ContactSubmitResult` instead                                                                       |
| Whether `interest` and `method` are intentionally outside `CONTACT_FIELDS` | A doc comment on `ContactField` giving the admission rule — a field belongs only if the form can show an error for it and the visitor can act on it — and why each of the other five fails it                                   |
| Whether the `showError` ↔ Material equivalence is intentional              | A comment at `showError`, and `contact-form.spec.ts`, "decides a message is due exactly when Material decides to show one" (see 2.11)                                                                                           |
| Whether `SnackBarData.action` is intended for future use                   | Not an open question after all: it is a supported option of a **shared** component with its own test (`snack-bar.spec.ts`, "accepts a custom action label"). `ContactForm` simply has no second action to offer                 |

The distinction worth keeping: a comment cannot make an unknowable knowable, but four of these
five were never unknowable — only unwritten.

---

## 11. Summary

The form is a small hexagonal slice. `ContactForm` owns a `signal` model, one declarative schema,
five computeds and seven methods; it knows nothing about HTTP, URLs or the error-body shape. One
port (`ContactSubmitter`) with a Null-Object default keeps the unconfigured and untested paths
honest, and one adapter (`HttpContactSubmitter`) owns the transport, the retry de-duplication and the
whole taxonomy of failure.

Three decisions carry most of the weight, and each one is a case of reading what the framework
actually does rather than what the documentation suggests:

1. **The schema's rule order is the message-priority policy**, because `errors()` concatenates in
   registration order and appends submission errors last. `notBlank` and `emailTld` exist because
   `isEmpty` does not trim and `EMAIL_REGEXP` makes the TLD optional — divergences that only surface
   when both sides' predicates are executed against the same corpus.
2. **The submission orchestration leans on the framework's fixed sequence** — touch-all, validity
   gate, action, submission errors, `finally` — so the component needs no guard, no manual
   `touched` pass and no `finally` of its own. The one `try` it does have is narrow on purpose: wider,
   and a visitor could be told their delivered message had failed.
3. **`ChipSelect` counters Material rather than accommodating it.** A capture-phase guard keyed on
   Material's own `aria-selected` is the only one of four candidate fixes that does not either
   destroy the accessible selection state or race the value accessor — and the defect it prevents is
   a hard `TypeError`, five framework steps removed from the click that causes it. It also has to
   match Material's _own_ activation test, `keyCode` included, or it is weaker than the behaviour it
   counters: that gap was real, and closing it was the one defect this document's own writing found.

And one thing the document got wrong about itself, which is worth stating because it is the failure
mode a reference like this is most prone to: the first draft asserted that `ContactForm` runs with
eager change detection because it declares no `changeDetection`. The opposite is true in Angular 22,
and the repository already pinned the fact for every component in the application. Reading the
framework rather than recalling it is the method this document claims; the one place it was not
applied is the one place it was wrong.
