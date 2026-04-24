import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import YAML from 'yaml';

export const STAGES_DIR = 'content/stages';
const LANG_RE = /^(?<slug>.+)\.(?<lang>[a-z]{2})\.md$/i;

export function listEnglishStageFiles() {
  return fs.readdirSync(STAGES_DIR)
    .filter((f) => f.endsWith('.md'))
    .filter((f) => !LANG_RE.test(f))
    .sort();
}

export function localizedPath(file, lang) {
  return path.join(STAGES_DIR, file.replace(/\.md$/, `.${lang}.md`));
}

export function splitFrontMatter(raw) {
  if (!raw.startsWith('---\n')) throw new Error('missing front matter');
  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) throw new Error('missing closing front matter');
  return { frontMatterRaw: raw.slice(4, end), body: raw.slice(end + 5).trim() };
}

export function loadStage(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { frontMatterRaw, body } = splitFrontMatter(raw);
  const frontMatter = YAML.parse(frontMatterRaw) || {};
  return { path: filePath, frontMatter, body };
}

export function saveStage(filePath, frontMatter, body) {
  const yamlText = YAML.stringify(frontMatter).trimEnd();
  fs.writeFileSync(filePath, `---\n${yamlText}\n---\n\n${String(body || '').replace(/\s+$/, '')}\n`, 'utf8');
}

export function translationPayload(doc) {
  const fm = doc.frontMatter || {};
  return {
    title: fm.title,
    subtitle: fm.subtitle,
    description: fm.description,
    duration: fm.duration,
    requires: fm.requires || [],
    documents: fm.documents || [],
    categoryNames: fm.categoryNames || {},
    itemStrings: fm.itemStrings || {},
    gotchas: fm.gotchas || [],
    artifactNames: fm.artifactNames || {},
    body: doc.body || ''
  };
}

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = normalize(value[key]);
    return out;
  }
  return value;
}

export function sourceHash(doc) {
  return crypto.createHash('sha256').update(JSON.stringify(normalize(translationPayload(doc)))).digest('hex');
}

export function compareShape(reference, candidate, currentPath = '') {
  const errors = [];
  if (Array.isArray(reference)) {
    if (!Array.isArray(candidate)) return [`${currentPath || '<root>'}: expected array`];
    if (reference.length !== candidate.length) return [`${currentPath || '<root>'}: expected array length ${reference.length}, got ${candidate.length}`];
    reference.forEach((item, index) => errors.push(...compareShape(item, candidate[index], `${currentPath}[${index}]`)));
    return errors;
  }
  if (reference && typeof reference === 'object') {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return [`${currentPath || '<root>'}: expected object`];
    for (const key of Object.keys(reference)) {
      if (!(key in candidate)) errors.push(`${currentPath ? `${currentPath}.` : ''}${key}: missing key`);
    }
    for (const key of Object.keys(candidate)) {
      if (!(key in reference)) errors.push(`${currentPath ? `${currentPath}.` : ''}${key}: unexpected key`);
    }
    for (const key of Object.keys(reference)) {
      if (key in candidate) errors.push(...compareShape(reference[key], candidate[key], currentPath ? `${currentPath}.${key}` : key));
    }
    return errors;
  }
  if (typeof reference !== typeof candidate) return [`${currentPath || '<root>'}: expected ${typeof reference}, got ${typeof candidate}`];
  return [];
}
