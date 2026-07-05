// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { CloudflareTurnstileVerifier, MockTurnstileVerifier } from '../src/services/turnstileVerifier';

describe('TurnstileVerifier', () => {
  it('accepts non-empty tokens in mock mode', async () => {
    await expect(new MockTurnstileVerifier().verify('token')).resolves.toBe(true);
    await expect(new MockTurnstileVerifier().verify('fail-token')).resolves.toBe(false);
  });

  it('uses the server-side siteverify endpoint', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ success: true })) as unknown as typeof fetch;
    const verifier = new CloudflareTurnstileVerifier('SECRET', fetcher);

    await expect(verifier.verify('token')).resolves.toBe(true);
    expect(fetcher).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
