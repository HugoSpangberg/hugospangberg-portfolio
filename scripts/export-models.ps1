$ErrorActionPreference = "Stop"

if (-not (Get-Command blender -ErrorAction SilentlyContinue)) {
  throw "Blender CLI is not installed. Install Blender and run this script again to generate .blend and .glb files."
}

blender --background --python Assets/Blender/Scripts/export_all.py
