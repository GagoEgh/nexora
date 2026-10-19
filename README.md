# Nexora

Marketing website for Nexora, a technology development and AI solutions partner. The site is a
single-page Angular application with localized content in English, Armenian and Russian.

## Stack

- Angular 22 with standalone components, signals and zoneless change detection
- Angular Material 22 themed through the Nexora design tokens in `src/styles`
- Intlayer for localization: each component keeps its copy in a sibling `*.content.ts` file.
  English pages live at the bare paths, Armenian and Russian pages under `/hy` and `/ru`
- Vitest for unit tests, Playwright for end-to-end tests, ESLint and Prettier for code quality

## Requirements

- Node.js 24 and npm 12 (the versions the project is developed and verified with; CI uses Node 24)
- Chromium for Playwright: `npx playwright install chromium` after installing dependencies

## Commands

| Command                | What it does                                                             |
| ---------------------- | ------------------------------------------------------------------------ |
| `npm ci`               | Installs dependencies and the pre-commit formatting hook                 |
| `npm start`            | Serves the application on `http://localhost:4200/` with live reload      |
| `npm run build`        | Production build into `dist/nexora`                                      |
| `npm run watch`        | Development build that rebuilds on change                                |
| `npm test`             | Unit tests with Vitest                                                   |
| `npm run lint`         | ESLint for TypeScript and templates                                      |
| `npm run e2e`          | Playwright tests against a dev server on port 4300 (Chromium only)       |
| `npm run format`       | Formats the project with Prettier                                        |
| `npm run format:check` | Verifies formatting; also run by the pre-commit hook and the CI workflow |

## Project layout

- `src/app/core`: application-wide building blocks (icon registry, locale labels)
- `src/app/layout`: header and footer shell
- `src/app/pages`: lazily loaded routes; home sections live under `pages/home`
- `src/app/shared/ui`: reusable presentational components
- `src/styles`: design tokens, Material theme overrides and mixins
- `public`: brand assets and the SVG icon catalogue
- `e2e`: Playwright specs that check the sections against the design mockups

Intlayer generates its dictionaries and types into `.intlayer/` during serve, test and build; the
folder is ignored by Git and never edited by hand.
