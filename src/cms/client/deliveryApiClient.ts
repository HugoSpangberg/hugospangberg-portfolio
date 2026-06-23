import type { Locale, PortfolioContent } from '../../data/content';
import { deliveryApiContentResponseSchema } from '../contracts/deliveryApiContracts';
import { mapPortfolioContent } from '../mappers/mapPortfolioContent';
import { buildDeliveryApiContentUrl, localeToCulture } from './cmsUrl';
import { fetchJsonWithTimeout } from './cmsHttpClient';

export type DeliveryApiClientOptions = {
  baseUrl: string;
  route: string;
  timeoutMs: number;
  signal?: AbortSignal;
};

export async function fetchPortfolioContentFromDeliveryApi(
  locale: Locale,
  options: DeliveryApiClientOptions,
): Promise<PortfolioContent> {
  const url = buildDeliveryApiContentUrl({
    baseUrl: options.baseUrl,
    route: options.route,
    locale,
  });

  const json = await fetchJsonWithTimeout(url, {
    timeoutMs: options.timeoutMs,
    signal: options.signal,
    headers: {
      'Accept-Language': localeToCulture[locale],
    },
  });

  const deliveryContent = deliveryApiContentResponseSchema.parse(json);

  return mapPortfolioContent(deliveryContent);
}
