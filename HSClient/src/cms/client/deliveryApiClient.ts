import type { Locale, PortfolioContent } from '../../data/content';
import { portfolioApiContentResponseSchema } from '../contracts/deliveryApiContracts';
import { portfolioContentSchema } from '../contracts/portfolioContentSchema';
import { buildPortfolioApiContentUrl, localeToCulture } from './cmsUrl';
import { fetchJsonWithTimeout } from './cmsHttpClient';

export type DeliveryApiClientOptions = {
  baseUrl: string;
  timeoutMs: number;
  signal?: AbortSignal;
};

export async function fetchPortfolioContentFromDeliveryApi(
  locale: Locale,
  options: DeliveryApiClientOptions,
): Promise<PortfolioContent> {
  const url = buildPortfolioApiContentUrl({
    baseUrl: options.baseUrl,
    locale,
  });

  const json = await fetchJsonWithTimeout(url, {
    timeoutMs: options.timeoutMs,
    signal: options.signal,
    headers: {
      'Accept-Language': localeToCulture[locale],
    },
  });

  const apiContent = portfolioApiContentResponseSchema.parse(json);
  const parsedContent = portfolioContentSchema.parse(apiContent.content);

  return parsedContent as unknown as PortfolioContent;
}
