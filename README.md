# ohmoveagain

**ohmoveagain** publishes **the Pipeline** — the open-source, five-stage relocation Pipeline for moving to Croatia. Sourced checklists, prerequisites, required documents, a runway calculator. Community-maintained. Free.

> Think of the Pipeline as CI/CD for your relocation: ordered stages, declared prerequisites, verifiable artifacts, re-runnable. `ohmoveagain` is the brand; the Pipeline is the product.

**Live site:** [https://7nolikov.dev/ohmoveagain/](https://7nolikov.dev/ohmoveagain/)

## What the Pipeline covers

Five sequential stages for a Croatia relocation:

1. **Assessment** — tax math, visa pathway audit, career reality check (2–6 weeks)
2. **Pre-Flight** — apostilles, criminal background checks, diplomas, pet and family paperwork (4–12 weeks)
3. **Migration** — border crossing, first 72 hours on the ground (3–10 days)
4. **Initialization** — OIB, address registration, bank account, HZZO health insurance (2–6 weeks post-arrival)
5. **Scaling** — business structure, tax optimization, local community integration (ongoing)

Each stage lists its prerequisites, the documents you will produce, a sourced checklist, and the common pitfalls that trip people up. Progress is tracked locally in your browser — nothing is sent anywhere.

The [runway calculator](https://7nolikov.dev/ohmoveagain/calculator/) shows how many extra months of savings a move buys you, given your gross income, across HR / MNE / DE / PT / EE.

## Stack

| Layer | Tool |
| --- | --- |
| Static site | [Hugo](https://gohugo.io/) v0.160.1 extended |
| Client interactivity | [Alpine.js](https://alpinejs.dev/) v3 (CDN, `defer`) |
| Form handler | [Formspree](https://formspree.io/) free tier |
| Hosting | GitHub Pages — `https://7nolikov.dev/ohmoveagain/` |
| CI/CD | GitHub Actions — builds Hugo, deploys on every push to `main` |
| CSS | Framework-free, ~7KB, mobile-first, system-font mono |

No Node. No database. One `git push` → production.

## Local development

```sh
# install hugo 0.160+ extended
brew install hugo

# run the dev server (content hot-reloads)
hugo server -D

# full production build
hugo --gc --minify
# output in public/
```

## Project layout

```
content/
  stages/             # five Pipeline stages — STRINGS ONLY (title, labels, notes, gotchas)
                      # one <slug>.md per language (e.g. assessment.md, assessment.ru.md)
  calculator.md       # front-matter only; rendered by layouts/_default/calculator.html
  subscribe.md        # front-matter only; rendered by layouts/_default/subscribe.html
  contribute.md       # contribution guide
data/
  countries.yaml      # tax + cost-of-living baselines (calculator source of truth)
  stages/             # five Pipeline stages — STRUCTURAL FACTS (language-neutral)
    <slug>.yaml       # item IDs, source URLs, asOf dates, appliesTo persona filters
layouts/
  _default/           # baseof, single, list, calculator, subscribe, freshness
  stages/             # stage single override — merges data/ + content/ by item ID
  partials/           # head, header, footer, subscribe-form, global-progress, hotkeys-help
static/
  style.css           # ~7KB, mobile-first, dark mono
  favicon.svg
  og.png              # Open Graph image
.github/
  workflows/
    deploy.yml        # build Hugo + deploy to GitHub Pages
    linkcheck.yml     # weekly lychee source-URL check (opens auto-issue on breakage)
```

## Content architecture — data / strings split

The Pipeline separates **structural facts** (language-neutral, canonical) from **translatable strings** (per-language). They are merged at build time by stable item IDs.

| Layer | Location | Contains | Per-language? |
| --- | --- | --- | --- |
| Structural data | `data/stages/<slug>.yaml` | item IDs, source URLs, `asOf` dates, `appliesTo` persona filters, artifact refs | **No** — one canonical file |
| Translatable strings | `content/stages/<slug>.<lang>.md` front-matter | `title`, `subtitle`, `itemStrings.<id>.{label, note, sourceLabel}`, `categoryNames.<id>`, `gotchas`, `artifactNames.<id>` | **Yes** — one file per language |
| Merger | `layouts/stages/single.html` | `{{ $data := index hugo.Data.stages .File.ContentBaseName }}` → `{{ index $itemStrings $item.id }}` | — |

**Why this split matters.** When a rule or URL changes, you update *one* YAML file and every language is instantly consistent. A translator only ever touches strings — they cannot accidentally drift a URL or date. No duplicate source-of-truth across languages.

### Example

```yaml
# data/stages/initialization.yaml  (language-neutral)
checklist:
  - id: "identity-bootstrap"
    items:
      - id: "oib-issued"
        source:
          url: "https://www.porezna-uprava.hr/en/Pages/default.aspx"
          asOf: "2026-03-01"
```

```yaml
# content/stages/initialization.md  (English strings)
categoryNames:
  identity-bootstrap: "identity bootstrap"
itemStrings:
  oib-issued:
    label: "OIB (Croatian tax number) issued"
    note: "Required for bank, rental, employment contract, utilities."
    sourceLabel: "Porezna uprava — Croatian Tax Administration"
```

To add a Russian translation: create `content/stages/initialization.ru.md`, copy the strings block, translate values only. URLs, dates, item IDs, and persona filters stay in the YAML and apply automatically.

## Language support

**Today:** English only (`content/stages/<slug>.md`). The data/strings split is in place, so adding a language is a strings-only PR — no structural forks.

**Planned (no ETA; waiting on launch signal):**

1. **Croatian (`hr`)** — highest value: partners, family members, Croatian officials who verify our claims.
2. **Russian (`ru`)** — large incoming cohort per contributor feedback.
3. **German (`de`)** — Blue Card / EU mobility audience.

**Tooling to land alongside the first non-English language:**

- **Parity lint** (`scripts/check-i18n-parity.mjs`) — fails the build if `itemStrings`, `categoryNames`, or `artifactNames` keys diverge between `content/stages/<slug>.md` and `content/stages/<slug>.<lang>.md`.
- **LLM-assisted translation draft** — GitHub Actions workflow on `pull_request` with `paths: ['content/stages/*.md']`. Uses GitHub Models free tier (`permissions: models: read`, built-in `GITHUB_TOKEN`, no PAT) to post a draft translation as a PR comment. Human translator edits and commits. Content changes are infrequent enough to stay within the daily rate limit.
- **`hugo.toml [languages]`** config block + `lang` switcher in the header partial.

## Contributing

Content is the product. The bar for a good contribution:

1. **Cite an official source** — government site, EU portal, or internationally recognised body. Link it in the checklist item's `source` block with a `label` and `asOf` date.
2. **Be specific.** "≥ 21 days before travel" is better than "a few weeks before travel."
4. **Plain English.** Short sentences, active voice.
5. **Croatia-only for now.** Multi-country is on the roadmap; content stays HR-only until launch.

See [/contribute/](https://7nolikov.dev/ohmoveagain/contribute/) for the full contributor guide, or open a GitHub issue to flag a stale source, broken link, or missing checklist item.

**Where to edit:** item IDs, source URLs, and `asOf` dates live in `data/stages/<slug>.yaml`. Labels, notes, and `sourceLabel` text live in `content/stages/<slug>.md` under `itemStrings.<item-id>`. See the *Content architecture* section above for the data/strings split. Calculator tax baselines live in `data/countries.yaml`.

## Deploy (GitHub Pages via GitHub Actions)

Everything is automated via `.github/workflows/deploy.yml`.

1. Push this repo to GitHub.
2. Push to `main` → workflow builds Hugo and deploys to Pages.
3. Site comes up at `https://7nolikov.github.io/ohmoveagain/`, or at `https://7nolikov.dev/ohmoveagain/` once the custom domain is configured on the user-page repo (`7nolikov.github.io`).

If you change the domain, edit `baseURL` in `hugo.toml` — that is the only knob.

## Configuration

All site-level knobs live in `hugo.toml → [params]`:

| Key | Value |
| --- | --- |
| `formspreeID` | Formspree form ID (e.g. `mjgjelyd`) — already set |
| `githubURL` | Full URL to this repository |
| `ogImage` | Filename of the OG image in `static/` |

## Roadmap

- Full HR tax-optimization deep-dive (paušalni obrt vs j.d.o.o. vs d.o.o.)
- Apostille document checklist as a printable PDF
- Additional country pairs in the calculator
- First non-English language (`hr` or `ru`) + parity-lint CI step
- LLM-assisted translation drafts via GitHub Models free tier (content-change trigger)

## License

MIT. See [LICENSE](./LICENSE).
