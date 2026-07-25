#!/usr/bin/env node
// Fails if a translation no longer matches the English source it was made from.
//
// Three kinds of translated file, three hash bases:
//
//   1. content/stages/*.md          — structured; hash the translatable payload
//   2. sync-managed page surfaces   — same, using the page-content payload
//      (content/forms/_index.md, content/offices.md)
//   3. every other translated page  — free prose; hash the whole English file
//
// Only (1) was checked before, which left 13 translated pages able to drift
// silently — including /contribute/ and the home page.
//
// Re-stamp after translating: `npm run i18n:stamp`.

import fs from 'node:fs';
import path from 'node:path';
import {
  STAGES_DIR, listEnglishStageFiles, localizedPath, loadStage, sourceHash,
  listTranslatedPagePairs, pageSourceHash, pageContentPayload, payloadHash,
} from './i18n-lib.mjs';

const LANGS = ['ru'];

// content path -> front-matter key holding that page's translatable strings
const SYNC_SURFACES = [
  { en: 'content/forms/_index.md', stringsKey: 'formStrings' },
  { en: 'content/offices.md', stringsKey: 'officeStrings' },
];

let stale = 0;
let checked = 0;

const report = (kind, file, why) => {
  console.log(`stale (${kind}): ${file}${why ? ` — ${why}` : ''}`);
  stale++;
};

// ── 1. Stage files ───────────────────────────────────────────────────────────
for (const file of listEnglishStageFiles()) {
  const expected = sourceHash(loadStage(path.join(STAGES_DIR, file)));

  for (const lang of LANGS) {
    const ruPath = localizedPath(file, lang);
    if (!fs.existsSync(ruPath)) continue;
    checked++;
    const actual = loadStage(ruPath).frontMatter?.translationMeta?.sourceHash;
    if (actual !== expected) report('stage', ruPath);
  }
}

// ── 2. Sync-managed page surfaces ────────────────────────────────────────────
for (const { en, stringsKey } of SYNC_SURFACES) {
  if (!fs.existsSync(en)) continue;
  const expected = payloadHash(pageContentPayload(loadStage(en), stringsKey));

  for (const lang of LANGS) {
    const ruPath = en.replace(/\.md$/, `.${lang}.md`);
    if (!fs.existsSync(ruPath)) continue;
    checked++;
    const actual = loadStage(ruPath).frontMatter?.translationMeta?.sourceHash;
    if (actual !== expected) report('page-surface', ruPath);
  }
}

// ── 3. Hand-maintained pages ─────────────────────────────────────────────────
for (const { en, translations } of listTranslatedPagePairs()) {
  const expected = pageSourceHash(en);

  for (const [, ruPath] of Object.entries(translations)) {
    checked++;
    const actual = loadStage(ruPath).frontMatter?.translationMeta?.sourceHash;
    if (!actual) {
      report('page', ruPath, 'no translationMeta.sourceHash — run `npm run i18n:stamp`');
    } else if (actual !== expected) {
      report('page', ruPath, 'English source changed since this was translated');
    }
  }
}

console.log(`\ni18n freshness: checked ${checked} translated file(s) — ${stale} stale.`);
process.exit(stale > 0 ? 1 : 0);
