from __future__ import annotations

import json
import sys
from pathlib import Path

import bpy
from mathutils import Vector

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from blender_common import RUNTIME_MODELS, SOURCES, add_anchor, collection, parent, save_and_export


LANDMARKS = [
    {
        "id": "filmstaden",
        "source": "filmstaden-update.blend",
        "collection": "COL_Filmstaden",
        "root": "LM_Filmstaden_Root",
        "canonical": "filmstaden",
    },
    {
        "id": "visma",
        "source": "visma-update.blend",
        "collection": "COL_Visma",
        "root": "LM_Visma_Root",
        "canonical": "visma",
    },
    {
        "id": "sodra",
        "source": "sodra-update.blend",
        "collection": "COL_Sodra",
        "root": "LM_Sodra_Root",
        "canonical": "sodra",
    },
    {
        "id": "dasa",
        "source": "dasa-forestry-Update.blend",
        "collection": "COL_Dasa",
        "root": "LM_Dasa_Root",
        "canonical": "dasa-forestry",
    },
    {
        "id": "education",
        "source": "education-update.blend",
        "collection": "COL_Education",
        "root": "LM_Education_Root",
        "canonical": "education",
    },
]

LANDMARK_REQUIRED_NODES = ["Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"]


def mesh_bounds() -> tuple[Vector, Vector]:
    bbox_min = Vector((999, 999, 999))
    bbox_max = Vector((-999, -999, -999))

    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            bbox_min.x = min(bbox_min.x, world.x)
            bbox_min.y = min(bbox_min.y, world.y)
            bbox_min.z = min(bbox_min.z, world.z)
            bbox_max.x = max(bbox_max.x, world.x)
            bbox_max.y = max(bbox_max.y, world.y)
            bbox_max.z = max(bbox_max.z, world.z)

    if bbox_min.x == 999:
        return Vector((0, 0, 0)), Vector((0, 0, 0))

    return bbox_min, bbox_max


def ensure_collection(name: str) -> bpy.types.Collection:
    existing = bpy.data.collections.get(name)
    if existing:
        return existing
    return collection(name)


def link_to_collection(obj: bpy.types.Object, target: bpy.types.Collection) -> None:
    if obj.name not in target.objects:
        target.objects.link(obj)


def remove_existing_anchor(name: str) -> None:
    obj = bpy.data.objects.get(name)
    if obj is not None:
        bpy.data.objects.remove(obj, do_unlink=True)


def prepare_landmark(landmark: dict[str, str]) -> dict:
    source_path = SOURCES / landmark["source"]
    if not source_path.exists():
        raise SystemExit(f"Missing updated Blender source: {source_path}")

    bpy.ops.wm.open_mainfile(filepath=str(source_path))
    target_collection = ensure_collection(landmark["collection"])

    root = bpy.data.objects.get(landmark["root"])
    if root is None:
        root = bpy.data.objects.new(landmark["root"], None)
        root.empty_display_type = "CUBE"
        root.location = (0, 0, 0)
        bpy.context.collection.objects.link(root)
    link_to_collection(root, target_collection)

    for obj in list(bpy.context.scene.objects):
        if obj == root:
            continue
        if obj.name.startswith("Anchor_"):
            bpy.data.objects.remove(obj, do_unlink=True)
            continue
        link_to_collection(obj, target_collection)
        if obj.parent is None:
            parent(obj, root)

    bbox_min, bbox_max = mesh_bounds()
    center = (bbox_min + bbox_max) * 0.5
    dimensions = bbox_max - bbox_min
    front_y = bbox_min.y - max(dimensions.y * 0.08, 0.08)
    top_z = bbox_max.z
    mid_z = bbox_min.z + dimensions.z * 0.58

    for anchor in LANDMARK_REQUIRED_NODES:
        remove_existing_anchor(anchor)

    add_anchor("Anchor_Hotspot", (center.x, front_y, mid_z), root)
    add_anchor("Anchor_Label", (center.x, front_y, top_z + max(dimensions.z * 0.22, 0.22)), root)
    add_anchor("Anchor_Light", (center.x, front_y, bbox_min.z + dimensions.z * 0.72), root)
    add_anchor("Anchor_CameraFocus", (center.x, center.y, bbox_min.z + dimensions.z * 0.54), root)

    return save_and_export(
        landmark["canonical"],
        landmark["root"],
        [landmark["root"], *LANDMARK_REQUIRED_NODES],
    )


def update_manifest(reports: dict[str, dict]) -> None:
    manifest_path = RUNTIME_MODELS / "manifest.json"
    if not manifest_path.exists():
        raise SystemExit("Missing manifest.json. Export the base career world before updated landmarks.")

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest["generatedBy"] = "Assets/Blender/Scripts/export_updated_landmarks.py"

    for landmark in manifest.get("landmarks", []):
        report = reports.get(landmark.get("id"))
        if report is None:
            continue
        landmark["file"] = report["file"]
        landmark["stats"] = report
        landmark["requiredNodes"] = LANDMARK_REQUIRED_NODES

    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def main() -> None:
    reports = {landmark["id"]: prepare_landmark(landmark) for landmark in LANDMARKS}
    update_manifest(reports)
    print("Exported updated manual landmark blends:")
    for landmark_id, report in reports.items():
        print(
            f"- {landmark_id}: {report['file']} "
            f"({report['fileSize']} bytes, {report['triangleCount']} tris)"
        )


if __name__ == "__main__":
    main()
