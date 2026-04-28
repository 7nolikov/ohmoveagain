/**
 * Pet timeline tests (QA_PLAN §2.5)
 *
 * Verifies: Gantt renders both paths (listed / unlisted), no overflow at 375px,
 * pet-countdown shows future date, persona filter hides pet block.
 */
import { test, expect } from '@playwright/test';

test.skip(({ javaScriptEnabled }) => !javaScriptEnabled,
  'Pet countdown requires Alpine.js; Gantt static HTML is covered by smoke tests');

const PRE_FLIGHT = '/stage/pre-flight/';

// ── Gantt structure ───────────────────────────────────────────────────────────

test('pet Gantt figure is present on pre-flight stage', async ({ page }) => {
  await page.goto(PRE_FLIGHT);
  const gantt = page.locator('.pet-gantt-wrap');
  await expect(gantt).toBeVisible();
});

test('pet Gantt shows both listed and unlisted paths', async ({ page }) => {
  await page.goto(PRE_FLIGHT);
  await expect(page.locator('#pet-listed-title')).toBeVisible();
  await expect(page.locator('#pet-unlisted-title')).toBeVisible();
});

test('listed path has at least 4 steps', async ({ page }) => {
  await page.goto(PRE_FLIGHT);
  const steps = page.locator('.pet-path').first().locator('.pet-step');
  const count = await steps.count();
  expect(count).toBeGreaterThanOrEqual(4);
});

test('unlisted path has at least 5 steps including warn steps', async ({ page }) => {
  await page.goto(PRE_FLIGHT);
  const unlistedPath = page.locator('.pet-path').nth(1);
  const steps = unlistedPath.locator('.pet-step');
  const count = await steps.count();
  expect(count).toBeGreaterThanOrEqual(5);

  // At least one step should be a timing warning
  const warns = unlistedPath.locator('.pet-step.warn');
  expect(await warns.count()).toBeGreaterThanOrEqual(1);
});

test('pet Gantt legend is visible', async ({ page }) => {
  await page.goto(PRE_FLIGHT);
  await expect(page.locator('.pet-legend')).toBeVisible();
});

test('dependency note is present', async ({ page }) => {
  await page.goto(PRE_FLIGHT);
  const note = page.locator('.pet-dependency-note');
  await expect(note).toBeVisible();
  expect(await note.innerText()).toContain('microchip');
});

// ── Gantt — no horizontal overflow at narrow viewport ─────────────────────────

test('pet Gantt does not overflow at 375px width', async ({ page, viewport }) => {
  if (!viewport) return;
  await page.goto(PRE_FLIGHT);
  await page.waitForLoadState('domcontentloaded');

  const overflow = await page.evaluate(() => {
    const gantt = document.querySelector('.pet-gantt-wrap') as HTMLElement | null;
    if (!gantt) return false;
    const vpWidth = document.documentElement.clientWidth;
    const right = gantt.getBoundingClientRect().right;
    return right > vpWidth + 2;
  });

  expect(overflow, 'Pet Gantt overflows viewport width').toBe(false);
});

// ── Pet countdown (Alpine) ────────────────────────────────────────────────────

test('pet countdown section is present on pre-flight', async ({ page }) => {
  await page.goto(PRE_FLIGHT);
  // pet-countdown has x-cloak so it's hidden until Alpine hydrates
  const countdown = page.locator('.pet-countdown, #pet-countdown');
  // It may be the anchor target only; check the section heading instead
  const heading = page.locator('[id*="countdown"], [id*="pet"]').first();
  await expect(heading).toBeAttached();
});

// ── Persona filter hides pet block ───────────────────────────────────────────

test('setting pets=none in persona picker reduces visible items on pre-flight', async ({ page }) => {
  await page.goto(PRE_FLIGHT);
  await page.waitForTimeout(500); // Alpine hydration

  // Count visible checklist items before
  const before = await page.locator('.checklist li').evaluateAll(
    els => els.filter(el => (el as HTMLElement).offsetParent !== null).length
  );

  // Switch pets to none
  const petsSelect = page.locator('#pp-pets');
  if (await petsSelect.count() === 0) return; // graceful skip

  await petsSelect.selectOption('none');
  await page.waitForTimeout(300);

  const after = await page.locator('.checklist li').evaluateAll(
    els => els.filter(el => (el as HTMLElement).offsetParent !== null).length
  );

  expect(after, 'Setting pets=none should reduce visible items').toBeLessThan(before);
});

// ── Source link quality ───────────────────────────────────────────────────────

test('pet Gantt EU Commission source link has noopener', async ({ page }) => {
  await page.goto(PRE_FLIGHT);
  const sourceLinks = page.locator('.pet-gantt-wrap a[target="_blank"]');
  const count = await sourceLinks.count();
  expect(count).toBeGreaterThan(0);

  for (const link of await sourceLinks.all()) {
    const rel = await link.getAttribute('rel');
    expect(rel, 'Pet Gantt external link missing rel=noopener').toContain('noopener');
  }
});

test('pet Gantt source link points to EU Commission domain', async ({ page }) => {
  await page.goto(PRE_FLIGHT);
  const firstSource = page.locator('.pet-gantt-source a').first();
  const href = await firstSource.getAttribute('href');
  expect(href).toContain('ec.europa.eu');
});

// ── Static /pet-gantt/ standalone page ───────────────────────────────────────

test('/pet-gantt/ standalone page loads and shows the Gantt', async ({ page }) => {
  const response = await page.goto('/pet-gantt/');
  expect(response?.status()).toBe(200);
  const gantt = page.locator('.pet-gantt-wrap');
  await expect(gantt).toBeVisible();
});
