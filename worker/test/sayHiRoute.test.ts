// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { handleSayHi } from '../src/routes/sayHi';
import { SayHiCooldown } from '../src';
import type { Env } from '../src/types';

const allowedOrigin = 'https://portfolio.example.com';
const requestId = '6f1f7b90-1fc3-4bc5-8e52-ea642d3b9137';

class MemoryDurableObjectState {
  private readonly values = new Map<string, number>();

  storage = {
    get: async (key: string) => this.values.get(key),
    put: async (key: string, value: number) => {
      this.values.set(key, value);
    },
  };
}

function createCooldownNamespace() {
  const durableObject = new SayHiCooldown(
    new MemoryDurableObjectState() as unknown as DurableObjectState,
  );

  return {
    idFromName: () => ({ toString: () => 'global' }),
    get: () => durableObject,
  } as unknown as DurableObjectNamespace;
}

function createEnv(overrides: Partial<Env> = {}): Env {
  return {
    ALLOWED_ORIGIN: allowedOrigin,
    TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
    SAY_HI_ENABLED: 'true',
    SAY_HI_COOLDOWN_SECONDS: '120',
    SAY_HI_USE_MOCK_GATEWAY: 'true',
    SAY_HI_COOLDOWN: createCooldownNamespace(),
    ...overrides,
  };
}

function createRequest(body: unknown, init: RequestInit = {}) {
  return new Request('https://worker.example.com/api/say-hi', {
    method: 'POST',
    headers: {
      origin: allowedOrigin,
      'content-type': 'application/json',
      'cf-connecting-ip': '203.0.113.10',
      ...init.headers,
    },
    body: JSON.stringify(body),
    ...init,
  });
}

const validBody = {
  turnstileToken: '1x0000000000000000000000000000000AA',
  locale: 'sv',
  requestId,
};

describe('handleSayHi', () => {
  it('accepts a valid request without exposing secrets', async () => {
    const response = await handleSayHi(createRequest(validBody), createEnv());
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: 'accepted',
      requestId,
      cooldownSeconds: 120,
    });
    expect(JSON.stringify(body)).not.toContain('SECRET');
    expect(JSON.stringify(body)).not.toContain('webhook');
  });

  it('rejects disallowed origins', async () => {
    const response = await handleSayHi(
      createRequest(validBody, {
        headers: {
          origin: 'https://evil.example.com',
          'content-type': 'application/json',
        },
      }),
      createEnv(),
    );

    expect(response.status).toBe(403);
  });

  it('returns cooldown after one accepted request', async () => {
    const env = createEnv();
    await handleSayHi(createRequest(validBody), env);

    const response = await handleSayHi(
      createRequest({
        ...validBody,
        requestId: 'd8303f81-65a8-42d5-8f8c-732aca6624cc',
      }),
      env,
    );
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(429);
    expect(body.status).toBe('cooldown');
  });

  it('uses rate limit responses when the binding denies the request', async () => {
    const response = await handleSayHi(
      createRequest(validBody),
      createEnv({
        SAY_HI_RATE_LIMITER: {
          limit: vi.fn().mockResolvedValue({ success: false }),
        },
      }),
    );
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(429);
    expect(body.status).toBe('cooldown');
  });

  it('returns unavailable when disabled', async () => {
    const response = await handleSayHi(
      createRequest(validBody),
      createEnv({ SAY_HI_ENABLED: 'false' }),
    );
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(503);
    expect(body.status).toBe('unavailable');
  });

  it('uses Telegram provider when configured', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetcher);

    const response = await handleSayHi(
      createRequest(validBody),
      createEnv({
        SAY_HI_PROVIDER: 'telegram',
        SAY_HI_USE_MOCK_GATEWAY: 'false',
        TELEGRAM_BOT_TOKEN: 'SECRET_BOT_TOKEN',
        TELEGRAM_CHAT_ID: '123456',
      }),
    );
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: 'accepted',
      requestId,
      cooldownSeconds: 120,
    });
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.telegram.org/botSECRET_BOT_TOKEN/sendMessage',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(JSON.stringify(body)).not.toContain('SECRET_BOT_TOKEN');

    vi.unstubAllGlobals();
  });

  it('returns unavailable when Telegram provider is missing secrets', async () => {
    const response = await handleSayHi(
      createRequest(validBody),
      createEnv({
        SAY_HI_PROVIDER: 'telegram',
        SAY_HI_USE_MOCK_GATEWAY: 'false',
      }),
    );
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(503);
    expect(body).toEqual({ status: 'unavailable', requestId });
    expect(JSON.stringify(body)).not.toContain('TELEGRAM');
  });
});
