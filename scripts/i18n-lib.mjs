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
  // Search from 3, not 4: in a file with *empty* front matter ("---\n---\n")
  // the closing delimiter's leading newline is at index 3, so starting at 4
  // skipped past it and the file looked unterminated. content/_index.ru.md is
  // exactly that shape — the home page body comes from templates, so the file
  // exists only to make Hugo emit the localized route.
  const end = raw.indexOf('\n---\n', 3);
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
    claimStrings: fm.claimStrings || {},
    gotchas: fm.gotchas || [],
    artifactNames: fm.artifactNames || {},
    body: doc.body || ''
  };
}

// Generic page-content payload (forms/offices index pages). The translatable
// strings live under `stringsKey` in frontmatter, keyed by id. Body is the
// markdown after the frontmatter.
export function pageContentPayload(doc, stringsKey) {
  const fm = doc.frontMatter || {};
  return {
    title: fm.title,
    description: fm.description,
    [stringsKey]: fm[stringsKey] || {},
    body: doc.body || ''
  };
}

// Generic i18n-data payload (data/i18n/<thing>.<lang>.yaml). The whole map
// is translatable; structural metadata (translationMeta) is excluded.
export function dataI18nPayload(parsedYaml) {
  if (!parsedYaml || typeof parsedYaml !== 'object' || Array.isArray(parsedYaml)) return {};
  const out = {};
  for (const [k, v] of Object.entries(parsedYaml)) {
    if (k === 'translationMeta' || k.startsWith('_')) continue;
    out[k] = v;
  }
  return out;
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

export function payloadHash(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(normalize(payload))).digest('hex');
}

export function sourceHash(doc) {
  return payloadHash(translationPayload(doc));
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

// ── Glossary enforcement ─────────────────────────────────────────────────────

/**
 * Apply the glossary to a single string.
 *
 * Must be idempotent: it runs on every sync, over text a previous sync already
 * processed. Several glossary entries gloss a term in place ("MUP" ->
 * "MUP (МВД Хорватии)"), so a naive global replace re-expands the term inside
 * its own gloss and the parentheticals stack on every run:
 *
 *   run 1: "MUP (Министерство внутренних дел)"
 *       -> "MUP (МВД Хорватии) (Министерство внутренних дел)"
 *   run 2: -> "MUP (МВД Хорватии) (МВД Хорватии) (Министерство внутренних дел)"
 *
 * That shipped once; see the regression test in tests/unit/glossary.test.mjs.
 */
export function enforceGlossaryInString(text, glossary) {
  let out = text;

  // Longest source first, so a multi-word term wins over its own substring
  // ("runway calculator" before "calculator") regardless of key order in the
  // JSON file.
  const entries = Object.entries(glossary).sort((a, b) => b[0].length - a[0].length);

  for (const [source, target] of entries) {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (target.startsWith(source)) {
      // Self-referential gloss: only expand a bare occurrence. If the term is
      // already followed by a parenthetical — ours from a previous run, or one
      // the translator wrote — leave it alone rather than adding a second.
      out = out.replace(new RegExp(`${escaped}(?!\\s*\\()`, 'g'), target);
    } else {
      out = out.replace(new RegExp(escaped, 'g'), target);
    }
  }

  return out;
}

/** Recursively apply the glossary to every string in a payload. */
export function enforceGlossaryDeep(value, glossary) {
  if (Array.isArray(value)) return value.map((v) => enforceGlossaryDeep(v, glossary));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) out[key] = enforceGlossaryDeep(nested, glossary);
    return out;
  }
  if (typeof value === 'string') return enforceGlossaryInString(value, glossary);
  return value;
}

/**
 * Prefix root-relative internal links with the target language.
 *
 * The translator is given the English body, whose links are root-relative
 * ("/forms/phrase-card/"). It returns them verbatim, so a Russian page ends up
 * linking to the English one. Nothing downstream catches this: the links are
 * valid URLs that return 200, so the link checker is happy and only a reader
 * notices they switched language mid-journey.
 *
 * Left alone: external URLs, protocol-relative URLs, anchors, mailto, and
 * paths already carrying the prefix (so this is idempotent).
 */
export function localizeInternalLinks(markdown, lang) {
  if (!markdown || !lang) return markdown;

  const prefix = `/${lang}/`;

  // Markdown links and images: ](/path) — capture the target only.
  return markdown.replace(/(!?\]\()(\/[^)\s]*)/g, (match, open, target) => {
    if (target.startsWith('//')) return match;            // protocol-relative
    if (target === prefix.slice(0, -1) || target.startsWith(prefix)) return match; // already localized
    return `${open}${prefix}${target.slice(1)}`;
  });
}

// ── Generic translated pages ─────────────────────────────────────────────────

/**
 * Every English page under content/ that has a translated sibling, excluding
 * the stage files (which have their own richer payload-based hash).
 *
 * Returns [{ en, translations: { <lang>: path } }].
 */
export const SYNC_MANAGED_PAGES = new Set([
  'content/forms/_index.md',
  'content/offices.md',
]);

export function listTranslatedPagePairs(root = 'content', langs = ['ru']) {
  const pairs = [];

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!entry.name.endsWith('.md')) continue;
      if (LANG_RE.test(entry.name)) continue;              // a translation itself
      if (full.startsWith(`${STAGES_DIR}${path.sep}`)) continue; // stages use sourceHash
      // These are regenerated by sync-ru-translations.mjs, which stamps its own
      // payload-based hash. Hashing the whole file here would fight it.
      if (SYNC_MANAGED_PAGES.has(full.split(path.sep).join('/'))) continue;

      const translations = {};
      for (const lang of langs) {
        const candidate = full.replace(/\.md$/, `.${lang}.md`);
        if (fs.existsSync(candidate)) translations[lang] = candidate;
      }
      if (Object.keys(translations).length) pairs.push({ en: full, translations });
    }
  };

  walk(root);
  return pairs.sort((a, b) => a.en.localeCompare(b.en));
}

/**
 * Hash of an English page as a whole — front matter and body.
 *
 * Stage files hash a structured payload, because only specific fields are
 * translatable there. These pages are free prose, so any change to the English
 * is a reason to re-check the translation. `translationMeta` is stripped so a
 * page hashing itself stays stable.
 */
export function pageSourceHash(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { frontMatter, body } = splitFrontMatter(raw);
  const fm = YAML.parse(frontMatter || '') || {};
  delete fm.translationMeta;
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(fm) + '\n' + body.trim())
    .digest('hex');
}
