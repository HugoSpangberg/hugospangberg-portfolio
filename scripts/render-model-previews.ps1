$ErrorActionPreference = "Stop"

$blender = & "$PSScriptRoot/resolve-blender.ps1"
& $blender --background --python "Assets/Blender/Scripts/render_previews.py"
