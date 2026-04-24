# Project decisions

Strategy decisions locked for ohmoveagain. Update this file when a decision changes (with date + reason). Don't re-open a decision without traction data.

Last review: **2026-04-22** (naming + i18n architecture).

---

## 0. Product name

**Decision (2026-04-22):** `ohmoveagain` is the **brand / site name**. The product it publishes is **the Pipeline** — always capitalised as a proper noun when it refers to the thing.

**Usage convention:**
- "the Pipeline" — the product as a whole.
- "Pipeline stage" / "the five stages of the Pipeline" — its parts.
- lowercase `pipeline` stays in CSS class names (`.pipeline`, `.pipeline-summary`), anchor IDs (`#pipeline`), and `aria-label` where it's structural-not-branded.
- The word "playbook" is retired from user-facing copy. It survives only in commit history.

**Why:** prior copy drifted between "playbook" (soft, generic, competitive with every relocation blog) and "pipeline" (distinctive, on-brand for the dev audience, matches the CI/CD framing of the launch thesis). Two names for one thing confused users; one name, capitalised, makes the product something end users can refer to by name.

**How to apply:** any new user-facing string referring to the thing uses "the Pipeline". Data / YAML / CSS terminology is exempt.

---

## 1. Audience

**Decision:** Solo-SaaS founders and senior contractor devs. Croatia only.

**Not:** Nomads in general, retirees, non-technical expats, other EU countries (yet).

**Why:** The terminal/CLI aesthetic is ~40% of the differentiation. It only works for devs. Broadening collapses the moat and forces head-to-head competition with Nomad List / InterNations. Multi-country expansion is architecturally cheap to add later (the 3-level schema already supports it), but content maintenance multiplies per country — not worth it before signal.

---

## 2. Business model

**Decision:** Everything free. No gated content. No paid Pipeline. No course.

**Monetization (if any):** affiliate referrals to high-intent services (apostille, accountants, pet movers). Tasteful footer placement only. GitHub Sponsors as tip jar.

**Not:** Paid PDFs, subscription, community paywall, waitlist-gated content.

**Why:** Paid PDFs died as a category. Free + distribution leverage beats paid content at this audience size (5–20k people/yr globally). Business model has already been changed twice; changing again is thrashing.

---

## 3. Scope depth

**Decision:** Own the *routing table* — sequencing, dependencies, timing, lead times. Everything else links out.

**In scope:** apostille ordering, document chains, OIB→address→school sequencing, EU pet passport timing, tax math, visa path decisions.

**Out of scope:** neighborhood guides, school reviews, bank comparisons, car-buying, healthcare provider reviews.

**Why:** Depth-content verticals already have entrenched competitors. Dependency/sequencing data is the one thing nobody does rigorously. Linking out is distribution leverage, not a loss — the project becomes the routing layer.

---

## 4. Multi-persona (visa / family / pets) — INCLUDED

**Decision:** In scope for the initial public version. Reversed the same-day "defer" decision after the owner confirmed first-hand experience with visa selection, family reunification paperwork, and pet import — primary-source signal that satisfied the trigger condition.

**Architecture:**
- Schema: add `appliesTo: { visa, family, pets }` to each checklist item; default = all (shows always).
- Alpine `profile` store persisted to localStorage + URL query (`?p=dn-s-2-cat`).
- Persona picker lives in the global progress strip.
- `x-show` filters items; global / stage / group counters recompute against filtered total (hard correctness requirement — mismatched counts break the whole progress UX).
- "No profile set" default shows everything + banner prompting the user to set profile.

**Content tracks for Croatia:**
- 8 visa paths: digital-nomad, EU Blue Card, work-permit, self-employment/business, family-reunification, EU/EEA registration, permanent-residence (5yr), citizenship-by-descent.
- Family-reunification tagged across existing stages (no new stage — preserves the five-stage Pipeline shape). Covers apostille+translate marriage/birth certs, income thresholds for sponsor, school enrollment sequencing, spouse right-to-work by permit type, non-EU spouse edge cases.
- Pets concentrated in stages 2–3. EU pet passport prep (microchip → rabies → 21-day wait → titer within 6mo), banned-breed/cat rules, airline cabin/cargo matrix, post-arrival vet + chip registration. Signature gotcha: the 4-month lead-time trap. Ships with a move-date → deadline countdown widget.

**Sequencing:** Phase 1 (schema + selector + filtered counters) lands first. Phases 2–4 (visa / family / pets content) parallelize after schema locks.

---

## 5. Launch plan

**Targets:** Show HN, r/digitalnomad, r/eupersonalfinance, Twitter/LinkedIn.

**Framing:** Stack as story — *"I modeled relocation as CI/CD. Here's every YAML file."* Not a feature announcement; a thesis post with linked artifact.

**Blockers before HN — all cleared:**

**Success signals:**
- HN: >50 points = viable; >200 = real signal.
- Reddit: upvote ratio + comment quality.
- GitHub: stars, PR opens, issue opens (especially "add $country").
- Calc: share-URL clicks, completions.

**Next build after launch:** pick from `low-effort wins` backlog based on which signal fires. Do NOT pre-build.

---

## 6. Moat candidates (what's actually defensible)

- **NOT a moat:** content itself (public sources), terminal aesthetic (copyable in weeks).
- **Moat:** structured YAML data (RAG-ready, embeddable), temporal sequencing data (hardest to replicate — tribal knowledge), community contribution graph (network effect, unstarted).

---

## 7. Low-effort viral wins — backlog (do NOT pre-build)

Pull from based on launch signal:

1. Dynamic OG image per share URL (GH Action + playwright). **Highest ROI.**
2. JSON/YAML public data feed (1-line Hugo output).
3. "Export my Pipeline" markdown/JSON download.
4. Timeline / dependency Gantt visualization.
5. "Ask the Pipeline" LLM widget (user's own API key, no backend).
6. "Fork for $country" PR template.
7. README status badge (shields.io style).
8. Anonymous counter via single Cloudflare Worker KV.
9. RSS per stage for law updates.
10. HN launch post with thesis framing.

---

## 8. Content architecture — data / strings split (2026-04-22)

**Decision:** Structural facts (item IDs, source URLs, `asOf` dates, `appliesTo` persona filters) live in `data/stages/<slug>.yaml`. Translatable strings (labels, notes, `sourceLabel`, `gotchas`, `categoryNames`) live in `content/stages/<slug>.md` front-matter keyed by stable item ID. Templates merge the two at build time.

**Why:** earlier architecture mixed structural and translatable fields in `content/stages/*.md`. That forced a translator to touch URLs/dates (drift risk) and meant a URL fix had to be replicated per language. With the split, a rule change is a one-file YAML edit that lights up every language; a translation is a strings-only PR with zero drift surface.

**How to apply:** add new checklist items by appending to `data/stages/<slug>.yaml` with a new item ID, then adding the strings under `itemStrings.<id>` in `content/stages/<slug>.md`. Never put URLs or dates in the `.md` files. Never put human-readable strings in the `.yaml` files (exception: `id` fields, which are kebab-case machine keys).

---

## 9. Language support — plan (2026-04-22, shipped for `ru` 2026-04-23)

**Decision:** English ships first and stays canonical. Non-English languages are additive strings-only files (`content/stages/<slug>.<lang>.md`). No structural fork, no data duplication.

**Priority order when signal justifies translation work:**
1. Croatian (`hr`) — partners, family, Croatian officials who verify claims.
2. Russian (`ru`) — large incoming-contributor cohort per feedback. **Shipped.**
3. German (`de`) — Blue Card / EU mobility audience.

**Not in scope:** fully-manual translation. The original plan of "LLM drafts, human commits" was inverted: the LLM drafts AND commits; a human edits after if quality drifts. Reasoning: for a solo-maintained project, human-in-the-loop on every content change is the actual blocker to language coverage, not quality. Quality is guarded by parity + freshness checks + glossary pins, not by a review gate.

**Trigger:** land the first translation when (a) we have a contributor who reads the target language natively and is willing to own parity for the first 6 months, or (b) waitlist / GitHub-issue signal points at a specific language.

---

## 10. i18n sync pipeline — architecture (shipped 2026-04-23)

**Decision:** LLM auto-translation with mechanical validation, bot-committed. No human-in-the-loop step before publication. Shipped for `ru`.

**Components:**
- `scripts/i18n-lib.mjs` — shared: `translationPayload`, `sourceHash` (SHA-256 over normalized payload), `compareShape` (recursive structural diff)
- `scripts/sync-ru-translations.mjs` — walks `content/stages/*.md`, skips if `<slug>.ru.md`'s `translationMeta.sourceHash` matches; otherwise calls GitHub Models `openai/gpt-4o`, normalizes wrapper keys (`translatedPayload`, `translation`, `ru`), fills missing top-level keys from the English payload, enforces glossary via regex pass, validates shape, writes with `{ slug, weight, sitemap, ...frontMatter, translationMeta }` preserving machine keys
- `scripts/check-i18n-parity.mjs` — build guard: per-language shape must match English
- `scripts/check-i18n-freshness.mjs` — build guard: `translationMeta.sourceHash` must match current English hash
- `data/i18n/glossary.ru.json` — terminology pins applied both as model prompt and post-response regex
- `.github/workflows/i18n.yml` — on `push` to `main` touching `content/stages/**`, runs sync, commits drift with `ACTIONS_TOKEN` (PAT) so downstream `deploy.yml` fires (bot pushes with default `GITHUB_TOKEN` do not trigger workflows)

**Why PAT instead of built-in token:** GitHub Actions suppresses workflow triggers from commits pushed by `GITHUB_TOKEN`. The `deploy.yml` trigger is `push: branches: [main]`, so the translation commit must be authored with a PAT to fire the deploy. Rejected `workflow_run` chaining — adds latency and failure-mode complexity.

**Why SHA-256 over source payload, not git diff:** git diff would re-translate on whitespace-only changes and wouldn't re-translate a Russian file fixed by hand to match an old English version. The content-addressed hash matches translations to source state regardless of commit topology.

**Why no human-in-the-loop:** solo-maintained project. Every manual gate is a broken promise waiting to happen. Quality is guarded structurally: glossary pins + shape validation + freshness checks. Human edits go into `<slug>.ru.md` directly and survive until the English hash next changes.

**Known gap:** `translationPayload` does NOT cover `data/stages/*.yaml` strings (`impact`, `explanation`, `conflictNote` on trust claims; `i18n/ru.yaml` UI strings; `content/_index.ru.md` body). RU pages leak English in trust details and nav. Tracked in `EXECUTION_PLAN.md` Sprints 7 + 8.

---

## Meta rule

**Don't re-open a decision without traction data.** Four reassessments in 24 hours on 2026-04-18→19 produced plans, not launches. The next scope change waits for signal.
