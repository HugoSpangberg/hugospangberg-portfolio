# Say hi Home Assistant setup

Replace these placeholders in `say-hi-automation.example.yaml`:

- `REPLACE_WITH_RANDOM_WEBHOOK_ID`: a long random webhook id generated in Home Assistant.
- `light.REPLACE_WITH_LIGHT_ENTITY_ID`: the light that may briefly turn red.

Production options:

- Home Assistant Cloud: use the remote webhook URL as `HOME_AUTOMATION_WEBHOOK_URL`.
- Cloudflare Tunnel + Access: expose only the webhook route through a tunnel and protect it with a Cloudflare Access service token. Store the Access client id and secret as Worker secrets.

Do not expose the full Home Assistant UI for this feature, and never place webhook URLs or tokens in frontend code.
