import type * as Three from 'three';

export function createAurora(THREE: typeof Three) {
  const group = new THREE.Group();
  const colors = [0x72f2a3, 0x77d8f7, 0x8cae7e, 0xb7f4d6];

  colors.forEach((color, index) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6 - index * 0.35, 0.46, 18, 1),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: index === 0 ? 0.045 : 0.028,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
      }),
    );
    mesh.position.set(-1.2 + index * 0.62, 2.35 + index * 0.13, -4.35 - index * 0.18);
    mesh.rotation.set(0.28, 0.04, -0.14 - index * 0.055);
    group.add(mesh);
  });

  return group;
}
