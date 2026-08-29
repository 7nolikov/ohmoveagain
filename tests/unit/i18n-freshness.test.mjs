import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';

import { I18N_DATA_SURFACES, dataI18nPayload, payloadHash, leadingComments } from '../../scripts/i18n-lib.mjs';

// The bug this guards against: check-i18n-freshness.mjs covered stage files and
// page surfaces but not data/i18n/*.<lang>.yaml. countries.ru.yaml and
// fees.ru.yaml already carried a translationMeta.sourceHash that nothing
// verified, and exit.ru.yaml carried none at all — so editing an English note
// in exit.en.yaml left the Russian site serving the superseded text with every
// check reporting green. Translations drifting silently is the same class of
// failure as sources drifting silently, and has to fail loudly.

const loadDataYaml = (file) => YAML.parse(fs.readFileSync(file, 'utf8')) || {};
const runFreshness = () => {
  try {
    return { code: 0, out: execFileSync('node', ['scripts/check-i18n-freshness.mjs'], { encoding: 'utf8' }) };
  } catch (e) {
    return { code: e.status, out: e.stdout || '' };
  }
};

test('every i18n data surface has an English source and is covered by the shared list', () => {
  assert.ok(I18N_DATA_SURFACES.length > 0, 'no data surfaces registered');

  const registered = new Set(I18N_DATA_SURFACES.map((s) => s.en));
  const onDisk = fs.readdirSync('data/i18n')
    .filter((f) => f.endsWith('.en.yaml'))
    .map((f) => `data/i18n/${f}`);

  for (const file of onDisk) {
    assert.ok(registered.has(file), `${file} is not in I18N_DATA_SURFACES — it would drift unchecked`);
  }
  for (const { en } of I18N_DATA_SURFACES) {
    assert.ok(fs.existsSync(en), `${en} is registered but missing`);
  }
});

test('every translated data surface carries a matching translationMeta.sourceHash', () => {
  for (const { en, localized } of I18N_DATA_SURFACES) {
    const expected = payloadHash(dataI18nPayload(loadDataYaml(en)));
    const ruPath = localized('ru');
    if (!fs.existsSync(ruPath)) continue;

    const meta = loadDataYaml(ruPath).translationMeta;
    assert.ok(meta?.sourceHash, `${ruPath} has no translationMeta.sourceHash`);
    assert.equal(meta.sourceHash, expected, `${ruPath} is stale against ${en}`);
  }
});

test('the freshness check fails when an English data surface changes', () => {
  const target = 'data/i18n/exit.en.yaml';
  const original = fs.readFileSync(target, 'utf8');

  assert.equal(runFreshness().code, 0, 'expected a clean tree before the edit');

  try {
    fs.writeFileSync(target, original.replace(/^countries:/m, 'countries:\n  ZZ:\n    name: "Drift"'), 'utf8');
    const { code, out } = runFreshness();
    assert.notEqual(code, 0, 'freshness passed despite the English source changing');
    assert.match(out, /exit\.ru\.yaml/, 'the stale file was not named in the output');
  } finally {
    fs.writeFileSync(target, original, 'utf8');
  }

  assert.equal(runFreshness().code, 0, 'the tree was not restored');
});

test('leadingComments preserves the contributor header, and stamping keeps it', () => {
  const header = leadingComments('data/i18n/exit.ru.yaml');
  assert.match(header, /^# Translatable strings/, 'exit.ru.yaml lost its comment header');

  // --check must be idempotent on a stamped tree.
  const out = execFileSync('node', ['scripts/stamp-i18n-hash.mjs', '--check'], { encoding: 'utf8' });
  assert.match(out, /0 would change/, 'stamp --check is not idempotent');
});
