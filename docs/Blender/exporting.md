# Exporting Career World Models

The export is reproducible from the repository root when Blender is installed.

```bash
npm run models:export
npm run models:preview
npm run models:export-ai-core
npm run models:validate
```

The resolver checks `BLENDER_EXECUTABLE`, then `blender` on PATH, then common macOS and Windows install locations. Do not commit a local absolute Blender path.

Tracked source/runtime assets:

- `Assets/Blender/Sources/*.blend`
- `HSClient/public/models/career-world/*.glb`
- `HSClient/public/models/career-world/manifest.json`
- `HSClient/public/models/ai-core/ai-core.glb`
- `HSClient/public/images/ai-core/ai-core-poster.png`

The Local AI model is exported from `Assets/Blender/Sources/ai-core.blend` with:

```bash
export BLENDER_EXECUTABLE="/Applications/Blender.app/Contents/MacOS/Blender"
npm run models:export-ai-core
```

This writes the runtime GLB to `HSClient/public/models/ai-core/ai-core.glb`, renders `Assets/Blender/Previews/ai-core-desktop.png` and `Assets/Blender/Previews/ai-core-mobile.png`, and copies the desktop preview to the public poster fallback.

Local generated review artifacts:

- `Assets/Blender/Exports/*.glb`
- `Assets/Blender/Exports/**/*.glb`
- `Assets/Blender/Previews/**/*.png`
- `Assets/Blender/Reports/*`

These local artifacts are reproducible and ignored by Git. Keep them when reviewing model quality locally, but do not publish them as source.

Validation fails when required anchors are missing, triangle counts are zero, or runtime GLBs are absent. Preferred size budgets are below 2 MB for the environment and below 1.5 MB per landmark.
