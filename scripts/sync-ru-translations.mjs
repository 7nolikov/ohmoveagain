import fs from 'fs';
import { STAGES_DIR, listEnglishStageFiles, localizedPath, loadStage, saveStage, sourceHash } from './i18n-lib.mjs';

for (const file of listEnglishStageFiles()) {
  const enPath = `${STAGES_DIR}/${file}`;
  const ruPath = localizedPath(file, 'ru');

  const enDoc = loadStage(enPath);
  const hash = sourceHash(enDoc);

  let existing = null;
  if (fs.existsSync(ruPath)) {
    existing = loadStage(ruPath);
    if (existing.frontMatter?.translationMeta?.sourceHash === hash) continue;
  }

  const out = {
    ...enDoc.frontMatter,
    title: `[RU AUTO] ${enDoc.frontMatter.title}`,
    translationMeta: { sourceHash: hash }
  };

  saveStage(ruPath, out, enDoc.body);
  console.log('updated', ruPath);
}
