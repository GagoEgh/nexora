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

## Requirements

- Node.js 24 and npm 12 (the versions the project is developed and verified with; CI uses Node 24)
- Chromium for Playwright: `npx playwright install chromium` after installing dependencies

## Commands

| Command                    | What it does                                                             |
| -------------------------- | ------------------------------------------------------------------------ |
| `npm ci`                   | Installs dependencies and the pre-commit formatting hook                 |
| `npm start`                | Serves the application on `http://localhost:4200/` with live reload      |
| `npm run build`            | Production build into `dist/nexora`                                      |
| `npm run watch`            | Development build that rebuilds on change                                |
| `npm test`                 | Unit tests with Vitest                                                   |
| `npm run test:scripts`     | Tests for the build and verification scripts in `scripts/`               |
| `npm run typecheck`        | Type-checks the app, the unit specs and the Playwright specs             |
| `npm run lint`             | ESLint for TypeScript and templates                                      |
| `npm run e2e`              | Playwright tests against a dev server on port 4300 (Chromium only)       |
| `npm run verify:prerender` | Checks the built pages still work without JavaScript (needs a build)     |
| `npm run format`           | Formats the project with Prettier                                        |
| `npm run format:check`     | Verifies formatting; also run by the pre-commit hook and the CI workflow |

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

The build is fully static (`outputMode: "static"`, 33 prerendered routes), so the host only has
to serve files and answer an unknown URL with the prerendered 404 document.
`public/_redirects` does that for Netlify, mapping each locale prefix to its own `not-found`
page with a real `404` status. A different host needs the equivalent rewrite rules; without them
an unknown URL falls through to the host's own error page instead of the localized one.

Because the pages are prerendered, the header's Services and language controls have to work
before Angular boots - they sit in `@defer` placeholders, and a placeholder is what gets
prerendered. Both are ordinary links, with the language pill pointing at the footer switcher.
`npm run verify:prerender` asserts that over every built page; it cannot be a Playwright spec,
because `ng serve` answers with an empty `<app-root>` rather than prerendered markup, so there
is nothing for a scriptless browser to use there.

## Generated content

Intlayer generates dictionaries into `.intlayer/` and TypeScript declarations into
`intlayer-types/` during serve, test and build. Both folders are ignored by Git and never edited
by hand. The declarations sit outside `.intlayer/` deliberately: Angular's dev server does not
watch dot-directories, so types generated there stay stale until `ng serve` restarts.

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
