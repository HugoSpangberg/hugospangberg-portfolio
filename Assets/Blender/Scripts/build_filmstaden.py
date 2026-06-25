from __future__ import annotations

from math import pi

from blender_common import add_anchor, collection, cube, cylinder, empty_root, reset_scene, save_and_export, shallow_canopy
from geometry_helpers import door, window
from materials import career_materials

reset_scene()
collection("COL_Filmstaden")
mat = career_materials()
root = empty_root("LM_Filmstaden_Root")

cube("LM_Filmstaden_BrickFacade", (0, 0, 1.22), (2.78, 0.30, 1.22), mat["brick_warm"], 0.018, root)
cube("LM_Filmstaden_LightStoneGroundFloor", (0, -0.01, 0.34), (2.95, 0.34, 0.34), mat["concrete_light"], 0.012, root)
cube("LM_Filmstaden_RecessedEntranceBay", (0, -0.22, 0.43), (0.68, 0.12, 0.43), mat["brick_dark"], 0.006, root)
cube("LM_Filmstaden_RoofCornice", (0, -0.02, 1.86), (2.98, 0.34, 0.075), mat["concrete_light"], 0.006, root)
cube("LM_Filmstaden_DarkRoofCap", (0, 0.02, 1.93), (3.04, 0.36, 0.045), mat["brick_dark"], 0.004, root)
cube("LM_Filmstaden_BrickCorniceDetail", (0, -0.175, 1.78), (2.72, 0.035, 0.055), mat["brick_dark"], 0.004, root)

for row, z in enumerate([1.0, 1.42, 1.84]):
    for col, x in enumerate([-1.08, -0.78, -0.48, -0.18, 0.18, 0.48, 0.78, 1.08]):
        glass = mat["window_warm"] if row == 0 and col in [2, 5] else mat["glass_dark"]
        window(f"LM_Filmstaden_UpperWindow_{row}_{col}", x, -0.168, z, 0.14, 0.18, mat["concrete_light"], glass, root)

for index, x in enumerate([-1.08, -0.68, 0.68, 1.08]):
    cube(f"LM_Filmstaden_GroundFloorColumn_{index}", (x, -0.2, 0.42), (0.045, 0.06, 0.45), mat["concrete_light"], 0.006, root)
for index, x in enumerate([-0.94, 0.94]):
    cube(f"LM_Filmstaden_MarqueeSupportColumn_{index}", (x, -0.43, 0.52), (0.045, 0.045, 0.48), mat["concrete_light"], 0.004, root)
for index, x in enumerate([-1.24, -0.94, 0.94, 1.24]):
    cube(f"LM_Filmstaden_PosterCase_{index}", (x, -0.205, 0.42), (0.15, 0.026, 0.32), mat["glass_dark"], 0.004, root)
    cube(f"LM_Filmstaden_PosterInset_{index}", (x, -0.224, 0.42), (0.108, 0.009, 0.25), mat["window_warm"], 0.002, root)

door("LM_Filmstaden_RedFramedEntrance", 0, -0.23, 0.42, 0.5, 0.42, mat["filmstaden_red"], mat["glass_dark"], root)

# Shallow curved canopy attached to the facade, not a tunnel-shaped cylinder.
shallow_canopy("LM_Filmstaden_ShallowCurvedMarquee", 2.34, -0.17, -0.43, 0.12, 0.73, 0.9, mat["filmstaden_red"], 22, root, 0.01)
shallow_canopy("LM_Filmstaden_MarqueeUnderside", 2.32, -0.17, -0.428, 0.12, 0.69, 0.725, mat["metal_dark"], 22, root, 0.003)
for index, z in enumerate([0.79, 0.86, 0.92]):
    shallow_canopy(f"LM_Filmstaden_MarqueeHorizontalBand_{index}", 2.38, -0.185, -0.45, 0.12, z, z + 0.014, mat["concrete_light"], 22, root, 0.001)
for index, x in enumerate([-0.84, -0.5, -0.16, 0.16, 0.5, 0.84]):
    cylinder(f"LM_Filmstaden_CanopyDownlight_{index}", (x, -0.43, 0.70), 0.018, 0.014, mat["window_warm"], 12, (pi / 2, 0, 0), 0, root)

cylinder("LM_Filmstaden_RoundFSign_Backplate", (0, -0.19, 1.55), 0.21, 0.032, mat["filmstaden_red"], 32, (pi / 2, 0, 0), 0.004, root)
cube("LM_Filmstaden_RoundSignWallBracket", (0, -0.177, 1.55), (0.08, 0.035, 0.28), mat["metal_dark"], 0.003, root)
cube("LM_Filmstaden_RaisedF_Stem", (-0.045, -0.212, 1.56), (0.028, 0.009, 0.13), mat["concrete_light"], 0.002, root)
cube("LM_Filmstaden_RaisedF_Top", (0.03, -0.212, 1.62), (0.095, 0.009, 0.022), mat["concrete_light"], 0.002, root)
cube("LM_Filmstaden_RaisedF_Mid", (0.015, -0.212, 1.55), (0.075, 0.009, 0.02), mat["concrete_light"], 0.002, root)
cube("LM_Filmstaden_Wordmark_Base", (0.52, -0.19, 1.13), (0.38, 0.018, 0.065), mat["filmstaden_red"], 0.003, root)
cube("LM_Filmstaden_Wordmark_RhythmA", (0.2, -0.19, 1.13), (0.09, 0.018, 0.058), mat["filmstaden_red"], 0.003, root)
cube("LM_Filmstaden_Wordmark_RhythmB", (0.84, -0.19, 1.13), (0.09, 0.018, 0.058), mat["filmstaden_red"], 0.003, root)

add_anchor("Anchor_Hotspot", (0, -0.72, 0.82), root)
add_anchor("Anchor_Label", (0, -0.72, 2.58), root)
add_anchor("Anchor_Light", (0, -0.82, 0.86), root)
add_anchor("Anchor_CameraFocus", (0, -0.16, 1.18), root)
save_and_export("filmstaden", "LM_Filmstaden_Root", ["LM_Filmstaden_Root", "Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"])
