from __future__ import annotations

from math import pi
from pathlib import Path
import sys

import bpy

sys.path.append(str(Path(__file__).resolve().parent))

from blender_common import add_anchor, collection, cube, cylinder, empty_root, reset_scene, save_and_export
from geometry_helpers import birch_tree
from materials import career_materials

reset_scene()
collection("COL_Visma")
mat = career_materials()
root = empty_root("LM_Visma_Root")


def add_window(
    name: str,
    x: float,
    y: float,
    z: float,
    width: float,
    height: float,
    glass: bpy.types.Material,
    frame: bpy.types.Material | None = None,
) -> None:
    frame_mat = frame or mat["concrete_white"]
    cube(f"{name}_Frame", (x, y, z), (width, 0.018, height), frame_mat, 0.0018, root)
    cube(f"{name}_Glass", (x, y - 0.012, z), (width * 0.76, 0.008, height * 0.72), glass, 0.0008, root)
    cube(f"{name}_Sill", (x, y - 0.010, z - height * 0.58), (width * 1.04, 0.012, height * 0.055), frame_mat, 0.0008, root)


def add_window_grid(prefix: str, center_x: float, y: float, cols: int, rows: list[float], spacing: float, width: float, height: float) -> None:
    start = center_x - spacing * (cols - 1) * 0.5
    for row_index, z in enumerate(rows):
        for col in range(cols):
            x = start + col * spacing
            glass = mat["window_warm"] if (row_index, col) in {(0, 1), (2, cols - 2)} else mat["glass_cool"]
            add_window(f"{prefix}_{row_index}_{col}", x, y, z, width, height, glass)


def add_dark_roof_band(name: str, x: float, y: float, z: float, sx: float, sy: float) -> None:
    cube(f"{name}_ParapetBase", (x, y, z), (sx, sy, 0.055), mat["metal_dark"], 0.004, root)
    cube(f"{name}_ThinWhiteSoffit", (x, y - 0.01, z - 0.055), (sx * 0.98, sy * 0.92, 0.028), mat["concrete_white"], 0.002, root)


# Local site context. The building remains exportable as one landmark asset while the runtime world
# still controls final placement.
cube("LM_Visma_Site_PavedForecourt", (0, -0.86, 0.035), (1.46, 0.58, 0.07), mat["stone"], 0.012, root)
cube("LM_Visma_Site_LowLawn_Left", (-1.68, -0.72, 0.03), (0.58, 0.46, 0.06), mat["grass"], 0.012, root)
cube("LM_Visma_Site_LowLawn_Right", (1.68, -0.72, 0.03), (0.58, 0.46, 0.06), mat["grass"], 0.012, root)
cube("LM_Visma_Site_Hedge_Left", (-1.25, -0.55, 0.16), (0.62, 0.075, 0.10), mat["moss"], 0.018, root)
cube("LM_Visma_Site_Hedge_Right", (1.25, -0.55, 0.16), (0.62, 0.075, 0.10), mat["moss"], 0.018, root)
birch_tree("LM_Visma_FrontTree_Left", -1.72, -0.76, 0.46, mat["wood"], mat["grass"], root)
birch_tree("LM_Visma_FrontTree_Right", 1.72, -0.76, 0.46, mat["wood"], mat["grass"], root)


# A single connected office mass: white wings and orange center share one rear spine and base.
cube("LM_Visma_Main_ContinuousBasePlinth", (0, -0.08, 0.18), (3.48, 0.44, 0.18), mat["concrete_light"], 0.006, root)
cube("LM_Visma_Main_RearWhiteSpine", (0, 0.08, 0.92), (3.56, 0.22, 0.98), mat["concrete_white"], 0.010, root)
cube("LM_Visma_LeftWing_WhiteFacade", (-1.13, -0.12, 0.90), (1.08, 0.34, 0.94), mat["concrete_white"], 0.008, root)
cube("LM_Visma_RightWing_WhiteFacade", (1.13, -0.12, 0.90), (1.08, 0.34, 0.94), mat["concrete_white"], 0.008, root)
cube("LM_Visma_Center_OrangeCore", (0, -0.16, 0.98), (0.92, 0.39, 1.06), mat["facade_orange"], 0.008, root)
cube("LM_Visma_Center_WhiteSideReveal_Left", (-0.53, -0.20, 0.96), (0.055, 0.08, 1.02), mat["concrete_white"], 0.002, root)
cube("LM_Visma_Center_WhiteSideReveal_Right", (0.53, -0.20, 0.96), (0.055, 0.08, 1.02), mat["concrete_white"], 0.002, root)


# Flat roofline and restrained top glazing, matching the real office's horizontal profile.
add_dark_roof_band("LM_Visma_Roof_ContinuousFlatRoofline", 0, -0.075, 1.45, 3.64, 0.50)
cube("LM_Visma_Roof_BackLowGlassRibbon", (0, 0.175, 1.505), (3.10, 0.022, 0.038), mat["metal_mid"], 0.0012, root)
cube("LM_Visma_Roof_CentralOrangeCrown", (0, -0.265, 1.515), (0.95, 0.045, 0.055), mat["facade_orange"], 0.0015, root)
for index, x in enumerate([-1.20, -0.72, 0.0, 0.72, 1.20]):
    cube(f"LM_Visma_Roof_SlimSkylight_{index}", (x, -0.28, 1.507), (0.13, 0.016, 0.026), mat["glass_dark"], 0.0008, root)


# Side-wing facade rhythm.
add_window_grid("LM_Visma_LeftWing_Window", -1.13, -0.306, 4, [0.58, 0.90, 1.20], 0.26, 0.125, 0.145)
add_window_grid("LM_Visma_RightWing_Window", 1.13, -0.306, 4, [0.58, 0.90, 1.20], 0.26, 0.125, 0.145)
for x in [-1.66, -0.60, 0.60, 1.66]:
    cube(f"LM_Visma_Facade_SubtleVerticalJoint_{x:.1f}", (x, -0.318, 0.90), (0.014, 0.012, 0.78), mat["concrete_light"], 0.0008, root)


# Orange center: larger corporate glass bays and a fully connected central atrium.
for row_index, z in enumerate([0.75, 1.10, 1.36]):
    for col_index, x in enumerate([-0.25, 0.0, 0.25]):
        add_window(f"LM_Visma_Center_OfficeGlass_{row_index}_{col_index}", x, -0.365, z, 0.18, 0.18, mat["glass_cool"], mat["concrete_light"])

cube("LM_Visma_Entrance_OrangePilaster_Left", (-0.31, -0.405, 0.55), (0.055, 0.09, 0.64), mat["facade_orange"], 0.0025, root)
cube("LM_Visma_Entrance_OrangePilaster_Right", (0.31, -0.405, 0.55), (0.055, 0.09, 0.64), mat["facade_orange"], 0.0025, root)
cube("LM_Visma_Entrance_AtriumDarkRecess", (0, -0.394, 0.54), (0.50, 0.052, 0.62), mat["glass_dark"], 0.003, root)
cube("LM_Visma_Entrance_AtriumGlassTall", (0, -0.425, 0.66), (0.42, 0.014, 0.66), mat["glass_cool"], 0.0012, root)
for index, x in enumerate([-0.17, 0.0, 0.17]):
    cube(f"LM_Visma_Entrance_AtriumMullion_{index}", (x, -0.438, 0.66), (0.010, 0.008, 0.64), mat["metal_mid"], 0.0008, root)
cube("LM_Visma_Entrance_DoubleDoor", (0, -0.448, 0.33), (0.32, 0.014, 0.30), mat["glass_dark"], 0.0012, root)
cube("LM_Visma_Entrance_DoorCenterLine", (0, -0.458, 0.33), (0.005, 0.005, 0.27), mat["metal_mid"], 0.0006, root)

cube("LM_Visma_Entrance_CanopyConnectedSlab", (0, -0.505, 0.79), (0.82, 0.19, 0.052), mat["concrete_white"], 0.0035, root)
cube("LM_Visma_Entrance_CanopyDarkUnderside", (0, -0.530, 0.754), (0.76, 0.15, 0.016), mat["metal_dark"], 0.0012, root)
for index, x in enumerate([-0.34, 0.34]):
    cube(f"LM_Visma_Entrance_CanopyWallBracket_{index}", (x, -0.415, 0.70), (0.030, 0.034, 0.18), mat["metal_mid"], 0.0015, root)

cube("LM_Visma_Sign_WhitePanel", (0, -0.615, 0.83), (0.46, 0.018, 0.105), mat["concrete_white"], 0.002, root)
cylinder("LM_Visma_Sign_RedMark", (-0.16, -0.628, 0.836), 0.034, 0.010, mat["filmstaden_red"], 18, (pi / 2, 0, 0), 0.0008, root)
cube("LM_Visma_Sign_DarkLetterHint", (0.07, -0.634, 0.836), (0.20, 0.006, 0.020), mat["metal_dark"], 0.0008, root)

cube("LM_Visma_Entrance_Landing", (0, -0.63, 0.13), (0.78, 0.24, 0.045), mat["concrete_light"], 0.003, root)
cube("LM_Visma_Entrance_StepMiddle", (0, -0.84, 0.095), (0.94, 0.18, 0.034), mat["concrete_light"], 0.003, root)
cube("LM_Visma_Entrance_StepLower", (0, -0.99, 0.065), (1.10, 0.17, 0.030), mat["concrete_light"], 0.003, root)
for index, x in enumerate([-0.47, 0.47]):
    cube(f"LM_Visma_Entrance_ThinHandrail_{index}", (x, -0.80, 0.25), (0.012, 0.34, 0.012), mat["metal_mid"], 0.0008, root)


add_anchor("Anchor_Hotspot", (0, -0.88, 0.78), root)
add_anchor("Anchor_Label", (0, -0.88, 2.28), root)
add_anchor("Anchor_Light", (0, -0.62, 0.82), root)
add_anchor("Anchor_CameraFocus", (0, -0.22, 1.0), root)
save_and_export("visma", "LM_Visma_Root", ["LM_Visma_Root", "Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"])
