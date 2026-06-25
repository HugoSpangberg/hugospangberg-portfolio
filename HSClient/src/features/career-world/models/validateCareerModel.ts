import type * as Three from 'three';

export function collectSceneNodes(root: Three.Object3D) {
  const nodes = new Map<string, Three.Object3D>();
  root.traverse((object) => {
    if (object.name) {
      nodes.set(object.name, object);
    }
  });
  return nodes;
}

export function validateRequiredNodes(root: Three.Object3D, requiredNodes: string[]) {
  const nodes = collectSceneNodes(root);
  const missingNodes = requiredNodes.filter((nodeName) => !nodes.has(nodeName));

  if (missingNodes.length > 0) {
    throw new Error(`Missing required GLB nodes: ${missingNodes.join(', ')}`);
  }

  return nodes;
}
