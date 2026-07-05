import { beforeEach, describe, expect, it } from 'vitest';
import { content } from '../../data/content';
import {
  readCachedPortfolioContent,
  writeCachedPortfolioContent,
} from './contentCache';

describe('contentCache', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('stores locale-specific last-known-good CMS content', () => {
    writeCachedPortfolioContent('sv', content.sv);

    expect(readCachedPortfolioContent('sv')?.seo.title).toBe(content.sv.seo.title);
    expect(readCachedPortfolioContent('en')).toBeNull();
  });

  it('discards corrupted cache data', () => {
    window.localStorage.setItem('hugo-portfolio-cms-content:sv:v1', '{bad json');

    expect(readCachedPortfolioContent('sv')).toBeNull();
  });
});
