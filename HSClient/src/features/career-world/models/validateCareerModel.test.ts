import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { collectSceneNodes, validateRequiredNodes } from './validateCareerModel';

describe('validateCareerModel', () => {
  it('collects named nodes from a model hierarchy', () => {
    const root = new THREE.Group();
    const anchor = new THREE.Object3D();
    anchor.name = 'Anchor_Hotspot';
    root.add(anchor);

    expect(collectSceneNodes(root).has('Anchor_Hotspot')).toBe(true);
  });

  it('throws when a required node is missing', () => {
    const root = new THREE.Group();

    expect(() => validateRequiredNodes(root, ['Anchor_Hotspot'])).toThrow(
      'Missing required GLB nodes: Anchor_Hotspot',
    );
  });
});
