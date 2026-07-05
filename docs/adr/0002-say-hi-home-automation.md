# ADR 0002: Say Hi Notification Gateway

## Problem

A public portfolio visitor should be able to send a small "hello" signal without exposing private notification or automation credentials.

## Decision

The browser calls only the Cloudflare Worker. The Worker validates the request and calls a configured `HomeAutomationGateway` implementation. The first public production provider is Telegram. Home Assistant remains available as a later provider.

## Alternatives

- Browser to Home Assistant directly: rejected because it exposes private endpoints and cannot safely protect secrets.
- Browser to Telegram directly: rejected because it exposes the bot token and chat ID.
- Manual notification only: safer but does not deliver the intended interactive portfolio moment.

## Consequences

The architecture adds a backend hop, but secrets stay server-side. Production can use Telegram now and Home Assistant later without changing the public React flow.
