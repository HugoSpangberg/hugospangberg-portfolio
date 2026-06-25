from math import radians

from common import add_anchor, collection, cube, curved_wall, material, reset_scene, save_and_export

reset_scene()
collection("COL_Sodra")

glass = material("MAT_Sodra_DarkGlassBands", (0.035, 0.12, 0.12, 1), 0.3, 0.12, emission=(0.02, 0.16, 0.14, 1), emission_strength=0.12)
white = material("MAT_Sodra_WhiteStructuralFrame", (0.82, 0.86, 0.82, 1), 0.76)
green = material("MAT_Sodra_GreenDetail", (0.18, 0.62, 0.34, 1), 0.52, emission=(0.04, 0.28, 0.12, 1), emission_strength=0.24)
roof = material("MAT_Sodra_RoofOverhang", (0.07, 0.09, 0.08, 1), 0.62)
grass = material("MAT_Sodra_GrassForeground", (0.18, 0.38, 0.29, 1), 0.9)

curved_wall("LM_Sodra_Root", 2.25, radians(-42), radians(42), 1.18, 0.28, glass, 22, 0.35)
curved_wall("LM_Sodra_WhiteFrameLower", 2.28, radians(-43), radians(43), 0.16, 0.08, white, 22, 0.28)
curved_wall("LM_Sodra_WhiteFrameUpper", 2.28, radians(-43), radians(43), 0.13, 0.08, white, 22, 1.48)
for index in range(13):
    x = -1.35 + index * 0.225
    cube(f"LM_Sodra_VerticalFin_{index}", (x, -1.86 + abs(x) * 0.12, 0.98), (0.028, 0.06, 0.7), white, 0.006)

cube("LM_Sodra_LeftOffsetWing", (-1.15, -0.35, 0.88), (0.72, 0.36, 0.78), glass, 0.018)
cube("LM_Sodra_RightOffsetWing", (1.12, -0.34, 0.82), (0.68, 0.32, 0.7), glass, 0.018)
cube("LM_Sodra_RoofOverhang", (0, -1.7, 1.66), (2.95, 0.45, 0.08), roof, 0.012)
cube("LM_Sodra_UpperGlassPavilion", (0.7, -1.38, 2.0), (0.74, 0.34, 0.34), glass, 0.016)
cube("LM_Sodra_GreenSign", (-1.2, -1.98, 1.1), (0.2, 0.026, 0.16), green, 0.004)
cube("LM_Sodra_GrassForeground", (0, -2.02, 0.1), (2.6, 0.5, 0.05), grass, 0.012)

add_anchor("Anchor_Hotspot", (0, -2.18, 0.95))
add_anchor("Anchor_Label", (0, -2.18, 2.54))
add_anchor("Anchor_Light", (-0.95, -2.12, 1.05))
add_anchor("Anchor_CameraFocus", (0, -1.3, 1.08))
save_and_export("sodra", "LM_Sodra_Root", ["LM_Sodra_Root", "Anchor_Hotspot", "Anchor_Label", "Anchor_Light"])
