# ohmoveagain

> relocation as a deployment pipeline. engineered, not improvised.

The engineering playbook for senior devs relocating to Croatia (Zagreb). Five-stage
deployment pipeline, a runway calculator with shareable deltas, and zero travel-blog filler.

**Target audience (locked scope):**
- **Primary** — senior / staff software engineers evaluating Croatia as their next tax residency.
- **Secondary** — any mid-to-senior dev running the EU relocation math (HR / MNE / DE / PT / EE).
- **Out of scope** — generic expat content, family logistics, non-IT professions.

## Stack

| Layer | Tool |
| --- | --- |
| Static site | [Hugo](https://gohugo.io/) v0.160.1 extended |
| Client interactivity | [Alpine.js](https://alpinejs.dev/) v3 (CDN, `defer`) |
| Form handler | [Formspree](https://formspree.io/) free tier |
| Hosting | GitHub Pages (free) — project site at `https://7nolikov.dev/ohmoveagain/` |
| CI/CD | GitHub Actions — builds Hugo, deploys on every push to `main` |
| CSS | Framework-free, ~7KB, mobile-first, system-font mono |

No Node. No Go. No database. One `git push` → production. If you want the
longer rationale for why this stack (and not Next.js / Astro / Go+HTMX), see
`docs/stack-decision.md` — TL;DR: content velocity + zero runtime beats every
alternative for this scope.

## Local development

```sh
# install hugo 0.160+ extended
brew install hugo

# run the dev server
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
data/
  countries.yaml  # tax + cost-of-living baselines (the calculator's source of truth)
layouts/
  _default/       # baseof, single, list, calculator, waitlist
  stages/         # stage single override
  partials/       # head, header, footer, subscribe-form
static/
  style.css       # ~7KB terminal aesthetic, mobile-first
  favicon.svg
  og.svg          # default Open Graph image
.github/
  workflows/
    deploy.yml    # build Hugo + deploy to GitHub Pages
```

## Contributing

Content is the product. PRs welcome if they:

1. **Cite a primary source** (government site, official form, tax authority page) in the PR body.
2. **Don't add affiliate links.** Ever.
3. **Keep the terminal voice** — exit codes, shell commands, no marketing prose.
4. **Are country-specific.** "Relocation in general" is already solved by Wikipedia.

To add a country to the calculator, edit `data/countries.yaml`. To add a stage
gotcha, edit the relevant `content/stages/*.md`.

## Deploy (GitHub Pages via GitHub Actions)

One path. Everything automated via `.github/workflows/deploy.yml`.

1. Push this repo to GitHub (`github.com/7nolikov/ohmoveagain`).
2. Push to `main` → workflow auto-enables Pages (first run only) and deploys.
3. Site comes up at `https://7nolikov.github.io/ohmoveagain/`, or at
   `https://7nolikov.dev/ohmoveagain/` once the custom domain is set up
   (done once on your user-page repo `7nolikov.github.io` — not here).

If you ever change the domain, edit `baseURL` in `hugo.toml` — that's the only knob.

### GH Pages security headers caveat

GitHub Pages doesn't let you set response headers (no `_headers`, no CSP header).
CSP + referrer-policy are delivered via `<meta>` tags in `layouts/partials/head.html`.
Weaker than real headers (no `frame-ancestors` enforcement in meta) but sufficient.

### Formspree wiring

1. Sign up at [formspree.io](https://formspree.io/).
2. Create a form, copy the form ID (e.g. `xzbqaevk`).
3. Edit `hugo.toml` → `params.formspreeID = "xzbqaevk"`.
4. If unset, the form silently falls back to a `mailto:` target — nothing breaks in dev.

## Launch checklist

- [ ] `baseURL` in `hugo.toml` matches where the site will live (default: `https://7nolikov.dev/ohmoveagain/`).
- [ ] `formspreeID` in `hugo.toml` is set to a real Formspree form ID.
- [ ] `githubURL` in `hugo.toml` points to the actual repo.
- [ ] First push to `main` succeeds (green check on the `Build & Deploy` workflow).
- [ ] OG image renders correctly — Twitter / Telegram / Slack unfurl.
- [ ] Lighthouse (mobile) ≥ 90 across perf / a11y / best-practices / SEO.
- [ ] Submit `/sitemap.xml` to Google Search Console once the domain is live.
- [ ] Post the calculator screenshot with a sharp dev-voice tweet. That's the launch.

## Roadmap (all free, open-source)

- Full HR tax-optimization playbook for solo-SaaS founders (paušalni obrt vs j.d.o.o. vs d.o.o.)
- Apostille packet generator (PDFs pre-filled from a short form)
- Additional country pairs in the calculator

Subscribe form lives at `/waitlist/` (URL kept for link stability). Email capture goes to Formspree. One ping per new stage or playbook. See [DECISIONS.md](./DECISIONS.md) for the locked business model.

## License

MIT. See [LICENSE](./LICENSE).
