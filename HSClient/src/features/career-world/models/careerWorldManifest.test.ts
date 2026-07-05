import { describe, expect, it } from 'vitest';
import {
  getCareerWorldModelUrl,
  isCareerWorldManifest,
} from './careerWorldManifest';

describe('careerWorldManifest', () => {
  it('builds model URLs from the public career-world directory', () => {
    expect(getCareerWorldModelUrl('filmstaden.glb')).toBe('/models/career-world/filmstaden.glb');
  });

  it('accepts the generated manifest shape', () => {
    expect(
      isCareerWorldManifest({
        version: 1,
        generatedBy: 'test',
        fallback: 'procedural',
        environment: {
          file: 'career-world-environment.glb',
          requiredNodes: ['Anchor_Filmstaden'],
        },
        landmarks: [
          {
            id: 'filmstaden',
            file: 'filmstaden.glb',
            rootNode: 'LM_Filmstaden_Root',
            requiredNodes: ['Anchor_Hotspot'],
            animations: [],
          },
        ],
      }),
    ).toBe(true);
  });

  it('rejects manifests without procedural fallback metadata', () => {
    expect(
      isCareerWorldManifest({
        version: 1,
        environment: {
          file: 'career-world-environment.glb',
          requiredNodes: [],
        },
        landmarks: [],
      }),
    ).toBe(false);
  });
});
