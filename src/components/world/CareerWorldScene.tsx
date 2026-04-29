import { useEffect, useRef, useState } from 'react';
import type * as Three from 'three';
import { createAurora } from '../hero/Aurora';
import { createCareerWorld, type CareerWorldHotspot } from '../hero/CareerWorld';
import { updateDataPulses } from '../hero/DataPulse';
import { createSpaceBackdrop } from '../hero/SpaceBackdrop';
import { careerMapItems } from '../hero/careerMap';
import WorldFallback from './WorldFallback';
import type { CareerWorldLocation } from './careerLocations';

type CareerWorldSceneProps = {
  label: string;
  fallbackLabel: string;
  locations: CareerWorldLocation[];
  onSelectLocation: (location: CareerWorldLocation) => void;
};

type PointerState = {
  label: string;
  role: string;
  x: number;
  y: number;
};

function getCameraConfig(width: number) {
  if (width < 720) {
    return {
      fov: 62,
      position: [-0.08, 4.15, 10.4] as const,
      target: [-0.22, -0.12, -0.06] as const,
      worldScale: 0.68,
      pixelRatio: 1.15,
    };
  }

  if (width < 1120) {
    return {
      fov: 50,
      position: [0.3, 3.0, 7.65] as const,
      target: [0.02, -0.08, -0.06] as const,
      worldScale: 1.08,
      pixelRatio: 1.35,
    };
  }

  return {
    fov: 42,
    position: [0.34, 2.35, 6.35] as const,
    target: [0.02, -0.02, -0.05] as const,
    worldScale: 1.22,
    pixelRatio: 1.5,
  };
}

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

function CareerWorldScene({
  label,
  fallbackLabel,
  locations,
  onSelectLocation,
}: CareerWorldSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [sceneStatus, setSceneStatus] = useState<
    'checking' | 'loading' | 'ready' | 'unsupported' | 'reduced-motion' | 'error'
  >('checking');
  const [activeItemId, setActiveItemId] = useState(careerMapItems[0].id);
  const [hoverLabel, setHoverLabel] = useState<PointerState | null>(null);
  const locationsRef = useRef(locations);
  const onSelectLocationRef = useRef(onSelectLocation);

  useEffect(() => {
    locationsRef.current = locations;
    onSelectLocationRef.current = onSelectLocation;
  }, [locations, onSelectLocation]);

  useEffect(() => {
    const mount = mountRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!mount) {
      return undefined;
    }

    if (reducedMotion) {
      setSceneStatus('reduced-motion');
      return undefined;
    }

    if (!supportsWebGL()) {
      setSceneStatus('unsupported');
      return undefined;
    }

    setSceneStatus('loading');
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
        const initialCamera = getCameraConfig(window.innerWidth);
        let frameId = 0;
        let isSceneVisible = true;
        let isDocumentVisible = document.visibilityState === 'visible';
        let activeHotspot: CareerWorldHotspot | undefined;
        let hoveredHotspot: CareerWorldHotspot | undefined;
        const pointer = new THREE.Vector2(8, 8);
        const raycaster = new THREE.Raycaster();
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x071713, compact ? 0.072 : 0.085);

        const ambientFill = new THREE.AmbientLight(0xc8eee4, compact ? 0.56 : 0.46);
        const skyFill = new THREE.HemisphereLight(0xd5f4ee, 0x10271f, compact ? 1.02 : 0.88);
        const moonLight = new THREE.DirectionalLight(0xe2fff8, compact ? 1.55 : 1.38);
        moonLight.position.set(-3.6, 5.8, 4.2);
        const rimLight = new THREE.DirectionalLight(0x82e2ff, compact ? 1.0 : 0.84);
        rimLight.position.set(4.2, 3.25, -4.8);
        const forestGlow = new THREE.PointLight(0x72f2a3, compact ? 1.62 : 1.35, 4.8);
        forestGlow.position.set(-1.35, 0.48, -1.08);
        const warmGlow = new THREE.PointLight(0xf1d48d, compact ? 1.34 : 1.12, 3.6);
        warmGlow.position.set(0.25, 0.35, 1.35);
        const techGlow = new THREE.PointLight(0x77d8f7, compact ? 1.55 : 1.28, 4.2);
        techGlow.position.set(1.55, 0.55, -0.82);
        const officeGlow = new THREE.PointLight(0xb7f4d6, compact ? 0.72 : 0.56, 2.6);
        officeGlow.position.set(-2.12, 0.2, 0.24);
        const learningGlow = new THREE.PointLight(0xc4a5ff, compact ? 0.74 : 0.58, 2.6);
        learningGlow.position.set(1.75, 0.24, 1.02);
        scene.add(ambientFill, skyFill, moonLight, rimLight, forestGlow, warmGlow, techGlow, officeGlow, learningGlow);

        const camera = new THREE.PerspectiveCamera(initialCamera.fov, 1, 0.1, 48);
        camera.position.set(
          initialCamera.position[0],
          initialCamera.position[1],
          initialCamera.position[2],
        );

        const renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
        });

        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, initialCamera.pixelRatio));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = compact ? 1.24 : 1.12;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.style.touchAction = 'pan-y';
        mount.appendChild(renderer.domElement);

        const controls = new controlsModule.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.rotateSpeed = 0.45;
        controls.minDistance = 5.15;
        controls.maxDistance = 7.3;
        controls.minPolarAngle = Math.PI * 0.23;
        controls.maxPolarAngle = Math.PI * (compact ? 0.5 : 0.45);
        controls.minAzimuthAngle = -Math.PI * 0.24;
        controls.maxAzimuthAngle = Math.PI * 0.24;
        controls.target.set(
          initialCamera.target[0],
          initialCamera.target[1],
          initialCamera.target[2],
        );
        renderer.domElement.style.touchAction = 'pan-y';

        const world = createCareerWorld(THREE, compact);
        const backdrop = createSpaceBackdrop(THREE, compact);
        const aurora = createAurora(THREE);
        world.group.scale.setScalar(initialCamera.worldScale);
        world.group.rotation.x = -0.05;
        scene.add(backdrop, aurora, world.group);
        activeHotspot = world.hotspots[0];
        world.focusRing.visible = true;

        const resize = () => {
          const { width, height } = mount.getBoundingClientRect();
          const cameraConfig = getCameraConfig(width);
          renderer.setSize(width, height, false);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, cameraConfig.pixelRatio));
          renderer.toneMappingExposure = width < 720 ? 1.24 : 1.12;
          camera.aspect = width / Math.max(height, 1);
          camera.fov = cameraConfig.fov;
          camera.position.set(
            cameraConfig.position[0],
            cameraConfig.position[1],
            cameraConfig.position[2],
          );
          camera.updateProjectionMatrix();
          controls.target.set(
            cameraConfig.target[0],
            cameraConfig.target[1],
            cameraConfig.target[2],
          );
          controls.maxPolarAngle = Math.PI * (width < 720 ? 0.5 : 0.45);
          world.group.scale.setScalar(cameraConfig.worldScale);
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
          world.focusRing.position.set(hotspot.group.position.x, -0.58, hotspot.group.position.z);
          world.focusRing.visible = true;

          if (event) {
            const bounds = mount.getBoundingClientRect();
            const location =
              locationsRef.current.find((item) => item.id === hotspot.item.id) ?? hotspot.item;
            setHoverLabel({
              label: location.label,
              role: location.role,
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
          const location = locationsRef.current.find((item) => item.id === hotspot.item.id);

          if (location) {
            onSelectLocationRef.current(location);
          }
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

        const handleContextLost = (event: Event) => {
          event.preventDefault();
          setSceneStatus('loading');
        };

        const handleContextRestored = () => {
          setSceneStatus('ready');
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
            if ('opacity' in hotspot.marker.material) {
              hotspot.marker.material.opacity = isFocused ? 0.72 : 0.36;
            }
            if ('opacity' in hotspot.beacon.material) {
              hotspot.beacon.material.opacity = isFocused ? 0.95 : 0.68;
            }
            hotspot.beacon.scale.setScalar(isFocused ? 1.32 * pulse : 1.02 * pulse);
            hotspot.group.position.y +=
              (hotspot.item.position[1] + itemFloat(time, index, isFocused) - hotspot.group.position.y) * 0.025;
          });

          if (world.focusRing.visible && targetHotspot) {
            world.focusRing.scale.setScalar(1 + Math.sin(time * 2.5) * 0.055);
            world.focusRing.position.x += (targetHotspot.group.position.x - world.focusRing.position.x) * 0.09;
            world.focusRing.position.z += (targetHotspot.group.position.z - world.focusRing.position.z) * 0.09;
          }

          world.systemCore.scale.setScalar(1 + Math.sin(time * 2.1) * 0.07);
          world.animatedNodes.forEach((node, index) => {
            node.scale.setScalar(1 + Math.sin(time * 1.7 + index * 0.5) * 0.045);
          });
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
        renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
        renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        setSceneStatus('ready');
        animate();

        cleanup = () => {
          window.cancelAnimationFrame(frameId);
          visibilityObserver.disconnect();
          window.removeEventListener('resize', resize);
          mount.removeEventListener('pointermove', updateHover);
          mount.removeEventListener('pointerleave', clearHover);
          mount.removeEventListener('click', handleClick);
          renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
          renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          controls.dispose();
          disposeScene(THREE, scene, renderer);
          renderer.domElement.remove();
        };
      })
      .catch((error) => {
        console.error('Career world failed to initialize', error);
        setSceneStatus('error');
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  if (
    sceneStatus === 'unsupported' ||
    sceneStatus === 'reduced-motion' ||
    sceneStatus === 'error'
  ) {
    return (
      <WorldFallback
        label={fallbackLabel}
        locations={locations}
        onSelectLocation={onSelectLocation}
      />
    );
  }

  return (
    <div className="world-scene" aria-label="Interactive career world">
      <div className="world-scene__canvas" ref={mountRef} aria-label={label} role="img" />
      <div className="world-scene__shade" aria-hidden="true" />
      {sceneStatus !== 'ready' && (
        <div className="world-loading" aria-live="polite">
          Loading career world
        </div>
      )}
      {hoverLabel && (
        <div
          className="world-tooltip"
          style={{
            transform: `translate(${hoverLabel.x + 12}px, ${hoverLabel.y - 22}px)`,
          }}
        >
          <strong>{hoverLabel.label}</strong>
          <span>{hoverLabel.role}</span>
        </div>
      )}
      <nav className="world-nav" aria-label="Career world navigation">
        {careerMapItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === activeItemId ? 'is-active' : undefined}
            onClick={() => {
              setActiveItemId(item.id);
              const location = locations.find((locationItem) => locationItem.id === item.id);

              if (location) {
                onSelectLocation(location);
              }
            }}
          >
            {locations.find((location) => location.id === item.id)?.label ?? item.label}
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

export default CareerWorldScene;
