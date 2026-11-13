# The contact API, and switching the form on

The contact form is the only conversion path on this site. It is built, translated and tested,
and it is deliberately **not sending** in production: `src/environments/environment.production.ts`
ships `apiOrigin: ''`.

This file is what `src/app/core/routing/api-origin.spec.ts` and the API repository's README
point at. It covers what the empty origin means, what the form does today, and the order the
switch has to happen in.

## What the empty origin does

`API_ORIGIN` (`src/app/core/routing/api-origin.ts`) resolves `environment.apiOrigin` through
`isUsableOrigin()` and collapses anything unusable - including the empty string - to `''`.
`HttpContactSubmitter.submit()` reads that and returns `{ status: 'not-configured' }` without
making a request.

The visitor sees a snack bar in their own language, from `contact-form.content.ts`:

> Sending isn't available yet. Please use the contact details listed beside this form.

That is the point of the state. The form validates, focuses the first invalid field and says
plainly that it cannot send, next to a published email address and phone number that can. It is
a worse outcome than a working form and a much better one than a form that appears to send and
quietly drops the inquiry.

## Which topology

The API repository recommends serving the API from **this site's own origin**, behind an nginx
`/api/` proxy: no CORS preflight, no second certificate, no extra DNS record. The front end
supports either shape; the difference is three lines of configuration.

|                               | same origin, proxied                                 | separate API host                  |
| ----------------------------- | ---------------------------------------------------- | ---------------------------------- |
| `apiOrigin`                   | `https://nexoratechnology.org`                       | `https://api.nexoratechnology.org` |
| `connect-src`                 | add the site origin alongside `'self'`               | add the API origin                 |
| nginx                         | `nexora-api-proxy.conf` in the site's `server` block | nothing on this side               |
| backend `CORS_ORIGINS`        | the site origin                                      | the site origin                    |
| guard in `api-origin.spec.ts` | has to be relaxed - see below                        | passes unchanged                   |

## The guards, and why they exist

Three checks fail the build rather than let a half-finished switch reach production. None of
them is bureaucracy; each one names a failure that is invisible from the outside.

- **`api-origin.spec.ts`, "ships an API origin that is either absent or actually usable".**
  `API_ORIGIN` collapses an unusable value to `''`, and `''` reads as `not-configured`. A typo
  in a deployed origin therefore produces a page that looks like it is working and never sends
  anything: no console error, no failed request, nothing to alert on.
- **`api-origin.spec.ts`, "never points the API at the static site that serves this bundle".**
  The one unusable value every other check waves through. `siteOrigin` is a well-formed https
  origin, so the submitter treats it as configured and posts `/api/contact` at the host serving
  this bundle - which, with no proxy installed, answers `405` or HTML. Every inquiry becomes
  `failed`, which is worse than `not-configured`: that at least gives the visitor an address.
  **In the same-origin topology this value is correct**, so this is the assertion the switch
  deliberately relaxes - after, not before, the curl checks below pass.
- **`scripts/verify-headers.mjs`.** The form posts with XHR, so an API origin that CSP does not
  list is a blocked request - the same visitor-facing failure as no API at all, for a reason
  nothing logs. `verify:headers` fails when `apiOrigin` is non-empty and `connect-src` does not
  name it. Note that a literal origin is required even when it equals the site's own: `'self'`
  does not satisfy this check.

## Switching the form on

Do these in order. Steps 1-3 are in the API repository (`~/Desktop/Nexora-back`), 4-7 here.

1. Deploy the API and give it `CORS_ORIGINS=https://nexoratechnology.org`, `HOST=127.0.0.1` and
   `TRUST_PROXY_HOPS=1`. See that repository's README, "Behind nginx on the same origin".
2. Install `deploy/nginx/nexora-api-ratelimit.conf` (at `http` level) and
   `deploy/nginx/nexora-api-proxy.conf` (included inside this site's `server` block in
   `deploy/nginx/nexora-site.conf`), then `nginx -t && systemctl reload nginx`.
3. **Prove the proxy is in front of the API before touching anything here.** Until the snippet
   is installed, the site's `location /` answers `/api/` itself, and a static host answers a GET
   with a page and a POST with `405` - both of which the client reads as a failed submission
   rather than a missing route.

   ```bash
   # Must be JSON from the API, not HTML from the site.
   curl -i https://nexoratechnology.org/api/health/live

   # Must be 400 with a validation body. A 405, or any text/html, means /api/ is not proxied.
   curl -i -X POST https://nexoratechnology.org/api/contact \
     -H "Content-Type: application/json" -d "{}"
   ```

4. Set the origin in `src/environments/environment.production.ts`:

   ```ts
   apiOrigin: 'https://nexoratechnology.org',
   ```

5. Add that origin to `connect-src` in `public/_headers`, then regenerate the nginx snippet:

   ```bash
   npm run build
   npm run verify:headers -- --write
   ```

   `deploy/nginx/nexora-headers.conf` is generated from `public/_headers`; `verify:headers`
   fails when the two disagree, so this step is not optional.

6. Relax the same-origin tripwire in `src/app/core/routing/api-origin.spec.ts` - the test named
   "never points the API at the static site that serves this bundle". Replace the assertion
   with one that records what is now true, rather than deleting it: the origin may equal
   `siteOrigin` **because** `/api/` is proxied, and that fact belongs in the test.

7. Run the gates and submit a real inquiry:

   ```bash
   npm run lint && npm run typecheck && npm test
   npm run build && npm run verify:seo && npm run verify:headers && npm run verify:prerender
   ```

   Then send one from the deployed page and confirm it lands in the database. The snack bar
   should read "Thanks — your inquiry is on its way.", not the not-configured notice.

## If it goes wrong

Set `apiOrigin` back to `''` and redeploy. The form returns to the published-contact-details
notice, which is a safe state rather than a broken one, and nothing else on the site depends on
the API.
