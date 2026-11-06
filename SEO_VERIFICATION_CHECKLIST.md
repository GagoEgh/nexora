# Nexora — SEO Verification Checklist

For developers and deployment engineers. Companion to `SEO_TECHNICAL_AUDIT.md` and `SEO_IMPLEMENTATION_ROADMAP.md`.

**Substitute `$ORIGIN` for `https://nexoratechnology.org`.**

Two rules apply throughout:

1. **A check that has never been seen to fail is not a check.** Where a step says _prove it fails_, do it once.
2. **HTTP 200 is not evidence of indexing.** Only Search Console and Bing Webmaster Tools can answer that.

---

## 1. Local verification (before commit)

| #   | Check                | Command                                              | Expected                                                        |
| --- | -------------------- | ---------------------------------------------------- | --------------------------------------------------------------- |
| 1.1 | Types                | `npm run typecheck`                                  | exit 0                                                          |
| 1.2 | Lint, deps, styles   | `npm run lint`                                       | `All files pass linting.` + no dependency violations            |
| 1.3 | Formatting           | `npm run format:check`                               | all files pass                                                  |
| 1.4 | Unit tests           | `npm test -- --no-watch`                             | all pass (330 at the time of audit)                             |
| 1.5 | **Sitemap ↔ routes** | included in 1.4 (`src/app/core/seo/sitemap.spec.ts`) | fails if `public/sitemap.xml` drifts from `DOCUMENT_META_PAGES` |
| 1.6 | Metadata unit tests  | included in 1.4 (`document-meta.spec.ts`)            | pass                                                            |

> **If you added a page:** it must appear in `DOCUMENT_META_PAGES` (`src/app/core/seo/document-meta.ts:19-29`), in `app.routes.ts` with `data: { meta: … } satisfies DocumentMetaRouteData`, in `document-meta.content.ts` for all three locales, and in `public/sitemap.xml` with all four `xhtml:link` alternates. Step 1.5 enforces the last one. Use **hyphens** in new URL segments.

---

## 2. Build verification

| #   | Check                          | Command                                              | Expected                                                                                                 |
| --- | ------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 2.1 | Production build               | `npm run build`                                      | exit 0, 27 prerendered routes (more if pages were added)                                                 |
| 2.2 | Route count                    | `find dist/nexora/browser -name index.html \| wc -l` | pages × 3 locales                                                                                        |
| 2.3 | **Prerender works without JS** | `npm run verify:prerender`                           | `N prerendered pages are navigable without JavaScript.`                                                  |
| 2.4 | Headers + CSP hashes in step   | `npm run verify:headers`                             | `N pages: 5 inline scripts allowed by hash, 6 headers present, nginx snippet in step.`                   |
| 2.5 | Bundle budget                  | `npm run verify:bundle`                              | worst route under 240 kB gzip (221.7 kB at audit)                                                        |
| 2.6 | Script tests                   | `npm run test:scripts`                               | all pass                                                                                                 |
| 2.7 | SEO contract                   | `npm run verify:seo`                                 | `27 documents: unique titles, canonical and hreflang agree, 24 indexable and in the sitemap, 3 noindex.` |
| 2.8 | Logo artefact                  | included in 2.6 (`build-logo.test.mjs`)              | `public/brand/logo.png` exists, is a real PNG, 512x512                                                   |

**2.4 is a release gate, not a formality.** The CSP pins hashes of inline scripts emitted by _this_ build. Shipping a build without its matching `_headers` blocks hydration in production.

### What 2.7 actually asserts

`scripts/verify-seo.mjs` replaces the manual spot-checks that used to live here. Per document:
`<html lang>` matches the path's locale - non-empty `<title>` and `description` - exactly one
`<link rel="canonical">`, equal to `origin + path` - `og:url` equal to the canonical - all three
`twitter:*` fields non-empty - the hreflang set is exactly `en, hy, ru, x-default`, the self
entry equals the canonical and `x-default` equals the `en` entry - exactly one `<h1>` - no
`<img>` without `alt` - one JSON-LD block that parses and contains `Organization`, `WebSite` and
a `WebPage` whose `url` is the canonical - `noindex` on the `not-found` routes and on nothing
else. Across the corpus: titles are unique, every hreflang target is itself a built document,
and the sitemap contains all 24 indexable URLs, none of the 3 noindex ones, nothing extra and no
duplicates.

It has been seen to fail. Against a build with four documents corrupted by hand - one
`robots` meta removed, one canonical given a trailing slash, one `twitter:title` deleted and one
`@type` misspelled - it reported all four and exited 1.

---

## 3. Prerender content verification

| #   | Check                                         | How                                                                           | Expected                                     |
| --- | --------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------- |
| 3.1 | Title, description, canonical in initial HTML | `curl -sS $ORIGIN/services/ \| grep -oE '<title>[^<]*\|rel="canonical"[^>]*'` | both present                                 |
| 3.2 | hreflang complete and reciprocal              | `curl -sS $ORIGIN/hy/services/ \| grep -o 'hreflang="[a-z-]*"'`               | `en`, `hy`, `ru`, `x-default`                |
| 3.3 | Canonical == requested URL                    | compare by eye, or roadmap R2's script                                        | must match exactly, including trailing slash |
| 3.4 | JSON-LD parses                                | pipe the `ld+json` block through `node -e 'JSON.parse(…)'`                    | no throw                                     |
| 3.5 | One H1                                        | `curl -sS $ORIGIN/about/ \| grep -c '<h1'`                                    | `1`                                          |
| 3.6 | Content without JS                            | `npm run verify:prerender` (step 2.3)                                         | passes                                       |

---

## 4. Production HTTP verification (run after every deploy)

### 4.1 Status codes — the block that catches the audit's P0 findings

```
curl -sSI $ORIGIN/services              # expect 200, NO Location header
curl -sSI $ORIGIN/hy/services           # expect 200, NO Location header
curl -sSI $ORIGIN/definitely-not-real   # expect 404
curl -sSI $ORIGIN/hy/definitely-not-real # expect 404, Armenian body
curl -sSI $ORIGIN/robots.txt            # expect 200 text/plain
curl -sSI $ORIGIN/sitemap.xml           # expect 200 text/xml
curl -so /dev/null -w '%{http_code}\n' $ORIGIN/_headers    # expect 404
curl -so /dev/null -w '%{http_code}\n' $ORIGIN/_redirects  # expect 404
```

**At the time of this audit, lines 1, 2, 3, 4, 7 and 8 all failed.** They are the first thing to re-run after roadmap R1.

### 4.2 Canonicalization

```
curl -sSI http://nexoratechnology.org/        # expect 301 -> https://nexoratechnology.org/
curl -sSI https://www.nexoratechnology.org/   # expect 301 -> https://nexoratechnology.org/   (R4)
curl -sSL -o /dev/null -w '%{num_redirects}\n' $ORIGIN/services/   # expect 0
```

### 4.3 Headers

```
curl -sSI $ORIGIN/ | grep -iE 'content-security-policy|strict-transport|x-content-type|x-frame|referrer-policy|permissions-policy|cross-origin-opener'
```

Expect all seven, with `X-Frame-Options: DENY`. Then load the site in a browser with DevTools open: **zero CSP violations**, and the contact form plus language switcher still work (the hydration check).

### 4.4 Caching and compression

```
curl -sSI $ORIGIN/ | grep -i cache-control                       # expect no-cache (HTML)
curl -sSI $ORIGIN/main-<hash>.js | grep -i cache-control         # expect ONE header, long max-age
curl -sSI -H 'Accept-Encoding: gzip, br' $ORIGIN/ | grep -i content-encoding  # expect br (R13) or gzip
```

### 4.5 Crawler parity — no cloaking

```
for ua in "Googlebot/2.1" "bingbot/2.0" "Mozilla/5.0"; do
  curl -sS -A "$ua" $ORIGIN/services/ | wc -c; done
```

All three byte counts must be identical. They were at audit (207,408).

### 4.6 Sitemap URLs do not redirect

Every `<loc>` must return `200` with no `Location`:

```
curl -sS $ORIGIN/sitemap.xml | grep -oE '<loc>[^<]+</loc>' | sed 's/<[^>]*>//g' \
  | while read u; do printf '%s %s\n' "$(curl -so /dev/null -w '%{http_code}' "$u")" "$u"; done \
  | grep -v '^200'
```

Expect no output. **At audit this printed 23 lines of `301`.** This single command is the fastest regression test for P0-2.

---

## 5. Browser and crawler rendering

| Target                      | How to verify                                                           | Notes                                                                                      |
| --------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Initial HTML response**   | `curl` (§3, §4) — never a browser's "View Source" after JS has run      | The only honest way to see what a crawler receives first                                   |
| **Googlebot rendering**     | Search Console → URL Inspection → **Test Live URL** → View Crawled Page | Requires R5. Authoritative                                                                 |
| **Bingbot rendering**       | Bing Webmaster Tools → URL Inspection                                   | Requires R6                                                                                |
| **Mobile rendering**        | Search Console mobile usability + DevTools device emulation at 390 px   | One responsive codebase, so parity is expected                                             |
| **Chrome**                  | Covered by the Playwright suite (Chromium)                              | `npx playwright test`                                                                      |
| **Firefox / Safari / Edge** | **Manual.** `playwright.config.ts:22-31` installs Chromium only         | Low risk (server-rendered HTML, no browser-specific critical-path APIs) but **unverified** |

JS-disabled check: load `$ORIGIN/services/` in a browser with JavaScript off. Full content must be visible. This mirrors step 2.3 and is the clearest demonstration that SSG is doing its job.

---

## 6. Search Console setup (one-time, manual)

- [ ] Create a **Domain property** (DNS TXT), not URL-prefix — covers apex, `www`, `http`, `https` in one property.
- [ ] Verify ownership.
- [ ] Submit `$ORIGIN/sitemap.xml`.
- [ ] Set an international targeting / confirm hreflang is detected.
- [ ] URL-inspect one page per locale: `/`, `/hy/`, `/ru/`.
- [ ] Check **Pages** → Not indexed: expect no "Soft 404" and no "Duplicate without user-selected canonical" once R1 ships.
- [ ] Check **Core Web Vitals** once field data accumulates (weeks).

**Do R1 before this.** Registering first means the first crawl reports problems that are about to be fixed.

## 7. Bing Webmaster Tools setup (one-time, manual)

- [ ] Register and verify by DNS (consistent with §6), or import from Search Console.
- [ ] Submit the same sitemap.
- [ ] URL-inspect one page per locale.
- [ ] Review Crawl Information for 404/soft-404 patterns.

## 8. Sitemap submission

- [ ] `$ORIGIN/sitemap.xml` returns `200 text/xml`.
- [ ] Every `<loc>` returns `200` with no redirect (§4.6).
- [ ] URL count equals the indexable route count (24 at audit; not-found excluded).
- [ ] Referenced from `robots.txt` — already correct.
- [ ] Submitted in both consoles and reporting "Success".

## 9. Indexing verification

- [ ] Search Console reports pages as indexed. **This is the only acceptable evidence.**
- [ ] `site:nexoratechnology.org` in Google and Bing as a rough sanity check — indicative only, never authoritative.
- [ ] Confirm Google's chosen canonical matches the declared one (URL Inspection → "User-declared" vs "Google-selected").
- [ ] Confirm all three locales appear, not just EN.
- [ ] Confirm `/not-found` is **absent** from the index (after R3).

> Do not record a page as indexed because it returns `200`, because it is in the sitemap, or because it renders correctly. None of those is indexing.

## 10. Core Web Vitals monitoring

- [ ] Search Console → Core Web Vitals, once field data exists (needs traffic; weeks).
- [ ] PageSpeed Insights on `/`, `/services/`, `/contact/` — reports **both** lab and (when available) field data. Read them separately.
- [ ] Lighthouse locally against the production URL for lab trends.
- [ ] Watch `/` specifically: lab CLS was **0.089** at audit versus 0.0098 on `/hy/` (roadmap R9).
- [ ] Re-run `npm run verify:bundle` each release; budget 240 kB gzip.

**Lab numbers are not field numbers.** Everything in `SEO_TECHNICAL_AUDIT.md` §8 is lab-only, single machine, unthrottled — useful for regression, not a pass/fail verdict on Core Web Vitals.

### Tooling: what needs access

| Tool                    | Access needed               | Use                                                                                                                                                                        |
| ----------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google Search Console   | **Google account + DNS**    | Index coverage, Googlebot rendering, field CWV, manual actions. Irreplaceable                                                                                              |
| Bing Webmaster Tools    | **Microsoft account + DNS** | Same for Bing/Yahoo/DuckDuckGo                                                                                                                                             |
| Rich Results Test       | Browser, manual             | Validates eligible structured-data types                                                                                                                                   |
| Schema Markup Validator | Browser, manual             | Validates the whole graph, including types Google ignores                                                                                                                  |
| PageSpeed Insights      | None                        | Lab + field CWV per URL                                                                                                                                                    |
| Lighthouse              | None (local)                | Lab trends, SEO/a11y audits                                                                                                                                                |
| Chrome DevTools         | None                        | **Layout-shift attribution for R9** — the only way to find the shifting element                                                                                            |
| Screaming Frog          | Licence beyond 500 URLs     | Site-wide crawl: redirect chains, canonical conflicts, hreflang reciprocity. Free tier covers this 27-page site comfortably. **Best single tool for confirming R1 and R2** |

---

## 11. Post-deployment regression checks

Run after **every** production deploy. Roughly two minutes.

- [ ] §4.1 status codes — all eight lines
- [ ] §4.2 canonicalization — three lines
- [ ] §4.3 headers — seven present, `DENY`, zero CSP violations in a real browser
- [ ] §4.6 sitemap URLs — no output
- [ ] §4.5 crawler parity — three identical byte counts
- [ ] `curl -sS $ORIGIN/ | grep -c '<h1'` → `1`
- [ ] Contact form submits (CSP `connect-src` must list the API origin once it is deployed — `verify:headers` asserts it agrees with `environment.production.ts`)
- [ ] Language switcher keeps you on the same page, not the locale home

### Release gate

Do not mark a deploy complete until:

1. `npm run verify:prerender`, `verify:headers` and `verify:bundle` all pass **on the artifact being deployed**;
2. §4.1 and §4.6 pass **against production**;
3. a browser session shows zero CSP violations and working hydration.

### Production state, measured 2026-11-06 after implementation

The single command that covers this whole section:

```sh
npm run verify:live-seo -- https://nexoratechnology.org
```

It reported **28 failures**. Every one is fixed in `deploy/nginx/` and none of the fixes are
deployed - the host is not running the committed configuration. See `SEO_MANUAL_TASKS.md` M1.

| Check                                           | Measured on production                            | Fixed in repo by                           | Deployed                                     |
| ----------------------------------------------- | ------------------------------------------------- | ------------------------------------------ | -------------------------------------------- |
| §4.1 `/services` -> 200, no redirect            | **301 -> `/services/`**, on 23 of 24 sitemap URLs | `try_files` ordering in `nexora-site.conf` | **No**                                       |
| §4.1 `/definitely-not-real` -> 404              | **200**, English body regardless of locale prefix | locale-ordered `error_page` rules          | **No**                                       |
| §4.1 `/_headers` -> 404                         | **200**                                           | `location ~ ^/_(headers\|redirects)$`      | **No**                                       |
| §4.2 `www` -> 301                               | **200** - the whole site at a second hostname     | dedicated 443 `server` block (R4)          | **No**, also needs a `www` SAN               |
| §4.3 CSP / Permissions-Policy / COOP present    | **absent**                                        | `nexora-headers.conf` include              | **No**                                       |
| §4.3 `X-Frame-Options: DENY`                    | **SAMEORIGIN**                                    | same                                       | **No**                                       |
| §4.4 asset `Cache-Control` sent once, immutable | **sent twice**, `max-age=2592000`                 | `add_header` instead of `expires` (R13)    | **No**                                       |
| §4.4 `Content-Encoding: br` offered             | **gzip only**                                     | `nexora-brotli.conf`                       | **No**, needs `ngx_brotli`                   |
| §9 `/not-found` carries `noindex`               | **no directive** at audit time                    | `document-meta.ts` (R3)                    | **In the build**; live after the next deploy |

The last row is the only one of these that is an application fix rather than a serving-layer
one: it is in `dist/` today and `npm run verify:seo` asserts it on every build. The other eight
cannot be verified against production from this repository, and must not be reported as fixed
until `verify:live-seo` exits 0 against the live origin.
