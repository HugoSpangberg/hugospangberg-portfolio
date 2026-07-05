import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  content as fallbackContent,
  type Locale,
  type PortfolioContent,
} from '../../data/content';
import {
  loadPortfolioContent,
  type PortfolioContentSource,
} from '../repository/portfolioContentRepository';
import { PortfolioContentContext } from './PortfolioContentContext';

type PortfolioContentProviderProps = {
  locale: Locale;
  children: ReactNode;
};

export function PortfolioContentProvider({
  locale,
  children,
}: PortfolioContentProviderProps) {
  const [state, setState] = useState<{
    content: PortfolioContent;
    source: PortfolioContentSource;
    isRefreshing: boolean;
  }>({
    content: fallbackContent[locale],
    source: 'fallback',
    isRefreshing: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    setState({
      content: fallbackContent[locale],
      source: 'fallback',
      isRefreshing: true,
    });

    loadPortfolioContent(locale, controller.signal)
      .then((result) => {
        if (mounted) {
          setState({ ...result, isRefreshing: false });
        }
      })
      .catch(() => {
        if (mounted) {
          setState({
            content: fallbackContent[locale],
            source: 'fallback',
            isRefreshing: false,
          });
        }
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [locale]);

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, isRefreshing: true }));

    try {
      const result = await loadPortfolioContent(locale);
      setState({ ...result, isRefreshing: false });
    } catch {
      setState({
        content: fallbackContent[locale],
        source: 'fallback',
        isRefreshing: false,
      });
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      content: state.content,
      source: state.source,
      isRefreshing: state.isRefreshing,
      refresh,
    }),
    [locale, refresh, state.content, state.isRefreshing, state.source],
  );

  return (
    <PortfolioContentContext.Provider value={value}>
      {children}
    </PortfolioContentContext.Provider>
  );
}
