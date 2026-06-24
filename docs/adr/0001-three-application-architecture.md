# 0001 Three Application Architecture

Status: Accepted

Context: The portfolio needs public rendering, application logic and editorial CMS capabilities without mixing responsibilities.

Decision: Split the repository into `HSClient`, `HSApi` and `HSCms`.

Alternatives: Single Vite app with direct CMS calls; Umbraco Razor frontend; one combined ASP.NET host.

Consequences: Boundaries are clearer and deployable independently. Local development has more moving parts.
