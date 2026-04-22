#!/usr/bin/env node
// check-i18n-parity.mjs — fail the build if a translated stage file is missing keys
// that exist in the English source.
//
// For each content/stages/<slug>.<lang>.md that exists alongside content/stages/<slug>.md,
// checks that itemStrings, categoryNames, gotchas, and artifactNames keys all match.
//
// Usage:
//   node scripts/check-i18n-parity.mjs
//
// Exit code 1 if any translated file is missing keys present in the English source.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const STAGES_DIR = 'content/stages';

function extractFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  return m ? m[1] : '';
}

function extractKeys(fm, field) {
  const section = fm.match(new RegExp(`^${field}:\\s*\\n((?:[ \\t]+.+\\n?)+)`, 'm'));
  if (!section) return new Set();
  const keys = new Set();
  for (const line of section[1].split('\n')) {
    const m = line.match(/^[ \t]+([a-z][a-z0-9-]*):/);
    if (m) keys.add(m[1]);
  }
  return keys;
}

function extractList(fm, field) {
  const section = fm.match(new RegExp(`^${field}:\\s*\\n((?:[ \\t]+-[^\\n]+\\n?)+)`, 'm'));
  if (!section) return 0;
  return (section[1].match(/^[ \t]+-/gm) || []).length;
}

const files = readdirSync(STAGES_DIR).filter(f => f.endsWith('.md'));
const enFiles = files.filter(f => !f.includes('.') || f.endsWith('.md') && f.split('.').length === 2);
const langFiles = files.filter(f => f.split('.').length === 3);

let errors = 0;

for (const langFile of langFiles) {
  const parts = langFile.split('.');
  const slug = parts[0];
  const lang = parts[1];
  const enFile = `${slug}.md`;

  if (!enFiles.includes(enFile)) {
    console.log(`WARN: ${langFile} has no English source ${enFile}`);
    continue;
  }

  const enSrc = readFileSync(join(STAGES_DIR, enFile), 'utf8');
  const langSrc = readFileSync(join(STAGES_DIR, langFile), 'utf8');
  const enFm = extractFrontmatter(enSrc);
  const langFm = extractFrontmatter(langSrc);

  for (const field of ['itemStrings', 'categoryNames', 'artifactNames']) {
    const enKeys = extractKeys(enFm, field);
    const langKeys = extractKeys(langFm, field);
    for (const key of enKeys) {
      if (!langKeys.has(key)) {
        console.log(`FAIL [${lang}] ${slug}: missing ${field}.${key}`);
        errors++;
      }
    }
  }

  const enGotchas = extractList(enFm, 'gotchas');
  const langGotchas = extractList(langFm, 'gotchas');
  if (enGotchas > 0 && langGotchas !== enGotchas) {
    console.log(`FAIL [${lang}] ${slug}: gotchas count mismatch (en=${enGotchas}, ${lang}=${langGotchas})`);
    errors++;
  }
}

if (langFiles.length === 0) {
  console.log('i18n parity: no translated stage files found — skipping checks.');
  process.exit(0);
}

console.log(`\ni18n parity: checked ${langFiles.length} translated file(s) — ${errors} error(s).`);
if (errors > 0) process.exit(1);
process.exit(0);
