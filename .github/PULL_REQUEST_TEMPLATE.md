<!--
Thanks for contributing. Delete any section that doesn't apply.
Small PRs land faster — a single corrected source is a perfectly good PR.
-->

## What this changes

<!-- One or two sentences. -->

## Why

<!-- Link the issue if there is one. If this corrects a fact, say what was wrong. -->

## Sources

<!--
Required if this changes any fact, date, fee, threshold, or link.
Primary sources only — government, EU, or the issuing authority.
-->

| Claim | Source URL | Checked on |
| --- | --- | --- |
|  |  |  |

- [ ] I actually opened each source above and confirmed it says this, today
- [ ] `asOf` / `lastChecked` dates reflect that check, not a copy of the old value

## Checks

- [ ] `node scripts/check-staleness.mjs` passes
- [ ] `npm run test:unit` passes
- [ ] Content changes made in the English source, not hand-edited into `*.ru.md`
- [ ] Any new `uses:` in a workflow is pinned to a 40-character SHA

<!--
CI runs staleness, i18n parity, UI parity, translation freshness, unit tests,
axe, Lighthouse (desktop + mobile) and the full Playwright matrix. The
`quality` check must pass to merge.
-->
