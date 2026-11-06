# Nexora - Route-by-Route SEO Audit

**First audited:** 2026-11-06 - **Re-measured after implementation:** 2026-11-06.
**Source of truth:** `dist/nexora/browser`, from a production build run after the roadmap was
implemented. Every cell was **read out of rendered HTML**, not inferred from configuration.

## What changed since the first pass

|                                             | Before implementation                            | After                                                       |
| ------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| `robots` meta present                       | 0 of 27 - the three 404 documents were indexable | 3 of 27, and exactly the three `not-found` routes           |
| `twitter:title` / `:description` / `:image` | 0 of 27 (only the static `twitter:card`)         | 27 of 27                                                    |
| JSON-LD nodes                               | `Organization` + `WebSite` (+ `BreadcrumbList`)  | adds a per-page `WebPage` node, joined by `@id`             |
| `Organization.logo`                         | `/brand/mark.svg` - an SVG, which Google skips   | `/brand/logo.png`, 512x512 raster                           |
| Shortest indexable description              | 99 chars (`/services/ai_agent`)                  | 133 chars                                                   |
| Enforced by CI                              | nothing checked any of the above                 | `npm run verify:seo`, wired into `.github/workflows/ci.yml` |

The **Route** column now shows the canonical, non-slash form. In the first pass it showed the
form production actually served, because the live server 301-redirected the non-slash URL. That
is still true of production - see `SEO_MANUAL_TASKS.md` M1. It is a serving-layer defect, fixed
in `deploy/nginx/` and not yet deployed, so it is no longer reflected per-row here.

## How to read this

- **Route (canonical form)** - the URL the document declares as canonical, origin elided.
- **Desc** - `<meta name="description">` length in characters.
- **Canonical** - the `href` of `<link rel="canonical">`, origin elided. It matches **Route** on
  every row; `verify-seo.mjs` fails the build otherwise.
- **Twitter** - whether all three of `twitter:title`, `twitter:description` and `twitter:image`
  carry a non-empty value. `twitter:card` is static in `src/index.html` and is not counted here.
- **JSON-LD @graph** - the `@type` of each node in the document's single `@graph`, in order.
- **robots** - the `robots` meta content, or em dash for none. No `X-Robots-Tag` is sent by the
  committed nginx config, so for these documents "no meta" means indexable.

**Measured across all 27 documents:** unique titles 27/27 - canonical equals the route 27/27 -
`og:url` equals canonical 27/27 - hreflang set `en, hy, ru, x-default` 27/27 - exactly one
`<h1>` 27/27 - `<img>` without `alt`: **0** - Twitter card fields 27/27 - `robots` meta: **3**,
being exactly `/not-found`, `/hy/not-found`, `/ru/not-found` - descriptions 133-243 chars across
the 24 indexable pages (`/not-found` is 118 and deliberately not lengthened, being `noindex`).

Every one of those figures is asserted by `npm run verify:seo` on each build, so this table
cannot silently go stale.

---

## Route matrix

| #   | Route (canonical form)  | Lang | Title                                                            | Desc | Canonical               | Hreflang              | H1  | Twitter | JSON-LD @graph                                    | robots            |
| --- | ----------------------- | ---- | ---------------------------------------------------------------- | ---- | ----------------------- | --------------------- | --- | ------- | ------------------------------------------------- | ----------------- |
| 1   | `/`                     | `en` | Nexora &#124; Technology development and AI solutions partner    | 180  | `/`                     | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage                  | —                 |
| 2   | `/about`                | `en` | About &#124; Nexora                                              | 143  | `/about`                | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 3   | `/contact`              | `en` | Contact &#124; Nexora                                            | 153  | `/contact`              | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 4   | `/engagement-models`    | `en` | Engagement Models &#124; Nexora                                  | 166  | `/engagement-models`    | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 5   | `/hy`                   | `hy` | Nexora &#124; Տեխնոլոգիական լուծումների և AI-ի մշակման գործընկեր | 210  | `/hy`                   | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage                  | —                 |
| 6   | `/hy/about`             | `hy` | Մեր մասին &#124; Nexora                                          | 220  | `/hy/about`             | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 7   | `/hy/contact`           | `hy` | Կապ &#124; Nexora                                                | 149  | `/hy/contact`           | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 8   | `/hy/engagement-models` | `hy` | Համագործակցության մոդելներ &#124; Nexora                         | 197  | `/hy/engagement-models` | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 9   | `/hy/not-found`         | `hy` | Էջը չի գտնվել &#124; Nexora                                      | 130  | `/hy/not-found`         | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage                  | `noindex, follow` |
| 10  | `/hy/partnerships`      | `hy` | Գործընկերություն &#124; Nexora                                   | 243  | `/hy/partnerships`      | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 11  | `/hy/services`          | `hy` | Ծառայություններ &#124; Nexora                                    | 214  | `/hy/services`          | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 12  | `/hy/services/ai_agent` | `hy` | AI գործակալներ և բիզնեսի ավտոմատացում &#124; Nexora              | 136  | `/hy/services/ai_agent` | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 13  | `/hy/solutions`         | `hy` | Լուծումներ &#124; Nexora                                         | 210  | `/hy/solutions`         | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 14  | `/not-found`            | `en` | Page not found &#124; Nexora                                     | 118  | `/not-found`            | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage                  | `noindex, follow` |
| 15  | `/partnerships`         | `en` | Partnerships &#124; Nexora                                       | 164  | `/partnerships`         | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 16  | `/ru`                   | `ru` | Nexora &#124; Партнёр по разработке технологических и AI-решений | 189  | `/ru`                   | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage                  | —                 |
| 17  | `/ru/about`             | `ru` | О нас &#124; Nexora                                              | 192  | `/ru/about`             | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 18  | `/ru/contact`           | `ru` | Контакты &#124; Nexora                                           | 133  | `/ru/contact`           | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 19  | `/ru/engagement-models` | `ru` | Форматы сотрудничества &#124; Nexora                             | 177  | `/ru/engagement-models` | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 20  | `/ru/not-found`         | `ru` | Страница не найдена &#124; Nexora                                | 142  | `/ru/not-found`         | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage                  | `noindex, follow` |
| 21  | `/ru/partnerships`      | `ru` | Партнёрство &#124; Nexora                                        | 191  | `/ru/partnerships`      | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 22  | `/ru/services`          | `ru` | Услуги &#124; Nexora                                             | 190  | `/ru/services`          | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 23  | `/ru/services/ai_agent` | `ru` | AI-агенты и автоматизация бизнеса &#124; Nexora                  | 146  | `/ru/services/ai_agent` | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 24  | `/ru/solutions`         | `ru` | Решения &#124; Nexora                                            | 194  | `/ru/solutions`         | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 25  | `/services`             | `en` | Services &#124; Nexora                                           | 195  | `/services`             | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 26  | `/services/ai_agent`    | `en` | AI Agents &amp; Business Automation &#124; Nexora                | 142  | `/services/ai_agent`    | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |
| 27  | `/solutions`            | `en` | Solutions &#124; Nexora                                          | 158  | `/solutions`            | en, hy, ru, x-default | 1   | yes     | Organization + WebSite + WebPage + BreadcrumbList | —                 |

---

## What this table still cannot tell you

- **Whether any of these pages are indexed.** They return correct HTML with correct metadata.
  That is a precondition for indexing, not evidence of it. Only Search Console and Bing
  Webmaster Tools can answer the question, and neither is registered - see
  `SEO_MANUAL_TASKS.md` M4 and M5. `CANNOT DETERMINE`.
- **Whether production serves these documents at these URLs.** This table is built from
  `dist/`. As of 2026-11-06, `npm run verify:live-seo -- https://nexoratechnology.org` reports
  28 failures against the live site, because the host is not running the committed nginx
  configuration. `CANNOT DETERMINE` until M1 is done.
- **Rankings, traffic or backlinks.** Not observable from here, and not estimated.

## How to regenerate

There is no committed generator for this file - it is a point-in-time document, and the
per-build enforcement lives in `scripts/verify-seo.mjs` instead. To rebuild the matrix, run a
production build and read the same fields out of `dist/nexora/browser/**/index.html`.
