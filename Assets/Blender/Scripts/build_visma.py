from common import add_anchor, collection, cone, cube, material, reset_scene, save_and_export

reset_scene()
collection("COL_Visma")

white = material("MAT_Visma_MutedWhiteFacade", (0.84, 0.86, 0.82, 1), 0.78)
orange = material("MAT_Visma_OrangeCore", (0.77, 0.31, 0.13, 1), 0.82)
glass = material("MAT_Visma_CoolGlass", (0.055, 0.18, 0.21, 1), 0.32, 0.1, emission=(0.04, 0.32, 0.38, 1), emission_strength=0.16)
dark = material("MAT_Visma_DarkRoofline", (0.045, 0.055, 0.05, 1), 0.66)
cyan = material("MAT_Visma_SubtleCyanWindows", (0.38, 0.76, 0.84, 1), 0.4, emission=(0.12, 0.44, 0.52, 1), emission_strength=0.28)
tree = material("MAT_Visma_FrontTreeGreen", (0.25, 0.54, 0.4, 1), 0.84)
trunk = material("MAT_Visma_FrontTreeTrunk", (0.45, 0.36, 0.22, 1), 0.88)

cube("LM_Visma_Root", (0, 0, 0.98), (0.84, 0.42, 0.98), orange, 0.03)
cube("LM_Visma_LeftWing", (-1.18, 0, 0.88), (1.12, 0.38, 0.88), white, 0.026)
cube("LM_Visma_RightWing", (1.18, 0, 0.88), (1.12, 0.38, 0.88), white, 0.026)
cube("LM_Visma_DarkFlatRoofline", (0, -0.02, 1.86), (2.55, 0.44, 0.08), dark, 0.012)
cube("LM_Visma_GlassEntranceAtrium", (0, -0.43, 0.58), (0.46, 0.045, 0.58), glass, 0.01)
cube("LM_Visma_EntranceCanopy", (0, -0.58, 0.84), (0.68, 0.16, 0.04), dark, 0.008)
cube("LM_Visma_FrontSteps", (0, -0.64, 0.13), (0.72, 0.18, 0.06), white, 0.006)
cube("LM_Visma_SignPlate", (0, -0.47, 1.28), (0.36, 0.025, 0.09), white, 0.004)
cube("LM_Visma_SignAccent", (0.18, -0.49, 1.28), (0.045, 0.012, 0.045), orange, 0.003)

for side, x0 in [("L", -1.18), ("R", 1.18)]:
    for row in range(3):
        for col in range(4):
            cube(f"LM_Visma_Window_{side}_{row}_{col}", (x0 - 0.48 + col * 0.32, -0.405, 0.64 + row * 0.38), (0.09, 0.024, 0.1), cyan if (row + col) % 3 else glass, 0.004)

for index, x in enumerate([-1.68, 1.68]):
    cube(f"LM_Visma_FrontTree_Trunk_{index}", (x, -0.52, 0.22), (0.04, 0.04, 0.18), trunk, 0.004)
    cone(f"LM_Visma_FrontTree_Crown_{index}", (x, -0.52, 0.48), 0.18, 0.06, 0.38, tree)

add_anchor("Anchor_Hotspot", (0, -0.72, 0.8))
add_anchor("Anchor_Label", (0, -0.72, 2.28))
add_anchor("Anchor_Light", (0, -0.62, 0.72))
add_anchor("Anchor_CameraFocus", (0, -0.2, 1.0))
save_and_export("visma", "LM_Visma_Root", ["LM_Visma_Root", "Anchor_Hotspot", "Anchor_Label", "Anchor_Light"])
