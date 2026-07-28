/**
 * Authored stage content actually reaches the page.
 *
 * The bug this guards against, three times over: the trust-UI refactor
 * (3133dad, 2026-04-23) removed the render blocks for `gotchas`, `artifacts`,
 * and `requires`/`documents` from layouts/stages/single.html. All of it stayed
 * authored, translated, and enforced by check-i18n-parity.mjs — which verifies
 * that two languages agree about a field, not that the field reaches a reader.
 * 78 documents/prerequisites entries and 14 pitfalls were invisible for three
 * months while every check reported green.
 *
 * So: read the front matter, and assert the first entry of each list shows up
 * in the rendered HTML. Content-agnostic — it follows whatever the stage files
 * say, so it keeps working as the copy changes.
 */
import { test, expect } from '@playwright/test';
import { site } from './helpers';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const STAGES_DIR = 'content/stages';

type StageFixture = {
  slug: string;
  requires?: string[];
  documents?: string[];
  gotchas?: string[];
};

function readStages(): StageFixture[] {
  return fs
    .readdirSync(STAGES_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_') && !/\.[a-z]{2}\.md$/.test(f))
    .map((file) => {
      const raw = fs.readFileSync(path.join(STAGES_DIR, file), 'utf8');
      const m = raw.match(/^---\n([\s\S]*?)\n---/);
      const fm = m ? (YAML.parse(m[1]) ?? {}) : {};
      return {
        slug: file.replace(/\.md$/, ''),
        requires: fm.requires,
        documents: fm.documents,
        gotchas: fm.gotchas,
      };
    });
}

/** Collapse whitespace so hard-wrapped YAML matches rendered HTML. */
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

/**
 * Compare on a distinctive slice rather than the full string: entries contain
 * markup-adjacent characters, and a leading fragment is enough to prove the
 * block rendered at all — which is the failure mode being guarded.
 */
const probe = (entry: string) => norm(entry).slice(0, 60);

for (const stage of readStages()) {
  const fields: [keyof StageFixture, string[] | undefined][] = [
    ['requires', stage.requires],
    ['documents', stage.documents],
    ['gotchas', stage.gotchas],
  ];

  for (const [field, list] of fields) {
    if (!list?.length) continue;

    test(`${stage.slug}: ${field} is rendered, not just authored`, async ({ page }) => {
      await page.goto(site(`/stage/${stage.slug}/`));
      const body = norm(await page.locator('body').innerText());

      expect(
        body,
        `"${field}" is present in content/stages/${stage.slug}.md but missing from the rendered page `
        + `— the template block that renders it was probably dropped. Looked for: "${probe(list[0])}"`
      ).toContain(probe(list[0]));
    });
  }
}
