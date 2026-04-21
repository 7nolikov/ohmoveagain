# ohmoveagain

A community-maintained, open-source playbook for moving to Croatia. Five stages, sourced checklists, prerequisites, required documents, and a runway calculator. Free and open source.

**Live site:** [https://7nolikov.dev/ohmoveagain/](https://7nolikov.dev/ohmoveagain/)

## What it covers

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
  stages/         # five pipeline stages, one .md each
  calculator.md   # front-matter only; rendered by layouts/_default/calculator.html
  waitlist.md     # front-matter only; rendered by layouts/_default/waitlist.html
  contribute.md   # contribution guide
data/
  countries.yaml  # tax + cost-of-living baselines (calculator source of truth)
layouts/
  _default/       # baseof, single, list, calculator, waitlist
  stages/         # stage single override
  partials/       # head, header, footer, subscribe-form, global-progress, hotkeys-help
static/
  style.css       # ~7KB, mobile-first, dark mono
  favicon.svg
  og.png          # Open Graph image
.github/
  workflows/
    deploy.yml    # build Hugo + deploy to GitHub Pages
```

## Contributing

Content is the product. The bar for a good contribution:

1. **Cite an official source** — government site, EU portal, or internationally recognised body. Link it in the checklist item's `source` block with a `label` and `asOf` date.
2. **Be specific.** "≥ 21 days before travel" is better than "a few weeks before travel."
4. **Plain English.** Short sentences, active voice.
5. **Croatia-only for now.** Multi-country is on the roadmap; content stays HR-only until launch.

See [/contribute/](https://7nolikov.dev/ohmoveagain/contribute/) for the full contributor guide, or open a GitHub issue to flag a stale source, broken link, or missing checklist item.

To add a checklist item, edit the relevant `content/stages/*.md`. To update the calculator's tax baselines, edit `data/countries.yaml`.

## Deploy (GitHub Pages via GitHub Actions)

Everything is automated via `.github/workflows/deploy.yml`.

1. Push this repo to GitHub.
2. Push to `main` → workflow builds Hugo and deploys to Pages.
3. Site comes up at `https://7nolikov.github.io/ohmoveagain/`, or at `https://7nolikov.dev/ohmoveagain/` once the custom domain is configured on the user-page repo (`7nolikov.github.io`).

If you change the domain, edit `baseURL` in `hugo.toml` — that is the only knob.

### GitHub Pages security headers

GitHub Pages does not support custom response headers. CSP and referrer-policy are delivered via `<meta>` tags in `layouts/partials/head.html`. Sufficient for this use case; `frame-ancestors` is not enforceable from meta.

## Configuration

All site-level knobs live in `hugo.toml → [params]`:

| Key | Value |
| --- | --- |
| `formspreeID` | Formspree form ID (e.g. `mjgjelyd`) — already set |
| `githubURL` | Full URL to this repository |
| `ogImage` | Filename of the OG image in `static/` |

## Launch checklist

- [x] `baseURL` in `hugo.toml` set to `https://7nolikov.dev/ohmoveagain/`
- [x] `formspreeID` set (`mjgjelyd`)
- [x] `githubURL` points to the actual repo
- [ ] First push to `main` succeeds (green `Build & Deploy` workflow)
- [ ] OG image unfurls correctly on Twitter / Telegram / Slack
- [ ] Lighthouse (mobile) ≥ 90 across perf / a11y / best-practices / SEO
- [ ] Submit `/sitemap.xml` to Google Search Console

## Roadmap

- Full HR tax-optimization playbook (paušalni obrt vs j.d.o.o. vs d.o.o.)
- Apostille document checklist as a printable PDF
- Additional country pairs in the calculator
- Croatian translation of key checklist items

## License

MIT. See [LICENSE](./LICENSE).
