from common import add_anchor, cube, material, reset_scene, save_and_export

reset_scene()
brick = material("MAT_Brick_RedBrown", (0.47, 0.18, 0.12, 1))
marquee = material("MAT_Filmstaden_Red", (0.72, 0.04, 0.04, 1))
glass = material("MAT_Dark_Glass", (0.03, 0.08, 0.09, 1), 0.28)
stone = material("MAT_Light_Stone", (0.72, 0.66, 0.55, 1))

cube("LM_Filmstaden_Root", (0, 0, 1.1), (2.8, 0.35, 1.1), brick)
cube("LM_Filmstaden_StoneBase", (0, -0.01, 0.18), (2.95, 0.38, 0.18), stone)
cube("LM_Filmstaden_CurvedMarquee", (0, -0.48, 0.82), (1.35, 0.36, 0.18), marquee)
cube("LM_Filmstaden_Doors", (0, -0.51, 0.42), (0.62, 0.04, 0.42), glass)

for row in range(2):
    for col in range(7):
        cube(f"LM_Filmstaden_Window_{row}_{col}", (-2.1 + col * 0.7, -0.37, 1.18 + row * 0.42), (0.18, 0.03, 0.12), glass)

add_anchor("Anchor_Hotspot", (0, -0.6, 0.8))
add_anchor("Anchor_Label", (0, -0.6, 2.45))
save_and_export("filmstaden", "LM_Filmstaden_Root")
