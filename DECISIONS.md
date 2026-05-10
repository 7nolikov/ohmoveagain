# Project decisions

Strategy decisions locked for ohmoveagain. Update this file when a decision changes (with date + reason). Don't re-open a decision without traction data.

Last review: **2026-05-02** (post product audit — IA lock, language parity rule, calculator scope cap).

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

## 9. Language support — plan (2026-04-22, shipped for `ru` 2026-04-23, parity rule added 2026-05-02)

**Decision:** English ships first and stays canonical. Non-English languages are additive strings-only files (`content/stages/<slug>.<lang>.md`). No structural fork, no data duplication.

**Priority order when signal justifies translation work:**
1. Croatian (`hr`) — partners, family, Croatian officials who verify claims.
2. Russian (`ru`) — large incoming-contributor cohort per feedback. **Shipped.**
3. German (`de`) — Blue Card / EU mobility audience.

**Not in scope:** fully-manual translation. The original plan of "LLM drafts, human commits" was inverted: the LLM drafts AND commits; a human edits after if quality drifts. Reasoning: for a solo-maintained project, human-in-the-loop on every content change is the actual blocker to language coverage, not quality. Quality is guarded by parity + freshness checks + glossary pins, not by a review gate.

**Trigger:** land the first translation when (a) we have a contributor who reads the target language natively and is willing to own parity for the first 6 months, or (b) waitlist / GitHub-issue signal points at a specific language.

**Parity rule (2026-05-02, post-audit):** every user-visible page that exists in English must have an `i18n` key for every visible string before any non-English build is published. The `machine_translation_banner` is a contract — half-translated flagship pages (calculator, freshness, forms category labels) violate it and destroy the trust thesis on the first interaction.

**Why this rule and not "hide untranslated pages":** conditional language switchers and per-page suppression logic are a permanent maintenance tax (every new page asks "is this i18n'd yet"). One-time translation cost (≤2h for the current gap) beats forever-conditional UI. Templates with hardcoded English are a build-time defect, not a runtime feature flag.

**How to apply:** before adding a new template under `layouts/`, every visible string goes through `i18n` + `i18n/en.yaml`. Adding a new language re-runs `npm run i18n:sync:<lang>` and ships only when `check-i18n-parity` is clean for both content AND templates. CI gate to be added (track in `EXECUTION_PLAN`).

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

## 11. Reference-data translation pattern — addendum to §9 (locked 2026-05-04, Fix A)

**Context:** The Q6 Track B QA pass surfaced English content rendering on `/ru/forms/`, `/ru/offices/`, `/ru/calculator/` (country `note` cells), and `/ru/freshness/` (country names). Root cause was the same in every case: layouts read translatable strings (`title`, `note`, `name`, etc.) directly from language-agnostic `data/*.yaml` files. The §9 parity rule covers template strings; it didn't have an opinion on translatable *data* fields, so the gap accumulated quietly until launch QA.

**Decision (locked):** Reference data with translatable strings always splits structural fields from translatable strings. Choice of where translatable strings live is determined by **scope of consumption**, not by file convenience:

| Data scope | Structural data | Translatable strings | When |
|---|---|---|---|
| Per-stage content | `data/stages/<slug>.yaml` (lang-agnostic items + categories) | `content/stages/<slug>.<lang>.md` frontmatter (`itemStrings`, `categoryNames`, `gotchas`, etc., keyed by id) | Existing pattern, established 2026-04-22. |
| Page-scoped reference data (one consumer template) | `data/<thing>.yaml` (id + non-translatable fields) | `content/<page>/<...>.<lang>.md` frontmatter (`<thing>Strings`, keyed by id) | When a single page renders the data and the strings are conceptually part of that page. **Examples: forms (`formStrings` in `content/forms/_index.<lang>.md`), offices (`officeStrings` in `content/offices.<lang>.md`).** |
| Shared reference data (multiple consumer templates) | `data/<thing>.yaml` (id + structural fields) | `data/i18n/<thing>.<lang>.yaml` (keyed by id) | When the same data backs multiple pages and pulling strings from any single page's frontmatter would couple unrelated layouts. **Examples: countries (used by `/calculator/` AND `/freshness/`), fees (used by `/calculator/`).** |
| UI chrome | n/a | `i18n/<lang>.yaml` (flat keys) | Shared template-level strings, parameterized via `i18n` template func. |

**Layout contract:** templates merge structural data with the per-language strings via id lookup. Hugo flattens dotted filenames into single map keys, so `data/i18n/countries.en.yaml` is `index hugo.Data.i18n "countries.en"` — **not** `hugo.Data.i18n.countries.en`. The pattern in `layouts/_default/calculator.html` is the reference implementation.

**Decision rule for new translatable reference data (the only thing a contributor needs to remember):**
- Renders on exactly one page → page-scoped strings in the page's content frontmatter (`<thing>Strings`).
- Renders on two or more pages → shared strings under `data/i18n/<thing>.<lang>.yaml`.
- The structural data file (`data/<thing>.yaml`) never holds translatable strings, regardless.

**Parity gate:** `scripts/check-i18n-parity.mjs` (extended 2026-05-04) enforces shape parity for all four surfaces:
1. Translated stage frontmatter (existing).
2. `formStrings` against `data/forms.yaml` ids; `officeStrings` against `data/offices.yaml` ids.
3. `data/i18n/countries.<lang>.yaml` against `data/countries.yaml` codes; same for fees.
4. The English content/data is also gated — a `formStrings`/`officeStrings` block is required in `content/forms/_index.md` and `content/offices.md` before any non-English file can pass. This makes "ship the English structure first" a build-time invariant rather than a review check.

**Sync pipeline:** `scripts/sync-ru-translations.mjs` (extended 2026-05-04) auto-translates all four surfaces. Existing manual translations carry a `translationMeta.sourceHash` baseline so the script skips them until the English source actually changes. Adding a new language is `npm run i18n:sync:<lang>` plus the parity gate.

**Why not unify everything under `data/i18n/`:** page-scoped strings naturally belong with the page they describe — putting `formStrings` next to the page that renders it keeps a single contributor edit (adding a new form) within one file pair. Shared data has no natural home page, so it goes under `data/i18n/`. Same principle as colocation in any framework.

**Why not unify everything under `content/<page>/<...>.<lang>.md` frontmatter:** would force `/calculator/` and `/freshness/` to either duplicate the country strings or take a dependency on each other's frontmatter. Both are worse than a small shared file under `data/i18n/`.

**Closes the §10 "Known gap"** for `data/countries.yaml` and `data/fees.yaml`. The `data/stages/*.yaml` trust-claim strings (`impact`, `explanation`, `conflictNote`) are still not covered — same fix shape applies (move strings to `content/stages/<slug>.<lang>.md` frontmatter or to `data/i18n/`), tracked separately.

---

## 11. Information architecture — single-spine rule (2026-05-02)

**Decision:** the Pipeline is the spine of the product. Everything else is a sub-element of, or reference to, a Pipeline stage.

**Header navigation — three links exactly:**
- **Pipeline** (the five stages + the entry to them)
- **Calculator** (single named tool, kept in the header for HN/Reddit copy parity)
- **GitHub** (source + support)

**Demoted from header / landing page:**
- Calculator is a co-equal *header* link only because it has independent share-traffic value. It is NOT a co-equal *home-page* tool card — on the home page it appears as a sub-link inside Stage 1 (Assessment), not as a separate CTA.
- Offices, Forms, Arrival, Exit, Freshness, Contribute, Subscribe — none are top-level navigation. They surface contextually:
  - **Offices** + **Forms** → per-stage panels on the stage that needs them (e.g. OIB form on Stage 4).
  - **Arrival** ("after-landing") → folded into Stage 3 (Migration) or Stage 4 (Initialization). Not a separate page long-term.
  - **Exit** ("leaving origin country") → folded into Stage 1 (Assessment) as a "before you commit" appendix, or rendered as Stage 0.
  - **Freshness** → a stats strip at the bottom of the Pipeline page.
  - **Contribute**, **Subscribe** → footer links only.

**Home-page rule:** one primary CTA — *Start the Pipeline*. The 5-stage visual is the only above-the-fold structure. Trust hook ("every claim links to MUP / Porezna uprava / HZZO with a verified date") replaces the current meta subtitle.

**Why this lock:** the audit found the home page advertised four equal-weight tools (Pipeline, Calculator, Offices, Forms), which contradicted the "Pipeline is the product" thesis from §1. Three CTAs is no CTA. Locking the IA prevents drift the next time someone (human or AI PR) is tempted to add a fifth tool card or a sixth header link.

**How to apply:** any PR that adds a new top-level `content/<page>.md` or a new header `<a class="nav-link">` must justify why the content can't live as a stage panel or footer link. Default answer is "no." This decision overrides any prior implicit IA shipped before 2026-05-02.

---

## 12. Calculator scope — 12 countries, all sourced (revised 2026-05-02)

**Decision:** keep all 12 countries currently in `data/countries.yaml` (HR, MNE, DE, PT, EE, GB, US, NL, FR, PL, CZ, RS). `countries.yaml` already has `source.url`, `source.label`, `source.asOf`, and `validUntil` for every entry — the initial audit overstated the gap.

**Required for every country in `countries.yaml`:**
- `source.url` — URL to the official rate or CoL dataset
- `source.label` — human-readable source name
- `source.asOf` — ISO date of last verification
- `validUntil` — ISO date, validated by `check-staleness.mjs`

**How to apply:** any future country addition requires all four fields with verifiable sources. No country is added "because the data is approximately right." `check-staleness.mjs` already validates `validUntil`; extend it to also fail if `source.asOf` is >12 months old. Launch copy says "12 countries" — update if the count changes.

---

## 13. Stage gotchas — voice contract (2026-05-04)

**Decision:** every gotcha on a Pipeline stage page uses one voice — second-person imperative, em-dash separator, single sentence. Stage subtitles already follow this pattern (locked in commit `8a1992b`); gotchas now match.

**Voice contract:**
- **Open with an imperative verb** addressed to the reader: *Watch*, *File*, *Apostille*, *Pack*, *Notify*, *Sign*, *Bring*, *Don't carry*, *Don't improvise*. No declarative-only sentences. No "X happens / X is required / X means…" framings.
- **Use an em-dash to separate action from stake.** Pattern: `[Imperative clause] — [terse why or consequence].` One sentence per gotcha. No semicolons stitching two warnings together.
- **One gotcha = one trap.** No meta-commentary ("This stage is critical…"), no encouragement, no summary lines. If it isn't a specific failure mode, it isn't a gotcha and it doesn't ship.
- **Second person throughout.** "You" or implicit-you (imperative). No third-person ("a developer must…"), no first-person plural ("we should…").

**Why:** the pre-launch tone audit found subtitles read as a single directive voice while gotchas drifted between explanation, warning, and filler — including one (`assessment.md` #3) that wasn't a gotcha at all, just a meta-statement that the stage is "important." Mixed voice in the highest-stakes element on a stage page (the thing that exists to flag traps) erodes trust faster than a missing field. One voice across subtitle + gotcha makes the stage page feel authored, not assembled.

**How to apply:**
- Adding a new gotcha to `content/stages/<slug>.md` follows the contract above.
- Removing or rewriting an existing gotcha is fine; the i18n sync pipeline (§10) regenerates `<slug>.<lang>.md` on the next push to `main` because the `sourceHash` will mismatch.
- Reviewers reject any gotcha that opens with an article (*The*, *A*) or a noun-fact ("Croatia's…", "Tax residency…"). Imperative-first or it doesn't ship.
- The same contract applies to any future stage-level "watch out" microcopy (inline warnings, sidebars, callouts). One voice, project-wide.

---

## 14. Monospaced body font — intentional, do not change (2026-05-10)

**Decision:** the site uses a monospaced body font. This is an intentional dev-audience design choice, not a default or oversight.

**Why:** the terminal/CLI aesthetic is ~40% of the differentiation. A proportional font would make the site look like every other relocation blog and remove the signal that the audience is right. The mono font communicates "this is for developers" at a glance, before the user reads a single word.

**How to apply:** do not propose switching to a proportional font (system-ui, Inter, etc.) pre-launch or as a "readability improvement." Post-launch changes require a user-experience signal (e.g., heatmaps or session recordings showing bounces on text-heavy pages). HN + Reddit launch copy does not need to explain the font choice.

---

## 15. i18n pipeline cadence — push-triggered only, no schedules (2026-05-10)

**Decision:** the i18n translation and validation workflows run only on `push` (and PR) events. No cron schedule. No periodic rebuild.

**Why:** scheduled rebuilds would incur LLM API cost and open translation PRs on days with no content changes. Push-triggered runs are proportional: a translation sync fires exactly when English content changes, not on a timer. The `check-staleness.mjs` CI gate (which runs on every PR) is already the right mechanism for catching stale sources — no separate daily job needed.

**How to apply:** `.github/workflows/i18n.yml` must never add a `schedule:` trigger. If a contributor proposes a nightly i18n job, reject it — the push trigger is sufficient and cheaper. For launch-morning freshness verification, the process step (A-M7) is a one-time manual check, not a workflow.

---

## Meta rule

**Don't re-open a decision without traction data.** Four reassessments in 24 hours on 2026-04-18→19 produced plans, not launches. The next scope change waits for signal.
