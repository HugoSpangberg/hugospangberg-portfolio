import type { Locale } from '../../data/content';

export const localeToCulture = {
  sv: 'sv-SE',
  en: 'en-US',
} satisfies Record<Locale, string>;

export function normalizeApiBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, '');
}

export function buildPortfolioApiContentUrl({
  baseUrl,
  locale,
}: {
  baseUrl: string;
  locale: Locale;
}) {
  const normalizedBaseUrl = normalizeApiBaseUrl(baseUrl);
  return new URL(`/api/v1/portfolio/${encodeURIComponent(locale)}`, `${normalizedBaseUrl}/`).toString();
}
