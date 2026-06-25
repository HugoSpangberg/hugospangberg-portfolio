from __future__ import annotations

from blender_common import add_anchor, collection, cube, cylinder, empty_root, prism_mesh, reset_scene, save_and_export
from geometry_helpers import birch_tree, embedded_path, log, pine_tree, rock
from materials import career_materials

reset_scene()
collection("COL_CareerWorldEnvironment")
mat = career_materials()
root = empty_root("ENV_CareerWorld_Root")

island = [
    (-3.45, -0.35),
    (-3.05, -1.45),
    (-2.1, -2.15),
    (-0.72, -2.38),
    (0.75, -2.18),
    (2.35, -1.78),
    (3.22, -0.85),
    (3.42, 0.42),
    (2.72, 1.42),
    (1.24, 2.08),
    (-0.4, 2.25),
    (-1.95, 1.82),
    (-3.08, 0.92),
]
lower = [(x * 0.9, y * 0.88) for x, y in island]
prism_mesh("ENV_FloatingIsland_Topography", island, -0.18, 0.08, mat["forest_ground"], root, 0.08)
prism_mesh("ENV_FloatingIsland_LayeredEdge", lower, -0.52, -0.2, mat["moss"], root, 0.07)

for name, x, y, sx, sy in [
    ("ENV_MossPatch_Visma", -2.05, 0.15, 0.78, 0.42),
    ("ENV_MossPatch_Sodra", -1.1, -1.28, 0.9, 0.5),
    ("ENV_MossPatch_Dasa", 1.45, -0.92, 0.86, 0.5),
    ("ENV_MossPatch_Education", 1.76, 0.9, 0.8, 0.44),
    ("ENV_MossPatch_Filmstaden", 0.1, 1.35, 0.92, 0.5),
]:
    cube(name, (x, y, 0.105), (sx, sy, 0.018), mat["grass"], 0.018, root)

anchors = {
    "Anchor_Filmstaden": (0.1, 1.45, 0.13),
    "Anchor_Visma": (-2.1, 0.06, 0.13),
    "Anchor_Sodra": (-1.1, -1.35, 0.13),
    "Anchor_Dasa": (1.45, -0.95, 0.13),
    "Anchor_Education": (1.75, 0.9, 0.13),
    "Anchor_CareerHub": (0.02, -0.18, 0.26),
}
for name, location in anchors.items():
    add_anchor(name, location, root)

hub = (0.02, -0.18)
for name, target, bend in [
    ("ENV_Path_To_Filmstaden", (0.1, 1.14), (0.0, 0.55)),
    ("ENV_Path_To_Visma", (-1.72, 0.04), (-0.82, -0.12)),
    ("ENV_Path_To_Sodra", (-0.92, -1.08), (-0.46, -0.58)),
    ("ENV_Path_To_Dasa", (1.2, -0.82), (0.7, -0.55)),
    ("ENV_Path_To_Education", (1.45, 0.72), (0.8, 0.25)),
]:
    embedded_path(name, [hub, bend, target], 0.15, mat["path"], root)

cube("ENV_CareerHub_Platform", (0.02, -0.18, 0.19), (0.34, 0.28, 0.045), mat["metal_dark"], 0.018, root)
cylinder("ENV_CareerHub_CyanCore", (0.02, -0.18, 0.37), 0.105, 0.24, mat["cyan"], 18, root=root)
cylinder("ENV_CareerHub_OuterRing", (0.02, -0.18, 0.275), 0.24, 0.025, mat["metal_mid"], 28, root=root)
for index, (x, y) in enumerate([(0.28, -0.18), (-0.22, -0.18), (0.02, 0.1), (0.02, -0.46)]):
    cube(f"ENV_CareerHub_ConnectionPoint_{index}", (x, y, 0.2), (0.045, 0.045, 0.025), mat["cyan"], 0.004, root)

tree_positions = [
    (-3.0, -0.48, 0.72), (-2.62, 1.1, 0.62), (-2.42, -1.12, 0.48),
    (-0.7, -1.95, 0.52), (0.72, -1.86, 0.42), (2.45, -1.42, 0.6),
    (2.72, 0.38, 0.5), (2.05, 1.42, 0.45), (0.95, 1.86, 0.42),
]
for index, (x, y, scale) in enumerate(tree_positions):
    pine_tree(f"ENV_PineCluster_{index}", x, y, scale, mat["wood"], mat["grass"], root)
for index, (x, y, scale) in enumerate([(-1.55, 1.55, 0.5), (1.05, -1.4, 0.44), (2.18, 0.98, 0.38)]):
    birch_tree(f"ENV_BirchCluster_{index}", x, y, scale, mat["birch"], mat["moss"], root)
for index, (x, y, scale) in enumerate([(-2.35, -1.58, 0.08), (-1.58, 1.48, 0.07), (1.05, -1.62, 0.065), (2.35, 0.42, 0.075), (0.35, 1.72, 0.055)]):
    rock(f"ENV_GroundedRock_{index}", x, y, 0.11, scale, mat["stone"], root)
for index, (x, y, rz) in enumerate([(1.95, -1.18, 0.2), (1.72, -1.34, -0.15), (-2.65, -0.95, 0.6)]):
    log(f"ENV_FallenLog_{index}", x, y, 0.12, 0.36, 0.035, mat["wood"], root, rz)

save_and_export(
    "career-world-environment",
    "ENV_CareerWorld_Root",
    ["ENV_CareerWorld_Root", "Anchor_Filmstaden", "Anchor_Visma", "Anchor_Sodra", "Anchor_Dasa", "Anchor_Education", "Anchor_CareerHub"],
)
