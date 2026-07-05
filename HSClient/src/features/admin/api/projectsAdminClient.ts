import type {
  AdminListResponse,
  AdminOrderItem,
  AdminProject,
  UpsertAdminProject,
} from '../models/adminModels';
import { adminFetch } from './adminHttpClient';

export function getAdminProjects(signal?: AbortSignal) {
  return adminFetch<AdminListResponse<AdminProject>>('/api/v1/admin/projects', {
    signal,
  });
}

export function getAdminProject(id: string, signal?: AbortSignal) {
  return adminFetch<AdminProject>(`/api/v1/admin/projects/${id}`, { signal });
}

export function createAdminProject(request: UpsertAdminProject, signal?: AbortSignal) {
  return adminFetch<AdminProject>('/api/v1/admin/projects', {
    method: 'POST',
    body: request,
    signal,
  });
}

export function updateAdminProject(
  id: string,
  request: UpsertAdminProject,
  signal?: AbortSignal,
) {
  return adminFetch<AdminProject>(`/api/v1/admin/projects/${id}`, {
    method: 'PUT',
    body: request,
    signal,
  });
}

export function deleteAdminProject(id: string, signal?: AbortSignal) {
  return adminFetch<void>(`/api/v1/admin/projects/${id}`, {
    method: 'DELETE',
    signal,
  });
}

export function publishAdminProject(id: string, signal?: AbortSignal) {
  return adminFetch<AdminProject>(`/api/v1/admin/projects/${id}/publish`, {
    method: 'POST',
    signal,
  });
}

export function unpublishAdminProject(id: string, signal?: AbortSignal) {
  return adminFetch<AdminProject>(`/api/v1/admin/projects/${id}/unpublish`, {
    method: 'POST',
    signal,
  });
}

export function reorderAdminProjects(items: AdminOrderItem[], signal?: AbortSignal) {
  return adminFetch<AdminListResponse<AdminProject>>('/api/v1/admin/projects/order', {
    method: 'PUT',
    body: { items },
    signal,
  });
}
