#!/usr/bin/env node
// source-urls-lib.mjs — the pure half of check-source-urls.mjs.
//
// Split out for the same reason i18n-lib.mjs exists: the checker runs its whole
// pass at import time under top-level await, so nothing in it can be imported
// from a test. Collection and normalisation are where the bugs would be silent
// — a field this stops recognising is a source that stops being checked — so
// they live here and are covered by tests/unit/source-urls.test.mjs.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';

// Deliberately not data/offices.yaml. It holds `booking:` and `mapUrl:`, which
// are navigation, not citations — a booking portal bouncing you to its login
// screen is the portal working, not a source rotting.
export const SOURCE_FILES = ['data/countries.yaml', 'data/fees.yaml', 'data/forms.yaml'];
export const STAGES_DIR = 'data/stages';

export function stageFiles() {
  try {
    return readdirSync(STAGES_DIR)
      .filter((f) => f.endsWith('.yaml'))
      .map((f) => join(STAGES_DIR, f))
      .filter((f) => statSync(f).isFile());
  } catch {
    return [];
  }
}

// Every shape a source URL takes in this repo: `url` on a sources[] entry,
// `url` inside an inline `source:` block, and `sourceUrl` in fees.yaml.
export function collect(node, file, ownerId, out) {
  if (Array.isArray(node)) {
    for (const child of node) collect(child, file, ownerId, out);
    return;
  }
  if (!node || typeof node !== 'object') return;

  // countries.yaml keys its entries on `code`, everything else on `id`.
  const own = typeof node.id === 'string' ? node.id
    : typeof node.code === 'string' ? node.code
    : null;
  const id = own ?? ownerId;

  for (const key of ['url', 'sourceUrl']) {
    const value = node[key];
    if (typeof value === 'string' && /^https?:\/\//.test(value)) {
      out.push({ file, id, url: value, redirectOk: node.redirectOk === true });
    }
  }

  for (const value of Object.values(node)) collect(value, file, id, out);
}

export function gatherSources(onParseError = () => {}) {
  const out = [];
  for (const file of [...SOURCE_FILES, ...stageFiles()]) {
    let doc;
    try {
      doc = parseYaml(readFileSync(file, 'utf8'));
    } catch (err) {
      onParseError(file, err);
      continue;
    }
    collect(doc, file, null, out);
  }
  return out;
}

// Trailing slashes are the one difference nobody means. Everything else — a
// changed host, a changed path, a query string appended by a login redirect —
// is a real difference and the point of the check.
export const normalize = (u) => u.replace(/\/+$/, '');
