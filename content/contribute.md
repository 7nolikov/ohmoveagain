---
title: "Contribute"
tagline: "Community-maintained · open source · MIT licensed"
subtitle: "The Pipeline is only useful if it stays accurate. Help keep it that way."
description: "How to contribute to ohmoveagain — the community-maintained Croatia relocation Pipeline. Fix broken sources, add a checklist item, share your experience, or translate content."
---

## Why contribute

Relocation rules change constantly. Every stage in the Pipeline cites an official source and a verified-on date. The longer those dates slip, the less useful the Pipeline becomes. Contributors are what keep it honest.

Every improvement ships as a public commit under the contributor's name.

## Who this is for

You are a good fit to contribute if any of these apply:

- You have moved to Croatia and remember what tripped you up.
- You are in the middle of a move and are catching things the Pipeline missed.
- You work adjacent to relocation — immigration lawyer, accountant, relocation consultant, HR specialist — and can flag stale rules or add precision to a checklist item.
- You have moved to or from another country and want to help this project eventually cover more destinations.
- You are simply a careful reader and spotted a broken link, a typo, or a claim that no longer holds.

You do not need to be technical. Typo-level and copy-level improvements are just as valuable as new checklist items.

## What you can contribute

**Verify and refresh a source.** Every checklist item links to an official government or EU page with an `asOf` date. If a source has moved, been re-numbered, or the underlying rule has changed, update the link and bump the date.

**Add a missing checklist item.** If a real step bit you during your own move and the Pipeline does not cover it, add it to the right stage with a source link.

**Flag a gotcha.** Each stage has a `gotchas` block. These are non-obvious traps that do not fit neatly into a checklist. Add yours.

**Share field experience.** Timings ("OIB took 3 hours in Zagreb, 3 days in Split"), costs, municipality-specific quirks — these live in item notes and gotchas.

**Add a persona dimension.** The Pipeline already filters by visa, family, and pets. If you notice a checklist item behaves differently for a persona you belong to, add an `appliesTo` block or propose a new persona dimension.

**Improve the writing.** Clearer copy, better formatting, fixing awkward English.

**Translate.** Thanks to the Pipeline's data/strings split (see below), translating is mechanical: copy `content/stages/<slug>.md` to `content/stages/<slug>.<lang>.md` and rewrite only the string values. All URLs, dates, and filters stay canonical in `data/stages/*.yaml` — so a translation cannot drift from the source of truth.

## How to contribute

**You do not need to be a developer.** Four routes, easiest first. The first three happen entirely in your browser — nothing to install.

All you need is a free GitHub account. If you do not have one, sign up at [github.com/signup](https://github.com/signup); it takes about a minute.

### Option 1 — just tell us (2 minutes)

The lowest-effort route, and still genuinely useful. You do not have to fix anything.

1. Go to the [issue chooser](https://github.com/7nolikov/ohmoveagain/issues/new/choose).
2. Pick a template: **Source correction** (a fact, link, or date is wrong), **Bug report** (something on the site is broken), or **Add a country**.
3. Fill in the boxes and submit.

The source-correction form asks for the official page and the date you checked it. That is not bureaucracy — it is the entire basis of this site. A correction without a source cannot be published, because then it is just another blog post.

Not sure it is really wrong? Report it anyway. A wrong report costs a minute to close; an unreported error can push someone into a rejected application.

### Option 2 — fix wording in your browser (5 minutes)

For typos, clumsy sentences, or a broken link in the page text.

1. Open the page with the problem and scroll to the **bottom**.
2. Click **✎ Edit this page on GitHub**. This opens the exact file behind that page, already in edit mode — you never have to go looking for it.
3. Change only the words you came to fix. A few marks you will see: `##` starts a heading, `**bold**`, and `[text](https://example.com)` is a link where the visible words sit in square brackets and the address in round ones. The block at the very top between two `---` lines is settings — you can edit the words in quotes, but leave the words before each `:` alone.
4. Scroll to **Commit changes**. Write a short summary such as `Fix typo in pre-flight stage`.
5. Choose **Create a new branch for this commit and start a pull request**, then click **Propose changes**.
6. Click **Create pull request** on the next screen.

If you do not have write access — almost nobody does — GitHub will say it is creating a *fork* for you. A fork is simply your own copy. Let it happen; you do not need to understand it.

Leave anything that looks like `asOf: "2026-02-15"` alone here. Dates have their own rules, below.

### Option 3 — update a source link or date (10 minutes)

The highest-value contribution, and the one most needed.

1. **Read the official page first.** This step *is* the contribution; the rest is typing. Is the link still alive? Does the page still say what we claim? Did a number, deadline, or document requirement change? A redirect that dumps you on a ministry homepage counts as broken — we have had a government PDF quietly start doing exactly that while still reporting "OK".
2. Under the checklist item, **click the verification date**. It deep-links to the precise line in the data file where that date was set.
3. Click the **pencil icon** near the top right to edit.
4. Update the values:

| Field | What it means |
|---|---|
| `id` | Internal nickname. **Do not change it** — other parts of the site refer to it. |
| `url` | The official page. Update if the link moved. |
| `type` | `official` (a government body), `supranational` (EU, UN, IATA), or `community`. This sets how often the source must be re-checked. |
| `lastChecked` / `asOf` | The date **you** opened it and confirmed it. Always `YYYY-MM-DD`. |

Keep the quotation marks and the indentation exactly as they are — indentation is meaningful.

5. Propose the change exactly as in option 2, and paste the source link in the description.

**The one rule that really matters: only change the date if you actually opened the page that day.** That date tells a reader a human confirmed this recently. Bumping it without looking makes the site confidently wrong, which is worse than visibly out of date. If you did not check it, leave the old date — that is what it is for.

### Option 4 — run it locally (for developers)

```
gh repo fork 7nolikov/ohmoveagain --clone
cd ohmoveagain
npm install
hugo server
```

Facts live in `data/stages/*.yaml` (URLs, `asOf` dates, persona filters). Words live in `content/stages/*.md` front matter under `itemStrings.<item-id>`. Templates merge the two by item ID at build time, so a URL belongs in the YAML, never in the prose.

Before opening a pull request, run `node scripts/check-staleness.mjs`, the three `check-i18n-*` scripts, and `npm run test:unit`. CI additionally runs accessibility, Lighthouse on desktop and mobile, and the full browser matrix. Details are in `CONTRIBUTING.md` in the repository.

### What happens next

Every pull request is reviewed publicly. Automated checks run first and catch broken builds, dead links, and failing tests before a human looks. Expect a response within a few days.

**You cannot break anything.** You have no write access to the live site, every change is reviewed, and a one-line fix is a perfectly good pull request. If a review comment does not make sense, saying "I do not follow — what should I change?" is a completely fine reply.

## Quality bar

To keep the Pipeline trustworthy, contributions should meet a few ground rules:

- **Cite an official source** — government, EU, or internationally recognised body. Reddit threads, blog posts, and personal forums do not count as sources.
- **Set the `asOf` date** to the day you verified the link. This is how readers know how fresh a rule is.
- **Be specific.** "Apostilled birth certificate" is better than "birth certificate paperwork." "≥ 21 days before travel" is better than "a few weeks before travel."
- **Write in plain English.** Short sentences. Active voice. No jargon that a non-native English speaker would have to look up.

## What the Pipeline is *not*

The boundary on scope matters as much as the content itself. To keep the Pipeline usable:

- It does not cover housing market deep-dives, school rankings, or healthcare-system comparisons. That depth belongs in specialised resources, and duplicating it here would make the Pipeline stale faster than contributors can fix it.
- It does not give legal, tax, or immigration advice. Every item is directional — always confirm with an official source or a licensed local professional before acting.
- It does not yet cover relocation to countries other than Croatia. Expanding is possible once the Croatia content is mature and a contributor network exists.

## License

All content is published under the MIT license. Reuse, adapt, and redistribute freely — attribution is appreciated but not required.

## Contact

Open an issue on GitHub for anything public. For private questions (e.g. you want to contribute but would prefer not to attach your name to a sensitive immigration topic), the repository README lists a contact email.
