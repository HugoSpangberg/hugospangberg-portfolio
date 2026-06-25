from __future__ import annotations

from math import radians

from blender_common import add_anchor, collection, cube, curved_box, empty_root, reset_scene, save_and_export
from geometry_helpers import window
from materials import career_materials

reset_scene()
collection("COL_Sodra")
mat = career_materials()
root = empty_root("LM_Sodra_Root")

curved_box("LM_Sodra_CurvedGlassFacade", 2.05, radians(-43), radians(43), 0.34, 1.48, 0.26, mat["glass_dark"], 30, root, 0.01)
curved_box("LM_Sodra_LowerWhiteStructuralBand", 2.08, radians(-44), radians(44), 0.28, 0.43, 0.09, mat["concrete_white"], 30, root, 0.006)
curved_box("LM_Sodra_UpperWhiteStructuralBand", 2.08, radians(-44), radians(44), 1.42, 1.55, 0.09, mat["concrete_white"], 30, root, 0.006)
curved_box("LM_Sodra_MidFloorBand", 2.08, radians(-44), radians(44), 0.92, 0.98, 0.075, mat["concrete_white"], 30, root, 0.004)

for index in range(15):
    t = -0.68 + index * (1.36 / 14)
    x = 2.02 * t
    y = -1.92 + 0.38 * (t * t)
    cube(f"LM_Sodra_AttachedVerticalFin_{index}", (x, y, 0.94), (0.024, 0.055, 0.62), mat["concrete_white"], 0.004, root)

cube("LM_Sodra_RightConnectedWing", (1.1, -0.82, 0.9), (0.78, 0.34, 0.82), mat["glass_dark"], 0.012, root)
cube("LM_Sodra_LeftConnectedWing", (-1.08, -0.84, 0.86), (0.68, 0.30, 0.72), mat["glass_dark"], 0.012, root)
cube("LM_Sodra_StructuralCore", (0.78, -1.14, 1.0), (0.38, 0.3, 1.0), mat["concrete_white"], 0.01, root)
curved_box("LM_Sodra_AttachedCurvedRoofOverhang", 2.12, radians(-45), radians(45), 1.55, 1.63, 0.22, mat["metal_dark"], 30, root, 0.005)
cube("LM_Sodra_RoofDeck", (0.72, -1.12, 1.66), (0.9, 0.32, 0.06), mat["concrete_white"], 0.006, root)
for index, x in enumerate([0.38, 0.72, 1.06]):
    cube(f"LM_Sodra_PavilionSupportColumn_{index}", (x, -1.24, 1.77), (0.035, 0.035, 0.22), mat["concrete_white"], 0.003, root)
cube("LM_Sodra_UpperGlassPavilion", (0.72, -1.14, 1.92), (0.74, 0.28, 0.28), mat["glass_cool"], 0.01, root)
cube("LM_Sodra_PavilionRoof", (0.72, -1.14, 2.08), (0.84, 0.34, 0.045), mat["metal_dark"], 0.004, root)
cube("LM_Sodra_GreenSign", (0.25, -1.48, 1.15), (0.18, 0.02, 0.12), mat["sodra_green"], 0.003, root)
cube("LM_Sodra_OpenGrassForeground", (0, -1.9, 0.12), (2.55, 0.44, 0.035), mat["grass"], 0.008, root)
cube("LM_Sodra_RecessedEntrance", (-0.42, -1.98, 0.46), (0.34, 0.035, 0.32), mat["glass_cool"], 0.004, root)
cube("LM_Sodra_EntranceWalk", (-0.42, -2.22, 0.105), (0.46, 0.46, 0.025), mat["path"], 0.004, root)

for row, z in enumerate([0.64, 1.08]):
    for col, x in enumerate([-0.95, -0.65, -0.35, -0.05, 0.25, 0.55, 0.85]):
        window(f"LM_Sodra_FacadePanel_{row}_{col}", x, -1.99 + abs(x) * 0.06, z, 0.13, 0.18, mat["concrete_white"], mat["glass_cool"], root, 0.018)

add_anchor("Anchor_Hotspot", (0, -2.08, 0.95), root)
add_anchor("Anchor_Label", (0, -2.08, 2.54), root)
add_anchor("Anchor_Light", (-0.6, -1.92, 1.05), root)
add_anchor("Anchor_CameraFocus", (0, -1.22, 1.1), root)
save_and_export("sodra", "LM_Sodra_Root", ["LM_Sodra_Root", "Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"])
