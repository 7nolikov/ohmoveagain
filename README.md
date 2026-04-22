# ohmoveagain

**ohmoveagain** is an open-source relocation guide for moving to Croatia.

The core product is **the Pipeline** — a five-stage, source-backed framework that helps people plan, execute, and track a relocation with less guesswork. It combines ordered stages, prerequisites, required documents, practical checklists, and a runway calculator. The project is community-maintained and free to use.

> Think of the Pipeline as CI/CD for relocation: ordered stages, explicit prerequisites, verifiable artifacts, and repeatable progress.

**Live site:** [https://7nolikov.dev/ohmoveagain/](https://7nolikov.dev/ohmoveagain/)

## What the project includes

The current version focuses on relocation to Croatia and covers five sequential stages.

1. **Assessment** — tax math, visa pathway review, and career reality check
2. **Pre-Flight** — apostilles, background checks, diplomas, and family or pet paperwork
3. **Migration** — border crossing and the first days after arrival
4. **Initialization** — OIB, address registration, bank account, and HZZO setup
5. **Scaling** — business structure, tax optimization, and long-term local integration

Each stage is designed to answer four practical questions:

- What must be done before this stage starts
- Which documents or artifacts are required
- Which official sources support the checklist
- Which common mistakes usually slow people down

User progress is stored locally in the browser. No personal data is sent to a backend service.

The project also includes a [runway calculator](https://7nolikov.dev/ohmoveagain/calculator/) that estimates how many extra months of savings a move can buy based on gross income and country-specific assumptions.

## Tech stack

| Layer | Tool |
| --- | --- |
| Static site generator | [Hugo](https://gohugo.io/) v0.160.1 extended |
| Client interactivity | [Alpine.js](https://alpinejs.dev/) v3 |
| Form handling | [Formspree](https://formspree.io/) |
| Hosting | GitHub Pages |
| Deployment | GitHub Actions |
| Styling | Framework-free CSS |

There is no Node runtime, no database, and no application server.

## Local development

### Prerequisites

- Hugo extended `0.160.1` or newer

### Run locally

```sh
brew install hugo
hugo server -D
```

The local development server will start with live reload enabled.

### Production build

```sh
hugo --gc --minify
```

The generated site is written to `public/`.

## Project structure

```text
content/
  stages/             # stage text content and localized strings
  calculator.md       # calculator page front matter
  subscribe.md        # subscribe page front matter
  contribute.md       # contribution page

data/
  countries.yaml      # calculator baseline data
  stages/             # language-neutral structural stage data

layouts/
  _default/           # shared templates
  stages/             # stage rendering templates
  partials/           # reusable partials

static/
  style.css
  favicon.svg
  og.png

.github/
  workflows/
    deploy.yml
    linkcheck.yml
```

## Content model

The project separates structural data from translatable strings.

Structural facts live in `data/stages/<slug>.yaml`. Those files contain item identifiers, source URLs, dates, filters, and other canonical values that should stay consistent across languages.

Language-specific strings live in `content/stages/<slug>.<lang>.md`. Those files contain titles, labels, notes, source labels, category names, gotchas, and other text intended for readers.

This split keeps content maintenance safer. When a source URL or effective date changes, it can be updated once in the structural data without duplicating logic across multiple translations.

## Language support

The project currently ships in English.

The architecture is already prepared for additional languages. Planned future languages mentioned in the project direction include Croatian, Russian, and German.

## Configuration

Project-level settings live in `hugo.toml` under `[params]`.

Examples include:

- Formspree form ID
- Repository URL
- Open Graph image filename
- Base URL for deployment

If the site domain changes, `baseURL` in `hugo.toml` should be updated accordingly.

## Deployment

Deployment is handled through GitHub Actions.

A push to `main` triggers the build and deploy workflow for GitHub Pages. Depending on repository and Pages settings, the site can be served either from the default GitHub Pages URL or from the configured custom domain.

## Contributing

Contributions should prioritize accuracy and traceability.

A good content contribution should:

- cite an official or authoritative source
- include a clear and specific action or requirement
- avoid vague wording
- stay aligned with the current Croatia-first scope

Content updates typically belong in one of two places:

- `data/stages/<slug>.yaml` for source URLs, dates, IDs, and structural facts
- `content/stages/<slug>.md` for labels, notes, and reader-facing text

## Roadmap

Current roadmap themes already reflected in the project materials include:

- deeper Croatia tax and entity comparisons
- printable document checklists
- more calculator coverage for additional country pairs
- multilingual support
- translation-assistance workflows

## License

MIT. See [LICENSE](./LICENSE).
