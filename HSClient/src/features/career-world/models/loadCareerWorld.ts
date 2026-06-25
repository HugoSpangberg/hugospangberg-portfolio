import type * as Three from 'three';
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { CareerWorldHandle } from '../../../components/hero/CareerWorld';
import { fetchCareerWorldManifest } from './careerWorldManifest';
import { loadCareerModel } from './loadCareerModel';

type LoadCareerWorldOptions = {
  reducedMotion: boolean;
  signal: AbortSignal;
  onProgress?: (loaded: number, total: number) => void;
};

export type LoadedCareerWorldAssets = {
  mixers: Three.AnimationMixer[];
  dispose: () => void;
};

export async function loadCareerWorldAssets(
  THREE: typeof Three,
  Loader: new (manager?: Three.LoadingManager) => GLTFLoader,
  world: CareerWorldHandle,
  options: LoadCareerWorldOptions,
): Promise<LoadedCareerWorldAssets> {
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_url, loaded, total) => options.onProgress?.(loaded, total);
  const loader = new Loader(manager);
  const manifest = await fetchCareerWorldManifest(options.signal);
  const mixers: Three.AnimationMixer[] = [];
  const mountedRoots: Three.Object3D[] = [];

  const environment = await loadCareerModel(
    loader,
    THREE,
    manifest.environment.file,
    manifest.environment.requiredNodes,
  );
  environment.root.name = 'GLB_CareerWorldEnvironment';
  environment.root.position.y = -0.42;
  world.proceduralBase.visible = false;
  world.group.add(environment.root);
  mountedRoots.push(environment.root);

  const loadLandmark = async (landmark: (typeof manifest.landmarks)[number]) => {
    const hotspot = world.hotspots.find((item) => item.item.id === landmark.id);

    if (!hotspot) {
      throw new Error(`Unknown career hotspot id in manifest: ${landmark.id}`);
    }

    const model = await loadCareerModel(loader, THREE, landmark.file, landmark.requiredNodes);
    model.root.name = `GLB_${landmark.id}`;
    model.root.scale.setScalar(0.38);
    model.root.position.set(0, -0.05, 0);
    hotspot.content.visible = false;
    hotspot.group.add(model.root);
    mountedRoots.push(model.root);

    if (!options.reducedMotion) {
      mixers.push(...model.mixers);
    }
  };

  await Promise.allSettled(manifest.landmarks.map(loadLandmark)).then((results) => {
    results.forEach((result) => {
      if (result.status === 'rejected') {
        console.warn('Career landmark GLB failed; using procedural fallback.', result.reason);
      }
    });
  });

  return {
    mixers,
    dispose: () => {
      mountedRoots.forEach((root) => root.removeFromParent());
      mixers.forEach((mixer) => mixer.stopAllAction());
    },
  };
}
