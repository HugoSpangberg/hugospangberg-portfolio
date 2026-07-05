export type Locale = 'sv' | 'en';

export type ProblemDetails = {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
};

export type AdminListResponse<T> = {
  items: T[];
};

export type AdminExperience = {
  id: string;
  slug: string;
  locale: Locale;
  company: string;
  role: string;
  location?: string | null;
  employmentType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
  summary: string;
  description: string;
  technologies: string[];
  highlights: string[];
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  publishedAt?: string | null;
  version: number;
};

export type UpsertAdminExperience = Omit<
  AdminExperience,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'publishedAt' | 'version'
> & {
  version?: number | null;
};

export type AdminProject = {
  id: string;
  slug: string;
  locale: Locale;
  title: string;
  shortDescription: string;
  description: string;
  technologies: string[];
  repositoryUrl?: string | null;
  liveUrl?: string | null;
  imageUrl?: string | null;
  featured: boolean;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  publishedAt?: string | null;
  version: number;
};

export type UpsertAdminProject = Omit<
  AdminProject,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'publishedAt' | 'version'
> & {
  version?: number | null;
};

export type AdminOrderItem = {
  id: string;
  sortOrder: number;
  version: number;
};
