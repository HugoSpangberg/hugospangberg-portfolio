from __future__ import annotations

from blender_common import add_anchor, collection, cube, empty_root, reset_scene, save_and_export
from geometry_helpers import arched_top, door, gabled_roof, window
from materials import career_materials

reset_scene()
collection("COL_Education")
mat = career_materials()
root = empty_root("LM_Education_Root")

cube("LM_Education_MainBrickFacade", (0, 0, 0.98), (2.18, 0.30, 0.98), mat["brick_red"], 0.018, root)
cube("LM_Education_LeftWing", (-1.48, 0.02, 0.82), (0.58, 0.28, 0.82), mat["brick_red"], 0.016, root)
cube("LM_Education_RightWing", (1.48, 0.02, 0.82), (0.58, 0.28, 0.82), mat["brick_red"], 0.016, root)
cube("LM_Education_StonePlinth", (0, -0.015, 0.18), (2.98, 0.34, 0.18), mat["concrete_light"], 0.01, root)
cube("LM_Education_CentralEntranceProjection", (0, -0.23, 0.98), (0.52, 0.18, 1.02), mat["brick_warm"], 0.014, root)
cube("LM_Education_CorniceBand", (0, -0.018, 1.49), (2.96, 0.34, 0.075), mat["brick_dark"], 0.006, root)
gabled_roof("LM_Education_MainSlateRoof", 0, 0.02, 1.53, 1.58, 0.25, 0.24, mat["brick_dark"], root)
gabled_roof("LM_Education_CentralRoofCrown", 0, -0.16, 1.67, 0.38, 0.15, 0.18, mat["brick_dark"], root)
cube("LM_Education_LeftWingRoofSeat", (-1.48, 0.02, 1.25), (0.68, 0.31, 0.055), mat["brick_dark"], 0.005, root)
cube("LM_Education_RightWingRoofSeat", (1.48, 0.02, 1.25), (0.68, 0.31, 0.055), mat["brick_dark"], 0.005, root)
for index, x in enumerate([-1.82, -1.48, 1.48, 1.82]):
    cube(f"LM_Education_DecorativeBrickPillar_{index}", (x, -0.18, 0.94), (0.07, 0.055, 0.86), mat["brick_dark"], 0.006, root)

for row, z in enumerate([0.58, 0.98, 1.38]):
    for col, x in enumerate([-0.74, -0.38, 0.38, 0.74]):
        glass = mat["window_warm"] if row == 0 and col in [1, 2] else mat["glass_dark"]
        window(f"LM_Education_MainTallWindow_{row}_{col}", x, -0.158, z, 0.13, 0.22, mat["concrete_light"], glass, root)
    for side, x in [("L", -1.48), ("R", 1.48)]:
        glass = mat["window_warm"] if row == 0 and side == "L" else mat["glass_dark"]
        window(f"LM_Education_WingTallWindow_{side}_{row}", x, -0.145, z, 0.13, 0.22, mat["concrete_light"], glass, root)
for row, z in enumerate([0.94, 1.36]):
    window(f"LM_Education_CentralWindow_{row}", 0, -0.325, z, 0.16, 0.24, mat["concrete_light"], mat["glass_dark"], root)

cube("LM_Education_EntranceStonePier_Left", (-0.18, -0.335, 0.42), (0.07, 0.055, 0.38), mat["concrete_light"], 0.006, root)
cube("LM_Education_EntranceStonePier_Right", (0.18, -0.335, 0.42), (0.07, 0.055, 0.38), mat["concrete_light"], 0.006, root)
arched_top("LM_Education_EntranceArchedStoneHeader", 0, -0.335, 0.54, 0.215, 0.145, 0.055, mat["concrete_light"], root)
cube("LM_Education_EntranceRecessShadow", (0, -0.37, 0.44), (0.31, 0.028, 0.43), mat["brick_dark"], 0.004, root)
door("LM_Education_ArchedMainDoor", 0, -0.395, 0.39, 0.25, 0.36, mat["brick_dark"], mat["window_warm"], root)
cube("LM_Education_EntranceSteps_Upper", (0, -0.51, 0.18), (0.42, 0.18, 0.04), mat["concrete_light"], 0.004, root)
cube("LM_Education_EntranceSteps_Lower", (0, -0.66, 0.135), (0.55, 0.18, 0.03), mat["concrete_light"], 0.004, root)
cube("LM_Education_FrontPath", (0, -0.72, 0.105), (0.46, 0.54, 0.025), mat["path"], 0.004, root)
cube("LM_Education_SubtleVioletMarker", (0.43, -0.335, 1.55), (0.08, 0.018, 0.08), mat["violet"], 0.003, root)

add_anchor("Anchor_Hotspot", (0, -0.78, 0.85), root)
add_anchor("Anchor_Label", (0, -0.78, 2.36), root)
add_anchor("Anchor_Light", (0, -0.84, 0.66), root)
add_anchor("Anchor_CameraFocus", (0, -0.18, 1.06), root)
save_and_export("education", "LM_Education_Root", ["LM_Education_Root", "Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"])
