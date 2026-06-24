from common import add_anchor, cube, material, reset_scene, save_and_export

reset_scene()
glass = material("MAT_Sodra_DarkGlass", (0.03, 0.11, 0.12, 1), 0.35)
white = material("MAT_Sodra_WhiteFrame", (0.82, 0.86, 0.82, 1))
green = material("MAT_Sodra_Green", (0.12, 0.5, 0.24, 1))
roof = material("MAT_Sodra_Roof", (0.08, 0.1, 0.09, 1))

cube("LM_Sodra_Root", (0, 0, 0.9), (2.35, 0.42, 0.9), glass)
cube("LM_Sodra_RoofOverhang", (0, -0.02, 1.86), (2.55, 0.5, 0.08), roof)
cube("LM_Sodra_UpperPavilion", (0.72, -0.04, 2.22), (0.8, 0.34, 0.38), glass)
cube("LM_Sodra_GreenSign", (-1.92, -0.45, 1.18), (0.22, 0.03, 0.18), green)

for index in range(12):
    cube(f"LM_Sodra_Fin_{index}", (-2.15 + index * 0.39, -0.47, 0.95), (0.035, 0.045, 0.82), white)

add_anchor("Anchor_Hotspot", (0, -0.62, 0.95))
add_anchor("Anchor_Label", (0, -0.62, 2.75))
save_and_export("sodra", "LM_Sodra_Root")
