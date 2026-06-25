from __future__ import annotations

import json
import runpy
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from common import REPORTS, RUNTIME_MODELS

BUILDERS = [
    ("environment", "build_environment.py"),
    ("filmstaden", "build_filmstaden.py"),
    ("visma", "build_visma.py"),
    ("sodra", "build_sodra.py"),
    ("dasa", "build_dasa_forestry.py"),
    ("education", "build_education.py"),
]

reports = {}
for asset_id, script in BUILDERS:
    runpy.run_path(str(SCRIPT_DIR / script), run_name="__main__")
    report_id = {
        "environment": "career-world-environment",
        "dasa": "dasa-forestry",
    }.get(asset_id, asset_id)
    report_path = REPORTS / f"{report_id}.json"
    reports[asset_id] = json.loads(report_path.read_text(encoding="utf-8"))

manifest = {
    "version": 1,
    "generatedBy": "Assets/Blender/Scripts/export_all.py",
    "fallback": "procedural",
    "environment": {
        "file": "career-world-environment.glb",
        "requiredNodes": [
            "Anchor_Filmstaden",
            "Anchor_Visma",
            "Anchor_Sodra",
            "Anchor_Dasa",
            "Anchor_Education",
            "Anchor_CareerHub",
        ],
        "stats": reports["environment"],
    },
    "landmarks": [
        {
            "id": "filmstaden",
            "file": "filmstaden.glb",
            "rootNode": "LM_Filmstaden_Root",
            "requiredNodes": ["Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"],
            "animations": [],
            "stats": reports["filmstaden"],
        },
        {
            "id": "visma",
            "file": "visma.glb",
            "rootNode": "LM_Visma_Root",
            "requiredNodes": ["Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"],
            "animations": [],
            "stats": reports["visma"],
        },
        {
            "id": "sodra",
            "file": "sodra.glb",
            "rootNode": "LM_Sodra_Root",
            "requiredNodes": ["Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"],
            "animations": [],
            "stats": reports["sodra"],
        },
        {
            "id": "dasa",
            "file": "dasa-forestry.glb",
            "rootNode": "LM_Dasa_Root",
            "requiredNodes": ["Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"],
            "animations": ["Dasa_BoomIdle"],
            "stats": reports["dasa"],
        },
        {
            "id": "education",
            "file": "education.glb",
            "rootNode": "LM_Education_Root",
            "requiredNodes": ["Anchor_Hotspot", "Anchor_Label", "Anchor_Light", "Anchor_CameraFocus"],
            "animations": [],
            "stats": reports["education"],
        },
    ],
}

RUNTIME_MODELS.mkdir(parents=True, exist_ok=True)
(RUNTIME_MODELS / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
(REPORTS / "model-report.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print(f"Exported {len(BUILDERS)} career-world Blender assets.")
