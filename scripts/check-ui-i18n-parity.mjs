#!/usr/bin/env node
// Fails the build if i18n/ru.yaml is missing keys that exist in i18n/en.yaml,
// or has keys that don't exist in en.yaml.

import fs from 'node:fs';
import YAML from 'yaml';

const EN = 'i18n/en.yaml';
const RU = 'i18n/ru.yaml';

function loadKeys(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = YAML.parse(raw) || {};
  return new Set(Object.keys(parsed));
}

const enKeys = loadKeys(EN);
const ruKeys = loadKeys(RU);

let errors = 0;

for (const key of enKeys) {
  if (!ruKeys.has(key)) {
    console.log(`FAIL: ru.yaml missing key: ${key}`);
    errors++;
  }
}

for (const key of ruKeys) {
  if (!enKeys.has(key)) {
    console.log(`FAIL: ru.yaml has unexpected key: ${key}`);
    errors++;
  }
}

console.log(`\nui i18n parity: en=${enKeys.size} keys, ru=${ruKeys.size} keys — ${errors} error(s).`);
process.exit(errors > 0 ? 1 : 0);
