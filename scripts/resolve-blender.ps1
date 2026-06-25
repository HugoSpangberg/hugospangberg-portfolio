$ErrorActionPreference = "Stop"

if (-not [string]::IsNullOrWhiteSpace($env:BLENDER_EXECUTABLE)) {
  if (Test-Path $env:BLENDER_EXECUTABLE) {
    Write-Output $env:BLENDER_EXECUTABLE
    exit 0
  }
  throw "BLENDER_EXECUTABLE is set but does not exist: $env:BLENDER_EXECUTABLE"
}

$pathBlender = Get-Command blender -ErrorAction SilentlyContinue
if ($pathBlender) {
  Write-Output $pathBlender.Source
  exit 0
}

$candidates = @(
  "C:\Program Files\Blender Foundation\Blender\blender.exe",
  "C:\Program Files\Blender Foundation\Blender 4.5\blender.exe",
  "$env:ProgramFiles\Blender Foundation\Blender\blender.exe"
)

foreach ($candidate in $candidates) {
  if (Test-Path $candidate) {
    Write-Output $candidate
    exit 0
  }
}

throw "Blender executable was not found. Install Blender, add blender to PATH, or set BLENDER_EXECUTABLE."
