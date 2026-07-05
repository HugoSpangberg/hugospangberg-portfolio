import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const manifestPath = path.resolve('public/models/career-world/manifest.json');
const aiCoreGlbPath = path.resolve('public/models/ai-core/ai-core.glb');
const aiCorePosterPath = path.resolve('public/images/ai-core/ai-core-poster.png');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const errors = [];

if (manifest.version !== 1) {
  errors.push('Manifest version must be 1.');
}

if (!manifest.environment?.file) {
  errors.push('Manifest must declare an environment GLB.');
} else {
  const modelPath = path.resolve('public/models/career-world', manifest.environment.file);
  try {
    await access(modelPath);
    const fileStat = await stat(modelPath);
    if (fileStat.size > 2_000_000) {
      errors.push(`${manifest.environment.file} is ${fileStat.size} bytes, above the preferred 2 MB budget.`);
    }
  } catch {
    errors.push(`${manifest.environment.file} is missing.`);
  }

  const objects = new Set(manifest.environment.stats?.objects ?? []);
  for (const node of manifest.environment.requiredNodes ?? []) {
    if (!objects.has(node)) {
      errors.push(`Environment missing required node ${node}.`);
    }
  }
}

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

  const objects = new Set(landmark.stats?.objects ?? []);
  if (landmark.rootNode && !objects.has(landmark.rootNode)) {
    errors.push(`${landmark.id} is missing root node ${landmark.rootNode}.`);
  }

  for (const node of landmark.requiredNodes ?? []) {
    if (!objects.has(node)) {
      errors.push(`${landmark.id} is missing required node ${node}.`);
    }
  }

  if ((landmark.stats?.triangleCount ?? 0) <= 0) {
    errors.push(`${landmark.id} must report a positive triangle count.`);
  }
}

try {
  const aiCoreFile = await readFile(aiCoreGlbPath);
  const aiCoreStat = await stat(aiCoreGlbPath);
  const magic = aiCoreFile.subarray(0, 4).toString('utf8');

  if (magic !== 'glTF') {
    errors.push('ai-core.glb does not have a valid GLB header.');
  }

  if (aiCoreStat.size > 10_000_000) {
    errors.push(`ai-core.glb is ${aiCoreStat.size} bytes, above the preferred 10 MB budget.`);
  }
} catch {
  errors.push('ai-core.glb is missing.');
}

try {
  await access(aiCorePosterPath);
} catch {
  errors.push('ai-core poster fallback is missing.');
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Career world and AI-core runtime assets are valid.');
