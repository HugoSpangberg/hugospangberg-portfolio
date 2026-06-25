from math import pi

import bpy

from common import add_anchor, collection, cone, cube, cylinder, material, reset_scene, save_and_export, sphere

reset_scene()
collection("COL_DasaForestry")

green = material("MAT_Dasa_HarvesterGreen", (0.15, 0.42, 0.31, 1), 0.62, 0.08)
dark = material("MAT_Dasa_BoomAndTyres", (0.025, 0.03, 0.03, 1), 0.52, 0.26)
glass = material("MAT_Dasa_DarkCabinGlass", (0.025, 0.12, 0.14, 1), 0.3, 0.12)
metal = material("MAT_Dasa_HydraulicMetal", (0.2, 0.24, 0.22, 1), 0.44, 0.45)
yellow = material("MAT_Dasa_HydraulicYellow", (0.76, 0.56, 0.18, 1), 0.52, 0.12)
wood = material("MAT_Dasa_CutLogs", (0.42, 0.27, 0.14, 1), 0.84)
cyan = material("MAT_Dasa_IoTSensorCyan", (0.2, 0.8, 0.9, 1), 0.3, emission=(0.08, 0.55, 0.72, 1), emission_strength=0.65)
pine = material("MAT_Dasa_PineNeedles", (0.17, 0.44, 0.34, 1), 0.86)
birch = material("MAT_Dasa_BirchTrunk", (0.78, 0.76, 0.67, 1), 0.82)
forest_floor = material("MAT_Dasa_ForestFloor", (0.15, 0.29, 0.22, 1), 0.92)

cube("LM_Dasa_Root", (0, 0, 0.13), (1.95, 1.15, 0.08), forest_floor, 0.025)
cube("LM_Dasa_HarvesterRearBody", (-0.36, 0, 0.62), (0.66, 0.42, 0.34), green, 0.035)
cube("LM_Dasa_HarvesterFrontBody", (0.42, 0, 0.58), (0.52, 0.4, 0.3), green, 0.035)
cube("LM_Dasa_ArticulatedJoint", (0.04, 0, 0.52), (0.16, 0.3, 0.2), dark, 0.018)
cube("LM_Dasa_Cabin", (-0.48, -0.03, 1.0), (0.36, 0.34, 0.34), glass, 0.018)

for side, y in [("L", -0.34), ("R", 0.34)]:
    for index, x in enumerate([-0.76, -0.38, 0.28, 0.66]):
        wheel = cylinder(f"LM_Dasa_Wheel_{side}_{index}", (x, y, 0.3), 0.17, 0.11, dark, 24, (pi / 2, 0, 0), 0.006)
        wheel.scale.x = 1.0
        cylinder(f"LM_Dasa_WheelHub_{side}_{index}", (x, y + (-0.06 if y < 0 else 0.06), 0.3), 0.06, 0.02, metal, 16, (pi / 2, 0, 0), 0.002)

cube("LM_Dasa_Boom_Base", (0.72, -0.02, 0.98), (0.54, 0.07, 0.07), dark, 0.012)
cube("LM_Dasa_Boom_Arm", (1.08, -0.02, 0.78), (0.52, 0.065, 0.065), dark, 0.012)
cube("LM_Dasa_Boom_Forearm", (1.34, -0.02, 0.52), (0.08, 0.065, 0.42), dark, 0.012)
cube("LM_Dasa_HydraulicCylinder_A", (0.88, -0.09, 0.85), (0.42, 0.025, 0.025), metal, 0.004)
cube("LM_Dasa_HydraulicCylinder_B", (1.18, 0.08, 0.64), (0.3, 0.023, 0.023), yellow, 0.004)
cube("LM_Dasa_HarvesterHead", (1.36, -0.02, 0.28), (0.26, 0.16, 0.18), dark, 0.012)
cube("LM_Dasa_HarvesterHead_LeftGrip", (1.21, -0.15, 0.26), (0.06, 0.18, 0.05), dark, 0.006)
cube("LM_Dasa_HarvesterHead_RightGrip", (1.21, 0.15, 0.26), (0.06, 0.18, 0.05), dark, 0.006)
cylinder("LM_Dasa_FeedRoller_A", (1.42, -0.08, 0.29), 0.045, 0.08, metal, 14, (pi / 2, 0, 0), 0.002)
cylinder("LM_Dasa_FeedRoller_B", (1.42, 0.08, 0.29), 0.045, 0.08, metal, 14, (pi / 2, 0, 0), 0.002)
sphere("LM_Dasa_IoTSensor", (-0.5, -0.34, 1.28), 0.055, cyan, 16)

for index, x in enumerate([-1.12, -0.78, -0.44]):
    cylinder(f"LM_Dasa_CutLog_{index}", (x, -0.55, 0.2), 0.055, 0.34, wood, 14, (0, pi / 2, 0), 0.004)
cylinder("LM_Dasa_Stump", (-1.26, 0.42, 0.2), 0.11, 0.16, wood, 12, (0, 0, 0), 0.004)

for index, (x, y, s, kind) in enumerate([(-1.35, 0.15, 0.72, "pine"), (-0.95, 0.62, 0.58, "birch"), (1.34, 0.48, 0.64, "pine"), (1.05, -0.58, 0.52, "pine")]):
    trunk_mat = birch if kind == "birch" else wood
    cylinder(f"LM_Dasa_TreeTrunk_{index}", (x, y, 0.42 * s), 0.04 * s, 0.72 * s, trunk_mat, 8, (0, 0, 0), 0.004)
    cone(f"LM_Dasa_TreeCrown_{index}_Lower", (x, y, 0.88 * s), 0.22 * s, 0.05 * s, 0.44 * s, pine, 7)
    cone(f"LM_Dasa_TreeCrown_{index}_Upper", (x, y, 1.15 * s), 0.16 * s, 0.02 * s, 0.36 * s, pine, 7)

# Optional subtle GLB animation for runtime mixers.
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 120
boom = bpy.data.objects["LM_Dasa_Boom_Base"]
boom.keyframe_insert(data_path="rotation_euler", frame=1)
boom.rotation_euler[1] = 0.045
boom.keyframe_insert(data_path="rotation_euler", frame=60)
boom.rotation_euler[1] = 0
boom.keyframe_insert(data_path="rotation_euler", frame=120)
if bpy.data.actions:
    bpy.data.actions[-1].name = "Dasa_BoomIdle"

add_anchor("Anchor_Hotspot", (0, -0.7, 0.78))
add_anchor("Anchor_Label", (0, -0.7, 1.88))
add_anchor("Anchor_Light", (-0.45, -0.46, 1.24))
add_anchor("Anchor_CameraFocus", (0.18, -0.08, 0.72))
save_and_export("dasa-forestry", "LM_Dasa_Root", ["LM_Dasa_Root", "Anchor_Hotspot", "Anchor_Label", "Anchor_Light"])
