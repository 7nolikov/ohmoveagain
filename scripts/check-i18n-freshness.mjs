#!/usr/bin/env node
// Fails if any translated stage file's stored sourceHash no longer matches
// the English source (translation is stale).

import fs from 'node:fs';
import path from 'node:path';
import { STAGES_DIR, listEnglishStageFiles, localizedPath, loadStage, sourceHash } from './i18n-lib.mjs';

const LANGS = ['ru'];
let stale = 0;
let checked = 0;

for (const file of listEnglishStageFiles()) {
  const enDoc = loadStage(path.join(STAGES_DIR, file));
  const expected = sourceHash(enDoc);

  for (const lang of LANGS) {
    const ruPath = localizedPath(file, lang);
    if (!fs.existsSync(ruPath)) continue;
    checked++;

    const doc = loadStage(ruPath);
    const actual = doc.frontMatter?.translationMeta?.sourceHash;

    if (actual !== expected) {
      console.log(`stale: ${ruPath}`);
      stale++;
    }
  }
}

console.log(`\ni18n freshness: checked ${checked} translated file(s) — ${stale} stale.`);
process.exit(stale > 0 ? 1 : 0);
