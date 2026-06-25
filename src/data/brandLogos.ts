export type BrandLogo = {
  src: string;
  accent: string;
  accentRgb: string;
  layout?: 'wide' | 'stacked';
};

const experienceLogos: Record<string, BrandLogo> = {
  'Dasa Control System': {
    src: '/brands/dasa.svg',
    accent: '#ed1c24',
    accentRgb: '237 28 36',
    layout: 'wide',
  },
  'Södra Skogsägarna': {
    src: '/brands/sodra.svg',
    accent: '#00a651',
    accentRgb: '0 166 81',
    layout: 'wide',
  },
  'Visma Enterprise': {
    src: '/brands/visma.svg',
    accent: '#f00046',
    accentRgb: '240 0 70',
    layout: 'wide',
  },
  'Filmstaden Växjö AB': {
    src: '/brands/filmstaden.svg',
    accent: '#e4003b',
    accentRgb: '228 0 59',
    layout: 'stacked',
  },
  Pacson: {
    src: '/brands/pacson.svg',
    accent: '#899e2d',
    accentRgb: '137 158 45',
    layout: 'wide',
  },
};

const educationLogos: Record<string, BrandLogo> = {
  'EC Utbildning': {
    src: '/brands/ec-utbildning.svg',
    accent: '#3b809f',
    accentRgb: '59 128 159',
    layout: 'wide',
  },
  'Hyper Island, Karlskrona': {
    src: '/brands/hyper-island.svg',
    accent: '#bda5ff',
    accentRgb: '189 165 255',
    layout: 'wide',
  },
};

export function getExperienceBrand(company: string) {
  return experienceLogos[company];
}

export function getEducationBrand(school: string) {
  return educationLogos[school];
}
