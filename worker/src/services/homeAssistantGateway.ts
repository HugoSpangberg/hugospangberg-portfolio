import type { HomeAutomationGateway, HomeAutomationResult } from './homeAutomationGateway';

type HomeAssistantGatewayOptions = {
  webhookUrl?: string;
  accessClientId?: string;
  accessClientSecret?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

export class HomeAssistantGateway implements HomeAutomationGateway {
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;

  constructor(private readonly options: HomeAssistantGatewayOptions) {
    this.fetcher = options.fetcher ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 5000;
  }

  async sendHello(input: { requestId: string; timestamp: string }): Promise<HomeAutomationResult> {
    if (!this.options.webhookUrl) {
      return { status: 'unavailable', reason: 'missing_config' };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers = new Headers({ 'content-type': 'application/json' });

      if (this.options.accessClientId && this.options.accessClientSecret) {
        headers.set('cf-access-client-id', this.options.accessClientId);
        headers.set('cf-access-client-secret', this.options.accessClientSecret);
      }

      const response = await this.fetcher(this.options.webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      return response.ok ? { status: 'sent' } : { status: 'unavailable', reason: 'bad_response' };
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
