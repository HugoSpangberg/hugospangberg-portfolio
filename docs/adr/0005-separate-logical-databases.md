# 0005 Separate Logical Databases

Status: Accepted

Context: CMS editorial data and API operational data have different owners and retention needs.

Decision: Use separate logical databases: `HSPortfolioCms` and `HSPortfolioApi`.

Alternatives: One physical database with separate schemas; one shared schema.

Consequences: Backup, restore and migrations are clearer. Local setup needs two database names in production-like environments.
