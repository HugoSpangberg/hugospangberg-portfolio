#!/usr/bin/env bash
set -euo pipefail

blender="$(Scripts/resolve-blender.sh)"
"${blender}" --background --python Assets/Blender/Scripts/assemble_world.py
