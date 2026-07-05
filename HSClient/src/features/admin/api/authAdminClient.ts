import { adminFetch, clearAdminCsrfToken } from './adminHttpClient';

export type AdminSession = {
  authenticated: boolean;
  username?: string | null;
};

export async function getAdminSession(signal?: AbortSignal) {
  return adminFetch<AdminSession>('/api/v1/admin/auth/session', { signal });
}

export async function loginAdmin(
  username: string,
  password: string,
  signal?: AbortSignal,
) {
  return adminFetch<AdminSession>('/api/v1/admin/auth/login', {
    method: 'POST',
    body: { username, password },
    signal,
    requireCsrf: true,
  });
}

export async function logoutAdmin(signal?: AbortSignal) {
  await adminFetch<void>('/api/v1/admin/auth/logout', {
    method: 'POST',
    signal,
    requireCsrf: true,
  });
  clearAdminCsrfToken();
}
