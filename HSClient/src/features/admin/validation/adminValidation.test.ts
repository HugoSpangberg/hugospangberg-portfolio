import { describe, expect, it } from 'vitest';
import { splitTags, validateExperience, validateProject } from './adminValidation';
import type { UpsertAdminExperience, UpsertAdminProject } from '../models/adminModels';

describe('adminValidation', () => {
  it('rejects experience date ranges where start is after end', () => {
    const values: UpsertAdminExperience = {
      slug: 'valid-slug',
      locale: 'sv',
      company: 'Company',
      role: 'Role',
      location: '',
      employmentType: '',
      startDate: '2026-02-01',
      endDate: '2026-01-01',
      isCurrent: false,
      summary: 'Summary',
      description: 'Description',
      technologies: [],
      highlights: [],
      sortOrder: 0,
      isPublished: false,
    };

    expect(validateExperience(values).startDate).toBeDefined();
  });

  it('rejects non-http project urls', () => {
    const values: UpsertAdminProject = {
      slug: 'valid-slug',
      locale: 'en',
      title: 'Project',
      shortDescription: 'Short',
      description: 'Description',
      technologies: [],
      repositoryUrl: 'javascript:alert(1)',
      liveUrl: '',
      imageUrl: '',
      featured: false,
      sortOrder: 0,
      isPublished: false,
    };

    expect(validateProject(values).repositoryUrl).toBeDefined();
  });

  it('normalizes duplicate tags', () => {
    expect(splitTags('React, react, .NET')).toEqual(['React', '.NET']);
  });
});
