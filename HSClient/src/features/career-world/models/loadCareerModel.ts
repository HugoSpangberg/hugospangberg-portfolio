import type * as Three from 'three';
import type { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getCareerWorldModelUrl } from './careerWorldManifest';
import type { LoadedCareerModel } from './modelTypes';
import { validateRequiredNodes } from './validateCareerModel';

const gltfCache = new Map<string, Promise<GLTF>>();

export function loadCareerModel(
  loader: GLTFLoader,
  THREE: typeof Three,
  file: string,
  requiredNodes: string[],
): Promise<LoadedCareerModel> {
  const url = getCareerWorldModelUrl(file);
  const request =
    gltfCache.get(url) ??
    loader.loadAsync(url).catch((error: unknown) => {
      gltfCache.delete(url);
      throw error;
    });
  gltfCache.set(url, request);

  return request.then((gltf) => {
    const root = gltf.scene.clone(true);
    const anchors = validateRequiredNodes(root, requiredNodes);
    const mixers = gltf.animations.length > 0 ? [new THREE.AnimationMixer(root)] : [];
    mixers.forEach((mixer) => {
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
    });

    return { root, anchors, mixers };
  });
}
