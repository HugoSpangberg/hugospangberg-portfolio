# CMS Deployment

Recommended production separation:

```text
www.example.com -> static React frontend
cms.example.com -> Umbraco CMS and Delivery API
```

## Frontend

Set:

```text
VITE_CMS_ENABLED=true
VITE_UMBRACO_BASE_URL=https://cms.example.com
VITE_UMBRACO_CONTENT_ROUTE=/
VITE_CMS_REQUEST_TIMEOUT_MS=3500
```

Only public values may use `VITE_`.

## CMS

Use environment variables for:

- SQL Server connection string
- allowed frontend origins
- unattended install only when provisioning a new environment
- runtime mode

Do not deploy local SQLite as the default production database. If a small
single-instance SQLite deployment is chosen later, document backup, persistence,
concurrency, and restore tradeoffs explicitly.

## Backups

Back up database and media storage together. Test restore before relying on the
backup plan.
