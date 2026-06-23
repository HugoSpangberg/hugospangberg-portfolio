# Architecture

The portfolio is a Vite, React and TypeScript application. Existing portfolio sections remain in `src/components`; new feature work is isolated under `src/features/say-hi`.

## Frontend

`SayHiSection` renders the product demo section, accessible HTML controls and status panel. `useSayHi` owns the discriminated-union state model so UI states are explicit instead of spread across booleans.

## 3D layer

`SayHiLampScene` is lazy-loaded and uses Three.js directly, matching the existing project. The lamp is generated from simple optimized primitives, uses reusable materials and responds to `idle`, `hover`, `armed`, `verifying`, `sending`, `success`, `cooldown`, `error` and `unavailable`.

## Worker/API

`POST /api/say-hi` validates JSON with Zod, verifies the exact allowed origin, verifies Turnstile server-side, checks rate limiting, reserves a global cooldown and calls a Home Automation Gateway.

## Rate limiting

The Worker supports a Cloudflare Rate Limiting binding through `SAY_HI_RATE_LIMITER`. Local and tests use an in-memory fallback. The global cooldown is atomic through the `SayHiCooldown` Durable Object.

## Turnstile

The browser obtains a single-use Turnstile token before sending. The Worker validates it with Cloudflare Siteverify. Tests and local mock mode use Cloudflare test keys.

## Home Automation Gateway

The frontend only knows `/api/say-hi`. The Worker chooses `MockHomeAutomationGateway` for preview/dev or `HomeAssistantGateway` for production.

## Deployment

Cloudflare Pages/Workers serves static assets from `dist` and routes `/api/say-hi` to the Worker. Preview uses the mock gateway. Production requires Worker secrets for Turnstile and Home Assistant.
