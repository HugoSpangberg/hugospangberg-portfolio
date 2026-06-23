import type { Locale, PortfolioContent } from '../../data/content';
import { portfolioContentSchema } from '../contracts/portfolioContentSchema';

const cacheVersion = 1;

type CachedPortfolioContent = {
  version: number;
  locale: Locale;
  cachedAt: string;
  content: PortfolioContent;
};

function cacheKey(locale: Locale) {
  return `hugo-portfolio-cms-content:${locale}:v${cacheVersion}`;
}

export function readCachedPortfolioContent(locale: Locale): PortfolioContent | null {
  try {
    const raw = window.localStorage.getItem(cacheKey(locale));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CachedPortfolioContent;

    if (parsed.version !== cacheVersion || parsed.locale !== locale) {
      return null;
    }

    return portfolioContentSchema.parse(parsed.content) as unknown as PortfolioContent;
  } catch {
    window.localStorage.removeItem(cacheKey(locale));
    return null;
  }
}

export function writeCachedPortfolioContent(
  locale: Locale,
  content: PortfolioContent,
) {
  const value: CachedPortfolioContent = {
    version: cacheVersion,
    locale,
    cachedAt: new Date().toISOString(),
    content,
  };

  window.localStorage.setItem(cacheKey(locale), JSON.stringify(value));
}
