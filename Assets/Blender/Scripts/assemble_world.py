from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from common import EXPORTS, PREVIEWS, SOURCES, cube, reset_scene

MASTER_BLEND = SOURCES / "career-world-master.blend"
MASTER_EXPORT = EXPORTS / "career-world-master.glb"

ENVIRONMENT = {
    "asset_id": "career-world-environment",
    "collection": "COL_CareerWorldEnvironment",
    "root": "ENV_CareerWorld_Root",
}

LANDMARKS = [
    {
        "id": "filmstaden",
        "collection": "COL_Filmstaden",
        "source": "filmstaden.blend",
        "root": "LM_Filmstaden_Root",
        "anchor": "Anchor_Filmstaden",
        "rotation_z": math.radians(0),
        "scale": 0.78,
    },
    {
        "id": "visma",
        "collection": "COL_Visma",
        "source": "visma.blend",
        "root": "LM_Visma_Root",
        "anchor": "Anchor_Visma",
        "rotation_z": math.radians(4),
        "scale": 0.78,
    },
    {
        "id": "sodra",
        "collection": "COL_Sodra",
        "source": "sodra.blend",
        "root": "LM_Sodra_Root",
        "anchor": "Anchor_Sodra",
        "rotation_z": math.radians(-5),
        "scale": 0.66,
    },
    {
        "id": "dasa",
        "collection": "COL_DasaForestry",
        "source": "dasa-forestry.blend",
        "root": "LM_Dasa_Root",
        "anchor": "Anchor_Dasa",
        "rotation_z": math.radians(10),
        "scale": 0.64,
    },
    {
        "id": "education",
        "collection": "COL_Education",
        "source": "education.blend",
        "root": "LM_Education_Root",
        "anchor": "Anchor_Education",
        "rotation_z": math.radians(-14),
        "scale": 0.76,
    },
]


def append_collection(source_file: str, collection_name: str) -> bpy.types.Collection:
    source_path = SOURCES / source_file
    if not source_path.exists():
        raise SystemExit(f"Missing source blend: {source_path}")

    directory = source_path / "Collection"
    filepath = directory / collection_name
    bpy.ops.wm.append(filepath=str(filepath), directory=str(directory), filename=collection_name)

    collection = bpy.data.collections.get(collection_name)
    if collection is None:
        raise RuntimeError(f"Could not append collection {collection_name} from {source_path}")
    return collection


def require_object(name: str) -> bpy.types.Object:
    obj = bpy.data.objects.get(name)
    if obj is None:
        raise RuntimeError(f"Missing object {name}")
    return obj


def look_at(obj: bpy.types.Object, target: Vector) -> None:
    direction = target - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


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
    return bbox_min, bbox_max


def add_camera(name: str, location: Vector, target: Vector, lens: float, clip_end: float = 140) -> bpy.types.Object:
    bpy.ops.object.camera_add(location=location)
    camera = bpy.context.object
    camera.name = name
    camera.data.name = f"{name}_Data"
    camera.data.lens = lens
    camera.data.clip_start = 0.05
    camera.data.clip_end = clip_end
    look_at(camera, target)
    return camera


def add_master_cameras() -> None:
    bbox_min, bbox_max = mesh_bounds()
    center = (bbox_min + bbox_max) * 0.5
    dimensions = bbox_max - bbox_min
    span = max(dimensions.x, dimensions.y, dimensions.z, 5.0)
    target = Vector((center.x, center.y, center.z + 0.35))

    hero = add_camera("Camera_Master_Hero", center + Vector((span * 0.66, -span * 0.94, span * 0.58)), target, 37)
    bpy.context.scene.camera = hero

    add_camera("Camera_Master_Mobile", center + Vector((span * 0.40, -span * 1.02, span * 0.78)), target, 31)
    add_camera("Camera_Master_Left", center + Vector((-span * 0.84, -span * 0.74, span * 0.60)), target, 36)
    add_camera("Camera_Master_Right", center + Vector((span * 0.90, -span * 0.70, span * 0.60)), target, 36)

    focus_offsets = {
        "Sodra": Vector((3.4, -3.7, 2.45)),
        "Visma": Vector((3.0, -3.0, 2.15)),
        "Filmstaden": Vector((2.8, -3.0, 2.05)),
        "Dasa": Vector((-3.0, -2.8, 2.0)),
        "Education": Vector((-2.9, -2.8, 2.05)),
    }
    anchors = {
        "Sodra": "Anchor_Sodra",
        "Visma": "Anchor_Visma",
        "Filmstaden": "Anchor_Filmstaden",
        "Dasa": "Anchor_Dasa",
        "Education": "Anchor_Education",
    }
    for label, anchor_name in anchors.items():
        anchor = require_object(anchor_name)
        anchor_position = anchor.matrix_world.translation
        focus_target = Vector((anchor_position.x, anchor_position.y, anchor_position.z + 0.65))
        add_camera(f"Camera_Focus_{label}", focus_target + focus_offsets[label], focus_target, 38, 80)


def add_scale_guides() -> None:
    guide_collection = bpy.data.collections.new("COL_Master_ScaleGuides")
    bpy.context.scene.collection.children.link(guide_collection)
    bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[guide_collection.name]

    guides = [
        cube("GUIDE_Human_Height_1u", (-5.05, 3.02, 0.5), (0.035, 0.035, 0.5), bpy.data.materials.get("MAT_Cyan_Accent"), 0.002),
        cube("GUIDE_Door_1_2u", (-4.88, 3.02, 0.6), (0.07, 0.035, 0.6), bpy.data.materials.get("MAT_Concrete_White"), 0.002),
        cube("GUIDE_Floor_1_9u", (-4.68, 3.02, 0.95), (0.08, 0.035, 0.95), bpy.data.materials.get("MAT_Stone"), 0.002),
        cube("GUIDE_Tree_4u", (-4.44, 3.02, 2.0), (0.045, 0.045, 2.0), bpy.data.materials.get("MAT_Moss"), 0.002),
        cube("GUIDE_Vehicle_2_5u", (-4.12, 3.02, 1.25), (0.22, 0.06, 1.25), bpy.data.materials.get("MAT_Machine_Green"), 0.003),
    ]
    for guide in guides:
        guide["exclude_from_export"] = True
        guide.hide_render = True
        guide.hide_viewport = True
    guide_collection.hide_render = True
    guide_collection.hide_viewport = True


def add_master_lighting() -> None:
    bpy.ops.object.light_add(type="AREA", location=(0.0, -4.4, 5.2))
    key = bpy.context.object
    key.name = "Light_Master_SoftKey"
    key.data.energy = 650
    key.data.size = 5.8

    bpy.ops.object.light_add(type="POINT", location=(-3.8, 1.8, 2.6))
    rim = bpy.context.object
    rim.name = "Light_Master_CyanRim"
    rim.data.energy = 80
    rim.data.color = (0.42, 0.9, 1.0)

    bpy.context.scene.world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world.color = (0.015, 0.028, 0.024)


def add_workflow_notes() -> None:
    text = bpy.data.texts.new("README_Master_Workflow")
    text.write(
        "\n".join(
            [
                "Career world master scene",
                "=========================",
                "",
                "This file is generated by Assets/Blender/Scripts/assemble_world.py.",
                "It appends the existing source .blend files and places each landmark on",
                "the environment anchors used by the Three.js runtime.",
                "",
                "Recommended workflow:",
                "1. Run: npm run models:assemble",
                "2. Open: Assets/Blender/Sources/career-world-master.blend",
                "3. Edit geometry/materials in this master scene.",
                "4. Move environment anchors to adjust runtime placement.",
                "5. Keep each landmark under its LM_*_Root object.",
                "6. Run: npm run models:export-master",
                "7. Run: npm run models:preview-master",
                "8. Run: npm run models:validate",
                "",
                "Important runtime convention:",
                "- Environment anchors define placement in the web scene.",
                "- Landmark roots are exported back to local origin by export_master_world.py.",
                "- Do not delete Anchor_Hotspot, Anchor_Label, Anchor_Light, or Anchor_CameraFocus.",
            ]
        )
    )


def export_combined_master() -> None:
    EXPORTS.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in bpy.context.scene.objects:
        if obj.type not in {"CAMERA", "LIGHT"}:
            obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=str(MASTER_EXPORT),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_animations=True,
        export_cameras=False,
        export_lights=False,
    )


def main() -> None:
    SOURCES.mkdir(parents=True, exist_ok=True)
    PREVIEWS.mkdir(parents=True, exist_ok=True)
    reset_scene()

    append_collection("career-world-environment.blend", ENVIRONMENT["collection"])
    environment_root = require_object(ENVIRONMENT["root"])
    environment_root.name = ENVIRONMENT["root"]

    for landmark in LANDMARKS:
        anchor = require_object(landmark["anchor"])
        append_collection(landmark["source"], landmark["collection"])
        root = require_object(landmark["root"])
        root.location = anchor.matrix_world.translation
        root.rotation_euler.z = landmark["rotation_z"]
        root.scale = (landmark["scale"], landmark["scale"], landmark["scale"])
        root["master_anchor"] = landmark["anchor"]
        root["runtime_export_root_at_origin"] = True

    add_master_cameras()
    add_master_lighting()
    add_scale_guides()
    add_workflow_notes()

    bpy.context.scene.render.engine = "BLENDER_EEVEE_NEXT"
    bpy.context.scene.eevee.taa_render_samples = 32
    bpy.context.scene.view_settings.view_transform = "Filmic"
    bpy.context.scene.view_settings.look = "Medium High Contrast"
    bpy.ops.wm.save_as_mainfile(filepath=str(MASTER_BLEND))
    export_combined_master()
    print(f"Saved editable master scene: {MASTER_BLEND}")
    print(f"Exported combined review GLB: {MASTER_EXPORT}")


if __name__ == "__main__":
    main()
