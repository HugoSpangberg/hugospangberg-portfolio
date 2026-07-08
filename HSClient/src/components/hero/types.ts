export type HeroAction = {
  label: string;
  href: string;
  variant: 'primary' | 'ghost';
  external?: boolean;
  download?: string;
};

export type SensorReading = {
  systemStatus: string;
  machine: string;
  treeId: string;
  moisture: string;
  temperature: string;
  load: string;
  gps: string;
  dataSync: string;
  cutStatus: string;
  systemHealth: string;
};

export type HeroContentData = {
  eyebrow: string;
  title: string;
  role: string;
  subtitle: string;
  tagline: string;
  actionsLabel: string;
  actions: HeroAction[];
  availability: string;
  stack: string;
  proofPoints?: string[];
  sceneLabel: string;
  fallbackLabel: string;
};
