# 0009 No Mediator or Automatic Mapper

Status: Accepted

Context: The codebase should demonstrate clear engineering rather than framework ceremony.

Decision: Use explicit handlers and handwritten mapping. Do not add MediatR, AutoMapper, Mapster or FluentValidation.

Alternatives: Add mediator pipelines and mapping frameworks.

Consequences: More direct code and easier debugging. Some mapping code is handwritten by design.
