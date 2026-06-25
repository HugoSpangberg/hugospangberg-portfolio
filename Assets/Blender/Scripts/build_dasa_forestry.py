from __future__ import annotations

from math import pi

import bpy

from blender_common import add_anchor, beam_between, collection, cube, cylinder, empty_root, reset_scene, save_and_export, sphere
from geometry_helpers import birch_tree, log, pine_tree, rock
from materials import career_materials

reset_scene()
collection("COL_DasaForestry")
mat = career_materials()
root = empty_root("LM_Dasa_Root")

cube("LM_Dasa_ForestGround", (0.14, 0, 0.08), (3.0, 1.18, 0.055), mat["forest_ground"], 0.018, root)

# Articulated chassis and body.
cube("LM_Dasa_RearChassisRail", (-0.48, 0, 0.42), (0.72, 0.26, 0.09), mat["machine_black"], 0.008, root)
cube("LM_Dasa_FrontChassisRail", (0.45, 0, 0.40), (0.68, 0.25, 0.085), mat["machine_black"], 0.008, root)
cylinder("LM_Dasa_ArticulatedCenterJoint", (-0.02, 0, 0.43), 0.105, 0.28, mat["metal_mid"], 18, (pi / 2, 0, 0), 0.004, root)
cube("LM_Dasa_RearEngineBody", (-0.54, 0, 0.72), (0.62, 0.34, 0.24), mat["machine_green"], 0.018, root)
cube("LM_Dasa_RearEngineHood", (-0.72, 0, 0.9), (0.34, 0.32, 0.12), mat["machine_green"], 0.012, root)
cube("LM_Dasa_FrontBody", (0.34, 0, 0.67), (0.56, 0.32, 0.23), mat["machine_green"], 0.018, root)

# Cabin with readable glass and roof/frame.
cube("LM_Dasa_CabinFrame", (-0.2, -0.02, 1.02), (0.34, 0.32, 0.32), mat["machine_black"], 0.012, root)
cube("LM_Dasa_CabinWindshield", (-0.2, -0.205, 1.02), (0.23, 0.018, 0.24), mat["glass_cool"], 0.004, root)
cube("LM_Dasa_CabinSideGlass_Left", (-0.38, -0.02, 1.02), (0.018, 0.22, 0.22), mat["glass_cool"], 0.004, root)
cube("LM_Dasa_CabinRoof", (-0.2, -0.02, 1.22), (0.39, 0.35, 0.055), mat["machine_black"], 0.006, root)
cube("LM_Dasa_CabinLightBar", (-0.2, -0.22, 1.27), (0.28, 0.035, 0.035), mat["metal_dark"], 0.003, root)

# Wheels with hubs and simplified tread blocks.
for side, y in [("Left", -0.34), ("Right", 0.34)]:
    for index, x in enumerate([-0.82, -0.46, 0.28, 0.66]):
        cylinder(f"LM_Dasa_Tire_{side}_{index}", (x, y, 0.28), 0.18, 0.13, mat["machine_black"], 28, (pi / 2, 0, 0), 0.004, root)
        cylinder(f"LM_Dasa_WheelHub_{side}_{index}", (x, y + (-0.073 if y < 0 else 0.073), 0.28), 0.072, 0.022, mat["metal_mid"], 18, (pi / 2, 0, 0), 0.002, root)
        for tread in range(4):
            cube(f"LM_Dasa_Tread_{side}_{index}_{tread}", (x + (tread - 1.5) * 0.055, y, 0.43), (0.018, 0.14, 0.028), mat["metal_dark"], 0.002, root)

# Connected hydraulic boom and head.
cube("LM_Dasa_BoomPedestal", (0.54, -0.02, 0.86), (0.16, 0.18, 0.18), mat["machine_black"], 0.01, root)
beam_between("LM_Dasa_Boom_SectionA", (0.58, -0.03, 0.95), (0.98, -0.03, 1.15), 0.065, mat["machine_black"], 0.006, root)
beam_between("LM_Dasa_Boom_SectionB", (0.98, -0.03, 1.15), (1.28, -0.03, 0.82), 0.058, mat["machine_black"], 0.006, root)
beam_between("LM_Dasa_Boom_SectionC", (1.28, -0.03, 0.82), (1.38, -0.03, 0.43), 0.052, mat["machine_black"], 0.006, root)
beam_between("LM_Dasa_HydraulicCylinder_Main", (0.62, -0.11, 0.88), (1.0, -0.11, 1.03), 0.018, mat["metal_mid"], 0.002, root)
beam_between("LM_Dasa_HydraulicCylinder_Yellow", (1.04, 0.08, 1.02), (1.28, 0.08, 0.76), 0.018, mat["window_warm"], 0.002, root)
beam_between("LM_Dasa_HoseBundle", (0.82, -0.13, 0.92), (1.36, -0.13, 0.44), 0.026, mat["machine_black"], 0.002, root)
cube("LM_Dasa_HarvesterHead_Frame", (1.4, -0.03, 0.29), (0.24, 0.16, 0.17), mat["machine_black"], 0.008, root)
cylinder("LM_Dasa_HarvesterHead_RollerA", (1.43, -0.1, 0.31), 0.045, 0.075, mat["metal_mid"], 14, (pi / 2, 0, 0), 0.001, root)
cylinder("LM_Dasa_HarvesterHead_RollerB", (1.43, 0.05, 0.31), 0.045, 0.075, mat["metal_mid"], 14, (pi / 2, 0, 0), 0.001, root)
cube("LM_Dasa_HarvesterHead_LeftGrip", (1.25, -0.16, 0.23), (0.055, 0.16, 0.045), mat["machine_black"], 0.004, root)
cube("LM_Dasa_HarvesterHead_RightGrip", (1.25, 0.12, 0.23), (0.055, 0.16, 0.045), mat["machine_black"], 0.004, root)

sphere("LM_Dasa_IoTSensor_Beacon", (-0.36, -0.26, 1.31), 0.045, mat["cyan"], 16, root)
cube("LM_Dasa_IoTSensor_Base", (-0.36, -0.26, 1.24), (0.07, 0.028, 0.035), mat["metal_dark"], 0.003, root)

for index, (x, y, scale) in enumerate([(-1.32, 0.34, 0.68), (-1.05, -0.43, 0.54), (1.15, 0.42, 0.58), (1.34, -0.4, 0.48)]):
    pine_tree(f"LM_Dasa_Pine_{index}", x, y, scale, mat["wood"], mat["grass"], root)
for index, (x, y, scale) in enumerate([(-1.48, -0.1, 0.5), (0.95, -0.44, 0.42)]):
    birch_tree(f"LM_Dasa_Birch_{index}", x, y, scale, mat["birch"], mat["moss"], root)
for index, x in enumerate([-1.05, -0.72, -0.38]):
    log(f"LM_Dasa_CutLog_{index}", x, -0.47, 0.1, 0.32, 0.045, mat["wood"], root, 0.08)
cylinder("LM_Dasa_Stump", (-1.24, 0.55, 0.16), 0.105, 0.16, mat["wood"], 12, root=root)
for index, (x, y, s) in enumerate([(-1.42, 0.02, 0.055), (1.22, 0.16, 0.05), (0.08, -0.72, 0.045)]):
    rock(f"LM_Dasa_GroundedRock_{index}", x, y, 0.08, s, mat["stone"], root)

bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 120
boom = bpy.data.objects["LM_Dasa_Boom_SectionA"]
base_rotation = boom.rotation_euler.copy()
boom.keyframe_insert(data_path="rotation_euler", frame=1)
boom.rotation_euler[1] = base_rotation[1] + 0.026
boom.keyframe_insert(data_path="rotation_euler", frame=60)
boom.rotation_euler = base_rotation
boom.keyframe_insert(data_path="rotation_euler", frame=120)
if bpy.data.actions:
    bpy.data.actions[-1].name = "Dasa_BoomIdle"

add_anchor("Anchor_Hotspot", (0, -0.7, 0.78), root)
add_anchor("Anchor_Label", (0, -0.7, 1.88), root)
add_anchor("Anchor_Light", (-0.45, -0.46, 1.24), root)
add_anchor("Anchor_CameraFocus", (0.18, -0.08, 0.72), root)
save_and_export("dasa-forestry", "LM_Dasa_Root", ["LM_Dasa_Root", "Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"])
