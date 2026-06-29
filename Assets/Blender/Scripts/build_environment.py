from __future__ import annotations

from math import atan2
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parent))

from blender_common import add_anchor, collection, cube, cylinder, empty_root, prism_mesh, reset_scene, save_and_export
from geometry_helpers import birch_tree, embedded_path, log, pine_tree, rock
from materials import career_materials

reset_scene()
collection("COL_CareerWorldEnvironment")
mat = career_materials()
root = empty_root("ENV_CareerWorld_Root")

island = [
    (-5.65, -0.38),
    (-5.25, -1.82),
    (-4.38, -2.82),
    (-3.05, -3.36),
    (-1.36, -3.55),
    (0.32, -3.34),
    (1.82, -3.62),
    (3.52, -3.34),
    (4.92, -2.62),
    (5.68, -1.38),
    (5.86, 0.18),
    (5.36, 1.56),
    (4.22, 2.64),
    (2.62, 3.26),
    (0.96, 3.58),
    (-0.84, 3.48),
    (-2.72, 3.22),
    (-4.36, 2.38),
    (-5.42, 1.12),
]
lower = [(x * 0.93, y * 0.9) for x, y in island]
lower_mid = [(x * 0.78, y * 0.74) for x, y in island]
lower_core = [(x * 0.52, y * 0.48) for x, y in island]
prism_mesh("ENV_FloatingIsland_Topography", island, -0.18, 0.08, mat["forest_ground"], root, 0.08)
prism_mesh("ENV_FloatingIsland_LayeredEdge", lower, -0.52, -0.2, mat["moss"], root, 0.07)
prism_mesh("ENV_FloatingIsland_EarthStrata_Mid", lower_mid, -0.78, -0.54, mat["forest_ground"], root, 0.055)
prism_mesh("ENV_FloatingIsland_ShadowedRootMass", lower_core, -1.02, -0.80, mat["stone"], root, 0.05)

for index in range(0, len(island), 2):
    x1, y1 = island[index]
    x2, y2 = island[(index + 1) % len(island)]
    mid_x = (x1 + x2) * 0.47
    mid_y = (y1 + y2) * 0.47
    length = (((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5) * 0.32
    rib = cube(
        f"ENV_FloatingIsland_EdgeStrata_Rib_{index:02d}",
        (mid_x, mid_y, -0.38 - (index % 3) * 0.035),
        (max(length, 0.22), 0.045, 0.055),
        mat["stone"] if index % 4 == 0 else mat["moss"],
        0.012,
        root,
    )
    rib.rotation_euler[2] = atan2(y2 - y1, x2 - x1)

zones = {
    "ENV_UrbanStoneZone_Filmstaden": (mat["stone"], [(-0.55, 1.98), (0.08, 2.86), (1.10, 3.10), (2.02, 2.58), (1.72, 1.74), (0.52, 1.54)]),
    "ENV_OpenGreenZone_Sodra": (mat["moss"], [(-4.72, 1.18), (-4.10, 2.62), (-2.78, 2.88), (-1.72, 2.10), (-2.28, 0.92), (-3.72, 0.72)]),
    "ENV_OfficeLawnZone_Visma": (mat["grass"], [(-4.45, -2.62), (-3.42, -1.18), (-2.10, -1.04), (-1.42, -2.18), (-2.24, -3.08), (-3.58, -3.14)]),
    "ENV_ForestFloorZone_Dasa": (mat["forest_ground"], [(2.02, -2.92), (2.48, -1.24), (4.12, -0.94), (4.86, -2.18), (3.92, -3.08)]),
    "ENV_SchoolMossZone_Education": (mat["grass"], [(2.70, 0.52), (3.26, 1.92), (4.44, 2.10), (5.00, 1.02), (4.32, 0.18)]),
}
for name, (zone_mat, points) in zones.items():
    prism_mesh(name, points, 0.081, 0.088, zone_mat, root, 0.004)

for name, zone_mat, points in [
    ("ENV_CentralMeadow_MossRise", mat["moss"], [(-1.12, -0.48), (-0.38, 0.24), (0.48, 0.18), (1.04, -0.42), (0.44, -1.04), (-0.62, -0.98)]),
    ("ENV_Filmstaden_Forecourt_DarkPaving", mat["stone"], [(0.06, 1.78), (1.34, 1.82), (1.62, 2.32), (0.48, 2.72), (-0.28, 2.30)]),
    ("ENV_Sodra_Entrance_LawnApron", mat["grass"], [(-3.98, 1.36), (-3.08, 2.44), (-2.12, 2.12), (-2.28, 1.26), (-3.34, 1.04)]),
]:
    prism_mesh(name, points, 0.089, 0.096, zone_mat, root, 0.004)

anchors = {
    "Anchor_Filmstaden": (0.72, 2.42, 0.13),
    "Anchor_Sodra": (-3.28, 1.92, 0.13),
    "Anchor_Visma": (-3.12, -2.08, 0.13),
    "Anchor_Dasa": (3.32, -2.12, 0.13),
    "Anchor_Education": (3.92, 1.12, 0.13),
    "Anchor_CareerHub": (0.0, -0.16, 0.26),
}
for name, location in anchors.items():
    add_anchor(name, location, root)

hub = (0.0, -0.16)
for name, points in [
    ("ENV_Path_To_Filmstaden", [hub, (0.24, 0.54), (0.16, 1.34), (0.62, 2.02)]),
    ("ENV_Path_To_Sodra", [hub, (-0.76, 0.22), (-1.74, 1.12), (-2.72, 1.62)]),
    ("ENV_Path_To_Visma", [hub, (-0.82, -0.62), (-1.78, -1.48), (-2.64, -1.90)]),
    ("ENV_Path_To_Dasa", [hub, (0.86, -0.58), (1.86, -1.28), (2.78, -1.82)]),
    ("ENV_Path_To_Education", [hub, (0.86, 0.38), (2.02, 0.70), (3.30, 0.94)]),
]:
    embedded_path(name, points, 0.092, mat["path"], root, 0.14 if name != "ENV_Path_To_Dasa" else 0.12)

for name, points, width in [
    ("ENV_Path_Sodra_To_Filmstaden", [(-2.28, 1.62), (-1.08, 2.08), (0.12, 2.14)], 0.075),
    ("ENV_Path_Dasa_ForestBranch", [(2.78, -1.82), (3.50, -2.58), (4.34, -2.72)], 0.07),
    ("ENV_Path_Education_Courtyard", [(3.30, 0.94), (3.86, 0.74), (4.36, 0.88)], 0.07),
]:
    embedded_path(name, points, 0.094, mat["path"], root, width)

cx, cy = hub
cylinder("ENV_CareerHub_HexBase", (cx, cy, 0.16), 0.24, 0.07, mat["metal_dark"], 6, root=root)
cylinder("ENV_CareerHub_InsetCyanCore", (cx, cy, 0.23), 0.105, 0.06, mat["cyan"], 24, root=root)
cylinder("ENV_CareerHub_ThinMetalRing", (cx, cy, 0.285), 0.205, 0.015, mat["metal_mid"], 32, root=root)
cylinder("ENV_CareerHub_GlassCap", (cx, cy, 0.335), 0.088, 0.038, mat["glass_cool"], 24, root=root)
for index, (x, y, rz) in enumerate([(0.23, -0.16, 0), (-0.18, 0.02, 0.55), (0.02, 0.06, 1.3), (-0.18, -0.34, -1.0), (0.23, -0.38, -0.62)]):
    port = cube(f"ENV_CareerHub_ConnectionPort_{index}", (x, y, 0.205), (0.075, 0.035, 0.022), mat["cyan"], 0.004, root)
    port.rotation_euler[2] = rz

tree_positions = [
    (-5.02, -0.72, 0.78), (-4.56, 1.24, 0.66), (-4.08, -2.28, 0.54),
    (-2.26, -3.08, 0.48), (-0.86, -3.04, 0.42), (2.18, -3.10, 0.50),
    (3.92, -2.88, 0.66), (4.86, -1.42, 0.58), (5.02, 0.66, 0.46),
    (4.46, 2.08, 0.42), (2.68, 2.82, 0.44), (-2.08, 2.82, 0.40),
]
for index, (x, y, scale) in enumerate(tree_positions):
    pine_tree(f"ENV_PineCluster_{index}", x, y, scale, mat["wood"], mat["grass"], root)
for index, (x, y, scale) in enumerate([(-3.92, 2.18, 0.50), (2.64, -2.52, 0.44), (4.48, 1.36, 0.38), (1.08, 2.92, 0.34)]):
    birch_tree(f"ENV_BirchCluster_{index}", x, y, scale, mat["birch"], mat["moss"], root)
for index, (x, y, scale) in enumerate([(-4.36, -2.72, 0.08), (-3.12, 2.66, 0.07), (2.72, -2.92, 0.065), (4.74, 0.42, 0.075), (0.36, 2.78, 0.055), (1.18, -2.92, 0.058)]):
    rock(f"ENV_GroundedRock_{index}", x, y, 0.11, scale, mat["stone"], root)
for index, (x, y, rz) in enumerate([(3.92, -2.42, 0.2), (3.56, -2.66, -0.15), (-4.12, -1.64, 0.6), (2.72, -2.98, 0.4)]):
    log(f"ENV_FallenLog_{index}", x, y, 0.12, 0.36, 0.035, mat["wood"], root, rz)

for index, (x, y, sx, sy) in enumerate([
    (-0.88, -0.26, 0.18, 0.045),
    (0.78, -0.70, 0.16, 0.04),
    (-1.92, 1.18, 0.22, 0.05),
    (2.22, 0.38, 0.18, 0.04),
    (-3.86, -2.24, 0.18, 0.045),
]):
    hedge = cube(f"ENV_LowGroundingVegetation_{index}", (x, y, 0.13), (sx, sy, 0.055), mat["moss"], 0.018, root)
    hedge.rotation_euler[2] = (index - 2) * 0.28

save_and_export(
    "career-world-environment",
    "ENV_CareerWorld_Root",
    ["ENV_CareerWorld_Root", "Anchor_Filmstaden", "Anchor_Visma", "Anchor_Sodra", "Anchor_Dasa", "Anchor_Education", "Anchor_CareerHub"],
)
