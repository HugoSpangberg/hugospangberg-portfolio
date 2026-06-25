# Exporting Career World Models

The export is reproducible from the repository root when Blender is installed.

```bash
npm run models:export
npm run models:preview
npm run models:validate
```

The resolver checks `BLENDER_EXECUTABLE`, then `blender` on PATH, then common macOS and Windows install locations. Do not commit a local absolute Blender path.

Generated outputs:

- `Assets/Blender/Sources/*.blend`
- `Assets/Blender/Exports/*.glb`
- `Assets/Blender/Previews/*.png`
- `Assets/Blender/Reports/model-report.json`
- `HSClient/public/models/career-world/*.glb`
- `HSClient/public/models/career-world/manifest.json`

Validation fails when required anchors are missing, triangle counts are zero, or runtime GLBs are absent. Preferred size budgets are below 2 MB for the environment and below 1.5 MB per landmark.
