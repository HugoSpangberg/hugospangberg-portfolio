import type { Locale } from '../../../data/content';
import type { SayHiApiRequest, SayHiApiResponse } from '../model/sayHiTypes';

const defaultEndpoint = '/api/v1/greetings';

export type SayHiClientOptions = {
  endpoint?: string;
  fetcher?: typeof fetch;
};

export class SayHiClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'SayHiClientError';
  }
}

function isLocalMissingApi(endpoint: string | undefined, response: Response) {
  const isDefaultEndpoint = !endpoint || endpoint === defaultEndpoint;
  const isLocalHost =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return isDefaultEndpoint && isLocalHost && response.status === 404;
}

export async function sendSayHi(
  input: SayHiApiRequest,
  options: SayHiClientOptions = {},
): Promise<SayHiApiResponse> {
  const response = await (options.fetcher ?? fetch)(options.endpoint ?? defaultEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (isLocalMissingApi(options.endpoint, response)) {
    return {
      status: 'accepted',
      requestId: input.requestId,
      cooldownSeconds: 12,
      localOnly: true,
    };
  }

  const body = (await response.json().catch(() => null)) as SayHiApiResponse | null;

  if ((response.status === 429 || response.status === 503 || response.ok) && body) {
    return body;
  }

  throw new SayHiClientError('Say hi request failed.', response.status);
}

export function createSayHiRequest(locale: Locale, turnstileToken: string): SayHiApiRequest {
  return {
    locale,
    turnstileToken,
    requestId: crypto.randomUUID(),
  };
}
