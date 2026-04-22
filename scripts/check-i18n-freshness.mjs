import fs from 'fs';
import { STAGES_DIR, listEnglishStageFiles, localizedPath, loadStage, sourceHash } from './i18n-lib.mjs';

for (const file of listEnglishStageFiles()) {
  const enDoc = loadStage(`${STAGES_DIR}/${file}`);
  const ruPath = localizedPath(file, 'ru');
  if (!fs.existsSync(ruPath)) continue;

  const ruDoc = loadStage(ruPath);
  const expected = sourceHash(enDoc);
  const actual = ruDoc.frontMatter?.translationMeta?.sourceHash;

  if (expected !== actual) {
    console.warn(`stale: ${ruPath}`);
  }
}

console.log('freshness check done');