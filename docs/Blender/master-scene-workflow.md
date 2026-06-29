# Career World Master Scene Workflow

The editable master scene is generated at:

```text
Assets/Blender/Sources/career-world-master.blend
```

It appends the current environment and all five landmark source files into one Blender scene. Landmarks are placed on the same environment anchors that the Three.js runtime uses.

## Local Setup

```bash
export BLENDER_EXECUTABLE="/Applications/Blender.app/Contents/MacOS/Blender"
```

## Create Or Refresh The Master Scene

```bash
npm run models:assemble
```

This recreates `career-world-master.blend` from the current source `.blend` files and also writes `Assets/Blender/Exports/career-world-master.glb` for review.

Run this before manual editing if you want a clean assembled scene. Do not run it after manual edits unless you intentionally want to regenerate the master scene.

The generated master `.blend` and review GLB are local workflow artifacts and are ignored by Git.

## Edit In Blender

Open:

```text
Assets/Blender/Sources/career-world-master.blend
```

Recommended rules:

- Keep each landmark under its `LM_*_Root` object.
- Move environment anchors such as `Anchor_Sodra` to change runtime placement.
- Do not delete `Anchor_Hotspot`, `Anchor_Label`, `Anchor_Light`, or `Anchor_CameraFocus`.
- Keep landmark geometry local to its landmark root.
- Use `Camera_Master_Hero` and `Camera_Master_Mobile` to review the whole scene.

## Export Manual Edits Back To Portfolio Assets

```bash
npm run models:export-master
```

This opens the master scene and exports the runtime files back to:

```text
HSClient/public/models/career-world/
```

Landmark roots are temporarily exported around local origin because runtime placement is driven by the environment anchors.

## Render Master Previews

```bash
npm run models:preview-master
```

Outputs:

```text
Assets/Blender/Previews/career-world-master-validation.png
Assets/Blender/Previews/career-world-master-hero.png
Assets/Blender/Previews/career-world-master-mobile.png
```

Preview images are local-only review artifacts and are ignored by Git.

## Validate

```bash
npm run models:validate
```

Validation checks that the manifest and required runtime files are present and usable by the current fallback-capable loader.
