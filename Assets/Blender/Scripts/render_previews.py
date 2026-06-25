from __future__ import annotations

import bpy
import shutil
import sys
from pathlib import Path
from mathutils import Vector

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from common import EXPORTS, PREVIEWS, reset_scene


def frame_camera(mobile: bool = False) -> None:
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

    center = (bbox_min + bbox_max) * 0.5
    radius = max((bbox_max - bbox_min).length * (1.02 if mobile else 0.86), 2.6)
    camera_location = center + Vector((radius * 0.65, -radius * 1.08, radius * (0.72 if mobile else 0.62)))
    bpy.ops.object.camera_add(location=camera_location)
    camera = bpy.context.object
    direction = center - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    camera.data.lens = 38 if mobile else 42
    bpy.context.scene.camera = camera

PREVIEWS.mkdir(parents=True, exist_ok=True)
(PREVIEWS / "After").mkdir(parents=True, exist_ok=True)

ASSETS = [
    ("career-world-environment", "career-world-desktop.png"),
    ("career-world-environment", "career-world-mobile.png"),
    ("filmstaden", "filmstaden.png"),
    ("visma", "visma.png"),
    ("sodra", "sodra.png"),
    ("dasa-forestry", "dasa-forestry.png"),
    ("education", "education.png"),
]

for asset_id, preview_name in ASSETS:
    glb = EXPORTS / f"{asset_id}.glb"
    if not glb.exists():
        raise SystemExit(f"Missing {glb}. Run export_all.py before render_previews.py.")

    reset_scene()
    bpy.ops.import_scene.gltf(filepath=str(glb))
    bpy.ops.object.light_add(type="AREA", location=(0, -4, 5))
    bpy.context.object.name = "Preview_AreaLight"
    bpy.context.object.data.energy = 500
    bpy.context.object.data.size = 5
    frame_camera(mobile=preview_name == "career-world-mobile.png")
    bpy.context.scene.render.engine = "BLENDER_EEVEE_NEXT"
    bpy.context.scene.render.resolution_x = 1280
    bpy.context.scene.render.resolution_y = 900
    bpy.context.scene.eevee.taa_render_samples = 32
    bpy.context.scene.view_settings.view_transform = "Filmic"
    bpy.context.scene.view_settings.look = "Medium High Contrast"
    bpy.context.scene.render.filepath = str(PREVIEWS / preview_name)
    bpy.ops.render.render(write_still=True)
    shutil.copy2(PREVIEWS / preview_name, PREVIEWS / "After" / preview_name)
    print(f"Rendered preview {Path(preview_name).name}")
