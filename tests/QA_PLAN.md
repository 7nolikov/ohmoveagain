# ohmoveagain — QA Plan

Replaces manual real-device test (former C1) with two automated tracks:

- **Track A — Deterministic E2E (Playwright):** runs every PR + nightly. Catches regressions.
- **Track B — Agent exploratory (Claude + Playwright MCP):** runs pre-launch and weekly. Catches what scripts can't anticipate (visual oddities, copy bugs, illogical flows).

Both tracks share the same coverage matrix below.

---

## 1. Coverage matrix

### 1.1 Surfaces (12)

| # | URL | Critical interactions |
|---|---|---|
| 1 | `/` | hero CTAs, pipeline visual, tools grid, subscribe form |
| 2 | `/pipeline/` | summary counts, persona picker, stage cards, reset, export, hotkeys |
| 3 | `/stage/assessment/` | trust tooltip, checklist toggle, gotchas list |
| 4 | `/stage/pre-flight/` | trust tooltip, pet-gantt SVG, pet-countdown, persona filters |
| 5 | `/stage/migration/` | checklist toggle, sticky disclaimer |
| 6 | `/stage/initialization/` | checklist toggle, conflict notes |
| 7 | `/stage/scaling/` | checklist toggle, paušalni vs d.o.o. content present |
| 8 | `/calculator/` | country select, persona inputs, runway result, share URL |
| 9 | `/offices/` | filter by city, booking links open in new tab |
| 10 | `/forms/` | template links resolve |
| 11 | `/arrival/` | three tabs (Day 1 / Week 1 / Month 1) switch and persist |
| 12 | `/exit/` | country tabs, source links resolve |

Plus: `/freshness/`, `/contribute/`, `/subscribe/`, `/pet-gantt/`, `/404`, RSS, `/pipeline/index.json`.

### 1.2 Languages

Every surface tested in **EN** and **RU** (mirror at `/ru/...`).

### 1.3 Viewports

| Profile | Width | Why |
|---|---|---|
| iPhone SE (3rd gen) | 375×667 | smallest realistic mobile in market |
| Pixel 7 | 412×915 | mid-size Android |
| iPad mini | 768×1024 | tablet break |
| Desktop | 1280×800 | default |

### 1.4 Browsers

Chromium (covers ≥75% of users); WebKit emulation for iOS Safari clipboard quirks.

---

## 2. Test categories — what every PR run verifies

### 2.1 Smoke (fast, blocking)

- [ ] Each of 12 surfaces returns HTTP 200 in EN and RU
- [ ] No JS console errors at page load
- [ ] No 4xx/5xx in the network tab (except expected 404 page)
- [ ] No mixed content (http:// asset on https:// page)
- [ ] CSP header present and matches `head.html` policy
- [ ] Cloudflare Web Analytics beacon attempts to load

### 2.2 Mobile usability (former C1 — now scripted)

- [ ] **No horizontal scroll** at 375px on every surface
- [ ] **All tap targets ≥ 44×44 px** (persona chips, hotkeys help button, trust badge, hamburger, language switcher, checkbox rows, calculator country select)
- [ ] **Sticky elements behave**: footer disclaimer pinned but not covering content; header nav doesn't jump on scroll
- [ ] **Long Croatian word wrapping**: synthetic test inserts `prijevremenoumirovljenikinjašaakojebaštako` into the page and asserts no overflow
- [ ] **Trust tooltip on tap**: tap opens, tap-elsewhere closes (touch event, not hover)
- [ ] **Hotkeys help modal**: opens on `?`, closes on `Escape`, closes on backdrop click
- [ ] **Persona picker**: changing visa/family/pets updates the visible checklist count without a page reload

### 2.3 Calculator — full feature pass

- [ ] Default load shows a result (no blank state)
- [ ] Changing income recomputes within 100 ms
- [ ] Changing destination country reorders results
- [ ] All 12 countries appear in the result table
- [ ] Persona filter (visa type) hides ineligible countries appropriately
- [ ] Share button copies a URL to clipboard
- [ ] Loading the share URL restores the same input state (URL state roundtrip)
- [ ] On iOS Safari emulation: clipboard copy works (uses `setSelectionRange` fallback)
- [ ] Mobile (≤480px): Monthly CoL column hidden (card-style table)

### 2.4 Pipeline + progress (localStorage)

- [ ] Initial counter renders **`0 of N · 0%`** in HTML *before* Alpine hydrates (F6 fix verification)
- [ ] Toggling any item increments the global count and the per-stage count
- [ ] Reload preserves checked state
- [ ] Reset button shows confirmation; on accept, all counts reset to 0
- [ ] Export button downloads a JSON file matching `/pipeline/index.json` shape with progress merged
- [ ] Persona filter changes reduce/expand the visible item count and update the denominator

### 2.5 Pet timeline (Pre-Flight)

- [ ] Pet Gantt SVG renders without overflowing the viewport on 375px
- [ ] Pet countdown shows a future date based on current `Date.now()` and rabies titer rules
- [ ] Switching `pets: false` in persona picker hides the pet block

### 2.6 Subscribe form

- [ ] Renders both the form and the privacy disclosure
- [ ] Empty submit shows native validation
- [ ] Mock-submit (intercept the POST) shows "Subscribing…" then success state
- [ ] Network failure shows the error message (string from i18n, not raw)
- [ ] Form action URL is `formspree.io` (no leak to other host)

### 2.7 i18n consistency

- [ ] Language switcher on every page links to its translation (not 404)
- [ ] No raw i18n keys leaking (`/{{ i18n "..." }}/` regex must not match in rendered HTML)
- [ ] No untranslated English strings on `/ru/` surfaces (fuzzy heuristic: ASCII-only paragraphs in `/ru/` flagged)
- [ ] RU pipeline page shows Cyrillic stage names (Оценка / Подготовка / Переезд / Регистрация / Развитие)

### 2.8 No-JS / SEO

- [ ] With JS disabled, `/pipeline/` shows numeric counters not blank (`· %`)
- [ ] With JS disabled, every primary CTA is a real `<a href>` — no JS-required navigation
- [ ] Open Graph tags resolve for every shareable URL (D8 — see card validator step)
- [ ] Canonical link equals current URL
- [ ] hreflang alternates resolve and don't redirect

### 2.9 Performance & a11y (existing CI, kept)

- [ ] Lighthouse mobile ≥ 90 on `/`, `/pipeline/`, `/calculator/`, `/stage/pre-flight/`
- [ ] axe-core: 0 critical, 0 serious violations on the same set

### 2.10 Security regressions

- [ ] CSP does not contain `unsafe-eval`
- [ ] No inline `<style>` blocks in any rendered page (re-check after F1/B5 fixes)
- [ ] All `<a target="_blank">` have `rel="noopener"` or equivalent
- [ ] No PAT, no email address other than maintainer's, no Formspree internal IDs leaked beyond `formspreeEndpoint`

---

## 3. Track A — Deterministic E2E (Playwright)

### 3.1 Layout

```
tests/
  e2e/
    smoke.spec.ts          # §2.1
    mobile.spec.ts         # §2.2
    calculator.spec.ts     # §2.3
    pipeline.spec.ts       # §2.4
    pet.spec.ts            # §2.5
    subscribe.spec.ts      # §2.6
    i18n.spec.ts           # §2.7
    no-js.spec.ts          # §2.8
    security.spec.ts       # §2.10
  fixtures/
    long-croatian.txt
  playwright.config.ts
```

### 3.2 `playwright.config.ts` (sketch)

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:4000/ohmoveagain/', trace: 'retain-on-failure' },
  projects: [
    { name: 'iphone-se',  use: { ...devices['iPhone SE'] } },
    { name: 'pixel-7',    use: { ...devices['Pixel 7'] } },
    { name: 'ipad-mini',  use: { ...devices['iPad Mini'] } },
    { name: 'desktop',    use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'no-js',      use: { ...devices['Desktop Chrome'], javaScriptEnabled: false } },
  ],
});
```

### 3.3 Runtime budget

- Full matrix should complete in **< 4 minutes** on GitHub Actions.
- If exceeded: shard by project, parallelize across runners, or move §2.7/§2.8 to a nightly-only job.

### 3.4 Local commands

```sh
npm run qa:install     # one-time: playwright install --with-deps chromium webkit
npm run qa:e2e         # run full matrix against local hugo server
npm run qa:e2e -- --project iphone-se      # single device
npm run qa:e2e -- --ui                     # interactive
npm run qa:report      # open last HTML report
```

---

## 4. Track B — Agent exploratory pass

Triggered manually pre-launch and on a weekly cron. Lower-fidelity, higher-coverage.

### 4.1 What the agent does

1. Spins up `hugo server` on a free port.
2. Connects to a Playwright MCP server (Chromium + iPhone SE emulation).
3. Reads `tests/QA_PLAN.md` §2 as the spec.
4. For each surface in §1.1: navigate, take screenshot, exercise interactive elements, log anything that surprises it ("the X button does nothing on tap", "this text overflows at iPhone SE width", "Russian page has English fallback in 3 places").
5. Files findings as a single Markdown report under `tests/reports/agent-qa-YYYY-MM-DD.md`.
6. If any finding is `severity: blocker`, exits non-zero (CI fails / cron sends a notification).

### 4.2 Prompt template (`scripts/agent-qa-prompt.md`)

```
You are a strict QA engineer doing exploratory testing of ohmoveagain.

Site: http://localhost:4000/ohmoveagain/
Viewport: iPhone SE (375×667) unless stated otherwise
Spec: tests/QA_PLAN.md §2

For every surface in §1.1, verify §2.2 (mobile usability) by hand:
- Take a full-page screenshot
- Tap every interactive element; report any with hit area < 44×44
- Scroll to bottom; report any horizontal overflow
- Open the trust tooltip on every checklist item with a badge; verify it closes on tap-elsewhere
- Switch language to RU; report any untranslated English string longer than 5 words

Output: tests/reports/agent-qa-{date}.md with sections per surface.
Format each finding as: severity (blocker | major | minor | nit), surface, viewport, description, screenshot path.
End with a "Launch verdict" line: GO or NO-GO with one sentence justification.
```

### 4.3 Why agent + deterministic together

- Playwright catches **known** regressions (counters reset, link 404s).
- Agent catches **unknown** issues (the disclaimer overlaps the export button at exactly 360px wide; the RU trust badge has the wrong gender).
- Neither alone is sufficient.

---

## 5. CI integration plan

### 5.1 Add to `.github/workflows/pr-check.yml`

Append after the Lighthouse step:

```yaml
      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: pw-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium webkit

      - name: Run E2E (Track A)
        run: npm run qa:e2e
        env:
          BASE_URL: http://localhost:${{ env.PORT }}/ohmoveagain/

      - name: Upload Playwright report on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### 5.2 New nightly workflow `.github/workflows/qa-nightly.yml`

- Runs full Track A matrix against the **deployed** `7nolikov.dev/ohmoveagain/` (catches deploy drift, CDN cache bugs, real network).
- Optionally: triggers Track B agent pass (Claude API call) with a 10-minute budget.
- Opens an issue if any blocker is reported.

### 5.3 `package.json` additions

```json
{
  "scripts": {
    "qa:install": "playwright install --with-deps chromium webkit",
    "qa:e2e": "playwright test",
    "qa:e2e:ui": "playwright test --ui",
    "qa:report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0"
  }
}
```

### 5.4 Migration order

1. Land `playwright.config.ts` + smoke + mobile specs (covers §2.1 + §2.2, the C1 replacement) — **closes C1**.
2. Add calculator + pipeline + pet specs (§2.3–2.5).
3. Add i18n + no-js + security specs (§2.7–2.10).
4. Wire to CI as required check.
5. Build agent (Track B) once Track A is stable.

---

## 6. Definition of "ready to launch"

All five must be true:

1. Track A passes on `iphone-se`, `pixel-7`, `desktop`, `no-js` projects.
2. axe-core: 0 critical, 0 serious.
3. Lighthouse mobile ≥ 90 on the four key URLs.
4. Track B agent run produces verdict `GO`.
5. `D6` (pre-seed list) confirmed pinged ≥ 12 hours before launch post.
