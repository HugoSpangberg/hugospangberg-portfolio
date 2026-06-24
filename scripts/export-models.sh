#!/usr/bin/env bash
set -euo pipefail

if ! command -v blender >/dev/null 2>&1; then
  echo "Blender CLI is not installed. Install Blender and run this script again to generate .blend and .glb files." >&2
  exit 127
fi

blender --background --python Assets/Blender/Scripts/export_all.py
