import { describe, expect, it } from 'vitest';
import { buildPortfolioApiContentUrl, localeToCulture } from './cmsUrl';

describe('cmsUrl', () => {
  it('maps frontend locales to Umbraco cultures', () => {
    expect(localeToCulture.sv).toBe('sv-SE');
    expect(localeToCulture.en).toBe('en-US');
  });

  it('builds an HSApi portfolio URL', () => {
    expect(
      buildPortfolioApiContentUrl({
        baseUrl: 'https://api.example.com/',
        locale: 'sv',
      }),
    ).toBe('https://api.example.com/api/v1/portfolio/sv');
  });

  it('URL-encodes the locale segment', () => {
    expect(
      buildPortfolioApiContentUrl({
        baseUrl: 'https://api.example.com',
        locale: 'en',
      }),
    ).toBe('https://api.example.com/api/v1/portfolio/en');
  });
});
