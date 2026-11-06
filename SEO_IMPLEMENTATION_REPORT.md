# Nexora — SEO Implementation Report

**Date:** 2026-11-06
**Implements:** `SEO_IMPLEMENTATION_ROADMAP.md` (R1–R14), derived from `SEO_TECHNICAL_AUDIT.md`
**Blocked items, in detail:** `SEO_MANUAL_TASKS.md`
**Post-implementation route evidence:** `SEO_PAGE_AUDIT.md`

---

## 1. Outcome in one table

| #   | Item                                     | P   | Outcome                                          | Verified how                                                      |
| --- | ---------------------------------------- | --- | ------------------------------------------------ | ----------------------------------------------------------------- |
| R1  | Deploy the committed nginx configuration | P0  | **Blocked** — no host access                     | Not attempted. `verify:live-seo` proves it is still undeployed    |
| R2  | Prove the trailing-slash convention      | P0  | **Done**                                         | New `verify:live-seo`; run against production, found 23 redirects |
| R3  | `noindex` on the not-found routes        | P1  | **Done**                                         | 3 of 27 built documents; unit test for navigating away            |
| R4  | `www` → apex 301                         | P1  | **In repo**; needs R1 + a `www` SAN              | Config read; `nginx -t` **not run** — see §5                      |
| R5  | Google Search Console                    | P1  | **Blocked** — needs an account + DNS             | `SEO_MANUAL_TASKS.md` M4                                          |
| R6  | Bing Webmaster Tools                     | P1  | **Blocked** — needs an account                   | `SEO_MANUAL_TASKS.md` M5                                          |
| R7  | Guard the SEO contract at build time     | P2  | **Done**                                         | New `verify:seo`; 31 unit tests; proven to fail on a broken build |
| R8  | Organization schema + raster logo        | P2  | **Done**; `sameAs`/`telephone`/`address` omitted | Unit tests on the graph; PNG asserted by a script test            |
| R9  | EN homepage layout shift                 | P2  | **Done** — attributed, then fixed                | CLS on `/` **0.0892 → 0.0002**, lab, identical method             |
| R10 | Dedicated service landing pages          | P2  | **Not done, deliberately** — content work        | §4. No thin pages created                                         |
| R11 | Lengthen the short descriptions          | P3  | **Done**                                         | Shortest indexable description **99 → 133** chars                 |
| R12 | Explicit Twitter Card fields             | P3  | **Done**                                         | All three fields on 27 of 27 documents                            |
| R13 | Serving-layer polish                     | P3  | **In repo**; brotli needs a module install       | Config read; not deployed, not `nginx -t`'d                       |
| R14 | Document the deployment story            | P3  | **Done**                                         | `README.md` Hosting, rewritten against measured facts             |

**Nine done. Two implemented in the repository but not in force. Three blocked on access. One
deliberately not done.**

> **Nothing in this report claims a production fix.** Every application-layer item was verified
> against `dist/` and the test suites. Every serving-layer item is a committed configuration file
> that no running server has loaded. The one command that can tell the difference is
> `npm run verify:live-seo`, and as of today it exits 1 against production with 28 failures.

---

## 2. What changed

### New (13 files)

| File                               | Why                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `scripts/verify-seo.mjs`           | R7. Asserts the SEO contract of all 27 built documents and their agreement with the sitemap |
| `scripts/verify-seo.test.mjs`      | 31 tests: 1 happy path, 19 single-field mutations, 7 corpus-level cases, 4 helpers          |
| `scripts/verify-live-seo.mjs`      | R2. The same contract against a **running** origin, plus 404s, `www` and asset caching      |
| `scripts/verify-live-seo.test.mjs` | 19 tests. Each failure case is a shape actually observed on the live site                   |
| `scripts/build-logo.mjs`           | R8. Rasterizes `brand/mark.svg` → `brand/logo.png` using Playwright's existing Chromium     |
| `scripts/build-logo.test.mjs`      | Asserts the committed PNG exists, is a real PNG and is square at `LOGO_SIZE`                |
| `public/brand/logo.png`            | R8. 512×512, 24,830 bytes. Google's logo guidance asks for raster; it skips SVG             |
| `deploy/nginx/nexora-brotli.conf`  | R13. Optional snippet, included by wildcard so a host without `ngx_brotli` still starts     |
| `SEO_MANUAL_TASKS.md`              | The brief's requirement to document externally-blocked work separately                      |
| `SEO_IMPLEMENTATION_REPORT.md`     | This file                                                                                   |

### Modified (12 files)

```
.github/workflows/ci.yml                  +17 -3    verify:seo wired in after verify:prerender
README.md                                 +67 -12   R14: deployment story, measured production state
deploy/nginx/nexora-site.conf             +53 -4    R4 www block, R13 charset/brotli/caching, R2 note
e2e/contact.spec.ts                       +25 -10   caption assertions retargeted — see §6
e2e/hero.spec.ts                          +18 -4    trust row is a grid now, with the reason
package.json                              +3        verify:seo, verify:live-seo, build:logo
src/app/core/seo/document-meta.content.ts +8 -8     R11: four descriptions lengthened
src/app/core/seo/document-meta.spec.ts    +93       5 new tests: robots, Twitter, the JSON-LD graph
src/app/core/seo/document-meta.ts         +63 -4    R3 robots, R12 Twitter, R8 WebPage + contactPoint
src/app/core/seo/organization.ts          +13 -2    R8: raster logoPath, contact languages
src/app/pages/home/hero/hero.scss         +19 -6    R9: the CLS fix
```

**`src/app/pages/home/hero/hero.content.ts` also shows as modified and is not part of this
work.** It is an uncommitted edit that was already in the working tree — the HY and RU
`secondaryCta` strings were shortened. It was left untouched. Flagging it so it is not
attributed here or swept into an SEO commit.

---

## 3. Verification results — actual output

### Build gates, on the final build

```
[verify-prerender] 27 prerendered pages are navigable without JavaScript.
[verify-seo]       27 documents: unique titles, canonical and hreflang agree,
                   24 indexable and in the sitemap, 3 noindex.
[verify-headers]   27 pages: 5 inline scripts allowed by hash, 6 headers present,
                   nginx snippet in step.
[verify-bundle]    27 routes: worst is /ru/contact at 222.0 kB gzip, budget 240.0 kB.
```

### Test suites

| Suite                  | Result                     |
| ---------------------- | -------------------------- |
| `npm run typecheck`    | exit 0, all four projects  |
| `npm run format:check` | all files pass             |
| `npm run test:scripts` | **104 passed**, 12 suites  |
| `npm test`             | **335 passed**, 44 files   |
| `npm run e2e`          | **536 passed**, exit 0     |
| `npm run lint:deps`    | no violations, 186 modules |
| `npm run lint:styles`  | exit 0                     |
| `npm run lint`         | `All files pass linting.`  |

**A pre-existing lint error was fixed on request - see §11.** It was not introduced by this
work and is not SEO; it was failing before any of it began.

**Test timeouts under memory pressure, diagnosed rather than dismissed.** Several runs of
`npm test` reported failures - 4, then 8, then 31 - while the full suite passed 335/335 both
before and after. Every single failure was `Error: Test timed out in 5000ms`, with no assertion
failure anywhere in the output. The cause was machine starvation: `Get-Process` showed three
concurrent `ng build` process trees, an `ng serve`, 20 Chrome processes and two leftover static
servers from the CLS measurement work, against 1.9-2.4 GB of free RAM. The two static servers
were mine and were stopped; the build trees were left alone, since they may be someone's active
work.

Each affected spec file was then run in isolation and passed first time
(`src/app/layout/header`, `pages/about`, `pages/ai-agent`, `pages/services`, `pages/solutions`:
**101 passed**), and the next full run was **335 passed, exit 0, zero timeouts**. The same
pattern appeared once in Playwright (`hero.spec.ts` + `contact.spec.ts`: 4 failures at 2.3m,
then 58/58 at 41s on an identical re-run, then 536/536 for the full suite). No file involved in
any timeout was changed by this work. Reported because it happened, not treated as a regression

- but worth knowing that this suite's 5000ms per-test timeout is tight enough to be sensitive
  to machine load.

### Production, measured — `npm run verify:live-seo -- https://nexoratechnology.org`

**Exit 1. 28 failures.**

```
23 × 301 to a trailing-slash variant — 23 of the 24 sitemap URLs (only `/` is served directly)
 3 × soft 404 — unknown URLs answer 200, in English regardless of locale prefix, with no noindex
 1 × https://www.nexoratechnology.org/ answers 200 — the whole site at a second hostname
 1 × hashed assets: Cache-Control sent TWICE, ["max-age=2592000",
                    "public, max-age=2592000, immutable"], neither the immutable year
```

That is an exact, independent reproduction of the audit's production findings, by a script that
did not exist when the audit was written. It is the acceptance test for R1: after the deploy it
must exit 0.

---

## 4. The two items not implemented, and why

**R10 — service landing pages.** 15 services are catalogued; 1 has a page. Writing the other
14 across three locales would produce 42 near-duplicate documents, which makes a site worse, not
better. The roadmap said so itself ("Do **not** generate fifteen thin pages"), so none were
created and none were scaffolded. What is needed instead — original EN/HY/RU copy, and the
six-step engineering recipe per page once it exists — is in `SEO_MANUAL_TASKS.md` M6. This is
the largest remaining opportunity in the audit and it is a writing project, not a code change.

**R8's `sameAs`, `telephone` and `address`.** A grep across `src/` found no social profile URL,
no phone number and no postal address anywhere on this site. Structured data is a
machine-readable factual claim about the business; inventing one is worse than omitting it. The
fields are absent, the reason is recorded in a comment at `document-meta.ts:177-181`, and what
is needed to add them is `SEO_MANUAL_TASKS.md` M7.

---

## 5. Deliberate deviations from the roadmap

**R3's build-level assertion went somewhere else.** The roadmap said "extend
`verify-prerender.mjs` to assert exactly 3 of 27 documents carry `noindex`". It is asserted in
the new `verify-seo.mjs` instead, derived from a `NOINDEX_BASE_PATHS` list rather than a count —
so adding a page cannot make the number wrong, and `verify-prerender.mjs` keeps its single
responsibility of "does this page work without JavaScript".

**R9's cause was neither hypothesis.** The roadmap offered the hero eyebrow's dual-text swap or
Latin font metric substitution, both marked unconfirmed. Attribution says it is neither — §7.

**The asset `location` in nginx no longer uses `expires`.** R13 asked for the duplicate
`Cache-Control` source to be found and removed. The committed config was itself a plausible
source: `expires 1y` and `add_header Cache-Control` each set the header, so using both emits two.
The location now uses `add_header` only, and therefore **repeats the `include
snippets/nexora-headers.conf`** — an `add_header` in a nested level discards every inherited
header, so without the repeat every asset response would have silently lost the whole security
header set. The file's own comment warned about exactly that trap.

**`nginx -t` has not been run.** nginx is not installed in this environment and no container
runtime was available (`docker info` fails). The nginx changes are therefore **unverified
syntax**, and `SEO_MANUAL_TASKS.md` M1 says to run `nginx -t` before the reload in the loudest
terms available. This is the one piece of work here with no local proof at all.

---

## 6. One test was retargeted, not deleted

`e2e/contact.spec.ts` asserted the field caption renders at Body/Small 13/21. Commit `9e5903b`
set `font-size: 11px` literally in `field-label.scss`, so that assertion was failing before this
work began. It was retargeted to 11px/20px — and the relationship it used to encode is now
asserted explicitly in the opposite direction:

```ts
expect(caption).toEqual({ size: '11px', lineHeight: '20px', weight: '600' });
expect(hint).toEqual({ size: '13px', lineHeight: '21px', weight: '400' });
expect(Number.parseFloat(caption.size)).toBeLessThan(Number.parseFloat(hint.size));
```

So the caption being **smaller than its own field's hint** is now a tested, documented property
rather than an untested side effect. The test comment records all three sizes the caption has
had and why. Nothing was removed to make a suite green.

`e2e/hero.spec.ts:81` asserted `display: flex` on the trust row and failed after the R9 fix —
the roadmap predicted this exact spec would need attention. It now asserts `grid` **and** that
the three items occupy three distinct `y` positions, which is the property that actually keeps
CLS at zero. The reasoning is in the test.

---

## 7. R9 in detail: the homepage layout shift

Worth recording, because the roadmap's two hypotheses were both wrong and the method is
reusable.

**Method.** Headless Chromium, 1366×900, `PerformanceObserver` on `layout-shift` with
`buffered: true`, reading each entry's `sources` for the node and its `previousRect` /
`currentRect`. Cold context — no warm-up navigation, because a warm-up populates the font cache
and hides a font-swap shift entirely. (A first attempt with a warm-up measured 0.0000 on every
page, which would have been a false all-clear.)

**Reproduction.** `/` → **CLS 0.0892**, matching the audit's 0.0893. Dominant entry 0.0886 at
789 ms, source `div.hero__copy`, `[80,165,603,505] → [80,143,603,549]` — 44 px taller and 22 px
higher.

**Attribution.** Measuring the same subtree with `**/*.woff2` aborted isolated it one level down:

```
div.hero__copy    549px with Inter   505px on the fallback   −44px
  ul.hero__trust   64px (3 rows)      20px (1 row)           −44px   <<<
  (every sibling: 0px)
```

Then across widths, with the three items plus two 24 px gaps measured directly:

| Viewport | `.hero__trust` column | Inter needs | Fallback needs | Rows: Inter → fallback |
| -------- | --------------------- | ----------- | -------------- | ---------------------- |
| 1024     | 236 (grid below 1200) | —           | —              | 3 → 3, no shift        |
| 1280     | 560 px                | 618 px      | 588 px         | 3 → 3, no shift        |
| **1366** | **603 px**            | **618 px**  | **588 px**     | **3 → 1, 0.089 CLS**   |
| 1440+    | 618 px                | 618 px      | 588 px         | 1 → 1, no shift        |

So `display: flex; flex-wrap: wrap` above the `large` breakpoint fitted the row on one line only
while the metric-different fallback font was showing, and reflowed 44 px the moment Inter
arrived. Two things follow that the CLS number alone does not show: the shift exists **only** in
the window where the column is between 588 px and 618 px wide, and above that the single-row
layout fits by **exactly zero pixels** — so any copy edit, in any locale, would have
reintroduced it. HY and RU wrapped at every width already, which is why `/hy/` measured 0.0098
on the same layout.

**Fix.** `.hero__trust` is a one-per-row grid at every width; the `up(large)` flex override is
gone. The height no longer depends on which font is active, and the three locales now render
identically. This was offered as a choice, and the stable-stack option was chosen over a
metric-matched fallback font (whose `size-adjust` ratio is per-platform and could only have been
measured for Arial on Windows here) and over shrinking the gap (which would have fitted with
1 px to spare).

**Result, same method, same viewport, same 800 ms font delay, pre-fix build vs post-fix build
served side by side:**

| Build  | CLS on `/` | Sources                                                 |
| ------ | ---------- | ------------------------------------------------------- |
| Before | 0.0047     | `div.hero__copy` 505→549, `nav#header-nav` width change |
| After  | **0.0002** | `nav#header-nav` width change only                      |

The `hero__copy` source is gone. (The absolute numbers are lower than the 0.0892 production
reading because the local transport differs; the pre/post comparison is what the identical
method makes valid.) Production cold, post-fix, cannot be measured until R1 ships —
`SEO_MANUAL_TASKS.md` M8. `/hy` still measures 0.0085 from the Armenian hero illustration
settling 14 px; it is 12× under the threshold and was not touched.

`npm run e2e` → 536 passed, including all of `e2e/hero.spec.ts`.

---

## 8. Proving the new gates can fail

A check that has never failed is not a check.

**`verify:seo`.** A copy of `dist/` was corrupted in four places — `robots` meta stripped from
`/ru/not-found`, a trailing slash added to `/about`'s canonical, `/about`'s `twitter:title`
deleted, and `"@type":"WebSite"` misspelled on `/hy`. Output:

```
[verify-seo] 3 failures:
  /ru/not-found   must be noindex, but the robots meta is null
  /hy             JSON-LD graph has no WebSite node (found ["Organization","WebSiteTypo","WebPage"])
  /about          canonical is https://nexoratechnology.org/about/, expected .../about
                  no <meta name="twitter:title">
exit=1
```

All four caught, exit 1. Its 31 unit tests are built the same way: a document that passes, then
19 single-field mutations each asserted to produce a specific complaint.

**`verify:live-seo`.** It found 28 real failures on its first run against production (§3). Its
19 unit tests use the response shapes actually observed there, so the suite doubles as a record
of what was wrong.

---

## 9. What is still open

Ordered by what blocks what.

1. **M3 — confirm the TLS certificate covers `www`.** Do this first; M1's new `www` block cannot
   complete a handshake without it, which would be worse than today.
2. **M1 — install the nginx config and deploy the build.** Resolves 8 of the 9 rows in
   `SEO_VERIFICATION_CHECKLIST.md` §11's production table. Run `nginx -t` first.
   Acceptance: `npm run verify:live-seo -- https://nexoratechnology.org` exits 0.
3. **M4 / M5 — Search Console and Bing.** After M1, so the sitemap's 24 URLs do not all redirect
   on first read. Everything about this site's actual indexing is `CANNOT DETERMINE` until then.
4. **M2 — `ngx_brotli`.** Independent of the above; the wildcard include means it can land later.
5. **M8 — field Core Web Vitals.** 28 days after M1 + M4.
6. **M6 — service landing pages.** The largest opportunity. Paced against writing capacity.
7. **M7 — `sameAs` / `telephone` / `address`.** One-line change, blocked on facts.
   The pre-existing lint error in `chip-select.ts` was item 8 on this list and has since been
   fixed - §11.

---

## 10. What this report does not claim

- That any production issue is fixed. Eight of nine serving-layer findings are fixed **in the
  repository** and verified only by reading the configuration — one of them not even by
  `nginx -t`. The ninth, `noindex`, is in the build and goes live with the next deploy.
- That the site is indexed, or ranks, or receives traffic. Not observable from here, not
  estimated, and `CANNOT DETERMINE` until M4.
- That the CLS fix helps real users yet. Lab measurement on an undeployed build is evidence that
  the defect is gone from the artefact, and nothing more.
- That the nginx configuration is syntactically valid. It has not been parsed by nginx.

---

## 11. Addendum: the `chip-select.ts` lint error

Fixed on request, after the rest of this report was written. It is not SEO work and is recorded
separately for that reason.

**The error.** `src/app/pages/contact/contact-form/chip-select/chip-select.ts:19` reads
`event.keyCode`, which `@typescript-eslint/no-deprecated` flags. It is committed in `9e5903b`
with a clean working tree, so it predates everything above and had been failing `npm run lint` -
CI step 3 of 11 - from the start.

**The obvious fix is wrong.** `event.key === 'Enter' || event.key === ' '` sits right beside the
`keyCode` test and looks like it makes it redundant. It does not. Material's chip action reads
**only** `event.keyCode`, never `event.key`:

```
node_modules/@angular/material/fesm2022/chips.mjs:144   (v22.2.3)
  if ((event.keyCode === ENTER || event.keyCode === SPACE) && !this.disabled && ...
```

So an event carrying `keyCode` and no `key` still toggles the chip. `isActivation` guards a
capture-phase handler whose job is to stop Material deselecting an already-chosen chip - the bug
recorded as CT-11, which threw `TypeError: ctx.form.interest is not a function` in the browser
from an ordinary click. Dropping the `keyCode` branch would have reopened it on exactly the
events Material acts on. `chip-select.spec.ts:149` - _"refuses an activation that carries only
the keyCode Material reads"_ - exists to catch precisely that, and dispatches
`{ key: '', keyCode: SPACE }`.

**What was done.** Behaviour unchanged. A narrowly-scoped
`// eslint-disable-next-line @typescript-eslint/no-deprecated` on that one line with the reason
inline, plus a doc comment on `isActivation` recording the `chips.mjs:144` citation, why both
halves of the key test are load-bearing, and the removal recipe for when Material moves to
`event.key`: delete the two `code` comparisons, drop the `@angular/cdk/keycodes` import, remove
the suppression, and let the spec tell you whether you were right.

A suppression was chosen over casting the read through a locally-declared type, which would also
have silenced the rule. The cast would have hidden the fact that a deprecated API is in use; the
suppression is greppable and carries its justification.

**Verified.** `npm run lint` -> `All files pass linting.` - `npm run typecheck` exit 0 -
`npm run format:check` clean - contact-page specs **83 passed** across 5 files, including all 7
chip-select tests - `e2e/contact.spec.ts` **52 passed** - full unit suite **335 passed, exit 0**

- full `npm run e2e` **536 passed**.
