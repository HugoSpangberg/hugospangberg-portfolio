export class CmsHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'CmsHttpError';
  }
}

export class CmsTimeoutError extends Error {
  constructor(message = 'CMS request timed out') {
    super(message);
    this.name = 'CmsTimeoutError';
  }
}

export async function fetchJsonWithTimeout(
  url: string,
  {
    timeoutMs,
    signal,
    headers,
  }: {
    timeoutMs: number;
    signal?: AbortSignal;
    headers?: HeadersInit;
  },
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  const abort = () => controller.abort(signal?.reason);
  signal?.addEventListener('abort', abort, { once: true });

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new CmsHttpError(`CMS responded with ${response.status}`, response.status);
    }

    const data: unknown = await response.json();

    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new CmsTimeoutError();
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
