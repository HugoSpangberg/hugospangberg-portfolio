import type * as Three from 'three';
import { createDataPulse, type PulseHandle } from './DataPulse';
import { careerMapItems, type CareerMapItem } from './careerMap';

export type CareerWorldHotspot = {
  item: CareerMapItem;
  group: Three.Group;
  content: Three.Group;
  hitTarget: Three.Mesh;
  marker: Three.Mesh;
  beacon: Three.Mesh;
  pulseRing: Three.Mesh;
  hoverHalo: Three.Mesh;
};

export type CareerWorldHandle = {
  group: Three.Group;
  proceduralBase: Three.Group;
  depthLayers: Three.Group[];
  hotspots: CareerWorldHotspot[];
  pulses: PulseHandle[];
  interactives: Three.Object3D[];
  focusRing: Three.Mesh;
  systemCore: Three.Mesh;
  animatedNodes: Three.Mesh[];
};

export type CareerWorldLabels = {
  hub: string;
  locations: Record<string, string>;
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
  sitePad: Three.MeshBasicMaterial;
  forestClearing: Three.MeshBasicMaterial;
  hubGlow: Three.MeshBasicMaterial;
  forestBack: Three.MeshBasicMaterial;
  forestMid: Three.MeshBasicMaterial;
  brick: Three.MeshStandardMaterial;
  brickDark: Three.MeshStandardMaterial;
  stoneLight: Three.MeshStandardMaterial;
  stoneDark: Three.MeshStandardMaterial;
  whiteFacade: Three.MeshStandardMaterial;
  orangeFacade: Three.MeshStandardMaterial;
  redMarquee: Three.MeshStandardMaterial;
  darkGlass: Three.MeshStandardMaterial;
  coolGlass: Three.MeshStandardMaterial;
  warmWindow: Three.MeshStandardMaterial;
  forestMachineGreen: Three.MeshStandardMaterial;
  forestMachineDark: Three.MeshStandardMaterial;
  hydraulicMetal: Three.MeshStandardMaterial;
  hydraulicYellow: Three.MeshStandardMaterial;
  sodraGreen: Three.MeshStandardMaterial;
  educationAccent: Three.MeshStandardMaterial;
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
    terrain: standard(THREE, 0x123a31, { roughness: 0.9 }),
    terrainEdge: standard(THREE, 0x0a1d18, { roughness: 0.86 }),
    soil: standard(THREE, 0x263b31, { roughness: 0.92 }),
    path: standard(THREE, 0x31514a, { roughness: 0.88 }),
    pathGlow: new THREE.MeshBasicMaterial({
      color: 0x77d8f7,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    }),
    stone: standard(THREE, 0x65776f, { roughness: 0.86 }),
    trunk: standard(THREE, 0x71805f, { roughness: 0.88 }),
    needles: standard(THREE, 0x3a876f, { roughness: 0.84 }),
    needlesDark: standard(THREE, 0x296556, { roughness: 0.88 }),
    needlesBlue: standard(THREE, 0x32716e, { roughness: 0.84 }),
    moss: standard(THREE, 0x7f9f73, { roughness: 0.82 }),
    dark: standard(THREE, 0x10251f, { roughness: 0.68 }),
    roof: standard(THREE, 0x1d433b, { roughness: 0.74 }),
    glass: standard(THREE, 0x224d48, { roughness: 0.36, metalness: 0.12 }),
    window: standard(THREE, 0x7fdcf3, {
      roughness: 0.34,
      metalness: 0.08,
      emissive: 0x3aa9bd,
      emissiveIntensity: 0.52,
    }),
    cyan: standard(THREE, 0x77d8f7, {
      roughness: 0.42,
      metalness: 0.18,
      emissive: 0x226d83,
      emissiveIntensity: 0.58,
    }),
    aurora: standard(THREE, 0x72f2a3, {
      roughness: 0.45,
      emissive: 0x2ca767,
      emissiveIntensity: 0.52,
    }),
    warm: standard(THREE, 0xf1d48d, {
      roughness: 0.48,
      emissive: 0x8d6424,
      emissiveIntensity: 0.46,
    }),
    violet: standard(THREE, 0xbda5ff, {
      roughness: 0.5,
      emissive: 0x4c3488,
      emissiveIntensity: 0.38,
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
    sitePad: new THREE.MeshBasicMaterial({
      color: 0x8aa99a,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    forestClearing: new THREE.MeshBasicMaterial({
      color: 0x294b3d,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    hubGlow: new THREE.MeshBasicMaterial({
      color: 0x77d8f7,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    forestBack: new THREE.MeshBasicMaterial({ color: 0x1b4a40, transparent: true, opacity: 0.26, depthWrite: false }),
    forestMid: new THREE.MeshBasicMaterial({ color: 0x2c6759, transparent: true, opacity: 0.38, depthWrite: false }),
    brick: standard(THREE, 0x7b3f34, { roughness: 0.88 }),
    brickDark: standard(THREE, 0x65372f, { roughness: 0.9 }),
    stoneLight: standard(THREE, 0xd7d2c8, { roughness: 0.86 }),
    stoneDark: standard(THREE, 0x8b8d88, { roughness: 0.88 }),
    whiteFacade: standard(THREE, 0xd8ddd9, { roughness: 0.78 }),
    orangeFacade: standard(THREE, 0xc66d3e, { roughness: 0.82 }),
    redMarquee: standard(THREE, 0xb8322a, {
      roughness: 0.58,
      emissive: 0x4c0c0a,
      emissiveIntensity: 0.2,
    }),
    darkGlass: standard(THREE, 0x102c2b, {
      roughness: 0.28,
      metalness: 0.16,
      emissive: 0x092a2b,
      emissiveIntensity: 0.16,
    }),
    coolGlass: standard(THREE, 0x244a4c, {
      roughness: 0.32,
      metalness: 0.12,
      emissive: 0x123d46,
      emissiveIntensity: 0.2,
    }),
    warmWindow: standard(THREE, 0xe6c885, {
      roughness: 0.36,
      emissive: 0x8b6427,
      emissiveIntensity: 0.5,
    }),
    forestMachineGreen: standard(THREE, 0x2e6a57, { roughness: 0.62, metalness: 0.08 }),
    forestMachineDark: standard(THREE, 0x121a18, { roughness: 0.54, metalness: 0.24 }),
    hydraulicMetal: standard(THREE, 0x2f3634, { roughness: 0.44, metalness: 0.48 }),
    hydraulicYellow: standard(THREE, 0xd5aa3d, { roughness: 0.52, metalness: 0.16 }),
    sodraGreen: standard(THREE, 0x4ea66f, {
      roughness: 0.5,
      emissive: 0x1c5c38,
      emissiveIntensity: 0.28,
    }),
    educationAccent: standard(THREE, 0xbda5ff, {
      roughness: 0.5,
      emissive: 0x46307f,
      emissiveIntensity: 0.2,
    }),
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

function addWindowGrid(
  THREE: typeof Three,
  target: Three.Group,
  {
    columns,
    rows,
    startX,
    startY,
    z,
    spacingX,
    spacingY,
    width,
    height,
    material,
    frameMaterial,
  }: {
    columns: number;
    rows: number;
    startX: number;
    startY: number;
    z: number;
    spacingX: number;
    spacingY: number;
    width: number;
    height: number;
    material: Three.Material;
    frameMaterial?: Three.Material;
  },
) {
  const paneGeometry = new THREE.BoxGeometry(width, height, 0.014);
  const frameGeometry = frameMaterial
    ? new THREE.BoxGeometry(width + 0.03, height + 0.03, 0.01)
    : undefined;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = startX + column * spacingX;
      const y = startY + row * spacingY;

      if (frameMaterial && frameGeometry) {
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(x, y, z - 0.006);
        target.add(frame);
      }

      const pane = new THREE.Mesh(paneGeometry, material);
      pane.position.set(x, y, z);
      target.add(pane);
    }
  }
}

function createBuildingSign(
  THREE: typeof Three,
  text: string,
  color: string,
  width: number,
) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color;
    context.font = '800 52px Inter, Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, width * 0.25),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
}

function createBirchTree(
  THREE: typeof Three,
  materials: Materials,
  x: number,
  z: number,
  scale: number,
) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.04, 0.72, 7), materials.stoneLight);
  trunk.position.y = -0.18;
  tree.add(trunk);

  for (let index = 0; index < 3; index += 1) {
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.012, 0.01), materials.forestMachineDark);
    mark.position.set(index % 2 === 0 ? 0.02 : -0.02, -0.36 + index * 0.18, 0.03);
    mark.rotation.z = index % 2 === 0 ? 0.3 : -0.25;
    tree.add(mark);
  }

  const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.19, 0), materials.moss);
  crown.position.y = 0.28;
  tree.add(crown);
  tree.position.set(x, -0.42, z);
  tree.scale.setScalar(scale);
  return tree;
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

function createDasaForestryLandmark(THREE: typeof Three, materials: Materials, labelText: string) {
  const group = new THREE.Group();

  const forestPositions = [
    [-0.78, -0.48, 0.86, 0],
    [-1.02, 0.02, 1.0, 2],
    [-0.52, 0.38, 0.82, 1],
    [0.04, -0.54, 0.8, 3],
    [0.52, 0.22, 0.72, 2],
    [0.9, -0.18, 0.62, 0],
  ];

  forestPositions.forEach(([x, z, scale, variant], index) => {
    group.add(createTree(THREE, materials, x, z, scale, variant, index === 2));
  });
  group.add(
    createBirchTree(THREE, materials, -0.16, 0.62, 0.78),
    createBirchTree(THREE, materials, 0.76, 0.62, 0.62),
  );

  const machine = new THREE.Group();
  const rearBody = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.24, 0.32), materials.forestMachineGreen);
  rearBody.position.set(0.18, 0.02, 0);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), materials.darkGlass);
  cabin.position.set(-0.14, 0.15, -0.02);
  const cabinRoof = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.045, 0.32), materials.forestMachineDark);
  cabinRoof.position.set(-0.14, 0.32, -0.02);
  const engineVent = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.016), materials.hydraulicMetal);
  engineVent.position.set(0.4, 0.08, 0.168);
  machine.add(rearBody, cabin, cabinRoof, engineVent);

  const wheelGeometry = new THREE.CylinderGeometry(0.102, 0.102, 0.07, 14);
  const hubGeometry = new THREE.CylinderGeometry(0.052, 0.052, 0.075, 12);
  [-0.32, -0.08, 0.2, 0.44].forEach((x) => {
    [-0.2, 0.2].forEach((z) => {
      const wheel = new THREE.Mesh(wheelGeometry, materials.forestMachineDark);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, -0.16, z);
      const hub = new THREE.Mesh(hubGeometry, materials.hydraulicYellow);
      hub.rotation.z = Math.PI / 2;
      hub.position.copy(wheel.position);
      machine.add(wheel, hub);
    });
  });

  const boomBase = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.05, 0.18, 8), materials.hydraulicMetal);
  boomBase.position.set(-0.32, 0.3, 0);
  const boomA = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, 0.065), materials.forestMachineDark);
  boomA.position.set(-0.62, 0.55, 0);
  boomA.rotation.z = -0.62;
  const boomB = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.052, 0.055), materials.forestMachineDark);
  boomB.position.set(-1.04, 0.18, 0);
  boomB.rotation.z = 0.46;
  const hydraulic = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.022, 0.022), materials.hydraulicYellow);
  hydraulic.position.set(-0.73, 0.38, 0.06);
  hydraulic.rotation.z = -0.62;
  const hose = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.007, 6, 28, Math.PI), materials.hydraulicMetal);
  hose.position.set(-0.82, 0.28, 0.02);
  hose.rotation.set(0.3, 0, -0.8);
  machine.add(boomBase, boomA, boomB, hydraulic, hose);

  const head = new THREE.Group();
  const headBody = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.12), materials.hydraulicMetal);
  const rollerA = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 10), materials.forestMachineDark);
  const rollerB = rollerA.clone();
  rollerA.rotation.x = Math.PI / 2;
  rollerB.rotation.x = Math.PI / 2;
  rollerA.position.set(-0.055, -0.08, 0);
  rollerB.position.set(0.055, -0.08, 0);
  const clawA = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.01, 6, 20, Math.PI * 0.85), materials.hydraulicYellow);
  const clawB = clawA.clone();
  clawA.rotation.set(Math.PI / 2, 0, -0.42);
  clawB.rotation.set(Math.PI / 2, 0, Math.PI + 0.42);
  head.add(headBody, rollerA, rollerB, clawA, clawB);
  head.position.set(-1.28, -0.18, 0.02);
  head.rotation.z = -0.18;
  machine.add(head);

  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 8), materials.cyan);
  sensor.position.set(-0.28, 0.42, 0.16);
  const signalA = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.006, 6, 30, Math.PI), materials.marker);
  const signalB = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.006, 6, 34, Math.PI), materials.marker);
  signalA.position.copy(sensor.position);
  signalB.position.copy(sensor.position);
  signalA.rotation.set(0.4, 0.15, -0.4);
  signalB.rotation.copy(signalA.rotation);
  machine.add(sensor, signalA, signalB);

  machine.position.set(0.42, -0.36, 0.22);
  machine.rotation.y = -0.28;
  machine.scale.setScalar(0.9);

  const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.1, 0.14, 9), materials.trunk);
  stump.position.set(-0.78, -0.49, 0.34);
  const stumpTop = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.076, 0.012, 9), materials.stoneLight);
  stumpTop.position.set(-0.78, -0.41, 0.34);
  const logGeometry = new THREE.CylinderGeometry(0.045, 0.05, 0.36, 9);
  [-0.74, -0.58, -0.42].forEach((x, index) => {
    const log = new THREE.Mesh(logGeometry, materials.trunk);
    log.position.set(x, -0.5, 0.66 + index * 0.05);
    log.rotation.set(Math.PI / 2, 0, 0.42 + index * 0.18);
    group.add(log);
  });

  const label = createTextLabel(THREE, labelText, '#77d8f7', 0.72);
  label.position.set(0.22, 0.98, 0.12);
  const forestLight = new THREE.PointLight(0x77d8f7, 0.38, 1.7);
  forestLight.position.set(0.16, 0.32, 0.26);
  group.add(machine, stump, stumpTop, label, forestLight);
  return group;
}

function createSodraHeadquartersLandmark(THREE: typeof Three, materials: Materials, labelText: string) {
  const group = new THREE.Group();
  const facadeSegments = 9;

  for (let index = 0; index < facadeSegments; index += 1) {
    const t = index / (facadeSegments - 1);
    const x = -0.78 + t * 1.56;
    const z = Math.sin((t - 0.5) * Math.PI) * 0.18;
    const height = 0.56 + Math.sin(t * Math.PI) * 0.08;
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.2, height, 0.08), materials.darkGlass);
    glass.position.set(x, 0.12, z);
    glass.rotation.y = (t - 0.5) * -0.32;
    group.add(glass);

    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.018, height + 0.12, 0.1), materials.whiteFacade);
    fin.position.set(x - 0.1, 0.14, z + 0.015);
    fin.rotation.copy(glass.rotation);
    group.add(fin);
  }

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.12, 0.58), materials.whiteFacade);
  base.position.set(0, -0.24, 0.02);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.05, 0.68), materials.roof);
  roof.position.set(0, 0.48, 0.02);
  roof.rotation.z = 0.035;
  const upperPavilion = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.32, 0.42), materials.coolGlass);
  upperPavilion.position.set(0.38, 0.75, -0.05);
  const upperRoof = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.045, 0.52), materials.roof);
  upperRoof.position.set(0.38, 0.94, -0.05);
  const sideTower = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.72, 0.46), materials.whiteFacade);
  sideTower.position.set(0.75, 0.16, 0.12);
  group.add(base, roof, upperPavilion, upperRoof, sideTower);

  addWindowGrid(THREE, group, {
    columns: 3,
    rows: 4,
    startX: 0.62,
    startY: -0.06,
    z: 0.358,
    spacingX: 0.105,
    spacingY: 0.13,
    width: 0.064,
    height: 0.075,
    material: materials.darkGlass,
    frameMaterial: materials.whiteFacade,
  });

  const grass = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.96, 0.035, 18), materials.moss);
  grass.position.set(-0.12, -0.55, 0.34);
  grass.scale.z = 0.42;
  const signPlate = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.018), materials.sodraGreen);
  signPlate.position.set(0.58, 0.42, 0.36);
  const sign = createBuildingSign(THREE, 'Södra', '#72f2a3', 0.26);
  sign.position.set(0.58, 0.42, 0.374);
  const label = createTextLabel(THREE, labelText, '#72f2a3', 0.7);
  label.position.set(-0.1, 1.1, 0.16);
  const light = new THREE.PointLight(0x72f2a3, 0.32, 1.6);
  light.position.set(0.48, 0.42, 0.42);
  group.add(grass, signPlate, sign, label, light);
  group.scale.setScalar(0.8);
  return group;
}

function createVismaLandmark(THREE: typeof Three, materials: Materials, labelText: string) {
  const group = new THREE.Group();
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.74, 0.42), materials.whiteFacade);
  const center = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.9, 0.46), materials.orangeFacade);
  const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.74, 0.42), materials.whiteFacade);
  leftWing.position.set(-0.56, 0.18, 0);
  center.position.set(0, 0.26, 0.02);
  rightWing.position.set(0.56, 0.18, 0);
  group.add(leftWing, center, rightWing);

  const roofLine = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.055, 0.5), materials.roof);
  roofLine.position.set(0, 0.76, 0);
  const entrance = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.025), materials.coolGlass);
  entrance.position.set(0, -0.06, 0.257);
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.16), materials.whiteFacade);
  canopy.position.set(0, 0.16, 0.32);
  const stairs = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.045, 0.24), materials.stoneLight);
  stairs.position.set(0, -0.34, 0.46);
  group.add(roofLine, entrance, canopy, stairs);

  addWindowGrid(THREE, group, {
    columns: 3,
    rows: 3,
    startX: -0.72,
    startY: -0.04,
    z: 0.218,
    spacingX: 0.16,
    spacingY: 0.18,
    width: 0.085,
    height: 0.072,
    material: materials.coolGlass,
  });
  addWindowGrid(THREE, group, {
    columns: 3,
    rows: 3,
    startX: 0.4,
    startY: -0.04,
    z: 0.218,
    spacingX: 0.16,
    spacingY: 0.18,
    width: 0.085,
    height: 0.072,
    material: materials.coolGlass,
  });
  addWindowGrid(THREE, group, {
    columns: 2,
    rows: 3,
    startX: -0.11,
    startY: 0.16,
    z: 0.258,
    spacingX: 0.22,
    spacingY: 0.18,
    width: 0.12,
    height: 0.085,
    material: materials.darkGlass,
  });

  const sign = createBuildingSign(THREE, 'VISMA', '#10251f', 0.36);
  sign.position.set(0, 0.22, 0.405);
  const label = createTextLabel(THREE, labelText, '#b7f4d6', 0.68);
  label.position.set(0, 1.0, 0.24);
  const lobbyLight = new THREE.PointLight(0x77d8f7, 0.34, 1.3);
  lobbyLight.position.set(0, 0.22, 0.42);
  group.add(sign, label, lobbyLight);
  group.add(createTree(THREE, materials, -0.92, 0.35, 0.42, 1), createTree(THREE, materials, 0.92, 0.35, 0.42, 2));
  group.scale.setScalar(0.78);
  return group;
}

function createFilmstadenLandmark(THREE: typeof Three, materials: Materials, labelText: string) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.92, 0.34), materials.brick);
  body.position.y = 0.18;
  const stoneBase = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.22, 0.38), materials.stoneLight);
  stoneBase.position.y = -0.24;
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.06, 0.4), materials.stoneLight);
  cornice.position.y = 0.68;
  group.add(body, stoneBase, cornice);

  addWindowGrid(THREE, group, {
    columns: 5,
    rows: 3,
    startX: -0.46,
    startY: 0.02,
    z: 0.181,
    spacingX: 0.23,
    spacingY: 0.2,
    width: 0.11,
    height: 0.105,
    material: materials.coolGlass,
    frameMaterial: materials.stoneLight,
  });

  const marqueeShape = new THREE.Shape();
  marqueeShape.moveTo(-0.66, -0.06);
  marqueeShape.lineTo(0.66, -0.06);
  marqueeShape.quadraticCurveTo(0.72, 0.0, 0.66, 0.08);
  marqueeShape.lineTo(-0.66, 0.08);
  marqueeShape.quadraticCurveTo(-0.72, 0.0, -0.66, -0.06);
  const marquee = new THREE.Mesh(
    new THREE.ExtrudeGeometry(marqueeShape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelSize: 0.015,
      bevelThickness: 0.012,
      bevelSegments: 2,
    }),
    materials.redMarquee,
  );
  marquee.position.set(0, -0.08, 0.18);
  group.add(marquee);

  [-0.47, -0.26, 0.34, 0.53].forEach((x, index) => {
    const posterFrame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.016), materials.stoneDark);
    const poster = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.18, 0.018),
      index % 2 === 0 ? materials.warmWindow : materials.window,
    );
    posterFrame.position.set(x, -0.28, 0.204);
    poster.position.set(x, -0.28, 0.214);
    group.add(posterFrame, poster);
  });

  const doors = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.02), materials.darkGlass);
  doors.position.set(0.03, -0.29, 0.205);
  const doorBars = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.28, 0.024), materials.redMarquee);
  doorBars.position.set(0.03, -0.29, 0.222);
  group.add(doors, doorBars);

  const roundSign = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 32), materials.redMarquee);
  roundSign.rotation.x = Math.PI / 2;
  roundSign.position.set(-0.24, 0.32, 0.235);
  const innerSign = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.042, 32), materials.darkGlass);
  innerSign.rotation.copy(roundSign.rotation);
  innerSign.position.copy(roundSign.position);
  innerSign.position.z += 0.01;
  const fStem = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.15, 0.018), materials.redMarquee);
  const fTop = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.035, 0.018), materials.redMarquee);
  const fMid = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.03, 0.018), materials.redMarquee);
  fStem.position.set(-0.255, 0.32, 0.277);
  fTop.position.set(-0.222, 0.375, 0.277);
  fMid.position.set(-0.228, 0.325, 0.277);
  group.add(roundSign, innerSign, fStem, fTop, fMid);

  const wordmark = createBuildingSign(THREE, 'Filmstaden', '#ff6961', 0.72);
  wordmark.position.set(0.18, 0.29, 0.305);
  const label = createTextLabel(THREE, labelText, '#f1d48d', 0.9);
  label.position.set(0, 0.9, 0.22);
  const marqueeLight = new THREE.PointLight(0xf1d48d, 0.58, 1.7);
  marqueeLight.position.set(0.05, -0.02, 0.48);
  for (let index = 0; index < 6; index += 1) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), materials.warmWindow);
    bulb.position.set(-0.45 + index * 0.18, -0.11, 0.32);
    group.add(bulb);
  }
  group.add(wordmark, label, marqueeLight);
  group.scale.setScalar(0.78);
  return group;
}

function createEducationBuildingLandmark(THREE: typeof Three, materials: Materials, labelText: string) {
  const group = new THREE.Group();
  const main = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.82, 0.36), materials.brick);
  main.position.y = 0.14;
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.72, 0.34), materials.brickDark);
  const rightWing = leftWing.clone();
  leftWing.position.set(-0.72, 0.1, 0);
  rightWing.position.set(0.72, 0.1, 0);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.14, 0.4), materials.stoneDark);
  plinth.position.y = -0.28;
  const centerBay = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.92, 0.4), materials.brickDark);
  centerBay.position.set(0, 0.18, 0.03);
  group.add(main, leftWing, rightWing, plinth, centerBay);

  addWindowGrid(THREE, group, {
    columns: 5,
    rows: 3,
    startX: -0.46,
    startY: -0.02,
    z: 0.191,
    spacingX: 0.23,
    spacingY: 0.2,
    width: 0.09,
    height: 0.12,
    material: materials.coolGlass,
    frameMaterial: materials.stoneLight,
  });
  addWindowGrid(THREE, group, {
    columns: 1,
    rows: 3,
    startX: -0.72,
    startY: -0.02,
    z: 0.181,
    spacingX: 0.1,
    spacingY: 0.2,
    width: 0.085,
    height: 0.11,
    material: materials.coolGlass,
    frameMaterial: materials.stoneLight,
  });
  addWindowGrid(THREE, group, {
    columns: 1,
    rows: 3,
    startX: 0.72,
    startY: -0.02,
    z: 0.181,
    spacingX: 0.1,
    spacingY: 0.2,
    width: 0.085,
    height: 0.11,
    material: materials.coolGlass,
    frameMaterial: materials.stoneLight,
  });

  const archShape = new THREE.Shape();
  archShape.moveTo(-0.1, -0.16);
  archShape.lineTo(-0.1, 0.02);
  archShape.quadraticCurveTo(0, 0.17, 0.1, 0.02);
  archShape.lineTo(0.1, -0.16);
  archShape.lineTo(-0.1, -0.16);
  const arch = new THREE.Mesh(
    new THREE.ExtrudeGeometry(archShape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelSize: 0.006,
      bevelThickness: 0.006,
      bevelSegments: 1,
    }),
    materials.warmWindow,
  );
  arch.position.set(0, -0.2, 0.205);
  group.add(arch);

  [-0.54, -0.18, 0.18, 0.54].forEach((x) => {
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.12), materials.brickDark);
    crown.position.set(x, 0.66, 0);
    group.add(crown);
  });
  const centerCrown = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.15), materials.brickDark);
  centerCrown.position.set(0, 0.74, 0.02);
  const path = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.018, 0.48), materials.path);
  path.position.set(0, -0.52, 0.48);
  const accent = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), materials.educationAccent);
  accent.position.set(0.28, 0.54, 0.22);
  const label = createTextLabel(THREE, labelText, '#c4a5ff', 0.78);
  label.position.set(0.02, 1.0, 0.22);
  const entranceLight = new THREE.PointLight(0xe6c885, 0.42, 1.3);
  entranceLight.position.set(0, -0.04, 0.4);
  group.add(centerCrown, path, accent, label, entranceLight);
  group.add(createTree(THREE, materials, -0.98, 0.38, 0.44, 2), createTree(THREE, materials, 0.98, 0.38, 0.42, 1));
  group.scale.setScalar(0.7);
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
  group.add(createGroundingPad(THREE, item, materials));
  if (item.id === 'dasa') {
    group.add(createDasaGroundAccents(THREE, materials));
  }
  group.add(content);

  const markerMaterial = new THREE.MeshBasicMaterial({
    color: item.accent,
    transparent: true,
    opacity: 0.46,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const marker = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.009, 8, 54), markerMaterial);
  marker.rotation.x = Math.PI / 2;
  marker.position.y = 0.1;
  group.add(marker);

  const pulseRing = new THREE.Mesh(
    new THREE.RingGeometry(0.58, 0.86, 72),
    new THREE.MeshBasicMaterial({
      color: item.accent,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  pulseRing.rotation.x = Math.PI / 2;
  pulseRing.position.y = 0.105;
  group.add(pulseRing);

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
    new THREE.RingGeometry(0.1, 0.16, 32),
    new THREE.MeshBasicMaterial({
      color: item.accent,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  hoverHalo.position.y = 1.04;
  group.add(hoverHalo);

  const hitTarget = new THREE.Mesh(new THREE.BoxGeometry(1.32, 1.45, 1.32), materials.invisible);
  hitTarget.position.y = 0.2;
  hitTarget.userData = { kind: 'career-hotspot', id: item.id };
  group.add(hitTarget);

  return { item, group, content, hitTarget, marker, beacon, pulseRing, hoverHalo };
}

function createGroundingPad(THREE: typeof Three, item: CareerMapItem, materials: Materials) {
  const pad = new THREE.Mesh(
    new THREE.CircleGeometry(1, 64),
    item.id === 'dasa' ? materials.forestClearing : materials.sitePad,
  );
  const padScale: Record<string, [number, number, number]> = {
    sodra: [1.82, 0.86, -0.1],
    dasa: [1.78, 1.08, 0.18],
    visma: [1.58, 0.94, 0.04],
    filmstaden: [1.48, 0.86, 0],
    education: [1.34, 0.9, -0.03],
  };
  const [scaleX, scaleZ, rotation] = padScale[item.id] ?? [1.35, 0.9, 0];

  pad.name = `Runtime_${item.id}_GroundingPad`;
  pad.rotation.x = -Math.PI / 2;
  pad.rotation.z = rotation;
  pad.position.y = 0.12;
  pad.scale.set(scaleX, scaleZ, 1);
  pad.renderOrder = -2;

  return pad;
}

function createDasaGroundAccents(THREE: typeof Three, materials: Materials) {
  const group = new THREE.Group();
  group.name = 'Runtime_Dasa_ForestryContext';

  const logs = [
    [-0.86, 0.14, 0.52, 0.48, 0.036, 0.95],
    [-0.58, 0.145, 0.7, 0.42, 0.032, 0.72],
    [0.82, 0.14, -0.58, 0.36, 0.03, -0.42],
  ];

  logs.forEach(([x, y, z, length, radius, rotation], index) => {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 10), materials.trunk);
    log.name = `Runtime_Dasa_GroundedLog_${index}`;
    log.position.set(x, y, z);
    log.rotation.set(Math.PI / 2, 0, rotation);
    group.add(log);
  });

  const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.1, 0.12, 9), materials.trunk);
  stump.name = 'Runtime_Dasa_GroundedStump';
  stump.position.set(-0.2, 0.15, 0.8);
  stump.rotation.y = 0.38;
  group.add(stump);

  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), materials.cyan);
  sensor.name = 'Runtime_Dasa_CyanSensor';
  sensor.position.set(-1.08, 0.3, 0.2);
  group.add(sensor);

  return group;
}

function createPath(THREE: typeof Three, materials: Materials) {
  const group = new THREE.Group();
  const hub = new THREE.Vector3(0, -0.57, -0.16);
  const points = [
    hub,
    ...careerMapItems.map((item) => new THREE.Vector3(item.position[0], -0.57, item.position[2])),
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

export function createCareerWorld(
  THREE: typeof Three,
  compact: boolean,
  labels: CareerWorldLabels,
): CareerWorldHandle {
  const materials = makeMaterials(THREE);
  const group = new THREE.Group();
  const proceduralBase = new THREE.Group();
  const depthLayers = [
    createTreeLayer(THREE, compact ? 9 : 16, -3.05, materials.forestBack),
    createTreeLayer(THREE, compact ? 7 : 13, -2.22, materials.forestMid),
  ];

  proceduralBase.add(
    ...depthLayers,
    createIsland(THREE, materials),
    createPath(THREE, materials),
    createGroundDetails(THREE, materials),
  );
  group.add(proceduralBase);

  const factoryById = {
    sodra: () => createSodraHeadquartersLandmark(THREE, materials, labels.locations.sodra ?? 'Södra'),
    dasa: () => createDasaForestryLandmark(THREE, materials, labels.locations.dasa ?? 'Dasa IoT'),
    visma: () => createVismaLandmark(THREE, materials, labels.locations.visma ?? 'Visma'),
    filmstaden: () => createFilmstadenLandmark(THREE, materials, labels.locations.filmstaden ?? 'Filmstaden'),
    education: () => createEducationBuildingLandmark(THREE, materials, labels.locations.education ?? 'Learning'),
  };

  const hotspots = careerMapItems.map((item) =>
    createHotspot(THREE, item, factoryById[item.id as keyof typeof factoryById](), materials),
  );
  hotspots.forEach((hotspot) => group.add(hotspot.group));

  const hubX = 0;
  const hubZ = -0.16;
  const hubPlatform = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.055, 10), materials.dark);
  hubPlatform.position.set(hubX, -0.34, hubZ);
  const hubGroundGlow = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.56, 72), materials.hubGlow);
  hubGroundGlow.rotation.x = Math.PI / 2;
  hubGroundGlow.position.set(hubX, -0.29, hubZ);
  const coreBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.1, 8), materials.dark);
  coreBase.position.set(hubX, -0.27, hubZ);
  const systemCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), materials.cyan);
  systemCore.position.set(hubX, -0.05, hubZ);
  const coreHalo = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.008, 8, 48), materials.marker);
  coreHalo.rotation.x = Math.PI / 2;
  coreHalo.position.set(hubX, -0.17, hubZ);
  const coreLabel = createTextLabel(THREE, labels.hub, '#77d8f7', 0.82);
  coreLabel.position.set(hubX, 0.22, hubZ);
  group.add(hubPlatform, hubGroundGlow, coreBase, systemCore, coreHalo, coreLabel);

  const focusRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.014, 8, 56), materials.marker);
  focusRing.rotation.x = Math.PI / 2;
  focusRing.position.set(0, -0.3, 0);
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
      new THREE.Vector3(systemCore.position.x, 1.55, systemCore.position.z),
      { line: materials.line, dot: materials.dot },
      0.48,
    ),
  );
  pulses.forEach((pulse) => group.add(pulse.line, pulse.dot));

  const interactives = hotspots.map((hotspot) => hotspot.hitTarget);
  const animatedNodes = [systemCore, coreHalo, hubGroundGlow, ...hotspots.flatMap((hotspot) => [hotspot.marker, hotspot.beacon, hotspot.pulseRing])];

  return {
    group,
    proceduralBase,
    depthLayers,
    hotspots,
    pulses,
    interactives,
    focusRing,
    systemCore,
    animatedNodes,
  };
}
