import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { content } from '../../data/content';
import { loadPortfolioContent } from './portfolioContentRepository';

describe('portfolioContentRepository', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.assign(import.meta.env, originalEnv);
  });

  it('uses bundled fallback content when API is disabled', async () => {
    import.meta.env.VITE_API_ENABLED = 'false';

    await expect(loadPortfolioContent('sv')).resolves.toMatchObject({
      source: 'fallback',
      content: content.sv,
    });
  });

  it('uses API content when HSApi returns a valid response', async () => {
    import.meta.env.VITE_API_ENABLED = 'true';
    import.meta.env.VITE_API_BASE_URL = 'https://api.example.com';

    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          locale: 'en',
          source: 'fallback',
          generatedAtUtc: '2026-06-24T00:00:00Z',
          content: content.en,
        }),
        { status: 200 },
      ),
    );

    const result = await loadPortfolioContent('en');

    expect(result.source).toBe('api');
    expect(result.content.seo.title).toBe(content.en.seo.title);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/portfolio/en',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Accept-Language': 'en-US' }),
      }),
    );
  });

  it('falls back without touching Say Hi when API is unavailable', async () => {
    import.meta.env.VITE_API_ENABLED = 'true';
    import.meta.env.VITE_API_BASE_URL = 'https://api.example.com';
    vi.mocked(fetch).mockResolvedValue(new Response('Not found', { status: 404 }));

    const result = await loadPortfolioContent('sv');

    expect(result.source).toBe('fallback');
    expect(result.content.sayHi.buttonLabel).toBe('Klicka på mig');
  });

  it('falls back to bundled experience content when API experience items are empty', async () => {
    import.meta.env.VITE_API_ENABLED = 'true';
    import.meta.env.VITE_API_BASE_URL = 'https://api.example.com';

    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          locale: 'en',
          source: 'cms',
          generatedAtUtc: '2026-06-24T00:00:00Z',
          content: {
            ...content.en,
            hero: {
              ...content.en.hero,
              title: 'API title',
            },
            experience: { items: [] },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await loadPortfolioContent('en');

    expect(result.source).toBe('api');
    expect(result.content.hero.title).toBe('API title');
    expect(result.content.experience.items).toHaveLength(content.en.experience.items.length);
    expect(result.content.experience.title).toBe(content.en.experience.title);
  });
});
