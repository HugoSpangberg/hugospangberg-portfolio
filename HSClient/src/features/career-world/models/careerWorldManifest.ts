import type { CareerWorldManifest } from './modelTypes';

const publicBaseUrl = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const CAREER_WORLD_MODEL_BASE_URL = `${publicBaseUrl}models/career-world`;

export function getCareerWorldModelUrl(file: string) {
  return `${CAREER_WORLD_MODEL_BASE_URL}/${encodeURIComponent(file)}`;
}

export function isCareerWorldManifest(value: unknown): value is CareerWorldManifest {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const manifest = value as Partial<CareerWorldManifest>;
  return (
    manifest.version === 1 &&
    manifest.fallback === 'procedural' &&
    Boolean(manifest.environment?.file) &&
    Array.isArray(manifest.environment?.requiredNodes) &&
    Array.isArray(manifest.landmarks)
  );
}

export async function fetchCareerWorldManifest(signal?: AbortSignal) {
  const response = await fetch(getCareerWorldModelUrl('manifest.json'), { signal });

  if (!response.ok) {
    throw new Error(`Career world manifest failed with ${response.status}`);
  }

  const manifest: unknown = await response.json();

  if (!isCareerWorldManifest(manifest)) {
    throw new Error('Career world manifest has an invalid shape.');
  }

  return manifest;
}
