import type { ProblemDetails } from '../models/adminModels';

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly problem?: ProblemDetails,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

const csrfTokenKey = 'hs-admin-csrf-token';

export function isAdminEnabled() {
  return (
    import.meta.env.VITE_ADMIN_ENABLED === 'true' &&
    Boolean(import.meta.env.VITE_API_BASE_URL)
  );
}

function baseUrl() {
  return String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
}

async function ensureCsrfToken(signal?: AbortSignal) {
  const existing = window.sessionStorage.getItem(csrfTokenKey);

  if (existing) {
    return existing;
  }

  const response = await fetch(`${baseUrl()}/api/v1/admin/auth/csrf`, {
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    throw new AdminApiError('Could not initialize admin session.', response.status);
  }

  const body = (await response.json()) as { token: string };
  window.sessionStorage.setItem(csrfTokenKey, body.token);

  return body.token;
}

export async function adminFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    signal?: AbortSignal;
    requireCsrf?: boolean;
  } = {},
): Promise<T> {
  if (!isAdminEnabled()) {
    throw new AdminApiError('Admin API is not configured.', 503);
  }

  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.requireCsrf ?? method !== 'GET') {
    headers['X-CSRF-TOKEN'] = await ensureCsrfToken(options.signal);
  }

  const response = await fetch(`${baseUrl()}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? ((await response.json()) as T & ProblemDetails)
    : undefined;

  if (!response.ok) {
    const problem = payload as ProblemDetails | undefined;
    throw new AdminApiError(
      problem?.detail ?? problem?.title ?? `Admin API responded with ${response.status}`,
      response.status,
      problem,
    );
  }

  return payload as T;
}

export function clearAdminCsrfToken() {
  window.sessionStorage.removeItem(csrfTokenKey);
}
