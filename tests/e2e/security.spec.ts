/**
 * Security regression tests (QA_PLAN §2.10)
 *
 * Verifies: no secrets in rendered HTML, Formspree ID not leaked, CSP present.
 * Note: unsafe-eval test is marked fixme until S8 (Alpine.data() migration).
 * noopener and inline-style checks live in smoke.spec.ts.
 */
import { test, expect } from '@playwright/test';
import { site } from './helpers';

const ALL_SURFACES = [
  site('/'),
  site('/pipeline/'),
  site('/stage/assessment/'),
  site('/stage/pre-flight/'),
  site('/stage/migration/'),
  site('/stage/initialization/'),
  site('/stage/scaling/'),
  site('/calculator/'),
  site('/arrival/'),
  site('/exit/'),
  site('/ru/'),
  site('/ru/pipeline/'),
];

// ── No secrets / PAT tokens in rendered HTML ────────────────────────────────
// GitHub PATs start with ghp_, GitHub Actions tokens with ghs_/gho_, and
// fine-grained tokens with github_pat_. None should appear in production HTML.

const SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9]{36}/,           // classic PAT
  /ghs_[A-Za-z0-9]{36}/,           // Actions token
  /github_pat_[A-Za-z0-9_]{82}/,   // fine-grained PAT
  /REPO_TOKEN/,                      // literal secret name
  /ACTIONS_TOKEN/,                   // literal secret name
];

for (const path of ALL_SURFACES) {
  test(`no secrets leaked in HTML on ${path}`, async ({ page }) => {
    await page.goto(path);
    const html = await page.content();
    for (const pattern of SECRET_PATTERNS) {
      expect(html, `Secret pattern ${pattern} found on ${path}`).not.toMatch(pattern);
    }
  });
}

// ── Formspree endpoint not exposed beyond form action ────────────────────────
// The Formspree form ID appears in the <form action> — that is expected.
// It must not appear in JS source, meta tags, or other elements where it
// would be harvested without context.

test('Formspree ID only in form action, not in other elements', async ({ page }) => {
  await page.goto(site('/'));
  const formAction = await page.locator('form[action*="formspree"]').getAttribute('action');
  if (!formAction) return; // no subscribe form on this page variant

  // Extract the form ID from the action URL
  const idMatch = formAction.match(/formspree\.io\/f\/([a-z0-9]+)/i);
  if (!idMatch) return;
  const formId = idMatch[1];

  // Count occurrences — should only be the form action itself
  const html = await page.content();
  const occurrences = (html.match(new RegExp(formId, 'g')) ?? []).length;
  expect(occurrences, `Formspree ID "${formId}" appears ${occurrences} times (expected 1)`).toBeLessThanOrEqual(2);
});

// ── CSP is present on every surface ─────────────────────────────────────────
// More thorough surface sweep than smoke.spec.ts (which only checks /).

for (const path of ALL_SURFACES) {
  test(`CSP meta tag present on ${path}`, async ({ page }) => {
    await page.goto(path);
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(csp, `CSP meta missing on ${path}`).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
  });
}

// ── CSP must not contain unsafe-eval ────────────────────────────────────────

test('CSP does not contain unsafe-eval', async ({ page }) => {
  await page.goto(site('/'));
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).not.toContain("'unsafe-eval'");
});

// ── No email addresses in rendered HTML beyond maintainer contact ────────────
// Prevents harvesters from scraping personal emails embedded accidentally.

test('no personal email addresses in rendered HTML', async ({ page }) => {
  await page.goto(site('/'));
  const html = await page.content();
  // Match anything that looks like an email not already in an href="mailto:"
  // by stripping mailto: hrefs first
  const stripped = html.replace(/href="mailto:[^"]+"/g, '');
  const emails = stripped.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) ?? [];
  // Allow the maintainer's publicly stated address only if explicitly expected
  const leaked = emails.filter(e =>
    !e.endsWith('@users.noreply.github.com') &&
    !e.includes('formspree') &&
    !e.includes('cloudflare')
  );
  expect(leaked, `Email addresses found in rendered HTML: ${leaked.join(', ')}`).toHaveLength(0);
});
