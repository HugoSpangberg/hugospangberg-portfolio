from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

import bpy
from mathutils import Vector

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from blender_common import PREVIEWS, REPORTS, REPO_ROOT, SOURCES

SOURCE_BLEND = SOURCES / "ai-core.blend"
EXPORT_DIR = REPO_ROOT / "Assets" / "Blender" / "Exports" / "ai-core"
RUNTIME_DIR = REPO_ROOT / "HSClient" / "public" / "models" / "ai-core"
PUBLIC_IMAGE_DIR = REPO_ROOT / "HSClient" / "public" / "images" / "ai-core"
GLB_NAME = "ai-core.glb"


def visible_export_objects() -> list[bpy.types.Object]:
    return [
        obj
        for obj in bpy.context.scene.objects
        if obj.type not in {"CAMERA", "LIGHT"} and not obj.hide_get() and not obj.hide_render
    ]


def mesh_bounds(objects: list[bpy.types.Object]) -> tuple[Vector, Vector]:
    depsgraph = bpy.context.evaluated_depsgraph_get()
    bbox_min = Vector((999, 999, 999))
    bbox_max = Vector((-999, -999, -999))

    for obj in objects:
        if obj.type != "MESH":
            continue
        eval_obj = obj.evaluated_get(depsgraph)
        eval_obj.to_mesh()
        for corner in eval_obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            bbox_min.x = min(bbox_min.x, world.x)
            bbox_min.y = min(bbox_min.y, world.y)
            bbox_min.z = min(bbox_min.z, world.z)
            bbox_max.x = max(bbox_max.x, world.x)
            bbox_max.y = max(bbox_max.y, world.y)
            bbox_max.z = max(bbox_max.z, world.z)
        eval_obj.to_mesh_clear()

    if bbox_min.x == 999:
        return Vector((0, 0, 0)), Vector((0, 0, 0))

    return bbox_min, bbox_max


def object_stats(objects: list[bpy.types.Object]) -> dict:
    depsgraph = bpy.context.evaluated_depsgraph_get()
    triangle_count = 0
    mesh_count = 0
    curve_count = 0
    font_count = 0
    material_names: set[str] = set()

    for obj in objects:
        if obj.type == "CURVE":
            curve_count += 1
        if obj.type == "FONT":
            font_count += 1
        if obj.type != "MESH":
            continue

        mesh_count += 1
        eval_obj = obj.evaluated_get(depsgraph)
        mesh = eval_obj.to_mesh()
        triangle_count += sum(max(len(poly.vertices) - 2, 1) for poly in mesh.polygons)
        material_names.update(slot.material.name for slot in obj.material_slots if slot.material)
        eval_obj.to_mesh_clear()

    bbox_min, bbox_max = mesh_bounds(objects)
    dimensions = bbox_max - bbox_min

    return {
        "sourceBlend": str(SOURCE_BLEND.relative_to(REPO_ROOT)),
        "objects": sorted(obj.name for obj in objects),
        "meshCount": mesh_count,
        "curveCount": curve_count,
        "fontCount": font_count,
        "materialCount": len(material_names),
        "imageDependencies": [
            {"name": image.name, "filepath": image.filepath}
            for image in bpy.data.images
            if image.filepath
        ],
        "animations": sorted(action.name for action in bpy.data.actions),
        "triangleCount": triangle_count,
        "boundingBox": {
            "min": [round(value, 4) for value in bbox_min],
            "max": [round(value, 4) for value in bbox_max],
        },
        "dimensions": [round(value, 4) for value in dimensions],
    }


def export_runtime_glb(objects: list[bpy.types.Object]) -> Path:
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)

    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)

    glb_path = EXPORT_DIR / GLB_NAME
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_animations=True,
        export_cameras=False,
        export_lights=False,
    )
    shutil.copy2(glb_path, RUNTIME_DIR / GLB_NAME)
    return glb_path


def configure_render(width: int, height: int, output: Path) -> None:
    bpy.context.scene.render.engine = "BLENDER_EEVEE_NEXT"
    bpy.context.scene.eevee.taa_render_samples = 64
    if hasattr(bpy.context.scene.eevee, "use_gtao"):
        bpy.context.scene.eevee.use_gtao = True
    if hasattr(bpy.context.scene.eevee, "gtao_distance"):
        bpy.context.scene.eevee.gtao_distance = 3
    if hasattr(bpy.context.scene.eevee, "gtao_factor"):
        bpy.context.scene.eevee.gtao_factor = 1.2
    bpy.context.scene.view_settings.view_transform = "Filmic"
    bpy.context.scene.view_settings.look = "Medium High Contrast"
    bpy.context.scene.world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world.color = (0.018, 0.035, 0.03)
    bpy.context.scene.render.resolution_x = width
    bpy.context.scene.render.resolution_y = height
    bpy.context.scene.render.filepath = str(output)


def point_camera(camera: bpy.types.Object, target: Vector) -> None:
    direction = target - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def render_preview(name: str, width: int, height: int, camera_location: tuple[float, float, float]) -> Path:
    PREVIEWS.mkdir(parents=True, exist_ok=True)
    camera = bpy.data.objects.get("AI_ECOSYSTEM_CAMERA")
    if camera is None:
        bpy.ops.object.camera_add()
        camera = bpy.context.object
        camera.name = "AI_ECOSYSTEM_CAMERA"

    objects = visible_export_objects()
    bbox_min, bbox_max = mesh_bounds(objects)
    target = (bbox_min + bbox_max) * 0.5
    target.z += 0.35
    camera.location = camera_location
    point_camera(camera, target)
    camera.data.lens = 34
    camera.data.dof.use_dof = True
    camera.data.dof.focus_distance = (camera.location - target).length
    camera.data.dof.aperture_fstop = 5.6
    bpy.context.scene.camera = camera

    output = PREVIEWS / name
    configure_render(width, height, output)
    bpy.ops.render.render(write_still=True)
    return output


def main() -> None:
    if not SOURCE_BLEND.exists():
        raise SystemExit(f"Missing source blend: {SOURCE_BLEND}")

    bpy.ops.wm.open_mainfile(filepath=str(SOURCE_BLEND))
    objects = visible_export_objects()
    glb_path = export_runtime_glb(objects)
    stats = object_stats(objects)
    stats["glb"] = str(glb_path.relative_to(REPO_ROOT))
    stats["runtimeGlb"] = str((RUNTIME_DIR / GLB_NAME).relative_to(REPO_ROOT))
    stats["fileSize"] = glb_path.stat().st_size

    desktop = render_preview("ai-core-desktop.png", 1440, 980, (0.0, -11.4, 7.15))
    mobile = render_preview("ai-core-mobile.png", 900, 1280, (0.25, -13.0, 7.8))
    PUBLIC_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(desktop, PUBLIC_IMAGE_DIR / "ai-core-poster.png")

    stats["previews"] = [
        str(desktop.relative_to(REPO_ROOT)),
        str(mobile.relative_to(REPO_ROOT)),
        str((PUBLIC_IMAGE_DIR / "ai-core-poster.png").relative_to(REPO_ROOT)),
    ]

    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / "ai-core.json").write_text(json.dumps(stats, indent=2), encoding="utf-8")
    print(f"Exported {RUNTIME_DIR / GLB_NAME}")
    print(f"Rendered {desktop}")
    print(f"Rendered {mobile}")


if __name__ == "__main__":
    main()
