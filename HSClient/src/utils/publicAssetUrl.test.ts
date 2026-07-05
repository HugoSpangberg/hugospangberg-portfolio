import { afterEach, describe, expect, it, vi } from 'vitest';
import { publicAssetUrl } from './publicAssetUrl';

describe('publicAssetUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('resolves public assets from the local development root', () => {
    vi.stubEnv('BASE_URL', '/');

    expect(publicAssetUrl('models/ai-core/ai-core.glb')).toBe('/models/ai-core/ai-core.glb');
    expect(publicAssetUrl('/documents/Hugo-Spangberg-CV-2026.pdf')).toBe(
      '/documents/Hugo-Spangberg-CV-2026.pdf',
    );
  });

  it('resolves public assets from the GitHub Pages base path', () => {
    vi.stubEnv('BASE_URL', '/hugospangberg-portfolio/');

    expect(publicAssetUrl('models/ai-core/ai-core.glb')).toBe(
      '/hugospangberg-portfolio/models/ai-core/ai-core.glb',
    );
    expect(publicAssetUrl('documents/Hugo-Spangberg-CV-2026.pdf')).toBe(
      '/hugospangberg-portfolio/documents/Hugo-Spangberg-CV-2026.pdf',
    );
  });
});
