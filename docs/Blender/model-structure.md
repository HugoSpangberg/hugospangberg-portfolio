# Career World Model Structure

Blender source files live in `Assets/Blender/Sources`. Runtime GLB files are copied to `HSClient/public/models/career-world`. `.blend` files are not served publicly.

## Required Files

- `career-world-environment.blend` exports `career-world-environment.glb`.
- `filmstaden.blend` exports `filmstaden.glb`.
- `visma.blend` exports `visma.glb`.
- `sodra.blend` exports `sodra.glb`.
- `dasa-forestry.blend` exports `dasa-forestry.glb`.
- `education.blend` exports `education.glb`.

## Required Anchors

The environment must contain:

`Anchor_Filmstaden`, `Anchor_Visma`, `Anchor_Sodra`, `Anchor_Dasa`, `Anchor_Education`, `Anchor_CareerHub`

Each landmark must contain:

`Anchor_Hotspot`, `Anchor_Label`, `Anchor_Light`, `Anchor_CameraFocus`

Anchors are exported as named empty nodes. Three.js validates them before replacing fallback geometry.

## Naming

Use deliberate names such as `LM_Dasa_HarvesterBody`, `LM_Filmstaden_CurvedMarquee` and `Anchor_Label`. Avoid default names as object names and mesh datablock names.

## Scale

The authored world uses meters at miniature scale. Blender uses Z-up; glTF export converts to the Y-up runtime used by Three.js. Runtime placement may use small presentation offsets, but the GLB files should arrive at a sensible scene scale.
