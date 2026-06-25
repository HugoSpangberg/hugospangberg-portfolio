from __future__ import annotations

from math import cos, pi, sin

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


def arched_top(
    name: str,
    x: float,
    y: float,
    spring_z: float,
    outer_radius: float,
    inner_radius: float,
    depth: float,
    mat: bpy.types.Material,
    root: bpy.types.Object,
    segments: int = 18,
) -> bpy.types.Object:
    verts: list[tuple[float, float, float]] = []
    for side_y in (y - depth * 0.5, y + depth * 0.5):
        for radius in (outer_radius, inner_radius):
            for index in range(segments + 1):
                angle = pi - (pi * index / segments)
                verts.append((x + cos(angle) * radius, side_y, spring_z + sin(angle) * radius))

    outer_front = 0
    inner_front = segments + 1
    outer_back = (segments + 1) * 2
    inner_back = (segments + 1) * 3
    faces: list[tuple[int, ...]] = []
    for index in range(segments):
        faces.append((outer_front + index, outer_front + index + 1, inner_front + index + 1, inner_front + index))
        faces.append((outer_back + index + 1, outer_back + index, inner_back + index, inner_back + index + 1))
        faces.append((outer_front + index + 1, outer_front + index, outer_back + index, outer_back + index + 1))
        faces.append((inner_front + index, inner_front + index + 1, inner_back + index + 1, inner_back + index))
    faces.append((outer_front, inner_front, inner_back, outer_back))
    faces.append((outer_front + segments, outer_back + segments, inner_back + segments, inner_front + segments))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(mat)
    bpy.context.collection.objects.link(obj)
    parent(obj, root)
    bevel = obj.modifiers.new(f"{name}_Bevel", "BEVEL")
    bevel.width = 0.004
    bevel.segments = 1
    obj.modifiers.new(f"{name}_WeightedNormals", "WEIGHTED_NORMAL")
    return obj


def pine_tree(name: str, x: float, y: float, scale: float, trunk_mat, needle_mat, root: bpy.types.Object) -> bpy.types.Object:
    group = bpy.data.objects.new(name, None)
    group.empty_display_type = "CONE"
    group.location = (0, 0, 0)
    bpy.context.collection.objects.link(group)
    parent(group, root)
    lean = ((x * 0.17 + y * 0.11) % 0.08) - 0.04
    trunk = cylinder(f"{name}_Trunk", (x, y, 0.25 * scale), 0.03 * scale, 0.5 * scale, trunk_mat, 7, root=group)
    trunk.rotation_euler[0] = lean
    layers = [
        ("Lower", 0.55, 0.24, 0.07, 0.34, -0.025, 0.018),
        ("MidA", 0.74, 0.205, 0.055, 0.31, 0.018, -0.014),
        ("MidB", 0.91, 0.17, 0.04, 0.28, -0.014, -0.006),
        ("Top", 1.06, 0.11, 0.018, 0.24, 0.01, 0.012),
    ]
    for layer, z, r1, r2, depth, ox, oy in layers:
        foliage = cone(f"{name}_Foliage_{layer}", (x + ox * scale, y + oy * scale, z * scale), r1 * scale, r2 * scale, depth * scale, needle_mat, 7, root=group)
        foliage.rotation_euler[2] = (x + y + z) * 0.37
    return group


def birch_tree(name: str, x: float, y: float, scale: float, trunk_mat, leaf_mat, root: bpy.types.Object) -> bpy.types.Object:
    group = bpy.data.objects.new(name, None)
    group.empty_display_type = "SPHERE"
    group.location = (0, 0, 0)
    bpy.context.collection.objects.link(group)
    parent(group, root)
    trunk = cylinder(f"{name}_Trunk", (x, y, 0.35 * scale), 0.023 * scale, 0.7 * scale, trunk_mat, 8, root=group)
    trunk.rotation_euler[1] = ((x - y) % 0.08) - 0.04
    for label, ox, oy, oz, radius in [
        ("A", -0.06, 0.01, 0.76, 0.15),
        ("B", 0.08, -0.03, 0.88, 0.14),
        ("C", -0.01, 0.08, 1.0, 0.125),
        ("D", 0.06, 0.05, 1.08, 0.105),
    ]:
        crown = sphere(f"{name}_Crown_{label}", (x + ox * scale, y + oy * scale, oz * scale), radius * scale, leaf_mat, 10, group)
        crown.scale.z *= 0.78
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
