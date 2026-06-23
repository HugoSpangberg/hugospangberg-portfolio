import { describe, expect, it } from 'vitest';
import { content } from '../../data/content';
import { mapPortfolioContent } from './mapPortfolioContent';

describe('mapPortfolioContent', () => {
  it('maps a portfolioContent property to the frontend domain contract', () => {
    const mapped = mapPortfolioContent({
      contentType: 'portfolioHome',
      properties: {
        portfolioContent: content.sv,
      },
    });

    expect(mapped.hero.title).toBe('Hugo Spångberg');
    expect(mapped.sayHi.buttonLabel).toBe('Klicka på mig');
  });

  it('rejects invalid CMS content before it reaches React components', () => {
    expect(() =>
      mapPortfolioContent({
        contentType: 'portfolioHome',
        properties: {
          portfolioContent: {
            seo: { title: '', description: '' },
          },
        },
      }),
    ).toThrow();
  });
});
