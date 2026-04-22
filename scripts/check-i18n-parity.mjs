import fs from 'fs';
import { STAGES_DIR, listEnglishStageFiles, localizedPath, loadStage, translationPayload, compareShape } from './i18n-lib.mjs';

let failed = false;

for (const file of listEnglishStageFiles()) {
  const enDoc = loadStage(`${STAGES_DIR}/${file}`);
  const ruPath = localizedPath(file, 'ru');
  if (!fs.existsSync(ruPath)) continue;

  const ruDoc = loadStage(ruPath);
  const errors = compareShape(translationPayload(enDoc), translationPayload(ruDoc));

  if (errors.length > 0) {
    failed = true;
    for (const error of errors) console.error(`${ruPath}: ${error}`);
  }
}

if (failed) process.exit(1);
console.log('i18n parity ok');