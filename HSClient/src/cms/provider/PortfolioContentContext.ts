import { createContext } from 'react';
import type { Locale, PortfolioContent } from '../../data/content';
import type { PortfolioContentSource } from '../repository/portfolioContentRepository';

export type PortfolioContentContextValue = {
  locale: Locale;
  content: PortfolioContent;
  source: PortfolioContentSource;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
};

export const PortfolioContentContext =
  createContext<PortfolioContentContextValue | null>(null);
