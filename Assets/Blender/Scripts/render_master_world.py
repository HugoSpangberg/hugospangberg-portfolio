from __future__ import annotations

import sys
from pathlib import Path

import bpy
from mathutils import Vector

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from common import PREVIEWS, SOURCES
from placement_contract import PLACEMENT_ANCHOR, require_child_anchor

MASTER_BLEND = SOURCES / "career-world-master.blend"


def set_render_defaults(width: int, height: int, filepath: Path, validation: bool) -> None:
    bpy.context.scene.render.engine = "BLENDER_EEVEE_NEXT"
    bpy.context.scene.eevee.taa_render_samples = 64
    if hasattr(bpy.context.scene.eevee, "use_gtao"):
        bpy.context.scene.eevee.use_gtao = True
    if hasattr(bpy.context.scene.eevee, "gtao_distance"):
        bpy.context.scene.eevee.gtao_distance = 3
    if hasattr(bpy.context.scene.eevee, "gtao_factor"):
        bpy.context.scene.eevee.gtao_factor = 1.15
    bpy.context.scene.render.resolution_x = width
    bpy.context.scene.render.resolution_y = height
    bpy.context.scene.render.filepath = str(filepath)
    bpy.context.scene.view_settings.view_transform = "Filmic"
    bpy.context.scene.view_settings.look = "Medium High Contrast"
    bpy.context.scene.world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world.color = (0.12, 0.13, 0.13) if validation else (0.015, 0.028, 0.024)


def render(camera_name: str, output_name: str, width: int, height: int, validation: bool) -> None:
    camera = bpy.data.objects.get(camera_name)
    if camera is None:
        raise RuntimeError(f"Missing preview camera {camera_name}. Run npm run models:assemble first.")
    bpy.context.scene.camera = camera
    set_render_defaults(width, height, PREVIEWS / output_name, validation)
    bpy.ops.render.render(write_still=True)
    print(f"Rendered master preview {output_name}")


def debug_material(name: str, color: tuple[float, float, float, float]) -> bpy.types.Material:
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.diffuse_color = color
    return material


def add_marker(name: str, location: Vector, material: bpy.types.Material, radius: float = 0.07) -> list[bpy.types.Object]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=radius * 0.32, depth=1.75, location=(location.x, location.y, location.z + 0.875))
    stem = bpy.context.object
    stem.name = f"{name}_Pin"
    stem.data.name = f"{name}_Pin_Mesh"
    stem.data.materials.append(material)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=radius, location=(location.x, location.y, location.z + 1.82))
    marker = bpy.context.object
    marker.name = name
    marker.data.name = f"{name}_Mesh"
    marker.data.materials.append(material)

    for obj in (stem, marker):
        obj["debug_marker"] = True
        obj["exclude_from_export"] = True

    return [stem, marker]


def add_debug_markers() -> bpy.types.Collection:
    collection = bpy.data.collections.new("COL_Debug_PlacementMarkers")
    bpy.context.scene.collection.children.link(collection)
    zone_material = debug_material("MAT_Debug_ZoneCenter", (0.0, 0.95, 1.0, 1.0))
    placement_material = debug_material("MAT_Debug_PlacementAnchor", (1.0, 0.56, 0.12, 1.0))

    for root in bpy.context.scene.objects:
        if not root.name.startswith("LM_") or not root.get("master_anchor"):
            continue
        zone = bpy.data.objects.get(root["master_anchor"])
        placement = require_child_anchor(root, PLACEMENT_ANCHOR)
        if zone is None:
            raise RuntimeError(f"{root.name} references missing zone anchor {root['master_anchor']}")

        markers = [
            *add_marker(f"DEBUG_ZoneCenter_{root.name}", zone.matrix_world.translation, zone_material, 0.08),
            *add_marker(f"DEBUG_Placement_{root.name}", placement.matrix_world.translation, placement_material, 0.055),
        ]
        for marker in markers:
            for existing in list(marker.users_collection):
                existing.objects.unlink(marker)
            collection.objects.link(marker)

    return collection


def remove_debug_markers(collection: bpy.types.Collection) -> None:
    for obj in list(collection.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.data.collections.remove(collection)


def main() -> None:
    if not MASTER_BLEND.exists():
        raise SystemExit("Missing master scene. Run npm run models:assemble first.")

    PREVIEWS.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.open_mainfile(filepath=str(MASTER_BLEND))
    debug_collection = add_debug_markers()
    render("Camera_Master_PlacementTop", "career-world-master-placement-top-debug.png", 1440, 1440, True)
    render("Camera_Master_PlacementFront", "career-world-master-placement-front-debug.png", 1440, 980, True)
    remove_debug_markers(debug_collection)
    render("Camera_Master_Hero", "career-world-master-validation.png", 1440, 980, True)
    render("Camera_Master_Hero", "career-world-master-hero.png", 1440, 980, False)
    render("Camera_Master_Mobile", "career-world-master-mobile.png", 900, 1280, False)
    render("Camera_Master_Hero", "career-world-master-desktop-final.png", 1440, 980, False)
    render("Camera_Master_Mobile", "career-world-master-mobile-final.png", 900, 1280, False)
    render("Camera_Master_Left", "career-world-master-left-final.png", 1440, 980, False)
    render("Camera_Master_Right", "career-world-master-right-final.png", 1440, 980, False)
    render("Camera_Focus_Sodra", "sodra-in-world-final.png", 1280, 900, False)
    render("Camera_Focus_Visma", "visma-in-world-final.png", 1280, 900, False)
    render("Camera_Focus_Filmstaden", "filmstaden-in-world-final.png", 1280, 900, False)
    render("Camera_Focus_Dasa", "dasa-in-world-final.png", 1280, 900, False)
    render("Camera_Focus_Education", "education-in-world-final.png", 1280, 900, False)


if __name__ == "__main__":
    main()
