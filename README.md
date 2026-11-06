# Nexora

Marketing website for Nexora, a technology development and AI solutions partner. The site is a
single-page Angular application with localized content in English, Armenian and Russian.

## Stack

- Angular 22 with standalone components, signals and zoneless change detection
- Angular Material 22 themed through the Nexora design tokens in `src/styles`
- Intlayer for localization: each component keeps its copy in a sibling `*.content.ts` file.
  English pages live at the bare paths, Armenian and Russian pages under `/hy` and `/ru`
- Vitest for unit tests, Playwright for end-to-end tests, ESLint and Prettier for code quality
- Self-hosted Inter for Latin and Cyrillic, with Noto Sans Armenian for the Armenian script
  (Inter has no Armenian glyphs); both are subset by `unicode-range` in `src/styles/_fonts.scss`

## Upgrading Angular

The contact form is built on **`@angular/forms/signals`**. Every function it uses - `form()`,
`submit()`, `required()`, `email()`, `maxLength()`, `readonly()`, `FormField` and
`provideSignalFormsConfig()` - is marked `@publicApi 22.0` in the installed package, so it carries
the same stability guarantee as the rest of the framework. It is **not** experimental, and an
earlier version of this section said otherwise.

What is still worth knowing is that the API is new in 22 and the form sits in the site's primary
conversion path, so it has had fewer releases of real-world use than Reactive Forms.

The `@angular/*` packages are already locked in step by their own peer dependencies
(`@angular/forms` requires `@angular/core` at an exact version), so they can only be upgraded
together; pinning one of them on its own breaks resolution rather than protecting anything.
What protects the form is running its tests on every upgrade:

```bash
npm test -- --include "src/app/pages/contact/**/*.spec.ts"
npm run e2e          # contact.spec.ts covers submit, failure and duplicate handling
```

Treat a failure there as a blocking upgrade issue, not a flake.

## Requirements

- Node.js 24 and npm 12 (the versions the project is developed and verified with; CI uses Node 24)
- Chromium for Playwright: `npx playwright install chromium` after installing dependencies

## Commands

| Command                    | What it does                                                                    |
| -------------------------- | ------------------------------------------------------------------------------- |
| `npm ci`                   | Installs dependencies and the pre-commit formatting hook                        |
| `npm start`                | Serves the application on `http://localhost:4200/` with live reload             |
| `npm run build`            | Production build into `dist/nexora`                                             |
| `npm run watch`            | Development build that rebuilds on change                                       |
| `npm test`                 | Unit tests with Vitest                                                          |
| `npm run test:scripts`     | Tests for the build and verification scripts in `scripts/`                      |
| `npm run typecheck`        | Type-checks the app, the unit specs and the Playwright specs                    |
| `npm run lint`             | ESLint for TypeScript and templates                                             |
| `npm run e2e`              | Playwright tests against a dev server on port 4300 (Chromium only)              |
| `npm run verify:prerender` | Checks the built pages still work without JavaScript (needs a build)            |
| `npm run verify:headers`   | Checks `_headers` matches the build and the nginx copy matches `_headers`       |
| `npm run verify:bundle`    | Checks no route's real first-load JavaScript exceeds its budget (needs a build) |
| `npm run format`           | Formats the project with Prettier                                               |
| `npm run format:check`     | Verifies formatting; also run by the pre-commit hook and the CI workflow        |

## Project layout

- `src/app/core`: application-wide building blocks — `icons` (SVG registry and catalogue),
  `i18n` (locale routing guards, switcher, path pipe) and `seo` (per-route document metadata)
- `src/app/layout`: header and footer shell
- `src/app/pages`: lazily loaded routes; home sections live under `pages/home`
- `src/app/shared/ui`: reusable presentational components
- `src/styles`: design tokens, Material theme overrides and mixins
- `public`: brand assets, self-hosted fonts and the SVG icon catalogue
- `src/environments`: build-time configuration; the production build swaps `environment.ts` for
  `environment.production.ts` through `fileReplacements`
- `e2e`: Playwright specs that check the sections against the design mockups
- `deploy/nginx`: the server block for the static host, plus the header snippet generated
  from `public/_headers` - see Hosting

## Configuration

`src/environments/environment.ts` holds the values that differ between a local run and a
deployment. Only two exist:

- `apiOrigin` — where the contact API is served from. **Empty in production, because no contact
  API is deployed**: the form reports "not configured" and points the visitor at the published
  email address rather than posting into the void. See [CONTACT_API.md](CONTACT_API.md) for the
  request and response contract a backend has to implement, and the steps to switch the form on.
- `siteOrigin` — the canonical origin for `<link rel="canonical">`, Open Graph URLs and
  `sitemap.xml`. Deliberately identical in both files so a preview build cannot advertise itself
  as the canonical copy.

## Hosting

The build is fully static (`outputMode: "static"`, 27 prerendered routes - the nine pages in
`DOCUMENT_META_PAGES` times three locales), so the host only has to serve files and answer an
unknown URL with the prerendered 404 document. `public/_redirects` does that for Netlify,
mapping each locale prefix to its own `not-found` page with a real `404` status. A different
host needs the equivalent rewrite rules; without them an unknown URL falls through to the
host's own error page instead of the localized one. `deploy/nginx/nexora-site.conf` carries
those rules for nginx.

`public/_headers` carries the response headers: an enforced CSP plus HSTS, `nosniff`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and `Cross-Origin-Opener-Policy`.
Netlify reads it from the publish root, which is where `angular.json` copies all of `public/`.
Another host needs the same headers expressed its own way - they are not in the bundle, so
nothing in the application fails if they are missing.

> **The live site is not yet on a host that reads either file.** `https://nexoratechnology.org`
> is served by nginx, and currently answers every path with a single placeholder document
> rather than this build. Checked against the live response: `X-Content-Type-Options`,
> `X-Frame-Options`, `Referrer-Policy` and HSTS are present, but **no** `Content-Security-Policy`,
> `Permissions-Policy` or `Cross-Origin-Opener-Policy` — so the hash-based CSP that
> `verify:headers` guards is not in force in production, and an unknown URL answers `200`
> instead of reaching the localized 404.
>
> `deploy/nginx/` exists to close that gap. `nexora-site.conf` is a server block that
> re-expresses `_redirects` as locale-ordered `error_page` rules and includes
> `nexora-headers.conf`, which is **generated from `public/_headers`** by
> `npm run verify:headers -- --write`. `_headers` stays the single source of truth — its CSP
> `script-src` list is regenerated from the build, so a hand-written second copy would go stale
> silently and block hydration. `npm run verify:headers` fails when the two disagree, in CI as
> well, so the nginx copy cannot drift from the policy the build was checked against.
>
> Deploying it: copy the two files into place as the header comment in `nexora-site.conf`
> describes, publish `dist/nexora/browser` to its `root`, then confirm with
> `curl -I https://nexoratechnology.org` that all seven headers come back and that a nonsense
> URL answers `404`.

The CSP allows inline scripts **by hash**, not `'unsafe-inline'`. Three of the inline scripts
in a prerendered document are executable - Angular's event-dispatch contract, the jsaction
bootstrap and the critical-CSS media restore - and the bootstrap's body lists the event types
the page's components use, so its hash changes when a component starts listening for something
new. `npm run verify:headers` recomputes every hash from `dist/` and fails if the file and the
build disagree in either direction; `-- --write` regenerates the list after an intentional
change. CI runs it after the build. `style-src` does keep `'unsafe-inline'`: critical CSS is
inlined per page (12-30 `<style>` blocks depending on the route), so one static header cannot
hash it, and turning critical CSS off to avoid that would cost LCP.

When the contact API is deployed, its origin goes in **two** places - `apiOrigin` in
`src/environments/environment.production.ts` and `connect-src` in `public/_headers`. The form
posts with XHR, so a CSP that does not list it blocks the request. `verify:headers` asserts the
two agree, so changing one and forgetting the other fails the build.

Because the pages are prerendered, the header's Services and language controls have to work
before Angular boots - they sit in `@defer` placeholders, and a placeholder is what gets
prerendered. Both are ordinary links, with the language pill pointing at the footer switcher.
`npm run verify:prerender` asserts that over every built page; it cannot be a Playwright spec,
because `ng serve` answers with an empty `<app-root>` rather than prerendered markup, so there
is nothing for a scriptless browser to use there.

## Troubleshooting

**A production build appears to hang while `npm start` is running.** Both share
`.angular/cache`, and the two writers contend: the build sits at near-zero CPU for minutes
instead of failing. Stop the dev server and rebuild, or build from a separate checkout. The
cache path is a single global setting (`cli.cache.path`), so it cannot be varied per
configuration - using a second checkout is the only clean separation. CI is unaffected, since
it builds from a clean tree with no server running.

## Generated content

Intlayer generates dictionaries into `.intlayer/` and TypeScript declarations into
`intlayer-types/` during serve, test and build. Both folders are ignored by Git and never edited
by hand. The declarations sit outside `.intlayer/` deliberately: Angular's dev server does not
watch dot-directories, so types generated there stay stale until `ng serve` restarts.

`typecheck` generates them as well, through the same lock, via a `pretypecheck` hook. It is
not a build, but `tsconfig.app.json` and `tsconfig.spec.json` both include `intlayer-types/`,
and without those declarations `DeclaredLocales` widens from the three configured locales to
Intlayer's full list of 298. Every `Record<AppLocale, …>` then fails with TS2740 pointing at
`locale-labels.ts` and `document-meta.ts` - application code that is perfectly correct - which
sends you hunting in the wrong place. A clean checkout type-checks before it has ever built,
both in CI and locally, so the generation cannot be left to the build step.

Because every one of those tasks regenerates the same files, `start`, `build`, `watch`, `test`
and `e2e` run through `scripts/intlayer-lock.mjs`, which takes an exclusive lock while Intlayer
generates. Running two of them at once is therefore serialized rather than corrupting the shared
declarations; the second one prints a line saying it is waiting.

A one-shot task (`build`, `test`) holds the lock until it exits. A watching task (`start`,
`watch`, `e2e`) hands it back as soon as Intlayer reports the files are written — it watches for
`status: "done"` in `.intlayer/cache/intlayer-prepared.lock` — so a dev server no longer blocks
`npm test` and `npm run build` for as long as it is running. The trade is that a regeneration
triggered by editing a content file is not covered by the lock, so a build started in that same
moment can still overlap it.
