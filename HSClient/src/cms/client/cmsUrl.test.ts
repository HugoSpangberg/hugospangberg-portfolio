import { describe, expect, it } from 'vitest';
import { buildDeliveryApiContentUrl, localeToCulture } from './cmsUrl';

describe('cmsUrl', () => {
  it('maps frontend locales to Umbraco cultures', () => {
    expect(localeToCulture.sv).toBe('sv-SE');
    expect(localeToCulture.en).toBe('en-US');
  });

  it('builds a Content Delivery API v2 item URL', () => {
    expect(
      buildDeliveryApiContentUrl({
        baseUrl: 'https://cms.example.com/',
        route: '/portfolio',
        locale: 'sv',
      }),
    ).toBe(
      'https://cms.example.com/umbraco/delivery/api/v2/content/item/portfolio?culture=sv-SE',
    );
  });

  it('URL-encodes route segments without losing slashes', () => {
    expect(
      buildDeliveryApiContentUrl({
        baseUrl: 'https://cms.example.com',
        route: '/sv/om mig',
        locale: 'en',
      }),
    ).toBe(
      'https://cms.example.com/umbraco/delivery/api/v2/content/item/sv/om%20mig?culture=en-US',
    );
  });
});
