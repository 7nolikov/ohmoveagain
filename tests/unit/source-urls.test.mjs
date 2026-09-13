import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  gatherSources, collect, normalize, SOURCE_FILES, stageFiles,
} from '../../scripts/source-urls-lib.mjs';

// What this guards: a field the collector stops recognising is a source that
// silently stops being checked, which is the exact failure mode the checker
// was written to end. The counts below are lower bounds on purpose — adding
// sources must not break the test, dropping a whole file must.

test('every registered source file exists', () => {
  for (const file of SOURCE_FILES) {
    assert.ok(fs.existsSync(file), `${file} is registered but missing`);
  }
  assert.ok(stageFiles().length > 0, 'no stage YAML files found');
});

test('sources are collected from every file that holds citations', () => {
  const sources = gatherSources();
  const files = new Set(sources.map((s) => s.file));

  for (const file of SOURCE_FILES) {
    assert.ok(files.has(file), `${file} contributed no source URLs`);
  }
  for (const file of stageFiles()) {
    assert.ok(files.has(file), `${file} contributed no source URLs`);
  }
  assert.ok(sources.length > 50, `expected the full source set, got ${sources.length}`);
});

test('offices.yaml is not treated as a source of citations', () => {
  // booking: and mapUrl: are navigation. A booking portal redirecting to its
  // own login screen is the portal working.
  const files = new Set(gatherSources().map((s) => s.file));
  assert.ok(!files.has('data/offices.yaml'), 'offices.yaml leaked into the source set');
});

test('country entries are attributed by code, not left anonymous', () => {
  const pl = gatherSources().find((s) => s.file === 'data/countries.yaml' && s.id === 'PL');
  assert.ok(pl, 'no source attributed to PL — countries.yaml keys on code, not id');
  assert.match(pl.url, /^https?:\/\//);
});

test('both citation field names are recognised', () => {
  const out = [];
  collect(
    { id: 'a', url: 'https://example.com/a', nested: { id: 'b', sourceUrl: 'https://example.com/b' } },
    'test.yaml', null, out
  );
  assert.deepEqual(
    out.map((s) => [s.id, s.url]),
    [['a', 'https://example.com/a'], ['b', 'https://example.com/b']]
  );
});

test('redirectOk is opt-in and per source', () => {
  const out = [];
  collect(
    [
      { id: 'strict', url: 'https://example.com/x' },
      { id: 'lenient', url: 'https://example.com/y', redirectOk: true },
    ],
    'test.yaml', null, out
  );
  assert.deepEqual(out.map((s) => s.redirectOk), [false, true]);
});

test('non-http values are ignored', () => {
  const out = [];
  collect({ id: 'a', url: 'mailto:someone@example.com' }, 'test.yaml', null, out);
  collect({ id: 'b', url: '/local/path' }, 'test.yaml', null, out);
  assert.equal(out.length, 0, 'a non-http value was collected as a source URL');
});

test('normalise differs only on the trailing slash', () => {
  assert.equal(normalize('https://a.test/x/'), normalize('https://a.test/x'));
  assert.notEqual(normalize('https://www.a.test/x'), normalize('https://a.test/x'));
  assert.notEqual(normalize('https://a.test/x'), normalize('https://a.test/'));
  assert.notEqual(normalize('https://a.test/x'), normalize('https://a.test/x?login=1'));
});
