# Security

Security boundaries:

- HSClient contains only public configuration.
- The Say Hi Worker owns Turnstile verification, greeting cooldown, rate limiting and provider calls.
- HSApi owns portfolio API/admin behavior when it is hosted.
- HSCms owns editorial backoffice and published content.

Do not put these in HSClient or HSCms content:

- Turnstile secret
- Telegram bot token
- Telegram chat ID
- Home Assistant URL
- Home Assistant tokens
- Cloudflare Access service tokens
- API database connection string

Say Hi privacy wording must remain accurate: the feature does not collect visitor name, email or profile data, but technical request data may be processed temporarily for abuse protection.
