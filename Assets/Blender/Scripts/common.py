from __future__ import annotations

import json
from pathlib import Path

import bpy

ROOT = Path(__file__).resolve().parents[2]
SOURCES = ROOT / "Blender" / "Sources"
EXPORTS = ROOT / "Blender" / "Exports"
REPORTS = ROOT / "Blender" / "Reports"


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def material(name: str, color: tuple[float, float, float, float], roughness: float = 0.72):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def cube(name: str, location: tuple[float, float, float], scale: tuple[float, float, float], mat) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    bevel = obj.modifiers.new(f"{name}_Bevel", "BEVEL")
    bevel.width = 0.035
    bevel.segments = 2
    obj.modifiers.new(f"{name}_WeightedNormals", "WEIGHTED_NORMAL")
    return obj


def add_anchor(name: str, location: tuple[float, float, float]) -> bpy.types.Object:
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = "PLAIN_AXES"
    empty.location = location
    bpy.context.collection.objects.link(empty)
    return empty


def save_and_export(asset_id: str, root_name: str) -> None:
    SOURCES.mkdir(parents=True, exist_ok=True)
    EXPORTS.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)

    blend_path = SOURCES / f"{asset_id}.blend"
    glb_path = EXPORTS / f"{asset_id}.glb"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format="GLB", export_apply=True)

    triangle_count = sum(
        len(poly.vertices) - 2
        for obj in bpy.context.scene.objects
        if obj.type == "MESH"
        for poly in obj.data.polygons
    )
    report = {
        "id": asset_id,
        "root": root_name,
        "glb": str(glb_path.relative_to(ROOT)),
        "triangleCount": triangle_count,
        "objects": [obj.name for obj in bpy.context.scene.objects],
    }
    (REPORTS / f"{asset_id}.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
