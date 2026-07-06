# ADR 0001: Cloudflare Deployment

## Problem

The portfolio needs static hosting, security headers, a small backend endpoint, bot protection and edge-side rate limiting.

## Decision

Use Cloudflare Pages/Workers with static assets from Vite and a Worker route for `/api/say-hi`.

## Alternatives

- Static-only hosting: simpler, but cannot safely contact Home Assistant.
- Traditional server: flexible, but more operational overhead for a small portfolio.

## Consequences

Cloudflare gives Turnstile, Worker secrets, Durable Objects and edge deployment in one platform. The project must maintain Wrangler configuration and environment separation.
