from __future__ import annotations

from math import pi

import bpy
from mathutils import Vector

from blender_common import cube, cylinder, cone, sphere, parent


def window(
    name: str,
    x: float,
    y: float,
    z: float,
    width: float,
    height: float,
    frame_mat: bpy.types.Material,
    glass_mat: bpy.types.Material,
    root: bpy.types.Object,
    frame_depth: float = 0.014,
) -> list[bpy.types.Object]:
    frame = cube(f"{name}_Frame", (x, y, z), (width, frame_depth, height), frame_mat, 0.003, root)
    glass = cube(f"{name}_Glass", (x, y - frame_depth * 0.54, z), (width * 0.74, frame_depth * 0.42, height * 0.74), glass_mat, 0.0015, root)
    sill = cube(f"{name}_Sill", (x, y - frame_depth * 0.2, z - height * 0.59), (width * 1.03, frame_depth * 0.5, height * 0.06), frame_mat, 0.0015, root)
    return [frame, glass, sill]


def door(
    name: str,
    x: float,
    y: float,
    z: float,
    width: float,
    height: float,
    frame_mat: bpy.types.Material,
    glass_mat: bpy.types.Material,
    root: bpy.types.Object,
) -> list[bpy.types.Object]:
    frame = cube(f"{name}_Frame", (x, y, z), (width, 0.035, height), frame_mat, 0.006, root)
    left = cube(f"{name}_LeftGlass", (x - width * 0.22, y - 0.023, z), (width * 0.18, 0.012, height * 0.74), glass_mat, 0.003, root)
    right = cube(f"{name}_RightGlass", (x + width * 0.22, y - 0.023, z), (width * 0.18, 0.012, height * 0.74), glass_mat, 0.003, root)
    handle = cylinder(f"{name}_Handle", (x, y - 0.04, z), 0.014, width * 0.55, frame_mat, 10, (0, pi / 2, 0), 0.001, root)
    return [frame, left, right, handle]


def gabled_roof(
    name: str,
    x: float,
    y: float,
    z: float,
    width: float,
    depth: float,
    height: float,
    mat: bpy.types.Material,
    root: bpy.types.Object,
) -> bpy.types.Object:
    verts = [
        (-width, -depth, 0),
        (width, -depth, 0),
        (width, depth, 0),
        (-width, depth, 0),
        (0, -depth, height),
        (0, depth, height),
    ]
    faces = [(0, 1, 4), (3, 5, 2), (0, 4, 5, 3), (1, 2, 5, 4), (0, 3, 2, 1)]
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    obj.location = (x, y, z)
    obj.data.materials.append(mat)
    bpy.context.collection.objects.link(obj)
    parent(obj, root)
    bevel = obj.modifiers.new(f"{name}_Bevel", "BEVEL")
    bevel.width = 0.012
    bevel.segments = 1
    obj.modifiers.new(f"{name}_WeightedNormals", "WEIGHTED_NORMAL")
    return obj


def pine_tree(name: str, x: float, y: float, scale: float, trunk_mat, needle_mat, root: bpy.types.Object) -> bpy.types.Object:
    group = bpy.data.objects.new(name, None)
    group.empty_display_type = "CONE"
    group.location = (0, 0, 0)
    bpy.context.collection.objects.link(group)
    parent(group, root)
    cylinder(f"{name}_Trunk", (x, y, 0.24 * scale), 0.035 * scale, 0.48 * scale, trunk_mat, 7, root=group)
    cone(f"{name}_Foliage_Lower", (x, y, 0.58 * scale), 0.22 * scale, 0.055 * scale, 0.42 * scale, needle_mat, 7, root=group)
    cone(f"{name}_Foliage_Mid", (x, y, 0.82 * scale), 0.18 * scale, 0.04 * scale, 0.34 * scale, needle_mat, 7, root=group)
    cone(f"{name}_Foliage_Top", (x, y, 1.02 * scale), 0.12 * scale, 0.015 * scale, 0.26 * scale, needle_mat, 7, root=group)
    return group


def birch_tree(name: str, x: float, y: float, scale: float, trunk_mat, leaf_mat, root: bpy.types.Object) -> bpy.types.Object:
    group = bpy.data.objects.new(name, None)
    group.empty_display_type = "SPHERE"
    group.location = (0, 0, 0)
    bpy.context.collection.objects.link(group)
    parent(group, root)
    cylinder(f"{name}_Trunk", (x, y, 0.34 * scale), 0.028 * scale, 0.68 * scale, trunk_mat, 8, root=group)
    sphere(f"{name}_Crown_A", (x - 0.05 * scale, y, 0.78 * scale), 0.17 * scale, leaf_mat, 12, group)
    sphere(f"{name}_Crown_B", (x + 0.07 * scale, y - 0.02 * scale, 0.9 * scale), 0.14 * scale, leaf_mat, 12, group)
    sphere(f"{name}_Crown_C", (x, y + 0.06 * scale, 1.0 * scale), 0.13 * scale, leaf_mat, 12, group)
    return group


def rock(name: str, x: float, y: float, z: float, scale: float, mat, root: bpy.types.Object) -> bpy.types.Object:
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=scale, location=(x, y, z + scale * 0.45))
    obj = bpy.context.object
    obj.name = name
    obj.data.name = f"{name}_Mesh"
    obj.scale.z = 0.55
    obj.rotation_euler = (0.2 + x * 0.13, y * 0.17, x * 0.11)
    obj.data.materials.append(mat)
    parent(obj, root)
    obj.modifiers.new(f"{name}_WeightedNormals", "WEIGHTED_NORMAL")
    return obj


def log(name: str, x: float, y: float, z: float, length: float, radius: float, mat, root: bpy.types.Object, rotation_z: float = 0.0) -> bpy.types.Object:
    obj = cylinder(name, (x, y, z + radius), radius, length, mat, 16, (0, pi / 2, rotation_z), 0.002, root)
    return obj


def embedded_path(name: str, points: list[tuple[float, float]], z: float, mat, root: bpy.types.Object) -> bpy.types.Object:
    width = 0.12
    verts: list[tuple[float, float, float]] = []
    for index, (x, y) in enumerate(points):
        if index == 0:
            direction = Vector((points[1][0] - x, points[1][1] - y, 0))
        elif index == len(points) - 1:
            direction = Vector((x - points[index - 1][0], y - points[index - 1][1], 0))
        else:
            direction = Vector((points[index + 1][0] - points[index - 1][0], points[index + 1][1] - points[index - 1][1], 0))
        direction.normalize()
        normal = Vector((-direction.y, direction.x, 0)) * (width * 0.5)
        verts.append((x + normal.x, y + normal.y, z))
        verts.append((x - normal.x, y - normal.y, z))
    faces = [(index * 2, index * 2 + 1, index * 2 + 3, index * 2 + 2) for index in range(len(points) - 1)]
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(mat)
    bpy.context.collection.objects.link(obj)
    parent(obj, root)
    obj.modifiers.new(f"{name}_WeightedNormals", "WEIGHTED_NORMAL")
    return obj
