# Local Development

Common commands:

```bash
npm install
npm run dev:client
npm run dev:api
npm run dev:cms
```

Ports:

- HSClient: Vite default `5173`
- HSApi: ASP.NET launch profile port
- HSCms: ASP.NET launch profile port

HSApi can run without SQL Server for local UI work. Without `ConnectionStrings__HSPortfolioApi`, it uses an in-memory database.

Do not use real Home Assistant or Turnstile secrets in local `.env` files committed to git.
