import type { Locale } from '../../data/content';

export type CareerWorldLocation = {
  id: string;
  label: string;
  sceneLabel: string;
  role: string;
  summary: string;
  description: string;
  targetId: string;
  tags: string[];
};

const locations = {
  sv: [
    {
      id: 'dasa',
      label: 'Dasa Control System',
      sceneLabel: 'Dasa IoT',
      role: 'System Developer',
      summary: 'IoT, backend och systemutveckling.',
      description:
        'IoT-tjänster, backend i .NET och systemutveckling från analys till implementation.',
      targetId: 'experience-dasa',
      tags: ['.NET', 'IoT', 'Backend', 'Systemutveckling'],
    },
    {
      id: 'sodra',
      label: 'Södra Skogsägarna',
      sceneLabel: 'Södra',
      role: 'Automation Developer',
      summary: 'Automation, .NET och processförbättring.',
      description:
        'Automation av affärsprocesser med .NET, PowerShell och RPA i nära samarbete med verksamheten.',
      targetId: 'experience-sodra',
      tags: ['.NET', 'PowerShell', 'RPA', 'Automation'],
    },
    {
      id: 'visma',
      label: 'Visma Enterprise',
      sceneLabel: 'Visma',
      role: 'Technical Quality Assurer',
      summary: 'Testautomation och CI-flöden.',
      description:
        'Testautomation i C#/.NET, CI-flöden och GUI för testautomationsverktyg.',
      targetId: 'experience-visma',
      tags: ['C#', '.NET', 'Testautomation', 'CI/CD'],
    },
    {
      id: 'filmstaden',
      label: 'Filmstaden',
      sceneLabel: 'Filmstaden',
      role: 'Ledarskap & service',
      summary: 'Drift, team och kundupplevelse.',
      description:
        'Ledarskap, service, drift, rekrytering och lång erfarenhet av kundnära ansvar.',
      targetId: 'experience-filmstaden',
      tags: ['Ledarskap', 'Service', 'Drift', 'Team'],
    },
    {
      id: 'education',
      label: 'Studier & lärande',
      sceneLabel: 'Lärande',
      role: 'EC Utbildning & Hyper Island',
      summary: '.NET, design och utveckling.',
      description:
        '.NET-utveckling, webbutveckling, motion design, klientarbete och visuell kommunikation.',
      targetId: 'education',
      tags: ['.NET', 'Webb', 'Design', 'Lärande'],
    },
  ],
  en: [
    {
      id: 'dasa',
      label: 'Dasa Control System',
      sceneLabel: 'Dasa IoT',
      role: 'System Developer',
      summary: 'IoT, backend and software systems.',
      description:
        'IoT services, .NET backend development and software work from analysis to implementation.',
      targetId: 'experience-dasa',
      tags: ['.NET', 'IoT', 'Backend', 'Software'],
    },
    {
      id: 'sodra',
      label: 'Södra Skogsägarna',
      sceneLabel: 'Södra',
      role: 'Automation Developer',
      summary: 'Automation, .NET and process improvement.',
      description:
        'Business process automation with .NET, PowerShell and RPA in close collaboration with business users.',
      targetId: 'experience-sodra',
      tags: ['.NET', 'PowerShell', 'RPA', 'Automation'],
    },
    {
      id: 'visma',
      label: 'Visma Enterprise',
      sceneLabel: 'Visma',
      role: 'Technical Quality Assurer',
      summary: 'Test automation and CI workflows.',
      description:
        'Test automation in C#/.NET, CI workflows and GUI development for testing tools.',
      targetId: 'experience-visma',
      tags: ['C#', '.NET', 'Test automation', 'CI/CD'],
    },
    {
      id: 'filmstaden',
      label: 'Filmstaden',
      sceneLabel: 'Filmstaden',
      role: 'Leadership & Service',
      summary: 'Operations, teams and guest experience.',
      description:
        'Leadership, service, operations, recruitment and long experience in customer-facing responsibility.',
      targetId: 'experience-filmstaden',
      tags: ['Leadership', 'Service', 'Operations', 'Team'],
    },
    {
      id: 'education',
      label: 'Studies & Learning',
      sceneLabel: 'Learning',
      role: 'EC Utbildning & Hyper Island',
      summary: '.NET, design and development.',
      description:
        '.NET development, web development, motion design, client work and visual communication.',
      targetId: 'education',
      tags: ['.NET', 'Web', 'Design', 'Learning'],
    },
  ],
} satisfies Record<Locale, CareerWorldLocation[]>;

export function getCareerWorldLocations(locale: Locale) {
  return locations[locale];
}

export function getCareerWorldLocation(locale: Locale, id: string) {
  return locations[locale].find((location) => location.id === id);
}
