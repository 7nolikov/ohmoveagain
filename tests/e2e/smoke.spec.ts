/**
 * Smoke tests (QA_PLAN §2.1)
 *
 * Runs against every project (iphone-se, pixel-7, desktop, no-js).
 * Verifies each surface loads, key structural elements are present,
 * and there are no JS console errors on the most critical pages.
 */
import { test, expect, Page } from '@playwright/test';

// All 12 primary EN surfaces + language-mirrored RU variants
const EN_SURFACES = [
  { path: '/',                    label: 'home' },
  { path: '/pipeline/',           label: 'pipeline' },
  { path: '/stage/assessment/',   label: 'stage-assessment' },
  { path: '/stage/pre-flight/',   label: 'stage-pre-flight' },
  { path: '/stage/migration/',    label: 'stage-migration' },
  { path: '/stage/initialization/', label: 'stage-initialization' },
  { path: '/stage/scaling/',      label: 'stage-scaling' },
  { path: '/calculator/',         label: 'calculator' },
  { path: '/offices/',            label: 'offices' },
  { path: '/forms/',              label: 'forms' },
  { path: '/arrival/',            label: 'arrival' },
  { path: '/exit/',               label: 'exit' },
];

const RU_SURFACES = [
  { path: '/ru/',                 label: 'ru-home' },
  { path: '/ru/pipeline/',        label: 'ru-pipeline' },
  { path: '/ru/stage/assessment/', label: 'ru-stage-assessment' },
  { path: '/ru/calculator/',      label: 'ru-calculator' },
];

async function expectPageLoads(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), `${path} should return 200`).toBe(200);
  // Page should have a meaningful <h1>
  await expect(page.locator('h1').first()).toBeVisible();
}

// ── EN surfaces: all load ────────────────────────────────────────────────────

for (const { path, label } of EN_SURFACES) {
  test(`loads EN ${label} (${path})`, async ({ page }) => {
    await expectPageLoads(page, path);
  });
}

// ── RU surfaces: all load ────────────────────────────────────────────────────

for (const { path, label } of RU_SURFACES) {
  test(`loads RU ${label} (${path})`, async ({ page }) => {
    await expectPageLoads(page, path);
  });
}

// ── No JS console errors on critical pages ───────────────────────────────────

test.describe('no JS console errors', () => {
  // Only run in JS-enabled projects; skip no-js
  test.skip(({ browserName, javaScriptEnabled }) => !javaScriptEnabled,
    'Console-error check only applies when JS is enabled');

  for (const path of ['/', '/pipeline/', '/calculator/', '/stage/assessment/']) {
    test(`no errors on ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(path);
      // Wait for Alpine to hydrate
      await page.waitForTimeout(500);
      expect(errors, `Console errors on ${path}: ${errors.join('; ')}`).toHaveLength(0);
    });
  }
});

// ── CSP and security headers ─────────────────────────────────────────────────

test('CSP header present and does not contain unsafe-eval', async ({ page }) => {
  const response = await page.goto('/');
  const headers = response?.headers() ?? {};

  // Static hosts may set CSP via meta tag; check both locations
  const metaCsp = await page.locator('meta[http-equiv="Content-Security-Policy"]')
    .getAttribute('content');
  const headerCsp = headers['content-security-policy'] ?? '';
  const csp = metaCsp ?? headerCsp;

  expect(csp, 'CSP should be present').toBeTruthy();
  expect(csp, "CSP should not contain 'unsafe-eval'").not.toContain("'unsafe-eval'");
});

// ── No inline <style> blocks (shortcode guard) ───────────────────────────────

test('no inline <style> blocks on stage pages', async ({ page }) => {
  for (const path of [
    '/stage/assessment/',
    '/stage/pre-flight/',
    '/stage/migration/',
    '/stage/initialization/',
    '/stage/scaling/',
  ]) {
    await page.goto(path);
    const count = await page.locator('body style').count();
    expect(count, `Inline <style> found in <body> on ${path}`).toBe(0);
  }
});

// ── No mixed content ─────────────────────────────────────────────────────────

test('no mixed content on home', async ({ page }) => {
  const insecure: string[] = [];
  page.on('requestfailed', req => {
    if (req.url().startsWith('http://') && !req.url().startsWith(page.url()))
      insecure.push(req.url());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(insecure, `Mixed content requests: ${insecure.join(', ')}`).toHaveLength(0);
});

// ── 404 page ─────────────────────────────────────────────────────────────────

test('404 page renders for unknown URL', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist-at-all/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1').first()).toBeVisible();
});

// ── OG and SEO meta ──────────────────────────────────────────────────────────

const OG_SURFACES = ['/', '/pipeline/', '/calculator/', '/stage/pre-flight/'];

for (const path of OG_SURFACES) {
  test(`OG image meta present on ${path}`, async ({ page }) => {
    await page.goto(path);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage, `og:image missing on ${path}`).toBeTruthy();
    expect(ogImage).toContain('.png');
  });
}

test('hreflang alternates resolve on home', async ({ page }) => {
  await page.goto('/');
  const ruHref = await page.locator('link[hreflang="ru"]').getAttribute('href');
  expect(ruHref).toBeTruthy();
  const response = await page.goto(ruHref!);
  expect(response?.status()).toBe(200);
});

// ── Language switcher links resolve ──────────────────────────────────────────

test('language switcher on pipeline links to RU without 404', async ({ page }) => {
  await page.goto('/pipeline/');
  // The lang-menu contains a link to the RU variant
  const ruLink = page.locator('.lang-menu a[hreflang="ru"]');
  const href = await ruLink.getAttribute('href');
  expect(href).toBeTruthy();
  const response = await page.goto(href!);
  expect(response?.status()).toBe(200);
});

// ── Pipeline JSON feed ───────────────────────────────────────────────────────

test('pipeline JSON feed resolves and has expected shape', async ({ page }) => {
  const response = await page.goto('/pipeline/index.json');
  expect(response?.status()).toBe(200);
  const body = await response?.text();
  const json = JSON.parse(body ?? 'null');
  expect(json).toHaveProperty('stages');
  expect(Array.isArray(json.stages)).toBe(true);
  expect(json.stages.length).toBeGreaterThanOrEqual(5);
});

// ── Cloudflare analytics beacon present ──────────────────────────────────────

test('Cloudflare analytics script tag present on home', async ({ page }) => {
  await page.goto('/');
  const beacon = page.locator('script[src*="cloudflareinsights"]');
  await expect(beacon).toHaveCount(1);
});

// ── External target="_blank" links have rel=noopener ─────────────────────────

test('all target=_blank links have rel=noopener', async ({ page }) => {
  await page.goto('/');
  const unsafe = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[target="_blank"]'))
      .filter(a => !a.getAttribute('rel')?.includes('noopener'))
      .map(a => (a as HTMLAnchorElement).href);
  });
  expect(unsafe, `Links missing rel=noopener: ${unsafe.join(', ')}`).toHaveLength(0);
});
