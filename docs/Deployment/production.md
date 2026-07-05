# Production Deployment

Current public frontend:

- `https://hugospangberg.github.io/hugospangberg-portfolio/` -> GitHub Pages static HSClient build

Future hosted service hostnames:

- `api.<production-domain>` -> HSApi container or managed .NET hosting
- `cms.<production-domain>` -> HSCms persistent .NET hosting

Production requirements:

- HTTPS for all public services
- strict CORS in HSApi and HSCms
- persistent SQL Server databases for CMS and API
- persistent media storage for HSCms
- regular database and media backups
- deployment step for HSApi EF migrations
- protected HSCms backoffice
- no preview CMS key in HSClient
