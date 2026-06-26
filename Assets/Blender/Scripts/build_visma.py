from __future__ import annotations

from blender_common import add_anchor, collection, cube, empty_root, reset_scene, save_and_export
from geometry_helpers import birch_tree, door, window
from materials import career_materials

reset_scene()
collection("COL_Visma")
mat = career_materials()
root = empty_root("LM_Visma_Root")

cube("LM_Visma_LeftWing_Facade", (-1.08, 0, 0.92), (1.0, 0.28, 0.92), mat["concrete_white"], 0.018, root)
cube("LM_Visma_RightWing_Facade", (1.08, 0, 0.92), (1.0, 0.28, 0.92), mat["concrete_white"], 0.018, root)
cube("LM_Visma_OrangeCentralVolume", (0, -0.015, 1.0), (0.82, 0.32, 1.0), mat["facade_orange"], 0.018, root)
cube("LM_Visma_ConnectedRearSpine", (0, 0.16, 1.0), (2.38, 0.08, 0.92), mat["concrete_white"], 0.01, root)
cube("LM_Visma_DarkRoofline_Left", (-1.08, -0.02, 1.405), (1.06, 0.34, 0.055), mat["metal_dark"], 0.006, root)
cube("LM_Visma_DarkRoofline_Right", (1.08, -0.02, 1.405), (1.06, 0.34, 0.055), mat["metal_dark"], 0.006, root)
cube("LM_Visma_DarkRoofline_Center", (0, -0.02, 1.535), (0.88, 0.36, 0.055), mat["metal_dark"], 0.006, root)
cube("LM_Visma_AttachedParapetGlass", (0, -0.17, 1.59), (0.72, 0.035, 0.08), mat["glass_cool"], 0.003, root)

for side, x0 in [("L", -1.08), ("R", 1.08)]:
    for row, z in enumerate([0.58, 0.98, 1.38]):
        for col, dx in enumerate([-0.32, -0.11, 0.11, 0.32]):
            glass = mat["window_warm"] if (row, col, side) in [(0, 1, "L"), (2, 2, "R")] else mat["glass_cool"]
            window(f"LM_Visma_Window_{side}_{row}_{col}", x0 + dx, -0.148, z, 0.105, 0.15, mat["concrete_white"], glass, root)

for row, z in enumerate([0.76, 1.2, 1.62]):
    for col, x in enumerate([-0.24, 0, 0.24]):
        window(f"LM_Visma_CentralWindow_{row}_{col}", x, -0.18, z, 0.13, 0.18, mat["concrete_light"], mat["glass_cool"], root)

cube("LM_Visma_GlassEntrance_Recess", (0, -0.185, 0.39), (0.42, 0.035, 0.42), mat["glass_dark"], 0.006, root)
door("LM_Visma_EntranceDoor", 0, -0.225, 0.38, 0.32, 0.36, mat["metal_mid"], mat["glass_dark"], root)
cube("LM_Visma_EntranceCanopy", (0, -0.315, 0.73), (0.62, 0.16, 0.045), mat["concrete_white"], 0.008, root)
cube("LM_Visma_CanopyWallBracket_Left", (-0.27, -0.245, 0.66), (0.035, 0.035, 0.15), mat["metal_mid"], 0.003, root)
cube("LM_Visma_CanopyWallBracket_Right", (0.27, -0.245, 0.66), (0.035, 0.035, 0.15), mat["metal_mid"], 0.003, root)
cube("LM_Visma_SignBoard", (0, -0.41, 0.79), (0.36, 0.02, 0.08), mat["concrete_white"], 0.004, root)
cube("LM_Visma_SignMark", (-0.13, -0.425, 0.79), (0.052, 0.008, 0.046), mat["facade_orange"], 0.003, root)
cube("LM_Visma_EntranceSteps_Upper", (0, -0.44, 0.14), (0.58, 0.14, 0.035), mat["concrete_light"], 0.004, root)
cube("LM_Visma_EntranceSteps_Lower", (0, -0.56, 0.09), (0.72, 0.16, 0.03), mat["concrete_light"], 0.004, root)
cube("LM_Visma_EntryPaving", (0, -0.72, 0.065), (0.96, 0.34, 0.025), mat["stone"], 0.004, root)
birch_tree("LM_Visma_FrontTree_Left", -1.78, -0.58, 0.5, mat["wood"], mat["grass"], root)
birch_tree("LM_Visma_FrontTree_Right", 1.78, -0.58, 0.5, mat["wood"], mat["grass"], root)

add_anchor("Anchor_Hotspot", (0, -0.74, 0.78), root)
add_anchor("Anchor_Label", (0, -0.74, 2.25), root)
add_anchor("Anchor_Light", (0, -0.55, 0.75), root)
add_anchor("Anchor_CameraFocus", (0, -0.18, 1.0), root)
save_and_export("visma", "LM_Visma_Root", ["LM_Visma_Root", "Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"])
