import type {
  HomeAutomationGateway,
  HomeAutomationInput,
  HomeAutomationResult,
} from './homeAutomationGateway';

type TelegramGatewayOptions = {
  botToken?: string;
  chatId?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

function createMessage(input: HomeAutomationInput) {
  const language =
    input.locale === 'en'
      ? 'English'
      : input.locale === 'sv'
        ? 'Swedish'
        : 'Unknown';

  return [
    '👋 Någon klickade på lampan i din portfolio.',
    '',
    'Portfolio: Hugo Spångberg',
    `Tid: ${input.timestamp}`,
    `Språk: ${language}`,
    `Request ID: ${input.requestId}`,
  ].join('\n');
}

export class TelegramGateway implements HomeAutomationGateway {
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;

  constructor(private readonly options: TelegramGatewayOptions) {
    this.fetcher = options.fetcher ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 5_000;
  }

  async sendHello(input: HomeAutomationInput): Promise<HomeAutomationResult> {
    if (!this.options.botToken || !this.options.chatId) {
      return { status: 'unavailable', reason: 'missing_config' };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetcher(
        `https://api.telegram.org/bot${this.options.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            chat_id: this.options.chatId,
            text: createMessage(input),
            disable_web_page_preview: true,
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        return { status: 'unavailable', reason: 'bad_response' };
      }

      return { status: 'sent' };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { status: 'unavailable', reason: 'timeout' };
      }

      return { status: 'unavailable', reason: 'bad_response' };
    } finally {
      clearTimeout(timeout);
    }
  }
}
