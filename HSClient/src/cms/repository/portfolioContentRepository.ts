import { content, type Locale, type PortfolioContent } from '../../data/content';
import {
  readCachedPortfolioContent,
  writeCachedPortfolioContent,
} from '../cache/contentCache';
import { fetchPortfolioContentFromDeliveryApi } from '../client/deliveryApiClient';

export type PortfolioContentSource = 'api' | 'cache' | 'fallback';

export type PortfolioContentResult = {
  content: PortfolioContent;
  source: PortfolioContentSource;
};

function isApiEnabled() {
  return import.meta.env.VITE_API_ENABLED === 'true';
}

function getApiConfig() {
  return {
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
    timeoutMs: Number(import.meta.env.VITE_API_REQUEST_TIMEOUT_MS ?? 3500),
  };
}

function logApiFallback(error: unknown) {
  if (import.meta.env.DEV) {
    console.warn('API content could not be loaded; using cached or bundled content.', error);
  }
}

function mergeExperienceFallback(
  locale: Locale,
  candidate: PortfolioContent,
): PortfolioContent {
  const fallback = content[locale];
  const candidateWithStaticSections = {
    ...candidate,
    hsab: candidate.hsab ?? fallback.hsab,
    localAi: candidate.localAi ?? fallback.localAi,
  };

  if (candidateWithStaticSections.experience.items.length > 0) {
    return candidateWithStaticSections;
  }

  if (import.meta.env.DEV) {
    console.warn('API experience content was empty; using bundled experience entries.');
  }

  return {
    ...candidateWithStaticSections,
    experience: fallback.experience,
  };
}

export async function loadPortfolioContent(
  locale: Locale,
  signal?: AbortSignal,
): Promise<PortfolioContentResult> {
  const fallback = content[locale];
  const config = getApiConfig();

  if (!isApiEnabled() || !config.baseUrl) {
    return { content: fallback, source: 'fallback' };
  }

  try {
    const apiContent = await fetchPortfolioContentFromDeliveryApi(locale, {
      ...config,
      signal,
    });

    const normalizedContent = mergeExperienceFallback(locale, apiContent);

    writeCachedPortfolioContent(locale, normalizedContent);

    return { content: normalizedContent, source: 'api' };
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    logApiFallback(error);

    const cached = readCachedPortfolioContent(locale);

    if (cached) {
      return { content: mergeExperienceFallback(locale, cached), source: 'cache' };
    }

    return { content: fallback, source: 'fallback' };
  }
}
