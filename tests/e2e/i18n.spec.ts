/**
 * i18n consistency tests (QA_PLAN §2.7)
 *
 * Verifies: language switcher resolves, no raw Hugo template tokens in HTML,
 * no untranslated EN paragraphs on RU surfaces, RU stage names are Cyrillic.
 */
import { test, expect } from '@playwright/test';
import { site } from './helpers';

// Skip on no-js — language switcher links work regardless of JS
// These tests run on all JS-enabled projects.
test.skip(({ javaScriptEnabled }) => !javaScriptEnabled, 'i18n tests require JS-enabled project');

const EN_SURFACES = [
  site('/'),
  site('/pipeline/'),
  site('/stage/assessment/'),
  site('/stage/pre-flight/'),
  site('/stage/migration/'),
  site('/stage/initialization/'),
  site('/stage/scaling/'),
];

// ── Language switcher links resolve (no 404) ─────────────────────────────────

for (const path of EN_SURFACES) {
  test(`lang switcher on ${path} links to valid RU translation`, async ({ page }) => {
    await page.goto(path);
    const ruLink = page.locator('a[hreflang="ru"], .lang-menu a[lang="ru"], .lang-menu a[href*="/ru/"]').first();
    const count = await ruLink.count();
    if (count === 0) return; // page has no RU translation — skip rather than fail

    const href = await ruLink.getAttribute('href');
    expect(href).toBeTruthy();
    const response = await page.goto(href!);
    expect(response?.status(), `RU link from ${path} returned non-200`).toBe(200);
  });
}

// ── No unrendered Hugo template tokens in HTML ───────────────────────────────
// Hugo should render all {{ i18n "..." }} calls. A literal brace in the HTML
// means a template was left unrendered (e.g. missing translation key).

const ALL_SURFACES = [
  ...EN_SURFACES,
  site('/ru/'),
  site('/ru/pipeline/'),
  site('/ru/stage/assessment/'),
  site('/calculator/'),
  site('/arrival/'),
  site('/exit/'),
];

for (const path of ALL_SURFACES) {
  test(`no raw Hugo template tokens on ${path}`, async ({ page }) => {
    await page.goto(path);
    const html = await page.content();
    // Match Hugo template syntax that was not rendered
    const leaked = html.match(/\{\{[^}]*i18n[^}]*\}\}/g);
    expect(leaked, `Unrendered i18n tokens on ${path}: ${leaked?.join(', ')}`).toBeNull();
  });
}

// ── No obvious English-only paragraphs on RU surfaces ───────────────────────
// Heuristic: <p> elements on /ru/ pages that contain only ASCII letters
// (no Cyrillic) and are longer than 40 chars likely indicate untranslated copy.
// Excludes code blocks, links, and disclaimer text that is intentionally EN.

const RU_SURFACES = [
  site('/ru/'),
  site('/ru/pipeline/'),
  site('/ru/stage/assessment/'),
];

for (const path of RU_SURFACES) {
  test(`no obvious untranslated EN paragraphs on ${path}`, async ({ page }) => {
    await page.goto(path);
    const suspicious = await page.evaluate(() => {
      const paragraphs = Array.from(document.querySelectorAll('main p, main li'));
      return paragraphs
        .map(el => el.textContent?.trim() ?? '')
        .filter(text =>
          text.length > 40 &&
          // Only ASCII alphabetic — no Cyrillic, no digits-only
          /^[A-Za-z\s.,!?'":;()\-–—]+$/.test(text)
        );
    });
    expect(
      suspicious,
      `Possible untranslated EN text on ${path}:\n${suspicious.slice(0, 3).join('\n')}`
    ).toHaveLength(0);
  });
}

// ── RU pipeline shows Cyrillic stage names ───────────────────────────────────

test('RU pipeline page shows Cyrillic stage names', async ({ page }) => {
  await page.goto(site('/ru/pipeline/'));
  const html = await page.content();
  const expected = ['Оценка', 'Подготовка', 'Переезд', 'Регистрация', 'Масштабирование'];
  for (const name of expected) {
    expect(html, `Cyrillic stage name "${name}" missing from RU pipeline`).toContain(name);
  }
});
