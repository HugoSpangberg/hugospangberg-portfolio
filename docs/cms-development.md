# CMS Development

## Commands

```bash
npm run dev:frontend
npm run dev:cms
npm run cms:restore
npm run cms:build
npm run cms:test
npm run build:all
```

Local frontend defaults to `http://localhost:5173`. The CMS uses ASP.NET launch
settings or Docker Compose on `http://localhost:5174`.

## Environment

Copy `.env.example` and provide local-only values. Do not commit `.env`.

Set `VITE_CMS_ENABLED=true` only when a local or remote CMS is available. The
site remains usable with `VITE_CMS_ENABLED=false`.

## Adding Content Fields

1. Add the field in Umbraco.
2. Export schema through uSync.
3. Extend `shared-content/portfolio.seed.json` if fallback needs the field.
4. Extend `portfolioContentSchema`.
5. Map the new field in the CMS adapter.
6. Update tests.
