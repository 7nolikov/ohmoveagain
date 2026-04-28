/**
 * Subscribe form tests (QA_PLAN §2.6)
 *
 * Verifies: form and privacy disclosure render, empty submit validation,
 * loading state on submit, success state on mocked OK, error states on mocked
 * failure and network error, Formspree is the only recipient.
 *
 * All Formspree calls are intercepted — no real HTTP requests are made.
 */
import { test, expect, Route } from '@playwright/test';

test.skip(({ javaScriptEnabled }) => !javaScriptEnabled, 'Subscribe form requires Alpine.js');

const HOME = '/';
const SUBSCRIBE_PAGE = '/subscribe/';

// ── Rendering ─────────────────────────────────────────────────────────────────

test('subscribe form renders on home page', async ({ page }) => {
  await page.goto(HOME);
  await expect(page.locator('form.subscribe-form')).toBeVisible();
  await expect(page.locator('#sub-email')).toBeVisible();
  await expect(page.locator('form.subscribe-form button[type="submit"]')).toBeVisible();
});

test('privacy disclosure (subscribe_delivery) is visible with the form', async ({ page }) => {
  await page.goto(HOME);
  // The delivery disclosure paragraph is inside the subscribe-form
  const disclosure = page.locator('form.subscribe-form p').last();
  await expect(disclosure).toBeVisible();
  const text = await disclosure.innerText();
  // Must mention something about delivery / email / notification (not empty)
  expect(text.length).toBeGreaterThan(10);
});

test('standalone /subscribe/ page renders the form', async ({ page }) => {
  const response = await page.goto(SUBSCRIBE_PAGE);
  expect(response?.status()).toBe(200);
  await expect(page.locator('form.subscribe-form, .watch-cta')).toBeVisible();
});

// ── Validation ────────────────────────────────────────────────────────────────

test('submitting empty email does not call Formspree', async ({ page }) => {
  let formspreeHit = false;
  await page.route('**/formspree.io/**', (route: Route) => {
    formspreeHit = true;
    route.abort();
  });

  await page.goto(HOME);
  await page.click('form.subscribe-form button[type="submit"]');
  await page.waitForTimeout(300);

  expect(formspreeHit, 'Formspree was called on empty submit').toBe(false);
});

// ── Loading state ─────────────────────────────────────────────────────────────

test('form shows loading state while request is in-flight', async ({ page }) => {
  // Hold the Formspree request so we can observe the loading state
  let resolveRoute: () => void;
  await page.route('**/formspree.io/**', async (route: Route) => {
    await new Promise<void>(res => { resolveRoute = res; });
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
  });

  await page.goto(HOME);
  await page.fill('#sub-email', 'test@example.com');
  await page.click('form.subscribe-form button[type="submit"]');

  // Loading text should appear (via x-show="state === 'loading'")
  const loadingSpan = page.locator('form.subscribe-form [x-show*="loading"]').nth(1);
  await expect(loadingSpan).toBeVisible({ timeout: 2000 });

  // Button should be disabled while loading
  await expect(page.locator('form.subscribe-form button[type="submit"]')).toBeDisabled();

  resolveRoute!();
});

// ── Success state ─────────────────────────────────────────────────────────────

test('form shows success message on 200 from Formspree', async ({ page }) => {
  await page.route('**/formspree.io/**', (route: Route) => {
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
  });

  await page.goto(HOME);
  await page.fill('#sub-email', 'test@example.com');
  await page.click('form.subscribe-form button[type="submit"]');

  const success = page.locator('form.subscribe-form .success');
  await expect(success).toBeVisible({ timeout: 3000 });
});

test('input is disabled after successful submission', async ({ page }) => {
  await page.route('**/formspree.io/**', (route: Route) => {
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
  });

  await page.goto(HOME);
  await page.fill('#sub-email', 'test@example.com');
  await page.click('form.subscribe-form button[type="submit"]');

  await page.locator('form.subscribe-form .success').waitFor({ state: 'visible' });
  await expect(page.locator('#sub-email')).toBeDisabled();
});

// ── Generic error state ───────────────────────────────────────────────────────

test('form shows generic error on non-OK response from Formspree', async ({ page }) => {
  await page.route('**/formspree.io/**', (route: Route) => {
    route.fulfill({ status: 422, body: JSON.stringify({ error: 'Validation failed' }) });
  });

  await page.goto(HOME);
  await page.fill('#sub-email', 'test@example.com');
  await page.click('form.subscribe-form button[type="submit"]');

  const error = page.locator('form.subscribe-form .error');
  await expect(error).toBeVisible({ timeout: 3000 });
  // Error must not be an i18n key — must be rendered text
  const text = await error.innerText();
  expect(text).not.toMatch(/^\w+_\w+$/); // no raw key like "subscribe_error_generic"
  expect(text.length).toBeGreaterThan(5);
});

// ── Network error state ───────────────────────────────────────────────────────

test('form shows network error when Formspree is unreachable', async ({ page }) => {
  await page.route('**/formspree.io/**', (route: Route) => {
    route.abort('failed');
  });

  await page.goto(HOME);
  await page.fill('#sub-email', 'test@example.com');
  await page.click('form.subscribe-form button[type="submit"]');

  const error = page.locator('form.subscribe-form .error');
  await expect(error).toBeVisible({ timeout: 3000 });
  const text = await error.innerText();
  expect(text.length).toBeGreaterThan(5);
});

// ── Privacy / endpoint safety ─────────────────────────────────────────────────

test('form POST goes only to formspree.io — no other host', async ({ page }) => {
  const postUrls: string[] = [];
  await page.route('**', (route: Route) => {
    if (route.request().method() === 'POST') {
      postUrls.push(route.request().url());
    }
    // Fulfill Formspree with success so the test doesn't hang
    if (route.request().url().includes('formspree.io')) {
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    } else {
      route.continue();
    }
  });

  await page.goto(HOME);
  await page.fill('#sub-email', 'test@example.com');
  await page.click('form.subscribe-form button[type="submit"]');
  await page.waitForTimeout(500);

  for (const url of postUrls) {
    expect(
      url,
      `POST to unexpected host: ${url}`
    ).toContain('formspree.io');
  }
});

test('form does not include hidden tracking fields in the payload', async ({ page }) => {
  let payload: Record<string, unknown> = {};

  await page.route('**/formspree.io/**', async (route: Route) => {
    const body = route.request().postDataJSON();
    if (body) payload = body as Record<string, unknown>;
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
  });

  await page.goto(HOME);
  await page.fill('#sub-email', 'tester@example.com');
  await page.click('form.subscribe-form button[type="submit"]');
  await page.waitForTimeout(500);

  const keys = Object.keys(payload);
  // Only "email" should be in the payload
  expect(keys).toContain('email');
  expect(keys.length).toBe(1);
});
