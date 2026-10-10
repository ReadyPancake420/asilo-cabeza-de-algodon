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

Push-Location $projectRoot
try {
  Write-Host 'Deteniendo solamente los contenedores de Cabeza de Algodon...' -ForegroundColor Yellow
  & $dockerCli compose down
  if ($LASTEXITCODE -ne 0) {
    throw 'No fue posible detener los contenedores.'
  }
  Write-Host 'Contenedores detenidos. Las bases y sus datos se conservaron.' -ForegroundColor Green
} finally {
  Pop-Location
}
