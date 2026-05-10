# Adding a new country

This document explains how to add a country to the Pipeline. It is aimed at contributors who have personally relocated to the target country and can verify official sources.

## Before you start

Open an issue using the **"Add a country"** template. Confirm you can commit to 6 months of content accuracy ownership before opening a PR. Country content that has no active owner gets archived, not merged.

## How the data model works

The Pipeline separates **structural facts** from **translatable strings**.

```
data/
  stages/
    <slug>.yaml       ← source URLs, asOf dates, appliesTo filters
content/
  stages/
    <slug>.md         ← English display strings (labels, notes, gotchas)
    <slug>.ru.md      ← Russian (auto-synced, human-editable)
```

A source URL change is one YAML edit that propagates to every language. A label change is a strings-only `.md` edit with zero URL drift risk.

## Step-by-step

### 1. Fork and clone

```sh
gh repo fork 7nolikov/ohmoveagain --clone
cd ohmoveagain
hugo server -D   # verify local build works
```

### 2. Copy the skeleton data files

```sh
cp data/stages/assessment.yaml    data/stages/<country>/assessment.yaml
cp data/stages/pre-flight.yaml    data/stages/<country>/pre-flight.yaml
cp data/stages/migration.yaml     data/stages/<country>/migration.yaml
cp data/stages/initialization.yaml data/stages/<country>/initialization.yaml
cp data/stages/scaling.yaml       data/stages/<country>/scaling.yaml
```

Replace every `url` and `lastChecked` with values for your country. Assign the correct `type` to each source — valid values are `official`, `supranational`, or `community` (the build fails on any other value). Keep the same YAML schema — `id` fields must be stable kebab-case; do not put human-readable strings in the YAML.

### 3. Copy and adapt the content files

```sh
cp content/stages/assessment.md    content/stages/<country>/assessment.md
# repeat for the other four stages
```

Edit the labels, notes, gotchas, and categoryNames in each `.md` file to reflect your country's specifics. Do not put URLs or dates in the `.md` files.

### 4. Run the parity check

```sh
npm install
npm run i18n:parity   # fails if per-language key shapes diverge
```

Fix any shape mismatches before opening a PR.

### 5. Update `hugo.toml`

Add an entry to `[languages]` for your country's primary language if it is not already present.

### 6. Open a PR

Reference the tracking issue. The PR description should list:
- Which stages are covered
- Official sources used per stage
- Your availability for follow-up reviews

## Content standards

Every checklist item must:
- Cite an official or authoritative source (prefer ministry / government authority / EU Commission)
- Include an `asOf` or `lastChecked` date — see "Setting verified dates" below
- Be specific and actionable — avoid vague wording
- Use `appliesTo` filters if it only applies to certain visa types, family compositions, or pets

## Setting verified dates

A source is marked "verified" on the date you personally:
1. Opened the URL and confirmed it resolves
2. Located the specific rule or threshold on that page
3. Confirmed that the claim's wording in the YAML/content files matches what the source says

This is a manual read, not a URL ping or a build check. If the page is live but the specific rule is gone or changed, the source is **not** verified — update the claim first, then set the date.

Set `lastChecked` (on a `sources[]` entry) or `asOf` (on an inline `source:` block) to today's date in `YYYY-MM-DD` format. Do not backdate.

Source tier guide — `type` must be one of:
- `official` — Government authority directly responsible for the rule (ministry, tax authority, social insurance body)
- `supranational` — EU institutions, treaty bodies, intergovernmental organisations (HCCH, IATA, WHO, CITES)
- `community` — Public registries, surveys, contributor reports. Supporting context only, not primary authority

## Maintenance commitment

When you merge a country, you become the content owner for that country. That means:
- Reviewing the weekly link-check CI output
- Updating `lastChecked` / `asOf` dates when sources change
- Responding to issues filed against your country's content within 2 weeks

If you can no longer maintain the country, open an issue titled "Seeking maintainer: [country]" before going inactive.
