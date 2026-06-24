from common import add_anchor, cube, material, reset_scene, save_and_export

reset_scene()
white = material("MAT_White_Facade", (0.86, 0.86, 0.82, 1))
orange = material("MAT_Visma_Orange", (0.83, 0.32, 0.12, 1))
glass = material("MAT_Cool_Glass", (0.05, 0.18, 0.22, 1), 0.32)
dark = material("MAT_Dark_Roofline", (0.05, 0.06, 0.06, 1))

cube("LM_Visma_Root", (0, 0, 1.0), (1.0, 0.42, 1.0), orange)
cube("LM_Visma_LeftWing", (-1.2, 0, 0.9), (1.1, 0.38, 0.9), white)
cube("LM_Visma_RightWing", (1.2, 0, 0.9), (1.1, 0.38, 0.9), white)
cube("LM_Visma_Roofline", (0, -0.02, 1.95), (2.45, 0.44, 0.08), dark)
cube("LM_Visma_GlassEntrance", (0, -0.43, 0.48), (0.42, 0.04, 0.48), glass)

for side, x0 in [("L", -1.2), ("R", 1.2)]:
    for row in range(3):
        for col in range(3):
            cube(f"LM_Visma_Window_{side}_{row}_{col}", (x0 - 0.42 + col * 0.42, -0.41, 0.72 + row * 0.42), (0.11, 0.03, 0.1), glass)

add_anchor("Anchor_Hotspot", (0, -0.56, 0.8))
add_anchor("Anchor_Label", (0, -0.56, 2.25))
save_and_export("visma", "LM_Visma_Root")
