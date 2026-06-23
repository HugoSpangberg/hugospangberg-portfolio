export type TurnstileVerifier = {
  verify(token: string, remoteIp?: string): Promise<boolean>;
};

type TurnstileResponse = {
  success: boolean;
  'error-codes'?: string[];
};

export class CloudflareTurnstileVerifier implements TurnstileVerifier {
  constructor(
    private readonly secretKey: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async verify(token: string, remoteIp?: string): Promise<boolean> {
    const body = new FormData();
    body.set('secret', this.secretKey);
    body.set('response', token);

    if (remoteIp) {
      body.set('remoteip', remoteIp);
    }

    const response = await this.fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });

    if (!response.ok) {
      return false;
    }

    const result = (await response.json()) as TurnstileResponse;
    return result.success;
  }
}

export class MockTurnstileVerifier implements TurnstileVerifier {
  async verify(token: string): Promise<boolean> {
    return token.length > 0 && !token.includes('fail');
  }
}
