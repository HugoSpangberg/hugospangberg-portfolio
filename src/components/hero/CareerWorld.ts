import type * as Three from 'three';
import { createDataPulse, type PulseHandle } from './DataPulse';
import { careerMapItems, type CareerMapItem } from './careerMap';

export type CareerWorldHotspot = {
  item: CareerMapItem;
  group: Three.Group;
  hitTarget: Three.Mesh;
  marker: Three.Mesh;
  beacon: Three.Mesh;
};

export type CareerWorldHandle = {
  group: Three.Group;
  depthLayers: Three.Group[];
  hotspots: CareerWorldHotspot[];
  pulses: PulseHandle[];
  interactives: Three.Object3D[];
  focusRing: Three.Mesh;
  systemCore: Three.Mesh;
  animatedNodes: Three.Mesh[];
};

type Materials = {
  terrain: Three.MeshStandardMaterial;
  terrainEdge: Three.MeshStandardMaterial;
  soil: Three.MeshStandardMaterial;
  path: Three.MeshStandardMaterial;
  pathGlow: Three.MeshBasicMaterial;
  stone: Three.MeshStandardMaterial;
  trunk: Three.MeshStandardMaterial;
  needles: Three.MeshStandardMaterial;
  needlesDark: Three.MeshStandardMaterial;
  needlesBlue: Three.MeshStandardMaterial;
  moss: Three.MeshStandardMaterial;
  dark: Three.MeshStandardMaterial;
  roof: Three.MeshStandardMaterial;
  glass: Three.MeshStandardMaterial;
  window: Three.MeshStandardMaterial;
  cyan: Three.MeshStandardMaterial;
  aurora: Three.MeshStandardMaterial;
  warm: Three.MeshStandardMaterial;
  violet: Three.MeshStandardMaterial;
  metal: Three.MeshStandardMaterial;
  line: Three.LineBasicMaterial;
  dot: Three.MeshStandardMaterial;
  invisible: Three.MeshBasicMaterial;
  marker: Three.MeshBasicMaterial;
  forestBack: Three.MeshBasicMaterial;
  forestMid: Three.MeshBasicMaterial;
};

function standard(
  THREE: typeof Three,
  color: number,
  options: Partial<Three.MeshStandardMaterialParameters> = {},
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.74,
    metalness: 0.04,
    ...options,
  });
}

function makeMaterials(THREE: typeof Three): Materials {
  return {
    terrain: standard(THREE, 0x0d2b25, { roughness: 0.92 }),
    terrainEdge: standard(THREE, 0x06110e, { roughness: 0.86 }),
    soil: standard(THREE, 0x182b23, { roughness: 0.94 }),
    path: standard(THREE, 0x254139, { roughness: 0.9 }),
    pathGlow: new THREE.MeshBasicMaterial({
      color: 0x77d8f7,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    }),
    stone: standard(THREE, 0x52645d, { roughness: 0.88 }),
    trunk: standard(THREE, 0x5e6b55, { roughness: 0.9 }),
    needles: standard(THREE, 0x2f745f, { roughness: 0.85 }),
    needlesDark: standard(THREE, 0x1f5144, { roughness: 0.9 }),
    needlesBlue: standard(THREE, 0x275f5d, { roughness: 0.85 }),
    moss: standard(THREE, 0x7f9f73, { roughness: 0.82 }),
    dark: standard(THREE, 0x081511, { roughness: 0.7 }),
    roof: standard(THREE, 0x15302b, { roughness: 0.76 }),
    glass: standard(THREE, 0x183a36, { roughness: 0.38, metalness: 0.12 }),
    window: standard(THREE, 0x7fdcf3, {
      roughness: 0.34,
      metalness: 0.08,
      emissive: 0x3aa9bd,
      emissiveIntensity: 0.38,
    }),
    cyan: standard(THREE, 0x77d8f7, {
      roughness: 0.42,
      metalness: 0.18,
      emissive: 0x226d83,
      emissiveIntensity: 0.48,
    }),
    aurora: standard(THREE, 0x72f2a3, {
      roughness: 0.45,
      emissive: 0x2ca767,
      emissiveIntensity: 0.42,
    }),
    warm: standard(THREE, 0xf1d48d, {
      roughness: 0.48,
      emissive: 0x8d6424,
      emissiveIntensity: 0.36,
    }),
    violet: standard(THREE, 0xbda5ff, {
      roughness: 0.5,
      emissive: 0x4c3488,
      emissiveIntensity: 0.28,
    }),
    metal: standard(THREE, 0x5d716d, { roughness: 0.46, metalness: 0.38 }),
    line: new THREE.LineBasicMaterial({ color: 0x77d8f7, transparent: true, opacity: 0.24 }),
    dot: standard(THREE, 0x72f2a3, {
      emissive: 0x36b36e,
      emissiveIntensity: 0.72,
    }),
    invisible: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    marker: new THREE.MeshBasicMaterial({
      color: 0x77d8f7,
      transparent: true,
      opacity: 0.58,
      side: THREE.DoubleSide,
    }),
    forestBack: new THREE.MeshBasicMaterial({ color: 0x14352f, transparent: true, opacity: 0.22, depthWrite: false }),
    forestMid: new THREE.MeshBasicMaterial({ color: 0x1f4c42, transparent: true, opacity: 0.34, depthWrite: false }),
  };
}

function createIsland(THREE: typeof Three, materials: Materials) {
  const group = new THREE.Group();
  const points = [
    [-3.35, -0.55],
    [-2.55, -1.95],
    [-0.9, -2.35],
    [0.78, -2.05],
    [2.7, -1.65],
    [3.35, -0.35],
    [2.85, 1.25],
    [1.18, 2.1],
    [-0.62, 2.28],
    [-2.35, 1.55],
    [-3.28, 0.45],
  ];

  const shape = new THREE.Shape();
  points.forEach(([x, z], index) => {
    if (index === 0) {
      shape.moveTo(x, z);
    } else {
      const [previousX, previousZ] = points[index - 1];
      shape.quadraticCurveTo(previousX, previousZ, (previousX + x) / 2, (previousZ + z) / 2);
    }
  });
  const [lastX, lastZ] = points[points.length - 1];
  const [firstX, firstZ] = points[0];
  shape.quadraticCurveTo(lastX, lastZ, firstX, firstZ);

  const terrain = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.32,
      bevelEnabled: true,
      bevelSize: 0.12,
      bevelThickness: 0.08,
      bevelSegments: 3,
      steps: 1,
    }),
    [materials.terrain, materials.terrainEdge],
  );
  terrain.rotation.x = Math.PI / 2;
  terrain.position.y = -0.86;
  terrain.position.z = 0.08;
  group.add(terrain);

  const terraces = [
    [-1.2, -0.58, -1.28, 0.92, 0.52, -0.2],
    [1.44, -0.57, -0.92, 0.82, 0.5, 0.18],
    [-2.08, -0.57, 0.1, 0.78, 0.48, 0.1],
    [0.1, -0.56, 1.42, 0.9, 0.48, -0.04],
    [1.74, -0.57, 0.86, 0.72, 0.42, 0.22],
    [0.02, -0.56, -0.18, 0.62, 0.42, 0],
  ];

  terraces.forEach(([x, y, z, width, depth, rotation]) => {
    const terrace = new THREE.Mesh(new THREE.CylinderGeometry(width, width * 1.04, 0.055, 14), materials.soil);
    terrace.position.set(x, y, z);
    terrace.scale.z = depth;
    terrace.rotation.set(Math.PI / 2, 0, rotation);
    group.add(terrace);
  });

  const mist = new THREE.Mesh(
    new THREE.RingGeometry(2.95, 3.65, 80),
    new THREE.MeshBasicMaterial({
      color: 0x77d8f7,
      transparent: true,
      opacity: 0.045,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  mist.rotation.x = Math.PI / 2;
  mist.position.y = -0.66;
  group.add(mist);

  return group;
}

function createTree(
  THREE: typeof Three,
  materials: Materials,
  x: number,
  z: number,
  scale: number,
  variant: number,
  withSensor = false,
) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.075, 0.48, 7), materials.trunk);
  trunk.position.y = -0.36;
  trunk.rotation.z = variant % 2 === 0 ? 0.04 : -0.035;
  tree.add(trunk);

  const layers = variant === 2 ? 4 : 3;
  for (let index = 0; index < layers; index += 1) {
    const radius = 0.32 - index * 0.055 + (variant === 1 ? 0.035 : 0);
    const height = 0.42 - index * 0.035;
    const foliage = new THREE.Mesh(
      new THREE.ConeGeometry(radius, height, 6),
      index % 2 === 0 ? materials.needlesDark : materials.needles,
    );
    foliage.position.y = -0.14 + index * 0.22;
    foliage.rotation.y = index * 0.52 + variant * 0.3;
    tree.add(foliage);
  }

  if (withSensor) {
    const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), materials.aurora);
    sensor.position.set(0.14, 0.2, 0.08);
    tree.add(sensor);
  }

  tree.position.set(x, -0.34, z);
  tree.scale.setScalar(scale);
  tree.rotation.y = (x * 1.7 + z * 0.6) % Math.PI;
  tree.rotation.z = variant === 3 ? 0.045 : 0;
  return tree;
}

function createTreeLayer(
  THREE: typeof Three,
  count: number,
  z: number,
  material: Three.Material,
) {
  const layer = new THREE.Group();
  const geometry = new THREE.ConeGeometry(0.36, 1.1, 6);

  for (let index = 0; index < count; index += 1) {
    const tree = new THREE.Mesh(geometry, material);
    const spread = 8.4;
    const wave = Math.sin(index * 1.7) * 0.18;
    tree.position.set((index / Math.max(count - 1, 1) - 0.5) * spread, -0.42, z + wave);
    tree.scale.setScalar(0.72 + ((index * 17) % 7) * 0.08);
    tree.rotation.y = index * 0.72;
    layer.add(tree);
  }

  return layer;
}

function createGroundDetails(THREE: typeof Three, materials: Materials) {
  const group = new THREE.Group();
  const rocks = [
    [-2.75, -0.62, -0.62, 0.09],
    [-1.85, -0.61, 1.18, 0.07],
    [-0.65, -0.61, -1.88, 0.06],
    [1.1, -0.61, -1.62, 0.08],
    [2.3, -0.61, 0.38, 0.07],
    [0.98, -0.61, 1.65, 0.06],
  ];

  rocks.forEach(([x, y, z, scale], index) => {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(scale, 0), materials.stone);
    rock.position.set(x, y, z);
    rock.rotation.set(index * 0.3, index * 0.6, index * 0.2);
    group.add(rock);
  });

  const bushes = [
    [-2.55, -0.55, 0.92, 0.08],
    [-1.52, -0.55, -1.7, 0.07],
    [-0.22, -0.55, 1.92, 0.06],
    [1.9, -0.55, -1.42, 0.075],
    [2.52, -0.55, 0.92, 0.06],
  ];

  bushes.forEach(([x, y, z, scale], index) => {
    const bush = new THREE.Group();
    for (let leaf = 0; leaf < 3; leaf += 1) {
      const tuft = new THREE.Mesh(
        new THREE.DodecahedronGeometry(scale * (1 - leaf * 0.08), 0),
        leaf % 2 === 0 ? materials.needlesDark : materials.moss,
      );
      tuft.position.set((leaf - 1) * scale * 0.8, leaf * scale * 0.18, Math.sin(leaf + index) * scale * 0.35);
      bush.add(tuft);
    }
    bush.position.set(x, y, z);
    bush.rotation.y = index * 0.65;
    group.add(bush);
  });

  const logs = [
    [-1.78, -0.54, -1.48, 0.38, 0.04, 0.6],
    [-0.72, -0.54, -1.82, 0.3, 0.035, -0.35],
  ];

  logs.forEach(([x, y, z, length, radius, rotation]) => {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 8), materials.trunk);
    log.position.set(x, y, z);
    log.rotation.set(Math.PI / 2, 0, rotation);
    group.add(log);
  });

  return group;
}

function createLabelSign(
  THREE: typeof Three,
  label: 'Visma' | 'Cinema' | 'Dasa' | 'Learning',
  material: Three.Material,
) {
  const group = new THREE.Group();
  const widths = { Visma: 0.42, Cinema: 0.56, Dasa: 0.42, Learning: 0.62 };
  const plate = new THREE.Mesh(new THREE.BoxGeometry(widths[label], 0.09, 0.025), material);
  plate.position.y = 0.03;
  const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.18, 6), material);
  const rightPost = leftPost.clone();
  leftPost.position.set(-widths[label] * 0.38, -0.1, 0);
  rightPost.position.set(widths[label] * 0.38, -0.1, 0);
  group.add(plate, leftPost, rightPost);
  return group;
}

function createTextLabel(
  THREE: typeof Three,
  text: string,
  color = '#b7f4d6',
  width = 0.72,
) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(6, 17, 14, 0.72)';
    context.strokeStyle = 'rgba(119, 216, 247, 0.28)';
    context.lineWidth = 4;
    roundRect(context, 18, 28, 476, 72, 18);
    context.fill();
    context.stroke();
    context.fillStyle = color;
    context.font = '700 42px Inter, Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(width, width * 0.25),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  label.rotation.x = -0.18;
  return label;
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function createForestMachine(THREE: typeof Three, materials: Materials) {
  const machine = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.28), materials.moss);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), materials.glass);
  cabin.position.set(0.14, 0.2, -0.02);
  machine.add(base, cabin);

  [-0.2, 0.2].forEach((x) => {
    [-0.16, 0.16].forEach((z) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.055, 12), materials.dark);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, -0.12, z);
      machine.add(wheel);
    });
  });

  const armA = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.045, 0.045), materials.metal);
  armA.position.set(-0.28, 0.2, 0);
  armA.rotation.z = -0.34;
  const armB = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.04), materials.metal);
  armB.position.set(-0.58, 0.03, 0);
  armB.rotation.z = 0.46;
  const claw = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.009, 6, 18, Math.PI * 1.25), materials.cyan);
  claw.position.set(-0.72, -0.04, 0);
  claw.rotation.set(Math.PI / 2, 0, -0.4);
  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), materials.aurora);
  sensor.position.set(0.31, 0.18, 0.13);
  machine.add(armA, armB, claw, sensor);
  machine.position.set(0.34, -0.35, 0.44);
  machine.rotation.y = -0.34;
  return machine;
}

function createForestArea(THREE: typeof Three, materials: Materials) {
  const group = new THREE.Group();
  const positions = [
    [-0.72, -0.48, 0.92, 0],
    [-0.98, -0.08, 1.14, 1],
    [-0.42, 0.08, 0.86, 2],
    [0.05, -0.38, 0.84, 3],
    [0.42, 0.02, 0.74, 1],
    [-0.62, 0.38, 0.82, 2],
    [0.0, 0.46, 0.96, 0],
    [0.58, 0.36, 0.68, 3],
  ];

  positions.forEach(([x, z, scale, variant], index) =>
    group.add(createTree(THREE, materials, x, z, scale, variant, index % 3 === 1)),
  );
  const label = createTextLabel(THREE, 'Södra', '#72f2a3', 0.66);
  label.position.set(-0.24, 0.92, 0.18);
  const forestLight = new THREE.PointLight(0x72f2a3, 0.34, 1.8);
  forestLight.position.set(0.1, 0.3, 0.2);
  const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.12, 8), materials.trunk);
  stump.position.set(-0.24, -0.45, 0.58);
  const stumpTop = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.075, 0.012, 8), materials.soil);
  stumpTop.position.set(-0.24, -0.38, 0.58);
  group.add(createForestMachine(THREE, materials), stump, stumpTop, label, forestLight);
  return group;
}

function createTechHub(THREE: typeof Three, materials: Materials) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.56, 0.18, 8), materials.dark);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.42, 0.5), materials.glass);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.12, 6), materials.roof);
  body.position.y = 0.2;
  roof.position.y = 0.48;
  roof.rotation.y = Math.PI / 6;
  group.add(base, body, roof);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.72, 8), materials.metal);
  mast.position.set(0.25, 0.88, -0.05);
  const dish = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.01, 6, 24), materials.cyan);
  dish.position.set(0.25, 1.2, -0.05);
  dish.rotation.set(0.7, 0.2, 0);
  const signalA = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.006, 6, 36), materials.marker);
  const signalB = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.006, 6, 42), materials.marker);
  signalA.position.copy(dish.position);
  signalB.position.copy(dish.position);
  signalA.rotation.set(0.7, 0.2, 0);
  signalB.rotation.set(0.7, 0.2, 0);
  group.add(mast, dish, signalA, signalB);

  for (let index = 0; index < 5; index += 1) {
    const angle = (index / 5) * Math.PI * 2;
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), materials.aurora);
    node.position.set(Math.cos(angle) * 0.54, 0.12, Math.sin(angle) * 0.54);
    group.add(node);
  }

  const sign = createLabelSign(THREE, 'Dasa', materials.cyan);
  sign.position.set(-0.03, 0.18, 0.28);
  const panelA = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.014), materials.window);
  panelA.position.set(-0.19, 0.24, 0.26);
  const panelB = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.014), materials.aurora);
  panelB.position.set(0.18, 0.23, 0.26);
  const label = createTextLabel(THREE, 'Dasa IoT', '#77d8f7', 0.78);
  label.position.set(-0.03, 0.8, 0.34);
  group.add(sign, panelA, panelB, label, new THREE.PointLight(0x77d8f7, 0.45, 1.8));
  return group;
}

function createOfficeBuilding(THREE: typeof Three, materials: Materials) {
  const group = new THREE.Group();
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.78, 0.48), materials.glass);
  const right = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.04, 0.42), materials.glass);
  left.position.set(-0.18, 0.28, 0);
  right.position.set(0.22, 0.4, -0.03);
  group.add(left, right);

  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const pane = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.05, 0.014), materials.window);
      pane.position.set(-0.34 + col * 0.18, 0.02 + row * 0.18, 0.248);
      group.add(pane);
    }
  }

  for (let row = 0; row < 5; row += 1) {
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.052, 0.014), materials.window);
    pane.position.set(0.22, 0.02 + row * 0.18, 0.188);
    group.add(pane);
  }

  const entrance = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.018), materials.dark);
  entrance.position.set(-0.18, -0.08, 0.254);
  const walkway = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.012, 0.44), materials.path);
  walkway.position.set(-0.18, -0.13, 0.46);
  const sign = createLabelSign(THREE, 'Visma', materials.aurora);
  sign.position.set(0.01, 0.84, 0.24);
  const label = createTextLabel(THREE, 'Visma', '#b7f4d6', 0.68);
  label.position.set(0.02, 1.08, 0.22);
  const lobbyLight = new THREE.PointLight(0x77d8f7, 0.35, 1.4);
  lobbyLight.position.set(-0.18, 0.22, 0.4);
  const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.035, 0.52), materials.metal);
  roofTrim.position.set(0.02, 0.94, -0.02);
  group.add(entrance, walkway, sign, label, roofTrim, lobbyLight);
  return group;
}

function createCinemaBuilding(THREE: typeof Three, materials: Materials) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 0.5), materials.dark);
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.42), materials.glass);
  const marquee = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.11, 0.08), materials.warm);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.15, 0.016), materials.glass);
  body.position.y = 0.04;
  side.position.set(0.28, 0.07, -0.02);
  marquee.position.set(0, 0.33, 0.28);
  screen.position.set(-0.05, 0.08, 0.26);
  group.add(body, side, marquee, screen);

  [-0.32, -0.12].forEach((x, index) => {
    const poster = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.014), index === 0 ? materials.warm : materials.window);
    poster.position.set(x, 0.02, 0.268);
    group.add(poster);
  });

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.018), materials.window);
  door.position.set(0.24, -0.04, 0.265);
  group.add(door);

  for (let index = 0; index < 6; index += 1) {
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), materials.warm);
    light.position.set(-0.34 + index * 0.136, 0.35, 0.34);
    group.add(light);
  }

  const reel = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 6, 20), materials.warm);
  reel.position.set(-0.46, 0.33, 0.2);
  reel.rotation.y = Math.PI / 2;
  const sign = createLabelSign(THREE, 'Cinema', materials.warm);
  sign.position.set(0, 0.52, 0.22);
  const label = createTextLabel(THREE, 'Filmstaden', '#f1d48d', 0.88);
  label.position.set(0, 0.72, 0.24);
  const marqueeLight = new THREE.PointLight(0xf1d48d, 0.55, 1.8);
  marqueeLight.position.set(0, 0.42, 0.55);
  group.add(reel, sign, label, marqueeLight);
  return group;
}

function createEducationZone(THREE: typeof Three, materials: Materials) {
  const group = new THREE.Group();
  const studio = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.34, 0.52), materials.glass);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.58), materials.violet);
  studio.position.y = 0.07;
  roof.position.y = 0.29;
  group.add(studio, roof);

  const board = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.018), materials.window);
  board.position.set(-0.18, 0.12, 0.272);
  const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.235, 0.01), materials.metal);
  boardFrame.position.set(-0.18, 0.12, 0.264);
  const bookA = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.13), materials.violet);
  const bookB = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.13), materials.aurora);
  bookA.position.set(0.22, -0.1, 0.18);
  bookA.rotation.y = 0.28;
  bookB.position.set(0.3, -0.05, 0.08);
  bookB.rotation.y = -0.18;
  const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 0), materials.violet);
  node.position.set(0.38, 0.53, -0.18);
  const sign = createLabelSign(THREE, 'Learning', materials.violet);
  sign.position.set(0.04, 0.45, 0.22);
  const label = createTextLabel(THREE, 'Learning', '#c4a5ff', 0.82);
  label.position.set(0.04, 0.66, 0.24);
  const studioLight = new THREE.PointLight(0xc4a5ff, 0.38, 1.6);
  studioLight.position.set(0.18, 0.32, 0.42);
  const monitorStand = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.12, 6), materials.metal);
  monitorStand.position.set(-0.18, -0.06, 0.26);
  group.add(boardFrame, board, monitorStand, bookA, bookB, node, sign, label, studioLight);
  return group;
}

function createHotspot(
  THREE: typeof Three,
  item: CareerMapItem,
  content: Three.Group,
  materials: Materials,
) {
  const group = new THREE.Group();
  group.position.set(...item.position);
  group.add(content);

  const markerMaterial = new THREE.MeshBasicMaterial({
    color: item.accent,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
  });
  const marker = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.009, 8, 54), markerMaterial);
  marker.rotation.x = Math.PI / 2;
  marker.position.y = -0.08;
  group.add(marker);

  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 10),
    new THREE.MeshBasicMaterial({
      color: item.accent,
      transparent: true,
      opacity: 0.82,
    }),
  );
  beacon.position.y = 0.95;
  group.add(beacon);

  const hoverHalo = new THREE.Mesh(
    new THREE.RingGeometry(0.12, 0.18, 28),
    new THREE.MeshBasicMaterial({
      color: item.accent,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  hoverHalo.rotation.x = Math.PI / 2;
  hoverHalo.position.y = 0.95;
  group.add(hoverHalo);

  const hitTarget = new THREE.Mesh(new THREE.BoxGeometry(1.32, 1.45, 1.32), materials.invisible);
  hitTarget.position.y = 0.2;
  hitTarget.userData = { kind: 'career-hotspot', id: item.id };
  group.add(hitTarget);

  return { item, group, hitTarget, marker, beacon };
}

function createPath(THREE: typeof Three, materials: Materials) {
  const group = new THREE.Group();
  const points = [
    new THREE.Vector3(0.02, -0.57, -0.18),
    new THREE.Vector3(-1.1, -0.57, -1.0),
    new THREE.Vector3(1.22, -0.57, -0.8),
    new THREE.Vector3(-1.72, -0.57, 0.1),
    new THREE.Vector3(0.08, -0.57, 1.08),
    new THREE.Vector3(1.48, -0.57, 0.72),
  ];

  points.slice(1).forEach((target, index) => {
    const source = points[0];
    const mid = source.clone().lerp(target, 0.5);
    const length = source.distanceTo(target);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.012, length), materials.path);
    strip.position.copy(mid);
    strip.rotation.y = Math.atan2(target.x - source.x, target.z - source.z);
    strip.position.y = -0.58 + index * 0.002;
    const glow = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.014, length * 0.92), materials.pathGlow);
    glow.position.copy(strip.position);
    glow.position.y += 0.01;
    glow.rotation.copy(strip.rotation);
    group.add(strip, glow);
  });

  return group;
}

export function createCareerWorld(THREE: typeof Three, compact: boolean): CareerWorldHandle {
  const materials = makeMaterials(THREE);
  const group = new THREE.Group();
  const depthLayers = [
    createTreeLayer(THREE, compact ? 9 : 16, -3.05, materials.forestBack),
    createTreeLayer(THREE, compact ? 7 : 13, -2.22, materials.forestMid),
  ];

  group.add(...depthLayers, createIsland(THREE, materials), createPath(THREE, materials), createGroundDetails(THREE, materials));

  const factoryById = {
    sodra: () => createForestArea(THREE, materials),
    dasa: () => createTechHub(THREE, materials),
    visma: () => createOfficeBuilding(THREE, materials),
    filmstaden: () => createCinemaBuilding(THREE, materials),
    education: () => createEducationZone(THREE, materials),
  };

  const hotspots = careerMapItems.map((item) =>
    createHotspot(THREE, item, factoryById[item.id as keyof typeof factoryById](), materials),
  );
  hotspots.forEach((hotspot) => group.add(hotspot.group));

  const coreBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.1, 8), materials.dark);
  coreBase.position.set(0.02, -0.54, -0.18);
  const systemCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), materials.cyan);
  systemCore.position.set(0.02, -0.27, -0.18);
  const coreHalo = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.008, 8, 48), materials.marker);
  coreHalo.rotation.x = Math.PI / 2;
  coreHalo.position.set(0.02, -0.4, -0.18);
  const coreLabel = createTextLabel(THREE, 'Career Hub', '#77d8f7', 0.82);
  coreLabel.position.set(0.02, 0.04, -0.18);
  group.add(coreBase, systemCore, coreHalo, coreLabel);

  const focusRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.014, 8, 56), materials.marker);
  focusRing.rotation.x = Math.PI / 2;
  focusRing.position.set(0, -0.58, 0);
  focusRing.visible = false;
  group.add(focusRing);

  const pulses = hotspots.flatMap((hotspot, index) => [
    createDataPulse(
      THREE,
      new THREE.Vector3(...hotspot.item.position).add(new THREE.Vector3(0, 0.45, 0)),
      systemCore.position,
      { line: materials.line, dot: materials.dot },
      index * 0.14,
    ),
  ]);
  pulses.push(
    createDataPulse(
      THREE,
      systemCore.position,
      new THREE.Vector3(1.35, 3.2, -2.85),
      { line: materials.line, dot: materials.dot },
      0.48,
    ),
  );
  pulses.forEach((pulse) => group.add(pulse.line, pulse.dot));

  const interactives = hotspots.map((hotspot) => hotspot.hitTarget);
  const animatedNodes = [systemCore, coreHalo, ...hotspots.flatMap((hotspot) => [hotspot.marker, hotspot.beacon])];

  return {
    group,
    depthLayers,
    hotspots,
    pulses,
    interactives,
    focusRing,
    systemCore,
    animatedNodes,
  };
}
