# Architecture

The portfolio is a Vite, React and TypeScript application. Existing portfolio sections remain in `src/components`; new feature work is isolated under `src/features/say-hi`.

## Frontend

`SayHiSection` renders the product demo section, accessible HTML controls and status panel. `useSayHi` owns the discriminated-union state model so UI states are explicit instead of spread across booleans.

## 3D layer

`SayHiLampScene` is lazy-loaded and uses Three.js directly, matching the existing project. The lamp is generated from simple optimized primitives, uses reusable materials and responds to `idle`, `hover`, `armed`, `verifying`, `sending`, `success`, `cooldown`, `error` and `unavailable`.

## Worker/API

`POST /api/v1/greetings` validates JSON with Zod, verifies the exact allowed origin, verifies Turnstile server-side, checks rate limiting, reserves a global cooldown and calls the configured notification provider. The older `/api/say-hi` route remains as a compatibility alias.

## Rate limiting

The Worker supports a Cloudflare Rate Limiting binding through `SAY_HI_RATE_LIMITER`. Local and tests use an in-memory fallback. The global cooldown is atomic through the `SayHiCooldown` Durable Object.

## Turnstile

The browser obtains a single-use Turnstile token before sending. The Worker validates it with Cloudflare Siteverify. Tests and local mock mode use Cloudflare test keys.

## Notification Gateway

The frontend only knows the configured Say Hi endpoint. The Worker chooses a provider through `SAY_HI_PROVIDER`: `telegram` for the first public version, `homeassistant` for the older smart-home path, or `mock` for local and preview testing.

## Deployment

GitHub Pages serves the static portfolio. The public Say Hi flow points at the Cloudflare Worker route `/api/v1/greetings`. Production requires Worker secrets for Turnstile and Telegram. Telegram tokens and chat IDs never belong in the React bundle.
