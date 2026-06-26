from __future__ import annotations

from math import cos, pi, radians, sin
from pathlib import Path
import sys

import bpy

sys.path.append(str(Path(__file__).resolve().parent))

from blender_common import add_anchor, collection, cube, curved_box, cylinder, empty_root, reset_scene, save_and_export
from geometry_helpers import embedded_path, rock
from materials import career_materials

reset_scene()
collection("COL_Sodra")
mat = career_materials()
root = empty_root("LM_Sodra_Root")


def arc_xy(angle: float, radius: float) -> tuple[float, float]:
    return (sin(angle) * radius, -cos(angle) * radius)


def arc_cube(
    name: str,
    angle: float,
    radius: float,
    z: float,
    scale: tuple[float, float, float],
    material: bpy.types.Material,
    bevel: float,
) -> bpy.types.Object:
    obj = cube(name, (*arc_xy(angle, radius), z), scale, material, bevel, root)
    obj.rotation_euler[2] = angle
    return obj


def facade_grid(prefix: str, angles: list[float], rows: list[float], radius: float, warm_every: int = 0) -> None:
    for row_index, z in enumerate(rows):
        for col_index, angle in enumerate(angles):
            material = mat["window_warm"] if warm_every and (row_index * 7 + col_index) % warm_every == 0 else mat["glass_cool"]
            arc_cube(f"{prefix}_InsetGlass_{row_index}_{col_index}", angle, radius, z, (0.095, 0.007, 0.115), material, 0.0008)
            if row_index == 0:
                arc_cube(f"{prefix}_LowerSill_{col_index}", angle, radius + 0.004, z - 0.078, (0.11, 0.010, 0.012), mat["concrete_white"], 0.0008)


def straight_window_grid(prefix: str, x_values: list[float], y: float, rows: list[float], material: bpy.types.Material) -> None:
    for row_index, z in enumerate(rows):
        for col_index, x in enumerate(x_values):
            cube(f"{prefix}_Frame_{row_index}_{col_index}", (x, y, z), (0.11, 0.018, 0.13), mat["concrete_white"], 0.0018, root)
            cube(f"{prefix}_Glass_{row_index}_{col_index}", (x, y - 0.012, z), (0.084, 0.009, 0.094), material, 0.001, root)


# Integrated site and grounding. The model keeps a small local lawn so it reads correctly in isolation
# while the runtime world still owns final placement.
cube("LM_Sodra_Site_ThinLawnBase", (0.05, -1.56, 0.035), (2.9, 1.58, 0.07), mat["grass"], 0.025, root)
cube("LM_Sodra_Building_PlantedPlinth", (0.0, -1.42, 0.14), (2.55, 0.72, 0.12), mat["concrete_light"], 0.012, root)
embedded_path("LM_Sodra_EntranceCurvedWalk", [(-0.9, -2.15), (-0.55, -1.92), (-0.16, -1.74), (0.18, -1.62)], 0.088, mat["path"], root)
for index, (x, y, scale) in enumerate([(-1.24, -1.86, 0.075), (-1.04, -2.02, 0.055), (1.18, -1.86, 0.065), (1.34, -1.66, 0.045)]):
    rock(f"LM_Sodra_Site_RockCluster_{index}", x, y, 0.085, scale, mat["stone"], root)


# Main curved headquarters body: darker curtain wall with white floor bands and structural ends.
curved_box("LM_Sodra_Main_CurvedCurtainWall", 2.18, radians(-54), radians(54), 0.32, 1.48, 0.30, mat["glass_dark"], 42, root, 0.006)
curved_box("LM_Sodra_Main_LowerStructuralBand", 2.205, radians(-55), radians(55), 0.28, 0.43, 0.12, mat["concrete_white"], 42, root, 0.004)
curved_box("LM_Sodra_Main_SecondFloorBand", 2.215, radians(-55), radians(55), 0.78, 0.84, 0.11, mat["concrete_white"], 42, root, 0.003)
curved_box("LM_Sodra_Main_ThirdFloorBand", 2.215, radians(-55), radians(55), 1.10, 1.16, 0.11, mat["concrete_white"], 42, root, 0.003)
curved_box("LM_Sodra_Main_UpperStructuralBand", 2.22, radians(-55), radians(55), 1.42, 1.56, 0.13, mat["concrete_white"], 42, root, 0.004)

for label, angle in [("Left", radians(-55.5)), ("Right", radians(55.5))]:
    arc_cube(f"LM_Sodra_Main_{label}WhiteEndWall", angle, 2.03, 0.91, (0.10, 0.32, 1.23), mat["concrete_white"], 0.004)

# Repeated facade fins and mullions. These are aligned to the facade curve rather than floating in front.
fin_angles = [radians(-49 + index * 7) for index in range(15)]
for index, angle in enumerate(fin_angles):
    height = 1.10 if index in {0, 14} else 1.02
    arc_cube(f"LM_Sodra_Main_PrimaryVerticalFin_{index:02d}", angle, 2.235, 0.88, (0.026, 0.06, height), mat["concrete_white"], 0.0018)

secondary_angles = [radians(-45 + index * 5) for index in range(19)]
for index, angle in enumerate(secondary_angles):
    arc_cube(f"LM_Sodra_Main_ThinGlassMullion_{index:02d}", angle, 2.238, 0.96, (0.011, 0.034, 0.92), mat["concrete_light"], 0.0008)

facade_grid(
    "LM_Sodra_Main_CurvedOfficeGrid",
    [radians(-47 + index * 7.8) for index in range(13)],
    [0.58, 0.91, 1.24],
    2.222,
    0,
)


# Connected side wings and central structural core echo the real reference's joined volumes.
cube("LM_Sodra_LeftWing_GlassBlock", (-1.17, -0.98, 0.86), (0.68, 0.62, 0.86), mat["glass_dark"], 0.006, root)
cube("LM_Sodra_LeftWing_WhiteLowerBand", (-1.17, -1.22, 0.38), (0.76, 0.12, 0.12), mat["concrete_white"], 0.004, root)
cube("LM_Sodra_LeftWing_WhiteRoofBand", (-1.17, -1.22, 1.34), (0.78, 0.14, 0.12), mat["concrete_white"], 0.004, root)
straight_window_grid("LM_Sodra_LeftWing_OfficeGrid", [-1.42, -1.22, -1.02, -0.82], -1.545, [0.66, 0.96, 1.20], mat["glass_cool"])

cube("LM_Sodra_RightWing_WhiteStructuralCore", (0.98, -1.12, 0.95), (0.58, 0.76, 1.18), mat["concrete_white"], 0.006, root)
cube("LM_Sodra_RightWing_GlassOfficeWing", (1.42, -1.36, 0.82), (0.72, 0.40, 0.84), mat["glass_dark"], 0.006, root)
cube("LM_Sodra_RightWing_LowRearVolume", (1.72, -0.72, 0.64), (0.58, 0.44, 0.56), mat["glass_dark"], 0.006, root)
cube("LM_Sodra_RightWing_WhiteOfficeFacade", (1.42, -1.575, 0.86), (0.76, 0.055, 0.86), mat["concrete_white"], 0.004, root)
cube("LM_Sodra_RightWing_DarkInsetFacade", (1.42, -1.612, 0.86), (0.64, 0.018, 0.74), mat["glass_dark"], 0.002, root)
straight_window_grid("LM_Sodra_RightWing_OfficeGrid", [1.15, 1.33, 1.51, 1.69], -1.632, [0.60, 0.86, 1.12], mat["glass_cool"])
cube("LM_Sodra_Core_RecessedGlassStrip", (0.84, -1.542, 1.04), (0.26, 0.018, 0.72), mat["glass_dark"], 0.002, root)


# Roof structure with readable overhang and an attached upper glass pavilion.
curved_box("LM_Sodra_Roof_WhiteSoffit", 2.31, radians(-57), radians(57), 1.55, 1.62, 0.42, mat["concrete_white"], 42, root, 0.003)
curved_box("LM_Sodra_Roof_DarkThinCap", 2.35, radians(-58), radians(58), 1.62, 1.70, 0.46, mat["metal_dark"], 42, root, 0.003)
cube("LM_Sodra_Roof_RightFlatConnector", (1.12, -1.10, 1.62), (1.0, 0.78, 0.08), mat["concrete_white"], 0.004, root)
cube("LM_Sodra_Roof_RightDarkCap", (1.12, -1.10, 1.70), (1.08, 0.84, 0.08), mat["metal_dark"], 0.003, root)

cube("LM_Sodra_Pavilion_BasePlinth", (0.50, -1.07, 1.75), (0.92, 0.45, 0.10), mat["concrete_white"], 0.004, root)
cube("LM_Sodra_Pavilion_WhiteServiceCore", (0.88, -0.96, 1.90), (0.18, 0.28, 0.28), mat["concrete_white"], 0.003, root)
cube("LM_Sodra_Pavilion_DarkInteriorShadow", (0.46, -1.085, 1.88), (0.72, 0.30, 0.08), mat["metal_dark"], 0.002, root)
for index, (x, y) in enumerate([(0.08, -1.25), (0.50, -1.25), (0.92, -1.25), (0.08, -0.88), (0.92, -0.88)]):
    cube(f"LM_Sodra_Pavilion_SupportColumn_{index}", (x, y, 1.90), (0.028, 0.028, 0.32), mat["concrete_white"], 0.0015, root)
cube("LM_Sodra_Pavilion_GlassVolume", (0.48, -1.07, 2.02), (0.78, 0.38, 0.32), mat["glass_cool"], 0.004, root)
for index, x in enumerate([0.13, 0.37, 0.63, 0.87]):
    cube(f"LM_Sodra_Pavilion_FrontMullion_{index}", (x, -1.268, 2.02), (0.012, 0.022, 0.30), mat["concrete_white"], 0.001, root)
cube("LM_Sodra_Pavilion_ThinRoofOverhang", (0.48, -1.07, 2.22), (0.98, 0.52, 0.065), mat["metal_dark"], 0.003, root)


# Entrance and Södra mark mounted to the structural core.
cube("LM_Sodra_Entrance_DarkRecess", (0.08, -1.955, 0.43), (0.42, 0.07, 0.30), mat["glass_dark"], 0.003, root)
cube("LM_Sodra_Entrance_GlassDoors", (0.08, -2.002, 0.43), (0.30, 0.018, 0.24), mat["glass_cool"], 0.0015, root)
cube("LM_Sodra_Entrance_CanopyConnected", (0.08, -1.95, 0.69), (0.50, 0.23, 0.045), mat["concrete_white"], 0.0025, root)
cube("LM_Sodra_Sign_MountingRail", (0.56, -1.868, 1.25), (0.30, 0.016, 0.035), mat["metal_mid"], 0.0015, root)
cube("LM_Sodra_Sign_GreenPanel", (0.56, -1.887, 1.26), (0.26, 0.014, 0.105), mat["sodra_green"], 0.002, root)
cylinder("LM_Sodra_Sign_CircularLeafMark", (0.42, -1.901, 1.27), 0.036, 0.012, mat["sodra_green"], 18, (pi / 2, 0, 0), 0.0008, root)
cube("LM_Sodra_Sign_LetterHint", (0.59, -1.902, 1.27), (0.12, 0.006, 0.018), mat["concrete_white"], 0.0008, root)


add_anchor("Anchor_Hotspot", (0, -2.08, 0.95), root)
add_anchor("Anchor_Label", (0, -2.08, 2.62), root)
add_anchor("Anchor_Light", (-0.55, -1.9, 1.1), root)
add_anchor("Anchor_CameraFocus", (0.1, -1.24, 1.12), root)
save_and_export("sodra", "LM_Sodra_Root", ["LM_Sodra_Root", "Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"])
