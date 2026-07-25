# Contributing

**You do not need to be a developer to help.** Most of what this project needs
is people noticing that a rule changed, a link died, or a sentence is confusing.

Relocation rules change constantly. Every checklist item on the site links to an
official source and shows the date someone last checked it. Those dates decay.
Keeping them honest is the whole job.

Pick whichever of these you're comfortable with — they're all genuinely useful:

| I want to… | Go to | Needs |
|---|---|---|
| Just tell you something is wrong | [Option 1](#option-1-tell-us-2-minutes) | A free GitHub account |
| Fix a typo or reword something | [Option 2](#option-2-fix-wording-in-your-browser-5-minutes) | A free GitHub account |
| Update a source link or date | [Option 3](#option-3-update-a-source-link-or-date-10-minutes) | A free GitHub account |
| Run the site on my own machine | [Option 4](#option-4-run-it-locally-developers) | Node and Hugo |

Options 1–3 happen entirely in your web browser. Nothing to install.

This file is the *how*. For *what* is worth contributing and who tends to be
good at it, see **<https://ohmoveagain.com/contribute/>**.

---

## First, make a GitHub account

If you don't have one: go to [github.com/signup](https://github.com/signup). It's
free and takes about a minute. That's the only account you'll ever need here.

---

## Option 1: Tell us (2 minutes)

The lowest-effort option, and still genuinely valuable. You don't have to fix
anything — just report it.

1. Go to **[the issues page](https://github.com/7nolikov/ohmoveagain/issues/new/choose)**.
2. Pick the template that fits:
   - **Source correction** — a fact, link, or date is wrong or out of date.
   - **Bug report** — something on the site is broken (layout, calculator, links).
   - **Add a country** — you want the Pipeline to cover somewhere new.
3. Fill in the boxes. The form tells you what's needed.
4. Click **Submit new issue**.

For a source correction you'll be asked for a link to the official page and the
date you checked it. That's not bureaucracy — it's the whole basis of the site.
A correction without a source can't be published, because then it's just another
blog post.

**Not sure it's really wrong?** Report it anyway. A wrong report costs a minute
to close. An unreported error can mislead someone into a rejected visa
application.

---

## Option 2: Fix wording in your browser (5 minutes)

Best for typos, clumsy sentences, unclear phrasing, or a broken link in the
page text.

### Step 1 — find the page

Open the page on [ohmoveagain.com](https://ohmoveagain.com) that has the problem.

### Step 2 — click the edit link

Scroll to the **bottom** of the page. Click **✎ Edit this page on GitHub**.

This opens the exact file behind that page, already in edit mode. You didn't
need to know where it lives.

### Step 3 — make your change

You'll see the page's text with some formatting marks around it. Ignore anything
you don't recognise and change only the words you came to fix.

A few things you'll see, so they don't alarm you:

- `##` at the start of a line means "heading".
- `**bold**` and `_italic_`.
- `[text](https://example.com)` is a link — the visible words are in the square
  brackets, the address is in the round ones.
- The block at the very top between two `---` lines is settings. You can edit
  the words in quotes there, but leave the words before each `:` alone.

**Leave anything that looks like `asOf: "2026-02-15"` alone in this option** —
dates have their own rules, covered in Option 3.

### Step 4 — describe what you did

Scroll down to **Commit changes**.

- In the first box write a short summary, e.g. `Fix typo in pre-flight stage`.
- The second box is optional. Use it to explain *why*, if it isn't obvious.

### Step 5 — propose it

Choose **Create a new branch for this commit and start a pull request**, then
click **Propose changes**.

If you don't have write access — most people don't, and that's completely normal
— GitHub will say it's creating a *fork* for you. A fork is just your own copy.
Let it. You don't need to understand it.

### Step 6 — open the pull request

On the next screen, click **Create pull request**. Add anything worth explaining,
then confirm.

**That's it.** Automated checks run for a few minutes and a maintainer reviews it.
If something needs adjusting, we'll say so in a comment — nobody expects you to
get it right first time.

---

## Option 3: Update a source link or date (10 minutes)

This is the highest-value contribution, and the one the project most needs.

Every checklist item shows a source and a date like *"verified 2026-02-15"*. If
you've just been on that government page and it says something different, you're
better informed than the site is.

### Step 1 — check the real source first

Open the official page the item links to and read it. This step is the
contribution — everything after it is typing.

Ask yourself:

- Is the link still alive, or does it redirect somewhere unrelated?
- Does the page still say what the site claims?
- Did a number, deadline, or document requirement change?

> **A redirect that lands on a homepage counts as broken.** We've had a
> government PDF quietly start redirecting to a ministry front page. The link
> returned "OK" while the actual document was gone.

### Step 2 — jump to the exact line

Under the checklist item, click the **verification date**. It deep-links to the
precise line in the data file where that date is set — you don't have to hunt
for it.

### Step 3 — switch to edit mode

You'll land on a "blame" view showing who changed what. Click the **pencil icon**
(✏️) near the top right to start editing.

### Step 4 — change the values

You'll see something like:

```yaml
  - id: mup-main
    url: "https://mup.gov.hr/stay-in-the-republic-of-croatia/281621"
    type: official
    lastChecked: "2026-02-15"
```

In plain English:

| Field | What it means |
|---|---|
| `id` | Internal nickname for this source. **Don't change it** — other parts of the site refer to it. |
| `url` | The official page. Update this if the link moved. |
| `type` | Who publishes it: `official` (a government body), `supranational` (EU, UN, IATA), or `community`. This sets how often it must be re-checked. |
| `lastChecked` / `asOf` | The date **you** opened it and confirmed it. Always `YYYY-MM-DD`. |

Keep the quotation marks and the indentation exactly as they are. Indentation is
meaningful here — if a line starts with four spaces, keep four spaces.

> ### The one rule that really matters
>
> **Only change the date if you actually opened the page that day.**
>
> That date tells a reader "a human confirmed this recently". Bumping it without
> looking makes the site confidently wrong, which is worse than being visibly
> out of date. If you didn't check it, leave the old date — that's what it's for.

### Step 5 — propose it

Same as Option 2, steps 4–6. In the description, paste the source link and say
what changed, for example:

> Blue Card salary threshold page moved to a new URL. Checked 2026-07-25, the
> old link 404s. New link confirms the same requirement.

---

## Option 4: Run it locally (developers)

```bash
gh repo fork 7nolikov/ohmoveagain --clone
cd ohmoveagain
npm install
hugo server          # http://localhost:1313/
```

### Where things live

The project separates **facts** from **words**, and translation depends on that
split holding.

| What | Where |
|---|---|
| Facts — URLs, `asOf` dates, persona filters | `data/stages/*.yaml` |
| Words — labels, notes, source labels | `content/stages/*.md`, under `itemStrings.<item-id>` |
| Calculator baselines | `data/countries.yaml` |
| Fees, forms, offices | `data/fees.yaml`, `data/forms.yaml`, `data/offices.yaml` |
| Interface strings | `i18n/en.yaml`, `i18n/ru.yaml` |

Templates merge facts and words by item ID at build time. Put a URL in the YAML,
never in the prose.

### Before opening a pull request

```bash
node scripts/check-staleness.mjs        # source freshness
node scripts/check-i18n-parity.mjs      # EN/RU structural parity
node scripts/check-ui-i18n-parity.mjs   # interface string parity
node scripts/check-i18n-freshness.mjs   # translations match their source hash
npm run test:unit                       # unit tests
npm run qa:e2e                          # Playwright (needs a running server)
```

CI runs all of these plus axe, Lighthouse (desktop **and** mobile) and the full
Playwright matrix. The `quality` check must pass to merge.

### Rules worth knowing before you spend time

Reasoning for each is in [`DECISIONS.md`](DECISIONS.md).

- **Every claim needs a URL and a date.** No primary source, no ship.
- **Don't hand-edit the structure of `*.ru.md`.** Russian content is generated
  by the i18n pipeline — change the English source and the sync opens a PR.
  Prose fixes to existing Russian wording are welcome.
- **Pin every GitHub Action to a 40-character SHA** (§16). The repository now
  enforces this, so an unpinned `uses:` is rejected outright.
- **Keep internal links relative.** Use `relURL`/`absURL` in templates and
  root-relative paths in content.

Translations: see [`CONTRIBUTING-i18n.md`](CONTRIBUTING-i18n.md).

---

## Common worries

**"What if I break something?"**
You can't. You have no write access to the live site, every change is reviewed,
and automated checks catch broken builds, dead links and failing tests before a
human even looks. The worst case is that we ask you to change something.

**"My change is too small to bother."**
A single corrected link is a perfectly good pull request. Small ones are the
easiest to review and land fastest.

**"I don't understand the review comments."**
Say so. Plain "I don't follow — what should I change?" is a fine reply.

**"I found the problem but can't figure out the fix."**
Use [Option 1](#option-1-tell-us-2-minutes). Reporting it accurately is a real
contribution.

**"Do I need to know git?"**
Not for Options 1–3. The browser handles it.

---

## Reporting a security problem

Please **don't** open a public issue. See [`SECURITY.md`](SECURITY.md).

## Licence

Contributions are MIT licensed, matching [`LICENSE`](LICENSE). Every improvement
ships as a public commit under your name.
