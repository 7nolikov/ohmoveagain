---
title: "Contribute"
tagline: "Community-maintained · open source · MIT licensed"
subtitle: "This playbook is only useful if it stays accurate. Help keep it that way."
description: "How to contribute to ohmoveagain — the community-maintained Croatia relocation playbook. Fix broken sources, add a checklist item, share your experience, or translate content."
---

## Why contribute

Relocation rules change constantly. Every stage in this pipeline cites an official source and a verified-on date. The longer those dates slip, the less useful the playbook becomes. Contributors are what keep it honest.

Every improvement ships as a public commit under the contributor's name.

## Who this is for

You are a good fit to contribute if any of these apply:

- You have moved to Croatia and remember what tripped you up.
- You are in the middle of a move and are catching things the playbook missed.
- You work adjacent to relocation — immigration lawyer, accountant, relocation consultant, HR specialist — and can flag stale rules or add precision to a checklist item.
- You have moved to or from another country and want to help this project eventually cover more destinations.
- You are simply a careful reader and spotted a broken link, a typo, or a claim that no longer holds.

You do not need to be technical. Typo-level and copy-level improvements are just as valuable as new checklist items.

## What you can contribute

**Verify and refresh a source.** Every checklist item links to an official government or EU page with an `asOf` date. If a source has moved, been re-numbered, or the underlying rule has changed, update the link and bump the date.

**Add a missing checklist item.** If a real step bit you during your own move and the playbook does not cover it, add it to the right stage with a source link.

**Flag a gotcha.** Each stage has a `gotchas` block. These are non-obvious traps that do not fit neatly into a checklist. Add yours.

**Share field experience.** Timings ("OIB took 3 hours in Zagreb, 3 days in Split"), costs, municipality-specific quirks — these live in item notes and gotchas.

**Add a persona dimension.** The playbook already filters by visa, family, and pets. If you notice a checklist item behaves differently for a persona you belong to, add an `appliesTo` block or propose a new persona dimension.

**Improve the writing.** Clearer copy, better formatting, fixing awkward English.

**Translate.** Croatian translation of checklist items is valuable for partners and family members of the primary applicant.

## How to contribute

The full source lives on GitHub. Three ways to send a change, in order of friction:

1. **Open an issue.** Describe the change you would like to see. Fastest path if you are not comfortable editing files directly. Include a source link if you have one.
2. **Edit a file on GitHub and open a pull request.** Every stage page has an "edit on GitHub" link. Click it, make the change in the browser, and GitHub will walk you through the pull request. No local setup required.
3. **Clone, edit, and open a pull request.** Standard Hugo project. `hugo server` runs the site locally at `http://localhost:1313/ohmoveagain/`. Content lives in `content/stages/*.md` as front-matter YAML.

Every pull request is reviewed publicly. Expect a response within a few days.

## Quality bar

To keep the playbook trustworthy, contributions should meet a few ground rules:

- **Cite an official source** — government, EU, or internationally recognised body. Reddit threads, blog posts, and personal forums do not count as sources.
- **Set the `asOf` date** to the day you verified the link. This is how readers know how fresh a rule is.
- **Be specific.** "Apostilled birth certificate" is better than "birth certificate paperwork." "≥ 21 days before travel" is better than "a few weeks before travel."
- **Write in plain English.** Short sentences. Active voice. No jargon that a non-native English speaker would have to look up.

## What this playbook is *not*

The boundary on scope matters as much as the content itself. To keep the pipeline usable:

- It does not cover housing market deep-dives, school rankings, or healthcare-system comparisons. That depth belongs in specialised resources, and duplicating it here would make the playbook stale faster than contributors can fix it.
- It does not give legal, tax, or immigration advice. Every item is directional — always confirm with an official source or a licensed local professional before acting.
- It does not yet cover relocation to countries other than Croatia. Expanding is possible once the Croatia content is mature and a contributor network exists.

## License

All content is published under the MIT license. Reuse, adapt, and redistribute freely — attribution is appreciated but not required.

## Contact

Open an issue on GitHub for anything public. For private questions (e.g. you want to contribute but would prefer not to attach your name to a sensitive immigration topic), the repository README lists a contact email.
