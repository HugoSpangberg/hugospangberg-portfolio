# Blender Asset Pipeline

Career-world landmark geometry is moving from procedural Three.js primitives toward authored GLB assets.

Current state:

- Blender scripts exist in `Assets/Blender/Scripts`.
- Source `.blend`, exported `.glb`, previews and reports are intentionally ignored until generated locally.
- `HSClient/public/models/career-world/manifest.json` declares the intended runtime assets.
- Procedural Three.js landmarks remain the runtime fallback.

Run:

```bash
bash Scripts/export-models.sh
npm run models:validate
```

Blender CLI was not available during this pass, so no `.blend` or `.glb` files were generated or verified.
