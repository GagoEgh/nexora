import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env['PLAYWRIGHT_PRERENDER_PORT'] ?? 4401);

export default defineConfig({
  testDir: './e2e/prerendered',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/prerendered' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    reducedMotion: 'reduce',
  },
  webServer: {
    command: `node scripts/serve-dist.mjs dist/nexora/browser ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env['CI'],
    stdout: 'pipe',
  },
  projects: [
    {
      name: 'chromium-prerendered',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
