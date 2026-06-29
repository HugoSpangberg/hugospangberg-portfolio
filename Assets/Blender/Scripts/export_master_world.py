from __future__ import annotations

import json
import shutil
import sys
from contextlib import contextmanager
from pathlib import Path

import bpy
from mathutils import Vector

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from common import EXPORTS, REPO_ROOT, REPORTS, RUNTIME_MODELS, SOURCES
from placement_contract import LANDMARK_REQUIRED_ANCHORS, PLACEMENT_ANCHOR, normalize_root_for_local_export

MASTER_BLEND = SOURCES / "career-world-master.blend"
MASTER_COMBINED_GLB = EXPORTS / "career-world-master.glb"

LANDMARK_ANCHORS = LANDMARK_REQUIRED_ANCHORS
ENVIRONMENT_REQUIRED_NODES = [
    "Anchor_Filmstaden",
    "Anchor_Visma",
    "Anchor_Sodra",
    "Anchor_Dasa",
    "Anchor_Education",
    "Anchor_CareerHub",
]

ASSETS = [
    {
        "id": "environment",
        "asset_id": "career-world-environment",
        "file": "career-world-environment.glb",
        "root": "ENV_CareerWorld_Root",
        "required": ENVIRONMENT_REQUIRED_NODES,
        "animations": [],
    },
    {
        "id": "filmstaden",
        "asset_id": "filmstaden",
        "file": "filmstaden.glb",
        "root": "LM_Filmstaden_Root",
        "required": LANDMARK_ANCHORS,
        "animations": [],
    },
    {
        "id": "visma",
        "asset_id": "visma",
        "file": "visma.glb",
        "root": "LM_Visma_Root",
        "required": LANDMARK_ANCHORS,
        "animations": [],
    },
    {
        "id": "sodra",
        "asset_id": "sodra",
        "file": "sodra.glb",
        "root": "LM_Sodra_Root",
        "required": LANDMARK_ANCHORS,
        "animations": [],
    },
    {
        "id": "dasa",
        "asset_id": "dasa-forestry",
        "file": "dasa-forestry.glb",
        "root": "LM_Dasa_Root",
        "required": LANDMARK_ANCHORS,
        "animations": ["Dasa_BoomIdle"],
    },
    {
        "id": "education",
        "asset_id": "education",
        "file": "education.glb",
        "root": "LM_Education_Root",
        "required": LANDMARK_ANCHORS,
        "animations": [],
    },
]


def descendants(root: bpy.types.Object) -> set[bpy.types.Object]:
    objects = {root}
    pending = list(root.children_recursive)
    for obj in pending:
        objects.add(obj)
    return objects


def require_root(name: str) -> bpy.types.Object:
    obj = bpy.data.objects.get(name)
    if obj is None:
        raise RuntimeError(f"Missing root {name} in {MASTER_BLEND}")
    return obj


def canonical_anchor_match(name: str, canonical: str) -> bool:
    return name == canonical or name.startswith(f"{canonical}.")


@contextmanager
def canonical_landmark_anchors(selected: set[bpy.types.Object], required: list[str]):
    original_names = {obj: obj.name for obj in bpy.data.objects}
    try:
        for obj in bpy.data.objects:
            if obj in selected:
                continue
            if any(canonical_anchor_match(obj.name, anchor) for anchor in required):
                obj.name = f"__MasterOther_{obj.name}_{obj.as_pointer()}"

        for anchor in required:
            candidates = [obj for obj in selected if canonical_anchor_match(obj.name, anchor)]
            if candidates:
                candidates[0].name = anchor
        yield
    finally:
        for obj, name in original_names.items():
            if obj.name != name:
                obj.name = name


def object_stats(objects: set[bpy.types.Object], required_nodes: list[str]) -> dict:
    depsgraph = bpy.context.evaluated_depsgraph_get()
    triangle_count = 0
    mesh_count = 0
    material_names: set[str] = set()
    bbox_min = Vector((999, 999, 999))
    bbox_max = Vector((-999, -999, -999))

    for obj in objects:
        if obj.type != "MESH":
            continue
        mesh_count += 1
        eval_obj = obj.evaluated_get(depsgraph)
        mesh = eval_obj.to_mesh()
        triangle_count += sum(max(len(poly.vertices) - 2, 1) for poly in mesh.polygons)
        material_names.update(slot.material.name for slot in obj.material_slots if slot.material)
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            bbox_min.x = min(bbox_min.x, world.x)
            bbox_min.y = min(bbox_min.y, world.y)
            bbox_min.z = min(bbox_min.z, world.z)
            bbox_max.x = max(bbox_max.x, world.x)
            bbox_max.y = max(bbox_max.y, world.y)
            bbox_max.z = max(bbox_max.z, world.z)
        eval_obj.to_mesh_clear()

    object_names = sorted(obj.name for obj in objects)
    missing = [name for name in required_nodes if name not in object_names]
    dimensions = bbox_max - bbox_min
    return {
        "triangleCount": triangle_count,
        "meshCount": mesh_count,
        "materialCount": len(material_names),
        "textureCount": len(bpy.data.images),
        "animations": sorted(
            {
                obj.animation_data.action.name
                for obj in objects
                if obj.animation_data is not None and obj.animation_data.action is not None
            }
        ),
        "requiredNodes": required_nodes,
        "missingNodes": missing,
        "boundingBox": {
            "min": [round(bbox_min.x, 4), round(bbox_min.y, 4), round(bbox_min.z, 4)],
            "max": [round(bbox_max.x, 4), round(bbox_max.y, 4), round(bbox_max.z, 4)],
        },
        "dimensions": [round(dimensions.x, 4), round(dimensions.y, 4), round(dimensions.z, 4)],
        "objects": object_names,
    }


def export_selected_asset(asset: dict) -> dict:
    root = require_root(asset["root"])
    selected = descendants(root)
    original_matrix = root.matrix_world.copy()
    export_normalization = None

    EXPORTS.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)
    RUNTIME_MODELS.mkdir(parents=True, exist_ok=True)

    with canonical_landmark_anchors(selected, asset["required"]):
        if asset["id"] != "environment":
            # Runtime attaches landmarks to environment anchors. Anchor_Placement must therefore export at local origin.
            export_normalization = normalize_root_for_local_export(root)
        bpy.context.view_layer.update()

        bpy.ops.object.select_all(action="DESELECT")
        for obj in selected:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = root

        glb_path = EXPORTS / asset["file"]
        bpy.ops.export_scene.gltf(
            filepath=str(glb_path),
            export_format="GLB",
            use_selection=True,
            export_apply=True,
            export_animations=True,
            export_cameras=False,
            export_lights=False,
        )
        shutil.copy2(glb_path, RUNTIME_MODELS / asset["file"])

        stats = object_stats(selected, asset["required"])
        if stats["missingNodes"]:
            raise RuntimeError(f"{asset['asset_id']} missing required nodes: {stats['missingNodes']}")
        if asset["id"] != "environment":
            anchor_export_position = export_normalization["exportAnchorPosition"] if export_normalization else None
            if anchor_export_position is None or any(abs(value) > 0.001 for value in anchor_export_position):
                raise RuntimeError(f"{asset['asset_id']} {PLACEMENT_ANCHOR} did not export at local origin: {anchor_export_position}")

        report = {
            "id": asset["asset_id"],
            "root": asset["root"],
            "blend": str(MASTER_BLEND.relative_to(REPO_ROOT)),
            "glb": str(glb_path.relative_to(REPO_ROOT)),
            "runtimeGlb": str((RUNTIME_MODELS / asset["file"]).relative_to(REPO_ROOT)),
            "file": asset["file"],
            "fileSize": glb_path.stat().st_size,
            "exportNormalization": export_normalization,
            **stats,
        }
        (REPORTS / f"{asset['asset_id']}.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    root.matrix_world = original_matrix
    bpy.context.view_layer.update()
    return report


def export_combined_review_glb() -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in bpy.context.scene.objects:
        if obj.type not in {"CAMERA", "LIGHT"} and not obj.get("exclude_from_export"):
            obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=str(MASTER_COMBINED_GLB),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_animations=True,
        export_cameras=False,
        export_lights=False,
    )


def write_manifest(reports: dict[str, dict]) -> None:
    manifest = {
        "version": 1,
        "generatedBy": "Assets/Blender/Scripts/export_master_world.py",
        "fallback": "procedural",
        "environment": {
            "file": "career-world-environment.glb",
            "requiredNodes": ENVIRONMENT_REQUIRED_NODES,
            "stats": reports["environment"],
        },
        "landmarks": [
            {
                "id": asset["id"],
                "file": asset["file"],
                "rootNode": asset["root"],
                "requiredNodes": asset["required"],
                "animations": asset["animations"],
                "stats": reports[asset["id"]],
            }
            for asset in ASSETS
            if asset["id"] != "environment"
        ],
    }

    (RUNTIME_MODELS / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (REPORTS / "model-report.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def main() -> None:
    if not MASTER_BLEND.exists():
        raise SystemExit("Missing master scene. Run npm run models:assemble first.")

    bpy.ops.wm.open_mainfile(filepath=str(MASTER_BLEND))
    reports = {asset["id"]: export_selected_asset(asset) for asset in ASSETS}
    export_combined_review_glb()
    write_manifest(reports)
    print("Exported runtime GLBs from editable master scene.")
    print(f"Exported combined review GLB: {MASTER_COMBINED_GLB}")


if __name__ == "__main__":
    main()
