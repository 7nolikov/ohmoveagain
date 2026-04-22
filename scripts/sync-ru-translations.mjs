import fs from 'fs';
import { execFileSync } from 'child_process';
import { STAGES_DIR, listEnglishStageFiles, localizedPath, loadStage, saveStage, sourceHash, translationPayload, compareShape } from './i18n-lib.mjs';

const token = process.env.GITHUB_TOKEN;
const model = process.env.GITHUB_MODELS_MODEL || 'openai/gpt-4o';
const glossary = JSON.parse(fs.readFileSync('data/i18n/glossary.ru.json','utf8'));

if (!token) {
  console.error('GITHUB_TOKEN is required');
  process.exit(1);
}

function gitSha() {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); }
  catch { return process.env.GITHUB_SHA || 'unknown'; }
}

async function translatePayload(englishPayload, existingRuPayload) {
  const system = [
    'You are a professional product translator.',
    'Translate from English to Russian.',
    'Return JSON only.',
    'Keep structure EXACTLY the same.',
    'Do not add or remove fields.',
    'Do not invent facts.',
    '',
    'Style:',
    '- Clear, concise, product language',
    '- Avoid bureaucratic tone',
    '- Prefer natural Russian phrasing',
    '',
    'Terminology:',
    'Use this glossary strictly:',
    JSON.stringify(glossary, null, 2),
    'If a term exists in glossary — use it exactly.',
    '',
    'Critical:',
    'Output must be valid JSON'
  ].join('\n');

  const user = JSON.stringify({ englishPayload, existingRuPayload: existingRuPayload || null }, null, 2);

  const res = await fetch('https://models.github.ai/inference/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  });

  if (!res.ok) throw new Error(`models request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('empty model response');

  return JSON.parse(text);
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

  const translated = await translatePayload(enPayload, existingPayload);
  const shapeErrors = compareShape(enPayload, translated);

  if (shapeErrors.length) {
    console.error(`shape mismatch for ${file}`);
    for (const e of shapeErrors) console.error(`- ${e}`);
    process.exit(1);
  }

  const out = {
    slug: existing?.frontMatter?.slug ?? enDoc.frontMatter.slug,
    weight: existing?.frontMatter?.weight ?? enDoc.frontMatter.weight,
    sitemap: existing?.frontMatter?.sitemap ?? enDoc.frontMatter.sitemap,
    ...translated,
    translationMeta: {
      sourceLang: 'en',
      targetLang: 'ru',
      sourceFile: enPath,
      sourceHash: hash,
      sourceCommit: commit,
      status: 'auto-generated'
    }
  };

  saveStage(ruPath, out, translated.body);
  console.log('updated', ruPath);
}
