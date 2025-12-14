Write-Host "`nStopping all Library Management System services..." -ForegroundColor Cyan

# -----------------------------
# 1) Kill Python gRPC Server
# -----------------------------
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# -----------------------------
# 2) Kill Node Gateway (nodemon + node)
# -----------------------------
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# -----------------------------
# 3) Kill PowerShell windows started by start-all.ps1
# -----------------------------
Get-Process -Name "powershell" -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowTitle -like "*Library Server*" -or `
                   $_.MainWindowTitle -like "*Gateway Server*" -or `
                   $_.MainWindowTitle -like "*Frontend UI*" } |
    Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "`nAll LMS services stopped successfully." -ForegroundColor Green