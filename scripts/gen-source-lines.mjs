#!/usr/bin/env node
// gen-source-lines.mjs — emit data/source_lines.yaml mapping every
// source id / claim id / inline-source item id in data/stages/*.yaml
// and data/countries.yaml to the YAML line where its verification date
// lives (lastChecked / lastReviewed / asOf).
//
// Read by Hugo via hugo.Data.source_lines to render verified-date
// chips as links to https://github.com/<repo>/blame/main/<path>#L<line>
// — every "verified Nd ago" becomes a direct provenance link.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

function indentOf(line) {
  let i = 0;
  while (i < line.length && line[i] === ' ') i++;
  return i;
}

function isBlank(line) {
  return /^\s*(#.*)?$/.test(line);
}

// Parse a stage YAML — return { sources: {id: line}, claims: {id: line},
// items: {id: line} } where line points to the verification-date line
// (lastChecked / lastReviewed / asOf), falling back to the id line if none.
function parseStage(text) {
  const lines = text.split('\n');
  const out = { sources: {}, claims: {}, items: {} };

  // Walk and track which top-level section we're in.
  let section = null;            // "sources" | "claims" | "checklist" | null
  let sectionIndent = -1;        // indent at which list items start (e.g. 2)
  // Per-entry tracking:
  let curBucket = null;          // out.sources / out.claims / out.items
  let curId = null;              // entry id currently being read
  let curIdLine = 0;             // 1-based line number of `- id:` line
  let curDateLine = 0;           // 1-based line of date field, if seen
  let entryIndent = -1;          // indent of the dash that opened this entry

  // For checklist → items: items live one nesting deeper. We need a second
  // mode that tracks "inside an items: block".
  let inItems = false;
  let itemsIndent = -1;

  function flush() {
    if (curBucket && curId != null) {
      curBucket[curId] = curDateLine || curIdLine;
    }
    curId = null;
    curIdLine = 0;
    curDateLine = 0;
    entryIndent = -1;
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNo = i + 1;
    if (isBlank(raw)) continue;
    const ind = indentOf(raw);
    const body = raw.slice(ind);

    // Top-level section header (no indent).
    if (ind === 0) {
      flush();
      curBucket = null;
      section = null;
      sectionIndent = -1;
      inItems = false;
      itemsIndent = -1;
      if (body.startsWith('sources:')) { section = 'sources'; curBucket = out.sources; sectionIndent = 2; }
      else if (body.startsWith('claims:')) { section = 'claims'; curBucket = out.claims; sectionIndent = 2; }
      else if (body.startsWith('checklist:')) { section = 'checklist'; sectionIndent = 2; }
      continue;
    }

    if (section === 'checklist') {
      // Inside a checklist category. We look for an `items:` key, then track
      // entries inside it.
      if (body.startsWith('items:')) {
        flush();
        inItems = true;
        itemsIndent = ind + 2;
        curBucket = out.items;
        continue;
      }
      // Leaving items block (back to category level)
      if (inItems && ind <= itemsIndent - 2 && !body.startsWith('- ') && !body.startsWith('  ')) {
        flush();
        inItems = false;
        itemsIndent = -1;
        curBucket = null;
      }
      if (!inItems) continue;

      // Start of a new item entry.
      const dashIdMatch = body.match(/^- id:\s*([A-Za-z0-9_-]+)/);
      if (ind === itemsIndent && dashIdMatch) {
        flush();
        curId = dashIdMatch[1];
        curIdLine = lineNo;
        entryIndent = ind;
        continue;
      }
      // Field within current item — look for asOf.
      if (curId != null && ind > entryIndent) {
        const asOfMatch = body.match(/^asOf:\s*/);
        if (asOfMatch) {
          curDateLine = lineNo;
        }
      }
      continue;
    }

    // sources or claims top-level list.
    if (section === 'sources' || section === 'claims') {
      const dashIdMatch = body.match(/^- id:\s*([A-Za-z0-9_-]+)/);
      if (ind === sectionIndent && dashIdMatch) {
        flush();
        curId = dashIdMatch[1];
        curIdLine = lineNo;
        entryIndent = ind;
        continue;
      }
      if (curId != null && ind > entryIndent) {
        const datedMatch = body.match(/^(lastChecked|lastReviewed):\s*/);
        if (datedMatch) {
          curDateLine = lineNo;
        }
      }
    }
  }
  flush();
  return out;
}

// Parse countries.yaml — top-level list of country dicts. For each entry,
// capture the line of `source.asOf:`, falling back to `code:`.
function parseCountries(text) {
  const lines = text.split('\n');
  const out = {};
  let curCode = null;
  let curCodeLine = 0;
  let curAsOfLine = 0;
  let entryIndent = -1;

  function flush() {
    if (curCode != null) {
      out[curCode] = curAsOfLine || curCodeLine;
    }
    curCode = null; curCodeLine = 0; curAsOfLine = 0; entryIndent = -1;
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNo = i + 1;
    if (isBlank(raw)) continue;
    const ind = indentOf(raw);
    const body = raw.slice(ind);

    const dashCodeMatch = body.match(/^- code:\s*"?([A-Z]{2,3})"?/);
    if (ind === 0 && dashCodeMatch) {
      flush();
      curCode = dashCodeMatch[1];
      curCodeLine = lineNo;
      entryIndent = ind;
      continue;
    }
    if (curCode != null && ind > entryIndent) {
      const asOfMatch = body.match(/^asOf:\s*/);
      if (asOfMatch) curAsOfLine = lineNo;
    }
  }
  flush();
  return out;
}

const stagesDir = 'data/stages';
const stages = {};
for (const file of readdirSync(stagesDir)) {
  if (!file.endsWith('.yaml')) continue;
  const slug = path.basename(file, '.yaml');
  const text = readFileSync(path.join(stagesDir, file), 'utf8');
  stages[slug] = parseStage(text);
}

const countriesText = readFileSync('data/countries.yaml', 'utf8');
const countries = parseCountries(countriesText);

// Emit YAML manually — small file, no dep needed.
function emitObj(obj, indent = 0) {
  const pad = ' '.repeat(indent);
  let out = '';
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object') {
      out += `${pad}${k}:\n${emitObj(v, indent + 2)}`;
    } else {
      out += `${pad}${k}: ${v}\n`;
    }
  }
  return out;
}

const yaml = '# Auto-generated by scripts/gen-source-lines.mjs — do not edit.\n' +
  `generatedAt: "${new Date().toISOString()}"\n` +
  'stages:\n' + emitObj(stages, 2) +
  'countries:\n' + emitObj(countries, 2);

writeFileSync('data/source_lines.yaml', yaml);

const stageCount = Object.keys(stages).length;
const totalIds = Object.values(stages).reduce((n, s) =>
  n + Object.keys(s.sources).length + Object.keys(s.claims).length + Object.keys(s.items).length, 0);
console.log(`Wrote data/source_lines.yaml — ${stageCount} stages, ${totalIds} stage ids, ${Object.keys(countries).length} countries.`);
