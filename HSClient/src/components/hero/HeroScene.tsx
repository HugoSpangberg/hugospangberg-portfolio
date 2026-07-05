import { useEffect, useMemo, useRef, useState } from 'react';
import type * as Three from 'three';
import { createCareerWorld, type CareerWorldHotspot } from './CareerWorld';
import { updateDataPulses } from './DataPulse';
import HeroFallback from './HeroFallback';
import { SceneBackdrop } from './SceneBackdrop';
import { careerMapItems, getCareerMapItem, type CareerMapItem } from './careerMap';

type HeroSceneProps = {
  label: string;
  fallbackLabel: string;
};

type PointerState = {
  id: string;
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

function HoverVisual({ item }: { item?: CareerMapItem }) {
  if (!item?.hoverVisual) {
    return null;
  }

  if (item.hoverVisual.kind === 'educationLogos') {
    return (
      <div className="hero-demo__tooltip-logos" aria-hidden="true">
        {item.hoverVisual.logos.map((logo) => (
          <span
            key={logo.label}
            className={`hero-demo__tooltip-logo hero-demo__tooltip-logo--${logo.tone}`}
          >
            {logo.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <figure className="hero-demo__tooltip-media">
      <img src={item.hoverVisual.src} alt={item.hoverVisual.alt} loading="lazy" decoding="async" />
      <figcaption>{item.hoverVisual.caption}</figcaption>
    </figure>
  );
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
  const hoverItem = hoverLabel ? getCareerMapItem(hoverLabel.id) : undefined;

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
        scene.fog = new THREE.FogExp2(0x10251f, compact ? 0.088 : 0.074);
        const moonFill = new THREE.HemisphereLight(0x9fd0dc, 0x07120f, compact ? 0.4 : 0.34);
        const moonKey = new THREE.DirectionalLight(0xbfd9e7, compact ? 0.98 : 0.9);
        moonKey.position.set(-5.2, 4.2, 5.8);
        const facadeFillTarget = new THREE.Object3D();
        facadeFillTarget.position.set(0.04, -0.2, -0.1);
        const facadeFill = new THREE.SpotLight(0xbde8e5, compact ? 1.75 : 1.52, 10, Math.PI * 0.38, 0.82, 1.2);
        facadeFill.position.set(0.6, 1.8, 6.2);
        facadeFill.target = facadeFillTarget;
        const cyanRim = new THREE.DirectionalLight(0x74d7ff, compact ? 0.7 : 0.6);
        cyanRim.position.set(4.8, 2.8, -5.6);
        const warmCinemaFill = new THREE.PointLight(0xffb16d, compact ? 0.62 : 0.52, 3.2, 2.2);
        warmCinemaFill.position.set(0.05, 0.35, -1.24);
        const forestFill = new THREE.PointLight(0x72f2a3, compact ? 0.34 : 0.28, 4.0, 2.2);
        forestFill.position.set(-2.2, 0.42, -1.85);
        scene.add(moonFill, moonKey, facadeFillTarget, facadeFill, cyanRim, warmCinemaFill, forestFill);

        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 38);
        camera.position.set(compact ? 0.35 : 0.25, compact ? 2.3 : 2.05, compact ? 6.7 : 5.6);

        const renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
        });

        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.2 : 1.55));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = compact ? 0.96 : 0.92;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
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
        world.group.scale.setScalar(compact ? 0.92 : 1.06);
        world.group.rotation.x = -0.05;
        scene.add(world.group);
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
            -0.3,
            hotspot.group.position.z,
          );
          world.focusRing.visible = true;

          if (event) {
            const bounds = mount.getBoundingClientRect();
            setHoverLabel({
              id: hotspot.item.id,
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
          world.hotspots.forEach((hotspot, index) => {
            const isFocused = targetHotspot?.item.id === hotspot.item.id;
            const pulse = 1 + Math.sin(time * 2.25 + index) * (isFocused ? 0.075 : 0.03);
            const outwardPulse = (time * 0.45 + index * 0.14) % 1;
            const pulseMaterial = hotspot.pulseRing.material as Three.MeshBasicMaterial;
            const haloMaterial = hotspot.hoverHalo.material as Three.MeshBasicMaterial;
            hotspot.marker.scale.setScalar(isFocused ? 1.18 * pulse : pulse);
            hotspot.hoverHalo.scale.setScalar(isFocused ? 1.06 + Math.sin(time * 2.2 + index) * 0.055 : 0.72);
            haloMaterial.opacity = isFocused ? 0.22 : 0.055;
            hotspot.pulseRing.scale.setScalar(0.8 + outwardPulse * (isFocused ? 0.84 : 0.48));
            pulseMaterial.opacity = isFocused ? 0.28 * (1 - outwardPulse) : 0.12 * (1 - outwardPulse);
            hotspot.group.position.y +=
              (hotspot.basePosition.y + itemFloat(time, index, isFocused) - hotspot.group.position.y) * 0.025;
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
      <SceneBackdrop />
      <div className="hero-demo__scene" ref={mountRef} aria-label={label} role="img" />
      <div className="hero-demo__overlay" aria-hidden="true" />
      <p className="hero-demo__caption">Interactive career map</p>
      {hoverLabel && (
        <div
          className={`hero-demo__tooltip${hoverItem?.hoverVisual ? ' hero-demo__tooltip--with-media' : ''}`}
          style={{
            transform: `translate(${hoverLabel.x + 12}px, ${hoverLabel.y - 22}px)`,
          }}
        >
          <HoverVisual item={hoverItem} />
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
