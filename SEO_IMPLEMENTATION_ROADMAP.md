# Nexora — SEO Implementation Roadmap

**Derived from:** `SEO_TECHNICAL_AUDIT.md` (2026-11-06) · **Route evidence:** `SEO_PAGE_AUDIT.md`
**Status:** implemented on 2026-11-06, except for what needs access this project does not have.
**Results and evidence:** `SEO_IMPLEMENTATION_REPORT.md`. **Hand-off list:** `SEO_MANUAL_TASKS.md`.

> The nine numbered sections under each item below are the **original proposal text**, left
> unedited so the reasoning can be checked against what was actually built. Where
> implementation diverged from the proposal, the report says so and why. Two did diverge:
> R3's build-level assertion went into a new `verify-seo.mjs` rather than into
> `verify-prerender.mjs`, and R9's cause turned out to be neither of the two hypotheses this
> document offered.

## Status

| #   | Item                                        | P   | State                                     | Evidence                                                                                       |
| --- | ------------------------------------------- | --- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| R1  | Deploy the committed nginx configuration    | P0  | **Blocked** - no host access              | `SEO_MANUAL_TASKS.md` M1                                                                       |
| R2  | Prove the trailing-slash convention         | P0  | **Done**                                  | `scripts/verify-live-seo.mjs`, 19 unit tests; run against production, reports the 23 redirects |
| R3  | Mark the not-found routes `noindex`         | P1  | **Done**                                  | 3 of 27 documents carry `noindex, follow`; unit test covers navigating away                    |
| R4  | Redirect `www` to the apex                  | P1  | **Done in repo**, needs M1 + M3           | dedicated 443 `server` block in `deploy/nginx/nexora-site.conf`                                |
| R5  | Google Search Console                       | P1  | **Blocked** - needs an account + DNS      | `SEO_MANUAL_TASKS.md` M4                                                                       |
| R6  | Bing Webmaster Tools                        | P1  | **Blocked** - needs an account            | `SEO_MANUAL_TASKS.md` M5                                                                       |
| R7  | Guard the SEO contract at build time        | P2  | **Done**                                  | `scripts/verify-seo.mjs`, 31 unit tests, wired into CI, proven to fail on a corrupted build    |
| R8  | Enrich the Organization schema, raster logo | P2  | **Done**; `sameAs`/`address` omitted      | `WebPage` node + `contactPoint`; `public/brand/logo.png` 512x512. `SEO_MANUAL_TASKS.md` M7     |
| R9  | Diagnose the EN homepage layout shift       | P2  | **Done** - attributed and fixed           | CLS on `/` 0.0892 -> 0.0002 in the lab; field confirmation needs M1 + M4                       |
| R10 | Plan dedicated service landing pages        | P2  | **Not done, deliberately** - content work | `SEO_MANUAL_TASKS.md` M6                                                                       |
| R11 | Lengthen the four short descriptions        | P3  | **Done**                                  | shortest indexable description 99 -> 133 chars                                                 |
| R12 | Explicit Twitter Card fields                | P3  | **Done**                                  | all three fields on 27 of 27 documents                                                         |
| R13 | Serving-layer polish                        | P3  | **Done in repo**, needs M1 + M2           | `charset utf-8`, single immutable `Cache-Control`, optional brotli snippet                     |
| R14 | Document the deployment story               | P3  | **Done**                                  | `README.md` Hosting section, rewritten against measured facts                                  |

## Priority definitions

- **P0 — Critical:** prevents correct crawling, indexing or production discovery.
- **P1 — High:** significant SEO or technical deficiency.
- **P2 — Medium:** real improvement to search visibility or quality.
- **P3 — Low:** optional optimization.

## Mandatory vs optional

| Mandatory (these are defects) | Optional (these are improvements)   |
| ----------------------------- | ----------------------------------- |
| R1, R2, R3, R4, R5, R6        | R7, R8, R9, R10, R11, R12, R13, R14 |

**R1 alone resolves four findings.** Sequence R1 → R2 before anything else; most of the remaining work is cheap once the serving layer is correct.

---

# P0 — Critical

## R1. Deploy the committed nginx configuration

**1. Problem.** The nginx configuration running in production is not the one in this repository. Four findings follow from that: unknown URLs return `200` with the English homepage, every page URL 301-redirects to a trailing-slash variant, three security headers are missing, and `/_headers` / `/_redirects` are publicly readable.

**2. Evidence.** Five independent production observations, each contradicting the committed config:

| Observed in production                                                                  | Committed config says                                                           |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `curl -I /definitely-not-a-page` → `HTTP/1.1 200 OK`, body = EN homepage                | `error_page 404 /not-found/index.html` (`deploy/nginx/nexora-site.conf:84`)     |
| `curl -I /services` → `301` → `/services/`                                              | `try_files $uri $uri/index.html $uri/ =404` (`:85`) serves `/services` directly |
| No `Content-Security-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` header | `nexora-headers.conf:9,14,15` emit all three                                    |
| `X-Frame-Options: SAMEORIGIN`                                                           | `add_header X-Frame-Options "DENY"` (`nexora-headers.conf:12`)                  |
| `curl -o /dev/null -w '%{http_code}' /_headers` → `200`                                 | `location ~ ^/_(headers\|redirects)$ { return 404; }` (`:47-49`)                |

**3. Why it matters.** The unbounded `200` URL space means every mistyped link, stale backlink and crawler-invented path becomes a duplicate of the homepage; crawl budget is spent on an infinite set and Search Console will fill with soft-404 / duplicate reports. The trailing-slash redirect puts every canonical, every hreflang target, every sitemap entry and every internal link one 301 away from the page that declares it — a canonical conflict on every URL and double crawl cost on the whole link graph. The missing CSP removes the protection the repository already paid for.

**4. Recommended solution.** Install the committed configuration as documented in its own header (`deploy/nginx/nexora-site.conf:15-19`):

```
cp deploy/nginx/nexora-headers.conf /etc/nginx/snippets/nexora-headers.conf
cp deploy/nginx/nexora-site.conf    /etc/nginx/sites-available/nexora
ln -s /etc/nginx/sites-available/nexora /etc/nginx/sites-enabled/nexora
nginx -t && systemctl reload nginx
```

Before reloading, confirm two things about the live host: that `root` matches where the build is published (the config assumes `/srv/nexora`), and that the TLS certificate paths in the commented `ssl_certificate` lines (`:29-30`) match what the host actually uses. **Do not** reload without `nginx -t` passing.

If installing the whole file is not acceptable, the minimum equivalent change to the live config is to put `$uri/index.html` ahead of `$uri/` in `try_files`, add the three `error_page 404` directives, include the generated header snippet at **server** level, and add the `/_headers` `/_redirects` 404 location.

**5. Files likely to change.** None in the application. Server-side only: `/etc/nginx/sites-available/nexora`, `/etc/nginx/snippets/nexora-headers.conf`. Optionally add a `www` redirect block here at the same time (R4).

**6. Implementation complexity.** Low — the file already exists and is generated/verified by `npm run verify:headers`. The work is deployment access and a careful `root`/TLS check.

**7. Regression risk.** **Medium-high, and it is the real cost of this item.** Three specific risks:

- **CSP becomes enforced for the first time in production.** The policy is hash-pinned to inline scripts produced by a specific build. The hashes in `public/_headers:33` correspond to the build in this repository; **the live deployment is a different build** (`main-ALQZCQG6.js` live vs `main-HFYH2X7O.js` locally). Deploying the header set against a mismatched build will block hydration. **Deploy a fresh build and the matching headers together, in one step** — never the headers alone.
- A wrong `root` turns the whole site into 404s.
- `add_header` in any nested location discards the inherited set — the config warns about this at `:37-41`. Do not add one without repeating the include.

**8. Verification procedure.**

```
nginx -t
curl -sSI https://nexoratechnology.org/services            # expect 200, no Location
curl -sSI https://nexoratechnology.org/definitely-not-real # expect 404
curl -sS   https://nexoratechnology.org/hy/definitely-not-real | grep -o '<html lang="[a-z]*"'  # expect hy
curl -sSI https://nexoratechnology.org/ | grep -i content-security-policy   # expect present
curl -sSI https://nexoratechnology.org/ | grep -i x-frame-options           # expect DENY
curl -so /dev/null -w '%{http_code}\n' https://nexoratechnology.org/_headers # expect 404
```

Then load the site in a browser with DevTools open and confirm **zero CSP violations** and that interactive elements (the contact form, the language switcher) still work — that is the hydration check.

**9. Expected result.** Unknown URLs return a localized `404`. Every page URL resolves `200` with no redirect, so canonical, hreflang, sitemap and internal links all point at non-redirecting URLs. Security headers present. Config files no longer readable.

---

## R2. Make the trailing-slash convention consistent, and prove it

**1. Problem.** Even after R1, nothing in the codebase _asserts_ that `/services` serves `200` rather than redirecting. The convention — no trailing slash, everywhere — is currently implicit.

**2. Evidence.** The application declares the non-slash form in five places (`document-meta.ts:125,132,137,139`, `public/sitemap.xml`, and all internal `routerLink`s), but no test checks the served form. The defect in R1 went unnoticed precisely because nothing looked.

**3. Why it matters.** This is the finding most likely to silently return. A future nginx edit, a host migration, or a CDN with "add trailing slash" enabled would reintroduce it, and no CI job would notice.

**4. Recommended solution.** Write down the convention and add a post-deploy assertion. Add to `scripts/` a small production smoke check (runnable against any origin) that asserts, for each of the 24 sitemap URLs: status is `200`, there is no `Location` header, and the document's `<link rel="canonical">` equals the requested URL exactly. Run it in CI after deploy, and keep it in `SEO_VERIFICATION_CHECKLIST.md` as a manual step.

**5. Files likely to change.** New: `scripts/verify-live-seo.mjs` (+ a `.test.mjs` beside it, matching the convention of the four existing verify scripts). `package.json` — add a script entry. A comment in `deploy/nginx/nexora-site.conf` stating the convention explicitly.

**6. Implementation complexity.** Low. ~80 lines, no new dependencies; the sitemap already enumerates the URL set.

**7. Regression risk.** None — it is additive and read-only.

**8. Verification procedure.** Run it against production before R1 (it must fail, reporting 24 redirects), and again after (it must pass). A check that cannot fail is not a check.

**9. Expected result.** The canonical ↔ served-URL agreement becomes a mechanically enforced property rather than an assumption.

---

# P1 — High

## R3. Mark the not-found routes `noindex`

**1. Problem.** `/not-found`, `/hy/not-found` and `/ru/not-found` are prerendered, self-canonical, carry a full hreflang set and have no `robots` directive. They are indexable.

**2. Evidence.** Harvest of all 27 built documents: `robots` meta present in **0**. VERIFIED (production): `curl https://nexoratechnology.org/not-found/` → `<title>Page not found | Nexora</title>`, `<link rel="canonical" href="https://nexoratechnology.org/not-found">`, status `200`. No `X-Robots-Tag` is sent either.

**3. Why it matters.** A "Page not found" page in the index is a poor search result that can outrank nothing and reflects badly on the brand. It also competes for the crawler's attention with real pages. Sitemap exclusion is already correct but is not a directive.

**4. Recommended solution.** In `document-meta.ts`, inside the existing `effect`, emit `<meta name="robots" content="noindex, follow">` when `current.page === 'not-found'` and remove it otherwise. `follow` is deliberate: links out of the 404 should still be crawled. Use `meta.updateTag` / `meta.removeTag` so a client-side navigation away from the 404 clears it — the existing idempotent-write pattern (`:77-91`) is the model.

Consider also dropping canonical and hreflang on this page. A 404 has no meaningful alternates, and `x-default` pointing at `/not-found` is not useful. This is a judgement call; `noindex` alone is sufficient.

**5. Files likely to change.** `src/app/core/seo/document-meta.ts` (the effect, around `:118-141`). Test: `src/app/core/seo/document-meta.spec.ts`.

**6. Implementation complexity.** Low — a few lines inside logic that already exists.

**7. Regression risk.** **Low, but one trap:** the tag must be _removed_ when navigating away, or a client-side route change from the 404 to a real page would leave `noindex` on an indexable page. Prerendering is unaffected (each document is rendered fresh), so the risk is browser-only — but it is real, and the test must cover the navigation-away case, not just the 404 itself.

**8. Verification procedure.** Unit test: assert the tag is present for `not-found` and absent after navigating to `home`. Build check: extend `verify-prerender.mjs` to assert exactly 3 of 27 documents carry `noindex`, and that those 3 are exactly the not-found routes. Production: `curl -sS https://nexoratechnology.org/not-found/ | grep -o '<meta name="robots"[^>]*>'`.

**9. Expected result.** The three 404 documents are excluded from indexing by directive, not just by sitemap omission.

---

## R4. Redirect `www` to the apex

**1. Problem.** `https://www.nexoratechnology.org/` returns `200` and serves the entire site, rather than redirecting to the apex.

**2. Evidence.** VERIFIED (production): `curl -sSI https://www.nexoratechnology.org/` → `HTTP/1.1 200 OK` (no `Location`). The served document declares `<link rel="canonical" href="https://nexoratechnology.org/">`. The committed config shares the cause: `server_name nexoratechnology.org www.nexoratechnology.org;` on the 443 block (`deploy/nginx/nexora-site.conf:26`), with only the port-80 block redirecting to the apex (`:98-103`).

**3. Why it matters.** The whole site exists at two hostnames. Canonical tags resolve the duplication for Google, but every `www` URL still has to be crawled and folded, external links split between two hosts, and any engine weighting canonical less strongly sees duplicates.

**4. Recommended solution.** Split the 443 block: keep `server_name nexoratechnology.org;` for the site, and add a dedicated `www` server block on 443 that returns `301 https://nexoratechnology.org$request_uri;`. The certificate must cover both names for the redirect block to serve TLS at all.

**5. Files likely to change.** `deploy/nginx/nexora-site.conf` (and the installed copy). No application change.

**6. Implementation complexity.** Low — one additional server block.

**7. Regression risk.** Low, with one prerequisite: if the certificate does not include `www`, browsers hit a TLS error _before_ the redirect. Verify the SAN list first.

**8. Verification procedure.** `curl -sSI https://www.nexoratechnology.org/services/` → expect `301` to `https://nexoratechnology.org/services/`. Repeat for the apex to confirm it still returns `200` and did not become a loop.

**9. Expected result.** One canonical hostname; `www` traffic and link equity consolidated by redirect rather than by inference.

---

## R5. Register and verify in Google Search Console

**1. Problem.** Whether Nexora is indexed is currently unknowable. No indexing claim in the audit could be verified.

**2. Evidence.** `SEO_TECHNICAL_AUDIT.md` §13 items 1–2. HTTP `200` is not evidence of indexing, and no tool available during this audit could establish index status.

**3. Why it matters.** Without Search Console there is no coverage report, no crawl-error history, no "which URL did Google pick as canonical," no manual-action visibility, and no field Core Web Vitals. Every P0 above would also have been _reported_ by Search Console had it been connected.

**4. Recommended solution.** Create a **Domain property** (DNS TXT verification) rather than a URL-prefix property, so apex, `www`, `http` and `https` are covered by one property — which matters directly given R4. Submit `https://nexoratechnology.org/sitemap.xml`. Then use URL Inspection on one page per locale.

**5. Files likely to change.** None in the repository. DNS TXT record at the registrar. **Do R1 first** — registering before the 404 and redirect fixes means the first crawl reports problems that are about to be fixed.

**6. Implementation complexity.** Low, but requires registrar/DNS access and a Google account. Human-only; it cannot be scripted or verified from this repository.

**7. Regression risk.** None.

**8. Verification procedure.** Property shows "Ownership verified." Sitemap status "Success" with 24 discovered URLs. URL Inspection on `/`, `/hy/`, `/ru/` reports "URL is on Google" or an actionable reason. Allow days to weeks for coverage data.

**9. Expected result.** Index status becomes observable instead of assumed.

---

## R6. Register in Bing Webmaster Tools

**1. Problem.** Same as R5 for Bing, and therefore for Yahoo and much of DuckDuckGo.

**2. Evidence.** §13 item 1. Bingbot receives byte-identical HTML (verified), so compatibility is established — only visibility is missing.

**3. Why it matters.** Bing powers Yahoo and a large share of DuckDuckGo results. The static-HTML architecture is _especially_ valuable for Bing, whose JS rendering is less reliable than Google's; that advantage is currently unmeasured.

**4. Recommended solution.** Register the site, verify by DNS (consistent with R5), submit the same sitemap. Bing Webmaster Tools can import from Search Console once R5 is done, which is the quickest path.

**5. Files likely to change.** None. DNS record.

**6. Implementation complexity.** Low. Human-only.

**7. Regression risk.** None.

**8. Verification procedure.** Site verified; sitemap accepted with 24 URLs; URL Inspection returns a status for one page per locale.

**9. Expected result.** Index status observable on the Bing-powered engines.

---

# P2 — Medium

## R7. Guard the SEO contract at build time

**1. Problem.** The metadata layer is correct today, and nothing would fail if it stopped being correct. All metadata is written in one `effect` (`document-meta.ts:118-186`); the whole system depends on that effect flushing before the prerenderer serializes, which is asserted nowhere.

**2. Evidence.** `verify-prerender.mjs` checks that pages are navigable without JavaScript. It does not check canonical, hreflang, title uniqueness, `og:url`, `lang`, or JSON-LD validity. The audit had to write a throwaway harvester to establish these facts.

**3. Why it matters.** This is the cheapest insurance in the roadmap. An Angular upgrade changing effect-flush timing, or a new page added without `data.meta`, would silently ship documents with missing metadata — and no existing check would catch it.

**4. Recommended solution.** Extend `verify-prerender.mjs` (or add `verify-seo.mjs` beside it) to assert, over `dist/nexora/browser`: every document has non-empty `<title>`, `<meta name="description">`, `<link rel="canonical">`; titles are unique across all documents; canonical equals `siteOrigin + route`; `og:url` equals canonical; the hreflang set is exactly `en, hy, ru, x-default` and is reciprocal; `<html lang>` matches the route's locale prefix; exactly one `<h1>`; `ld+json` parses and contains `Organization` and `WebSite`; every `<img>` has `alt`; exactly the three not-found routes carry `noindex` (after R3).

Every one of these assertions passed when run manually during this audit, so adoption is zero-friction — it pins the current state.

**5. Files likely to change.** `scripts/verify-prerender.mjs` + `scripts/verify-prerender.test.mjs`, or new siblings. `package.json`. CI workflow under `.github/`.

**6. Implementation complexity.** Low-medium. The harvesting logic is straightforward; the existing scripts provide the pattern, including their own unit tests.

**7. Regression risk.** None to production — build-time only. It can fail a build, which is the point.

**8. Verification procedure.** Run against the current build: must pass on all 27 documents. Then verify each assertion is load-bearing by breaking one deliberately (e.g. temporarily remove `og:url` from `document-meta.ts`) and confirming the script fails. An assertion never seen to fail is not evidence.

**9. Expected result.** The SEO contract is enforced by CI, not by audit.

---

## R8. Enrich the Organization schema and use a raster logo

**1. Problem.** `Organization` carries only `name`, `url`, `logo`, `email`. There is no `WebPage` node and no `Service` node anywhere.

**2. Evidence.** `src/app/core/seo/document-meta.ts:145-152`; `organization.ts:1-5`. Verified in live output on every page. For comparison — observed in public HTML during this audit, facts only — netguru.com emits `Organization`, `ContactPoint`, `PostalAddress`, `AggregateRating`, `Person`, `BreadcrumbList`; intellias.com emits `Organization`, `LocalBusiness`, `PostalAddress`, `ImageObject`; thoughtworks.com emits `Organization`, `WebSite`, `SearchAction`, `BreadcrumbList`. All three publish structured contact and address data; Nexora publishes an email address.

**3. Why it matters.** `sameAs`, `contactPoint` and `address` are the fields Google uses to build a knowledge panel and to connect the site to an entity. The data already exists on the site; it is simply not in the graph. Separately, Google's logo guidance asks for a raster image, and `ORGANIZATION.logoPath` is `/brand/mark.svg`.

**4. Recommended solution.** Extend `ORGANIZATION` with `sameAs` (LinkedIn and any other owned profiles), `contactPoint` (`@type: ContactPoint`, `contactType: "sales"`, the email, `availableLanguage: ["en","hy","ru"]`), and `address` / `areaServed` **only if** the public business address is intended to be public — do not invent one. Add a `WebPage` node per document (`@id: canonical#webpage`, `isPartOf` the WebSite, `inLanguage`, `breadcrumb` referencing the BreadcrumbList) so the breadcrumb attaches to a page entity. Add a raster logo (a 512×512 PNG) and point `logo` at it.

Only add fields whose values are real. An invented address is worse than none.

**5. Files likely to change.** `src/app/core/seo/organization.ts`, `src/app/core/seo/document-meta.ts:143-185`, a new `public/brand/logo.png`, and `document-meta.spec.ts`.

**6. Implementation complexity.** Low for the fields; the only open question is which values are genuinely public — that is a business decision, not an engineering one.

**7. Regression risk.** Low. Invalid JSON-LD is the main hazard; the graph is serialized in one place, so a schema test covers it.

**8. Verification procedure.** Run the built HTML through Google's Rich Results Test and the Schema Markup Validator (both require manual, browser-based submission). Add a unit assertion that the graph parses and contains the expected `@type` set.

**9. Expected result.** A complete, connected entity graph and eligibility for richer presentation. **No ranking improvement should be promised** — structured data affects presentation, not position.

---

## R9. Diagnose the EN homepage layout shift

**1. Problem.** The English homepage has a reproducible CLS of 0.089 — 34× the Armenian homepage on the same layout.

**2. Evidence.** Lab measurement during this audit, headless Chromium, 1366×900, warm connection: `/` → CLS 0.0893 on two consecutive runs; `/hy/` → 0.0098; `/services/` → 0.0026; `/contact/` → 0.0011.

**3. Why it matters.** CLS is a Core Web Vitals metric. 0.089 is inside the "good" band (< 0.1) but with almost no margin, on the site's most important page. A slower connection or a different font-loading outcome could push it over. That the HY page on the same layout is 34× better shows this is fixable, not inherent.

**4. Recommended solution.** First attribute it, do not guess. Record a Chrome performance trace of `/` and read the layout-shift entries' `sources`. The audit's working hypothesis — **unconfirmed** — is the hero eyebrow's dual-text swap (`hero__eyebrow-text--full` / `--short`, both present in the production HTML) or Latin font metric substitution; `src/index.html:22-28` preloads only `inter-v20-latin.woff2`. If it is the font, `size-adjust` / `ascent-override` on the fallback `@font-face` is the standard fix. If it is the eyebrow, reserving its height removes the shift.

**5. Files likely to change.** `CANNOT DETERMINE until attribution is done.` Most likely `src/app/pages/home/hero/hero.scss` or `src/styles/_fonts.scss`.

**6. Implementation complexity.** Low once attributed; the diagnosis is the work.

**7. Regression risk.** Low, but it is a visual change on the most-viewed page, and the project has e2e assertions on hero geometry (`e2e/hero.spec.ts`). Run that spec.

**8. Verification procedure.** Re-measure CLS on `/` with the same method; expect it to approach the `/hy/` figure (~0.01). Confirm `e2e/hero.spec.ts` still passes. Note that lab CLS is not field CLS — treat field confirmation as available only after R5.

**9. Expected result.** Homepage CLS comparable to the rest of the site, with headroom against the 0.1 threshold.

---

## R10. Plan dedicated service landing pages

**1. Problem.** Nexora catalogues 15 services. One has a dedicated page.

**2. Evidence.** `src/app/shared/services-catalogue/services-catalogue.content.ts` defines 15 ids: `web-development`, `mobile-app-development`, `backend-api-integration`, `web-ui-ux-design`, `devops-automation`, `ai-agents-automation`, `dedicated-teams`, `custom-software-development`, `saas-development`, `legacy-modernization`, `ai-development-integration`, `ai-workflow-engineering`, `cloud-infrastructure`, `software-maintenance-support`, `white-label-development`. Only `ai-agents-automation` has a route (`/services/ai_agent`, `app.routes.ts:20-24`). The rest appear as cards on `/services/` and as `?category=` filters, which correctly canonicalise to `/services`. For comparison, observed in public HTML: netguru.com exposes one indexable page per service under `/services/<slug>`.

**3. Why it matters.** "Custom software development company", "dedicated development team", "mobile app development" are the commercial-intent queries this business competes for. A single `/services` page cannot rank for fifteen distinct intents; a query-parameter filter is not an indexable landing page. This is the largest _opportunity_ in the audit — but it is content work, not a technical defect, which is why it is P2 and not higher.

**4. Recommended solution.** Do **not** generate fifteen thin pages. Choose the highest commercial-intent subset — on the brief's own list, plausibly Web Development, Mobile App Development, Backend & API Development, Custom Software Development, Dedicated Development Teams, AI & Business Automation (already done), UI/UX Design, DevOps — and write genuinely substantial pages for them: scope, process, stack, trade-offs, real engagement examples. Each needs original EN/HY/RU content, not machine translation, since the existing localization quality is high and a drop would be visible.

The architecture supports this with no refactor: add the page to `DOCUMENT_META_PAGES`, add a route with `data.meta`, add titles/descriptions to `document-meta.content.ts`, and `app.routes.server.ts` prerenders all three locales automatically while `sitemap.spec.ts` forces the sitemap update. **Use hyphens** in new segments (`/services/web-development`), not the underscore of the existing `ai_agent`.

Pace this against actual writing capacity. Three excellent pages beat eight thin ones, and thin duplicated service pages are a known quality risk.

**5. Files likely to change.** `document-meta.ts:19-29`, `document-meta.content.ts`, `app.routes.ts`, `public/sitemap.xml`, plus new page components and content files.

**6. Implementation complexity.** **Low engineering, high content.** The engineering is roughly an hour per page; the content is the project.

**7. Regression risk.** Low technically. The real risk is editorial: thin or duplicated pages across three locales would hurt more than the pages help.

**8. Verification procedure.** Per page: prerendered in all three locales, unique title and description, present in the sitemap, reachable by a real `<a href>` from `/services/` within one click, and the R7 assertions pass. Content review before merge.

**9. Expected result.** Coverage of distinct commercial-intent queries with pages that deserve to rank. **No traffic or ranking figure is forecast** — none could be substantiated.

---

# P3 — Low

## R11. Lengthen the four short descriptions

**Problem/Evidence.** `/services/ai_agent` 99 chars, `/not-found` 118, `/ru/services/ai_agent` 118, `/contact` 124 (measured across the build). **Why.** Under ~120 characters leaves SERP space unused. **Solution.** Extend toward 140–155 in `document-meta.content.ts`; skip `not-found` (it becomes `noindex` under R3). **Files.** `src/app/core/seo/document-meta.content.ts`. **Complexity.** Trivial. **Risk.** None. **Verification.** Re-measure lengths after build. **Result.** Fuller snippets.

## R12. Add the explicit Twitter Card fields

**Problem/Evidence.** `src/index.html:20` sets `twitter:card` statically; `twitter:title`, `twitter:description` and `twitter:image` are absent site-wide. **Why.** X/Twitter falls back to `og:*`, which are correct and per-route, so cards already render — this is completeness, not a defect. **Solution.** Mirror the three fields in the existing effect alongside the `og:*` writes (`document-meta.ts:129-136`). **Files.** `src/app/core/seo/document-meta.ts`. **Complexity.** Trivial. **Risk.** None. **Verification.** Inspect built HTML; optionally the Card Validator (manual). **Result.** Explicit rather than inherited card metadata.

## R13. Serving-layer polish

**Problem/Evidence.** No Brotli (`Content-Encoding: gzip` only); hashed assets get `max-age=2592000` where the committed config says `expires 1y`, and the header is sent **twice**; `Content-Type: text/html` carries no `; charset=utf-8`. **Why.** Brotli saves a further ~15–20% on text; hashed filenames make a one-year immutable cache safe; the charset is declared in `<meta charset>` so the header is belt-and-braces. **Solution.** Enable `ngx_brotli`; let the committed config's `expires 1y` apply (R1 does this); find and remove the duplicate `Cache-Control` source; add `charset utf-8;`. **Files.** nginx config only. **Complexity.** Low; Brotli may need a module install. **Risk.** Low. **Verification.** `curl -H 'Accept-Encoding: br' -I` shows `br`; asset `Cache-Control` appears once with `max-age=31536000`. **Result.** Smaller transfers, better repeat-visit caching.

## R14. Document the deployment story

**Problem/Evidence.** Two hosting conventions are committed — `public/_headers` + `public/_redirects` (Netlify) and `deploy/nginx/` — and production is nginx. The Netlify files are copied into the publish root by `angular.json:28-33` and are currently served as readable text. **Why.** This ambiguity is plausibly how the live config came to diverge in the first place. **Solution.** State in `README.md` that production is nginx, that `public/_headers` is the single source of truth from which `verify-headers.mjs` generates the nginx snippet, and that `deploy/nginx/` must be reinstalled whenever `_headers` changes. **Files.** `README.md`. **Complexity.** Trivial. **Risk.** None. **Verification.** A reader can answer "where do production headers come from?" from the README alone. **Result.** The divergence that caused R1 becomes less likely to recur.

---

## Suggested sequence

| Phase                             | Items                                                       | Gate                                                                         |
| --------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **1 — Fix the serving layer**     | R1, R4, R13 (one nginx change, deployed with a fresh build) | R1's verification block passes end to end                                    |
| **2 — Close the application gap** | R3, R7                                                      | `noindex` on exactly 3 of 27; R7 assertions pass and are proven able to fail |
| **3 — Make it observable**        | R5, R6, R2                                                  | Both consoles verified, sitemap accepted, live smoke check green             |
| **4 — Improve**                   | R8, R9, R11, R12, R14                                       | —                                                                            |
| **5 — Grow**                      | R10                                                         | Per-page editorial review                                                    |

Phases 1–3 are the definition of "SEO-ready". Phases 4–5 are where the compounding returns are, and they are only worth starting once 1–3 hold.
