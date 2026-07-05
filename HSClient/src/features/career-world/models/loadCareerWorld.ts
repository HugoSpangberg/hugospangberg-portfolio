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

function getMaterials(material: Three.Material | Three.Material[]) {
  return Array.isArray(material) ? material : [material];
}

function setEmissive(material: Three.Material, color: number, intensity: number) {
  const candidate = material as Three.MeshStandardMaterial;

  if (!candidate.emissive || typeof candidate.emissive.setHex !== 'function') {
    return;
  }

  candidate.emissive.setHex(color);
  candidate.emissiveIntensity = intensity;
  material.needsUpdate = true;
}

function hashString(value: string) {
  return [...value].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 17);
}

function polishImportedMaterials(root: Three.Object3D, landmarkId: string) {
  root.traverse((object) => {
    const mesh = object as Three.Mesh;

    if (!mesh.isMesh || !mesh.material) {
      return;
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    getMaterials(mesh.material).forEach((material) => {
      const name = `${object.name} ${material.name}`.toLowerCase();

      if (name.includes('glass') || name.includes('window') || name.includes('atrium')) {
        const shouldWarmWindow =
          name.includes('warm') ||
          name.includes('lit') ||
          name.includes('entrance') ||
          (name.includes('window') && hashString(`${landmarkId}:${object.name}`) % 7 === 0);

        if (shouldWarmWindow) {
          setEmissive(material, 0xffc27a, landmarkId === 'filmstaden' ? 0.18 : 0.12);
        } else {
          setEmissive(material, 0x214d56, 0.022);
        }

        if (landmarkId === 'sodra') {
          setEmissive(material, 0x4f9c8e, 0.025);
        }
      }

      if (
        landmarkId === 'filmstaden' &&
        (name.includes('sign') ||
          name.includes('marquee') ||
          name.includes('filmstaden_red') ||
          name.includes('neon'))
      ) {
        setEmissive(material, 0xff6a42, name.includes('sign') ? 0.42 : 0.24);
      }

      if (landmarkId === 'education' && (name.includes('door') || name.includes('entrance'))) {
        setEmissive(material, 0xffcf86, 0.14);
      }
    });
  });
}

function prepareEnvironmentMeshes(root: Three.Object3D) {
  root.traverse((object) => {
    const mesh = object as Three.Mesh;

    if (!mesh.isMesh) {
      return;
    }

    mesh.castShadow = false;
    mesh.receiveShadow = true;
  });
}

function softenFloatingIslandUnderside(root: Three.Object3D) {
  root.traverse((object) => {
    const name = object.name.toLowerCase();

    if (
      name.includes('floatingisland_shadowedrootmass') ||
      name.includes('floatingisland_earthstrata') ||
      name.includes('floatingisland_edgestrata_rib') ||
      name.includes('floatingisland_layerededge')
    ) {
      object.visible = false;
    }
  });
}

const LANDMARK_ENVIRONMENT_ANCHORS: Record<string, string> = {
  dasa: 'Anchor_Dasa',
  education: 'Anchor_Education',
  filmstaden: 'Anchor_Filmstaden',
  sodra: 'Anchor_Sodra',
  visma: 'Anchor_Visma',
};

function updatePulseGeometry(pulse: CareerWorldHandle['pulses'][number]) {
  pulse.line.geometry.setFromPoints([pulse.from, pulse.to]);
  pulse.line.geometry.computeBoundingSphere();
}

function alignHotspotsToEnvironmentAnchors(
  THREE: typeof Three,
  world: CareerWorldHandle,
  environmentAnchors: Map<string, Three.Object3D>,
) {
  const worldPosition = new THREE.Vector3();
  const localPosition = new THREE.Vector3();

  world.group.updateWorldMatrix(true, true);

  world.hotspots.forEach((hotspot, index) => {
    const anchorName = LANDMARK_ENVIRONMENT_ANCHORS[hotspot.item.id];
    const anchor = anchorName ? environmentAnchors.get(anchorName) : undefined;

    if (!anchor) {
      return;
    }

    anchor.getWorldPosition(worldPosition);
    localPosition.copy(worldPosition);
    world.group.worldToLocal(localPosition);
    hotspot.group.position.copy(localPosition);
    hotspot.basePosition.copy(localPosition);

    const pulse = world.pulses[index];
    if (pulse) {
      pulse.from.set(localPosition.x, localPosition.y + 0.45, localPosition.z);
      updatePulseGeometry(pulse);
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
  prepareEnvironmentMeshes(environment.root);
  world.proceduralBase.visible = false;
  world.group.add(environment.root);
  alignHotspotsToEnvironmentAnchors(THREE, world, environment.anchors);
  mountedRoots.push(environment.root);

  const loadLandmark = async (landmark: (typeof manifest.landmarks)[number]) => {
    const hotspot = world.hotspots.find((item) => item.item.id === landmark.id);

    if (!hotspot) {
      throw new Error(`Unknown career hotspot id in manifest: ${landmark.id}`);
    }

    const model = await loadCareerModel(loader, THREE, landmark.file, landmark.requiredNodes);
    model.root.name = `GLB_${landmark.id}`;
    model.root.position.set(0, 0, 0);
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
