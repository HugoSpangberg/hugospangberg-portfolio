import { sayHiRequestSchema } from '../validation/sayHiSchema';
import { corsHeaders, isAllowedOrigin, securityHeaders } from '../security/cors';
import { createRequestContext } from '../security/requestContext';
import { HomeAssistantGateway } from '../services/homeAssistantGateway';
import { MockHomeAutomationGateway, type HomeAutomationGateway } from '../services/homeAutomationGateway';
import { CloudflareTurnstileVerifier, MockTurnstileVerifier, type TurnstileVerifier } from '../services/turnstileVerifier';
import type { Env } from '../types';

const maxBodyBytes = 2048;
const inMemoryAttempts = new Map<string, { count: number; resetAt: number }>();

function jsonResponse(body: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: securityHeaders(origin),
  });
}

function isEnabled(env: Env) {
  return env.SAY_HI_ENABLED !== 'false';
}

function cooldownSeconds(env: Env) {
  const parsed = Number(env.SAY_HI_COOLDOWN_SECONDS ?? 120);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 120;
}

async function parseJsonBody(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);

  if (contentLength > maxBodyBytes) {
    return null;
  }

  const text = await request.text();

  if (text.length > maxBodyBytes) {
    return null;
  }

  return JSON.parse(text) as unknown;
}

async function isRateLimited(env: Env, ipHash: string) {
  if (env.SAY_HI_RATE_LIMITER) {
    const result = await env.SAY_HI_RATE_LIMITER.limit({ key: ipHash });
    return !result.success;
  }

  const now = Date.now();
  const current = inMemoryAttempts.get(ipHash);

  if (!current || current.resetAt <= now) {
    inMemoryAttempts.set(ipHash, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  current.count += 1;
  return current.count > 5;
}

function createTurnstileVerifier(env: Env): TurnstileVerifier {
  if (env.TURNSTILE_SECRET_KEY.startsWith('1x000') || env.SAY_HI_USE_MOCK_GATEWAY === 'true') {
    return new MockTurnstileVerifier();
  }

  return new CloudflareTurnstileVerifier(env.TURNSTILE_SECRET_KEY);
}

function createGateway(env: Env): HomeAutomationGateway {
  if (env.SAY_HI_USE_MOCK_GATEWAY === 'true') {
    return new MockHomeAutomationGateway();
  }

  return new HomeAssistantGateway({
    webhookUrl: env.HOME_AUTOMATION_WEBHOOK_URL,
    accessClientId: env.HOME_AUTOMATION_ACCESS_CLIENT_ID,
    accessClientSecret: env.HOME_AUTOMATION_ACCESS_CLIENT_SECRET,
  });
}

async function reserveCooldown(env: Env, requestId: string, seconds: number) {
  const id = env.SAY_HI_COOLDOWN.idFromName('global');
  const object = env.SAY_HI_COOLDOWN.get(id);
  const response = await object.fetch('https://say-hi-cooldown.local/reserve', {
    method: 'POST',
    body: JSON.stringify({ requestId, seconds }),
  });

  return response.json() as Promise<
    | { status: 'reserved'; requestId: string; cooldownSeconds: number }
    | { status: 'cooldown'; requestId: string; retryAfterSeconds: number }
  >;
}

export async function handleSayHi(request: Request, env: Env): Promise<Response> {
  const context = await createRequestContext(request);

  if (request.method === 'OPTIONS') {
    return isAllowedOrigin(context.origin, env)
      ? new Response(null, { status: 204, headers: corsHeaders(context.origin ?? '') })
      : new Response(null, { status: 403 });
  }

  if (!isAllowedOrigin(context.origin, env)) {
    return new Response(JSON.stringify({ status: 'error', requestId: context.requestId }), {
      status: 403,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const origin = context.origin ?? env.ALLOWED_ORIGIN;

  if (request.method !== 'POST') {
    return jsonResponse({ status: 'error', requestId: context.requestId }, 405, origin);
  }

  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return jsonResponse({ status: 'error', requestId: context.requestId }, 415, origin);
  }

  if (!isEnabled(env)) {
    return jsonResponse({ status: 'unavailable', requestId: context.requestId }, 503, origin);
  }

  if (await isRateLimited(env, context.ipHash)) {
    return jsonResponse(
      { status: 'cooldown', requestId: context.requestId, retryAfterSeconds: 60 },
      429,
      origin,
    );
  }

  let body: unknown;
  try {
    body = await parseJsonBody(request);
  } catch {
    return jsonResponse({ status: 'error', requestId: context.requestId }, 400, origin);
  }

  const parsed = sayHiRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonResponse({ status: 'error', requestId: context.requestId }, 400, origin);
  }

  const verifier = createTurnstileVerifier(env);
  const verified = await verifier.verify(
    parsed.data.turnstileToken,
    request.headers.get('cf-connecting-ip') ?? undefined,
  );

  if (!verified) {
    return jsonResponse({ status: 'error', requestId: parsed.data.requestId }, 400, origin);
  }

  const reserved = await reserveCooldown(env, parsed.data.requestId, cooldownSeconds(env));

  if (reserved.status === 'cooldown') {
    return jsonResponse(reserved, 429, origin);
  }

  const result = await createGateway(env).sendHello({
    requestId: parsed.data.requestId,
    timestamp: new Date().toISOString(),
  });

  if (result.status !== 'sent') {
    console.warn(
      JSON.stringify({
        event: 'say_hi_unavailable',
        requestId: parsed.data.requestId,
        reason: result.reason,
      }),
    );

    return jsonResponse({ status: 'unavailable', requestId: parsed.data.requestId }, 503, origin);
  }

  console.info(JSON.stringify({ event: 'say_hi_accepted', requestId: parsed.data.requestId }));

  return jsonResponse(
    {
      status: 'accepted',
      requestId: parsed.data.requestId,
      cooldownSeconds: reserved.cooldownSeconds,
    },
    200,
    origin,
  );
}
