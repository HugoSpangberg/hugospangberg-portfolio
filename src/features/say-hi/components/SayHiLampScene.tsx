import { useEffect, useRef } from 'react';
import {
  AmbientLight,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  LinearSRGBColorSpace,
  Mesh,
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
import type { SayHiCopy, SayHiState, SayHiVisualStatus } from '../model/sayHiTypes';

type SayHiLampSceneProps = {
  copy: SayHiCopy;
  state: SayHiState;
  enabled: boolean;
  onArm: () => void;
};

const lightStates: Record<
  SayHiVisualStatus,
  {
    color: string;
    emissive: string;
    shadeGlow: number;
    bulbGlow: number;
    pointLight: number;
    spotLight: number;
  }
> = {
  idle: {
    color: '#fff3d7',
    emissive: '#b48950',
    shadeGlow: 0.24,
    bulbGlow: 0.24,
    pointLight: 0.82,
    spotLight: 0.36,
  },
  hover: {
    color: '#fff2c8',
    emissive: '#8a6737',
    shadeGlow: 0.1,
    bulbGlow: 0.14,
    pointLight: 0.3,
    spotLight: 0.15,
  },
  armed: {
    color: '#fff1c5',
    emissive: '#ffd68a',
    shadeGlow: 0.36,
    bulbGlow: 0.42,
    pointLight: 1.8,
    spotLight: 0.95,
  },
  verifying: {
    color: '#e9f7ff',
    emissive: '#a7ddff',
    shadeGlow: 0.28,
    bulbGlow: 0.38,
    pointLight: 1.55,
    spotLight: 0.82,
  },
  sending: {
    color: '#e4fff6',
    emissive: '#94f0d8',
    shadeGlow: 0.3,
    bulbGlow: 0.4,
    pointLight: 1.65,
    spotLight: 0.9,
  },
  success: {
    color: '#ffd6ca',
    emissive: '#ff6b55',
    shadeGlow: 0.5,
    bulbGlow: 0.58,
    pointLight: 2.35,
    spotLight: 1.25,
  },
  cooldown: {
    color: '#efe5ce',
    emissive: '#c09b63',
    shadeGlow: 0.16,
    bulbGlow: 0.22,
    pointLight: 0.75,
    spotLight: 0.42,
  },
  error: {
    color: '#d7cfc2',
    emissive: '#4f4037',
    shadeGlow: 0.04,
    bulbGlow: 0.04,
    pointLight: 0.12,
    spotLight: 0.05,
  },
  unavailable: {
    color: '#c9c8c0',
    emissive: '#303a3f',
    shadeGlow: 0.02,
    bulbGlow: 0.02,
    pointLight: 0.08,
    spotLight: 0.03,
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

function visualStatus(state: SayHiState, enabled: boolean, hovered: boolean): SayHiVisualStatus {
  if (!enabled) {
    return 'unavailable';
  }

  if (hovered && state.status === 'idle') {
    return 'hover';
  }

  return state.status;
}

function SayHiLampScene({ copy, state, enabled, onArm }: SayHiLampSceneProps) {
  const hostRef = useRef<HTMLButtonElement | null>(null);
  const statusRef = useRef<SayHiState>(state);
  const enabledRef = useRef(enabled);
  const hoverRef = useRef(false);

  useEffect(() => {
    statusRef.current = state;
  }, [state]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new Scene();
    scene.background = new Color('#31484a');
    const camera = new PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0.2, 0.28, 6.15);

    const renderer = new WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = SRGBColorSpace;
    host.append(renderer.domElement);

    const texture = createFabricTexture();
    const contactShadowTexture = createContactShadowTexture();
    const { group, shadeMaterial, innerShadeMaterial, bulb, bulbMaterial, switchMaterial } =
      createScandinavianLamp(texture);
    scene.add(group);

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
    contactShadow.position.set(0, -1.275, 0.12);
    scene.add(contactShadow);

    const ambient = new AmbientLight('#eef1e7', 2.05);
    const key = new DirectionalLight('#fff5df', 3.35);
    key.position.set(2.4, 3.4, 4.4);
    const rim = new DirectionalLight('#9fd0d7', 1.2);
    rim.position.set(-3.4, 1.6, -2.2);
    const glow = new PointLight(lightStates.idle.color, lightStates.idle.pointLight, 4.2, 1.8);
    glow.position.set(0, 0.66, 0.18);
    const downLight = new SpotLight(lightStates.idle.color, lightStates.idle.spotLight, 4, 0.72, 0.72, 1.4);
    downLight.position.set(0, 0.67, 0.08);
    downLight.target.position.set(0, -1.05, 0.18);
    scene.add(ambient, key, rim, glow, downLight, downLight.target);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(rect.height, 1);
      camera.position.z = rect.width < 520 ? 6.75 : 6.15;
      camera.position.y = rect.width < 520 ? 0.34 : 0.28;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frame = 0;
    let animationId = 0;
    let currentPointLight = lightStates.idle.pointLight;
    let currentSpotLight = lightStates.idle.spotLight;

    const render = () => {
      const currentStatus = visualStatus(statusRef.current, enabledRef.current, hoverRef.current);
      const target = lightStates[currentStatus];
      const pulse =
        !reducedMotion && (currentStatus === 'sending' || currentStatus === 'verifying')
          ? 1 + Math.sin(frame * 2.1) * 0.08
          : 1;
      const targetLight = new Color(target.color);
      const targetEmissive = new Color(target.emissive);

      shadeMaterial.color.lerp(targetLight, 0.055);
      shadeMaterial.emissive.lerp(targetEmissive, 0.075);
      shadeMaterial.emissiveIntensity +=
        (target.shadeGlow * pulse - shadeMaterial.emissiveIntensity) * 0.11;

      innerShadeMaterial.emissive.lerp(targetEmissive, 0.075);
      innerShadeMaterial.emissiveIntensity +=
        (target.shadeGlow * 0.7 * pulse - innerShadeMaterial.emissiveIntensity) * 0.11;

      bulbMaterial.color.lerp(targetLight, 0.09);
      bulbMaterial.emissive.lerp(targetEmissive, 0.09);
      bulbMaterial.emissiveIntensity +=
        (target.bulbGlow * pulse - bulbMaterial.emissiveIntensity) * 0.12;

      glow.color.lerp(targetLight, 0.09);
      downLight.color.lerp(targetLight, 0.09);
      currentPointLight += (target.pointLight * pulse - currentPointLight) * 0.08;
      currentSpotLight += (target.spotLight * pulse - currentSpotLight) * 0.08;
      glow.intensity = currentPointLight;
      downLight.intensity = currentSpotLight;
      switchMaterial.emissive.set(
        currentStatus === 'hover' || currentStatus === 'armed' ? '#5b4325' : '#000000',
      );

      if (!reducedMotion) {
        frame += 0.01;
        group.rotation.y = -0.24 + Math.sin(frame * 0.85) * 0.025;
        bulb.scale.setScalar(1 + Math.sin(frame * 2.2) * (currentStatus === 'sending' ? 0.025 : 0.008));
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
      texture.dispose();
      contactShadowTexture.dispose();
      host.querySelector('canvas')?.remove();
    };
  }, []);

  return (
    <button
      ref={hostRef}
      className="say-hi-lamp"
      type="button"
      aria-label={copy.canvasLabel}
      disabled={!enabled}
      onBlur={() => {
        hoverRef.current = false;
      }}
      onClick={onArm}
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
    </button>
  );
}

export default SayHiLampScene;
