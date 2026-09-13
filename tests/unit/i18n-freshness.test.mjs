import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';

import { I18N_DATA_SURFACES, dataI18nPayload, payloadHash, leadingComments, SYNC_PAGE_SURFACES } from '../../scripts/i18n-lib.mjs';

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

// ── Sync-managed page surfaces ───────────────────────────────────────────────
// These two pages are translated by the LLM sync, which is why the stamper used
// to refuse them. When GitHub Models went into its retirement brownout that
// refusal became a wall: an English string on /offices/ could not be changed at
// all without the freshness gate failing and no way to clear it. The escape
// hatch has to stay opt-in, or the gate stops meaning anything.

const runStamp = (...args) => {
  try {
    return { code: 0, out: execFileSync('node', ['scripts/stamp-i18n-hash.mjs', ...args], { encoding: 'utf8' }) };
  } catch (e) {
    return { code: e.status, out: e.stdout || '' };
  }
};

test('every sync-managed page surface exists in both languages', () => {
  assert.ok(SYNC_PAGE_SURFACES.length > 0, 'no page surfaces registered');
  for (const { en, localized, stringsKey } of SYNC_PAGE_SURFACES) {
    assert.ok(fs.existsSync(en), `${en} is registered but missing`);
    assert.ok(fs.existsSync(localized('ru')), `${localized('ru')} is missing`);
    assert.ok(stringsKey, `${en} has no stringsKey`);
  }
});

test('a hand-edited sync-managed page is stampable only with --include-sync-managed', () => {
  const target = 'content/offices.md';
  const original = fs.readFileSync(target, 'utf8');

  assert.equal(runFreshness().code, 0, 'expected a clean tree before the edit');
  assert.match(original, /hours: "/, 'offices.md no longer has the string this test edits');

  try {
    fs.writeFileSync(target, original.replace(/hours: "/, 'hours: "drift '), 'utf8');

    const { code, out } = runFreshness();
    assert.notEqual(code, 0, 'freshness passed despite the English page changing');
    assert.match(out, /offices\.ru\.md/, 'the stale page was not named in the output');

    const plain = runStamp('--check');
    assert.match(plain.out, /0 would change/, 'the default stamp touched a sync-managed page');

    const optIn = runStamp('--check', '--include-sync-managed');
    assert.notEqual(optIn.code, 0, '--include-sync-managed did not report the drift');
    assert.match(optIn.out, /would stamp: content\/offices\.ru\.md/, 'the drifted page was not offered');
  } finally {
    fs.writeFileSync(target, original, 'utf8');
  }

  assert.equal(runFreshness().code, 0, 'the tree was not restored');
});
