/**
 * No-JS / SEO tests (QA_PLAN §2.8)
 *
 * Runs ONLY in the no-js Playwright project (javaScriptEnabled: false).
 * Verifies: static counter fallbacks, CTA links, OG meta, canonical, hreflang.
 */
import { test, expect } from '@playwright/test';
import { site } from './helpers';

// Only run in the no-js project
test.skip(({ javaScriptEnabled }) => !!javaScriptEnabled, 'no-JS tests only run in the no-js project');

// ── /pipeline/ shows numeric counters, not blank ─────────────────────────────
// F6 fix: x-text spans must have build-time fallback content so bots / NoScript
// users see "0 of 64 · 0%" instead of "· %".

test('/pipeline/ x-text spans have non-empty build-time fallback', async ({ page }) => {
  await page.goto(site('/pipeline/'));

  const emptySpans = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[x-text]'))
      .filter(el => el.textContent?.trim() === '')
      .map(el => el.getAttribute('x-text'))
  );

  expect(
    emptySpans,
    `Empty x-text spans (no build-time fallback): ${emptySpans.join(', ')}`
  ).toHaveLength(0);
});

test('/pipeline/ progress text contains "of" and "%"', async ({ page }) => {
  await page.goto(site('/pipeline/'));
  const bodyText = await page.locator('body').innerText();
  // Should see something like "0 of 64" or "0 of N" — not blank
  expect(bodyText).toMatch(/\d+\s+of\s+\d+/i);
  expect(bodyText).toMatch(/\d+%/);
});

// ── Every primary CTA is a real <a href> ─────────────────────────────────────
// With JS disabled, navigation must never require a click handler — only links.

const CTA_SURFACES = [
  { path: site('/'),          label: 'home' },
  { path: site('/pipeline/'), label: 'pipeline' },
];

for (const { path, label } of CTA_SURFACES) {
  test(`primary CTAs on ${label} are real links`, async ({ page }) => {
    await page.goto(path);
    // Every .btn element should be an <a> or inside an <a>, not a bare <button>
    // that requires JS to navigate
    const jsOnlyBtns = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.btn, .hero-actions a, .hero-actions button'))
        .filter(el => {
          const tag = el.tagName.toLowerCase();
          if (tag === 'a') return false; // link is fine
          if (tag === 'button') {
            // Button is ok if it's a form submit or has a data-href for progressive enhancement
            return !el.closest('form') && !el.hasAttribute('data-href');
          }
          return false;
        })
        .map(el => el.textContent?.trim().slice(0, 40))
    );
    expect(
      jsOnlyBtns,
      `JS-only navigation buttons on ${path}: ${jsOnlyBtns.join(', ')}`
    ).toHaveLength(0);
  });
}

// ── OG meta present on every shareable URL ───────────────────────────────────

const SHAREABLE = [
  site('/'),
  site('/pipeline/'),
  site('/calculator/'),
  site('/stage/pre-flight/'),
];

for (const path of SHAREABLE) {
  test(`OG + Twitter card meta present on ${path}`, async ({ page }) => {
    await page.goto(path);
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDesc  = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    const twCard  = await page.locator('meta[name="twitter:card"]').getAttribute('content');

    expect(ogTitle,  `og:title missing on ${path}`).toBeTruthy();
    expect(ogDesc,   `og:description missing on ${path}`).toBeTruthy();
    expect(ogImage,  `og:image missing on ${path}`).toBeTruthy();
    expect(twCard,   `twitter:card missing on ${path}`).toBeTruthy();
    expect(ogImage).toMatch(/\.(png|jpg|webp)/i);
  });
}

// ── Canonical link equals current URL ────────────────────────────────────────

for (const path of SHAREABLE) {
  test(`canonical link on ${path} matches page URL`, async ({ page }) => {
    await page.goto(path);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical, `canonical missing on ${path}`).toBeTruthy();
    // Canonical must include the path (may differ in scheme/host in CI vs local)
    const url = new URL(page.url());
    expect(canonical, `canonical does not contain path ${url.pathname}`).toContain(url.pathname);
  });
}

// ── hreflang alternates resolve ───────────────────────────────────────────────

test('hreflang alternates on home resolve without redirect', async ({ page }) => {
  await page.goto(site('/'));
  const hrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('link[hreflang]'))
      .map(el => ({ lang: el.getAttribute('hreflang'), href: el.getAttribute('href') }))
  );

  expect(hrefs.length, 'No hreflang links on home').toBeGreaterThan(0);

  for (const { lang, href } of hrefs) {
    if (!href) continue;
    const response = await page.goto(href);
    expect(response?.status(), `hreflang="${lang}" href="${href}" returned non-200`).toBe(200);
  }
});
