import { useEffect, useMemo, useRef, useState } from 'react';
import type * as Three from 'three';
import { createAurora } from './Aurora';
import { createCareerWorld, type CareerWorldHotspot } from './CareerWorld';
import { updateDataPulses } from './DataPulse';
import HeroFallback from './HeroFallback';
import { createSpaceBackdrop } from './SpaceBackdrop';
import { careerMapItems, getCareerMapItem, type CareerMapItem } from './careerMap';

type HeroSceneProps = {
  label: string;
  fallbackLabel: string;
};

type PointerState = {
  label: string;
  role: string;
  x: number;
  y: number;
};

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
    );
  } catch {
    return false;
  }
}

function scrollToSection(targetSection: string) {
  const target = document.getElementById(targetSection);

  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target.classList.add('section-target-highlight');
  window.setTimeout(() => target.classList.remove('section-target-highlight'), 1400);
}

function disposeScene(THREE: typeof Three, scene: Three.Scene, renderer: Three.WebGLRenderer) {
  const disposedMaterials = new Set<Three.Material>();
  const disposedGeometries = new Set<Three.BufferGeometry>();

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
      if (!disposedGeometries.has(object.geometry)) {
        object.geometry.dispose();
        disposedGeometries.add(object.geometry);
      }

      const material = object.material;

      if (Array.isArray(material)) {
        material.forEach((item) => {
          if (!disposedMaterials.has(item)) {
            item.dispose();
            disposedMaterials.add(item);
          }
        });
      } else if (!disposedMaterials.has(material)) {
        material.dispose();
        disposedMaterials.add(material);
      }
    }
  });

  renderer.dispose();
}

function HeroScene({ label, fallbackLabel }: HeroSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [activeItemId, setActiveItemId] = useState(careerMapItems[0].id);
  const [hoverLabel, setHoverLabel] = useState<PointerState | null>(null);

  const activeItem = useMemo(
    () => getCareerMapItem(activeItemId) ?? careerMapItems[0],
    [activeItemId],
  );

  useEffect(() => {
    const mount = mountRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!mount || reducedMotion || !supportsWebGL()) {
      setUseFallback(true);
      return undefined;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([
      import('three'),
      import('three/examples/jsm/controls/OrbitControls.js'),
    ])
      .then(([THREE, controlsModule]) => {
        if (cancelled || !mountRef.current) {
          return;
        }

        const compact = window.innerWidth < 720;
        let frameId = 0;
        let isSceneVisible = true;
        let isDocumentVisible = document.visibilityState === 'visible';
        let activeHotspot: CareerWorldHotspot | undefined;
        let hoveredHotspot: CareerWorldHotspot | undefined;
        const pointer = new THREE.Vector2(8, 8);
        const raycaster = new THREE.Raycaster();
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x06110e, compact ? 0.15 : 0.115);

        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 38);
        camera.position.set(compact ? 0.35 : 0.25, compact ? 2.3 : 2.05, compact ? 6.7 : 5.6);

        const renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
        });

        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.2 : 1.55));
        mount.appendChild(renderer.domElement);

        const controls = new controlsModule.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = !compact;
        controls.minDistance = 4.8;
        controls.maxDistance = 6.7;
        controls.minPolarAngle = Math.PI * 0.24;
        controls.maxPolarAngle = Math.PI * 0.44;
        controls.minAzimuthAngle = -Math.PI * 0.22;
        controls.maxAzimuthAngle = Math.PI * 0.22;
        controls.target.set(0.04, 0.04, -0.22);

        const world = createCareerWorld(THREE, compact, {
          hub: 'Career Hub',
          locations: {
            sodra: 'Södra',
            dasa: 'Dasa IoT',
            visma: 'Visma',
            filmstaden: 'Filmstaden',
            education: 'Learning',
          },
        });
        const backdrop = createSpaceBackdrop(THREE, compact);
        const aurora = createAurora(THREE);
        world.group.scale.setScalar(compact ? 0.92 : 1.06);
        world.group.rotation.x = -0.05;
        scene.add(backdrop, aurora, world.group);
        activeHotspot = world.hotspots[0];
        world.focusRing.visible = true;

        const resize = () => {
          const { width, height } = mount.getBoundingClientRect();
          renderer.setSize(width, height, false);
          camera.aspect = width / Math.max(height, 1);
          camera.updateProjectionMatrix();
        };

        const findHotspot = (object?: Three.Object3D) => {
          const id = object?.userData.id as string | undefined;
          return id ? world.hotspots.find((hotspot) => hotspot.item.id === id) : undefined;
        };

        const pickHotspot = (clientX: number, clientY: number) => {
          const bounds = mount.getBoundingClientRect();
          pointer.x = ((clientX - bounds.left) / bounds.width) * 2 - 1;
          pointer.y = -((clientY - bounds.top) / bounds.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);
          return findHotspot(raycaster.intersectObjects(world.interactives, false)[0]?.object);
        };

        const showHotspot = (hotspot: CareerWorldHotspot, event?: PointerEvent) => {
          activeHotspot = hotspot;
          setActiveItemId(hotspot.item.id);
          world.focusRing.position.set(
            hotspot.group.position.x,
            -0.58,
            hotspot.group.position.z,
          );
          world.focusRing.visible = true;

          if (event) {
            const bounds = mount.getBoundingClientRect();
            setHoverLabel({
              label: hotspot.item.label,
              role: hotspot.item.role,
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
            });
          }
        };

        const updateHover = (event: PointerEvent) => {
          const hotspot = pickHotspot(event.clientX, event.clientY);

          if (!hotspot) {
            hoveredHotspot = undefined;
            mount.style.cursor = 'default';
            setHoverLabel(null);
            return;
          }

          hoveredHotspot = hotspot;
          mount.style.cursor = 'pointer';
          showHotspot(hotspot, event);
        };

        const handleClick = (event: PointerEvent) => {
          const hotspot = pickHotspot(event.clientX, event.clientY);

          if (!hotspot) {
            return;
          }

          showHotspot(hotspot, event);
          window.setTimeout(() => scrollToSection(hotspot.item.targetSection), 180);
        };

        const clearHover = () => {
          hoveredHotspot = undefined;
          mount.style.cursor = 'default';
          setHoverLabel(null);
        };

        const visibilityObserver = new IntersectionObserver(
          ([entry]) => {
            isSceneVisible = entry.isIntersecting;
          },
          { threshold: 0.05 },
        );

        const handleVisibilityChange = () => {
          isDocumentVisible = document.visibilityState === 'visible';
        };

        const animate = () => {
          if (!isSceneVisible || !isDocumentVisible) {
            frameId = window.requestAnimationFrame(animate);
            return;
          }

          const time = performance.now() * 0.001;
          const targetHotspot = hoveredHotspot ?? activeHotspot;

          world.depthLayers[0].position.x = Math.sin(time * 0.12) * 0.035;
          world.depthLayers[1].position.x = Math.cos(time * 0.1) * 0.028;
          aurora.children.forEach((child, index) => {
            child.position.x += Math.sin(time * 0.16 + index) * 0.0008;
            child.position.y += Math.cos(time * 0.14 + index) * 0.00045;
          });

          world.hotspots.forEach((hotspot, index) => {
            const isFocused = targetHotspot?.item.id === hotspot.item.id;
            const pulse = 1 + Math.sin(time * 2.25 + index) * (isFocused ? 0.075 : 0.03);
            hotspot.marker.scale.setScalar(isFocused ? 1.18 * pulse : pulse);
            hotspot.group.position.y +=
              (hotspot.item.position[1] + itemFloat(time, index, isFocused) - hotspot.group.position.y) * 0.025;
          });

          if (world.focusRing.visible && targetHotspot) {
            world.focusRing.scale.setScalar(1 + Math.sin(time * 2.5) * 0.055);
            world.focusRing.position.x += (targetHotspot.group.position.x - world.focusRing.position.x) * 0.09;
            world.focusRing.position.z += (targetHotspot.group.position.z - world.focusRing.position.z) * 0.09;
          }

          world.systemCore.scale.setScalar(1 + Math.sin(time * 2.1) * 0.07);
          updateDataPulses(world.pulses, time, true);

          controls.update();
          renderer.render(scene, camera);
          frameId = window.requestAnimationFrame(animate);
        };

        resize();
        visibilityObserver.observe(mount);
        window.addEventListener('resize', resize);
        mount.addEventListener('pointermove', updateHover, { passive: true });
        mount.addEventListener('pointerleave', clearHover);
        mount.addEventListener('click', handleClick);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        animate();

        cleanup = () => {
          window.cancelAnimationFrame(frameId);
          visibilityObserver.disconnect();
          window.removeEventListener('resize', resize);
          mount.removeEventListener('pointermove', updateHover);
          mount.removeEventListener('pointerleave', clearHover);
          mount.removeEventListener('click', handleClick);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          controls.dispose();
          disposeScene(THREE, scene, renderer);
          renderer.domElement.remove();
        };
      })
      .catch(() => setUseFallback(true));

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  if (useFallback) {
    return <HeroFallback label={fallbackLabel} />;
  }

  return (
    <div className="hero-demo" aria-label="Interactive career map">
      <div className="hero-demo__scene" ref={mountRef} aria-label={label} role="img" />
      <div className="hero-demo__overlay" aria-hidden="true" />
      <p className="hero-demo__caption">Interactive career map</p>
      {hoverLabel && (
        <div
          className="hero-demo__tooltip"
          style={{
            transform: `translate(${hoverLabel.x + 12}px, ${hoverLabel.y - 22}px)`,
          }}
        >
          <strong>{hoverLabel.label}</strong>
          <span>{hoverLabel.role}</span>
        </div>
      )}
      <aside className="career-panel" aria-live="polite">
        <p className="career-panel__eyebrow">Focused area</p>
        <h2>{activeItem.label}</h2>
        <p>{activeItem.description}</p>
        <button type="button" onClick={() => scrollToSection(activeItem.targetSection)}>
          View section
        </button>
      </aside>
      <nav className="career-links" aria-label="Career map fallback navigation">
        {careerMapItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === activeItem.id ? 'is-active' : undefined}
            onClick={() => {
              setActiveItemId(item.id);
              scrollToSection(item.targetSection);
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function itemFloat(time: number, index: number, focused: boolean) {
  const base = focused ? 0.025 : 0.012;
  return Math.sin(time * 1.05 + index * 0.8) * base;
}

export default HeroScene;
