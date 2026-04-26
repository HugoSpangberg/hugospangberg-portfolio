import type * as Three from 'three';

export type MachineHandle = {
  group: Three.Group;
  sensorPosition: Three.Vector3;
  sensorLights: Three.Mesh[];
};

export function createForestMachine(
  THREE: typeof Three,
  materials: {
    body: Three.Material;
    dark: Three.Material;
    accent: Three.Material;
    sensor: Three.Material;
  },
): MachineHandle {
  const group = new THREE.Group();
  group.name = 'Harvester Node H-07';
  group.position.set(0.8, -0.55, 0.2);
  group.rotation.y = -0.25;
  group.userData = { kind: 'machine', id: 'H-07' };

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.32, 0.55), materials.body);
  chassis.position.y = 0.38;
  chassis.userData = group.userData;

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.42), materials.body);
  cabin.position.set(-0.2, 0.76, 0.02);
  cabin.userData = group.userData;

  const trackLeft = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.18, 0.16), materials.dark);
  trackLeft.position.set(0, 0.16, 0.34);
  trackLeft.userData = group.userData;

  const trackRight = trackLeft.clone();
  trackRight.position.z = -0.34;
  trackRight.userData = group.userData;

  const wheelGeometry = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 14);
  const wheelPositions = [
    [-0.42, 0.22, 0.43],
    [0, 0.2, 0.43],
    [0.42, 0.22, 0.43],
    [-0.42, 0.22, -0.43],
    [0, 0.2, -0.43],
    [0.42, 0.22, -0.43],
  ];
  const wheels = wheelPositions.map(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeometry, materials.dark);
    wheel.position.set(x, y, z);
    wheel.rotation.x = Math.PI / 2;
    wheel.userData = group.userData;
    return wheel;
  });

  const armBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 6), materials.accent);
  armBase.position.set(0.36, 0.88, 0);
  armBase.rotation.z = -0.78;
  armBase.userData = group.userData;

  const armTip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.58, 6), materials.accent);
  armTip.position.set(0.74, 1.13, 0);
  armTip.rotation.z = -1.18;
  armTip.userData = group.userData;

  const grip = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 6, 14, Math.PI * 1.35), materials.accent);
  grip.position.set(1.05, 1.02, 0);
  grip.rotation.set(Math.PI / 2, 0, 0.45);
  grip.userData = group.userData;

  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 12), materials.sensor);
  sensor.position.set(-0.42, 0.98, 0.24);
  sensor.userData = { kind: 'sensor', id: 'H-07', target: 'machine' };

  const rearSensor = sensor.clone();
  rearSensor.position.set(0.48, 0.54, -0.3);
  rearSensor.userData = { kind: 'sensor', id: 'Load Sensor L-02', target: 'machine' };

  const boomSensor = sensor.clone();
  boomSensor.position.set(0.85, 1.08, 0.08);
  boomSensor.userData = { kind: 'sensor', id: 'Crane Sensor C-11', target: 'machine' };

  const hitArea = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 1.15, 0.95),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  hitArea.position.set(0.18, 0.62, 0);
  hitArea.userData = group.userData;

  group.add(
    chassis,
    cabin,
    trackLeft,
    trackRight,
    ...wheels,
    armBase,
    armTip,
    grip,
    sensor,
    rearSensor,
    boomSensor,
    hitArea,
  );

  return {
    group,
    sensorPosition: group.position.clone().add(sensor.position),
    sensorLights: [sensor, rearSensor, boomSensor],
  };
}
