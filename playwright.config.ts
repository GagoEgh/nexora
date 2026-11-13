import { defineConfig, devices } from '@playwright/test';

/**
 * Specs that only mean anything on a device where `(hover: none)` matches.
 *
 * Setting `viewport` on a desktop project still leaves `hover: hover` matching, so a
 * phone-sized desktop context is not a phone. Without a project below that is genuinely
 * `isMobile`, nothing ever executes the no-pointer branch of the stylesheets.
 *
 * The portfolio card makes that gap expensive, because it chooses its trigger on exactly that
 * feature: a pointer turns the card by hovering it, and a touch device turns it by tapping,
 * since `mouseenter` either never arrives there or arrives once and sticks. The tap path is
 * reachable from no other project, so without the one below half of the card's content would
 * be desktop-only and nothing would say so.
 */
const TOUCH_SPECS = '**/*.touch.spec.ts';

/** Repeated from the top-level `testIgnore` so a project-level override cannot drop it. */
const DESKTOP_IGNORE = ['**/prerendered/**', TOUCH_SPECS];

export default defineConfig({
  testDir: './e2e',
  testIgnore: '**/prerendered/**',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env['PLAYWRIGHT_TEST_BASE_URL'] ?? 'http://localhost:4200',
    trace: 'on-first-retry',
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: DESKTOP_IGNORE,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: DESKTOP_IGNORE,
    },
    {
      // Pixel 7 rather than a phone-sized desktop context: it is `isMobile`, so `hover: none`
      // and `pointer: coarse` really match. It is also Chromium, so this project runs on the
      // one browser CI already installs (`.github/workflows/ci.yml:31`).
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      testMatch: TOUCH_SPECS,
    },
  ],
});
