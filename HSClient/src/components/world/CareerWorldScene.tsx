import { useEffect, useMemo, useRef, useState } from 'react';
import type * as Three from 'three';
import {
  createCareerWorld,
  type CareerWorldHotspot,
  type CareerWorldLabels,
} from '../hero/CareerWorld';
import { updateDataPulses } from '../hero/DataPulse';
import { careerMapItems, getCareerMapItem, type CareerMapItem } from '../hero/careerMap';
import { loadCareerWorldAssets } from '../../features/career-world';
import WorldFallback from './WorldFallback';
import type { Locale } from '../../data/content';
import type { CareerWorldLocation } from './careerLocations';

type CareerWorldSceneProps = {
  label: string;
  fallbackLabel: string;
  locale: Locale;
  locations: CareerWorldLocation[];
  onSelectLocation: (location: CareerWorldLocation) => void;
  isExpanded: boolean;
};

type PointerState = {
  id: string;
  label: string;
  role: string;
  x: number;
  y: number;
};

function getCameraConfig(width: number, isExpanded = false) {
  if (isExpanded && width < 720) {
    return {
      fov: 55,
      position: [0.08, 4.32, 13.05] as const,
      target: [0.08, -0.1, 0.1] as const,
      worldScale: 0.41,
      pixelRatio: 1.2,
    };
  }

  if (width < 720) {
    return {
      fov: 56,
      position: [0.04, 4.36, 13.75] as const,
      target: [0.06, -0.1, 0.1] as const,
      worldScale: 0.36,
      pixelRatio: 1.15,
    };
  }

  if (width < 1120) {
    return {
      fov: 48,
      position: [0.24, 4.32, 11.35] as const,
      target: [0.1, -0.06, 0.1] as const,
      worldScale: 0.54,
      pixelRatio: 1.35,
    };
  }

  return {
    fov: 43,
    position: [0.36, 3.98, 10.25] as const,
    target: [0.12, -0.04, 0.1] as const,
    worldScale: 0.58,
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

function HoverVisual({ item }: { item?: CareerMapItem }) {
  if (!item?.hoverVisual) {
    return null;
  }

  if (item.hoverVisual.kind === 'educationLogos') {
    return (
      <div className="hero-demo__tooltip-logos world-tooltip__logos" aria-hidden="true">
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
    <figure className="hero-demo__tooltip-media world-tooltip__media">
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

function CareerWorldScene({
  label,
  fallbackLabel,
  locale,
  locations,
  onSelectLocation,
  isExpanded,
}: CareerWorldSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [sceneStatus, setSceneStatus] = useState<
    'checking' | 'loading' | 'ready' | 'unsupported' | 'reduced-motion' | 'error'
  >('checking');
  const [activeItemId, setActiveItemId] = useState(careerMapItems[0].id);
  const [hoverLabel, setHoverLabel] = useState<PointerState | null>(null);
  const locationsRef = useRef(locations);
  const onSelectLocationRef = useRef(onSelectLocation);
  const isExpandedRef = useRef(isExpanded);
  const worldLabels = useMemo<CareerWorldLabels>(
    () => ({
      hub: locale === 'sv' ? 'Karriärhubb' : 'Career Hub',
      locations: Object.fromEntries(
        locations.map((location) => [location.id, location.sceneLabel]),
      ),
    }),
    [locale, locations],
  );
  const worldLabelsRef = useRef(worldLabels);
  const isSwedish = locale === 'sv';
  const hoverItem = hoverLabel ? getCareerMapItem(hoverLabel.id) : undefined;

  useEffect(() => {
    locationsRef.current = locations;
    onSelectLocationRef.current = onSelectLocation;
    worldLabelsRef.current = worldLabels;
  }, [locations, onSelectLocation, worldLabels]);

  useEffect(() => {
    isExpandedRef.current = isExpanded;
    window.dispatchEvent(new Event('resize'));
  }, [isExpanded]);

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
      import('three/examples/jsm/loaders/GLTFLoader.js'),
    ])
      .then(([THREE, controlsModule, loaderModule]) => {
        if (cancelled || !mountRef.current) {
          return;
        }

        const compact = window.innerWidth < 720;
        const initialCamera = getCameraConfig(window.innerWidth, isExpandedRef.current);
        let frameId = 0;
        let isSceneVisible = true;
        let isDocumentVisible = document.visibilityState === 'visible';
        let activeHotspot: CareerWorldHotspot | undefined;
        let hoveredHotspot: CareerWorldHotspot | undefined;
        const pointer = new THREE.Vector2(8, 8);
        const raycaster = new THREE.Raycaster();
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x12342e, compact ? 0.045 : 0.052);

        const ambientFill = new THREE.AmbientLight(0xd9eee4, compact ? 0.5 : 0.44);
        const skyFill = new THREE.HemisphereLight(0xe9fff7, 0x18372f, compact ? 0.86 : 0.78);
        const keyLight = new THREE.DirectionalLight(0xf4fff6, compact ? 1.34 : 1.26);
        keyLight.position.set(-4.8, 6.9, 4.2);
        const rimLight = new THREE.DirectionalLight(0x99e7df, compact ? 0.94 : 0.88);
        rimLight.position.set(4.8, 4.0, -5.8);
        const forestGlow = new THREE.PointLight(0x72f2a3, compact ? 1.16 : 0.98, 4.6);
        forestGlow.position.set(-3.1, 0.65, -1.65);
        const warmGlow = new THREE.PointLight(0xf1b26f, compact ? 1.22 : 1.08, 3.9);
        warmGlow.position.set(0.0, 0.58, -1.85);
        const techGlow = new THREE.PointLight(0x77d8f7, compact ? 1.18 : 1.0, 4.2);
        techGlow.position.set(3.1, 0.62, 1.68);
        const officeGlow = new THREE.PointLight(0xb7f4d6, compact ? 0.78 : 0.64, 3.2);
        officeGlow.position.set(-3.1, 0.5, 1.55);
        const learningGlow = new THREE.PointLight(0xc4a5ff, compact ? 0.82 : 0.68, 3.0);
        learningGlow.position.set(3.0, 0.52, -1.35);
        scene.add(ambientFill, skyFill, keyLight, rimLight, forestGlow, warmGlow, techGlow, officeGlow, learningGlow);

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
        renderer.toneMappingExposure = compact ? 1.08 : 1.06;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.style.touchAction = isExpandedRef.current ? 'none' : 'pan-y';
        mount.appendChild(renderer.domElement);

        const controls = new controlsModule.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = isExpandedRef.current && compact;
        controls.enableRotate = true;
        controls.rotateSpeed = 0.45;
        controls.zoomSpeed = 0.55;
        controls.minDistance = compact ? 5.4 : 5.15;
        controls.maxDistance = compact ? 8.8 : 7.3;
        controls.minPolarAngle = Math.PI * 0.23;
        controls.maxPolarAngle = Math.PI * (compact ? 0.5 : 0.45);
        controls.minAzimuthAngle = -Math.PI * (isExpandedRef.current && compact ? 0.38 : 0.24);
        controls.maxAzimuthAngle = Math.PI * (isExpandedRef.current && compact ? 0.38 : 0.24);
        controls.target.set(
          initialCamera.target[0],
          initialCamera.target[1],
          initialCamera.target[2],
        );
        renderer.domElement.style.touchAction = 'pan-y';

        const world = createCareerWorld(THREE, compact, worldLabelsRef.current);
        const abortController = new AbortController();
        let loadedAssets: Awaited<ReturnType<typeof loadCareerWorldAssets>> | undefined;
        world.group.scale.setScalar(initialCamera.worldScale);
        world.group.rotation.x = -0.05;
        activeHotspot = world.hotspots[0];

        const setInteractiveLayerVisible = (visible: boolean) => {
          world.hotspots.forEach((hotspot) => {
            hotspot.marker.visible = visible;
            hotspot.beacon.visible = visible;
            hotspot.pulseRing.visible = visible;
            hotspot.hoverHalo.visible = visible;
            hotspot.hitTarget.visible = visible;
          });
          world.focusRing.visible = visible;
          world.systemCore.visible = visible;
        };

        const showLoadedWorld = () => {
          world.group.visible = true;
          world.proceduralBase.visible = false;
          setInteractiveLayerVisible(true);

          if (activeHotspot) {
            world.focusRing.position.set(activeHotspot.group.position.x, -0.3, activeHotspot.group.position.z);
          }
        };

        const showProceduralFallbackWorld = () => {
          world.group.visible = true;
          world.proceduralBase.visible = true;
          world.hotspots.forEach((hotspot) => {
            hotspot.content.visible = true;
          });
          setInteractiveLayerVisible(true);

          if (activeHotspot) {
            world.focusRing.position.set(activeHotspot.group.position.x, -0.3, activeHotspot.group.position.z);
          }
        };

        world.group.visible = false;
        world.proceduralBase.visible = false;
        world.hotspots.forEach((hotspot) => {
          hotspot.content.visible = false;
        });
        setInteractiveLayerVisible(false);
        scene.add(world.group);

        void loadCareerWorldAssets(THREE, loaderModule.GLTFLoader, world, {
          reducedMotion,
          signal: abortController.signal,
        })
          .then((assets) => {
            if (cancelled) {
              assets.dispose();
              return;
            }

            loadedAssets = assets;
            showLoadedWorld();
            setSceneStatus('ready');
          })
          .catch((error) => {
            if (cancelled) {
              return;
            }

            console.warn('Career world GLB assets unavailable; procedural fallback remains active.', error);
            showProceduralFallbackWorld();
            setSceneStatus('ready');
          });

        const resize = () => {
          const { width, height } = mount.getBoundingClientRect();
          const expanded = isExpandedRef.current;
          const cameraConfig = getCameraConfig(width, expanded);
          renderer.setSize(width, height, false);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, cameraConfig.pixelRatio));
          renderer.toneMappingExposure = width < 720 ? 1.08 : 1.06;
          renderer.domElement.style.touchAction = expanded && width < 720 ? 'none' : 'pan-y';
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
          controls.enableZoom = expanded && width < 720;
          controls.minDistance = width < 720 ? 5.4 : 5.15;
          controls.maxDistance = width < 720 ? 8.8 : 7.3;
          controls.maxPolarAngle = Math.PI * (width < 720 ? 0.5 : 0.45);
          controls.minAzimuthAngle = -Math.PI * (expanded && width < 720 ? 0.38 : 0.24);
          controls.maxAzimuthAngle = Math.PI * (expanded && width < 720 ? 0.38 : 0.24);
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
          world.focusRing.position.set(hotspot.group.position.x, -0.3, hotspot.group.position.z);
          world.focusRing.visible = true;

          if (event) {
            const bounds = mount.getBoundingClientRect();
            const location =
              locationsRef.current.find((item) => item.id === hotspot.item.id) ?? hotspot.item;
            setHoverLabel({
              id: hotspot.item.id,
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
        const resizeObserver = new ResizeObserver(() => resize());

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
          world.hotspots.forEach((hotspot, index) => {
            const isFocused = targetHotspot?.item.id === hotspot.item.id;
            const softPulse = 1 + Math.sin(time * 2.0 + index) * (isFocused ? 0.08 : 0.035);
            const outwardPulse = (time * 0.45 + index * 0.14) % 1;
            const markerMaterial = hotspot.marker.material as Three.MeshBasicMaterial;
            const beaconMaterial = hotspot.beacon.material as Three.MeshBasicMaterial;
            const pulseMaterial = hotspot.pulseRing.material as Three.MeshBasicMaterial;
            const haloMaterial = hotspot.hoverHalo.material as Three.MeshBasicMaterial;

            hotspot.marker.scale.setScalar(isFocused ? 1.22 * softPulse : 1.02 * softPulse);
            markerMaterial.opacity = isFocused ? 0.92 : 0.5;
            beaconMaterial.opacity = isFocused ? 1 : 0.68;
            hotspot.beacon.scale.setScalar(isFocused ? 1.38 * softPulse : 1.02 * softPulse);
            hotspot.hoverHalo.scale.setScalar(isFocused ? 1.08 + Math.sin(time * 2.2 + index) * 0.06 : 0.72);
            haloMaterial.opacity = isFocused ? 0.24 : 0.055;
            hotspot.pulseRing.scale.setScalar(0.78 + outwardPulse * (isFocused ? 0.9 : 0.54));
            pulseMaterial.opacity = isFocused
              ? 0.42 * (1 - outwardPulse)
              : 0.2 * (1 - outwardPulse);
            hotspot.group.position.y +=
              (hotspot.item.position[1] + itemFloat(time, index, isFocused) - hotspot.group.position.y) * 0.025;
          });

          if (world.focusRing.visible && targetHotspot) {
            const focusMaterial = world.focusRing.material as Three.MeshBasicMaterial;
            world.focusRing.scale.setScalar(1.04 + Math.sin(time * 2.5) * 0.09);
            focusMaterial.opacity = 0.72 + Math.sin(time * 3.1) * 0.12;
            world.focusRing.position.x += (targetHotspot.group.position.x - world.focusRing.position.x) * 0.09;
            world.focusRing.position.z += (targetHotspot.group.position.z - world.focusRing.position.z) * 0.09;
          }

          world.systemCore.scale.setScalar(1 + Math.sin(time * 2.1) * 0.07);
          world.animatedNodes.forEach((node, index) => {
            node.scale.setScalar(1 + Math.sin(time * 1.7 + index * 0.5) * 0.045);
          });
          updateDataPulses(world.pulses, time, true);
          loadedAssets?.mixers.forEach((mixer) => mixer.update(0.016));

          controls.update();
          renderer.render(scene, camera);
          frameId = window.requestAnimationFrame(animate);
        };

        resize();
        visibilityObserver.observe(mount);
        resizeObserver.observe(mount);
        window.addEventListener('resize', resize);
        mount.addEventListener('pointermove', updateHover, { passive: true });
        mount.addEventListener('pointerleave', clearHover);
        mount.addEventListener('click', handleClick);
        renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
        renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        animate();

        cleanup = () => {
          window.cancelAnimationFrame(frameId);
          visibilityObserver.disconnect();
          resizeObserver.disconnect();
          window.removeEventListener('resize', resize);
          mount.removeEventListener('pointermove', updateHover);
          mount.removeEventListener('pointerleave', clearHover);
          mount.removeEventListener('click', handleClick);
          abortController.abort();
          loadedAssets?.dispose();
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
    <div className={isExpanded ? 'world-scene is-expanded' : 'world-scene'} aria-label={label}>
      <div className="world-scene__canvas" ref={mountRef} aria-label={label} role="img" />
      <div className="world-scene__shade" aria-hidden="true" />
      {sceneStatus !== 'ready' && (
        <div className="world-loading" aria-live="polite">
          {isSwedish ? 'Laddar karriärvärld' : 'Loading career world'}
        </div>
      )}
      {hoverLabel && (
        <div
          className={`world-tooltip${hoverItem?.hoverVisual ? ' world-tooltip--with-media' : ''}`}
          style={{
            transform: `translate(${hoverLabel.x + 12}px, ${hoverLabel.y - 22}px)`,
          }}
        >
          <HoverVisual item={hoverItem} />
          <strong>{hoverLabel.label}</strong>
          <span>{hoverLabel.role}</span>
        </div>
      )}
      <nav className="world-nav" aria-label={isSwedish ? 'Karriärvärldsnavigering' : 'Career world navigation'}>
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
