import { handleSayHi } from './routes/sayHi';
import type { Env } from './types';

export class SayHiCooldown {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(
    requestInfo: Request | string,
    init?: RequestInit,
  ): Promise<Response> {
    const request =
      requestInfo instanceof Request
        ? requestInfo
        : new Request(requestInfo, init);

    if (request.method !== 'POST') {
      return new Response(null, { status: 405 });
    }

    const body = (await request.json()) as {
      requestId: string;
      seconds: number;
    };
    const now = Date.now();
    const cooldownUntil =
      (await this.state.storage.get<number>('cooldownUntil')) ?? 0;

    if (cooldownUntil > now) {
      return Response.json({
        status: 'cooldown',
        requestId: body.requestId,
        retryAfterSeconds: Math.ceil((cooldownUntil - now) / 1000),
      });
    }

    await this.state.storage.put('cooldownUntil', now + body.seconds * 1000);

    return Response.json({
      status: 'reserved',
      requestId: body.requestId,
      cooldownSeconds: body.seconds,
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (
      url.pathname === '/api/say-hi' ||
      url.pathname === '/api/v1/greetings'
    ) {
      return handleSayHi(request, env);
    }

    return new Response('Not found', { status: 404 });
  },
};
