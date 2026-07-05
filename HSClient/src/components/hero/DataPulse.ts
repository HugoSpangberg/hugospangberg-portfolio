import type * as Three from 'three';

export type PulseHandle = {
  line: Three.Line;
  dot: Three.Mesh;
  from: Three.Vector3;
  to: Three.Vector3;
  offset: number;
};

export function createDataPulse(
  THREE: typeof Three,
  from: Three.Vector3,
  to: Three.Vector3,
  materials: {
    line: Three.Material;
    dot: Three.Material;
  },
  offset: number,
): PulseHandle {
  const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
  const line = new THREE.Line(geometry, materials.line);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), materials.dot);
  dot.position.copy(from);
  line.visible = false;
  dot.visible = false;

  return { line, dot, from, to, offset };
}

export function updateDataPulses(pulses: PulseHandle[], time: number, active: boolean) {
  pulses.forEach((pulse) => {
    const progress = active ? (time * 0.18 + pulse.offset) % 1 : pulse.offset % 1;
    pulse.dot.position.lerpVectors(pulse.from, pulse.to, progress);
    pulse.line.visible = active;
    pulse.dot.visible = active;
  });
}
