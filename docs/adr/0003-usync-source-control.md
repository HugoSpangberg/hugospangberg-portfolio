# ADR 0003: uSync Source Control

## Context

Umbraco document types, data types, and languages need to be reproducible across
developer machines and environments.

## Decision

Use uSync to serialize CMS schema to source control. Do not use paid Umbraco
Deploy as a required dependency.

## Alternatives

- Manual backoffice setup in every environment
- Custom database migrations for every schema item
- Umbraco Cloud/Deploy only

## Consequences

The schema can be reviewed and restored in clean environments. The team must
understand uSync import/export flow and avoid committing users, credentials, and
machine-specific state.
