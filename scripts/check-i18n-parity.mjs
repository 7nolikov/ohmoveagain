#!/usr/bin/env node
// Fails the build if a translated stage file drifts from the English source:
// different set of sub-keys under itemStrings/categoryNames/artifactNames,
// or different gotchas list length.
//
// Also enforces parity for translatable reference data:
//   • forms.yaml      ← strings in content/forms/_index.<lang>.md (formStrings)
//   • offices.yaml    ← strings in content/offices.<lang>.md     (officeStrings)
//   • countries.yaml  ← strings in data/i18n/countries.<lang>.yaml
//   • fees.yaml       ← strings in data/i18n/fees.<lang>.yaml
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

// Reference data with translatable strings in content frontmatter (page-scoped).
const PAGE_STRINGS = [
  {
    label: 'forms',
    sourceData: 'data/forms.yaml',
    sourceKey: 'id',
    contentEn: 'content/forms/_index.md',
    contentLangPattern: (lang) => `content/forms/_index.${lang}.md`,
    frontmatterKey: 'formStrings',
    requiredInnerKeys: ['title', 'sourceAuthority', 'note'],
  },
  {
    label: 'offices',
    sourceData: 'data/offices.yaml',
    sourceKey: 'id',
    contentEn: 'content/offices.md',
    contentLangPattern: (lang) => `content/offices.${lang}.md`,
    frontmatterKey: 'officeStrings',
    requiredInnerKeys: ['authority', 'name', 'bookingNote', 'hours', 'note'],
  },
];

// Reference data with translatable strings shared across templates
// (calculator + freshness for countries; calculator for fees).
const I18N_DATA_STRINGS = [
  {
    label: 'countries',
    sourceData: 'data/countries.yaml',
    sourceKey: 'code',
    i18nDataPattern: (lang) => `data/i18n/countries.${lang}.yaml`,
    requiredInnerKeys: ['name', 'note', 'sourceLabel'],
  },
  {
    label: 'fees',
    sourceData: 'data/fees.yaml',
    sourceKey: 'id',
    i18nDataPattern: (lang) => `data/i18n/fees.${lang}.yaml`,
    requiredInnerKeys: ['label', 'note'],
  },
];

let errors = 0;

// ── Translated stage files ────────────────────────────────────────────────────

const translated = fs.readdirSync(STAGES_DIR).filter((f) => LANG_RE.test(f));
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

// ── Helpers for reference-data parity ─────────────────────────────────────────

function readSourceIds(spec) {
  const list = YAML.parse(fs.readFileSync(spec.sourceData, 'utf8')) || [];
  if (!Array.isArray(list)) {
    console.log(`FAIL ${spec.sourceData}: expected a list at root`);
    errors++;
    return null;
  }
  return list.map((e) => e[spec.sourceKey]).filter(Boolean);
}

function detectLangs(globPattern) {
  // globPattern: a function(lang) → path. Probe common languages by scanning
  // the parent directory for files matching the pattern.
  const probePath = globPattern('XX');
  const dir = path.dirname(probePath);
  const fileRe = new RegExp(path.basename(probePath).replace('XX', '([a-z]{2})'));
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .map((f) => (fileRe.exec(f) || [])[1])
    .filter(Boolean);
}

function checkStringMap(spec, lang, stringsByKey, sourceIds) {
  const idSet = new Set(sourceIds);
  const stringsKeys = Object.keys(stringsByKey || {});
  let localErrors = 0;

  for (const id of sourceIds) {
    if (!(id in (stringsByKey || {}))) {
      console.log(`FAIL [${lang}] ${spec.label}: missing entry "${id}"`);
      localErrors++;
    }
  }
  for (const id of stringsKeys) {
    if (!idSet.has(id)) {
      console.log(`FAIL [${lang}] ${spec.label}: unexpected entry "${id}"`);
      localErrors++;
    }
  }
  for (const id of stringsKeys) {
    if (!idSet.has(id)) continue;
    const entry = stringsByKey[id];
    if (!entry || typeof entry !== 'object') {
      console.log(`FAIL [${lang}] ${spec.label} "${id}": expected an object`);
      localErrors++;
      continue;
    }
    for (const k of spec.requiredInnerKeys) {
      if (!(k in entry) || entry[k] === null || entry[k] === '') {
        console.log(`FAIL [${lang}] ${spec.label} "${id}": missing key "${k}"`);
        localErrors++;
      }
    }
    for (const k of Object.keys(entry)) {
      if (!spec.requiredInnerKeys.includes(k)) {
        console.log(`FAIL [${lang}] ${spec.label} "${id}": unexpected key "${k}"`);
        localErrors++;
      }
    }
  }

  return localErrors;
}

// ── Page-scoped string parity (forms, offices) ────────────────────────────────

let pageChecked = 0;
for (const spec of PAGE_STRINGS) {
  if (!fs.existsSync(spec.sourceData)) {
    console.log(`FAIL ${spec.sourceData}: file missing`);
    errors++;
    continue;
  }
  const sourceIds = readSourceIds(spec);
  if (!sourceIds) continue;

  // Always check English content too — strings must exist before any RU build ships.
  const langsToCheck = ['en', ...detectLangs(spec.contentLangPattern)];
  for (const lang of langsToCheck) {
    const file = lang === 'en' ? spec.contentEn : spec.contentLangPattern(lang);
    if (!fs.existsSync(file)) {
      console.log(`FAIL [${lang}] ${spec.label}: content file ${file} missing`);
      errors++;
      continue;
    }
    const doc = loadStage(file);
    const fm = doc.frontMatter || {};
    const strings = fm[spec.frontmatterKey];
    if (!strings || typeof strings !== 'object') {
      console.log(`FAIL [${lang}] ${spec.label}: ${file} missing ${spec.frontmatterKey} frontmatter`);
      errors++;
      continue;
    }
    errors += checkStringMap(spec, lang, strings, sourceIds);
    pageChecked++;
  }
}

// ── Shared i18n data parity (countries, fees) ─────────────────────────────────

let i18nDataChecked = 0;
for (const spec of I18N_DATA_STRINGS) {
  if (!fs.existsSync(spec.sourceData)) {
    console.log(`FAIL ${spec.sourceData}: file missing`);
    errors++;
    continue;
  }
  const sourceIds = readSourceIds(spec);
  if (!sourceIds) continue;

  const langsToCheck = detectLangs(spec.i18nDataPattern);
  if (!langsToCheck.includes('en')) langsToCheck.push('en');
  for (const lang of langsToCheck) {
    const file = spec.i18nDataPattern(lang);
    if (!fs.existsSync(file)) {
      console.log(`FAIL [${lang}] ${spec.label}: ${file} missing`);
      errors++;
      continue;
    }
    const strings = YAML.parse(fs.readFileSync(file, 'utf8'));
    if (!strings || typeof strings !== 'object' || Array.isArray(strings)) {
      console.log(`FAIL [${lang}] ${spec.label}: ${file} expected a map at root`);
      errors++;
      continue;
    }
    errors += checkStringMap(spec, lang, strings, sourceIds);
    i18nDataChecked++;
  }
}

console.log(`\ni18n parity: ${translated.length} stage file(s), ${pageChecked} page-string surface(s), ${i18nDataChecked} i18n-data surface(s) checked — ${errors} error(s).`);
process.exit(errors > 0 ? 1 : 0);
