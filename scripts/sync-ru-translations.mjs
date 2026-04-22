import fs from 'fs';
import { execFileSync } from 'child_process';
import { STAGES_DIR, listEnglishStageFiles, localizedPath, loadStage, saveStage, sourceHash, translationPayload, compareShape } from './i18n-lib.mjs';

const token = process.env.GITHUB_TOKEN;
const model = process.env.GITHUB_MODELS_MODEL || 'openai/gpt-4o';

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
    'Translate the provided JSON payload from English to Russian.',
    'Return JSON only.',
    'Preserve object keys and structure exactly.',
    'Translate only human-readable string values.',
    'Keep product name ohmoveagain unchanged.',
    'Keep Pipeline capitalized when it is the branded product name.',
    'Preserve abbreviations and program names such as OIB, HZZO, MUP, OECD, EU, EEA, Blue Card, Digital Nomad Visa, obrt, d.o.o., paušalni obrt.',
    'Do not invent facts, URLs, dates, or thresholds.',
    'The body field must remain a string.'
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
    title: translated.title,
    subtitle: translated.subtitle,
    description: translated.description,
    duration: translated.duration,
    requires: translated.requires,
    documents: translated.documents,
    categoryNames: translated.categoryNames,
    itemStrings: translated.itemStrings,
    gotchas: translated.gotchas,
    artifactNames: translated.artifactNames,
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
