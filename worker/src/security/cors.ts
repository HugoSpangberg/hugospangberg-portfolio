import type { Env } from '../types';

export function isAllowedOrigin(origin: string | null, env: Env) {
  return Boolean(origin && env.ALLOWED_ORIGIN && origin === env.ALLOWED_ORIGIN);
}

export function corsHeaders(origin: string) {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}

export function securityHeaders(origin: string) {
  return {
    ...corsHeaders(origin),
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
  };
}
