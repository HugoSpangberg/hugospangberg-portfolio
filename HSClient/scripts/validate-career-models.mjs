import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const manifestPath = path.resolve('public/models/career-world/manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const errors = [];

for (const landmark of manifest.landmarks ?? []) {
  if (!landmark.id || !landmark.file) {
    errors.push('Every landmark must have id and file.');
    continue;
  }

  if (!Array.isArray(landmark.requiredNodes) || landmark.requiredNodes.length === 0) {
    errors.push(`${landmark.id} must declare requiredNodes.`);
  }

  const modelPath = path.resolve('public/models/career-world', landmark.file);
  try {
    await access(modelPath);
    const fileStat = await stat(modelPath);
    if (fileStat.size > 1_500_000) {
      errors.push(`${landmark.file} is ${fileStat.size} bytes, above the preferred 1.5 MB budget.`);
    }
  } catch {
    if (manifest.fallback !== 'procedural') {
      errors.push(`${landmark.file} is missing and manifest fallback is not procedural.`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Career world model manifest is valid. Missing GLBs are allowed while procedural fallback is active.');
