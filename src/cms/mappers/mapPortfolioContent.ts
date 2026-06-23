import type { PortfolioContent } from '../../data/content';
import type { DeliveryApiContentResponse } from '../contracts/deliveryApiContracts';
import { portfolioContentSchema } from '../contracts/portfolioContentSchema';

function getCandidate(raw: DeliveryApiContentResponse) {
  const properties = raw.properties ?? {};

  return (
    properties.portfolioContent ??
    properties.content ??
    properties.portfolioJson ??
    properties
  );
}

export function mapPortfolioContent(raw: DeliveryApiContentResponse): PortfolioContent {
  const parsed = portfolioContentSchema.parse(getCandidate(raw));

  return parsed as unknown as PortfolioContent;
}
