# 0008 Static Content Fallback

Status: Accepted

Context: The portfolio should never go blank because CMS or API infrastructure is unavailable.

Decision: Keep bundled static content in HSClient and seed JSON in HSApi.

Alternatives: Require CMS/API availability for every render.

Consequences: Visitors still see a complete site during outages. Editors need to remember fallback content is a safety net, not the source of truth.
