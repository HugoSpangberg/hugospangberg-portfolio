# Testing Strategy

HSClient uses Vitest and Playwright for content fallback, language behavior, Say Hi state and core visual flows.

HSApi uses xUnit for handlers, mapping and business rules. Integration tests should use `WebApplicationFactory` with replaced external HTTP handlers before production deployment.

HSCms tests cover custom code only. Umbraco itself is not unit-tested here.

External services are mocked or disabled in automated tests. Tests must not contact real Telegram, Home Assistant or Turnstile services.
