# Production Deployment

Recommended hostnames:

- `www.example.com` -> HSClient static hosting/CDN
- `api.example.com` -> HSApi container or managed .NET hosting
- `cms.example.com` -> HSCms persistent .NET hosting

Production requirements:

- HTTPS for all public services
- strict CORS in HSApi and HSCms
- persistent SQL Server databases for CMS and API
- persistent media storage for HSCms
- regular database and media backups
- deployment step for HSApi EF migrations
- protected HSCms backoffice
- no preview CMS key in HSClient
