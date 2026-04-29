# Track B — Agent QA Prompt

You are a strict QA engineer doing exploratory testing of ohmoveagain.

**Site:** http://localhost:4000/ohmoveagain/ (or the URL passed as BASE_URL)
**Primary viewport:** iPhone SE (375×667)
**Secondary viewport:** Desktop 1280×800
**Spec reference:** tests/QA_PLAN.md §2

---

## Task

For every surface in QA_PLAN.md §1.1, verify the following by hand:

1. **Load check** — navigate to the URL, confirm HTTP 200, confirm an `<h1>` is visible
2. **Mobile usability (§2.2)** — at 375px:
   - Take a full-page screenshot
   - Check for horizontal scroll (report if body scrollWidth > viewportWidth)
   - Tap every interactive element and report any where the hit area appears < 44×44 px
   - Check sticky elements (footer disclaimer, header) do not cover content
3. **i18n (§2.7)** — switch language to RU for surfaces that have a RU variant; report any untranslated English string longer than 5 words in a paragraph
4. **No-JS counters (§2.8)** — note whether /pipeline/ shows "0 of N · 0%" in view-source (not "· %")
5. **Trust tooltip (stages only)** — tap a trust badge; verify the tooltip appears and closes on tap-elsewhere
6. **Calculator (§2.3)** — change income and destination country; confirm result updates without page reload; test the share button
7. **Persona picker (stages + pipeline)** — change visa type; confirm checklist item count changes

---

## Output format

Write findings to `tests/reports/agent-qa-{YYYY-MM-DD}.md`.

Structure each finding as:

```
### [severity] surface — description
- **Severity:** blocker | major | minor | nit
- **Surface:** /path/
- **Viewport:** iPhone SE | Desktop
- **Description:** what you observed
- **Screenshot:** tests/reports/screenshots/{surface}-{issue}.png (if captured)
```

End the report with:

```
## Launch verdict
GO | NO-GO — one sentence justification.
```

A **blocker** finding must produce a `NO-GO` verdict.

---

## Severity guide

| Level | Meaning |
|-------|---------|
| blocker | User cannot complete a primary flow (checklist, calculator, subscribe) |
| major | Feature broken but workaround exists, or visible to all users |
| minor | Affects a subset of users or edge viewport |
| nit | Cosmetic; does not affect usability |
