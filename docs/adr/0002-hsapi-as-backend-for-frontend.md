# 0002 HSApi as Backend for Frontend

Status: Accepted

Context: HSClient should not know Umbraco Delivery API shapes or Home Assistant infrastructure.

Decision: HSClient calls HSApi only. HSApi fetches CMS content, validates it, stores snapshots and handles Say Hi.

Alternatives: Browser calls HSCms directly; Cloudflare Worker remains the main backend.

Consequences: HSApi becomes the public data boundary. It adds one service but removes secret and CMS coupling from the browser.
