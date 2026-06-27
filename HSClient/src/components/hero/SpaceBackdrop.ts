import type * as Three from 'three';

function createRidgeLayer(
  THREE: typeof Three,
  name: string,
  color: number,
  opacity: number,
  z: number,
  y: number,
  scaleY: number,
  scaleX: number,
) {
  const points = [
    [-7.0, -1.1],
    [-7.0, -0.32],
    [-5.8, -0.08],
    [-4.7, -0.34],
    [-3.2, 0.05],
    [-2.1, -0.2],
    [-0.6, 0.02],
    [0.9, -0.28],
    [2.1, 0.03],
    [3.6, -0.22],
    [4.8, -0.02],
    [6.2, -0.34],
    [7.0, -0.12],
    [7.0, -1.1],
  ];

  const shape = new THREE.Shape();
  points.forEach(([x, pointY], index) => {
    if (index === 0) {
      shape.moveTo(x, pointY);
    } else {
      shape.lineTo(x, pointY);
    }
  });

  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
    }),
  );
  mesh.name = name;
  mesh.position.set(0, y, z);
  mesh.scale.x = scaleX;
  mesh.scale.y = scaleY;
  mesh.renderOrder = -10;
  return mesh;
}

export function createSpaceBackdrop(THREE: typeof Three, compact: boolean) {
  const group = new THREE.Group();
  group.name = 'AtmosphericCareerWorldBackdrop';

  const farRidge = createRidgeLayer(
    THREE,
    'Backdrop_FarForestRidge',
    0x1f4a3f,
    compact ? 0.065 : 0.075,
    -7.4,
    compact ? -1.38 : -1.1,
    compact ? 0.72 : 0.78,
    compact ? 1.25 : 1.5,
  );
  const nearRidge = createRidgeLayer(
    THREE,
    'Backdrop_NearForestRidge',
    0x12342d,
    compact ? 0.095 : 0.11,
    -6.35,
    compact ? -1.52 : -1.28,
    compact ? 0.82 : 0.9,
    compact ? 1.1 : 1.35,
  );

  group.add(farRidge, nearRidge);
  return group;
}
