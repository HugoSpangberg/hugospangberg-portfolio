import type * as Three from 'three';

export type CareerWorldModelStats = {
  fileSize: number;
  triangleCount: number;
  meshCount: number;
  materialCount: number;
  textureCount: number;
  animations: string[];
  objects: string[];
  dimensions: [number, number, number];
};

export type CareerWorldManifestLandmark = {
  id: string;
  file: string;
  rootNode: string;
  requiredNodes: string[];
  animations: string[];
  stats?: CareerWorldModelStats;
};

export type CareerWorldManifest = {
  version: number;
  generatedBy: string;
  fallback: 'procedural';
  environment: {
    file: string;
    requiredNodes: string[];
    stats?: CareerWorldModelStats;
  };
  landmarks: CareerWorldManifestLandmark[];
};

export type LoadedCareerModel = {
  root: Three.Group;
  anchors: Map<string, Three.Object3D>;
  mixers: Three.AnimationMixer[];
};
