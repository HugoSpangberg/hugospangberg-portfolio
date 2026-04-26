import type * as Three from 'three';

export type SensorHandle = {
  id: string;
  mesh: Three.Mesh;
  position: Three.Vector3;
};

export function createSensorNode(
  THREE: typeof Three,
  id: string,
  position: Three.Vector3,
  material: Three.Material,
): SensorHandle {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), material);
  mesh.position.copy(position);
  mesh.userData = { kind: 'sensor', id, target: 'ground' };

  return { id, mesh, position: position.clone() };
}
