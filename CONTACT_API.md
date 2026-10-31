# Contact API — client side

The inquiry form at `/contact` posts to one endpoint, implemented by the **`Nexora-back`**
project (NestJS). That repository's `README.md` is the **single source of truth** for the
request schema, the response shapes and the operational requirements. This file covers only
what belongs to this application: how an outcome becomes something the visitor sees, and how
to switch the form on.

It used to restate the whole schema. That duplication had already drifted once, so it is gone
deliberately — do not reintroduce it here.

## Agreement is enforced by tests, not by prose

Both sides assert the same field names, option values and length limits:

| Side     | File                                                          |
| -------- | ------------------------------------------------------------- |
| This app | `src/app/pages/contact/contact-form/contact-contract.spec.ts` |
| The API  | `src/modules/contact/dto/create-contact.dto.spec.ts`          |

The API validates with `whitelist: true` and `forbidNonWhitelisted: true`, so drift does not
degrade gracefully — one unexpected field makes the API answer `400` for _every_ submission.
The test above asserts the payload carries **exactly** its ten fields, so adding one fails a
build here rather than silently breaking production.

## Endpoint

```
POST {apiOrigin}/api/contact
Content-Type: application/json
```

`apiOrigin` comes from `src/environments/`. It must be an absolute `http(s)` URL with a host and
no query or fragment; `isUsableOrigin` (`src/app/core/routing/api-origin.ts`) rejects anything
else and treats it as unset, so a malformed value cannot cause a POST to the static host.

## How an outcome reaches the visitor

`HttpContactSubmitter` reduces every outcome to three states, each with its own EN/HY/RU copy:

| Outcome                                         | Status           | What the visitor sees                                          |
| ----------------------------------------------- | ---------------- | -------------------------------------------------------------- |
| `2xx` with `success: true`                      | `sent`           | Success notice; the form resets and focus moves to the heading |
| `2xx` with `success: false`, or any `4xx`/`5xx` | `failed`         | Failure notice; **their input is preserved** so they can retry |
| Transport failure (offline, DNS, CORS)          | `failed`         | The same failure notice                                        |
| `apiOrigin` unset or malformed                  | `not-configured` | A notice pointing at the published email address               |

A rejected response and an unreachable host are deliberately one visitor-facing state — the next
step is identical either way — but they are separated in the log, where a transport failure
reports `status === 0`.

Two client behaviours worth knowing: a send already in flight is **coalesced**, so one visitor
cannot double-submit; and a retry after a failure is a fresh request with no deduplication key,
so duplicate protection across retries is the API's concern.

## Switching the form on

Production currently ships `apiOrigin: ''`, because the API is written but **not deployed** —
`api.nexoratechnology.org` does not resolve. The form therefore reports `not-configured` rather
than posting into the void.

1. Deploy the API and confirm `GET /api/health` returns `200` with `"database":"up"`.
2. Add the site origin to the API's `CORS_ORIGINS`.
3. Set `apiOrigin` in `src/environments/environment.production.ts`.
4. Submit one real inquiry and confirm a stored row.

Step 3 is the only client change required. `api-origin.spec.ts` asserts the value is either
empty or genuinely usable, so a typo fails the build instead of quietly disabling the form.
