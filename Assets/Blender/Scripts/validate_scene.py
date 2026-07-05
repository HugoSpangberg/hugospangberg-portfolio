from __future__ import annotations

import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from common import REPORTS, RUNTIME_MODELS

manifest_path = RUNTIME_MODELS / "manifest.json"
if not manifest_path.exists():
    raise SystemExit("Missing HSClient/public/models/career-world/manifest.json. Run npm run models:export first.")

manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
errors: list[str] = []

environment = manifest.get("environment")
if not environment:
    errors.append("Manifest is missing environment entry.")
else:
    model_path = RUNTIME_MODELS / environment["file"]
    if not model_path.exists():
        errors.append(f"Missing environment GLB: {environment['file']}")
    for node in environment.get("requiredNodes", []):
        if node not in environment.get("stats", {}).get("objects", []):
            errors.append(f"Environment missing required node {node}")

for landmark in manifest.get("landmarks", []):
    model_path = RUNTIME_MODELS / landmark["file"]
    if not model_path.exists():
        errors.append(f"Missing landmark GLB: {landmark['file']}")
    stats = landmark.get("stats", {})
    for node in landmark.get("requiredNodes", []):
        if node not in stats.get("objects", []):
            errors.append(f"{landmark['id']} missing required node {node}")
    if landmark.get("rootNode") not in stats.get("objects", []):
        errors.append(f"{landmark['id']} missing root node {landmark.get('rootNode')}")
    if stats.get("triangleCount", 0) <= 0:
        errors.append(f"{landmark['id']} has no triangles")

if errors:
    raise SystemExit("\n".join(errors))

(REPORTS / "validation-result.json").write_text(
    json.dumps({"ok": True, "validated": len(manifest.get("landmarks", [])) + 1}, indent=2),
    encoding="utf-8",
)
print("Career world Blender model validation passed.")
