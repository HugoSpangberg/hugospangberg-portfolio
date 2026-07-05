# Request Flow

## Portfolio Content

```mermaid
sequenceDiagram
  participant C as HSClient
  participant A as HSApi
  participant U as HSCms
  participant D as API DB

  C->>A: GET /api/v1/portfolio/sv
  A->>U: GET Delivery API item
  U-->>A: Published content JSON
  A->>A: Validate and map
  A->>D: Store current snapshot
  A-->>C: Stable portfolio response with ETag
```

If HSCms is unavailable, HSApi serves the latest valid snapshot. If no snapshot exists, HSApi serves bundled seed content.

## Say Hi

```mermaid
sequenceDiagram
  participant C as HSClient
  participant W as Cloudflare Worker
  participant T as Turnstile
  participant G as Telegram Bot API
  participant D as Cooldown Durable Object

  C->>W: POST /api/v1/greetings
  W->>T: Verify token
  W->>D: Reserve global cooldown
  W->>G: Send concise lamp notification
  W-->>C: accepted, cooldown, unavailable or error
```
