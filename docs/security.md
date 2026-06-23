# Security

## Threat model

The public endpoint can be abused by bots, scripted requests, origin spoofing attempts, replayed requests and denial-of-service traffic. The main protected asset is the private Home Assistant environment.

## Controls

- The browser never calls Home Assistant directly.
- The Worker accepts only the configured `ALLOWED_ORIGIN`.
- `POST /api/say-hi` requires `application/json` and a small request body.
- Zod validates locale, Turnstile token and UUID request id.
- Turnstile is verified server-side before any home automation call.
- Per-IP rate limiting uses hashed IP identifiers and avoids permanent full-IP storage.
- A Durable Object enforces global cooldown server-side.
- Home Assistant secrets and webhook URLs are Worker secrets only.
- Production can use Cloudflare Access service-token headers for tunnel-protected webhook access.
- Responses are generic and never include internal URLs, tokens or secrets.

## Residual risks

Origin headers are not authentication, so Turnstile, rate limiting and cooldown remain mandatory. The function can still be unavailable if Cloudflare, Home Assistant Cloud, a tunnel or the local lamp is offline.
