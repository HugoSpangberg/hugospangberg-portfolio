from math import pi

from common import add_anchor, collection, cone, cube, cylinder, material, reset_scene, save_and_export

reset_scene()
collection("COL_CareerWorldEnvironment")

terrain = material("MAT_Environment_DarkForestTerrain", (0.07, 0.22, 0.18, 1), 0.9)
edge = material("MAT_Environment_IslandEdge", (0.035, 0.1, 0.08, 1), 0.9)
path = material("MAT_Environment_MossPath", (0.22, 0.34, 0.29, 1), 0.86)
stone = material("MAT_Environment_Rocks", (0.38, 0.44, 0.4, 1), 0.88)
cyan = material("MAT_Environment_CareerHubCyan", (0.32, 0.8, 0.88, 1), 0.42, 0.12, emission=(0.08, 0.48, 0.62, 1), emission_strength=0.5)
dark = material("MAT_Environment_HubCharcoal", (0.06, 0.12, 0.1, 1), 0.7)
pine = material("MAT_Environment_Pine", (0.16, 0.42, 0.34, 1), 0.86)
trunk = material("MAT_Environment_Trunk", (0.42, 0.33, 0.2, 1), 0.9)

cube("ENV_FloatingIsland_Core", (0, 0, -0.26), (3.75, 2.55, 0.34), terrain, 0.18)
cube("ENV_FloatingIsland_LowerLayer", (0, 0, -0.62), (3.25, 2.05, 0.28), edge, 0.16)
cube("ENV_CareerHub_Base", (0.02, -0.18, 0.08), (0.36, 0.36, 0.08), dark, 0.025)
cylinder("ENV_CareerHub_Core", (0.02, -0.18, 0.32), 0.16, 0.22, cyan, 12, (0, 0, 0), 0.005)

anchors = {
    "Anchor_Filmstaden": (0.1, 1.45, 0.0),
    "Anchor_Visma": (-2.1, 0.06, 0.0),
    "Anchor_Sodra": (-1.1, -1.35, 0.0),
    "Anchor_Dasa": (1.45, -0.95, 0.0),
    "Anchor_Education": (1.75, 0.9, 0.0),
    "Anchor_CareerHub": (0.02, -0.18, 0.2),
}
for name, location in anchors.items():
    add_anchor(name, location)
    cube(f"ENV_Path_{name.replace('Anchor_', '')}", ((location[0] + 0.02) / 2, (location[1] - 0.18) / 2, 0.02), (0.04, max(abs(location[1] + 0.18), 0.35) / 2, 0.018), path, 0.004)

for index, (x, y, s) in enumerate([(-3.0, -0.5, 0.65), (-2.65, 1.05, 0.55), (-0.7, -1.95, 0.5), (2.5, -1.45, 0.55), (2.85, 0.35, 0.48), (0.9, 1.85, 0.45)]):
    cylinder(f"ENV_PineTrunk_{index}", (x, y, 0.24 * s), 0.035 * s, 0.5 * s, trunk, 7, (0, 0, 0), 0.002)
    cone(f"ENV_PineCrown_{index}_A", (x, y, 0.55 * s), 0.2 * s, 0.04 * s, 0.34 * s, pine, 7)
    cone(f"ENV_PineCrown_{index}_B", (x, y, 0.76 * s), 0.15 * s, 0.02 * s, 0.28 * s, pine, 7)

for index, (x, y, s) in enumerate([(-2.2, -1.6, 0.08), (-1.7, 1.55, 0.07), (0.9, -1.72, 0.06), (2.28, 0.42, 0.07)]):
    cylinder(f"ENV_Rock_{index}", (x, y, 0.05), s, 0.09, stone, 8, (pi / 2, 0, 0), 0.004)

save_and_export(
    "career-world-environment",
    "ENV_FloatingIsland_Core",
    ["Anchor_Filmstaden", "Anchor_Visma", "Anchor_Sodra", "Anchor_Dasa", "Anchor_Education", "Anchor_CareerHub"],
)
