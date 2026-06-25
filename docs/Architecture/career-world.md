# Career World Runtime

The hero career world is a plain Three.js scene hosted by React. React owns locale state, selected location state and the compact information card. Three.js owns rendering, camera, controls, raycasting, aurora, data pulses, hotspot markers and animation lifecycle.

Blender owns authored geometry: the floating environment, landmark buildings, forestry scene, harvester, materials, bevels, normals and named anchor nodes. Runtime assets are loaded from `HSClient/public/models/career-world`.

## Runtime Flow

1. `WorldIntroSection` renders the first hero section and localized UI state.
2. `CareerWorldScene` creates the renderer, camera, lights, OrbitControls, fallback world, aurora and data pulses.
3. `loadCareerWorldAssets` fetches `manifest.json`, loads the environment GLB first and then landmarks.
4. A validated GLB hides the matching procedural fallback object. A failed GLB leaves that fallback visible.
5. Raycasting remains limited to invisible hotspot hit targets, not imported meshes.

Reduced motion disables the WebGL scene and uses the accessible fallback navigation. The animation loop pauses when the section is offscreen or the document is hidden. Canvas touch action stays `pan-y` in normal mobile mode so page scrolling remains available.

## Stable IDs

These IDs are integration contracts and must not change:

`dasa`, `sodra`, `visma`, `filmstaden`, `education`

They are used by localization, section scrolling, tests and hotspot state.

## Adding A Landmark

Add a Blender builder under `Assets/Blender/Scripts`, export a GLB with `Anchor_Hotspot`, `Anchor_Label` and `Anchor_Light`, add the manifest entry in `export_all.py`, add localized content in `careerLocations.ts`, then run:

```bash
npm run models:export
npm run models:preview
npm run models:validate
npm run typecheck
```
