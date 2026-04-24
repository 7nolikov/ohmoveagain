#!/usr/bin/env node
// Fails the build if a translated stage file drifts from the English source:
// different set of sub-keys under itemStrings/categoryNames/artifactNames,
// or different gotchas list length.
//
// Uses the real YAML parser via i18n-lib to avoid false positives on
// line-wrapped list items produced by yaml.stringify.

import fs from 'node:fs';
import path from 'node:path';
import { STAGES_DIR, listEnglishStageFiles, loadStage } from './i18n-lib.mjs';

const OBJECT_FIELDS = ['itemStrings', 'categoryNames', 'artifactNames'];
const LIST_FIELDS = ['gotchas', 'requires', 'documents'];
const LANG_RE = /^(.+)\.([a-z]{2})\.md$/i;

function listTranslatedFiles() {
  return fs.readdirSync(STAGES_DIR).filter((f) => LANG_RE.test(f));
}

let errors = 0;
const translated = listTranslatedFiles();

if (translated.length === 0) {
  console.log('i18n parity: no translated stage files found — skipping.');
  process.exit(0);
}

const englishSet = new Set(listEnglishStageFiles());

for (const langFile of translated) {
  const [, slug, lang] = langFile.match(LANG_RE);
  const enFile = `${slug}.md`;

  if (!englishSet.has(enFile)) {
    console.log(`WARN: ${langFile} has no English source ${enFile}`);
    continue;
  }

  const enDoc = loadStage(path.join(STAGES_DIR, enFile));
  const langDoc = loadStage(path.join(STAGES_DIR, langFile));
  const enFm = enDoc.frontMatter || {};
  const langFm = langDoc.frontMatter || {};

  for (const field of OBJECT_FIELDS) {
    const enObj = enFm[field] || {};
    const langObj = langFm[field] || {};
    if (typeof enObj !== 'object' || Array.isArray(enObj)) continue;
    const enKeys = Object.keys(enObj);
    if (enKeys.length === 0) continue;
    for (const key of enKeys) {
      if (!(key in langObj)) {
        console.log(`FAIL [${lang}] ${slug}: missing ${field}.${key}`);
        errors++;
      }
    }
    for (const key of Object.keys(langObj)) {
      if (!(key in enObj)) {
        console.log(`FAIL [${lang}] ${slug}: unexpected ${field}.${key}`);
        errors++;
      }
    }
  }

  for (const field of LIST_FIELDS) {
    const enList = Array.isArray(enFm[field]) ? enFm[field] : [];
    const langList = Array.isArray(langFm[field]) ? langFm[field] : [];
    if (enList.length > 0 && langList.length !== enList.length) {
      console.log(`FAIL [${lang}] ${slug}: ${field} count mismatch (en=${enList.length}, ${lang}=${langList.length})`);
      errors++;
    }
  }
}

console.log(`\ni18n parity: checked ${translated.length} translated file(s) — ${errors} error(s).`);
process.exit(errors > 0 ? 1 : 0);
