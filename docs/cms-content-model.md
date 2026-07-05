# CMS Content Model

The portfolio is a single-page site with one culture-variant root document:

```text
portfolioHome
```

Swedish (`sv-SE`) is the default culture and English (`en-US`) is a second
published culture.

## Recommended Compositions

- `seoComposition`
- `heroComposition`
- `aboutComposition`
- `contactComposition`
- `sayHiComposition`
- `footerComposition`

## Recommended Element Types

- `heroAction`
- `systemThinkingCard`
- `skillGroup`
- `experienceItem`
- `educationItem`
- `labItem`
- `builtWithGroup`
- `contactLink`

## Editor Rules

Visitor-facing text should be culture variant. Technical identifiers such as
`sceneKey`, `anchorId`, and button variants should be invariant and constrained.

Allowed career-world scene keys:

```text
dasa
sodra
visma
filmstaden
education
```

CMS content must not contain Home Assistant URLs, webhook IDs, Turnstile secrets,
rate limits, or private infrastructure details.
