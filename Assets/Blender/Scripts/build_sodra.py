from __future__ import annotations

from math import cos, pi, radians, sin
from pathlib import Path
import sys

import bpy
from mathutils import Vector

sys.path.append(str(Path(__file__).resolve().parent))

from blender_common import (
    add_anchor,
    collection,
    cube,
    curved_box,
    cylinder,
    empty_root,
    parent,
    prism_mesh,
    reset_scene,
    save_and_export,
)
from geometry_helpers import birch_tree, embedded_path
from materials import career_materials


reset_scene()
collection("COL_Sodra")
mat = career_materials()
root = empty_root("LM_Sodra_Root")


def group(name: str, parent_obj: bpy.types.Object = root) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = "CUBE"
    bpy.context.collection.objects.link(obj)
    parent(obj, parent_obj)
    return obj


site = group("LM_Sodra_Site")
core = group("LM_Sodra_CentralCore")
curved_wing = group("LM_Sodra_MainCurvedWing")
left_wing = group("LM_Sodra_LeftWing")
right_wing = group("LM_Sodra_RightWing")
pavilion = group("LM_Sodra_UpperPavilion")
roof_system = group("LM_Sodra_RoofSystem")
windows = group("LM_Sodra_Windows")
fins = group("LM_Sodra_Fins")
entrance = group("LM_Sodra_Entrance")
logo = group("LM_Sodra_Logo")

ARC_CENTER_Y = 1.05
CURVE_RADIUS = 3.85
ARC_START = radians(-20)
ARC_END = radians(35)


def arc_xy(angle: float, radius: float) -> tuple[float, float]:
    return (sin(angle) * radius, ARC_CENTER_Y - cos(angle) * radius)


def curved_section(
    name: str,
    radius: float,
    angle_start: float,
    angle_end: float,
    z_bottom: float,
    z_top: float,
    thickness: float,
    material: bpy.types.Material,
    segments: int,
    parent_obj: bpy.types.Object,
    bevel: float,
) -> bpy.types.Object:
    obj = curved_box(name, radius, angle_start, angle_end, z_bottom, z_top, thickness, material, segments, parent_obj, bevel)
    obj.location.y += ARC_CENTER_Y
    return obj


def arc_cube(
    name: str,
    angle: float,
    radius: float,
    z: float,
    scale: tuple[float, float, float],
    material: bpy.types.Material,
    bevel: float,
    parent_obj: bpy.types.Object,
) -> bpy.types.Object:
    obj = cube(name, (*arc_xy(angle, radius), z), scale, material, bevel, parent_obj)
    obj.rotation_euler[2] = angle
    return obj


def oriented_cube(
    name: str,
    center: tuple[float, float],
    z: float,
    scale: tuple[float, float, float],
    angle: float,
    material: bpy.types.Material,
    bevel: float,
    parent_obj: bpy.types.Object,
) -> bpy.types.Object:
    obj = cube(name, (center[0], center[1], z), scale, material, bevel, parent_obj)
    obj.rotation_euler[2] = angle
    return obj


def local_to_world(center: tuple[float, float], angle: float, local_x: float, local_y: float) -> tuple[float, float]:
    forward = Vector((cos(angle), sin(angle), 0))
    side = Vector((-sin(angle), cos(angle), 0))
    point = Vector((center[0], center[1], 0)) + forward * local_x + side * local_y
    return (point.x, point.y)


def facade_panel_grid(
    prefix: str,
    center: tuple[float, float],
    angle: float,
    length: float,
    front_offset: float,
    columns: int,
    rows: list[float],
    parent_obj: bpy.types.Object,
    bay_width: float = 0.14,
    bay_height: float = 0.135,
) -> None:
    spacing = length / (columns + 1)
    start = -length * 0.5 + spacing
    for col in range(columns):
        local_x = start + col * spacing
        x, y = local_to_world(center, angle, local_x, front_offset)
        for row, z in enumerate(rows):
            frame = oriented_cube(
                f"{prefix}_Frame_{row:02d}_{col:02d}",
                (x, y),
                z,
                (bay_width, 0.018, bay_height),
                angle,
                mat["concrete_white"],
                0.0012,
                parent_obj,
            )
            glass = oriented_cube(
                f"{prefix}_Glass_{row:02d}_{col:02d}",
                local_to_world((x, y), angle, 0, -0.010),
                z,
                (bay_width * 0.72, 0.006, bay_height * 0.74),
                angle,
                mat["glass_dark"] if (row + col) % 5 else mat["glass_cool"],
                0.0008,
                parent_obj,
            )
            frame.parent = windows
            glass.parent = windows


def curved_window_bays() -> None:
    bay_angles = [radians(-26 + index * 3.45) for index in range(17)]
    floor_rows = [0.49, 0.68, 0.88, 1.07]
    for col, angle in enumerate(bay_angles):
        for row, z in enumerate(floor_rows):
            glass = arc_cube(
                f"LM_Sodra_CurvedWing_RecessedGlass_{row:02d}_{col:02d}",
                angle,
                CURVE_RADIUS + 0.040,
                z,
                (0.098, 0.010, 0.105),
                mat["glass_dark"] if (row + col) % 6 else mat["glass_cool"],
                0.0008,
                windows,
            )
            glass.parent = windows


def add_text_logo() -> None:
    bpy.ops.object.text_add(location=(-1.56, -2.632, 1.105), rotation=(pi / 2, 0, 0))
    text = bpy.context.object
    text.name = "LM_Sodra_Logo_Text_SODRA"
    text.data.name = "LM_Sodra_Logo_Text_SODRA_Curve"
    text.data.body = "SODRA"
    text.data.align_x = "LEFT"
    text.data.align_y = "CENTER"
    text.data.size = 0.112
    text.data.extrude = 0.003
    text.data.materials.append(mat["sodra_green"])
    parent(text, logo)
    bpy.ops.object.select_all(action="DESELECT")
    text.select_set(True)
    bpy.context.view_layer.objects.active = text
    bpy.ops.object.convert(target="MESH")
    bpy.context.object.name = "LM_Sodra_Logo_Text_SODRA"


# Site context and grounding: an irregular local lawn, paved entry and restrained trees.
prism_mesh(
    "LM_Sodra_Site_IrregularLawn",
    [(-2.55, -2.82), (-1.45, -2.98), (0.10, -2.88), (2.48, -2.52), (2.72, -1.10), (1.70, -0.22), (-1.36, -0.18), (-2.72, -0.92)],
    -0.025,
    0.025,
    mat["grass"],
    site,
    0.010,
)
prism_mesh(
    "LM_Sodra_Site_IntegratedPavedForecourt",
    [(-1.88, -2.88), (-0.72, -2.72), (-0.46, -2.30), (-1.02, -2.10), (-1.98, -2.32)],
    0.023,
    0.038,
    mat["concrete_light"],
    site,
    0.004,
)
embedded_path(
    "LM_Sodra_Site_CurvedApproachPath",
    [(-2.28, -2.78), (-2.02, -2.72), (-1.70, -2.66), (-1.42, -2.60)],
    0.043,
    mat["concrete_light"],
    site,
    0.16,
)
for index, (x, y, scale) in enumerate([(-2.15, -1.85, 0.34), (-2.30, -1.08, 0.28), (2.26, -1.86, 0.30)]):
    birch_tree(f"LM_Sodra_Site_DeciduousTree_{index}", x, y, scale, mat["concrete_light"], mat["grass"], site)


# Pass 1 massing: aerial boomerang/Y footprint with all main volumes connected.
curved_section("LM_Sodra_MainCurvedWing_DarkCurtainWall", CURVE_RADIUS, ARC_START, ARC_END, 0.24, 1.12, 0.32, mat["glass_dark"], 34, curved_wing, 0.003)
curved_section("LM_Sodra_MainCurvedWing_BackConcreteSpandrel", CURVE_RADIUS - 0.30, ARC_START, ARC_END, 0.18, 1.06, 0.10, mat["concrete_white"], 30, curved_wing, 0.002)
cube("LM_Sodra_CentralCore_PaleConcreteMass", (-1.55, -2.36, 0.88), (0.62, 0.44, 1.54), mat["concrete_white"], 0.004, core)
cube("LM_Sodra_CentralCore_RecessedFrontGlass", (-1.15, -2.588, 0.84), (0.50, 0.020, 0.92), mat["glass_dark"], 0.0016, core)
cube("LM_Sodra_CentralCore_EntranceVoid", (-1.38, -2.605, 0.32), (0.36, 0.026, 0.22), mat["glass_dark"], 0.0012, core)

oriented_cube("LM_Sodra_LeftWing_ConnectedOfficeMass", (-1.64, -1.54), 0.62, (1.74, 0.42, 0.86), radians(-5), mat["glass_dark"], 0.004, left_wing)
oriented_cube("LM_Sodra_LeftWing_RearConcreteBack", (-1.66, -1.28), 0.62, (1.70, 0.12, 0.84), radians(-5), mat["concrete_white"], 0.0025, left_wing)
oriented_cube("LM_Sodra_RightWing_AngledOfficeMass", (1.54, -1.62), 0.65, (1.52, 0.46, 0.90), radians(-19), mat["glass_dark"], 0.004, right_wing)
oriented_cube("LM_Sodra_RightWing_ConcreteEndVolume", (2.12, -1.70), 0.64, (0.36, 0.48, 0.88), radians(-19), mat["concrete_white"], 0.003, right_wing)
oriented_cube("LM_Sodra_RearConnector_GlassLink", (0.30, -1.46), 0.58, (1.32, 0.34, 0.76), radians(1), mat["glass_dark"], 0.0035, right_wing)


# Pass 2 facade: continuous white floor bands, attached fins and repeated narrow glazing.
for name, z0, z1 in [
    ("Base", 0.22, 0.31),
    ("Floor01", 0.53, 0.585),
    ("Floor02", 0.735, 0.790),
    ("Floor03", 0.940, 0.995),
    ("RoofEdge", 1.145, 1.205),
]:
    curved_section(f"LM_Sodra_MainCurvedWing_White{name}Band", CURVE_RADIUS + 0.035, radians(-21), radians(36), z0, z1, 0.37, mat["concrete_white"], 32, curved_wing, 0.0018)

for index, angle in enumerate([radians(-17 + index * 2.65) for index in range(21)]):
    fin = arc_cube(
        f"LM_Sodra_Fins_CurvedFacadeFin_{index:02d}",
        angle,
        CURVE_RADIUS + 0.065,
        0.72,
        (0.018, 0.060, 0.92),
        mat["concrete_white"],
        0.0008,
        fins,
    )
    fin.parent = fins

curved_window_bays()

for center, angle, length, offset, cols, rows, prefix in [
    ((-1.64, -1.54), radians(-5), 1.60, -0.225, 5, [0.46, 0.74], "LM_Sodra_LeftWing_WindowGrid"),
    ((1.54, -1.62), radians(-19), 1.30, -0.250, 4, [0.48, 0.76], "LM_Sodra_RightWing_WindowGrid"),
    ((0.30, -1.46), radians(1), 1.00, -0.190, 3, [0.48, 0.74], "LM_Sodra_RearConnector_WindowGrid"),
]:
    facade_panel_grid(prefix, center, angle, length, offset, cols, rows, windows)

for x in [-1.32, -1.16, -1.00, -0.84]:
    cube(f"LM_Sodra_CentralCore_GlassMullion_{x:+.2f}", (x, -2.605, 0.82), (0.012, 0.018, 0.90), mat["concrete_white"], 0.0008, windows)
for z in [0.55, 0.82, 1.08]:
    cube(f"LM_Sodra_CentralCore_GlassFloorBand_{z:.2f}", (-1.12, -2.610, z), (0.50, 0.018, 0.018), mat["concrete_white"], 0.0008, windows)


# Pass 2 roof and upper pavilion: attached roof overhangs, service roof and supported glass pavilion.
curved_section("LM_Sodra_RoofSystem_WhiteSoffitFollowingCurve", CURVE_RADIUS + 0.090, radians(-22), radians(37), 1.165, 1.215, 0.42, mat["concrete_white"], 32, roof_system, 0.0018)
curved_section("LM_Sodra_RoofSystem_DarkOverhangingCurveRoof", CURVE_RADIUS + 0.135, radians(-23), radians(38), 1.215, 1.270, 0.46, mat["metal_dark"], 32, roof_system, 0.002)
oriented_cube("LM_Sodra_RoofSystem_LeftWingDarkCap", (-1.64, -1.54), 1.085, (1.90, 0.52, 0.075), radians(-5), mat["metal_dark"], 0.002, roof_system)
oriented_cube("LM_Sodra_RoofSystem_RightWingDarkCap", (1.54, -1.62), 1.110, (1.66, 0.56, 0.075), radians(-19), mat["metal_dark"], 0.002, roof_system)
oriented_cube("LM_Sodra_RoofSystem_RearConnectorCap", (0.30, -1.46), 0.985, (1.42, 0.43, 0.065), radians(1), mat["metal_dark"], 0.002, roof_system)
prism_mesh(
    "LM_Sodra_RoofSystem_AsymmetricCoreCanopy",
    [(-1.86, -2.68), (0.48, -2.58), (0.76, -1.88), (-1.30, -1.72), (-1.86, -1.96)],
    1.335,
    1.420,
    mat["metal_dark"],
    roof_system,
    0.002,
)
cube("LM_Sodra_RoofSystem_CoreWhiteServiceVolume", (-1.36, -1.86, 1.505), (0.28, 0.24, 0.135), mat["concrete_white"], 0.002, roof_system)
cube("LM_Sodra_RoofSystem_CoreServiceGlassStrip", (-1.36, -2.000, 1.515), (0.23, 0.012, 0.070), mat["glass_dark"], 0.0008, roof_system)

oriented_cube("LM_Sodra_UpperPavilion_ConnectedBase", (-0.18, -1.74), 1.415, (1.12, 0.30, 0.080), radians(0), mat["concrete_white"], 0.002, pavilion)
for index, x in enumerate([-0.72, -0.36, 0.00, 0.36, 0.72]):
    cube(f"LM_Sodra_UpperPavilion_SlenderSupport_{index}", (x * 0.76 - 0.18, -1.875, 1.395), (0.016, 0.016, 0.190), mat["concrete_white"], 0.0008, pavilion)
oriented_cube("LM_Sodra_UpperPavilion_DarkInteriorStrip", (-0.18, -1.885), 1.545, (1.04, 0.018, 0.165), radians(0), mat["metal_dark"], 0.0008, pavilion)
oriented_cube("LM_Sodra_UpperPavilion_GlassVolume", (-0.18, -1.74), 1.565, (1.06, 0.26, 0.230), radians(0), mat["glass_cool"], 0.0025, pavilion)
for index, x in enumerate([-0.64, -0.32, 0.00, 0.32, 0.64]):
    cube(f"LM_Sodra_UpperPavilion_FrontMullion_{index}", (x * 0.82 - 0.18, -1.885, 1.565), (0.010, 0.018, 0.215), mat["concrete_white"], 0.0006, windows)
oriented_cube("LM_Sodra_UpperPavilion_DarkThinRoof", (-0.18, -1.74), 1.720, (1.22, 0.36, 0.050), radians(0), mat["metal_dark"], 0.002, pavilion)


# Entrance and attached Sodra identity mark on the pale core.
cube("LM_Sodra_Entrance_RecessedLobbyShadow", (-1.38, -2.648, 0.34), (0.42, 0.035, 0.290), mat["glass_dark"], 0.0015, entrance)
cube("LM_Sodra_Entrance_DoubleGlassDoors", (-1.38, -2.675, 0.34), (0.30, 0.014, 0.240), mat["glass_cool"], 0.001, entrance)
cube("LM_Sodra_Entrance_AttachedWhiteCanopy", (-1.38, -2.610, 0.555), (0.56, 0.200, 0.045), mat["concrete_white"], 0.0016, entrance)
cube("LM_Sodra_Entrance_Landing", (-1.38, -2.805, 0.090), (0.62, 0.34, 0.070), mat["concrete_light"], 0.002, entrance)
for index, x in enumerate([-1.58, -1.18]):
    cube(f"LM_Sodra_Entrance_CanopyColumn_{index}", (x, -2.600, 0.375), (0.018, 0.018, 0.330), mat["concrete_white"], 0.0008, entrance)

cube("LM_Sodra_Logo_AttachedMountPanel", (-1.56, -2.622, 1.105), (0.50, 0.010, 0.145), mat["concrete_light"], 0.0008, logo)
cylinder("LM_Sodra_Logo_GreenRoundMark", (-1.72, -2.638, 1.105), 0.052, 0.010, mat["sodra_green"], 32, (pi / 2, 0, 0), 0.0008, logo)
cylinder("LM_Sodra_Logo_InnerLightCutoutHint", (-1.72, -2.644, 1.105), 0.030, 0.006, mat["concrete_white"], 24, (pi / 2, 0, 0), 0.0004, logo)
add_text_logo()


add_anchor("Anchor_Hotspot", (-0.25, -2.72, 0.92), root)
add_anchor("Anchor_Label", (-0.25, -2.72, 2.02), root)
add_anchor("Anchor_Light", (-1.35, -2.58, 1.18), root)
add_anchor("Anchor_CameraFocus", (-0.30, -1.95, 0.94), root)
save_and_export("sodra", "LM_Sodra_Root", ["LM_Sodra_Root", "Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"])
