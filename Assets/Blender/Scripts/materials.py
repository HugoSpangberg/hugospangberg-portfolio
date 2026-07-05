from __future__ import annotations

import bpy


def make_material(
    name: str,
    color: tuple[float, float, float, float],
    roughness: float = 0.72,
    metallic: float = 0.03,
    emission: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    existing = bpy.data.materials.get(name)
    if existing:
        return existing

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


def career_materials() -> dict[str, bpy.types.Material]:
    return {
        "brick_red": make_material("MAT_Brick_Red", (0.50, 0.20, 0.14, 1), 0.86),
        "brick_warm": make_material("MAT_Brick_WarmBrown", (0.56, 0.30, 0.20, 1), 0.84),
        "brick_dark": make_material("MAT_Brick_Dark", (0.30, 0.11, 0.09, 1), 0.9),
        "concrete_light": make_material("MAT_Concrete_Light", (0.70, 0.68, 0.62, 1), 0.82),
        "concrete_white": make_material("MAT_Concrete_White", (0.82, 0.84, 0.80, 1), 0.78),
        "facade_orange": make_material("MAT_Facade_Orange", (0.78, 0.36, 0.16, 1), 0.78),
        "glass_dark": make_material("MAT_Glass_DarkTeal", (0.035, 0.13, 0.14, 1), 0.32, 0.1, (0.01, 0.08, 0.09, 1), 0.08),
        "glass_cool": make_material("MAT_Glass_Cool", (0.12, 0.32, 0.36, 1), 0.36, 0.08, (0.03, 0.20, 0.24, 1), 0.13),
        "window_warm": make_material("MAT_Window_Warm", (0.86, 0.62, 0.34, 1), 0.44, 0.02, (0.86, 0.40, 0.12, 1), 0.38),
        "metal_dark": make_material("MAT_Metal_Dark", (0.04, 0.05, 0.045, 1), 0.48, 0.28),
        "metal_mid": make_material("MAT_Metal_Mid", (0.30, 0.34, 0.32, 1), 0.44, 0.34),
        "machine_green": make_material("MAT_Machine_Green", (0.12, 0.38, 0.28, 1), 0.64, 0.08),
        "machine_black": make_material("MAT_Machine_Black", (0.02, 0.025, 0.022, 1), 0.54, 0.18),
        "forest_ground": make_material("MAT_Forest_Ground", (0.11, 0.24, 0.18, 1), 0.92),
        "grass": make_material("MAT_Grass", (0.22, 0.42, 0.30, 1), 0.9),
        "moss": make_material("MAT_Moss", (0.34, 0.48, 0.32, 1), 0.88),
        "wood": make_material("MAT_Wood", (0.44, 0.30, 0.17, 1), 0.86),
        "birch": make_material("MAT_Birch_Bark", (0.76, 0.74, 0.66, 1), 0.82),
        "filmstaden_red": make_material("MAT_Filmstaden_Red", (0.70, 0.04, 0.035, 1), 0.56, 0.04, (0.28, 0.02, 0.01, 1), 0.16),
        "sodra_green": make_material("MAT_Sodra_Green", (0.18, 0.58, 0.32, 1), 0.52, 0.03, (0.03, 0.18, 0.08, 1), 0.16),
        "cyan": make_material("MAT_Cyan_Accent", (0.35, 0.84, 0.90, 1), 0.42, 0.08, (0.08, 0.50, 0.64, 1), 0.48),
        "violet": make_material("MAT_Violet_Accent", (0.58, 0.47, 0.82, 1), 0.52, 0.02, (0.22, 0.12, 0.42, 1), 0.18),
        "path": make_material("MAT_Embedded_Path", (0.30, 0.38, 0.32, 1), 0.9),
        "stone": make_material("MAT_Stone", (0.42, 0.46, 0.42, 1), 0.86),
    }
