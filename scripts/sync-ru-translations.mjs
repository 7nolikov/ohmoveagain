import fs from 'fs';
import { execFileSync } from 'child_process';
import YAML from 'yaml';
import { STAGES_DIR, listEnglishStageFiles, localizedPath, loadStage, saveStage, sourceHash, payloadHash, translationPayload, pageContentPayload, dataI18nPayload, compareShape } from './i18n-lib.mjs';

const token = process.env.GITHUB_TOKEN;
const model = process.env.GITHUB_MODELS_MODEL || 'openai/gpt-4.1';
const glossary = JSON.parse(fs.readFileSync('data/i18n/glossary.ru.json', 'utf8'));

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

function enforceGlossaryInString(text) {
  let out = text;
  for (const [source, target] of Object.entries(glossary)) {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escaped, 'g'), target);
  }
  return out;
}

function enforceGlossary(value) {
  if (Array.isArray(value)) return value.map(enforceGlossary);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) out[key] = enforceGlossary(nested);
    return out;
  }
  if (typeof value === 'string') return enforceGlossaryInString(value);
  return value;
}

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

async function translatePayload(englishPayload, existingRuPayload) {
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
    translated = await translatePayload(enPayload, existingPayload);
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

  saveStage(ruPath, out, translatedBody);
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
    translated = await translatePayload(enPayload, existingPayload);
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

  saveStage(ruPath, out, translatedBody);
  console.log('updated', ruPath);
}

// ── Shared i18n-data surfaces (countries, fees) ───────────────────────────────

const I18N_DATA_SURFACES = [
  { en: 'data/i18n/countries.en.yaml', ruFile: (lang) => `data/i18n/countries.${lang}.yaml` },
  { en: 'data/i18n/fees.en.yaml',     ruFile: (lang) => `data/i18n/fees.${lang}.yaml` },
];

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
  const ruPath = surface.ruFile('ru');
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
    translated = await translatePayload(enPayload, existingPayload);
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

  saveDataYaml(ruPath, out);
  console.log('updated', ruPath);
}
