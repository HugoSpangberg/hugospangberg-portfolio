$ErrorActionPreference = "Stop"

$blender = & "$PSScriptRoot/resolve-blender.ps1"
& $blender --background --python "Assets/Blender/Scripts/export_all.py"
& $blender --background --python "Assets/Blender/Scripts/export_updated_landmarks.py"
