export type CareerMapItem = {
  id: string;
  label: string;
  role: string;
  targetSection: string;
  description: string;
  accent: number;
  position: [number, number, number];
  hoverVisual?:
    | {
        kind: 'image';
        src: string;
        alt: string;
        caption?: string;
      }
    | {
        kind: 'educationLogos';
        logos: Array<{
          label: string;
          tone: 'forest' | 'mono';
        }>;
      };
};

export const careerMapItems = [
  {
    id: 'sodra',
    label: 'Södra Skogsägarna',
    role: 'Automation Developer',
    targetSection: 'experience-sodra',
    description: 'Forest automation, RPA and real operational workflows.',
    accent: 0x72f2a3,
    position: [-3.18, -0.4, 1.72],
    hoverVisual: {
      kind: 'image',
      src: 'images/career-world/hover/sodra-reference.jpg',
      alt: 'Södra headquarters building',
    },
  },
  {
    id: 'dasa',
    label: 'Dasa Control System',
    role: 'System Developer',
    targetSection: 'experience-dasa',
    description: '.NET backend, IoT services and system architecture.',
    accent: 0x77d8f7,
    position: [3.18, -0.4, 1.86],
    hoverVisual: {
      kind: 'image',
      src: 'images/career-world/hover/rottne-harvester.svg',
      alt: 'Rottne forestry harvester illustration',
    },
  },
  {
    id: 'visma',
    label: 'Visma Enterprise',
    role: 'Technical Quality Assurer',
    targetSection: 'experience-visma',
    description: 'Test automation, quality tooling and CI/CD.',
    accent: 0xb7f4d6,
    position: [-3.22, -0.4, -1.86],
    hoverVisual: {
      kind: 'image',
      src: 'images/career-world/hover/visma-reference.jpg',
      alt: 'Visma office building',
    },
  },
  {
    id: 'filmstaden',
    label: 'Filmstaden',
    role: 'Leadership & Service',
    targetSection: 'experience-filmstaden',
    description: 'Cinema operations, people leadership and service.',
    accent: 0xf1d48d,
    position: [0.02, -0.4, -1.96],
    hoverVisual: {
      kind: 'image',
      src: 'images/career-world/hover/filmstaden-reference.jpg',
      alt: 'Filmstaden cinema building',
    },
  },
  {
    id: 'education',
    label: 'Education & Learning',
    role: 'EC Utbildning / Hyper Island',
    targetSection: 'education',
    description: '.NET, design, motion and continuous learning.',
    accent: 0xc4a5ff,
    position: [3.18, -0.4, -1.42],
    hoverVisual: {
      kind: 'educationLogos',
      logos: [
        { label: 'EC Utbildning', tone: 'forest' },
        { label: 'Hyper Island', tone: 'mono' },
      ],
    },
  },
] satisfies CareerMapItem[];

export function getCareerMapItem(id: string) {
  return careerMapItems.find((item) => item.id === id);
}
