// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { HomeAssistantGateway } from '../src/services/homeAssistantGateway';
import { MockHomeAutomationGateway } from '../src/services/homeAutomationGateway';

describe('HomeAutomationGateway implementations', () => {
  it('mock gateway sends without external calls', async () => {
    await expect(
      new MockHomeAutomationGateway().sendHello({
        requestId: 'request-1',
        timestamp: '2026-06-23T10:00:00.000Z',
      }),
    ).resolves.toEqual({ status: 'sent' });
  });

  it('maps Home Assistant timeout to unavailable', async () => {
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((_, reject) => {
          setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 20);
        }),
    ) as unknown as typeof fetch;

    const gateway = new HomeAssistantGateway({
      webhookUrl: 'https://home.example.com/webhook',
      fetcher,
      timeoutMs: 1,
    });

    await expect(
      gateway.sendHello({
        requestId: 'request-1',
        timestamp: '2026-06-23T10:00:00.000Z',
      }),
    ).resolves.toEqual({ status: 'unavailable', reason: 'timeout' });
  });
});
