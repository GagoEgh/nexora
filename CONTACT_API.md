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

Two client behaviours worth knowing. A send already in flight is **coalesced**
(`HttpContactSubmitter.pending`), so one visitor cannot double-submit, and nothing retries
automatically — a retry is a deliberate second click after a visible failure.

Neither side deduplicates, and that is a recorded decision rather than an omission on either.
A retry carries no idempotency key, so a duplicate row needs the write to have succeeded _and_
its response to have been lost in transit _and_ the visitor to send again. The cost is one
extra row: the endpoint sends no mail and triggers nothing else, so there is no side effect to
replay. The API's README records the same conclusion under Known limitations. Do not restate
here that the API protects against duplicates — it deliberately does not.

## Switching the form on

Production currently ships `apiOrigin: ''`, because the API is written but **not deployed**.
Verified at the time of writing: `api.nexoratechnology.org` does not resolve, and
`https://nexoratechnology.org` answers every path — `/api/contact` included — from one static
placeholder, so a `POST` there returns `405`. An empty `apiOrigin` is read by
`HttpContactSubmitter` as `not-configured`: it issues **no request at all**. It does not fall
back to a relative URL, so nothing is posted into the void.

There are two topologies the API supports, and the client step differs between them.

### Its own origin (a subdomain)

1. Deploy the API and confirm `GET /api/health/live` returns JSON, not a page.
2. Add the site origin to the API's `CORS_ORIGINS` — this is a cross-origin request, so the
   preflight has to be allowed.
3. Point `connect-src` in `public/_headers` at that origin, or the CSP blocks the XHR.
4. Set `apiOrigin` in `src/environments/environment.production.ts`.
5. Submit one real inquiry and confirm a stored row.

### The same origin as the site (nginx proxies `/api/`)

This is the topology the API's README recommends, because it needs no second certificate, no
extra DNS record and no preflight. It requires the site and the API to sit behind one nginx,
with the `deploy/nginx/` snippet from that repository installed.

1. Install the proxy snippet, then **prove it answers before touching this repository**:
   `curl -i https://<site>/api/health/live` must return JSON from the API, and
   `curl -i -X POST https://<site>/api/contact -H "Content-Type: application/json" -d "{}"`
   must return `400` with a validation body. A `405`, or any `text/html`, means `/api/` is
   still being served by the site and the step is not done.
2. `CORS_ORIGINS` is not involved — same-origin requests send no preflight. Set it anyway if
   the API is also reachable on another origin.
3. `connect-src` already allows `self`, so `public/_headers` needs no change.
4. Set `apiOrigin` to the site origin, **and update the guard in `api-origin.spec.ts`** that
   currently forbids exactly that value (see below). Updating it is part of this step, not a
   workaround.
5. Submit one real inquiry and confirm a stored row.

### Why the guard forbids the site origin today

`api-origin.spec.ts` asserts the value is either empty or genuinely usable, so a typo fails the
build instead of quietly disabling the form. It also asserts the origin is not `siteOrigin`,
because that value is well-formed and resolves, so every other check waves it through — and
while no proxy is installed it posts `/api/contact` at the static host, turning every inquiry
into a `failed` notice where `not-configured` at least published an email address.

No unit test can tell whether the proxy is installed, so the assertion is a deliberate
tripwire rather than a permanent rule: with the same-origin topology genuinely deployed and
verified by step 1 above, relaxing it is the correct change.
