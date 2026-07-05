import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  Group,
  HemisphereLight,
  LinearSRGBColorSpace,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SpotLight,
  SRGBColorSpace,
  Texture,
  TorusGeometry,
  WebGLRenderer,
} from 'three';
import type { SayHiCopy } from '../model/sayHiTypes';

type SayHiLampSceneProps = {
  copy: SayHiCopy;
  state: LampVisualState;
  disabled?: boolean;
};

export type LampVisualState = 'idle' | 'sending' | 'success' | 'cooldown' | 'error';

type SceneVisualState = LampVisualState | 'hover' | 'disabled';

const lightStates: Record<
  SceneVisualState,
  {
    color: string;
    emissive: string;
    shadeGlow: number;
    bulbGlow: number;
    pointLight: number;
    spotLight: number;
    floorGlow: number;
    signalPulse: number;
  }
> = {
  idle: {
    color: '#fff3d7',
    emissive: '#b48950',
    shadeGlow: 0.24,
    bulbGlow: 0.24,
    pointLight: 0.82,
    spotLight: 0.36,
    floorGlow: 0.02,
    signalPulse: 0,
  },
  hover: {
    color: '#fff2c8',
    emissive: '#8a6737',
    shadeGlow: 0.3,
    bulbGlow: 0.32,
    pointLight: 1.0,
    spotLight: 0.46,
    floorGlow: 0.04,
    signalPulse: 0,
  },
  sending: {
    color: '#fff0c8',
    emissive: '#ffd47f',
    shadeGlow: 0.42,
    bulbGlow: 0.52,
    pointLight: 1.95,
    spotLight: 0.98,
    floorGlow: 0.08,
    signalPulse: 0.95,
  },
  success: {
    color: '#ff9b86',
    emissive: '#ff4938',
    shadeGlow: 0.86,
    bulbGlow: 0.92,
    pointLight: 3.65,
    spotLight: 1.85,
    floorGlow: 0.92,
    signalPulse: 0.46,
  },
  cooldown: {
    color: '#f0d7c8',
    emissive: '#c97962',
    shadeGlow: 0.24,
    bulbGlow: 0.28,
    pointLight: 1.05,
    spotLight: 0.52,
    floorGlow: 0.12,
    signalPulse: 0.12,
  },
  error: {
    color: '#d7cfc2',
    emissive: '#4f4037',
    shadeGlow: 0.04,
    bulbGlow: 0.04,
    pointLight: 0.12,
    spotLight: 0.05,
    floorGlow: 0,
    signalPulse: 0,
  },
  disabled: {
    color: '#c9c8c0',
    emissive: '#303a3f',
    shadeGlow: 0.02,
    bulbGlow: 0.02,
    pointLight: 0.08,
    spotLight: 0.03,
    floorGlow: 0,
    signalPulse: 0,
  },
};

function createFabricTexture(): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 192;
  const context = canvas.getContext('2d');

  if (context) {
    context.fillStyle = '#eadcc0';
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < canvas.width; x += 3) {
      const alpha = x % 9 === 0 ? 0.18 : 0.08;
      context.strokeStyle = `rgba(105, 91, 67, ${alpha})`;
      context.beginPath();
      context.moveTo(x + Math.random() * 0.8, 0);
      context.lineTo(x + Math.random() * 0.8, canvas.height);
      context.stroke();
    }

    for (let y = 0; y < canvas.height; y += 5) {
      context.strokeStyle = 'rgba(255, 248, 224, 0.1)';
      context.beginPath();
      context.moveTo(0, y + Math.random() * 0.8);
      context.lineTo(canvas.width, y + Math.random() * 0.8);
      context.stroke();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1.35, 1.15);
  return texture;
}

function createContactShadowTexture(): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');

  if (context) {
    const gradient = context.createRadialGradient(128, 128, 16, 128, 128, 118);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.32)');
    gradient.addColorStop(0.48, 'rgba(0, 0, 0, 0.16)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = LinearSRGBColorSpace;
  return texture;
}

function createRadialGlowTexture(): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not create glow texture.');
  }

  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255, 88, 68, 0.76)');
  gradient.addColorStop(0.34, 'rgba(255, 62, 48, 0.38)');
  gradient.addColorStop(0.76, 'rgba(255, 42, 32, 0.13)');
  gradient.addColorStop(1, 'rgba(255, 32, 24, 0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function disposeGroup(group: Group) {
  group.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return;
    }

    object.geometry.dispose();

    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      material.dispose();
    });
  });
}

function createScandinavianLamp(texture: Texture) {
  const group = new Group();
  group.position.set(-1.95, 0, 0);
  group.rotation.set(-0.03, -0.24, 0);

  const darkBronze = new MeshPhysicalMaterial({
    color: '#25241f',
    roughness: 0.58,
    metalness: 0.56,
  });
  const warmWood = new MeshStandardMaterial({
    color: '#3b2b1f',
    roughness: 0.72,
    metalness: 0.05,
  });
  const shadeMaterial = new MeshPhysicalMaterial({
    color: '#eadcc0',
    emissive: '#8d693c',
    emissiveIntensity: 0.14,
    roughness: 0.82,
    metalness: 0.02,
    transparent: true,
    opacity: 0.9,
    side: DoubleSide,
    map: texture,
  });
  const innerShadeMaterial = shadeMaterial.clone();
  innerShadeMaterial.color.set('#cdbf9f');
  innerShadeMaterial.opacity = 0.74;
  const bulbMaterial = new MeshPhysicalMaterial({
    color: '#ffe6b4',
    emissive: '#ffd68a',
    emissiveIntensity: 0.08,
    roughness: 0.22,
    metalness: 0,
    transparent: true,
    opacity: 0.78,
  });
  const switchMaterial = new MeshPhysicalMaterial({
    color: '#68645a',
    roughness: 0.42,
    metalness: 0.64,
  });

  const base = new Mesh(new CylinderGeometry(0.76, 0.84, 0.2, 64), darkBronze);
  base.position.y = -1.18;
  group.add(base);

  const baseTop = new Mesh(new CylinderGeometry(0.66, 0.72, 0.055, 64), warmWood);
  baseTop.position.y = -1.04;
  group.add(baseTop);

  const baseRim = new Mesh(new TorusGeometry(0.78, 0.035, 12, 64), darkBronze);
  baseRim.position.y = -1.065;
  baseRim.rotation.x = Math.PI / 2;
  group.add(baseRim);

  const stem = new Mesh(new CylinderGeometry(0.065, 0.085, 1.36, 32), darkBronze);
  stem.position.y = -0.34;
  group.add(stem);

  const neck = new Mesh(new CylinderGeometry(0.17, 0.22, 0.18, 32), darkBronze);
  neck.position.y = 0.39;
  group.add(neck);

  const shade = new Mesh(new CylinderGeometry(0.55, 1.05, 1.15, 64, 1, true), shadeMaterial);
  shade.position.y = 0.88;
  group.add(shade);

  const shadeInner = new Mesh(new CylinderGeometry(0.48, 0.94, 1.08, 64, 1, true), innerShadeMaterial);
  shadeInner.position.y = 0.84;
  group.add(shadeInner);

  const topRim = new Mesh(new TorusGeometry(0.55, 0.025, 12, 64), darkBronze);
  topRim.position.y = 1.455;
  topRim.rotation.x = Math.PI / 2;
  group.add(topRim);

  const bottomRim = new Mesh(new TorusGeometry(1.05, 0.03, 12, 64), darkBronze);
  bottomRim.position.y = 0.305;
  bottomRim.rotation.x = Math.PI / 2;
  group.add(bottomRim);

  const bulb = new Mesh(new SphereGeometry(0.16, 32, 18), bulbMaterial);
  bulb.position.y = 0.68;
  group.add(bulb);

  const pullCord = new Mesh(new CylinderGeometry(0.012, 0.012, 0.45, 12), darkBronze);
  pullCord.position.set(0.36, 0.23, 0.08);
  pullCord.rotation.z = -0.08;
  group.add(pullCord);

  const pullBead = new Mesh(new SphereGeometry(0.045, 18, 12), switchMaterial);
  pullBead.position.set(0.38, -0.02, 0.08);
  group.add(pullBead);

  const switchButton = new Mesh(new CylinderGeometry(0.075, 0.08, 0.055, 24), switchMaterial);
  switchButton.position.set(0.45, -0.91, 0.38);
  switchButton.rotation.x = Math.PI / 2;
  group.add(switchButton);

  return { group, shadeMaterial, innerShadeMaterial, bulb, bulbMaterial, switchMaterial };
}

function createLine(points: number[], material: LineBasicMaterial) {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
  return new Line(geometry, material);
}

function createTechWorldDetails() {
  const group = new Group();
  group.position.x = -1.2;
  const lineMaterial = new LineBasicMaterial({
    color: '#7ad7c5',
    transparent: true,
    opacity: 0.16,
  });
  const gridMaterial = new LineBasicMaterial({
    color: '#6fcfb5',
    transparent: true,
    opacity: 0.1,
  });
  const nodeMaterial = new MeshBasicMaterial({
    color: '#8ef1cf',
    transparent: true,
    opacity: 0.7,
  });
  const pulseMaterial = new MeshBasicMaterial({
    color: '#ff6b55',
    transparent: true,
    opacity: 0,
  });

  group.add(createLine([-2.15, 0.68, -1.05, -1.18, 1.02, -0.85, 1.72, 0.56, -1.12], lineMaterial));
  group.add(createLine([-1.72, -0.18, -1.0, -0.36, 0.22, -0.92, 1.62, -0.08, -1.03], lineMaterial));
  group.add(createLine([-2.3, -1.22, -0.35, 2.3, -1.22, -0.35], gridMaterial));
  group.add(createLine([-1.9, -1.22, 0.3, 1.9, -1.22, 0.3], gridMaterial));
  group.add(createLine([-1.3, -1.22, -0.9, -1.3, -1.22, 1.0], gridMaterial));
  group.add(createLine([1.3, -1.22, -0.9, 1.3, -1.22, 1.0], gridMaterial));

  const nodeGeometry = new SphereGeometry(0.035, 14, 10);
  const nodePositions = [
    [-2.15, 0.68, -1.05],
    [-1.18, 1.02, -0.85],
    [1.72, 0.56, -1.12],
    [-0.36, 0.22, -0.92],
    [1.62, -0.08, -1.03],
  ] as const;

  nodePositions.forEach(([x, y, z]) => {
    const node = new Mesh(nodeGeometry, nodeMaterial);
    node.position.set(x, y, z);
    group.add(node);
  });

  const pulse = new Mesh(new SphereGeometry(0.055, 18, 12), pulseMaterial);
  pulse.position.set(-1.35, 0.38, -0.72);
  group.add(pulse);

  return { group, lineMaterial, gridMaterial, nodeMaterial, pulse, pulseMaterial };
}

function visualStatus(state: LampVisualState, disabled: boolean | undefined, hovered: boolean): SceneVisualState {
  if (disabled) {
    return 'disabled';
  }

  if (hovered && state === 'idle') {
    return 'hover';
  }

  return state;
}

function SayHiLampScene({ copy, state, disabled }: SayHiLampSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<LampVisualState>(state);
  const disabledRef = useRef(disabled);
  const hoverRef = useRef(false);

  useEffect(() => {
    statusRef.current = state;
  }, [state]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new Scene();
    scene.background = new Color('#31484a');
    scene.fog = new Fog('#31484a', 4.8, 9.2);
    const camera = new PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0.05, 0.58, 7.25);
    camera.lookAt(-1.45, 0.1, 0);

    const renderer = new WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = SRGBColorSpace;
    host.append(renderer.domElement);

    const texture = createFabricTexture();
    const contactShadowTexture = createContactShadowTexture();
    const redGlowTexture = createRadialGlowTexture();
    const { group, shadeMaterial, innerShadeMaterial, bulb, bulbMaterial, switchMaterial } =
      createScandinavianLamp(texture);
    scene.add(group);
    const techWorld = createTechWorldDetails();
    scene.add(techWorld.group);

    const floor = new Mesh(
      new PlaneGeometry(8, 8),
      new MeshPhysicalMaterial({ color: '#3d5048', roughness: 0.86 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.29;
    scene.add(floor);

    const contactShadow = new Mesh(
      new PlaneGeometry(2.35, 1.25),
      new MeshStandardMaterial({
        color: '#000000',
        map: contactShadowTexture,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(-1.95, -1.275, 0.12);
    scene.add(contactShadow);

    const redFloorGlow = new Mesh(
      new CircleGeometry(2.55, 72),
      new MeshBasicMaterial({
        color: '#ffffff',
        map: redGlowTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
      }),
    );
    redFloorGlow.rotation.x = -Math.PI / 2;
    redFloorGlow.position.set(-1.95, -1.248, 0.08);
    scene.add(redFloorGlow);

    const ambient = new AmbientLight('#dce8db', 0.42);
    const hemisphere = new HemisphereLight('#d9fff1', '#17251f', 0.75);
    const key = new DirectionalLight('#fff5df', 1.25);
    key.position.set(2.4, 3.4, 4.4);
    const rim = new DirectionalLight('#86d7df', 1.15);
    rim.position.set(-3.4, 1.6, -2.2);
    const glow = new PointLight(lightStates.idle.color, lightStates.idle.pointLight, 4.2, 1.8);
    glow.position.set(-1.95, 0.66, 0.18);
    const downLight = new SpotLight(lightStates.idle.color, lightStates.idle.spotLight, 4, 0.72, 0.72, 1.4);
    downLight.position.set(-1.95, 0.67, 0.08);
    downLight.target.position.set(-1.95, -1.05, 0.18);
    const redWash = new PointLight('#ff5f4b', 0, 3.6, 2);
    redWash.position.set(-1.9, -0.55, 0.45);
    scene.add(ambient, hemisphere, key, rim, glow, downLight, downLight.target, redWash);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(rect.height, 1);
      if (rect.width < 760) {
        group.position.x = -0.35;
        techWorld.group.position.x = 0.15;
        camera.position.set(0.05, 0.72, 7.8);
        camera.lookAt(-0.28, 0.08, 0);
        contactShadow.position.x = -0.35;
        redFloorGlow.position.x = -0.35;
        glow.position.x = -0.35;
        downLight.position.x = -0.35;
        downLight.target.position.x = -0.35;
        redWash.position.x = -0.3;
      } else {
        group.position.x = -1.95;
        techWorld.group.position.x = -1.2;
        camera.position.set(0.05, 0.58, 7.25);
        camera.lookAt(-1.45, 0.1, 0);
        contactShadow.position.x = -1.95;
        redFloorGlow.position.x = -1.95;
        glow.position.x = -1.95;
        downLight.position.x = -1.95;
        downLight.target.position.x = -1.95;
        redWash.position.x = -1.9;
      }
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frame = 0;
    let animationId = 0;
    let currentPointLight = lightStates.idle.pointLight;
    let currentSpotLight = lightStates.idle.spotLight;
    let currentFloorGlow = lightStates.idle.floorGlow;
    let currentSignalPulse = 0;

    const render = () => {
      const currentStatus = visualStatus(statusRef.current, disabledRef.current, hoverRef.current);
      const target = lightStates[currentStatus];
      const pulse =
        !reducedMotion && currentStatus === 'sending'
          ? 1 + Math.sin(frame * 2.1) * 0.08
          : 1;
      const targetLight = new Color(target.color);
      const targetEmissive = new Color(target.emissive);

      shadeMaterial.color.lerp(targetLight, 0.12);
      shadeMaterial.emissive.lerp(targetEmissive, 0.14);
      shadeMaterial.emissiveIntensity +=
        (target.shadeGlow * pulse - shadeMaterial.emissiveIntensity) * 0.11;

      innerShadeMaterial.emissive.lerp(targetEmissive, 0.14);
      innerShadeMaterial.emissiveIntensity +=
        (target.shadeGlow * 0.7 * pulse - innerShadeMaterial.emissiveIntensity) * 0.11;

      bulbMaterial.color.lerp(targetLight, 0.15);
      bulbMaterial.emissive.lerp(targetEmissive, 0.15);
      bulbMaterial.emissiveIntensity +=
        (target.bulbGlow * pulse - bulbMaterial.emissiveIntensity) * 0.12;

      glow.color.lerp(targetLight, 0.09);
      downLight.color.lerp(targetLight, 0.09);
      currentPointLight += (target.pointLight * pulse - currentPointLight) * 0.08;
      currentSpotLight += (target.spotLight * pulse - currentSpotLight) * 0.08;
      currentFloorGlow += (target.floorGlow * pulse - currentFloorGlow) * 0.12;
      currentSignalPulse += (target.signalPulse - currentSignalPulse) * 0.08;
      glow.intensity = currentPointLight;
      downLight.intensity = currentSpotLight;
      redWash.intensity = currentFloorGlow * 2.5;
      if (redFloorGlow.material instanceof MeshBasicMaterial) {
        redFloorGlow.material.opacity = currentFloorGlow;
        redFloorGlow.scale.setScalar(0.92 + currentFloorGlow * 0.35);
      }
      techWorld.lineMaterial.opacity = 0.13 + currentSignalPulse * 0.16;
      techWorld.gridMaterial.opacity = 0.08 + currentSignalPulse * 0.05;
      techWorld.nodeMaterial.opacity = 0.48 + currentSignalPulse * 0.35;
      techWorld.pulseMaterial.opacity = currentSignalPulse;
      switchMaterial.emissive.set(
        currentStatus === 'hover' || currentStatus === 'sending' ? '#5b4325' : '#000000',
      );

      if (!reducedMotion) {
        frame += 0.01;
        const hoverScale = hoverRef.current && !disabledRef.current ? 1.012 : 1;
        group.scale.setScalar(group.scale.x + (hoverScale - group.scale.x) * 0.08);
        group.rotation.y = -0.24 + Math.sin(frame * 0.85) * 0.018;
        bulb.scale.setScalar(1 + Math.sin(frame * 2.2) * (currentStatus === 'sending' ? 0.025 : 0.008));
        const pulseProgress = (frame * (currentStatus === 'sending' ? 0.52 : 0.24)) % 1;
        techWorld.pulse.position.set(-1.35 + pulseProgress * 2.55, 0.38 + Math.sin(pulseProgress * Math.PI) * 0.36, -0.72);
      }

      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(render);
    };

    host.dataset.sceneReady = 'true';
    render();

    return () => {
      window.cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      delete host.dataset.sceneReady;
      renderer.dispose();
      disposeGroup(group);
      disposeGroup(techWorld.group);
      floor.geometry.dispose();
      if (Array.isArray(floor.material)) {
        floor.material.forEach((material) => {
          material.dispose();
        });
      } else {
        floor.material.dispose();
      }
      contactShadow.geometry.dispose();
      if (Array.isArray(contactShadow.material)) {
        contactShadow.material.forEach((material) => {
          material.dispose();
        });
      } else {
        contactShadow.material.dispose();
      }
      redFloorGlow.geometry.dispose();
      if (Array.isArray(redFloorGlow.material)) {
        redFloorGlow.material.forEach((material) => {
          material.dispose();
        });
      } else {
        redFloorGlow.material.dispose();
      }
      texture.dispose();
      contactShadowTexture.dispose();
      redGlowTexture.dispose();
      host.querySelector('canvas')?.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="say-hi-scene"
      aria-hidden="true"
      onBlur={() => {
        hoverRef.current = false;
      }}
      onFocus={() => {
        hoverRef.current = true;
      }}
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
    >
      <span>{copy.fallback}</span>
    </div>
  );
}

export default SayHiLampScene;
