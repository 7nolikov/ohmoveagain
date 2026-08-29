import fs from 'fs';
import { execFileSync } from 'child_process';
import YAML from 'yaml';
import { STAGES_DIR, listEnglishStageFiles, localizedPath, loadStage, saveStage, sourceHash, payloadHash, translationPayload, pageContentPayload, dataI18nPayload, I18N_DATA_SURFACES, leadingComments, compareShape, enforceGlossaryDeep, localizeInternalLinks } from './i18n-lib.mjs';

const token = process.env.GITHUB_TOKEN;
const model = process.env.GITHUB_MODELS_MODEL || 'openai/gpt-4.1';
const glossary = JSON.parse(fs.readFileSync('data/i18n/glossary.ru.json', 'utf8'));
const POLISH = process.argv.includes('--polish');

if (!token) {
  console.error('GITHUB_TOKEN is required');
  process.exit(1);
}

function gitSha() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return process.env.GITHUB_SHA || 'unknown';
  }
}

function cleanStrings(value) {
  if (Array.isArray(value)) return value.map(cleanStrings);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) out[key] = cleanStrings(nested);
    return out;
  }
  if (typeof value === 'string') {
    return value
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  return value;
}

// enforceGlossaryInString / enforceGlossary live in i18n-lib.mjs so they can be
// unit-tested — this file runs the whole sync at import time, so it cannot be
// imported from a test.
const enforceGlossary = (value) => enforceGlossaryDeep(value, glossary);

function unwrapTranslatedPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload;

  if (payload.englishPayload && payload.existingRuPayload) {
    if (payload.existingRuPayload && typeof payload.existingRuPayload === 'object') return payload.existingRuPayload;
    if (payload.englishPayload && typeof payload.englishPayload === 'object') return payload.englishPayload;
  }

  if (payload.translatedPayload && typeof payload.translatedPayload === 'object') return payload.translatedPayload;
  if (payload.translation && typeof payload.translation === 'object') return payload.translation;
  if (payload.ru && typeof payload.ru === 'object') return payload.ru;

  return payload;
}

function completePayloadShape(payload, englishPayload) {
  const completed = {};
  for (const key of Object.keys(englishPayload)) {
    const enValue = englishPayload[key];
    const have = Object.prototype.hasOwnProperty.call(payload, key);
    const candidate = have ? payload[key] : enValue;

    // Ensure the candidate type matches the English type. If the model
    // returned the wrong type for a field, fall back to the English value.
    if (Array.isArray(enValue)) {
      completed[key] = Array.isArray(candidate) ? candidate : (enValue || []);
    } else if (enValue && typeof enValue === 'object') {
      completed[key] = (candidate && typeof candidate === 'object' && !Array.isArray(candidate))
        ? candidate
        : (enValue || {});
    } else if (typeof enValue === 'string') {
      completed[key] = typeof candidate === 'string' ? candidate : (enValue || '');
    } else {
      completed[key] = candidate;
    }
  }
  return completed;
}

function normalizeTranslatedPayload(payload, englishPayload) {
  return completePayloadShape(unwrapTranslatedPayload(payload), englishPayload);
}

function validateTranslatedPayload(payload, englishPayload) {
  if (!payload || typeof payload !== 'object') throw new Error('translation payload missing');
  for (const key of Object.keys(englishPayload || {})) {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) {
      throw new Error(`translated ${key} missing`);
    }
  }
}

async function translatePayloadOnce(englishPayload, existingRuPayload) {
  const topKeys = Object.keys(englishPayload || {}).join(', ');
  const system = [
    'You are a professional product translator.',
    'Translate from English to Russian.',
    'Return JSON only.',
    'Keep structure EXACTLY the same as englishPayload.',
    'Return the translated payload object directly, not a wrapper object.',
    `The top-level JSON keys must be exactly: ${topKeys}.`,
    'Do not return englishPayload, existingRuPayload, translatedPayload, translation, ru, or any other wrapper key.',
    'Do not add or remove fields.',
    'Do not invent facts.',
    '',
    'Style:',
    '- Clear, concise, product language',
    '- Avoid bureaucratic tone',
    '- Prefer natural Russian phrasing',
    '- Preserve already-good existing Russian wording when possible',
    '- If translation already exists, improve it instead of rewriting everything from scratch',
    '',
    'Stage subtitle and gotcha voice contract:',
    '- When English opens with an imperative verb (Track, File, Bring, Sign, Watch, Don\'t carry, etc.), translate with Russian 2nd-person imperative (Считайте, Подавайте, Берите, Подпишите, Следите, Не везите, etc.). Do NOT convert to nominal/passive constructions like "Требуется X", "Регистрация требует X", "X является обязательным".',
    '- Preserve the em-dash separator between action and consequence in gotchas. Pattern: "[Imperative] — [terse why]".',
    '- One sentence per gotcha. Drop English filler that is not a specific failure mode.',
    '- Stage subtitle stays imperative-first if English is imperative-first; do not start a subtitle with a noun phrase ("Сам переезд:") when EN starts with a verb ("Make the crossing:").',
    '',
    'Terminology:',
    'Use this glossary strictly:',
    JSON.stringify(glossary, null, 2),
    'If a term exists in glossary, use it exactly.',
    'Keep product name ohmoveagain unchanged.',
    'Keep Pipeline capitalized when it is the branded product name.',
    'Preserve abbreviations and program names such as OIB, HZZO, MUP, OECD, EU, EEA, Blue Card, Digital Nomad Visa, obrt, d.o.o., paušalni obrt.',
    '',
    'Critical:',
    'Output must be valid JSON.'
  ].join('\n');

  const user = JSON.stringify(
    {
      englishPayload,
      existingRuPayload: existingRuPayload || null
    },
    null,
    2
  );

  const res = await fetch('https://models.github.ai/inference/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.15,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  });

  if (!res.ok) throw new Error(`models request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();

  let text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('empty model response');

  if (text.startsWith('```')) {
    text = text.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim();
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    console.error('RAW MODEL RESPONSE:\n', text);
    throw new Error('Invalid JSON from model');
  }

  const normalized = normalizeTranslatedPayload(parsed, englishPayload);
  return enforceGlossary(cleanStrings(normalized));
}

async function translatePayload(englishPayload, existingRuPayload) {
  try {
    return await translatePayloadOnce(englishPayload, existingRuPayload);
  } catch (err) {
    // 413 means the combined EN+RU payload exceeds the model's token limit.
    // Retry without the existing translation to halve the request size.
    if (existingRuPayload && err.message.includes('413')) {
      console.warn('payload too large with existing RU — retrying without it');
      return await translatePayloadOnce(englishPayload, null);
    }
    throw err;
  }
}

// ── Chunked translation ───────────────────────────────────────────────────────
// GitHub Models caps a request at 8000 tokens. Large stage files (pre-flight.md)
// exceed that once the English + existing Russian payloads are sent together, so
// the payload is split into smaller partial payloads, translated, and merged.

const MAX_PAYLOAD_CHARS = 6500;

const isMap = (v) => v && typeof v === 'object' && !Array.isArray(v);
const valueSize = (v) => JSON.stringify(v ?? null).length;

// Split a payload into partial payloads below the char budget. A map-valued key
// that exceeds the budget on its own is split entry-by-entry under the same key.
function chunkPayload(payload) {
  const chunks = [];
  let current = {};
  let currentSize = 0;

  const flush = () => {
    if (Object.keys(current).length) {
      chunks.push(current);
      current = {};
      currentSize = 0;
    }
  };

  for (const [key, value] of Object.entries(payload)) {
    const size = valueSize(value);

    if (isMap(value) && size > MAX_PAYLOAD_CHARS) {
      flush();
      let batch = {};
      let batchSize = 0;
      for (const [entryKey, entryValue] of Object.entries(value)) {
        const entrySize = valueSize(entryValue);
        if (batchSize + entrySize > MAX_PAYLOAD_CHARS && Object.keys(batch).length) {
          chunks.push({ [key]: batch });
          batch = {};
          batchSize = 0;
        }
        batch[entryKey] = entryValue;
        batchSize += entrySize;
      }
      if (Object.keys(batch).length) chunks.push({ [key]: batch });
      continue;
    }

    if (currentSize + size > MAX_PAYLOAD_CHARS && Object.keys(current).length) flush();
    current[key] = value;
    currentSize += size;
  }
  flush();
  return chunks;
}

// Extract the slice of an existing Russian payload matching a chunk, so the
// model can still improve prior wording instead of rewriting from scratch.
function sliceExisting(chunk, existingRuPayload) {
  if (!existingRuPayload) return null;
  const slice = {};
  for (const [key, value] of Object.entries(chunk)) {
    const ruValue = existingRuPayload[key];
    if (ruValue === undefined) continue;
    if (isMap(value) && isMap(ruValue)) {
      const sub = {};
      for (const entryKey of Object.keys(value)) {
        if (ruValue[entryKey] !== undefined) sub[entryKey] = ruValue[entryKey];
      }
      slice[key] = sub;
    } else {
      slice[key] = ruValue;
    }
  }
  return Object.keys(slice).length ? slice : null;
}

// Merge a translated chunk into the accumulator. A split map key appears across
// multiple chunks, so its entries are combined rather than overwritten.
function mergeTranslatedChunk(target, chunk) {
  for (const [key, value] of Object.entries(chunk)) {
    if (isMap(value) && isMap(target[key])) {
      Object.assign(target[key], value);
    } else {
      target[key] = value;
    }
  }
}

async function translatePayloadChunked(englishPayload, existingRuPayload) {
  const chunks = chunkPayload(englishPayload);
  if (chunks.length <= 1) {
    return translatePayload(englishPayload, existingRuPayload);
  }
  console.log(`payload split into ${chunks.length} chunks`);
  const merged = {};
  for (const chunk of chunks) {
    const translatedChunk = await translatePayload(chunk, sliceExisting(chunk, existingRuPayload));
    mergeTranslatedChunk(merged, translatedChunk);
  }
  return merged;
}

// ── Polish pass (--polish flag) ───────────────────────────────────────────────
// Second LLM call that critiques the first-pass Russian output for stilted
// phrasing, calques, and unnatural word order; returns revised JSON.

async function polishOnce(russianPayload, englishPayload) {
  const topKeys = Object.keys(russianPayload || {}).join(', ');
  const system = [
    'You are a senior Russian editor reviewing a machine translation for a relocation guide.',
    'Critique the Russian text for stilted phrasing, calques from English, and unnatural word order.',
    'Return improved JSON with identical structure — same keys, same types, same array lengths.',
    `Top-level keys must be exactly: ${topKeys}.`,
    'Return the JSON object directly — no wrapper key.',
    '',
    'Common issues to fix:',
    '- Nominal/passive constructions where the translation should be imperative (Считайте, Подавайте, Берите, …)',
    '- English calques: "является обязательным" → "обязателен", "в случае если" → "если", "осуществить" → "сделать"',
    '- Bureaucratic filler that bloats a terse original',
    '- Unnatural compound nouns or Anglicisms that have common Russian equivalents',
    '',
    'Keep unchanged:',
    '- All glossary-locked terms (apostille, sworn translation, OIB, HZZO, MUP, paušalni obrt, d.o.o., etc.)',
    '- Product names: ohmoveagain, Pipeline',
    '- All i18n template variables such as {{.SomeName}} or {{ .Value }}',
    '',
    'Output must be valid JSON.',
  ].join('\n');

  const user = JSON.stringify({ english: englishPayload, russian: russianPayload }, null, 2);

  const res = await fetch('https://models.github.ai/inference/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ model, temperature: 0.1, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] })
  });

  if (!res.ok) throw new Error(`polish request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  let text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('empty polish response');
  if (text.startsWith('```')) text = text.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) text = text.slice(firstBrace, lastBrace + 1);
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new Error('Invalid JSON from polish model'); }
  const normalized = normalizeTranslatedPayload(parsed, russianPayload);
  return enforceGlossary(cleanStrings(normalized));
}

async function polishPayloadChunked(russianPayload, englishPayload) {
  const chunks = chunkPayload(englishPayload);
  if (chunks.length <= 1) return polishOnce(russianPayload, englishPayload);
  console.log(`polish: payload split into ${chunks.length} chunks`);
  const merged = {};
  for (const chunk of chunks) {
    const ruSlice = sliceExisting(chunk, russianPayload) || chunk;
    const polishedChunk = await polishOnce(ruSlice, chunk);
    mergeTranslatedChunk(merged, polishedChunk);
  }
  return merged;
}

const commit = gitSha();

for (const file of listEnglishStageFiles()) {
  const enPath = `${STAGES_DIR}/${file}`;
  const ruPath = localizedPath(file, 'ru');

  const enDoc = loadStage(enPath);
  const enPayload = translationPayload(enDoc);
  const hash = sourceHash(enDoc);

  let existing = null;
  let existingPayload = null;
  if (fs.existsSync(ruPath)) {
    existing = loadStage(ruPath);
    existingPayload = translationPayload(existing);
    if (existing.frontMatter?.translationMeta?.sourceHash === hash) continue;
  }

  let translated;
  try {
    translated = await translatePayloadChunked(enPayload, existingPayload);
    validateTranslatedPayload(translated, enPayload);
  } catch (error) {
    if (existingPayload) {
      console.warn(`translation failed for ${file}; keeping existing Russian copy: ${error.message}`);
      continue;
    }
    throw error;
  }

  const shapeErrors = compareShape(enPayload, translated);
  if (shapeErrors.length) {
    if (existingPayload) {
      console.warn(`shape mismatch for ${file}; keeping existing Russian copy`);
      for (const e of shapeErrors) console.warn(`- ${e}`);
      continue;
    }
    console.error(`shape mismatch for ${file}`);
    for (const e of shapeErrors) console.error(`- ${e}`);
    process.exit(1);
  }

  if (POLISH) {
    try {
      translated = await polishPayloadChunked(translated, enPayload);
      console.log('polished', ruPath);
    } catch (error) {
      console.warn(`polish failed for ${file}; keeping unpolished: ${error.message}`);
    }
  }

  const { body: translatedBody, ...translatedFrontmatter } = translated;

  const out = {
    slug: existing?.frontMatter?.slug ?? enDoc.frontMatter.slug,
    weight: existing?.frontMatter?.weight ?? enDoc.frontMatter.weight,
    sitemap: existing?.frontMatter?.sitemap ?? enDoc.frontMatter.sitemap,
    ...translatedFrontmatter,
    translationMeta: {
      sourceLang: 'en',
      targetLang: 'ru',
      sourceFile: enPath,
      sourceHash: hash,
      sourceCommit: commit,
      status: existingPayload ? 'auto-updated' : 'auto-generated'
    }
  };

  saveStage(ruPath, out, localizeInternalLinks(translatedBody, 'ru'));
  console.log('updated', ruPath);
}

// ── Page-content surfaces (forms, offices) ────────────────────────────────────

const PAGE_CONTENT_SURFACES = [
  { en: 'content/forms/_index.md', ruFile: (lang) => `content/forms/_index.${lang}.md`, stringsKey: 'formStrings' },
  { en: 'content/offices.md',     ruFile: (lang) => `content/offices.${lang}.md`,     stringsKey: 'officeStrings' },
];

for (const surface of PAGE_CONTENT_SURFACES) {
  const enPath = surface.en;
  const ruPath = surface.ruFile('ru');
  if (!fs.existsSync(enPath)) {
    console.warn(`page-content: ${enPath} missing — skipping`);
    continue;
  }
  const enDoc = loadStage(enPath);
  const enPayload = pageContentPayload(enDoc, surface.stringsKey);
  const hash = payloadHash(enPayload);

  let existing = null;
  let existingPayload = null;
  if (fs.existsSync(ruPath)) {
    existing = loadStage(ruPath);
    existingPayload = pageContentPayload(existing, surface.stringsKey);
    if (existing.frontMatter?.translationMeta?.sourceHash === hash) continue;
  }

  let translated;
  try {
    translated = await translatePayloadChunked(enPayload, existingPayload);
    validateTranslatedPayload(translated, enPayload);
  } catch (error) {
    if (existingPayload) {
      console.warn(`translation failed for ${enPath}; keeping existing copy: ${error.message}`);
      continue;
    }
    throw error;
  }

  const shapeErrors = compareShape(enPayload, translated);
  if (shapeErrors.length) {
    if (existingPayload) {
      console.warn(`shape mismatch for ${enPath}; keeping existing copy`);
      for (const e of shapeErrors) console.warn(`- ${e}`);
      continue;
    }
    console.error(`shape mismatch for ${enPath}`);
    for (const e of shapeErrors) console.error(`- ${e}`);
    process.exit(1);
  }

  if (POLISH) {
    try {
      translated = await polishPayloadChunked(translated, enPayload);
      console.log('polished', ruPath);
    } catch (error) {
      console.warn(`polish failed for ${enPath}; keeping unpolished: ${error.message}`);
    }
  }

  const { body: translatedBody, [surface.stringsKey]: translatedStrings, title: translatedTitle, description: translatedDescription } = translated;

  // Preserve all existing frontmatter (layout, sitemap, etc.); overwrite only
  // the translatable subset.
  const out = {
    ...(existing?.frontMatter || enDoc.frontMatter),
    title: translatedTitle,
    description: translatedDescription,
    [surface.stringsKey]: translatedStrings,
    translationMeta: {
      sourceLang: 'en',
      targetLang: 'ru',
      sourceFile: enPath,
      sourceHash: hash,
      sourceCommit: commit,
      status: existingPayload ? 'auto-updated' : 'auto-generated'
    }
  };

  saveStage(ruPath, out, localizeInternalLinks(translatedBody, 'ru'));
  console.log('updated', ruPath);
}

// ── Shared i18n-data surfaces (countries, fees) ───────────────────────────────

function loadDataYaml(path) {
  const parsed = YAML.parse(fs.readFileSync(path, 'utf8'));
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

function saveDataYaml(path, data, header) {
  const text = (header ? header + '\n' : '') + YAML.stringify(data).trimEnd() + '\n';
  fs.writeFileSync(path, text, 'utf8');
}

for (const surface of I18N_DATA_SURFACES) {
  const enPath = surface.en;
  const ruPath = surface.localized('ru');
  if (!fs.existsSync(enPath)) {
    console.warn(`i18n-data: ${enPath} missing — skipping`);
    continue;
  }
  const enRaw = loadDataYaml(enPath);
  const enPayload = dataI18nPayload(enRaw);
  const hash = payloadHash(enPayload);

  let existingRaw = null;
  let existingPayload = null;
  if (fs.existsSync(ruPath)) {
    existingRaw = loadDataYaml(ruPath);
    existingPayload = dataI18nPayload(existingRaw);
    if (existingRaw.translationMeta?.sourceHash === hash) continue;
  }

  let translated;
  try {
    translated = await translatePayloadChunked(enPayload, existingPayload);
    validateTranslatedPayload(translated, enPayload);
  } catch (error) {
    if (existingPayload) {
      console.warn(`translation failed for ${enPath}; keeping existing copy: ${error.message}`);
      continue;
    }
    throw error;
  }

  const shapeErrors = compareShape(enPayload, translated);
  if (shapeErrors.length) {
    if (existingPayload) {
      console.warn(`shape mismatch for ${enPath}; keeping existing copy`);
      for (const e of shapeErrors) console.warn(`- ${e}`);
      continue;
    }
    console.error(`shape mismatch for ${enPath}`);
    for (const e of shapeErrors) console.error(`- ${e}`);
    process.exit(1);
  }

  if (POLISH) {
    try {
      translated = await polishPayloadChunked(translated, enPayload);
      console.log('polished', ruPath);
    } catch (error) {
      console.warn(`polish failed for ${enPath}; keeping unpolished: ${error.message}`);
    }
  }

  const out = {
    translationMeta: {
      sourceLang: 'en',
      targetLang: 'ru',
      sourceFile: enPath,
      sourceHash: hash,
      sourceCommit: commit,
      status: existingPayload ? 'auto-updated' : 'auto-generated'
    },
    ...translated
  };

  saveDataYaml(ruPath, out, leadingComments(ruPath) || leadingComments(enPath));
  console.log('updated', ruPath);
}
