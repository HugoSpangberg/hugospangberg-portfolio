import { content, type Locale, type PortfolioContent } from '../../data/content';
import {
  readCachedPortfolioContent,
  writeCachedPortfolioContent,
} from '../cache/contentCache';
import { fetchPortfolioContentFromDeliveryApi } from '../client/deliveryApiClient';

export type PortfolioContentSource = 'cms' | 'cache' | 'fallback';

export type PortfolioContentResult = {
  content: PortfolioContent;
  source: PortfolioContentSource;
};

function isCmsEnabled() {
  return import.meta.env.VITE_CMS_ENABLED === 'true';
}

function getCmsConfig() {
  return {
    baseUrl: import.meta.env.VITE_UMBRACO_BASE_URL ?? '',
    route: import.meta.env.VITE_UMBRACO_CONTENT_ROUTE ?? '/',
    timeoutMs: Number(import.meta.env.VITE_CMS_REQUEST_TIMEOUT_MS ?? 3500),
  };
}

function logCmsFallback(error: unknown) {
  if (import.meta.env.DEV) {
    console.warn('CMS content could not be loaded; using cached or bundled content.', error);
  }
}

function mergeExperienceFallback(
  locale: Locale,
  candidate: PortfolioContent,
): PortfolioContent {
  const fallback = content[locale];

  if (candidate.experience.items.length > 0) {
    return candidate;
  }

  if (import.meta.env.DEV) {
    console.warn('CMS experience content was empty; using bundled experience entries.');
  }

  return {
    ...candidate,
    experience: fallback.experience,
  };
}

export async function loadPortfolioContent(
  locale: Locale,
  signal?: AbortSignal,
): Promise<PortfolioContentResult> {
  const fallback = content[locale];
  const config = getCmsConfig();

  if (!isCmsEnabled() || !config.baseUrl) {
    return { content: fallback, source: 'fallback' };
  }

  try {
    const cmsContent = await fetchPortfolioContentFromDeliveryApi(locale, {
      ...config,
      signal,
    });

    const normalizedContent = mergeExperienceFallback(locale, cmsContent);

    writeCachedPortfolioContent(locale, normalizedContent);

    return { content: normalizedContent, source: 'cms' };
  } catch (error) {
    logCmsFallback(error);

    const cached = readCachedPortfolioContent(locale);

    if (cached) {
      return { content: mergeExperienceFallback(locale, cached), source: 'cache' };
    }

    return { content: fallback, source: 'fallback' };
  }
}
