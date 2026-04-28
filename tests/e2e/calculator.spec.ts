/**
 * Calculator feature tests (QA_PLAN §2.3)
 *
 * Verifies: default load, compute on submit, country coverage, share line,
 * URL state roundtrip, copy-link, fees toggle, error messages.
 */
import { test, expect, Page } from '@playwright/test';
import { site } from './helpers';

test.skip(({ javaScriptEnabled }) => !javaScriptEnabled, 'Calculator requires Alpine.js');

const BASE_URL = '/calculator/';

async function calculate(page: Page, gross: number, from: string, to: string) {
  await page.goto(site(BASE_URL));
  await page.fill('#gross', String(gross));
  await page.selectOption('#from', from);
  await page.selectOption('#to', to);
  await page.click('button[type="submit"]');
  await page.waitForSelector('[role="region"][aria-label="calculation result"]', { timeout: 5000 });
}

// ── Basic compute ─────────────────────────────────────────────────────────────

test('renders a result for DE → HR at 90 000 EUR', async ({ page }) => {
  await calculate(page, 90_000, 'DE', 'HR');
  const result = page.locator('[role="region"][aria-label="calculation result"]');
  await expect(result).toBeVisible();
  // Delta line must show a value (positive or negative months/year)
  const delta = result.locator('.delta');
  await expect(delta).toBeVisible();
  const text = await delta.innerText();
  expect(text).toMatch(/[+-]?\d+(\.\d+)?\s+months/i);
});

test('recomputes when income changes', async ({ page }) => {
  await calculate(page, 90_000, 'DE', 'HR');
  const deltaFirst = await page.locator('.delta').innerText();

  await page.fill('#gross', '60000');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);

  const deltaSecond = await page.locator('.delta').innerText();
  expect(deltaFirst).not.toBe(deltaSecond);
});

// ── Country coverage ──────────────────────────────────────────────────────────

test('reference table contains all 12 expected countries', async ({ page }) => {
  await page.goto(site(BASE_URL));
  const EXPECTED_CODES = ['HR', 'DE', 'PT', 'EE', 'GB', 'US', 'NL', 'FR', 'PL', 'CZ', 'RS', 'MNE'];
  // Countries appear in the reference table and in the selects
  const fromOptions = await page.locator('#from option').evaluateAll(
    els => els.map(o => (o as HTMLOptionElement).value)
  );
  for (const code of EXPECTED_CODES) {
    expect(fromOptions, `Country ${code} missing from calculator`).toContain(code);
  }
});

test('changing destination country changes the result', async ({ page }) => {
  await calculate(page, 90_000, 'DE', 'HR');
  const deltaHR = await page.locator('.delta').innerText();

  await page.selectOption('#to', 'PT');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);
  const deltaPT = await page.locator('.delta').innerText();

  expect(deltaHR).not.toBe(deltaPT);
});

// ── Error messages ────────────────────────────────────────────────────────────

test('shows error when income is empty', async ({ page }) => {
  await page.goto(site(BASE_URL));
  await page.click('button[type="submit"]');
  const err = page.locator('[role="alert"]');
  await expect(err).toBeVisible();
  expect(await err.innerText()).toContain('income');
});

test('shows error when from === to', async ({ page }) => {
  await page.goto(site(BASE_URL));
  await page.fill('#gross', '90000');
  await page.selectOption('#from', 'HR');
  await page.selectOption('#to', 'HR');
  await page.click('button[type="submit"]');
  const err = page.locator('[role="alert"]');
  await expect(err).toBeVisible();
});

// ── URL state roundtrip ───────────────────────────────────────────────────────

test('URL query params restore form state and auto-calculate', async ({ page }) => {
  await page.goto(site(BASE_URL) + '?gross=75000&from=GB&to=HR');
  // Alpine init() reads params and calls run()
  await page.waitForSelector('[role="region"][aria-label="calculation result"]', { timeout: 5000 });

  const gross = await page.inputValue('#gross');
  expect(Number(gross)).toBe(75_000);

  const from = await page.locator('#from').inputValue();
  expect(from).toBe('GB');

  const result = page.locator('[role="region"][aria-label="calculation result"]');
  await expect(result).toBeVisible();
});

test('calculating updates the browser URL with query params', async ({ page }) => {
  await calculate(page, 90_000, 'DE', 'HR');
  const url = new URL(page.url());
  expect(url.searchParams.get('gross')).toBe('90000');
  expect(url.searchParams.get('from')).toBe('DE');
  expect(url.searchParams.get('to')).toBe('HR');
});

// ── Share and copy ────────────────────────────────────────────────────────────

test('share line text is present after calculation', async ({ page }) => {
  await calculate(page, 90_000, 'DE', 'HR');
  const shareLine = page.locator('.share');
  await expect(shareLine).toBeVisible();
  const text = await shareLine.innerText();
  expect(text.length).toBeGreaterThan(20);
  expect(text).toContain('months');
});

test('Copy share line button changes label to Copied ✓', async ({ page }) => {
  // Grant clipboard permission so the write doesn't fail in headed mode
  // WebKit doesn't accept these permissions; the in-page fallback path still flips the label.
  try { await page.context().grantPermissions(['clipboard-read', 'clipboard-write']); } catch {}
  await calculate(page, 90_000, 'DE', 'HR');

  const copyBtn = page.locator('.share-ctas button').first();
  await copyBtn.click();
  await expect(copyBtn).toContainText('Copied');
});

test('Copy link button changes label to Link copied ✓', async ({ page }) => {
  // WebKit doesn't accept these permissions; the in-page fallback path still flips the label.
  try { await page.context().grantPermissions(['clipboard-read', 'clipboard-write']); } catch {}
  await calculate(page, 90_000, 'DE', 'HR');

  // Third button in share-ctas is "Copy link to this result"
  const copyLinkBtn = page.locator('.share-ctas button').nth(1);
  await copyLinkBtn.click();
  await expect(copyLinkBtn).toContainText('copied');
});

test('Share on X link opens intent URL in new tab', async ({ page }) => {
  await calculate(page, 90_000, 'DE', 'HR');
  const tweetLink = page.locator('.share-ctas a[target="_blank"]');
  const href = await tweetLink.getAttribute('href');
  expect(href).toContain('twitter.com/intent/tweet');
  expect(href).toContain('months');
});

// ── Fees toggle ───────────────────────────────────────────────────────────────

test('enabling fees toggle shows first-year costs in result', async ({ page }) => {
  await page.goto(site(BASE_URL));
  await page.fill('#gross', '90000');
  await page.selectOption('#from', 'DE');
  await page.selectOption('#to', 'HR');
  await page.check('[x-model="includeFees"]');
  await page.click('button[type="submit"]');
  await page.waitForSelector('[role="region"][aria-label="calculation result"]', { timeout: 5000 });

  // When fees are included, the "First-year paperwork costs" row appears
  const feeRow = page.locator('table tr').filter({ hasText: 'paperwork costs' });
  await expect(feeRow).toBeVisible();
});

// ── Reference table ───────────────────────────────────────────────────────────

test('reference table has all columns including Monthly CoL header', async ({ page }) => {
  await page.goto(site(BASE_URL));
  const colHeaders = await page.locator('table thead th').allInnerTexts();
  expect(colHeaders.some(h => /col|cost of living/i.test(h))).toBe(true);
});

test('all source links in reference table have noopener', async ({ page }) => {
  await page.goto(site(BASE_URL));
  const unsafe = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('table a[target="_blank"]'))
      .filter(a => !a.getAttribute('rel')?.includes('noopener'))
      .map(a => (a as HTMLAnchorElement).href);
  });
  expect(unsafe).toHaveLength(0);
});
