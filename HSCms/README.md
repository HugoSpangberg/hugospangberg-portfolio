# Hugo Portfolio CMS

This folder contains the headless Umbraco CMS for Hugo Spangberg's portfolio.
The public site remains the React/Vite application in the repository root.

## Stack

- .NET 10
- Umbraco CMS 17.4.2
- uSync 17.3.5
- SQLite for local development
- SQL Server through environment configuration for production

## First Local Setup

1. Copy `.env.example` to `.env` outside source control or export the variables in your shell.
2. Set `UMBRACO_ADMIN_EMAIL`, `UMBRACO_ADMIN_PASSWORD`, and `UMBRACO_ADMIN_NAME`.
3. Run `./scripts/setup-cms.sh` or `./scripts/setup-cms.ps1`.
4. Run `npm run dev:cms`.
5. Open the local CMS URL shown by ASP.NET and complete any remaining install prompts.

The setup scripts write admin credentials to .NET user secrets, not to git.

## Delivery API

The frontend reads published content from:

```text
/umbraco/delivery/api/v2/content/item/{route}?culture=sv-SE
/umbraco/delivery/api/v2/content/item/{route}?culture=en-US
```

The React adapter expects the published `portfolioHome` item to expose a
portfolio content payload that maps to the existing frontend content contract.
Until that content is present, the frontend keeps using its bundled fallback.

## uSync

uSync is installed and should be used to serialize document types, data types,
languages, and editor schema once created in the backoffice. Do not commit admin
users, passwords, local databases, logs, or uploaded local media.

## Seed Content

The normalized bilingual seed lives at:

```text
shared-content/portfolio.seed.json
```

It is used as fallback data, test fixture, and the source for initial CMS
content. Normal startup must not overwrite editor changes; forced reseeding is
reserved for development only.

## Production Notes

Set allowed frontend origins through `Portfolio__FrontendOrigins__*`. Do not
use wildcard CORS in production. Use SQL Server via environment connection
strings and back up both database and media storage.
