$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$startScript = Join-Path $PSScriptRoot 'iniciar-demo.ps1'
$edgeCandidates = @(
  'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
  'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
)
$edge = $edgeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

if (-not $edge) {
  throw 'No se encontro Microsoft Edge para abrir el modo aplicacion.'
}

$ready = $false
try {
  $response = Invoke-WebRequest -Uri 'http://localhost:8080/health-ui' -UseBasicParsing -TimeoutSec 3
  $expense = Invoke-RestMethod -Uri 'http://localhost:3001/health' -TimeoutSec 3
  $referral = Invoke-RestMethod -Uri 'http://localhost:3002/health' -TimeoutSec 3
  $administration = Invoke-RestMethod -Uri 'http://localhost:3003/health' -TimeoutSec 3
  $ready = $response.StatusCode -eq 200 -and $expense.status -eq 'ok' -and $referral.status -eq 'ok' -and $administration.status -eq 'ok'
} catch {
  $ready = $false
}

if (-not $ready) {
  & $startScript
}

Write-Host 'Abriendo Cabeza de Algodon como aplicacion independiente...' -ForegroundColor Green
Start-Process -FilePath $edge -ArgumentList '--app=http://localhost:8080', '--start-maximized'
