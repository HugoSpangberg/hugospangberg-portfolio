import type * as Three from 'three';

export function createSpaceBackdrop(THREE: typeof Three, compact: boolean) {
  const group = new THREE.Group();
  const starCount = compact ? 70 : 140;
  const positions = new Float32Array(starCount * 3);

  for (let index = 0; index < starCount; index += 1) {
    const stride = index * 3;
    positions[stride] = (Math.random() - 0.5) * 12;
    positions[stride + 1] = Math.random() * 5.8 + 0.1;
    positions[stride + 2] = -4.6 - Math.random() * 2.8;
  }

  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    starsGeometry,
    new THREE.PointsMaterial({
      color: 0xb9d6d0,
      size: 0.016,
      transparent: true,
      opacity: 0.56,
      depthWrite: false,
    }),
  );

  group.add(stars);
  return group;
}
