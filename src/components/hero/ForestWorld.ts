import type * as Three from 'three';
import { createDataPulse, type PulseHandle } from './DataPulse';
import { createForestMachine, type MachineHandle } from './ForestMachine';
import { createSensorNode, type SensorHandle } from './SensorNode';
import { createTree, type TreeHandle } from './Tree';

export type ForestWorldHandle = {
  group: Three.Group;
  depthLayers: Three.Group[];
  machine: MachineHandle;
  trees: TreeHandle[];
  sensors: SensorHandle[];
  pulses: PulseHandle[];
  interactives: Three.Object3D[];
  systemNode: Three.Mesh;
  selectionMarker: Three.Mesh;
};

function createTreeLayer(
  THREE: typeof Three,
  count: number,
  z: number,
  y: number,
  scale: number,
  material: Three.Material,
) {
  const layer = new THREE.Group();
  const geometry = new THREE.ConeGeometry(0.36, 1.1, 5);

  for (let index = 0; index < count; index += 1) {
    const tree = new THREE.Mesh(geometry, material);
    const spread = 7.8;
    tree.position.set((index / Math.max(count - 1, 1) - 0.5) * spread, y, z + (Math.random() - 0.5) * 0.6);
    tree.scale.setScalar(scale * (0.72 + Math.random() * 0.6));
    tree.rotation.y = Math.random() * Math.PI;
    layer.add(tree);
  }

  return layer;
}

export function createForestWorld(THREE: typeof Three, compact: boolean): ForestWorldHandle {
  const group = new THREE.Group();
  const materials = {
    terrain: new THREE.MeshBasicMaterial({ color: 0x0d2d26 }),
    trunk: new THREE.MeshBasicMaterial({ color: 0x6b7659 }),
    needles: new THREE.MeshBasicMaterial({ color: 0x327564 }),
    needlesDark: new THREE.MeshBasicMaterial({ color: 0x245849 }),
    machineBody: new THREE.MeshBasicMaterial({ color: 0x3b7368 }),
    machineDark: new THREE.MeshBasicMaterial({ color: 0x07120f }),
    accent: new THREE.MeshBasicMaterial({ color: 0x77d8f7, transparent: true, opacity: 0.86 }),
    sensor: new THREE.MeshBasicMaterial({ color: 0x72f2a3, transparent: true, opacity: 0.92 }),
    line: new THREE.LineBasicMaterial({ color: 0x72f2a3, transparent: true, opacity: 0.24 }),
    dot: new THREE.MeshBasicMaterial({ color: 0x77d8f7, transparent: true, opacity: 0.9 }),
    forestBack: new THREE.MeshBasicMaterial({ color: 0x14352f, transparent: true, opacity: 0.28, depthWrite: false }),
    forestMid: new THREE.MeshBasicMaterial({ color: 0x1f4c42, transparent: true, opacity: 0.42, depthWrite: false }),
    forestFront: new THREE.MeshBasicMaterial({ color: 0x275f52, transparent: true, opacity: 0.5, depthWrite: false }),
    marker: new THREE.MeshBasicMaterial({ color: 0x77d8f7, transparent: true, opacity: 0.62, side: THREE.DoubleSide }),
  };

  const backgroundLayer = createTreeLayer(THREE, compact ? 8 : 14, -2.8, -0.35, 0.92, materials.forestBack);
  const midLayer = createTreeLayer(THREE, compact ? 7 : 12, -1.9, -0.55, 0.9, materials.forestMid);
  const foregroundLayer = createTreeLayer(THREE, compact ? 4 : 7, 0.62, -0.74, 0.72, materials.forestFront);
  group.add(backgroundLayer, midLayer, foregroundLayer);

  const terrain = new THREE.Mesh(new THREE.CylinderGeometry(4.7, 5.3, 0.22, 7), materials.terrain);
  terrain.position.set(0, -0.82, 0);
  terrain.rotation.y = Math.PI / 7;
  group.add(terrain);

  const treePositions = compact
    ? [
        [-2.3, -0.72, -0.8, 0.72],
        [-1.5, -0.68, -1.35, 0.92],
        [-0.6, -0.72, -0.55, 0.68],
        [0.6, -0.74, -1.1, 0.82],
        [2.45, -0.72, -1.28, 0.74],
      ]
    : [
        [-3.3, -0.72, -1.0, 0.82],
        [-2.55, -0.7, -1.65, 1.02],
        [-1.65, -0.72, -0.62, 0.74],
        [-0.9, -0.7, -1.52, 0.98],
        [0.25, -0.74, -0.86, 0.8],
        [2.65, -0.72, -1.42, 0.88],
        [3.35, -0.7, -0.66, 0.72],
      ];

  const trees = treePositions.map(([x, y, z, scale], index) =>
    createTree(
      THREE,
      `NFT-${204 + index}`,
      new THREE.Vector3(x, y, z),
      scale,
      {
        trunk: materials.trunk,
        needles: materials.needles,
        needlesDark: materials.needlesDark,
        sensor: materials.sensor,
      },
    ),
  );

  trees.forEach((tree) => group.add(tree.group));

  const machine = createForestMachine(THREE, {
    body: materials.machineBody,
    dark: materials.machineDark,
    accent: materials.accent,
    sensor: materials.sensor,
  });
  group.add(machine.group);

  const systemNode = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 16), materials.accent);
  systemNode.position.set(0.4, 2.35, -1.55);
  systemNode.userData = { kind: 'system', id: 'Cloud uplink' };
  group.add(systemNode);

  const sensors = [
    createSensorNode(THREE, 'Ground Node G-12', new THREE.Vector3(-2.15, -0.48, 0.35), materials.sensor),
    createSensorNode(THREE, 'Moisture Node M-04', new THREE.Vector3(2.45, -0.5, 0.0), materials.sensor),
    createSensorNode(THREE, 'Temperature Node T-08', new THREE.Vector3(-0.35, -0.43, 0.42), materials.sensor),
    createSensorNode(THREE, 'GPS Relay R-03', new THREE.Vector3(1.32, -0.39, -0.78), materials.sensor),
  ];
  sensors.forEach((sensor) => group.add(sensor.mesh));

  const selectionMarker = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.012, 8, 36), materials.marker);
  selectionMarker.rotation.x = Math.PI / 2;
  selectionMarker.position.set(0, -0.66, 0);
  selectionMarker.visible = false;
  group.add(selectionMarker);

  const pulseTargets = [
    ...trees.map((tree) => tree.sensorPosition),
    trees[1]?.sensorPosition,
    trees[3]?.sensorPosition,
    sensors[0]?.position,
    sensors[1]?.position,
    sensors[2]?.position,
    machine.sensorPosition,
  ].filter(Boolean) as Three.Vector3[];

  const pulses = pulseTargets.flatMap((target, index) => [
    createDataPulse(THREE, target, machine.sensorPosition, { line: materials.line, dot: materials.dot }, index * 0.17),
    createDataPulse(THREE, machine.sensorPosition, systemNode.position, { line: materials.line, dot: materials.dot }, index * 0.21),
  ]);
  pulses.push(
    createDataPulse(
      THREE,
      systemNode.position,
      new THREE.Vector3(1.35, 3.2, -2.85),
      { line: materials.line, dot: materials.dot },
      0.48,
    ),
  );

  pulses.forEach((pulse) => group.add(pulse.line, pulse.dot));

  const interactives = [
    machine.group,
    systemNode,
    ...trees.flatMap((tree) => tree.group.children),
    ...sensors.map((sensor) => sensor.mesh),
  ];

  return {
    group,
    depthLayers: [backgroundLayer, midLayer, foregroundLayer],
    machine,
    trees,
    sensors,
    pulses,
    interactives,
    systemNode,
    selectionMarker,
  };
}
