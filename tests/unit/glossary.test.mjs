import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { enforceGlossaryInString, enforceGlossaryDeep, localizeInternalLinks, splitFrontMatter, pageSourceHash } from '../../scripts/i18n-lib.mjs';

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

// Internal links in a translated body came back from the model verbatim, so
// Russian pages linked to English ones. They return 200, so the link checker
// never flagged it — only a reader would notice the language switch.
test('localizes root-relative internal links', () => {
  assert.equal(localizeInternalLinks('[a](/forms/phrase-card/)', 'ru'), '[a](/ru/forms/phrase-card/)');
  assert.equal(localizeInternalLinks('![img](/og.png)', 'ru'), '![img](/ru/og.png)');
  assert.equal(localizeInternalLinks('[home](/)', 'ru'), '[home](/ru/)');
});

test('leaves external, anchor and already-localized links alone', () => {
  for (const untouched of [
    '[a](https://mup.gov.hr/)',
    '[a](http://example.com/x)',
    '[a](//cdn.example.com/x)',
    '[a](#anchor)',
    '[a](mailto:x@y.z)',
    '[a](/ru/forms/phrase-card/)',
  ]) {
    assert.equal(localizeInternalLinks(untouched, 'ru'), untouched, untouched);
  }
});

test('link localization is idempotent', () => {
  const once = localizeInternalLinks('See [forms](/forms/) and [home](/).', 'ru');
  assert.equal(localizeInternalLinks(once, 'ru'), once);
});

// content/_index.ru.md is "---\n---\n" — empty front matter, no body, because
// the home page renders from templates and the file exists only to make Hugo
// emit the localized route. splitFrontMatter searched from index 4 and so
// skipped past the closing delimiter, reporting the file as unterminated.
test('splitFrontMatter handles empty front matter', () => {
  const r = splitFrontMatter('---\n---\n');
  assert.equal(r.frontMatterRaw, '');
  assert.equal(r.body, '');
});

test('splitFrontMatter still handles normal and body-less files', () => {
  assert.deepEqual(splitFrontMatter('---\ntitle: x\n---\nbody here'),
    { frontMatterRaw: 'title: x', body: 'body here' });
  assert.deepEqual(splitFrontMatter('---\na: 1\n---\n'),
    { frontMatterRaw: 'a: 1', body: '' });
});

test('splitFrontMatter rejects malformed files', () => {
  assert.throws(() => splitFrontMatter('---\nno close'), /missing closing front matter/);
  assert.throws(() => splitFrontMatter('no front matter at all'), /missing front matter/);
});

// A page's hash must ignore its own translationMeta, or stamping a file would
// change the hash that was just stamped.
test('pageSourceHash ignores translationMeta', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-'));
  const a = path.join(dir, 'a.md');
  const b = path.join(dir, 'b.md');
  fs.writeFileSync(a, '---\ntitle: x\n---\nbody\n');
  fs.writeFileSync(b, '---\ntitle: x\ntranslationMeta:\n  sourceHash: deadbeef\n---\nbody\n');
  assert.equal(pageSourceHash(a), pageSourceHash(b));
});
