/**
 * Smoke tests (QA_PLAN §2.1)
 *
 * Runs against every project (iphone-se, pixel-7, desktop, no-js).
 * Verifies each surface loads, key structural elements are present,
 * and there are no JS console errors on the most critical pages.
 */
import { test, expect, Page } from '@playwright/test';
import { site } from './helpers';

// All 12 primary EN surfaces + language-mirrored RU variants
const EN_SURFACES = [
  { path: site('/'),                      label: 'home' },
  { path: site('/pipeline/'),             label: 'pipeline' },
  { path: site('/stage/assessment/'),     label: 'stage-assessment' },
  { path: site('/stage/pre-flight/'),     label: 'stage-pre-flight' },
  { path: site('/stage/migration/'),      label: 'stage-migration' },
  { path: site('/stage/initialization/'), label: 'stage-initialization' },
  { path: site('/stage/scaling/'),        label: 'stage-scaling' },
  { path: site('/calculator/'),           label: 'calculator' },
  { path: site('/offices/'),              label: 'offices' },
  { path: site('/forms/'),               label: 'forms' },
  { path: site('/arrival/'),              label: 'arrival' },
  { path: site('/exit/'),                 label: 'exit' },
];

const RU_SURFACES = [
  { path: site('/ru/'),                     label: 'ru-home' },
  { path: site('/ru/pipeline/'),            label: 'ru-pipeline' },
  { path: site('/ru/stage/assessment/'),    label: 'ru-stage-assessment' },
  // Calculator is EN-only by design (no /ru/calculator/ page)
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

  // Filter out dev-environment noise that is not present in production:
  // - Cloudflare beacon CORS preflight failures (origin localhost is not whitelisted by CF) — Chromium + WebKit phrasings differ
  // - meta-tag CSP `frame-ancestors` warning (browser ignores it in <meta>; production sets it via header)
  const isDevOnly = (msg: string) =>
    msg.includes('cloudflareinsights') ||
    msg.includes('cdn-cgi/rum') ||
    msg.includes('Access-Control-Allow-Origin') ||
    msg.includes('frame-ancestors') ||
    msg.includes('ERR_FAILED') ||
    msg.includes('Failed to load resource');

  for (const path of [site('/'), site('/pipeline/'), site('/calculator/'), site('/stage/assessment/')]) {
    test(`no errors on ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(path);
      await page.waitForTimeout(500);
      const real = errors.filter(e => !isDevOnly(e));
      expect(real, `Console errors on ${path}: ${real.join('; ')}`).toHaveLength(0);
    });
  }
});

// ── CSP and security headers ─────────────────────────────────────────────────

test('CSP is present and properly scoped', async ({ page }) => {
  const response = await page.goto(site('/'));
  const headers = response?.headers() ?? {};

  const metaCsp = await page.locator('meta[http-equiv="Content-Security-Policy"]')
    .getAttribute('content');
  const headerCsp = headers['content-security-policy'] ?? '';
  const csp = metaCsp ?? headerCsp;

  expect(csp, 'CSP should be present').toBeTruthy();
  // Hard requirements that don't depend on the Alpine build choice.
  // frame-ancestors is intentionally NOT asserted here — browsers ignore it
  // in <meta>; production enforces it via the Cloudflare Pages HTTP header.
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("form-action https://formspree.io");
});

// ── No inline <style> blocks (shortcode guard) ───────────────────────────────

test('no inline <style> blocks on stage pages', async ({ page }) => {
  for (const path of [
    site('/stage/assessment/'),
    site('/stage/pre-flight/'),
    site('/stage/migration/'),
    site('/stage/initialization/'),
    site('/stage/scaling/'),
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
  await page.goto(site('/'));
  await page.waitForLoadState('networkidle');
  expect(insecure, `Mixed content requests: ${insecure.join(', ')}`).toHaveLength(0);
});

// ── 404 page ─────────────────────────────────────────────────────────────────

test('404 page renders for unknown URL', async ({ page }) => {
  const response = await page.goto(site('/this-page-does-not-exist-at-all/'));
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1').first()).toBeVisible();
});

// ── OG and SEO meta ──────────────────────────────────────────────────────────

const OG_SURFACES = [site('/'), site('/pipeline/'), site('/calculator/'), site('/stage/pre-flight/')];

for (const path of OG_SURFACES) {
  test(`OG image meta present on ${path}`, async ({ page }) => {
    await page.goto(path);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage, `og:image missing on ${path}`).toBeTruthy();
    expect(ogImage).toContain('.png');
  });
}

test('hreflang alternates resolve on home', async ({ page }) => {
  await page.goto(site('/'));
  const ruHref = await page.locator('link[hreflang="ru"]').getAttribute('href');
  expect(ruHref).toBeTruthy();
  const response = await page.goto(ruHref!);
  expect(response?.status()).toBe(200);
});

// ── Language switcher links resolve ──────────────────────────────────────────

test('language switcher on pipeline links to RU without 404', async ({ page }) => {
  await page.goto(site('/pipeline/'));
  // The lang-menu contains a link to the RU variant
  const ruLink = page.locator('.lang-menu a[hreflang="ru"]');
  const href = await ruLink.getAttribute('href');
  expect(href).toBeTruthy();
  const response = await page.goto(href!);
  expect(response?.status()).toBe(200);
});

// ── Pipeline JSON feed ───────────────────────────────────────────────────────

test('pipeline JSON feed resolves and has expected shape', async ({ page }) => {
  const response = await page.goto(site('/pipeline/index.json'));
  expect(response?.status()).toBe(200);
  const body = await response?.text();
  const json = JSON.parse(body ?? 'null');
  expect(Array.isArray(json)).toBe(true);
  expect(json.length).toBeGreaterThanOrEqual(5);
  expect(json[0]).toHaveProperty('weight');
  expect(json[0]).toHaveProperty('cats');
});

// ── Cloudflare analytics beacon present ──────────────────────────────────────

test('Cloudflare analytics script tag present on home', async ({ page }) => {
  await page.goto(site('/'));
  const beacon = page.locator('script[src*="cloudflareinsights"]');
  await expect(beacon).toHaveCount(1);
});

// ── External target="_blank" links have rel=noopener ─────────────────────────
// Reverse-tabnabbing guard. Source links live on stage/arrival/exit pages too,
// not just home — sweep every shareable surface.

const NOOPENER_SURFACES = [
  '/',
  '/pipeline/',
  '/calculator/',
  '/stage/assessment/',
  '/stage/pre-flight/',
  '/stage/migration/',
  '/stage/initialization/',
  '/stage/scaling/',
  '/arrival/',
  '/exit/',
];

for (const path of NOOPENER_SURFACES) {
  test(`all target=_blank links have rel=noopener on ${path}`, async ({ page }) => {
    await page.goto(site(path));
    const unsafe = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[target="_blank"]'))
        .filter(a => !a.getAttribute('rel')?.includes('noopener'))
        .map(a => (a as HTMLAnchorElement).href);
    });
    expect(unsafe, `Links missing rel=noopener on ${path}: ${unsafe.join(', ')}`).toHaveLength(0);
  });
}
