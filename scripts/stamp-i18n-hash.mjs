#!/usr/bin/env node
// Stamp translationMeta.sourceHash on hand-maintained translated pages.
//
// Run this after updating a translation, to record which English source it
// corresponds to. check-i18n-freshness.mjs then fails if the English changes
// again without the translation being revisited.
//
//   node scripts/stamp-i18n-hash.mjs            # stamp everything that drifted
//   node scripts/stamp-i18n-hash.mjs --check    # report only, exit 1 if drifted
//   node scripts/stamp-i18n-hash.mjs --include-sync-managed
//
// Covers the pages listTranslatedPagePairs() owns plus the data/i18n/*.<lang>.yaml
// surfaces, which are hand-editable often enough to need a stamp path that does
// not require running the LLM sync.
//
// Stage files and the sync-managed page surfaces (content/offices.md,
// content/forms/_index.md) are normally stamped by sync-ru-translations.mjs, so
// they are left alone by default: stamping a translation you did not actually
// revisit is how the freshness gate goes green over stale Russian.
//
// --include-sync-managed is the escape hatch for when you did revisit it by
// hand. It exists because the LLM sync is not always available — GitHub Models
// entered its retirement brownout and started answering 410 on every request,
// which left no way at all to edit an English string on those two pages and get
// a green build. Translate first, then stamp; the flag records nothing about
// whether you did.

import fs from 'node:fs';
import YAML from 'yaml';
import {
  listTranslatedPagePairs, pageSourceHash, splitFrontMatter, saveStage, loadStage,
  I18N_DATA_SURFACES, dataI18nPayload, payloadHash, leadingComments,
  STAGES_DIR, listEnglishStageFiles, localizedPath, sourceHash, pageContentPayload,
  SYNC_PAGE_SURFACES,
} from './i18n-lib.mjs';
import path from 'node:path';

const LANGS = ['ru'];

const CHECK_ONLY = process.argv.includes('--check');
const INCLUDE_SYNC_MANAGED = process.argv.includes('--include-sync-managed');

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

// ── Sync-managed surfaces, opt-in ────────────────────────────────────────────
// Everything above is hand-maintained by definition. These two groups are not,
// so they only move when you say so.
if (INCLUDE_SYNC_MANAGED) {
  const stampDoc = (ruPath, expected, extra = {}) => {
    const doc = loadStage(ruPath);
    const current = doc.frontMatter?.translationMeta?.sourceHash;
    if (current === expected) { ok++; return; }

    if (CHECK_ONLY) {
      console.log(`would stamp: ${ruPath}`);
      changed++;
      return;
    }

    // sourceCommit is dropped rather than carried over: the sync sets it to the
    // commit it translated from, and keeping that value next to a hash computed
    // from different English claims a provenance the file no longer has.
    const { sourceCommit: _stale, ...meta } = doc.frontMatter?.translationMeta || {};

    saveStage(ruPath, {
      ...doc.frontMatter,
      translationMeta: {
        ...meta,
        sourceLang: 'en',
        targetLang: 'ru',
        sourceHash: expected,
        status: current ? 'hand-updated' : 'hand-maintained',
        ...extra,
      },
    }, doc.body);
    console.log(`stamped (sync-managed): ${ruPath}`);
    changed++;
  };

  for (const file of listEnglishStageFiles()) {
    const enPath = path.join(STAGES_DIR, file);
    const expected = sourceHash(loadStage(enPath));
    for (const lang of LANGS) {
      const ruPath = localizedPath(file, lang);
      if (!fs.existsSync(ruPath)) continue;
      stampDoc(ruPath, expected, { sourceFile: enPath });
    }
  }

  for (const { en, stringsKey, localized } of SYNC_PAGE_SURFACES) {
    if (!fs.existsSync(en)) continue;
    const expected = payloadHash(pageContentPayload(loadStage(en), stringsKey));
    for (const lang of LANGS) {
      const ruPath = localized(lang);
      if (!fs.existsSync(ruPath)) continue;
      stampDoc(ruPath, expected, { sourceFile: en });
    }
  }
}

console.log(`\ni18n stamp: ${ok} already current, ${changed} ${CHECK_ONLY ? 'would change' : 'stamped'}.`);
if (!INCLUDE_SYNC_MANAGED && changed === 0 && ok > 0) {
  console.log('Stage files and sync-managed pages were skipped — pass --include-sync-managed if you translated one by hand.');
}
process.exit(CHECK_ONLY && changed > 0 ? 1 : 0);
