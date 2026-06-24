# 0003 Vertical Slice API

Status: Accepted

Context: The API is small and feature-oriented.

Decision: Organize controllers, handlers and contracts by feature under `HSApi/Features`.

Alternatives: Layered `Controllers/Services/Repositories`; MediatR-style request pipeline.

Consequences: Request flow is easy to trace. Shared infrastructure still lives under `Infrastructure`.
