# Operations

Operational checks:

- `GET /health/live`
- `GET /health/ready`

Important logs:

- CMS fetch success or fallback source
- Say Hi request ID and outcome category
- Home Assistant availability category
- validation and rate-limit failures

Do not log secrets, Turnstile tokens, full CMS payloads, full IP addresses or private Home Assistant URLs.
