Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
Set-Location "e:\Claude code\api用量"
Start-Process -FilePath "node" -ArgumentList "scripts/dev.js" -NoNewWindow -Wait
