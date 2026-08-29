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
// Covers the pages listTranslatedPagePairs() owns plus the data/i18n/*.<lang>.yaml
// surfaces, which are hand-editable often enough to need a stamp path that does
// not require running the LLM sync. Stage files and the sync-managed page
// surfaces are stamped by sync-ru-translations.mjs instead — do not stamp those
// by hand.

import fs from 'node:fs';
import YAML from 'yaml';
import {
  listTranslatedPagePairs, pageSourceHash, splitFrontMatter, saveStage, loadStage,
  I18N_DATA_SURFACES, dataI18nPayload, payloadHash, leadingComments,
} from './i18n-lib.mjs';

const LANGS = ['ru'];

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

// ── data/i18n/<thing>.<lang>.yaml ────────────────────────────────────────────
const loadDataYaml = (file) => {
  const parsed = YAML.parse(fs.readFileSync(file, 'utf8'));
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
};

for (const { en, localized } of I18N_DATA_SURFACES) {
  if (!fs.existsSync(en)) continue;
  const expected = payloadHash(dataI18nPayload(loadDataYaml(en)));

  for (const lang of LANGS) {
    const ruPath = localized(lang);
    if (!fs.existsSync(ruPath)) continue;

    const doc = loadDataYaml(ruPath);
    const current = doc.translationMeta?.sourceHash;
    if (current === expected) { ok++; continue; }

    if (CHECK_ONLY) {
      console.log(`would stamp: ${ruPath}`);
      changed++;
      continue;
    }

    const { translationMeta: _drop, ...strings } = doc;
    const out = {
      translationMeta: {
        ...(doc.translationMeta || {}),
        sourceLang: 'en',
        targetLang: lang,
        sourceFile: en,
        sourceHash: expected,
        status: current ? 'hand-updated' : 'hand-maintained',
      },
      ...strings,
    };
    const header = leadingComments(ruPath) || leadingComments(en);
    fs.writeFileSync(ruPath, (header ? header + '\n' : '') + YAML.stringify(out).trimEnd() + '\n', 'utf8');
    console.log(`stamped: ${ruPath}`);
    changed++;
  }
}

console.log(`\ni18n stamp: ${ok} already current, ${changed} ${CHECK_ONLY ? 'would change' : 'stamped'}.`);
process.exit(CHECK_ONLY && changed > 0 ? 1 : 0);
