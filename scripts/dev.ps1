$ErrorActionPreference = "Stop"

Start-Process npm -ArgumentList "run", "dev:client" -NoNewWindow
Start-Process npm -ArgumentList "run", "dev:cms" -NoNewWindow

Write-Host "Started frontend and CMS. Stop the spawned processes when finished."
