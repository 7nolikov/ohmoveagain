import { defineConfig, devices } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:1313/ohmoveagain/';
const IS_CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 2 : undefined,
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
        command: 'hugo server --port 1313 --baseURL http://localhost:1313/ohmoveagain/',
        url: 'http://localhost:1313/ohmoveagain/',
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
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        javaScriptEnabled: false,
      },
    },
  ],
});
