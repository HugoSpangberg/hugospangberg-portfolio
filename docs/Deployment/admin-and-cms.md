# Admin and CMS Deployment

## Content Flow

```text
Admin UI in HSClient
  -> HSApi admin endpoints
  -> HSCms internal management endpoints
  -> Umbraco content services
  -> Umbraco content storage
```

```text
Public HSClient
  -> HSApi public endpoints
  -> HSCms Delivery API
```

HSApi does not query Umbraco database tables and does not duplicate editable
portfolio content into its own database.

## Required Environment Variables

HSClient:

- `VITE_API_ENABLED`
- `VITE_API_BASE_URL`
- `VITE_ADMIN_ENABLED`

HSApi:

- `Cms__Enabled`
- `Cms__BaseUrl`
- `AdminAuth__Enabled`
- `AdminAuth__Username`
- `AdminAuth__Password` or `AdminAuth__PasswordHash`
- `AdminAuth__CmsManagementSecret`
- `Cors__FrontendOrigins__0`

HSCms:

- `Portfolio__InternalManagementSecret`
- `Portfolio__FrontendOrigins__0`

`AdminAuth__CmsManagementSecret` and
`Portfolio__InternalManagementSecret` must match.

## Cookies and CORS

Use exact frontend origins. Do not use wildcard origins with credentials.
Production cookies should be secure. Local development can set
`AdminAuth__RequireSecureCookies=false`.

## uSync

`HSCms/Content/portfolio-content-model.json` documents the expected stable
aliases. Export real uSync artifacts from the Umbraco backoffice after creating
or updating the document/element types. Do not commit users, passwords, local
databases or logs.

## GitHub Pages

GitHub Pages cannot host HSApi or HSCms. For a static-only deployment, set
`VITE_API_ENABLED=false` and `VITE_ADMIN_ENABLED=false` or leave
`VITE_API_BASE_URL` empty. The bundled fallback content will render the public
portfolio.

## Current Limitations

The first pass uses image URLs only; it does not implement media upload. The
admin dashboard shows education and skills as not implemented while preserving a
typed extension path.
