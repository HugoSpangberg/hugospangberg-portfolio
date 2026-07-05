# Deployment

## Local

```sh
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Copy `.dev.vars.example` to `.dev.vars` for local Worker development and keep real values out of git.

## Preview

Preview must keep `SAY_HI_USE_MOCK_GATEWAY=true` so no real lamp is contacted.

```sh
npm run build
npx wrangler deploy --env preview
```

## Production

Production requires these Worker secrets:

- `TURNSTILE_SECRET_KEY`
- `HOME_AUTOMATION_WEBHOOK_URL`
- `HOME_AUTOMATION_ACCESS_CLIENT_ID`
- `HOME_AUTOMATION_ACCESS_CLIENT_SECRET`

Set production vars:

- `ALLOWED_ORIGIN`
- `SAY_HI_ENABLED`
- `SAY_HI_COOLDOWN_SECONDS`
- `SAY_HI_USE_MOCK_GATEWAY=false`

Deploy only after lint, typecheck, tests and build pass.
