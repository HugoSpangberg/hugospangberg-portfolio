# 0006 Blender GLB Asset Pipeline

Status: Accepted

Context: Procedural landmark geometry is good for fallback but harder to author visually.

Decision: Move landmark geometry toward Blender-authored GLB files with scripts, manifest and validation.

Alternatives: Keep all geometry procedural; use heavy downloaded models.

Consequences: Models can become more polished. Blender is an optional toolchain dependency and procedural fallback remains necessary.
