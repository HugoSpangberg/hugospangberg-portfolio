#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${BLENDER_EXECUTABLE:-}" ]]; then
  if [[ -x "${BLENDER_EXECUTABLE}" ]]; then
    printf '%s\n' "${BLENDER_EXECUTABLE}"
    exit 0
  fi
  echo "BLENDER_EXECUTABLE is set but is not executable: ${BLENDER_EXECUTABLE}" >&2
  exit 127
fi

if command -v blender >/dev/null 2>&1; then
  command -v blender
  exit 0
fi

for candidate in \
  "/Applications/Blender.app/Contents/MacOS/Blender" \
  "${HOME}/Applications/Blender.app/Contents/MacOS/Blender" \
  "/c/Program Files/Blender Foundation/Blender/blender.exe"
do
  if [[ -x "${candidate}" ]]; then
    printf '%s\n' "${candidate}"
    exit 0
  fi
done

cat >&2 <<'EOF'
Blender executable was not found.

Install Blender and either:
- add blender to PATH, or
- set BLENDER_EXECUTABLE to the Blender binary.
EOF
exit 127
