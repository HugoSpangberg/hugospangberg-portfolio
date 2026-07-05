import type * as Three from 'three';

export type TreeHandle = {
  id: string;
  group: Three.Group;
  sensorPosition: Three.Vector3;
};

export function createTree(
  THREE: typeof Three,
  id: string,
  position: Three.Vector3,
  scale: number,
  materials: {
    trunk: Three.Material;
    needles: Three.Material;
    needlesDark: Three.Material;
    sensor: Three.Material;
  },
): TreeHandle {
  const group = new THREE.Group();
  group.name = id;
  group.position.copy(position);
  group.scale.setScalar(scale);
  group.userData = { kind: 'tree', id };

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.72, 5), materials.trunk);
  trunk.position.y = 0.36;
  trunk.userData = group.userData;
  group.add(trunk);

  const lower = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.9, 5), materials.needlesDark);
  lower.position.y = 0.92;
  lower.userData = group.userData;

  const upper = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.76, 5), materials.needles);
  upper.position.y = 1.38;
  upper.rotation.y = Math.PI / 5;
  upper.userData = group.userData;

  const node = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), materials.sensor);
  node.position.set(0.28, 1.28, 0.04);
  node.userData = { kind: 'sensor', id, target: 'tree' };

  group.add(lower, upper, node);

  const sensorPosition = position.clone().add(new THREE.Vector3(0.28 * scale, 1.28 * scale, 0.04 * scale));

  return { id, group, sensorPosition };
}
