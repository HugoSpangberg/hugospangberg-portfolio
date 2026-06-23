import { useEffect, useRef } from 'react';
import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  WebGLRenderer,
} from 'three';
import type { SayHiCopy, SayHiState, SayHiVisualStatus } from '../model/sayHiTypes';

type SayHiLampSceneProps = {
  copy: SayHiCopy;
  state: SayHiState;
  enabled: boolean;
  onArm: () => void;
};

const colors: Record<SayHiVisualStatus, string> = {
  idle: '#f4f0dc',
  hover: '#fff6bc',
  armed: '#ffe27a',
  verifying: '#77c8ff',
  sending: '#74f3d3',
  success: '#ff3b35',
  cooldown: '#c8d0d8',
  error: '#ff7b5f',
  unavailable: '#8c96a3',
};

function createNoiseTexture(): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');

  if (context) {
    const image = context.createImageData(canvas.width, canvas.height);
    for (let index = 0; index < image.data.length; index += 4) {
      const value = 185 + Math.random() * 42;
      image.data[index] = value;
      image.data[index + 1] = value * 0.92;
      image.data[index + 2] = value * 0.78;
      image.data[index + 3] = 255;
    }
    context.putImageData(image, 0, 0);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function createLamp(texture: Texture) {
  const group = new Group();
  const metal = new MeshPhysicalMaterial({
    color: '#28313c',
    roughness: 0.45,
    metalness: 0.75,
  });
  const warmGlass = new MeshPhysicalMaterial({
    color: colors.idle,
    roughness: 0.16,
    metalness: 0,
    transmission: 0.35,
    transparent: true,
    opacity: 0.86,
  });
  const shadeMaterial = new MeshPhysicalMaterial({
    color: '#d8b66f',
    roughness: 0.82,
    metalness: 0.1,
    map: texture,
  });

  const base = new Mesh(new CylinderGeometry(0.95, 1.08, 0.18, 48), metal);
  base.position.y = -1.15;
  group.add(base);

  const stem = new Mesh(new CylinderGeometry(0.08, 0.1, 1.5, 24), metal);
  stem.position.y = -0.4;
  group.add(stem);

  const shade = new Mesh(new ConeGeometry(0.82, 0.96, 64, 1, true), shadeMaterial);
  shade.position.y = 0.6;
  shade.rotation.x = Math.PI;
  group.add(shade);

  const bulb = new Mesh(new SphereGeometry(0.26, 40, 24), warmGlass);
  bulb.position.y = 0.26;
  group.add(bulb);

  const switchPlate = new Mesh(new BoxGeometry(0.42, 0.08, 0.22), metal);
  switchPlate.position.set(0.55, -1.0, 0.18);
  switchPlate.rotation.z = -0.16;
  group.add(switchPlate);

  return { group, bulb, bulbMaterial: warmGlass };
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
    scene.background = new Color('#111820');
    const camera = new PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.35, 5.2);

    const renderer = new WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = SRGBColorSpace;
    host.append(renderer.domElement);

    const texture = createNoiseTexture();
    const { group, bulb, bulbMaterial } = createLamp(texture);
    scene.add(group);

    const floor = new Mesh(
      new PlaneGeometry(8, 8),
      new MeshPhysicalMaterial({ color: '#18212a', roughness: 0.9 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.26;
    scene.add(floor);

    const ambient = new AmbientLight('#9fb7c8', 0.45);
    const key = new DirectionalLight('#ffffff', 2.2);
    key.position.set(2.5, 4, 3);
    const fill = new DirectionalLight('#7db5ff', 0.65);
    fill.position.set(-3, 1.5, 2);
    const glow = new PointLight(colors.idle, 0.8, 5);
    glow.position.set(0, 0.25, 0.3);
    scene.add(ambient, key, fill, glow);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frame = 0;
    let animationId = 0;

    const render = () => {
      const currentStatus = visualStatus(statusRef.current, enabledRef.current, hoverRef.current);
      const color = new Color(colors[currentStatus]);
      bulbMaterial.color.lerp(color, 0.12);
      glow.color.lerp(color, 0.12);
      glow.intensity =
        currentStatus === 'success'
          ? 4.3
          : currentStatus === 'sending' || currentStatus === 'verifying'
            ? 2.8
            : currentStatus === 'idle' || currentStatus === 'unavailable'
              ? 0.65
              : 1.8;

      if (!reducedMotion) {
        frame += 0.01;
        group.rotation.y = Math.sin(frame) * 0.08;
        bulb.scale.setScalar(1 + Math.sin(frame * 4) * (currentStatus === 'sending' ? 0.05 : 0.015));
      }

      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      renderer.dispose();
      texture.dispose();
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
