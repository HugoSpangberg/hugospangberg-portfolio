# Say Hi Telegram Deployment

The public portfolio is static on GitHub Pages, so the lamp cannot send Telegram messages directly from React. The browser sends a small request to the Cloudflare Worker, and the Worker sends the Telegram message with server-side secrets.

## Frontend Variables

Set these as GitHub repository variables for the Pages workflow:

```text
VITE_SAY_HI_ENABLED=true
VITE_SAY_HI_ENDPOINT=https://your-worker-domain.example/api/v1/greetings
VITE_TURNSTILE_SITE_KEY=<public-turnstile-site-key>
```

Do not put Telegram values in GitHub Pages variables.

## Worker Variables And Secrets

`wrangler.jsonc` configures non-secret production values:

```text
SAY_HI_PROVIDER=telegram
SAY_HI_ENABLED=true
SAY_HI_COOLDOWN_SECONDS=120
ALLOWED_ORIGIN=https://hugospangberg.github.io
```

Store secrets with Wrangler:

```bash
wrangler secret put TELEGRAM_BOT_TOKEN --env production
wrangler secret put TELEGRAM_CHAT_ID --env production
wrangler secret put TURNSTILE_SECRET_KEY --env production
```

Never commit the bot token, chat ID or Turnstile secret.

## Telegram Bot Setup

1. Create a bot with BotFather.
2. Store the bot token as `TELEGRAM_BOT_TOKEN`.
3. Send a message to the bot from the target Telegram account or group.
4. Resolve the chat ID and store it as `TELEGRAM_CHAT_ID`.
5. Deploy the Worker and test from the GitHub Pages origin.

The Worker message intentionally avoids IP addresses and personal visitor data. It includes the portfolio name, timestamp, locale and request ID.

## Local Development

Use mock mode for local frontend work:

```text
SAY_HI_PROVIDER=mock
SAY_HI_USE_MOCK_GATEWAY=true
VITE_SAY_HI_ENABLED=true
VITE_SAY_HI_ENDPOINT=/api/v1/greetings
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

The Worker also keeps `/api/say-hi` as a compatibility route, but new clients should use `/api/v1/greetings`.
