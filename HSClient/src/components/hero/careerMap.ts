export type CareerMapItem = {
  id: string;
  label: string;
  role: string;
  targetSection: string;
  description: string;
  accent: number;
  position: [number, number, number];
};

export const careerMapItems = [
  {
    id: 'sodra',
    label: 'Södra Skogsägarna',
    role: 'Automation Developer',
    targetSection: 'experience-sodra',
    description: 'Forest automation, RPA and real operational workflows.',
    accent: 0x72f2a3,
    position: [-1.1, -0.46, -1.35],
  },
  {
    id: 'dasa',
    label: 'Dasa Control System',
    role: 'System Developer',
    targetSection: 'experience-dasa',
    description: '.NET backend, IoT services and system architecture.',
    accent: 0x77d8f7,
    position: [1.45, -0.44, -0.95],
  },
  {
    id: 'visma',
    label: 'Visma Enterprise',
    role: 'Technical Quality Assurer',
    targetSection: 'experience-visma',
    description: 'Test automation, quality tooling and CI/CD.',
    accent: 0xb7f4d6,
    position: [-2.1, -0.46, 0.06],
  },
  {
    id: 'filmstaden',
    label: 'Filmstaden',
    role: 'Leadership & Service',
    targetSection: 'experience-filmstaden',
    description: 'Cinema operations, people leadership and service.',
    accent: 0xf1d48d,
    position: [0.1, -0.5, 1.45],
  },
  {
    id: 'education',
    label: 'Education & Learning',
    role: 'EC Utbildning / Hyper Island',
    targetSection: 'education',
    description: '.NET, design, motion and continuous learning.',
    accent: 0xc4a5ff,
    position: [1.75, -0.48, 0.9],
  },
] satisfies CareerMapItem[];

export function getCareerMapItem(id: string) {
  return careerMapItems.find((item) => item.id === id);
}
