# Nexora — SEO tasks that cannot be completed from this repository

**Date:** 2026-11-06
**Scope:** every item in `SEO_IMPLEMENTATION_ROADMAP.md` that needs access this project does not
have. Each one states exactly what is required, who has to do it, and how to prove it worked.

Nothing in this document has been done. It is not a status report — it is the hand-off list. The
items that _were_ implemented are in `SEO_IMPLEMENTATION_REPORT.md`.

---

## Summary

| #   | Task                                             | Blocked on                            | Priority | Repo-side work    |
| --- | ------------------------------------------------ | ------------------------------------- | -------- | ----------------- |
| M1  | Install the committed nginx configuration        | SSH/root on the web host              | **P0**   | Complete          |
| M2  | Install `ngx_brotli`                             | Package install on the host           | P3       | Complete          |
| M3  | TLS SAN must cover `www`                         | Certificate issuance                  | P1       | Complete          |
| M4  | Google Search Console                            | A Google account + DNS or file access | P1       | Not needed        |
| M5  | Bing Webmaster Tools                             | A Microsoft account                   | P1       | Not needed        |
| M6  | Service landing-page content                     | Editorial capacity, EN/HY/RU          | P2       | Scaffolding ready |
| M7  | `sameAs` / `telephone` / `address` in the schema | Facts that do not exist yet           | P2       | One-line change   |
| M8  | Field Core Web Vitals confirmation               | 28 days of CrUX data after M1         | P2       | Complete          |

---

## M1 — Install the committed nginx configuration (P0)

**Why this is first.** Every serving-layer finding in the audit is already fixed in
`deploy/nginx/`, and none of those fixes are in force. Measured against
`https://nexoratechnology.org` on 2026-11-06, `npm run verify:live-seo` reports **28 failures**:

```
23 × 301 to a trailing-slash variant, on 23 of the 24 sitemap URLs
 3 × soft 404: an unknown URL answers 200, in English regardless of locale prefix, with no noindex
 1 × https://www.nexoratechnology.org/ answers 200 — the whole site at a second hostname
 1 × hashed assets send Cache-Control twice, max-age=2592000, not immutable
```

The same run also confirms the audit's header finding: no `Content-Security-Policy`,
`Permissions-Policy` or `Cross-Origin-Opener-Policy` in the live response.

**What is required.** Shell access to the host serving `nexoratechnology.org`, with permission to
write `/etc/nginx/` and reload nginx.

**Exact steps.** The full sequence is in `README.md` under _Hosting → Deploying it_. Condensed:

```sh
# locally
npm ci && npm run build
npm run verify:prerender && npm run verify:seo && npm run verify:headers && npm run verify:bundle

# on the host
cp deploy/nginx/nexora-headers.conf /etc/nginx/snippets/
cp deploy/nginx/nexora-site.conf    /etc/nginx/sites-available/nexora
ln -s /etc/nginx/sites-available/nexora /etc/nginx/sites-enabled/nexora
nginx -t                      # MUST pass before the reload — see the warning below
systemctl reload nginx
rsync -a --delete dist/nexora/browser/ /srv/nexora/

# locally again
npm run verify:live-seo -- https://nexoratechnology.org
```

> **`nginx -t` has never been run against these files.** nginx is not installed in the
> environment they were written in, and no container runtime was available there either, so the
> configuration is unverified syntax. Run `nginx -t` and read its output before `systemctl
reload`. A reload with a bad config leaves the old one running, but `nginx -s reload` on some
> builds does not — do not skip the test.

**Proof of success.** `npm run verify:live-seo -- https://nexoratechnology.org` exits 0 and
prints `24 sitemap URLs served directly with matching canonicals, 3 localized 404s, www
redirected, assets immutable for a year.` Anything less than exit 0 is not done.

**Rollback.** `rm /etc/nginx/sites-enabled/nexora`, restore the previous symlink, `nginx -t &&
systemctl reload nginx`. Capture the current config first: `nginx -T > /root/nginx-before.conf`.

---

## M2 — Install `ngx_brotli` (P3)

**Why.** Text responses are gzip-only. Brotli typically saves a further 15–20% on HTML, CSS and
JS. No figure is claimed here for this site — it has not been measured, because the module is
not installed.

**What is required.** A package install on the host.

```sh
apt-get install libnginx-mod-brotli          # Debian/Ubuntu
cp deploy/nginx/nexora-brotli.conf /etc/nginx/snippets/
nginx -t && systemctl reload nginx
```

`nexora-site.conf` already includes it, through a **wildcard** include
(`include snippets/nexora-brotli*.conf;`). That is deliberate: a literal include of a missing
file is a fatal nginx error, a wildcard that matches nothing is not. So M1 can be done before M2
without the site refusing to start.

**Proof of success.**

```sh
curl -sS -H 'Accept-Encoding: br' -o /dev/null -D - https://nexoratechnology.org/ | grep -i content-encoding
# expect: content-encoding: br
```

---

## M3 — The TLS certificate must cover `www` (P1)

**Why.** `nexora-site.conf` now has a dedicated `server` block on 443 for
`www.nexoratechnology.org` that returns `301` to the apex. TLS is negotiated **before** the
redirect is sent, so if the certificate has no `www` SAN the browser shows a certificate error
instead of following the redirect — strictly worse than today's duplicate-content problem.

**What is required.** Check the SAN list, and reissue if `www` is absent.

```sh
echo | openssl s_client -connect www.nexoratechnology.org:443 -servername www.nexoratechnology.org 2>/dev/null \
  | openssl x509 -noout -text | grep -A1 'Subject Alternative Name'

# if www is missing:
certbot --nginx -d nexoratechnology.org -d www.nexoratechnology.org
```

**Do this before M1's reload, not after.** CANNOT DETERMINE from here whether the current
certificate already covers `www`: the live `www` host answers on 443 today, which suggests it
does, but a TLS handshake succeeding through a shared `server_name` is not proof of the SAN list.
Check it.

**Proof of success.** `curl -sSI https://www.nexoratechnology.org/services` returns `301` with
`Location: https://nexoratechnology.org/services`, and no TLS warning. Then confirm the apex did
not become a loop: `curl -sSI https://nexoratechnology.org/services` returns `200`.

---

## M4 — Google Search Console (P1)

**Why.** Everything in the audit about Google's actual behaviour toward this site is marked
`CANNOT DETERMINE`, and will stay that way. Indexing status, coverage errors, the hreflang
cluster's health, which queries the site appears for, and field Core Web Vitals are all only
observable from inside Search Console. No external tool substitutes for it, and no inference
from HTTP responses does either.

**What is required.** A Google account, and one of: DNS TXT record access (preferred — verifies
the whole domain including `www` and any subdomain), or the ability to publish a file at the
site root, or the ability to add a `<meta name="google-site-verification">` tag.

**Steps.**

1. Add the property at <https://search.google.com/search-console> as a **Domain** property
   (`nexoratechnology.org`), not a URL-prefix property. A Domain property covers `http`, `https`,
   the apex and every subdomain in one place, which matters because `www` exists.
2. Verify with the DNS TXT record it gives you.
3. Submit `https://nexoratechnology.org/sitemap.xml`. `public/robots.txt` already advertises it,
   but submission is what triggers the first read.
4. **Do M1 first.** Submitting a sitemap whose 24 URLs all `301` elsewhere invites Google to
   record 23 redirect warnings and canonicalise to URLs the site itself does not declare.

If the meta-tag method is used instead of DNS, the tag belongs in `src/index.html` beside the
other static head entries — not in `document-meta.ts`, which writes per-route tags. Note that it
then needs a rebuild and redeploy, and the CSP is unaffected (a meta tag is not a script).

**Proof of success.** The property shows as verified, and **Pages → Indexing** reports a figure.
Record whatever it says, including zero. Do not treat a verified property as evidence of
indexing: those are different facts.

**Expected wait.** Verification is immediate. Meaningful coverage and Core Web Vitals data take
days to weeks; field CWV needs 28 days of traffic.

---

## M5 — Bing Webmaster Tools (P1)

**Why.** Bing powers Bing, Yahoo, DuckDuckGo and Copilot. Its JavaScript rendering is
independently documented as less reliable than Google's, which matters less for this site than
it would for most — all 27 pages are prerendered, so a crawler that executes no JavaScript still
receives complete HTML (`npm run verify:prerender` asserts exactly that). Registration is still
the only way to see Bing's own view.

**What is required.** A Microsoft account.

**Steps.** Add the site at <https://www.bing.com/webmasters>, then use **Import from Google
Search Console** if M4 is done — it carries the verification across and saves a second DNS
record. Otherwise verify by DNS TXT. Submit the same sitemap URL.

**Proof of success.** The site is listed and the sitemap shows as processed with 24 URLs
discovered.

---

## M6 — Service landing-page content (P2)

**Why.** `src/app/shared/services-catalogue/services-catalogue.content.ts` defines 15 services.
One has a page. The other 14 exist as cards on `/services` and as `?category=` filters, which
correctly canonicalise to `/services` — correct behaviour, but it means one page is competing for
15 distinct commercial intents.

**This is the largest opportunity in the audit and the one thing here that is not engineering.**

**What is required.** Original EN / HY / RU copy per page: scope, process, stack, trade-offs,
engagement examples. Not machine translation — the existing localisation quality is high and a
drop would be visible on the page.

**Deliberately not done.** Generating 14 thin pages across three locales would produce 42
documents of near-duplicate content. That is a known quality risk and would make the site worse,
so no such pages were created and none are scaffolded. This is a decision, not an omission.

**Engineering per page, once the copy exists** — roughly an hour, no refactor:

1. Add the page key to `DOCUMENT_META_PAGES` (`src/app/core/seo/document-meta.ts:19`).
2. Add `title` and `description` to `src/app/core/seo/document-meta.content.ts`, and a
   `breadcrumbs` entry for the new segment.
3. Add the route with `data: { meta: '<key>' }` in `src/app/app.routes.ts`.
4. Add the 3 URLs to `public/sitemap.xml` — `src/app/core/seo/sitemap.spec.ts` fails until you do.
5. Link it from `/services` with a real `<a href>`, reachable in one click.
6. **Use hyphens** in the segment (`/services/web-development`), not the underscore of the
   existing `ai_agent`. That underscore is a legacy URL and should not set the pattern.

`app.routes.server.ts` prerenders all three locales with no further change, and
`npm run verify:seo` then enforces the whole metadata contract on the new documents
automatically — unique title, canonical, hreflang set, JSON-LD, sitemap membership.

**Suggested order**, by commercial intent on the project's own service list: Custom Software
Development, Dedicated Development Teams, Web Development, Mobile App Development, Backend & API
Development. **Three excellent pages beat eight thin ones.**

**Proof of success per page.** Prerendered in all three locales, `npm run verify:seo` passes,
and the page survives a content review by someone who would be willing to sign their name to it.
**No traffic or ranking figure is forecast here** — none could be substantiated.

---

## M7 — `sameAs`, `telephone`, `address` in the Organization schema (P2)

**Why.** These are the fields Google uses to connect an organisation to its other online
identities and its physical presence. They are **absent from the JSON-LD on purpose.**

A grep across `src/` found no social profile URL, no phone number and no postal address anywhere
on this site. There was therefore no value to put in those fields that would not have been
invented, and inventing structured data is worse than omitting it — it is a factual claim about
the business, published in machine-readable form.

**What is required.** The facts, from whoever owns them:

- `sameAs`: the URLs of profiles Nexora actually controls — LinkedIn company page, GitHub
  organisation, X, Crunchbase. Only ones that exist and are live.
- `telephone`: a number that is answered, in E.164 form (`+374...`).
- `address`: a real `PostalAddress`. Only if there is a real office; a registered agent's
  address is not a business location and should not be published as one.

**Then.** Add them to `ORGANIZATION` in `src/app/core/seo/organization.ts` and spread them into
the `Organization` node in `document-meta.ts:182`. Remove the comment at `:177-181` that explains
their absence. Extend `document-meta.spec.ts` to assert the new fields, and add the same
assertion to `scripts/verify-seo.mjs` so the build catches a regression.

**Proof of success.** The Rich Results Test (<https://search.google.com/test/rich-results>) on
`https://nexoratechnology.org/` reports the Organization with no warnings about the new fields.

---

## M8 — Field Core Web Vitals confirmation (P2)

**Why.** The homepage layout shift found in the audit (CLS 0.0892 on `/`) was diagnosed,
attributed and fixed, and the fix is verified **in the lab only**: headless Chromium, 1366×900,
cold cache, with the web fonts deliberately delayed. On the fixed build the shift's source —
`div.hero__copy` reflowing 505px → 549px — is gone, and `/` measures 0.0002.

Lab CLS is not field CLS. Real visitors have other viewports, other fallback fonts and other
connections, and nothing measured locally can stand in for that.

**What is required.** M1 (so the fix is actually deployed), then M4, then 28 days of traffic for
CrUX to accumulate.

**Proof of success.** Search Console → **Core Web Vitals** → Desktop shows CLS in the good band
for the URL group containing `/`, with headroom rather than the 0.011 of margin the lab reading
had before the fix.

**Also worth re-measuring then:** `/hy` still shows a lab CLS of 0.0085 from the Armenian hero
illustration settling 14px. It is 12× under the 0.1 threshold and was not touched — it is noted
here so it is not mistaken for a new regression later.
