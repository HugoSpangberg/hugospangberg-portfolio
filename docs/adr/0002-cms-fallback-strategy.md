# ADR 0002: CMS Fallback Strategy

## Context

The public portfolio should not go blank if the CMS is offline or returns
invalid content.

## Decision

Render bundled static content first, then replace it with valid CMS content.
Cache the last-known-good CMS response per locale.

## Alternatives

- Block rendering until CMS responds
- Static content only
- Build-time CMS fetch only

## Consequences

Visitors get a resilient page. Editors may see a short delay before fresh
published content replaces fallback content. Invalid CMS responses are discarded.
