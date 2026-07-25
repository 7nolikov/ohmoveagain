# Contributing

**The full guide lives at <https://ohmoveagain.com/contribute/>** — and in
[Russian](https://ohmoveagain.com/ru/contribute/).

It is kept there rather than here so there is exactly one copy to maintain, and
so the people most able to spot a stale rule — readers who are mid-move and have
just been on the government page in question — find it without ever opening
GitHub.

**You do not need to be a developer.** Three of the four routes described there
happen entirely in your browser.

## The short version

| I want to… | How |
|---|---|
| Report something wrong | [Open an issue](https://github.com/7nolikov/ohmoveagain/issues/new/choose) — the source-correction form asks for the official page and the date you checked it |
| Fix a typo | Scroll to the bottom of any page on the site, click **✎ Edit this page on GitHub** |
| Update a source link or date | Click the verification date under a checklist item — it deep-links to the exact line |
| Work on it locally | See below |

## Running it locally

```bash
gh repo fork 7nolikov/ohmoveagain --clone
cd ohmoveagain
npm install
hugo server          # http://localhost:1313/
```

**Facts and words are stored separately**, and translation depends on that split
holding:

| What | Where |
|---|---|
| Facts — URLs, `asOf` dates, persona filters | `data/stages/*.yaml` |
| Words — labels, notes, source labels | `content/stages/*.md`, under `itemStrings.<item-id>` |
| Calculator baselines | `data/countries.yaml` |
| Fees, forms, offices | `data/fees.yaml`, `data/forms.yaml`, `data/offices.yaml` |
| Interface strings | `i18n/en.yaml`, `i18n/ru.yaml` |

Templates merge the two by item ID at build time. A URL belongs in the YAML,
never in the prose.

### Before opening a pull request

```bash
node scripts/check-staleness.mjs        # source freshness
node scripts/check-i18n-parity.mjs      # EN/RU structural parity
node scripts/check-ui-i18n-parity.mjs   # interface string parity
node scripts/check-i18n-freshness.mjs   # translations match their source hash
npm run test:unit                       # unit tests
npm run qa:e2e                          # Playwright (needs a running server)
```

CI runs all of these plus axe, Lighthouse (desktop **and** mobile) and the full
Playwright matrix. The `quality` check must pass to merge.

### Rules worth knowing before you spend time

Reasoning for each is in [`DECISIONS.md`](DECISIONS.md).

- **Every claim needs a URL and a date.** No primary source, no ship. And never
  bump a date you did not personally verify — that is the one mistake that makes
  the site confidently wrong rather than visibly stale.
- **Do not hand-edit the structure of `*.ru.md`.** Russian content is generated
  by the i18n pipeline — change the English source and the sync opens a PR.
  Prose fixes to existing Russian wording are welcome.
- **Pin every GitHub Action to a 40-character SHA** (§16). The repository
  enforces this, so an unpinned `uses:` is rejected outright.
- **Keep internal links relative.** Use `relURL`/`absURL` in templates and
  root-relative paths in content.

Translations: see [`CONTRIBUTING-i18n.md`](CONTRIBUTING-i18n.md).

## Security

Please **do not** open a public issue for a vulnerability. See
[`SECURITY.md`](SECURITY.md).

## Licence

Contributions are MIT licensed, matching [`LICENSE`](LICENSE). Every improvement
ships as a public commit under your name.
