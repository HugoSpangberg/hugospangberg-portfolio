# 0004 Umbraco Data Ownership

Status: Accepted

Context: Umbraco owns a complex internal schema that changes across versions.

Decision: HSApi reads HSCms only through HTTP Delivery API responses. EF Core must not map Umbraco tables.

Alternatives: Direct SQL reads from Umbraco tables; shared compiled CMS models.

Consequences: Upgrades are safer. Mapping code is required at the HTTP boundary.
