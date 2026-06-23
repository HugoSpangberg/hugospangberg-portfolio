$ErrorActionPreference = "Stop"

Start-Process npm -ArgumentList "run", "dev:frontend" -NoNewWindow
Start-Process npm -ArgumentList "run", "dev:cms" -NoNewWindow

Write-Host "Started frontend and CMS. Stop the spawned processes when finished."
