import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';

const STAGE_DIR = 'data/stages';

// The bug this guards against: check-staleness.mjs hard-coded the path
// doc.claims[].items[].source when looking for inline per-item sources. The
// schema later moved those items to checklist[].items[] (and exit.yaml uses
// countries[].items[]), so the check silently matched nothing. 45 of 76
// sources — including every source on the exit page — went unverified while
// the build kept reporting "0 failed, 0 warned". The gate is the project's
// central claim, so under-coverage has to fail loudly rather than pass quietly.

/** Independent traversal: every inline `source.asOf` anywhere in a stage doc. */
function collectInlineSourceIds(node, ownerId = null, out = []) {
  if (Array.isArray(node)) {
    for (const child of node) collectInlineSourceIds(child, ownerId, out);
    return out;
  }
  if (!node || typeof node !== 'object') return out;

  const id = typeof node.id === 'string' ? node.id : ownerId;
  if (node.source && typeof node.source === 'object' && node.source.asOf) {
    out.push(id);
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === 'sources' || key === 'source') continue;
    collectInlineSourceIds(value, id, out);
  }
  return out;
}

function expectedInlineIds() {
  const ids = [];
  for (const file of fs.readdirSync(STAGE_DIR)) {
    if (!file.endsWith('.yaml')) continue;
    const doc = YAML.parse(fs.readFileSync(path.join(STAGE_DIR, file), 'utf8'));
    collectInlineSourceIds(doc, null, ids);
  }
  return ids;
}

/**
 * Run the real checker with a negative warn threshold so every inline date
 * trips — including sources verified today, whose age is 0.
 */
function reportedInlineIds() {
  const stdout = execFileSync(
    process.execPath,
    ['scripts/check-staleness.mjs', '--json', '--warn-days=-1', '--fail-days=1000000'],
    { encoding: 'utf8' }
  );
  const { warns } = JSON.parse(stdout);
  return warns.filter((w) => w.kind === 'asOf' && 'item' in w).map((w) => w.item);
}

test('staleness check covers every inline per-item source', () => {
  const expected = expectedInlineIds();
  const reported = reportedInlineIds();

  assert.ok(expected.length > 0, 'fixture sanity: stage data should have inline sources');
  assert.equal(
    reported.length,
    expected.length,
    `staleness check saw ${reported.length} inline sources but the data has ${expected.length}. `
    + 'An inline source path is not being walked — see the schema-drift note in check-staleness.mjs.'
  );
  assert.deepEqual(new Set(reported), new Set(expected));
});

test('staleness check reaches both inline nesting shapes', () => {
  const reported = new Set(reportedInlineIds());

  // checklist[].items[].source — the v2 stage shape
  assert.ok(reported.has('runway-delta'), 'checklist[].items[].source not covered');
  // countries[].items[].source — the exit.yaml shape
  assert.ok(reported.has('us-mail-forward'), 'countries[].items[].source not covered');
});
