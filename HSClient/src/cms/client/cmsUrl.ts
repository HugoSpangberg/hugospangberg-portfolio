import type { Locale } from '../../data/content';

export const localeToCulture = {
  sv: 'sv-SE',
  en: 'en-US',
} satisfies Record<Locale, string>;

export function normalizeCmsBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, '');
}

export function normalizeContentRoute(route: string) {
  const trimmed = route.trim();

  if (!trimmed || trimmed === '/') {
    return '/';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function buildDeliveryApiContentUrl({
  baseUrl,
  route,
  locale,
}: {
  baseUrl: string;
  route: string;
  locale: Locale;
}) {
  const normalizedBaseUrl = normalizeCmsBaseUrl(baseUrl);
  const normalizedRoute = normalizeContentRoute(route);
  const encodedRoute = normalizedRoute
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  const url = new URL(
    `/umbraco/delivery/api/v2/content/item${encodedRoute}`,
    `${normalizedBaseUrl}/`,
  );

  url.searchParams.set('culture', localeToCulture[locale]);

  return url.toString();
}
