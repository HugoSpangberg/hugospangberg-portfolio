#!/usr/bin/env bash
set -euo pipefail

master="Assets/Blender/Sources/career-world-master.blend"

if [[ ! -f "${master}" ]]; then
  echo "Missing ${master}."
  echo "Run: npm run models:assemble"
  exit 1
fi

blender="$(Scripts/resolve-blender.sh)"
exec "${blender}" "${master}"
