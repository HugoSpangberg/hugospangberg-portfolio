import type { UpsertAdminExperience, UpsertAdminProject } from '../models/adminModels';

export type FieldErrors = Record<string, string[]>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateExperience(values: UpsertAdminExperience) {
  const errors: FieldErrors = {};

  require(errors, 'company', values.company, 'Company is required.');
  require(errors, 'role', values.role, 'Role is required.');
  require(errors, 'slug', values.slug, 'Slug is required.');
  require(errors, 'summary', values.summary, 'Summary is required.');
  require(errors, 'description', values.description, 'Description is required.');
  validateCommon(errors, values.slug, values.sortOrder);

  if (values.startDate && values.endDate && values.startDate > values.endDate) {
    errors.startDate = ['Start date cannot be after end date.'];
  }

  return errors;
}

export function validateProject(values: UpsertAdminProject) {
  const errors: FieldErrors = {};

  require(errors, 'title', values.title, 'Title is required.');
  require(errors, 'shortDescription', values.shortDescription, 'Short description is required.');
  require(errors, 'description', values.description, 'Description is required.');
  require(errors, 'slug', values.slug, 'Slug is required.');
  validateCommon(errors, values.slug, values.sortOrder);
  validateUrl(errors, 'repositoryUrl', values.repositoryUrl);
  validateUrl(errors, 'liveUrl', values.liveUrl);
  validateUrl(errors, 'imageUrl', values.imageUrl);

  return errors;
}

export function splitTags(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, all) => all.findIndex(
      (candidate) => candidate.toLowerCase() === item.toLowerCase(),
    ) === index);
}

function validateCommon(errors: FieldErrors, slug: string, sortOrder: number) {
  if (slug && !slugPattern.test(slug)) {
    errors.slug = ['Slug may contain lowercase letters, numbers and hyphens only.'];
  }

  if (sortOrder < 0) {
    errors.sortOrder = ['Sort order cannot be negative.'];
  }
}

function validateUrl(errors: FieldErrors, field: string, value?: string | null) {
  if (!value) {
    return;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      errors[field] = ['URL must be an absolute HTTP or HTTPS URL.'];
    }
  } catch {
    errors[field] = ['URL must be an absolute HTTP or HTTPS URL.'];
  }
}

function require(errors: FieldErrors, field: string, value: string, message: string) {
  if (!value.trim()) {
    errors[field] = [message];
  }
}
