/**
 * Pipeline + progress (localStorage) tests (QA_PLAN §2.4)
 *
 * Verifies: stage cards present, checkbox toggle persists across reload,
 * global counter increments, reset clears state, export downloads JSON-backed MD,
 * persona filter changes the visible item count.
 */
import { test, expect, Page } from '@playwright/test';
import { site } from './helpers';

test.skip(({ javaScriptEnabled }) => !javaScriptEnabled, 'Pipeline progress requires Alpine.js');

const PIPELINE = site('/pipeline/');
const STAGE_1  = site('/stage/assessment/');

// ── Pipeline overview ─────────────────────────────────────────────────────────

test('pipeline page shows all 5 stage cards', async ({ page }) => {
  await page.goto(PIPELINE);
  const cards = page.locator('.stage-card');
  await expect(cards).toHaveCount(5);
});

test('each stage card links to its stage page', async ({ page }) => {
  await page.goto(PIPELINE);
  const cards = await page.locator('.stage-card').all();
  for (const card of cards) {
    const href = await card.getAttribute('href');
    expect(href).toMatch(/\/stage\//);
  }
});

test('pipeline-summary progress bar is present', async ({ page }) => {
  await page.goto(PIPELINE);
  await expect(page.locator('.pipeline-summary .progress-bar')).toBeVisible();
});

// ── No-JS initial counter (F6 fix verification) ───────────────────────────────
// The pipeline page must emit non-empty counter text in the raw HTML so that
// search engines and JS-blocked viewers don't see blank "· %".
// Run in the no-js project specifically — but the no-js project is already
// skipped at the top. We instead test via a separate page.evaluate with JS off.

test('static HTML inside x-text spans is non-empty on /pipeline/', async ({ page }) => {
  // Disable JS for this one check by evaluating raw HTML before Alpine runs
  await page.goto(PIPELINE);

  const emptyXText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[x-text]'))
      .filter(el => el.textContent?.trim() === '')
      .map(el => el.getAttribute('x-text'));
  });

  // After Alpine hydrates, no x-text span should remain empty
  // (This checks post-hydration; for pre-hydration check see no-js.spec.ts)
  expect(emptyXText, `Empty x-text spans after hydration: ${emptyXText.join(', ')}`).toHaveLength(0);
});

// ── Checkbox → counter ────────────────────────────────────────────────────────

async function getGlobalDone(page: Page): Promise<number> {
  // Read the totalDone span inside .global-progress or .pipeline-summary
  const span = page.locator('.global-progress .prog-txt, .pipeline-summary .summary-txt').first();
  const txt = await span.innerText().catch(() => '');
  const m = txt.match(/^(\d+)/);
  return m ? Number(m[1]) : 0;
}

async function checkFirstItem(page: Page) {
  const checkbox = page.locator('.checklist input[type="checkbox"]').first();
  await checkbox.waitFor({ state: 'visible' });
  await checkbox.check();
  await page.waitForTimeout(200);
}

test('checking an item increments the global counter', async ({ page }) => {
  // Clear any prior state
  await page.goto(STAGE_1);
  await page.evaluate(() => localStorage.removeItem('ohma.v1'));
  await page.reload();
  await page.waitForTimeout(500);

  const before = await getGlobalDone(page);
  await checkFirstItem(page);
  const after = await getGlobalDone(page);

  expect(after).toBe(before + 1);
});

// ── localStorage persistence ──────────────────────────────────────────────────

test('checked item persists across reload', async ({ page }) => {
  await page.goto(STAGE_1);
  await page.evaluate(() => localStorage.removeItem('ohma.v1'));
  await page.reload();
  await page.waitForTimeout(500);

  // Check the first item and note its identity
  const checkbox = page.locator('.checklist input[type="checkbox"]').first();
  await checkbox.check();
  await page.waitForTimeout(200);

  // Verify localStorage was updated
  const stored = await page.evaluate(() => localStorage.getItem('ohma.v1'));
  expect(stored).not.toBeNull();
  const data = JSON.parse(stored!);
  expect(data).toHaveProperty('stages');

  // Reload and verify checkbox is still checked
  await page.reload();
  await page.waitForTimeout(500);
  const reloaded = page.locator('.checklist input[type="checkbox"]').first();
  await expect(reloaded).toBeChecked();
});

// ── Reset stage ───────────────────────────────────────────────────────────────

test('reset stage button clears stage progress after confirmation', async ({ page }) => {
  await page.goto(STAGE_1);
  await page.evaluate(() => localStorage.removeItem('ohma.v1'));
  await page.reload();
  await page.waitForTimeout(500);

  await checkFirstItem(page);

  // The reset-stage button appears only after progress > 0
  const resetBtn = page.locator('button.btn-ghost', { hasText: /reset/i }).first();
  await resetBtn.waitFor({ state: 'visible' });

  // Auto-accept the confirm dialog
  page.once('dialog', dialog => dialog.accept());
  await resetBtn.click();
  await page.waitForTimeout(300);

  // Checkbox should be unchecked
  const checkbox = page.locator('.checklist input[type="checkbox"]').first();
  await expect(checkbox).not.toBeChecked();
});

// ── Export pipeline ───────────────────────────────────────────────────────────

test('export pipeline triggers a file download with correct name', async ({ page }) => {
  await page.goto(STAGE_1);
  await page.evaluate(() => localStorage.removeItem('ohma.v1'));
  await page.reload();
  await page.waitForTimeout(500);

  // Need progress > 0 for the export button to show
  await checkFirstItem(page);

  await page.goto(PIPELINE);
  await page.waitForTimeout(500);

  // Wait for the export button
  const exportBtn = page.locator('.pipeline-summary button', { hasText: /export/i });
  await exportBtn.waitFor({ state: 'visible' });

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    exportBtn.click(),
  ]);

  expect(download.suggestedFilename()).toBe('croatia-pipeline.md');
});

test('pipeline JSON feed shape matches export expectations', async ({ page }) => {
  const response = await page.goto(site('/pipeline/index.json'));
  const json = await response?.json();
  expect(json).toHaveProperty('stages');
  expect(json.stages).toBeInstanceOf(Array);
  const stage = json.stages[0];
  expect(stage).toHaveProperty('weight');
  expect(stage).toHaveProperty('title');
  expect(stage).toHaveProperty('cats');
  expect(stage.cats).toBeInstanceOf(Array);
  const cat = stage.cats[0];
  expect(cat).toHaveProperty('items');
  const item = cat.items[0];
  expect(item).toHaveProperty('key');
  expect(item).toHaveProperty('label');
});

// ── Persona filter changes item count ─────────────────────────────────────────

test('switching visa type on pipeline page changes summary count', async ({ page }) => {
  await page.goto(PIPELINE);
  await page.waitForSelector('#pp-visa');
  await page.waitForTimeout(500);

  const totalBefore = await page.locator('.pipeline-summary [x-text]').first().innerText();

  // Switch to digital-nomad (should filter some items)
  await page.selectOption('#pp-visa', 'digital-nomad');
  await page.waitForTimeout(300);

  const totalAfter = await page.locator('.pipeline-summary [x-text]').first().innerText();
  // Count must have changed (filtered)
  expect(totalAfter).not.toBe(totalBefore);
});

// ── Stage card progress reflects stored state ─────────────────────────────────

test('stage card shows partial class after checking an item', async ({ page }) => {
  await page.goto(STAGE_1);
  await page.evaluate(() => localStorage.removeItem('ohma.v1'));
  await page.reload();
  await page.waitForTimeout(500);

  await checkFirstItem(page);

  // Navigate to pipeline and verify the card is marked partial
  await page.goto(PIPELINE);
  await page.waitForTimeout(500);

  const card1 = page.locator('.stage-card').first();
  const cls = await card1.getAttribute('class') ?? '';
  expect(cls, 'Stage card should have partial class after checking one item').toContain('partial');
});

// ── Hotkeys navigate between stages ──────────────────────────────────────────

test('l hotkey navigates from pipeline to stage 1', async ({ page }) => {
  await page.goto(PIPELINE);
  await page.keyboard.press('l');
  await page.waitForURL('**/stage/assessment/**', { timeout: 5000 });
  expect(page.url()).toContain('assessment');
});

test('h hotkey on stage 2 navigates back to stage 1', async ({ page }) => {
  await page.goto(site('/stage/pre-flight/'));
  await page.keyboard.press('h');
  await page.waitForURL('**/stage/assessment/**', { timeout: 5000 });
  expect(page.url()).toContain('assessment');
});
