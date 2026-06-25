$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$backendDir = Join-Path $root "space-debris-collision"
$frontendDir = Join-Path $root "frontend"

Write-Host "Starting Postgres and Redis with Docker Compose..."
Push-Location $backendDir
docker compose up -d
Pop-Location

Write-Host "Starting Spring backend on http://localhost:8080 ..."
Start-Process powershell.exe `
  -WorkingDirectory $backendDir `
  -ArgumentList "-NoExit", "-Command", ".\mvnw.cmd spring-boot:run"

Write-Host "Starting Vite frontend on http://localhost:5173 ..."
Start-Process powershell.exe `
  -WorkingDirectory $frontendDir `
  -ArgumentList "-NoExit", "-Command", "npm run dev -- --host 127.0.0.1"

Write-Host ""
Write-Host "All launch commands were sent."
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:8080"
