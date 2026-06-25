from __future__ import annotations

import json
import math
import shutil
from pathlib import Path

import bpy
from mathutils import Vector

ASSETS_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = ASSETS_ROOT.parent
BLENDER_ROOT = ASSETS_ROOT / "Blender"
SOURCES = BLENDER_ROOT / "Sources"
EXPORTS = BLENDER_ROOT / "Exports"
PREVIEWS = BLENDER_ROOT / "Previews"
REPORTS = BLENDER_ROOT / "Reports"
RUNTIME_MODELS = REPO_ROOT / "HSClient" / "public" / "models" / "career-world"


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for collection in list(bpy.data.collections):
        if not collection.objects and not collection.children:
            bpy.data.collections.remove(collection)
    for material in list(bpy.data.materials):
        if material.users == 0:
            bpy.data.materials.remove(material)
    for action in list(bpy.data.actions):
        bpy.data.actions.remove(action)


def material(
    name: str,
    color: tuple[float, float, float, float],
    roughness: float = 0.72,
    metallic: float = 0.04,
    emission: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        bsdf.inputs["Emission Color"].default_value = emission
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def collection(name: str) -> bpy.types.Collection:
    coll = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(coll)
    bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[coll.name]
    return coll


def _finish_mesh(obj: bpy.types.Object, mat, bevel_width: float = 0.025, bevel_segments: int = 2) -> bpy.types.Object:
    if mat:
        obj.data.materials.append(mat)
    if bevel_width > 0:
        bevel = obj.modifiers.new(f"{obj.name}_Bevel", "BEVEL")
        bevel.width = bevel_width
        bevel.segments = bevel_segments
    obj.modifiers.new(f"{obj.name}_WeightedNormals", "WEIGHTED_NORMAL")
    return obj


def cube(
    name: str,
    location: tuple[float, float, float],
    scale: tuple[float, float, float],
    mat,
    bevel_width: float = 0.025,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    return _finish_mesh(obj, mat, bevel_width)


def cylinder(
    name: str,
    location: tuple[float, float, float],
    radius: float,
    depth: float,
    mat,
    vertices: int = 24,
    rotation: tuple[float, float, float] = (0, 0, 0),
    bevel_width: float = 0.01,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    return _finish_mesh(obj, mat, bevel_width)


def cone(
    name: str,
    location: tuple[float, float, float],
    radius1: float,
    radius2: float,
    depth: float,
    mat,
    vertices: int = 7,
    rotation: tuple[float, float, float] = (0, 0, 0),
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius1, radius2=radius2, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    return _finish_mesh(obj, mat, 0.008)


def sphere(name: str, location: tuple[float, float, float], radius: float, mat, segments: int = 16) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=max(8, segments // 2), radius=radius, location=location)
    obj = bpy.context.object
    obj.name = name
    return _finish_mesh(obj, mat, 0)


def add_anchor(name: str, location: tuple[float, float, float]) -> bpy.types.Object:
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = "PLAIN_AXES"
    empty.location = location
    bpy.context.collection.objects.link(empty)
    return empty


def curved_wall(
    name: str,
    radius: float,
    angle_start: float,
    angle_end: float,
    height: float,
    thickness: float,
    mat,
    segments: int = 18,
    z: float = 0.0,
) -> bpy.types.Object:
    verts = []
    faces = []
    for index in range(segments + 1):
        t = angle_start + (angle_end - angle_start) * (index / segments)
        for r in (radius, radius - thickness):
            verts.append((math.sin(t) * r, -math.cos(t) * r, z))
            verts.append((math.sin(t) * r, -math.cos(t) * r, z + height))
    for index in range(segments):
        base = index * 4
        nxt = base + 4
        faces.append((base, nxt, nxt + 1, base + 1))
        faces.append((base + 2, base + 3, nxt + 3, nxt + 2))
        faces.append((base + 1, nxt + 1, nxt + 3, base + 3))
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return _finish_mesh(obj, mat, 0.025)


def apply_transforms() -> None:
    for obj in bpy.context.scene.objects:
        if obj.type == "MESH":
            bpy.ops.object.select_all(action="DESELECT")
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)


def scene_stats(required_nodes: list[str]) -> dict:
    depsgraph = bpy.context.evaluated_depsgraph_get()
    triangle_count = 0
    mesh_count = 0
    material_names = set()
    bbox_min = Vector((999, 999, 999))
    bbox_max = Vector((-999, -999, -999))

    for obj in bpy.context.scene.objects:
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

    nodes = {obj.name for obj in bpy.context.scene.objects}
    missing_nodes = [name for name in required_nodes if name not in nodes]
    dimensions = bbox_max - bbox_min
    return {
        "triangleCount": triangle_count,
        "meshCount": mesh_count,
        "materialCount": len(material_names),
        "textureCount": len(bpy.data.images),
        "animations": [action.name for action in bpy.data.actions],
        "requiredNodes": required_nodes,
        "missingNodes": missing_nodes,
        "boundingBox": {
            "min": [round(bbox_min.x, 4), round(bbox_min.y, 4), round(bbox_min.z, 4)],
            "max": [round(bbox_max.x, 4), round(bbox_max.y, 4), round(bbox_max.z, 4)],
        },
        "dimensions": [round(dimensions.x, 4), round(dimensions.y, 4), round(dimensions.z, 4)],
    }


def save_and_export(asset_id: str, root_name: str, required_nodes: list[str]) -> dict:
    SOURCES.mkdir(parents=True, exist_ok=True)
    EXPORTS.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)
    RUNTIME_MODELS.mkdir(parents=True, exist_ok=True)

    blend_path = SOURCES / f"{asset_id}.blend"
    glb_path = EXPORTS / f"{asset_id}.glb"
    apply_transforms()
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format="GLB",
        export_apply=True,
        export_animations=True,
        export_cameras=False,
        export_lights=False,
    )
    shutil.copy2(glb_path, RUNTIME_MODELS / glb_path.name)

    stats = scene_stats(required_nodes)
    report = {
        "id": asset_id,
        "root": root_name,
        "blend": str(blend_path.relative_to(REPO_ROOT)),
        "glb": str(glb_path.relative_to(REPO_ROOT)),
        "runtimeGlb": str((RUNTIME_MODELS / glb_path.name).relative_to(REPO_ROOT)),
        "file": glb_path.name,
        "fileSize": glb_path.stat().st_size,
        "objects": [obj.name for obj in bpy.context.scene.objects],
        **stats,
    }
    (REPORTS / f"{asset_id}.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    if stats["missingNodes"]:
        raise RuntimeError(f"{asset_id} missing required nodes: {stats['missingNodes']}")
    return report
