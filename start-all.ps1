# ================================
# start-all.ps1  (Safe Version)
# Run Backend + Gateway + Frontend
# ================================

#$repo = "D:\neighborhood-library-service"
$repo = Split-Path -Parent $MyInvocation.MyCommand.Definition

# -------------------------------
# 1) Python gRPC Server
# -------------------------------
$python = Join-Path $repo "backend\venv\Scripts\python.exe"
$app = Join-Path $repo "backend\server\app.py"

Start-Process powershell -ArgumentList "-NoExit", "-Command",
"cd '$repo\backend\server'; `"$python`" `"$app`"" `
-WindowStyle Normal -WorkingDirectory "$repo\backend\server"

# -------------------------------
# 2) Node Gateway (nodemon)
# -------------------------------
Start-Process powershell -ArgumentList "-NoExit", "-Command",
"cd '$repo\gateway'; npx nodemon index.js" `
-WindowStyle Normal -WorkingDirectory "$repo\gateway"

# -------------------------------
# 3) React Frontend
# -------------------------------
Start-Process powershell -ArgumentList "-NoExit", "-Command",
"cd '$repo\frontend'; npm start" `
-WindowStyle Normal -WorkingDirectory "$repo\frontend"

Write-Host "`nAll services are now running!" -ForegroundColor Cyan
