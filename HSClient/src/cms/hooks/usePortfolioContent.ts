import { useContext } from 'react';
import { PortfolioContentProvider } from '../provider/PortfolioContentProvider';
import { PortfolioContentContext } from '../provider/PortfolioContentContext';

export { PortfolioContentProvider };

export function usePortfolioContent() {
  const value = useContext(PortfolioContentContext);

  if (!value) {
    throw new Error('usePortfolioContent must be used inside PortfolioContentProvider');
  }

  return value;
}
