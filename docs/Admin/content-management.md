# Portfolio Content Management

The admin UI lives in `HSClient` under `/admin`. It is disabled unless:

- `VITE_ADMIN_ENABLED=true`
- `VITE_API_BASE_URL` points at a running HSApi instance

The public navigation does not link to admin routes. Security is enforced by
HSApi cookie authentication and the `PortfolioAdmin` authorization policy.

## Local Startup

1. Start HSCms.
2. Start HSApi with `Cms__BaseUrl` pointing at HSCms.
3. Start HSClient with `VITE_API_BASE_URL` pointing at HSApi.

Use the same server-only shared value for:

- `Portfolio__InternalManagementSecret`
- `AdminAuth__CmsManagementSecret`

## Bootstrap

Configure the initial admin account through environment variables:

- `AdminAuth__Enabled=true`
- `AdminAuth__Username`
- `AdminAuth__Password` or `AdminAuth__PasswordHash`

Do not commit real passwords or shared secrets.

## Editable Content

Implemented in the first pass:

- experiences / jobs
- projects

Prepared but not fully implemented in the UI:

- education
- skill groups
- contact/navigation/hero/SEO content

Experiences and projects support draft state, publish/unpublish, delete,
locale separation, sort order, stable ids, slugs and optimistic concurrency via
`version`.

## Public Fallback

GitHub Pages remains static. When `VITE_API_ENABLED` is not `true` or
`VITE_API_BASE_URL` is empty, HSClient uses bundled fallback content from
`HSClient/src/data/content.ts`. Public API content replaces fallback content only
when a hosted HSApi is configured.
