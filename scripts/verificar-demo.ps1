$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$dockerCli = 'C:\Program Files\Docker\Docker\resources\bin\docker.exe'
$dockerBin = Split-Path -Parent $dockerCli

if (-not (Test-Path -LiteralPath $dockerCli)) {
  throw 'Docker Desktop no esta instalado.'
}

if (($env:Path -split ';') -notcontains $dockerBin) {
  $env:Path = "$dockerBin;$env:Path"
}

Write-Host 'Verificando la demostracion sin modificar sus datos...' -ForegroundColor Cyan

$expenseHealth = Invoke-RestMethod -Uri 'http://localhost:3001/health' -TimeoutSec 5
$referralHealth = Invoke-RestMethod -Uri 'http://localhost:3002/health' -TimeoutSec 5
$administrationHealth = Invoke-RestMethod -Uri 'http://localhost:3003/health' -TimeoutSec 5
$demoPage = Invoke-WebRequest -Uri 'http://localhost:8080' -UseBasicParsing -TimeoutSec 5
$seedExpense = Invoke-RestMethod -Uri 'http://localhost:3001/api/v1/liquidations/1' -TimeoutSec 5
$seedReferral = Invoke-RestMethod -Uri 'http://localhost:3002/api/v1/referrals/1' -TimeoutSec 5
$residents = Invoke-RestMethod -Uri 'http://localhost:3003/api/v1/residents' -TimeoutSec 5
$medicines = Invoke-RestMethod -Uri 'http://localhost:3003/api/v1/medicines' -TimeoutSec 5
$previewBody = Get-Content -LiteralPath (Join-Path $projectRoot 'examples\expense-preview.json') -Raw
$preview = Invoke-RestMethod `
  -Method Post `
  -Uri 'http://localhost:3001/api/v1/liquidations/preview' `
  -ContentType 'application/json' `
  -Body $previewBody `
  -TimeoutSec 5

if ($expenseHealth.status -ne 'ok' -or $referralHealth.status -ne 'ok' -or $administrationHealth.status -ne 'ok') {
  throw 'Una de las APIs no esta saludable.'
}
if ($demoPage.StatusCode -ne 200 -or $demoPage.Content -notmatch 'Cabeza de Algod') {
  throw 'La pantalla de demostracion no esta disponible.'
}
if ($preview.data.grossTotal -ne 415 -or $preview.data.discountAmount -ne 83 -or $preview.data.totalDue -ne 332) {
  throw 'El calculo medico no produjo el resultado esperado.'
}
if ($seedExpense.data.totalDue -ne 332) {
  throw 'No se encontro correctamente la liquidacion de prueba.'
}
if ($seedReferral.data.timeline.Count -lt 3) {
  throw 'No se encontro correctamente la trazabilidad de prueba.'
}
if ($residents.data.Count -lt 6 -or $medicines.data.Count -lt 6) {
  throw 'No se cargaron correctamente los datos administrativos de prueba.'
}

Write-Host ''
Write-Host 'VERIFICACION APROBADA' -ForegroundColor Green
Write-Host 'Pantalla de demostracion: ok'
Write-Host "API de gastos:        $($expenseHealth.status)"
Write-Host "API de referencias:   $($referralHealth.status)"
Write-Host "API administrativa:   $($administrationHealth.status)"
Write-Host "Residentes cargados:   $($residents.data.Count)"
Write-Host "Subtotal:              Q$($preview.data.grossTotal)"
Write-Host "Descuento fundacion:   Q$($preview.data.discountAmount)"
Write-Host "Total a pagar:         Q$($preview.data.totalDue)"
Write-Host "Referencia precargada: $($seedReferral.data.status)"
Write-Host ''

Push-Location $projectRoot
try {
  & $dockerCli compose ps
} finally {
  Pop-Location
}
