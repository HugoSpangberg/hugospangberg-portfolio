from common import add_anchor, cube, material, reset_scene, save_and_export

reset_scene()
brick = material("MAT_Education_Brick", (0.55, 0.16, 0.1, 1))
stone = material("MAT_Education_Stone", (0.62, 0.58, 0.5, 1))
glass = material("MAT_Education_Window", (0.06, 0.12, 0.15, 1), 0.34)
warm = material("MAT_Education_WarmEntrance", (0.9, 0.55, 0.22, 1), 0.45)

cube("LM_Education_Root", (0, 0, 1.0), (2.25, 0.38, 1.0), brick)
cube("LM_Education_StoneBase", (0, -0.01, 0.18), (2.38, 0.42, 0.18), stone)
cube("LM_Education_CentralBay", (0, -0.38, 1.03), (0.48, 0.18, 1.05), brick)
cube("LM_Education_ArchedEntrance", (0, -0.49, 0.43), (0.3, 0.04, 0.38), warm)

for row in range(3):
    for col in range(6):
        x = -1.72 + col * 0.69
        if abs(x) < 0.25:
            continue
        cube(f"LM_Education_Window_{row}_{col}", (x, -0.41, 0.62 + row * 0.42), (0.12, 0.03, 0.16), glass)

add_anchor("Anchor_Hotspot", (0, -0.62, 0.85))
add_anchor("Anchor_Label", (0, -0.62, 2.3))
save_and_export("education", "LM_Education_Root")
