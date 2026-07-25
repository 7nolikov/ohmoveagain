#!/usr/bin/env node
// Stamp translationMeta.sourceHash on hand-maintained translated pages.
//
// Run this after updating a translation, to record which English source it
// corresponds to. check-i18n-freshness.mjs then fails if the English changes
// again without the translation being revisited.
//
//   node scripts/stamp-i18n-hash.mjs            # stamp everything that drifted
//   node scripts/stamp-i18n-hash.mjs --check    # report only, exit 1 if drifted
//
// Only touches the pages listTranslatedPagePairs() owns. Stage files and the
// sync-managed surfaces are stamped by sync-ru-translations.mjs instead — do
// not stamp those by hand.

import fs from 'node:fs';
import YAML from 'yaml';
import {
  listTranslatedPagePairs, pageSourceHash, splitFrontMatter, saveStage, loadStage,
} from './i18n-lib.mjs';

const CHECK_ONLY = process.argv.includes('--check');

let changed = 0;
let ok = 0;

for (const { en, translations } of listTranslatedPagePairs()) {
  const expected = pageSourceHash(en);

  for (const [lang, ruPath] of Object.entries(translations)) {
    const doc = loadStage(ruPath);
    const current = doc.frontMatter?.translationMeta?.sourceHash;

    if (current === expected) { ok++; continue; }

    if (CHECK_ONLY) {
      console.log(`would stamp: ${ruPath}`);
      changed++;
      continue;
    }

    const frontMatter = {
      ...doc.frontMatter,
      translationMeta: {
        ...(doc.frontMatter?.translationMeta || {}),
        sourceLang: 'en',
        targetLang: lang,
        sourceFile: en,
        sourceHash: expected,
        status: current ? 'hand-updated' : 'hand-maintained',
      },
    };

    saveStage(ruPath, frontMatter, doc.body);
    console.log(`stamped: ${ruPath}`);
    changed++;
  }
}

console.log(`\ni18n stamp: ${ok} already current, ${changed} ${CHECK_ONLY ? 'would change' : 'stamped'}.`);
process.exit(CHECK_ONLY && changed > 0 ? 1 : 0);
