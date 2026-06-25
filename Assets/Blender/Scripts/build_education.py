from common import add_anchor, collection, cone, cube, material, reset_scene, save_and_export

reset_scene()
collection("COL_Education")

brick = material("MAT_Education_RedBrick", (0.55, 0.2, 0.14, 1), 0.88)
brick_dark = material("MAT_Education_DarkBrickDetails", (0.34, 0.12, 0.1, 1), 0.9)
stone = material("MAT_Education_StoneBase", (0.58, 0.56, 0.5, 1), 0.86)
glass = material("MAT_Education_TallWindowGlass", (0.055, 0.13, 0.15, 1), 0.34, 0.1)
warm = material("MAT_Education_WarmInterior", (0.92, 0.64, 0.32, 1), 0.45, emission=(0.9, 0.42, 0.12, 1), emission_strength=0.46)
violet = material("MAT_Education_LearningAccent", (0.62, 0.48, 0.95, 1), 0.5, emission=(0.32, 0.18, 0.7, 1), emission_strength=0.26)

cube("LM_Education_Root", (0, 0, 1.02), (2.25, 0.38, 1.02), brick, 0.03)
cube("LM_Education_LeftWing", (-1.44, 0.03, 0.82), (0.58, 0.33, 0.82), brick, 0.026)
cube("LM_Education_RightWing", (1.44, 0.03, 0.82), (0.58, 0.33, 0.82), brick, 0.026)
cube("LM_Education_StoneBase", (0, -0.01, 0.18), (2.95, 0.42, 0.18), stone, 0.018)
cube("LM_Education_CentralProjectedEntrance", (0, -0.38, 0.98), (0.56, 0.18, 1.0), brick, 0.024)
cube("LM_Education_ArchedDoor_Base", (0, -0.495, 0.43), (0.28, 0.045, 0.32), warm, 0.01)
cone("LM_Education_ArchedDoor_Crown", (0, -0.495, 0.62), 0.16, 0.02, 0.2, warm, 24)
cube("LM_Education_DecorativeRoofline", (0, -0.02, 2.13), (2.55, 0.42, 0.08), brick_dark, 0.012)
cube("LM_Education_CentralRoofCrown", (0, -0.03, 2.28), (0.64, 0.42, 0.16), brick_dark, 0.012)

for row in range(3):
    for col in range(7):
        x = -1.82 + col * 0.61
        if abs(x) < 0.22:
            continue
        cube(f"LM_Education_TallWindowFrame_{row}_{col}", (x, -0.41, 0.64 + row * 0.42), (0.14, 0.032, 0.18), stone, 0.004)
        cube(f"LM_Education_TallWindowGlass_{row}_{col}", (x, -0.435, 0.64 + row * 0.42), (0.1, 0.012, 0.14), glass if row != 0 else warm, 0.002)

cube("LM_Education_FrontPath", (0, -0.82, 0.09), (0.46, 0.62, 0.035), stone, 0.006)
cube("LM_Education_VioletLearningAccent", (0.48, -0.47, 1.42), (0.12, 0.018, 0.12), violet, 0.004)

add_anchor("Anchor_Hotspot", (0, -0.78, 0.85))
add_anchor("Anchor_Label", (0, -0.78, 2.36))
add_anchor("Anchor_Light", (0, -0.84, 0.66))
add_anchor("Anchor_CameraFocus", (0, -0.18, 1.06))
save_and_export("education", "LM_Education_Root", ["LM_Education_Root", "Anchor_Hotspot", "Anchor_Label", "Anchor_Light"])
