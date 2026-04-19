# Project decisions

Strategy decisions locked for ohmoveagain. Update this file when a decision changes (with date + reason). Don't re-open a decision without traction data.

Last review: **2026-04-19** (round 4 reassessment).

---

## 1. Audience

**Decision:** Solo-SaaS founders and senior contractor devs. Croatia only.

**Not:** Nomads in general, retirees, non-technical expats, other EU countries (yet).

**Why:** The terminal/CLI aesthetic is ~40% of the differentiation. It only works for devs. Broadening collapses the moat and forces head-to-head competition with Nomad List / InterNations. Multi-country expansion is architecturally cheap to add later (the 3-level schema already supports it), but content maintenance multiplies per country — not worth it before signal.

---

## 2. Business model

**Decision:** Everything free. No gated content. No paid playbook. No course.

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
- Family-reunification tagged across existing stages (no new stage — keeps the pipeline metaphor). Covers apostille+translate marriage/birth certs, income thresholds for sponsor, school enrollment sequencing, spouse right-to-work by permit type, non-EU spouse edge cases.
- Pets concentrated in stages 2–3. EU pet passport prep (microchip → rabies → 21-day wait → titer within 6mo), banned-breed/cat rules, airline cabin/cargo matrix, post-arrival vet + chip registration. Signature gotcha: the 4-month lead-time trap. Ships with a move-date → deadline countdown widget.

**Sequencing:** Phase 1 (schema + selector + filtered counters) lands first. Phases 2–4 (visa / family / pets content) parallelize after schema locks.

---

## 5. Launch plan

**Targets:** Show HN, r/digitalnomad, r/eupersonalfinance, Twitter/LinkedIn.

**Framing:** Stack as story — *"I modeled relocation as CI/CD. Here's every YAML file."* Not a feature announcement; a thesis post with linked artifact.

**Blockers before HN (not before Reddit):**
1. OG image — need PNG 1200×630 (SVG fails on Twitter/FB previews). OR ship dynamic OG via GH Action.
2. Waitlist Formspree ID — wire a real endpoint OR replace with "watch repo + open issue" CTA.
3. Fix the most visible `href: "#"` artifacts on stage pages.
4. Add inline citations to any prose tax rates (currently only official sources are linked at the link level).

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
3. "Export my playbook" markdown/JSON download.
4. Timeline / dependency Gantt visualization.
5. "Ask this playbook" LLM widget (user's own API key, no backend).
6. "Fork for $country" PR template.
7. README status badge (shields.io style).
8. Anonymous counter via single Cloudflare Worker KV.
9. RSS per stage for law updates.
10. HN launch post with thesis framing.

---

## Meta rule

**Don't re-open a decision without traction data.** Four reassessments in 24 hours on 2026-04-18→19 produced plans, not launches. The next scope change waits for signal.
