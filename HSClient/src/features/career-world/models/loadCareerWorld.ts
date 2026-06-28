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

const LANDMARK_MODEL_SCALE: Record<string, number> = {
  sodra: 0.64,
  dasa: 0.62,
  visma: 0.66,
  filmstaden: 0.66,
  education: 0.66,
};

const LANDMARK_MODEL_Y_OFFSET: Record<string, number> = {
  sodra: 0.06,
  dasa: 0.03,
  visma: 0.06,
  filmstaden: 0.06,
  education: 0.06,
};

export type LoadedCareerWorldAssets = {
  mixers: Three.AnimationMixer[];
  dispose: () => void;
};

function getMaterials(material: Three.Material | Three.Material[]) {
  return Array.isArray(material) ? material : [material];
}

function setEmissive(material: Three.Material, color: number, intensity: number) {
  const candidate = material as Three.MeshStandardMaterial;

  if (!candidate.emissive || typeof candidate.emissive.setHex !== 'function') {
    return;
  }

  candidate.emissive.setHex(color);
  candidate.emissiveIntensity = Math.max(candidate.emissiveIntensity ?? 0, intensity);
  material.needsUpdate = true;
}

function polishImportedMaterials(root: Three.Object3D, landmarkId: string) {
  root.traverse((object) => {
    const mesh = object as Three.Mesh;

    if (!mesh.isMesh || !mesh.material) {
      return;
    }

    getMaterials(mesh.material).forEach((material) => {
      const name = `${object.name} ${material.name}`.toLowerCase();

      if (name.includes('glass') || name.includes('window') || name.includes('atrium')) {
        if (name.includes('warm') || name.includes('lit') || name.includes('entrance')) {
          setEmissive(material, 0xffd8a0, 0.18);
        }

        if (landmarkId === 'sodra') {
          setEmissive(material, 0x4f9c8e, 0.04);
        }
      }

      if (
        landmarkId === 'filmstaden' &&
        (name.includes('sign') ||
          name.includes('marquee') ||
          name.includes('filmstaden_red') ||
          name.includes('neon'))
      ) {
        setEmissive(material, 0xff5f45, name.includes('sign') ? 0.7 : 0.32);
      }

      if (landmarkId === 'education' && (name.includes('door') || name.includes('entrance'))) {
        setEmissive(material, 0xffcf86, 0.16);
      }
    });
  });
}

function softenFloatingIslandUnderside(root: Three.Object3D) {
  root.traverse((object) => {
    const name = object.name.toLowerCase();

    if (
      name.includes('floatingisland_shadowedrootmass') ||
      name.includes('floatingisland_earthstrata') ||
      name.includes('floatingisland_edgestrata_rib')
    ) {
      object.visible = false;
      return;
    }

    if (name.includes('floatingisland_layerededge')) {
      object.scale.y *= 0.36;
      object.position.y += 0.12;
    }
  });
}

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
  softenFloatingIslandUnderside(environment.root);
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
    model.root.scale.setScalar(LANDMARK_MODEL_SCALE[landmark.id] ?? 0.74);
    model.root.position.set(0, LANDMARK_MODEL_Y_OFFSET[landmark.id] ?? 0.05, 0);
    polishImportedMaterials(model.root, landmark.id);
    hotspot.content.visible = false;
    hotspot.group.add(model.root);
    mountedRoots.push(model.root);

    if (!options.reducedMotion) {
      mixers.push(...model.mixers);
    }
  };

  await Promise.allSettled(manifest.landmarks.map(loadLandmark)).then((results) => {
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn('Career landmark GLB failed; using procedural fallback.', result.reason);
        const landmark = manifest.landmarks[index];
        const hotspot = world.hotspots.find((item) => item.item.id === landmark.id);

        if (hotspot) {
          hotspot.content.visible = true;
        }
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
