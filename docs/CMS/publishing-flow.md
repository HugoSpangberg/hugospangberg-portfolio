# CMS Publishing Flow

Editors publish bilingual content in HSCms. HSApi fetches the published Delivery API response, validates the content shape, maps it to the stable client contract and stores a current `ContentSnapshot`.

HSClient never calls HSCms directly. This keeps Umbraco aliases, block-list details, media URL differences and CMS outages behind HSApi.

Required cultures:

- `sv-SE`
- `en-US`

Frontend locales:

- `sv` maps to `sv-SE`
- `en` maps to `en-US`
