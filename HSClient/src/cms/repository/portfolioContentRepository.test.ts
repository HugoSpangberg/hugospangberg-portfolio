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

  it('uses bundled fallback content when CMS is disabled', async () => {
    import.meta.env.VITE_CMS_ENABLED = 'false';

    await expect(loadPortfolioContent('sv')).resolves.toMatchObject({
      source: 'fallback',
      content: content.sv,
    });
  });

  it('uses CMS content when the Delivery API returns a valid response', async () => {
    import.meta.env.VITE_CMS_ENABLED = 'true';
    import.meta.env.VITE_UMBRACO_BASE_URL = 'https://cms.example.com';
    import.meta.env.VITE_UMBRACO_CONTENT_ROUTE = '/portfolio';

    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          contentType: 'portfolioHome',
          properties: { portfolioContent: content.en },
        }),
        { status: 200 },
      ),
    );

    const result = await loadPortfolioContent('en');

    expect(result.source).toBe('cms');
    expect(result.content.seo.title).toBe(content.en.seo.title);
    expect(fetch).toHaveBeenCalledWith(
      'https://cms.example.com/umbraco/delivery/api/v2/content/item/portfolio?culture=en-US',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Accept-Language': 'en-US' }),
      }),
    );
  });

  it('falls back without touching Say Hi when CMS is unavailable', async () => {
    import.meta.env.VITE_CMS_ENABLED = 'true';
    import.meta.env.VITE_UMBRACO_BASE_URL = 'https://cms.example.com';
    vi.mocked(fetch).mockResolvedValue(new Response('Not found', { status: 404 }));

    const result = await loadPortfolioContent('sv');

    expect(result.source).toBe('fallback');
    expect(result.content.sayHi.buttonLabel).toBe('Klicka på mig');
  });

  it('falls back to bundled experience content when CMS experience items are empty', async () => {
    import.meta.env.VITE_CMS_ENABLED = 'true';
    import.meta.env.VITE_UMBRACO_BASE_URL = 'https://cms.example.com';
    import.meta.env.VITE_UMBRACO_CONTENT_ROUTE = '/portfolio';

    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          contentType: 'portfolioHome',
          properties: {
            portfolioContent: {
              ...content.en,
              hero: {
                ...content.en.hero,
                title: 'CMS title',
              },
              experience: { items: [] },
            },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await loadPortfolioContent('en');

    expect(result.source).toBe('cms');
    expect(result.content.hero.title).toBe('CMS title');
    expect(result.content.experience.items).toHaveLength(content.en.experience.items.length);
    expect(result.content.experience.title).toBe(content.en.experience.title);
  });
});
