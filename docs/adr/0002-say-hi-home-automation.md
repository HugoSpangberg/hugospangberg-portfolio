# ADR 0002: Say Hi Home Automation Gateway

## Problem

A public portfolio visitor should be able to trigger a short home-light effect without exposing private Home Assistant endpoints or credentials.

## Decision

The browser calls only the Cloudflare Worker. The Worker validates the request and calls Home Assistant through a `HomeAutomationGateway`.

## Alternatives

- Browser to Home Assistant directly: rejected because it exposes private endpoints and cannot safely protect secrets.
- Manual notification only: safer but does not deliver the intended IoT product demo.

## Consequences

The architecture adds a backend hop, but secrets stay server-side and production can use Home Assistant Cloud or Cloudflare Tunnel with Access service-token protection.
