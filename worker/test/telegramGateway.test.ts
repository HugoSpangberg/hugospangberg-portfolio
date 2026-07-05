// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { TelegramGateway } from '../src/services/telegramGateway';

describe('TelegramGateway', () => {
  it('sends a concise lamp notification to Telegram', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    const gateway = new TelegramGateway({
      botToken: 'SECRET_BOT_TOKEN',
      chatId: '123456',
      fetcher,
    });

    await expect(
      gateway.sendHello({
        requestId: 'request-1',
        timestamp: '2026-07-05T12:00:00.000Z',
        locale: 'sv',
      }),
    ).resolves.toEqual({ status: 'sent' });

    expect(fetcher).toHaveBeenCalledWith(
      'https://api.telegram.org/botSECRET_BOT_TOKEN/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      }),
    );

    const init = fetcher.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(init.body)) as {
      chat_id: string;
      text: string;
    };

    expect(body.chat_id).toBe('123456');
    expect(body.text).toContain('Någon klickade på lampan');
    expect(body.text).toContain('Request ID: request-1');
    expect(body.text).not.toContain('SECRET_BOT_TOKEN');
  });

  it('returns unavailable when Telegram config is missing', async () => {
    const fetcher = vi.fn();
    const gateway = new TelegramGateway({ fetcher });

    await expect(
      gateway.sendHello({
        requestId: 'request-1',
        timestamp: '2026-07-05T12:00:00.000Z',
      }),
    ).resolves.toEqual({ status: 'unavailable', reason: 'missing_config' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('maps Telegram non-200 responses to unavailable', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: false }), { status: 500 }),
      );
    const gateway = new TelegramGateway({
      botToken: 'SECRET_BOT_TOKEN',
      chatId: '123456',
      fetcher,
    });

    await expect(
      gateway.sendHello({
        requestId: 'request-1',
        timestamp: '2026-07-05T12:00:00.000Z',
      }),
    ).resolves.toEqual({ status: 'unavailable', reason: 'bad_response' });
  });
});
