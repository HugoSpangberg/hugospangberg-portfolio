#!/usr/bin/env bash
set -euo pipefail

blender="$(Scripts/resolve-blender.sh)"
"${blender}" --background --python Assets/Blender/Scripts/export_all.py
"${blender}" --background --python Assets/Blender/Scripts/export_updated_landmarks.py
