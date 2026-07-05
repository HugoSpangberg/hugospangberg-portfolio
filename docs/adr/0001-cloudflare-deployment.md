# ADR 0001: Cloudflare Deployment

## Problem

The portfolio needs static hosting, security headers, a small backend endpoint, bot protection and edge-side rate limiting.

## Decision

Use GitHub Pages for the static Vite build and a Cloudflare Worker route for `/api/v1/greetings`. The older `/api/say-hi` route remains as a compatibility alias.

## Alternatives

- Static-only hosting: simpler, but cannot safely contact Telegram or Home Assistant.
- Traditional server: flexible, but more operational overhead for a small portfolio.

## Consequences

Cloudflare gives Turnstile, Worker secrets, Durable Objects and edge deployment in one platform. The project must maintain Wrangler configuration and environment separation.
