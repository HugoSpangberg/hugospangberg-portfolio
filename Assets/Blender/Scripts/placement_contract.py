from __future__ import annotations

import re
from typing import Iterable

import bpy
from mathutils import Vector

from blender_common import add_anchor, parent

PLACEMENT_ANCHOR = "Anchor_Placement"
LANDMARK_REQUIRED_ANCHORS = [
    "Anchor_Placement",
    "Anchor_Hotspot",
    "Anchor_Label",
    "Anchor_Light",
    "Anchor_CameraFocus",
]

COMMON_FOOTPRINT_EXCLUDES = [
    "anchor",
    "beacon",
    "canopy",
    "cornice",
    "crown",
    "downlight",
    "foliage",
    "glass",
    "handle",
    "light",
    "log",
    "marquee",
    "poster",
    "rock",
    "roof",
    "sensor",
    "sign",
    "sill",
    "tree",
    "trunk",
    "window",
]


def base_name(name: str) -> str:
    return re.sub(r"\.\d{3}$", "", name).lower()


def descendants(root: bpy.types.Object) -> set[bpy.types.Object]:
    return {root, *root.children_recursive}


def find_child_anchor(root: bpy.types.Object, anchor_name: str) -> bpy.types.Object | None:
    for obj in descendants(root):
        if base_name(obj.name) == anchor_name.lower():
            return obj
    return None


def require_child_anchor(root: bpy.types.Object, anchor_name: str) -> bpy.types.Object:
    anchor = find_child_anchor(root, anchor_name)
    if anchor is None:
        raise RuntimeError(f"{root.name} is missing {anchor_name}")
    return anchor


def link_object_to_collection(obj: bpy.types.Object, collection: bpy.types.Collection) -> None:
    if obj.name not in collection.objects.keys():
        collection.objects.link(obj)


def normalize_root_transform(root: bpy.types.Object) -> dict:
    original = {
        "location": [round(root.location.x, 6), round(root.location.y, 6), round(root.location.z, 6)],
        "rotation": [round(value, 6) for value in root.rotation_euler],
        "scale": [round(root.scale.x, 6), round(root.scale.y, 6), round(root.scale.z, 6)],
    }

    if (
        root.location.length < 0.000001
        and abs(root.rotation_euler.x) < 0.000001
        and abs(root.rotation_euler.y) < 0.000001
        and abs(root.rotation_euler.z) < 0.000001
        and abs(root.scale.x - 1) < 0.000001
        and abs(root.scale.y - 1) < 0.000001
        and abs(root.scale.z - 1) < 0.000001
    ):
        return original

    child_matrices = {child: child.matrix_world.copy() for child in root.children}
    root.location = (0, 0, 0)
    root.rotation_euler = (0, 0, 0)
    root.scale = (1, 1, 1)
    bpy.context.view_layer.update()
    for child, matrix in child_matrices.items():
        child.matrix_world = matrix
    bpy.context.view_layer.update()
    return original


def mesh_world_bounds(meshes: Iterable[bpy.types.Object]) -> tuple[Vector, Vector]:
    bbox_min = Vector((999999.0, 999999.0, 999999.0))
    bbox_max = Vector((-999999.0, -999999.0, -999999.0))
    found = False

    for obj in meshes:
        if obj.type != "MESH":
            continue
        found = True
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            bbox_min.x = min(bbox_min.x, world.x)
            bbox_min.y = min(bbox_min.y, world.y)
            bbox_min.z = min(bbox_min.z, world.z)
            bbox_max.x = max(bbox_max.x, world.x)
            bbox_max.y = max(bbox_max.y, world.y)
            bbox_max.z = max(bbox_max.z, world.z)

    if not found:
        return Vector((0, 0, 0)), Vector((0, 0, 0))

    return bbox_min, bbox_max


def footprint_meshes(root: bpy.types.Object, include: list[str], exclude: list[str] | None = None) -> list[bpy.types.Object]:
    include_terms = [term.lower() for term in include]
    exclude_terms = [term.lower() for term in [*COMMON_FOOTPRINT_EXCLUDES, *(exclude or [])]]
    meshes: list[bpy.types.Object] = []

    for obj in descendants(root):
        name = base_name(obj.name)
        if obj.type != "MESH":
            continue
        if include_terms and not any(term in name for term in include_terms):
            continue
        if any(term in name for term in exclude_terms):
            continue
        meshes.append(obj)

    if meshes:
        return meshes

    return [
        obj
        for obj in descendants(root)
        if obj.type == "MESH" and not any(term in base_name(obj.name) for term in exclude_terms)
    ]


def all_meshes(root: bpy.types.Object) -> list[bpy.types.Object]:
    return [obj for obj in descendants(root) if obj.type == "MESH"]


def remove_anchor(root: bpy.types.Object, anchor_name: str) -> None:
    anchor = find_child_anchor(root, anchor_name)
    if anchor is not None:
        bpy.data.objects.remove(anchor, do_unlink=True)


def add_or_replace_anchor(
    name: str,
    location: Vector,
    root: bpy.types.Object,
) -> bpy.types.Object:
    remove_anchor(root, name)
    anchor = add_anchor(name, (location.x, location.y, location.z), root)
    anchor.empty_display_size = 0.18 if name == PLACEMENT_ANCHOR else 0.12
    anchor["placement_contract"] = name == PLACEMENT_ANCHOR
    return anchor


def ensure_landmark_contract(
    root: bpy.types.Object,
    include: list[str],
    exclude: list[str] | None = None,
) -> dict:
    original_origin = normalize_root_transform(root)
    selected_footprint = footprint_meshes(root, include, exclude)
    if not selected_footprint:
        raise RuntimeError(f"{root.name} has no footprint meshes for Anchor_Placement")

    footprint_min, footprint_max = mesh_world_bounds(selected_footprint)
    full_min, full_max = mesh_world_bounds(all_meshes(root))
    footprint_center = (footprint_min + footprint_max) * 0.5
    full_dimensions = full_max - full_min
    placement = Vector((footprint_center.x, footprint_center.y, footprint_min.z))

    add_or_replace_anchor(PLACEMENT_ANCHOR, placement, root)
    add_or_replace_anchor(
        "Anchor_Hotspot",
        Vector((footprint_center.x, footprint_min.y - max((footprint_max.y - footprint_min.y) * 0.08, 0.08), full_min.z + full_dimensions.z * 0.56)),
        root,
    )
    add_or_replace_anchor(
        "Anchor_Label",
        Vector((footprint_center.x, footprint_min.y - max((footprint_max.y - footprint_min.y) * 0.08, 0.08), full_max.z + max(full_dimensions.z * 0.2, 0.22))),
        root,
    )
    add_or_replace_anchor(
        "Anchor_Light",
        Vector((footprint_center.x, footprint_min.y - max((footprint_max.y - footprint_min.y) * 0.08, 0.08), full_min.z + full_dimensions.z * 0.7)),
        root,
    )
    add_or_replace_anchor(
        "Anchor_CameraFocus",
        Vector((footprint_center.x, footprint_center.y, full_min.z + full_dimensions.z * 0.54)),
        root,
    )

    return {
        "originalOrigin": original_origin,
        "anchorPlacement": [round(placement.x, 5), round(placement.y, 5), round(placement.z, 5)],
        "footprintBounds": {
            "min": [round(footprint_min.x, 5), round(footprint_min.y, 5), round(footprint_min.z, 5)],
            "max": [round(footprint_max.x, 5), round(footprint_max.y, 5), round(footprint_max.z, 5)],
        },
        "fullBounds": {
            "min": [round(full_min.x, 5), round(full_min.y, 5), round(full_min.z, 5)],
            "max": [round(full_max.x, 5), round(full_max.y, 5), round(full_max.z, 5)],
        },
        "footprintMeshCount": len(selected_footprint),
        "footprintMeshes": sorted(obj.name for obj in selected_footprint),
    }


def align_root_placement_to_target(
    root: bpy.types.Object,
    target: Vector,
    rotation_z: float,
    scale: float,
) -> dict:
    placement = require_child_anchor(root, PLACEMENT_ANCHOR)
    root.location = (0, 0, 0)
    root.rotation_euler = (0, 0, rotation_z)
    root.scale = (scale, scale, scale)
    bpy.context.view_layer.update()

    before = placement.matrix_world.translation.copy()
    root.location += target - before
    bpy.context.view_layer.update()

    final_anchor = placement.matrix_world.translation.copy()
    ground_offset = final_anchor.z - target.z

    return {
        "finalWorldPosition": [round(root.location.x, 5), round(root.location.y, 5), round(root.location.z, 5)],
        "finalAnchorWorldPosition": [round(final_anchor.x, 5), round(final_anchor.y, 5), round(final_anchor.z, 5)],
        "rotation": [round(value, 5) for value in root.rotation_euler],
        "scale": [round(root.scale.x, 5), round(root.scale.y, 5), round(root.scale.z, 5)],
        "groundOffset": round(ground_offset, 6),
    }


def normalize_root_for_local_export(root: bpy.types.Object) -> dict:
    placement = require_child_anchor(root, PLACEMENT_ANCHOR)
    root.location = (0, 0, 0)
    bpy.context.view_layer.update()
    anchor_before = placement.matrix_world.translation.copy()
    root.location -= anchor_before
    bpy.context.view_layer.update()
    anchor_after = placement.matrix_world.translation.copy()
    return {
        "exportRootPosition": [round(root.location.x, 5), round(root.location.y, 5), round(root.location.z, 5)],
        "exportAnchorPosition": [round(anchor_after.x, 5), round(anchor_after.y, 5), round(anchor_after.z, 5)],
    }
