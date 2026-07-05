# Data Ownership

`HSCms` owns Umbraco content, media, users, publishing state and Umbraco schema. HSApi must not query Umbraco tables directly.

`HSApi` owns operational data:

- `ContentSnapshot`: validated portfolio JSON used as last-known-good content.
- `GreetingAttempt`: minimal Say Hi operational records for idempotency, cooldown and short retention.

Recommended production setup uses two logical SQL Server databases:

- `HSPortfolioCms`
- `HSPortfolioApi`

The local fallback can run HSApi with an in-memory store when no API connection string is configured. Production should provide an explicit SQL Server connection string and run migrations as a deployment step.
