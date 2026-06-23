export type RequestContext = {
  requestId: string;
  origin: string | null;
  ipHash: string;
};

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

export async function createRequestContext(request: Request): Promise<RequestContext> {
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(ip));

  return {
    requestId: crypto.randomUUID(),
    origin: request.headers.get('origin'),
    ipHash: toHex(digest).slice(0, 24),
  };
}
