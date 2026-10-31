# Contact API contract

The inquiry form at `/contact` posts to a single endpoint. **No such endpoint is deployed**: the
production build ships an empty `apiOrigin`, so `HttpContactSubmitter` returns `not-configured`
and the form tells the visitor to email the published address instead. Nothing is sent, and no
inquiry is lost silently.

This document fixes the shape the client already sends so a backend can be built against it
without reading the component. The client side needs exactly one change to go live: set
`apiOrigin` in `src/environments/environment.production.ts`.

## Endpoint

```
POST {apiOrigin}/api/contact
Content-Type: application/json
```

`apiOrigin` must be an absolute `http(s)` URL, optionally with a path prefix, and carry no query
or fragment. Anything else is rejected at startup by `isUsableOrigin`
(`src/app/core/routing/api-origin.ts`) and treated as "not configured" rather than used, so a
malformed value cannot cause a POST to the static host.

## Request body

All ten fields are always present; optional ones are sent as `""` rather than omitted.

| Field         | Required | Max  | Values                                                                                                                       |
| ------------- | -------- | ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| `interest`    | yes      | —    | `new-project`, `dedicated-team`, `partnership`, `something-else`                                                             |
| `name`        | yes      | 120  | free text                                                                                                                    |
| `email`       | yes      | —    | free text, validated as an email address client-side                                                                         |
| `company`     | yes      | 160  | free text                                                                                                                    |
| `service`     | yes      | —    | `design-product`, `software-engineering`, `artificial-intelligence`, `infrastructure-operations`, `engineering-partnerships` |
| `description` | yes      | 2000 | free text                                                                                                                    |
| `timeline`    | no       | —    | `asap`, `1-3-months`, `3-6-months`, `planning`, or `""`                                                                      |
| `budget`      | no       | —    | `under-10k`, `10-25k`, `25-50k`, `50-100k`, `over-100k`, `unsure`, or `""`                                                   |
| `method`      | yes      | —    | `email`, `phone`, `video`                                                                                                    |
| `website`     | —        | —    | honeypot; see below                                                                                                          |

Client-side validation is a UX affordance, not a guarantee. **The endpoint must re-validate
every field**, including the maximum lengths, since the request can be replayed directly.

### `website` (honeypot)

Hidden from visitors and left empty by anyone filling the form in a browser. A non-empty value
indicates an automated submission. The endpoint should accept the request with a success
response and discard it, rather than returning an error that tells the sender it was detected.

## Response

```json
{ "success": true, "message": "Your message has been submitted." }
```

| Field     | Type      | Notes                                                               |
| --------- | --------- | ------------------------------------------------------------------- |
| `success` | `boolean` | The only field the client reads.                                    |
| `message` | `string`  | Optional; currently ignored, because the form shows localized copy. |

The client maps the outcome to three states, each with its own EN/HY/RU message:

| Outcome                                          | Status           |
| ------------------------------------------------ | ---------------- |
| `2xx` with `success: true`                       | `sent`           |
| `2xx` with `success: false`, or any `4xx`/`5xx`  | `failed`         |
| Transport failure (offline, DNS, CORS preflight) | `failed`         |
| `apiOrigin` empty or malformed                   | `not-configured` |

A rejected response and an unreachable host are deliberately the same visitor-facing state —
the next step is identical either way — but they are distinguished in the log, where a
transport failure reports `status === 0`.

**Return a non-`2xx` status for validation errors.** A `200` carrying `success: false` is
honoured, but the client cannot say which field was at fault, so the visitor only sees the
generic failure message.

## Requirements the client depends on

- **CORS.** The form is served from `https://nexoratechnology.org`; the endpoint must allow that
  origin for `POST` and for the `Content-Type: application/json` preflight. A missing CORS header
  is indistinguishable from an outage to the client and surfaces as `failed`.
- **Idempotency is not provided by the client.** A send in flight is coalesced, so one visitor
  cannot double-submit by clicking twice, but a retry after a failure is a second request with no
  deduplication key. Guard against duplicates server-side if that matters.
- **No authentication.** The client sends no credentials, token, or CSRF header. Rate limiting or
  a captcha would both need a client change.

## Outstanding backend work

1. Implement `POST /api/contact` with the contract above, including server-side re-validation.
2. Configure CORS for the site origin.
3. Add rate limiting; the honeypot is the only abuse control the client provides.
4. Deliver or store the inquiry, and decide on a retention period for the personal data in it
   (name, email, company) consistent with the published privacy policy.
5. Set `apiOrigin` in `src/environments/environment.production.ts` and redeploy.
