# ADR 0001: Headless Umbraco

## Context

The portfolio already has a custom React/Vite frontend with Three.js scenes and
the Say Hi IoT experience.

## Decision

Use Umbraco as a headless CMS and keep React as the public rendering frontend.
React reads published content through the Umbraco Content Delivery API.

## Alternatives

- Razor-rendered Umbraco site
- Keep all content hardcoded
- Use a SaaS-only CMS

## Consequences

Editors get a real backoffice while the existing interactive frontend remains
intact. The system has two deployable parts and needs CORS, cache, and fallback
handling.
