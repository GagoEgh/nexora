# Nexora — SEO & Angular Technical Audit

**Audited:** 2026-11-06 · **Role:** Staff/Principal Angular + technical SEO
**Scope:** audit only. No application source file was modified in the course of this audit.
**Production:** `https://nexoratechnology.org` — live and reachable, verified by HTTP during this audit (`nginx/1.28.3 (Ubuntu)`, origin `16.16.160.74`).

> **This document is the audit as it stood on 2026-11-06, before any fix.** It is deliberately
> not updated in place: it is the record of what was found, and the findings below are what the
> implementation was measured against.
>
> For what was done about it, read `SEO_IMPLEMENTATION_REPORT.md`. For the items that could not
> be done from this repository — every serving-layer finding among them, because they need
> access to the host — read `SEO_MANUAL_TASKS.md`. `SEO_PAGE_AUDIT.md` **has** been
> re-measured against the fixed build and shows both states.
>
> One scoring note: the dimension scores in §13 are pre-implementation. They are not restated
> post-implementation, because the two scores that moved most — technical and indexability —
> are dominated by serving-layer findings that are fixed in the repository and **not deployed**.
> Rescoring on repository state would overstate what a crawler currently sees.

---

## 0. Method, and how to read this document

Every claim below is one of four kinds, and each is labelled:

- **VERIFIED (source)** — read in the repository at the file and line given.
- **VERIFIED (build)** — read out of `dist/nexora/browser`, from a production build run during this audit (`npm run build`, exit 0, 27 prerendered routes).
- **VERIFIED (production)** — observed in an HTTP response from the live origin during this audit; response excerpts are quoted.
- **CANNOT DETERMINE FROM AVAILABLE EVIDENCE** — stated explicitly, never guessed.

Two distinctions are held throughout, because almost every real finding turns on them:

1. **Accessible in a browser ≠ eligible for indexing.** A URL that answers `200` with readable content can still be a crawl liability.
2. **Application layer ≠ serving layer.** Nexora's Angular application produces near-exemplary SEO output. The web server in front of it does not serve that output the way the application declares it should. Every P0 in this audit lives in the gap between those two layers.

---

## 1. Executive summary

Nexora's **application-layer SEO is excellent** — materially better than most enterprise Angular sites. All 27 routes are statically prerendered with complete, unique, correctly localized metadata; canonical, hreflang, Open Graph and JSON-LD are present in the initial HTML byte stream with no JavaScript required; the sitemap matches the indexable route set exactly; and CI-grade automation already guards prerendering and security headers.

**The serving layer undoes a meaningful part of it.** The nginx configuration committed to this repository (`deploy/nginx/nexora-site.conf`) is **not** the configuration running in production. Three defects follow from that single fact, and a fourth is an application-side gap:

| #   | Finding                                                                                                                                                                                                 | Severity |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Every unknown URL returns **HTTP 200 with the English homepage** — unbounded duplicate content; there is no 404 anywhere on the site                                                                    | **P0**   |
| 2   | Every non-home URL **301-redirects to a trailing-slash variant**, while canonical, hreflang, `og:url`, the sitemap and every internal link use the non-slash form                                       | **P0**   |
| 3   | **No `Content-Security-Policy`, `Permissions-Policy` or `Cross-Origin-Opener-Policy`** in production; `X-Frame-Options` is `SAMEORIGIN` not `DENY`; `/_headers` and `/_redirects` are publicly readable | **P1**   |
| 4   | The three `not-found` documents carry **no `robots` meta**, are self-canonical, and answer `200` at their own URLs                                                                                      | **P1**   |

Findings 1–3 are **configuration deployment**, not code. The repository already contains a correct nginx configuration that fixes 1 and 3 and prevents 2. Installing it is the single highest-leverage action available.

**Answering the central question** — what must change so Nexora is reliably discovered, crawled, indexed and represented: deploy the committed nginx config (or align the live one with it), make the trailing-slash convention consistent end to end, add `noindex` to the not-found route, and register the property in Google Search Console and Bing Webmaster Tools. Nothing in the Angular architecture needs to change. **SSR is not necessary and is not recommended** (§4.4).

---

## 2. Current SEO architecture

### 2.1 Stack

| Item          | Value                                                      | Evidence                                                           |
| ------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| Angular       | 22.2.3 (core, router, ssr, platform-browser)               | `package.json:27-42`                                               |
| Rendering     | **Full SSG** — `"outputMode": "static"`                    | `angular.json:56`                                                  |
| Server routes | 4 rules, all `RenderMode.Prerender`                        | `src/app/app.routes.server.ts:15-20`                               |
| Hydration     | `provideClientHydration()`                                 | `src/app/app.config.ts:17`                                         |
| i18n          | `intlayer` / `angular-intlayer` 9.7.0, `prefix-no-default` | `src/app/core/i18n/locale-routing.ts`                              |
| Locales       | `en` (unprefixed default), `hy`, `ru`                      | verified in build: 27 documents                                    |
| Zone.js       | **absent** — genuinely zoneless                            | no `zone.js` in `package.json`                                     |
| Site origin   | `https://nexoratechnology.org` in both environments        | `src/environments/environment.ts:6`, `environment.production.ts:6` |

### 2.2 The SEO subsystem

One cohesive module, `src/app/core/seo/`:

- **`document-meta.ts`** (188 lines) — a single `provideEnvironmentInitializer` owning _all_ per-route metadata. It subscribes to `NavigationEnd`, resolves the active page from route `data.meta` by walking to the deepest child (`:48-56`), and writes title, description, the Open Graph set, canonical, the hreflang set and the JSON-LD graph inside one `effect` (`:118-186`).
- **`document-meta.content.ts`** — the intlayer dictionary holding all nine pages × three locales of title/description plus breadcrumb names.
- **`site-origin.ts`** — the `SITE_ORIGIN` injection token, falling back to `document.location.origin` in the browser when unconfigured (`:14-23`).
- **`organization.ts`** — single source of organization identity (name, email, logo path).
- **`sitemap.spec.ts`** — keeps `public/sitemap.xml` in step with `DOCUMENT_META_PAGES`.

**Assessment: this is the right architecture.** One owner, route-data driven, no per-component SEO logic, no duplication, no hardcoded URLs outside `environment` and `ORGANIZATION`. Detailed review in §11.

### 2.3 Page inventory

`DOCUMENT_META_PAGES` (`src/app/core/seo/document-meta.ts:19-29`) declares nine pages: `home`, `services`, `services/ai_agent`, `solutions`, `about`, `engagement-models`, `partnerships`, `contact`, `not-found`.

Across three locales that is **27 prerendered documents**, of which **24 are indexable** (the three not-found documents are excluded from the sitemap). VERIFIED (build): `find dist/nexora/browser -name index.html | wc -l` → 27.

---

## 3. Angular rendering analysis

### 3.1 Does prerendered HTML contain the content and the metadata?

**Yes — VERIFIED (build) for all 27 documents, and VERIFIED (production) on live pages.**

A harvest across every built document produced:

| Property                                          | Result across 27 documents     |
| ------------------------------------------------- | ------------------------------ |
| `<html lang>` correct for locale                  | **27 / 27** (`en`/`hy`/`ru`)   |
| `<title>` present and **unique**                  | **27 / 27**, zero duplicates   |
| `<meta name="description">` present               | **27 / 27**, 99–243 characters |
| `<link rel="canonical">` exactly `origin + route` | **27 / 27**, zero mismatches   |
| `og:url` equals canonical                         | **27 / 27**                    |
| Full hreflang set `en, hy, ru, x-default`         | **27 / 27**                    |
| Exactly one `<h1>`                                | **27 / 27**                    |
| Heading levels with no skipped rank               | **27 / 27**                    |
| JSON-LD graph present                             | **27 / 27**                    |
| `<img>` elements missing `alt`                    | **0**                          |

Live confirmation, `https://nexoratechnology.org/hy/services/`:

```html
<html lang="hy">
  <title>Ծառայություններ | Nexora</title>
  <link rel="canonical" href="https://nexoratechnology.org/hy/services" />
  <link rel="alternate" hreflang="en" href="https://nexoratechnology.org/services" />
  <link rel="alternate" hreflang="hy" href="https://nexoratechnology.org/hy/services" />
  <link rel="alternate" hreflang="ru" href="https://nexoratechnology.org/ru/services" />
  <link rel="alternate" hreflang="x-default" href="https://nexoratechnology.org/services" />
</html>
```

`<html lang>` is set by an `effect` in the root component (`src/app/app.ts:21-25`) and survives into prerendered output — confirmed on the live HY document above.

### 3.2 Is content reachable without JavaScript?

**Yes.** `npm run verify:prerender`, run during this audit:

```
[verify-prerender] 27 prerendered pages are navigable without JavaScript.
```

The script (`scripts/verify-prerender.mjs`) deliberately inspects `dist/browser` rather than running under `ng serve`, because `outputMode: "static"` prerenders at build time only and the dev server returns a bare shell. That distinction is documented in the script header (`:1-11`) and is the correct call.

### 3.3 Is there any crawler-specific behaviour?

**No — and that is correct.** VERIFIED (production): `https://nexoratechnology.org/services/` returns **byte-identical responses (207,408 bytes)** for Googlebot, bingbot and a default client UA. No cloaking, no UA sniffing, no dynamic rendering.

### 3.4 Hydration

`provideClientHydration()`. The build emits Angular's event-dispatch contract and jsaction bootstrap as inline scripts whose hashes are pinned in the CSP and regenerated by `npm run verify:headers` (`public/_headers:5-11`). **No SEO-critical content is added or changed by hydration** — the prerendered DOM already contains the full page.

### 3.5 Verdict

**The existing SSG architecture is sufficient. SSR is not needed.** Argument in §4.4.

---

## 4. Technical SEO findings

### 4.1 P0 — Unknown URLs return HTTP 200 with the English homepage

**VERIFIED (production).**

```
$ curl -sSI https://nexoratechnology.org/definitely-not-a-page
HTTP/1.1 200 OK
Content-Type: text/html
```

The body is the **English homepage**: `<title>Nexora | Technology development and AI solutions partner</title>`, `<link rel="canonical" href="https://nexoratechnology.org/">`, `<h1>Engineering Digital Solutions That Move Business Forward.</h1>`.

It is **not locale-aware**: `https://nexoratechnology.org/hy/definitely-not-a-page` also returns `200` with the **English** homepage, canonical `/`.

| URL                                                           | Status  | Served      |
| ------------------------------------------------------------- | ------- | ----------- |
| `/definitely-not-a-page`                                      | **200** | EN homepage |
| `/hy/definitely-not-a-page`                                   | **200** | EN homepage |
| `/services/ai-agent` (hyphen; the real segment is `ai_agent`) | **200** | EN homepage |

**Why it matters.** Every mistyped link, stale backlink and crawler-invented URL becomes a `200` duplicate of the homepage. The URL space is unbounded, so crawl budget is unbounded. Search Console will report these as "Duplicate without user-selected canonical" or soft 404. The self-canonical to `/` limits the damage — Google will usually fold them — but it does not stop the crawling and is not a substitute for a status code.

**This contradicts the repository's own intent.** Both `public/_redirects:14-16` and `deploy/nginx/nexora-site.conf:70-86` return `404`, with comments explaining precisely why `200` would be wrong:

> _"a rewrite answering 200 would tell crawlers a mistyped URL is a real page, and the branded not-found content would start competing with the pages it replaces"_ — `deploy/nginx/nexora-site.conf:67-69`

The live server runs neither.

### 4.2 P0 — Trailing-slash 301 on every non-home URL, against every declared URL

**VERIFIED (production).**

```
$ curl -sSI https://nexoratechnology.org/services
HTTP/1.1 301 Moved Permanently
Location: https://nexoratechnology.org/services/
```

Same for `/hy`, `/ru`, `/hy/services`, `/ru/contact`, `/not-found`, and parameter URLs (`/solutions?challenge=introduce-ai` → `/solutions/?challenge=introduce-ai`).

Meanwhile **every URL the site declares about itself omits the slash**:

- Canonical: `<link rel="canonical" href="https://nexoratechnology.org/services">` — VERIFIED (production) at `/services/`
- hreflang: all four alternates, non-slash
- `og:url`: non-slash
- Sitemap: all 24 `<loc>` entries non-slash (`public/sitemap.xml`)
- **Internal links**: VERIFIED (production) — every `href` on `/services/` is non-slash (`/contact`, `/services`, `/partnerships`, `/solutions`, `/about`, `/engagement-models`, `/hy/services`, `/ru/services`, `/services/ai_agent`)

**The consequence is systemic, not cosmetic:**

1. The canonical URL of every page is a URL that redirects — to the page declaring it. Google resolves this by following the redirect, but it is a canonical conflict signal and Search Console will surface sitemap URLs as "Page with redirect."
2. Every hreflang target redirects. Google asks that hreflang point at canonical, non-redirecting URLs; annotations pointing at redirects risk being dropped, which would break the EN↔HY↔RU cluster.
3. **Every internal link costs a redirect hop**, so the whole internal link graph is crawled at double cost.
4. Both `/services` and `/services/` are addressable, as are `/index.html`, `/services/index.html`, `/hy/index.html` (all VERIFIED `200`).

**Root cause.** The live nginx resolves `/services` to the _directory_ `/services/` and issues nginx's standard directory redirect. The committed configuration would not: `try_files $uri $uri/index.html $uri/ =404;` (`deploy/nginx/nexora-site.conf:85`) tries `$uri/index.html` **before** `$uri/`, serving `/services` directly from `/services/index.html` with `200` and no redirect. **Installing the committed configuration fixes this finding as a side effect.**

### 4.3 P1 — `not-found` documents are indexable

**VERIFIED (build and production).** None of the 27 documents carries a `robots` meta, and no `X-Robots-Tag` is sent. For 24 routes that is correct. For the three not-found routes it is not:

```
$ curl -sS https://nexoratechnology.org/not-found/
<title>Page not found | Nexora</title>
<link rel="canonical" href="https://nexoratechnology.org/not-found">
```

A self-canonical, `200`, indexable "Page not found" page in three languages. They are correctly **excluded from the sitemap** (24 locs vs 27 built routes; the difference is exactly the three not-found routes), but sitemap exclusion is not a crawl directive — they remain reachable via the `error_page` mechanism and any external link.

### 4.4 Is SSR necessary? — **No**

| Requirement                        | SSG today                                | Would SSR improve it?                             |
| ---------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| Content in initial HTML            | Yes, all 27 routes, JS-free              | No                                                |
| Per-route metadata in initial HTML | Yes, 27/27 unique                        | No                                                |
| Localized documents                | Yes, 3 locales × 9 pages, correct `lang` | No                                                |
| TTFB                               | **333–357 ms** measured (§8)             | SSR would be _worse_ — static files are the floor |
| Dynamic or personalized content    | None exists                              | N/A                                               |
| Content freshness                  | Marketing content, rebuilt on deploy     | No                                                |

There is **no requirement in this codebase that SSG cannot satisfy**. SSR would add a server runtime, a cold-start path and a new failure mode in exchange for nothing measurable. **Recommendation: keep `outputMode: "static"`.**

### 4.5 robots.txt and sitemap.xml

**VERIFIED (production), both correct.**

```
$ curl https://nexoratechnology.org/robots.txt      → 200, text/plain
User-agent: *
Allow: /

Sitemap: https://nexoratechnology.org/sitemap.xml
```

```
$ curl -I https://nexoratechnology.org/sitemap.xml  → 200, text/xml, 11718 bytes
```

The sitemap is a valid `urlset` with `xhtml:link` alternates on every entry, matching the hreflang the documents emit. **Coverage is exact**: 24 `<loc>` entries = the 24 indexable routes, no extras, no omissions, no not-found. It carries no `<lastmod>` — optional, and better absent than wrong.

Nothing important is blocked. No `noindex`, no `nofollow`, no `Disallow` anywhere.

---

## 5. Metadata audit

Full 27-row matrix in `SEO_PAGE_AUDIT.md`. Defect summary:

| Issue                                                     | Count                                                                                          | Severity |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------- |
| Missing/duplicate/empty title                             | **0**                                                                                          | —        |
| Missing/duplicate description                             | **0**                                                                                          | —        |
| Missing or wrong canonical                                | **0**                                                                                          | —        |
| Missing hreflang                                          | **0**                                                                                          | —        |
| Missing or multiple H1                                    | **0**                                                                                          | —        |
| Skipped heading levels                                    | **0**                                                                                          | —        |
| `<img>` without `alt`                                     | **0**                                                                                          | —        |
| Missing `robots: noindex` on not-found                    | **3**                                                                                          | P1       |
| Description under ~120 chars                              | **4** (`/services/ai_agent` 99, `/not-found` 118, `/ru/services/ai_agent` 118, `/contact` 124) | P3       |
| `twitter:title` / `twitter:description` / `twitter:image` | absent site-wide                                                                               | P3       |

On Twitter Cards: `src/index.html:20` sets `twitter:card=summary_large_image` statically and nothing sets the other three. X/Twitter falls back to the `og:*` equivalents, which are present and per-route, so cards render correctly. A completeness gap, not a defect.

`src/index.html:5,10,14,17` carry static EN title/description/og values. These are **overwritten per route before serialization** — confirmed, since the built `/hy/services/index.html` contains only the Armenian title. They act as a fallback for a hypothetical unprerendered response. No duplicate-metadata problem exists.

---

## 6. International SEO audit

**This is the strongest part of the implementation, and the trailing-slash defect is the only thing holding it back.**

| Check                                    | Result                                                                                                                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Language-specific URLs                   | `prefix-no-default`: `/x` (en), `/hy/x`, `/ru/x` — correct and conventional                                                                              |
| Correct ISO codes                        | `en`, `hy`, `ru` — valid ISO 639-1                                                                                                                       |
| hreflang on every page                   | 27/27, complete set                                                                                                                                      |
| `x-default`                              | Present on all 27, pointing at the EN URL — correct                                                                                                      |
| Reciprocity                              | Every page lists all three alternates plus x-default, so every pair references back                                                                      |
| Canonical ↔ hreflang consistency         | Each page's canonical equals its own hreflang self-entry — correct                                                                                       |
| Independently indexable                  | Yes — each locale is its own prerendered document with its own title, description, canonical, `lang` and JSON-LD `inLanguage`                            |
| Language switching preserves the page    | Yes — VERIFIED (production): `/services/` links to `/hy/services` and `/ru/services`, not to the locale home                                             |
| Discoverable by crawlers                 | Yes — via sitemap `xhtml:link` alternates, in-document hreflang, and real `<a href>` links                                                               |
| Genuinely localized content              | Yes — HY and RU titles/descriptions are real translations, not duplicated EN (the HY description for `/hy/services` is 214 characters of Armenian prose) |
| **hreflang targets are non-redirecting** | **NO** — all alternates 301 (§4.2)                                                                                                                       |

Sitemap alternates agree with document alternates — both non-slash, both consistent, both currently redirecting.

---

## 7. Structured data audit

**Emitted (`src/app/core/seo/document-meta.ts:143-185`), one `@graph` per page:**

| Type             | Where                           | Correctness                                                                                                                  |
| ---------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Organization`   | All 27                          | Stable `@id` (`origin/#organization`), `name`, `url`, `logo`, `email`. Valid                                                 |
| `WebSite`        | All 27                          | Stable `@id`, `publisher` → `@id` reference to Organization, `inLanguage` per locale. Valid, correct entity relationship     |
| `BreadcrumbList` | 24 (not the three locale homes) | `@id` is `canonical#breadcrumb`, `ListItem` positions 1..n, localized names, `item` URLs built with `getLocalizedUrl`. Valid |

VERIFIED (production), `/hy/services/`:

```json
{
  "@type": "BreadcrumbList",
  "@id": "https://nexoratechnology.org/hy/services#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Գլխավոր",
      "item": "https://nexoratechnology.org/hy"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Ծառայություններ",
      "item": "https://nexoratechnology.org/hy/services"
    }
  ]
}
```

**Strengths:** exactly one `ld+json` block per document (`:93-103` reuses the element, so client-side navigation cannot duplicate it); `@id` graph references rather than nested duplication; breadcrumb names match visible navigation; `inLanguage` tracks the locale.

**Gaps (opportunity, not error):**

1. **`Organization` is thin.** No `sameAs` (social/LinkedIn), no `contactPoint`, no `address`/`areaServed`, no `description`. These are the fields Google uses for a knowledge panel. The data exists on the site; it is simply not in the graph.
2. **No `WebPage` node.** No node represents the page itself, so `BreadcrumbList` is not attached to a `WebPage` and there is no `primaryImageOfPage` anchor.
3. **No `Service` / `ProfessionalService`.** Nexora has a 15-entry service catalogue (`src/app/shared/services-catalogue/services-catalogue.content.ts`) entirely absent from structured data. For a software-development firm this is the most relevant missing type.
4. **`logo` is an SVG** (`/brand/mark.svg`, `ORGANIZATION.logoPath:4`). Google's logo guidelines ask for a raster format.

No irrelevant or duplicate schema is present. No `Article` — correctly, since there is no editorial content.

---

## 8. Performance findings

**All numbers below are lab measurements taken during this audit** against production from a single machine over an unthrottled connection, using `PerformanceObserver` in headless Chromium. **They are not field data.** No CrUX, Search Console or RUM access was available: real-user Core Web Vitals are **CANNOT DETERMINE FROM AVAILABLE EVIDENCE**, and no pass/fail claim is made.

### 8.1 Measured (lab, warm connection, 1366×900)

| Route        | TTFB   | FCP    | LCP    | CLS        | Requests | Transfer |
| ------------ | ------ | ------ | ------ | ---------- | -------- | -------- |
| `/`          | 345 ms | 652 ms | 652 ms | **0.0893** | 13       | 380 KB   |
| `/` (repeat) | 333 ms | 584 ms | 584 ms | **0.0893** | 13       | 380 KB   |
| `/hy/`       | 343 ms | 644 ms | 644 ms | 0.0098     | 13       | 382 KB   |
| `/services/` | 353 ms | 952 ms | 952 ms | 0.0026     | 16       | 349 KB   |
| `/contact/`  | 347 ms | 720 ms | 720 ms | 0.0011     | 12       | 358 KB   |

An initial cold-start run measured TTFB 3,466 ms on `/`; that figure is **discarded** as a browser/TLS cold-start artifact — it did not reproduce on any warm run, and a direct `curl` of the same URL measured 355 ms.

LCP is under 1 s and CLS near zero on every page except one. **The EN homepage's CLS of 0.089 is reproducible across runs and is 34× the HY homepage's 0.0098 on the same layout**, so it is a real EN-specific shift, not noise. It remains inside Google's "good" band (< 0.1) but with almost no margin. The likely source is the hero's dual-text eyebrow (`hero__eyebrow-text--full` / `--short`, present in the production HTML) swapping at a breakpoint, or Latin font metric substitution; **the exact element is CANNOT DETERMINE without a layout-shift attribution trace.**

INP was not measured — it requires real interaction data. **CANNOT DETERMINE FROM AVAILABLE EVIDENCE.**

### 8.2 Payload (build, gzip)

| Item                              | Size                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| Worst route total (`/ru/contact`) | **221.7 KB gzip** (budget 240 KB) — `npm run verify:bundle`  |
| Lightest route (`/`, `/ru`)       | 216.1 KB gzip                                                |
| `main-*.js`                       | 466 KB raw / **138 KB gzip**                                 |
| Largest lazy chunk                | 198 KB raw / 38 KB gzip                                      |
| JS chunks                         | 22                                                           |
| HTML gzipped on the wire          | 42.7 KB (`/`), 29.1 KB (`/services/`), 30.1 KB (`/contact/`) |

HTML documents are 99–302 KB uncompressed, large for a marketing page. The cause is deliberate: 24–33 inline `<style>` blocks of per-page critical CSS plus Angular hydration state. It compresses to 29–43 KB and buys **LCP under 1 s with a single render-blocking stylesheet**, so the trade is sound.

### 8.3 Delivery

| Check                    | Result                                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Compression              | **gzip** on HTML (VERIFIED). **No Brotli offered** — would cut a further ~15–20% off text transfer                               |
| Render-blocking CSS      | **1** stylesheet per page                                                                                                        |
| Scripts in document      | **1** `<script src>`                                                                                                             |
| **Third-party requests** | **ZERO** on all pages measured — no analytics, tag manager or font CDN                                                           |
| Fonts                    | Self-hosted woff2 (Inter latin/cyrillic, Noto Sans Armenian), `rel="preload"` on Inter latin (`src/index.html:22-28`)            |
| Images                   | `alt` on 100% of `<img>`; brand assets SVG; `og-cover.png` 36.8 KB                                                               |
| HTML caching             | `Cache-Control: no-cache` — correct for documents referencing hashed assets                                                      |
| Hashed asset caching     | `max-age=2592000` (30 days) — the committed config specifies `expires 1y`; also sent as **two separate `Cache-Control` headers** |

Zero third-party scripts is unusually good and should be protected.

---

## 9. Production infrastructure findings

| Check                            | Result                                                                                           | Severity      |
| -------------------------------- | ------------------------------------------------------------------------------------------------ | ------------- |
| HTTPS                            | Valid certificate, `ssl_verify_result=0`                                                         | OK            |
| HTTP → HTTPS                     | `http://nexoratechnology.org/` → **301** → `https://nexoratechnology.org/`                       | OK            |
| **www → apex**                   | `https://www.nexoratechnology.org/` → **200, not a redirect**                                    | **P2**        |
| HSTS                             | `max-age=31536000; includeSubDomains` (no `preload`)                                             | OK            |
| `X-Content-Type-Options`         | `nosniff`                                                                                        | OK            |
| `X-Frame-Options`                | **`SAMEORIGIN`** (committed config says `DENY`)                                                  | P1            |
| `Referrer-Policy`                | `strict-origin-when-cross-origin`                                                                | OK            |
| **`Content-Security-Policy`**    | **ABSENT**                                                                                       | **P1**        |
| **`Permissions-Policy`**         | **ABSENT**                                                                                       | **P1**        |
| **`Cross-Origin-Opener-Policy`** | **ABSENT**                                                                                       | **P1**        |
| `/_headers`, `/_redirects`       | **publicly readable, HTTP 200** — leaks the CSP hash list                                        | **P1**        |
| 404 handling                     | **None — everything is 200**                                                                     | **P0** (§4.1) |
| Trailing slash                   | **301 on every page URL**                                                                        | **P0** (§4.2) |
| `Content-Type`                   | `text/html` — no `; charset=utf-8`                                                               | P3            |
| Deployed build                   | `main-ALQZCQG6.js`; a local build produces `main-HFYH2X7O.js`; `Last-Modified: Wed, 04 Nov 2026` | observation   |

**The live nginx is not `deploy/nginx/nexora-site.conf`.** Five independent signals prove it:

1. `X-Frame-Options` is `SAMEORIGIN`; the snippet emits `DENY` (`nexora-headers.conf:12`).
2. Three headers the snippet emits are absent (CSP, Permissions-Policy, COOP).
3. `/_headers` is reachable although the config returns 404 for it (`nexora-site.conf:47-49`).
4. Unknown URLs answer 200 although the config sets `error_page 404` (`:72,79,84`).
5. `/services` redirects although `try_files $uri $uri/index.html` would serve it directly (`:85`).

The www issue is partly inherent to the committed config too: `server_name nexoratechnology.org www.nexoratechnology.org;` on the 443 block (`:26`) serves both hosts, and only the port-80 block redirects to the apex. A dedicated `www` → apex 301 on 443 is missing from both the live server and the repository. Canonical tags currently resolve the duplication (`https://www...` serves `<link rel="canonical" href="https://nexoratechnology.org/">`), but a redirect is the correct fix.

**DNS, registrar, TLS issuer and CDN:** **CANNOT DETERMINE FROM AVAILABLE EVIDENCE** beyond the observed origin IP `16.16.160.74` and `Server: nginx/1.28.3 (Ubuntu)`. No CDN signature (`CF-Ray`, `X-Cache`, `Via`, `Age`) is present, consistent with a direct origin — but absence is not proof.

---

## 10. Search engine compatibility

**Browsers do not index; search engines do.** The two are assessed separately.

### 10.1 Crawlers

| Engine                | Assessment                                                                                                                                          | Evidence                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Google**            | **Fully compatible.** Content and metadata in the initial HTML; no JS execution required; no cloaking                                               | §3.1–3.3, `verify:prerender`                |
| **Bing**              | **Fully compatible.** Bingbot's JS rendering is less reliable than Google's, which is exactly why SSG matters here — Bing needs no JS for this site | byte-identical response to bingbot UA       |
| **Yahoo**             | Compatible — Yahoo Search is Bing-powered                                                                                                           | follows from Bing                           |
| **DuckDuckGo**        | Compatible — primarily Bing-sourced plus its own crawler; static HTML suits both                                                                    | follows from Bing                           |
| **Yandex**            | Compatible on the same grounds, and relevant given the RU locale. Not separately verified                                                           | —                                           |
| Mobile-first indexing | Compatible — one responsive codebase, one URL set, identical content at all viewports                                                               | `<meta name="viewport">` `src/index.html:7` |

**Static prerendering is the single best thing this project has done for non-Google search engines**, and it should not be traded away.

### 10.2 Shared risk

The §4.1 soft-404 affects every crawler identically, and is worse for engines with smaller crawl budgets than Google's.

### 10.3 Browsers

No browser-specific barrier to SEO-critical content was found. The project runs a Playwright suite, but **only Chromium binaries are installed** (`playwright.config.ts:22-31` documents this explicitly), so Firefox/WebKit rendering is **CANNOT DETERMINE FROM AVAILABLE EVIDENCE**. Since all content is server-rendered HTML with no browser-specific APIs in the critical path, the risk is low — but unverified.

---

## 11. Angular architectural findings

### 11.1 What is right

- **Single ownership.** All metadata flows through one initializer. No component sets a title; no duplicate meta logic exists (a grep for `Title`/`Meta` outside `core/seo` returns only the spec).
- **Route-data driven.** `data: { meta: 'services' } satisfies DocumentMetaRouteData` (`app.routes.ts:18`) — `satisfies` makes an invalid page key a compile error.
- **No hardcoded URLs.** Origin from `environment.siteOrigin` via `SITE_ORIGIN`; identity from `ORGANIZATION`; localized paths from intlayer's `getLocalizedUrl`/`getMultilingualUrls`.
- **Platform-safe.** `site-origin.ts:21` guards `document.location` behind `isPlatformBrowser`, so prerendering cannot touch a browser global.
- **Server routes derived, not duplicated.** `app.routes.server.ts:5-13` computes prerender params from `DOCUMENT_META_PAGES` and intlayer's `locales`, so adding a page cannot desynchronize the prerender list.
- **Sitemap guarded by a test.** `sitemap.spec.ts` fails if `public/sitemap.xml` drifts from `DOCUMENT_META_PAGES`.
- **Idempotent DOM writes.** `link()` (`:77-91`) and `jsonLd()` (`:93-103`) query before creating, so repeated navigations reuse elements instead of appending duplicates — which is what prevents duplicate canonical/JSON-LD tags after client-side routing.

This is a better SEO architecture than most enterprise Angular codebases. **No refactor is warranted.**

### 11.2 Observations worth noting

1. **`effect()` for metadata is sound but load-bearing.** Everything depends on the effect flushing before the prerenderer serializes. It demonstrably does (27/27 documents carry complete metadata), but nothing _asserts_ it at build time. The roadmap proposes a cheap guard.
2. **`SITE_ORIGIN`'s browser fallback is unreachable in practice** (`site-origin.ts:21`), since `environment.siteOrigin` is non-empty in both environments. Harmless; worth a comment.
3. **`not-found` sits in `DOCUMENT_META_PAGES`** alongside eight indexable pages, which is why it inherits full indexable metadata. The robots directive belongs here (§4.3).
4. **`src/index.html` duplicates EN home metadata statically.** Overwritten before serialization, so not a defect — but a second place where a title lives.
5. **Two hosting conventions are committed** — `public/_headers` + `public/_redirects` (Netlify) and `deploy/nginx/` (nginx). Production is nginx. The Netlify files are copied into the publish root by `angular.json:28-33` and are therefore served as plain text (§9). They are not dead — `verify-headers.mjs` treats `_headers` as the source of truth and generates the nginx snippet from it — but the deployment story should be written down.

**No anti-patterns found.** No unnecessary abstractions, no duplicate implementations, no SEO logic in page components, no unnecessary runtime dependencies, no hydration-affecting metadata.

---

## 12. Verified issues (consolidated)

| ID        | Finding                                                                                                     | Layer       | Evidence |
| --------- | ----------------------------------------------------------------------------------------------------------- | ----------- | -------- |
| **P0-1**  | Unknown URLs return 200 with the EN homepage, in all locales                                                | Serving     | §4.1     |
| **P0-2**  | Every non-home URL 301s to a trailing slash, contradicting canonical/hreflang/og:url/sitemap/internal links | Serving     | §4.2     |
| **P1-3**  | CSP, Permissions-Policy, COOP absent; XFO `SAMEORIGIN` not `DENY`                                           | Serving     | §9       |
| **P1-4**  | `/_headers`, `/_redirects` publicly readable                                                                | Serving     | §9       |
| **P1-5**  | not-found routes indexable (no `noindex`)                                                                   | App         | §4.3     |
| **P2-6**  | `www` serves 200 instead of redirecting to apex                                                             | Serving/DNS | §9       |
| **P2-7**  | Organization schema thin; no `Service`/`WebPage` nodes; SVG logo                                            | App         | §7       |
| **P2-8**  | EN homepage CLS 0.089, reproducible, 34× the HY homepage                                                    | App         | §8.1     |
| **P3-9**  | Four descriptions under 125 characters                                                                      | Content     | §5       |
| **P3-10** | No Brotli; hashed assets cached 30 d not 1 y; duplicated `Cache-Control`                                    | Serving     | §8.3     |
| **P3-11** | No `twitter:title` / `twitter:description` / `twitter:image`                                                | App         | §5       |
| **P3-12** | `Content-Type` without charset                                                                              | Serving     | §9       |

---

## 13. Unverified assumptions and open questions

Explicitly **CANNOT DETERMINE FROM AVAILABLE EVIDENCE**:

1. Whether the property is registered in Google Search Console or Bing Webmaster Tools, and whether the sitemap was ever submitted.
2. Whether any Nexora URL is currently indexed by any engine. **HTTP 200 is not evidence of indexing**, and no indexing claim is made anywhere in this audit.
3. Field Core Web Vitals (CrUX/RUM). §8 is lab-only, single machine, unthrottled.
4. DNS records, registrar, TLS issuer, and whether a CDN sits in front of the origin.
5. Why the live nginx differs from `deploy/nginx/` — never installed, installed then overwritten, or a different host entirely.
6. The exact element responsible for the EN homepage's 0.089 CLS.
7. Firefox/WebKit rendering (only Chromium binaries installed).
8. Backlinks, rankings, traffic, competitor metrics — none were measured and none are asserted.
9. Whether `/not-found` has accumulated external links.
10. Whether the Nov 4 production build predates any SEO-relevant source change since.

---

## 14. Final assessment

### Scores

| Dimension                    |        Score | Basis                                                                                                                                                                           |
| ---------------------------- | -----------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overall SEO readiness**    | **64 / 100** | Application layer near-perfect; serving layer carries two P0s that affect every URL                                                                                             |
| **Technical SEO**            | **58 / 100** | robots/sitemap/canonical/metadata all correct (full marks at the app layer); heavily penalised for no-404-anywhere and site-wide redirect-vs-canonical conflict                 |
| **Angular SEO architecture** | **93 / 100** | Single-owner, route-driven, type-safe, test-guarded, platform-safe, no duplication. Deductions only for the missing robots directive and the unasserted effect-flush dependency |
| **International SEO**        | **72 / 100** | Complete, reciprocal, genuinely localized hreflang with correct x-default — would be 95 but every annotated target currently 301s                                               |
| **Indexability readiness**   | **55 / 100** | All 24 intended pages are crawlable and indexable, but the unbounded 200-response URL space and three indexable not-found pages are serious liabilities                         |
| **Performance readiness**    | **78 / 100** | Lab LCP < 1 s, CLS ≈ 0 on 4/5 pages, zero third parties, within bundle budget. Capped because there is **no field data**, plus homepage CLS 0.089 and no Brotli                 |

Scoring criteria: each dimension starts at 100; **P0 −20 each, P1 −8, P2 −4, P3 −1**, applied to the dimensions each finding touches; no credit is given for configuration that exists but is not served.

### Direct answers

**1. Can Nexora currently be discovered and indexed by Google?**
Yes — nothing blocks it. robots.txt allows all, the sitemap is valid and reachable, all 24 pages are prerendered with correct canonical and metadata, and no JS is required. Whether it _is_ indexed is **CANNOT DETERMINE** without Search Console.

**2. Can Nexora be discovered by Bing and other major search engines?**
Yes, and the static architecture makes it _more_ reliable there than a client-rendered site. Same discovery path; same unverifiable actual-index status.

**3. Is the existing Angular SSG/prerendering architecture sufficient?**
**Yes.** 27 routes, JS-free, complete metadata, TTFB ~340 ms. It is doing its job correctly.

**4. Is SSR actually necessary?**
**No.** No requirement in the codebase needs it, and it would raise TTFB. Do not adopt it (§4.4).

**5. Are all EN / HY / RU versions independently indexable?**
**Yes.** Each is a separate prerendered document with its own `lang`, title, description, canonical, hreflang set and `inLanguage`. The only caveat is that hreflang targets 301 (P0-2).

**6. Are there critical technical problems preventing indexing?**
**No problem _prevents_ indexing.** There are two P0 problems that _degrade_ it: the unbounded 200 URL space and the redirect-vs-canonical conflict on every URL. Both are server configuration, not code.

**7. Ten highest-priority actions** — detail in `SEO_IMPLEMENTATION_ROADMAP.md`:

1. Deploy `deploy/nginx/nexora-site.conf` (fixes P0-1, P0-2, P1-3, P1-4 at once).
2. Verify after deploy that unknown URLs return 404 and `/services` returns 200 without redirecting.
3. Add `noindex, follow` to the three not-found routes.
4. Add a 301 from `www` to the apex on port 443.
5. Register the property in Google Search Console; submit the sitemap.
6. Register in Bing Webmaster Tools; submit the sitemap.
7. Add a build-time SEO assertion (canonical, hreflang, title uniqueness, robots-on-not-found) to `verify-prerender.mjs`.
8. Enrich `Organization` (`sameAs`, `contactPoint`, `address`) and add a raster logo.
9. Diagnose and fix the EN homepage's 0.089 CLS.
10. Add `Service` schema for the catalogued services, and plan dedicated landing pages for the highest-intent ones.

**8. What must be completed before Nexora is SEO-ready?**
Items 1–6. Items 1–4 are mandatory (they are defects); 5–6 are mandatory for _verification_ — without them, indexing status is permanently unknowable. Items 7–10 are improvements, not gates.

**9. What cannot be verified without Search Console / Bing Webmaster Tools / hosting / DNS access?**
Actual index coverage and impressions; crawl-rate and crawl-error history; field Core Web Vitals; manual actions or penalties; backlink profile; which URLs Google chose as canonical; DNS/registrar/CDN configuration; and why the live nginx differs from the committed configuration. These are listed individually in §13.
