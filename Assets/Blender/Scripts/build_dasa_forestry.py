from common import add_anchor, cube, material, reset_scene, save_and_export

reset_scene()
green = material("MAT_ForestMachine_Green", (0.15, 0.42, 0.21, 1))
dark = material("MAT_ForestMachine_Dark", (0.03, 0.04, 0.04, 1))
glass = material("MAT_Cabin_Glass", (0.03, 0.16, 0.18, 1), 0.3)
wood = material("MAT_CutLogs", (0.42, 0.26, 0.13, 1))
cyan = material("MAT_IoT_Cyan", (0.1, 0.82, 0.9, 1), 0.24)

cube("LM_DasaForestry_Root", (0, 0, 0.62), (0.95, 0.42, 0.38), green)
cube("LM_DasaForestry_Cabin", (-0.42, -0.04, 1.02), (0.34, 0.36, 0.34), glass)
cube("LM_DasaForestry_Boom_A", (0.65, -0.02, 1.04), (0.72, 0.08, 0.08), dark)
cube("LM_DasaForestry_Boom_B", (1.24, -0.02, 0.72), (0.08, 0.08, 0.54), dark)
cube("LM_DasaForestry_Head", (1.24, -0.02, 0.28), (0.28, 0.16, 0.18), dark)
cube("LM_DasaForestry_IoTSensor", (-0.42, -0.42, 1.35), (0.08, 0.03, 0.08), cyan)

for index, x in enumerate([-0.72, -0.28, 0.28, 0.72]):
    cube(f"LM_DasaForestry_Wheel_{index}", (x, -0.43, 0.28), (0.17, 0.08, 0.17), dark)
    cube(f"LM_DasaForestry_Wheel_Back_{index}", (x, 0.33, 0.28), (0.17, 0.08, 0.17), dark)

for index in range(4):
    cube(f"LM_DasaForestry_Log_{index}", (-1.4 + index * 0.32, -0.5, 0.12), (0.22, 0.08, 0.08), wood)

add_anchor("Anchor_Hotspot", (0, -0.72, 0.7))
add_anchor("Anchor_Label", (0, -0.72, 1.85))
save_and_export("dasa-forestry", "LM_DasaForestry_Root")
