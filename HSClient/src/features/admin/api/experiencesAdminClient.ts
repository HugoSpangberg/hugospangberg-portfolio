import type {
  AdminExperience,
  AdminListResponse,
  AdminOrderItem,
  UpsertAdminExperience,
} from '../models/adminModels';
import { adminFetch } from './adminHttpClient';

export function getAdminExperiences(signal?: AbortSignal) {
  return adminFetch<AdminListResponse<AdminExperience>>('/api/v1/admin/experiences', {
    signal,
  });
}

export function getAdminExperience(id: string, signal?: AbortSignal) {
  return adminFetch<AdminExperience>(`/api/v1/admin/experiences/${id}`, { signal });
}

export function createAdminExperience(
  request: UpsertAdminExperience,
  signal?: AbortSignal,
) {
  return adminFetch<AdminExperience>('/api/v1/admin/experiences', {
    method: 'POST',
    body: request,
    signal,
  });
}

export function updateAdminExperience(
  id: string,
  request: UpsertAdminExperience,
  signal?: AbortSignal,
) {
  return adminFetch<AdminExperience>(`/api/v1/admin/experiences/${id}`, {
    method: 'PUT',
    body: request,
    signal,
  });
}

export function deleteAdminExperience(id: string, signal?: AbortSignal) {
  return adminFetch<void>(`/api/v1/admin/experiences/${id}`, {
    method: 'DELETE',
    signal,
  });
}

export function publishAdminExperience(id: string, signal?: AbortSignal) {
  return adminFetch<AdminExperience>(`/api/v1/admin/experiences/${id}/publish`, {
    method: 'POST',
    signal,
  });
}

export function unpublishAdminExperience(id: string, signal?: AbortSignal) {
  return adminFetch<AdminExperience>(`/api/v1/admin/experiences/${id}/unpublish`, {
    method: 'POST',
    signal,
  });
}

export function reorderAdminExperiences(items: AdminOrderItem[], signal?: AbortSignal) {
  return adminFetch<AdminListResponse<AdminExperience>>('/api/v1/admin/experiences/order', {
    method: 'PUT',
    body: { items },
    signal,
  });
}
