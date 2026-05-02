import { defineConfig, devices } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:1313';
const IS_CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  // Static Hugo site renders in <100ms; 10s surfaces broken selectors fast.
  timeout: 10_000,
  retries: IS_CI ? 1 : 0,
  // ubuntu-latest has 4 vCPU; 2 left ~50% throughput on the table.
  workers: IS_CI ? 4 : undefined,
  reporter: IS_CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list'], ['html']],
  use: {
    baseURL: BASE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  // Local dev: start hugo server automatically. In CI the server is started
  // by the workflow before Playwright runs, so we reuse it.
  webServer: IS_CI
    ? undefined
    : {
        command: 'hugo server --port 1313',
        url: 'http://localhost:1313/',
        reuseExistingServer: true,
        timeout: 60_000,
      },

  projects: [
    {
      name: 'iphone-se',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'pixel-7',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'ipad-mini',
      use: { ...devices['iPad Mini'] },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'no-js',
      // Scope to the dedicated no-js suite. Other suites either gate on
      // javaScriptEnabled (skip at runtime) or duplicate desktop coverage.
      testMatch: /no-js\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        javaScriptEnabled: false,
      },
    },
  ],
});
