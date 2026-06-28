import type * as Three from 'three';

export function createSpaceBackdrop(THREE: typeof Three, _compact: boolean) {
  const group = new THREE.Group();
  group.name = 'EmptyCareerWorldBackdrop';
  return group;
}
