# CMS Security

## Boundaries

Umbraco stores editorial portfolio content. It must not store:

- Home Assistant URLs
- webhook IDs
- Turnstile secrets
- rate-limit settings
- Cloudflare Access service tokens
- database credentials

## Production Rules

- Use HTTPS.
- Use strong unique backoffice passwords.
- Do not commit admin credentials.
- Do not expose preview API keys in the browser.
- Do not use wildcard CORS in production.
- Keep Swagger/development diagnostics out of production.
- Return generic public errors.
- Keep local databases, logs, and media uploads out of git.

## Content XSS

Prefer structured fields over arbitrary HTML. If rich text is introduced, render
through a controlled React renderer or sanitize with a maintained sanitizer.
External links should use `rel="noopener noreferrer"`.

## Delivery API

Only published public content should be readable. Draft content and preview keys
remain server-side/backoffice concerns.
