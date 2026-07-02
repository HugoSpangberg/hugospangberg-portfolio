# Admin API

HSApi exposes public read endpoints separately from protected admin endpoints.

## Authentication

- `GET /api/v1/admin/auth/csrf`
- `POST /api/v1/admin/auth/login`
- `GET /api/v1/admin/auth/session`
- `POST /api/v1/admin/auth/logout`

Login uses an HTTP-only cookie. Unsafe admin requests require the antiforgery
token in `X-CSRF-TOKEN`. Failed logins are rate-limited.

## Public Reads

- `GET /api/v1/portfolio/{locale}`
- `GET /api/v1/experiences?locale=sv`
- `GET /api/v1/projects?locale=sv`
- `GET /api/v1/projects/{slug}?locale=sv`

Public responses filter out items with `isPublished=false`. Older fallback
items that do not have `isPublished` are treated as published.

## Admin Experiences

- `GET /api/v1/admin/experiences`
- `GET /api/v1/admin/experiences/{id}`
- `POST /api/v1/admin/experiences`
- `PUT /api/v1/admin/experiences/{id}`
- `DELETE /api/v1/admin/experiences/{id}`
- `POST /api/v1/admin/experiences/{id}/publish`
- `POST /api/v1/admin/experiences/{id}/unpublish`
- `PUT /api/v1/admin/experiences/order`

## Admin Projects

- `GET /api/v1/admin/projects`
- `GET /api/v1/admin/projects/{id}`
- `POST /api/v1/admin/projects`
- `PUT /api/v1/admin/projects/{id}`
- `DELETE /api/v1/admin/projects/{id}`
- `POST /api/v1/admin/projects/{id}/publish`
- `POST /api/v1/admin/projects/{id}/unpublish`
- `PUT /api/v1/admin/projects/order`

## Errors

Validation failures return `422` with `ValidationProblemDetails`. Stale versions
return `409`. Unauthenticated requests return `401`; authenticated users without
the policy return `403`.
