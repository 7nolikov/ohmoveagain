import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { enforceGlossaryInString, enforceGlossaryDeep } from '../../scripts/i18n-lib.mjs';

const glossary = JSON.parse(fs.readFileSync('data/i18n/glossary.ru.json', 'utf8'));

// The bug this guards against: glossary entries whose target contains the
// source ("MUP" -> "MUP (МВД Хорватии)") were re-expanded on every sync, so
// the parentheticals stacked. It reached an auto-sync PR as
// "MUP (МВД Хорватии) (Министерство внутренних дел)" and would have grown by
// one gloss per run.
test('glossary is idempotent over repeated application', () => {
  const samples = [
    'MUP (Министерство внутренних дел)',
    'Porezna uprava (Налоговая администрация)',
    'EU Pet Passport (паспорт животного ЕС)',
    'Форма подаётся в MUP лично',
    'Подать в Porezna uprava и MUP',
    'knjigovođa ведёт учёт',
  ];

  for (const sample of samples) {
    const once = enforceGlossaryInString(sample, glossary);
    const twice = enforceGlossaryInString(once, glossary);
    const thrice = enforceGlossaryInString(twice, glossary);
    assert.equal(twice, once, `not idempotent: ${sample}`);
    assert.equal(thrice, once, `not stable at 3 applications: ${sample}`);
  }
});

test('never produces two adjacent parentheticals', () => {
  for (const [source, target] of Object.entries(glossary)) {
    const glossed = enforceGlossaryInString(`${source} (уже пояснено)`, glossary);
    assert.ok(
      !/\([^)]*\)\s*\([^)]*\)/.test(glossed),
      `stacked parentheticals for ${JSON.stringify(source)} -> ${JSON.stringify(target)}: ${glossed}`,
    );
  }
});

test('still glosses a bare term', () => {
  const out = enforceGlossaryInString('Форма подаётся в MUP лично', glossary);
  assert.equal(out, 'Форма подаётся в MUP (МВД Хорватии) лично');
});

// Key order in the JSON file must not decide the outcome.
test('longer terms win over their own substrings', () => {
  const out = enforceGlossaryInString('Используйте runway calculator для расчёта', glossary);
  assert.equal(out, 'Используйте калькулятор финансового запаса для расчёта');
});

test('applies recursively through objects and arrays', () => {
  const out = enforceGlossaryDeep(
    { note: 'Подать в MUP', items: ['MUP (Министерство внутренних дел)', 42, null] },
    glossary,
  );
  assert.equal(out.note, 'Подать в MUP (МВД Хорватии)');
  assert.equal(out.items[0], 'MUP (Министерство внутренних дел)');
  assert.equal(out.items[1], 42);
  assert.equal(out.items[2], null);
});
