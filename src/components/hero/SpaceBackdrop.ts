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

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 24, 16),
    new THREE.MeshBasicMaterial({
      color: 0x9fb8b2,
      transparent: true,
      opacity: 0.28,
    }),
  );
  moon.position.set(2.9, 2.8, -4.2);

  const moonShade = new THREE.Mesh(
    new THREE.SphereGeometry(0.365, 24, 16),
    new THREE.MeshBasicMaterial({
      color: 0x06110e,
      transparent: true,
      opacity: 0.2,
    }),
  );
  moonShade.position.set(2.78, 2.88, -4.12);

  const planetGlow = new THREE.Mesh(
    new THREE.RingGeometry(0.48, 0.52, 32),
    new THREE.MeshBasicMaterial({
      color: 0x77d8f7,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    }),
  );
  planetGlow.position.copy(moon.position);
  planetGlow.rotation.set(0.2, 0.55, 0.2);

  const satellite = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 10, 10),
    new THREE.MeshBasicMaterial({
      color: 0x77d8f7,
      transparent: true,
      opacity: 0.72,
    }),
  );
  satellite.position.set(1.35, 3.2, -2.85);

  const uplink = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      satellite.position,
      new THREE.Vector3(0.05, 1.0, -0.62),
    ]),
    new THREE.LineBasicMaterial({
      color: 0x77d8f7,
      transparent: true,
      opacity: 0.12,
    }),
  );

  group.add(stars, moon, moonShade, planetGlow, satellite, uplink);
  return group;
}
