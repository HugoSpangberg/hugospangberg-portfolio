from math import pi

from common import add_anchor, collection, cube, cylinder, material, reset_scene, save_and_export

reset_scene()
collection("COL_Filmstaden")

brick = material("MAT_Brick_RedBrown", (0.48, 0.21, 0.16, 1), 0.86)
brick_dark = material("MAT_Brick_Shadow", (0.34, 0.12, 0.1, 1), 0.9)
marquee = material("MAT_Filmstaden_MarqueeRed", (0.72, 0.04, 0.035, 1), 0.58, emission=(0.32, 0.02, 0.015, 1), emission_strength=0.18)
glass = material("MAT_Dark_Teal_Glass", (0.035, 0.11, 0.12, 1), 0.28, 0.12)
stone = material("MAT_Muted_White_Stone", (0.76, 0.72, 0.64, 1), 0.82)
warm = material("MAT_Warm_Canopy_Light", (0.95, 0.74, 0.35, 1), 0.48, emission=(0.95, 0.52, 0.16, 1), emission_strength=0.75)

cube("LM_Filmstaden_Root", (0, 0, 1.15), (2.95, 0.36, 1.15), brick, 0.035)
cube("LM_Filmstaden_StoneGroundFloor", (0, -0.015, 0.28), (3.12, 0.42, 0.28), stone, 0.025)
cube("LM_Filmstaden_RoofCornice", (0, -0.02, 2.34), (3.15, 0.42, 0.09), brick_dark, 0.018)
cube("LM_Filmstaden_DarkRedEntranceDoors", (0, -0.46, 0.48), (0.64, 0.045, 0.46), glass, 0.012)

for row in range(3):
    for col in range(8):
        x = -2.42 + col * 0.69
        cube(f"LM_Filmstaden_WindowFrame_{row}_{col}", (x, -0.385, 0.98 + row * 0.39), (0.19, 0.035, 0.14), stone, 0.008)
        cube(f"LM_Filmstaden_WindowGlass_{row}_{col}", (x, -0.414, 0.98 + row * 0.39), (0.145, 0.018, 0.105), glass, 0.004)

for index, x in enumerate([-1.1, -0.72, 0.72, 1.1]):
    cube(f"LM_Filmstaden_EntranceColumn_{index}", (x, -0.49, 0.44), (0.08, 0.07, 0.52), stone, 0.012)

# Real curved marquee: half-cylinder body plus red horizontal bands.
cylinder("LM_Filmstaden_CurvedMarquee", (0, -0.55, 0.83), 0.42, 1.62, marquee, 32, (0, pi / 2, 0), 0.015)
cube("LM_Filmstaden_MarqueeBand_Upper", (0, -0.79, 1.02), (1.72, 0.035, 0.035), marquee, 0.006)
cube("LM_Filmstaden_MarqueeBand_Lower", (0, -0.79, 0.66), (1.72, 0.035, 0.035), marquee, 0.006)
for index, x in enumerate([-0.62, -0.31, 0, 0.31, 0.62]):
    cylinder(f"LM_Filmstaden_CanopyBulb_{index}", (x, -0.86, 0.66), 0.035, 0.022, warm, 12, (pi / 2, 0, 0), 0)

cylinder("LM_Filmstaden_RoundSign", (0, -0.50, 1.62), 0.28, 0.04, marquee, 32, (pi / 2, 0, 0), 0.006)
cube("LM_Filmstaden_RaisedF_Stem", (-0.045, -0.535, 1.64), (0.035, 0.015, 0.17), stone, 0.003)
cube("LM_Filmstaden_RaisedF_Top", (0.045, -0.535, 1.72), (0.125, 0.015, 0.03), stone, 0.003)
cube("LM_Filmstaden_RaisedF_Mid", (0.025, -0.535, 1.63), (0.095, 0.015, 0.028), stone, 0.003)

for index, x in enumerate([-1.34, 1.34]):
    cube(f"LM_Filmstaden_PosterDisplay_{index}", (x, -0.48, 0.46), (0.22, 0.035, 0.34), glass, 0.006)
    cube(f"LM_Filmstaden_PosterWarmInset_{index}", (x, -0.505, 0.46), (0.16, 0.012, 0.26), warm, 0.003)

add_anchor("Anchor_Hotspot", (0, -0.82, 0.82))
add_anchor("Anchor_Label", (0, -0.82, 2.58))
add_anchor("Anchor_Light", (0, -0.95, 0.88))
add_anchor("Anchor_CameraFocus", (0, -0.2, 1.12))
save_and_export("filmstaden", "LM_Filmstaden_Root", ["LM_Filmstaden_Root", "Anchor_Hotspot", "Anchor_Label", "Anchor_Light"])
