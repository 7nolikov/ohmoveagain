#!/usr/bin/env node
// Fails the build if a translated stage file drifts from the English source:
// different set of sub-keys under itemStrings/categoryNames/artifactNames,
// or different gotchas list length.
//
// Uses the real YAML parser via i18n-lib to avoid false positives on
// line-wrapped list items produced by yaml.stringify.

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { STAGES_DIR, listEnglishStageFiles, loadStage } from './i18n-lib.mjs';

const OBJECT_FIELDS = ['itemStrings', 'categoryNames', 'claimStrings', 'artifactNames'];
const LIST_FIELDS = ['gotchas', 'requires', 'documents'];
const LANG_RE = /^(.+)\.([a-z]{2})\.md$/i;

// Translatable-data parity: each entry in `data/<dir>/en.yaml` must appear in
// every sibling `<lang>.yaml` with the same `id` and the same set of keys, so
// the layout cannot silently render English fields on a non-English page.
const DATA_DIRS = ['data/forms', 'data/offices'];

function listTranslatedFiles() {
  return fs.readdirSync(STAGES_DIR).filter((f) => LANG_RE.test(f));
}

let errors = 0;
const translated = listTranslatedFiles();
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

// ── Translatable-data parity (forms, offices) ────────────────────────────────

let dataChecked = 0;
for (const dir of DATA_DIRS) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.yaml'));
  const enFile = path.join(dir, 'en.yaml');
  if (!fs.existsSync(enFile)) {
    console.log(`FAIL ${dir}: missing en.yaml (canonical source)`);
    errors++;
    continue;
  }
  const enList = YAML.parse(fs.readFileSync(enFile, 'utf8')) || [];
  if (!Array.isArray(enList)) {
    console.log(`FAIL ${enFile}: expected a list at root`);
    errors++;
    continue;
  }
  const enById = new Map(enList.map((e) => [e.id, e]));

  for (const f of files) {
    if (f === 'en.yaml') continue;
    const lang = path.basename(f, '.yaml');
    const langFile = path.join(dir, f);
    const langList = YAML.parse(fs.readFileSync(langFile, 'utf8')) || [];
    if (!Array.isArray(langList)) {
      console.log(`FAIL ${langFile}: expected a list at root`);
      errors++;
      continue;
    }
    const langById = new Map(langList.map((e) => [e.id, e]));

    for (const id of enById.keys()) {
      if (!langById.has(id)) {
        console.log(`FAIL [${lang}] ${dir}: missing entry id=${id}`);
        errors++;
      }
    }
    for (const id of langById.keys()) {
      if (!enById.has(id)) {
        console.log(`FAIL [${lang}] ${dir}: unexpected entry id=${id}`);
        errors++;
      }
    }
    for (const [id, en] of enById) {
      const lc = langById.get(id);
      if (!lc) continue;
      const enKeys = Object.keys(en).sort();
      const lcKeys = Object.keys(lc).sort();
      for (const k of enKeys) {
        if (!(k in lc)) {
          console.log(`FAIL [${lang}] ${dir} id=${id}: missing key "${k}"`);
          errors++;
        }
      }
      for (const k of lcKeys) {
        if (!(k in en)) {
          console.log(`FAIL [${lang}] ${dir} id=${id}: unexpected key "${k}"`);
          errors++;
        }
      }
    }
    dataChecked++;
  }
}

console.log(`\ni18n parity: checked ${translated.length} translated stage file(s) and ${dataChecked} translated data file(s) — ${errors} error(s).`);
process.exit(errors > 0 ? 1 : 0);
