$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$dockerCli = 'C:\Program Files\Docker\Docker\resources\bin\docker.exe'
$dockerDesktop = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
$dockerBin = Split-Path -Parent $dockerCli

if (-not (Test-Path -LiteralPath $dockerCli)) {
  throw 'Docker Desktop no esta instalado. Instale Docker Desktop antes de continuar.'
}

# Una terminal abierta antes de instalar Docker todavia puede tener la ruta anterior.
if (($env:Path -split ';') -notcontains $dockerBin) {
  $env:Path = "$dockerBin;$env:Path"
}

function Test-DockerEngine {
  $previousPreference = $ErrorActionPreference
  $ErrorActionPreference = 'SilentlyContinue'
  & $dockerCli info --format '{{.ServerVersion}}' *> $null
  $engineExitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousPreference
  return $engineExitCode -eq 0
}

function Wait-DockerEngine {
  param([int]$Attempts = 60)

  for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
    Start-Sleep -Seconds 2
    if (Test-DockerEngine) {
      return $true
    }
  }

  return $false
}

function Repair-DockerSocketFailure {
  $backendLog = Join-Path $env:LOCALAPPDATA 'Docker\log\host\com.docker.backend.exe.log'
  if (-not (Test-Path -LiteralPath $backendLog)) {
    return $false
  }

  $recentLog = Get-Content -LiteralPath $backendLog -Tail 160 -ErrorAction SilentlyContinue | Out-String
  $knownSocketFailure = $recentLog -match 'The file cannot be accessed by the system' -and
    $recentLog -match 'sailor-ingest\.sock|docker-secrets-engine[/\\]engine\.sock'

  if (-not $knownSocketFailure) {
    return $false
  }

  Write-Host 'Windows dejo archivos temporales de Docker bloqueados. Aplicando recuperacion segura...' -ForegroundColor Yellow
  Get-Process -ErrorAction SilentlyContinue |
    Where-Object { $_.ProcessName -like 'Docker*' -or $_.ProcessName -like 'com.docker*' } |
    Stop-Process -Force -ErrorAction SilentlyContinue
  & wsl.exe --shutdown *> $null

  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $socketDirectories = @(
    (Join-Path $env:LOCALAPPDATA 'Docker\run'),
    (Join-Path $env:LOCALAPPDATA 'docker-secrets-engine')
  )

  foreach ($directory in $socketDirectories) {
    if (Test-Path -LiteralPath $directory) {
      $backup = "$directory.recovery-$stamp"
      Move-Item -LiteralPath $directory -Destination $backup
    }
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }

  return $true
}

Write-Host 'Iniciando la demostracion de Cabeza de Algodon...' -ForegroundColor Cyan

if (-not (Test-DockerEngine)) {
  if (-not (Test-Path -LiteralPath $dockerDesktop)) {
    throw 'No se encontro Docker Desktop.'
  }

  Write-Host 'Abriendo Docker Desktop y esperando a que este listo...'
  Start-Process -FilePath $dockerDesktop -WindowStyle Hidden

  $engineReady = Wait-DockerEngine

  if (-not $engineReady -and (Repair-DockerSocketFailure)) {
    Write-Host 'Reintentando el inicio de Docker Desktop...'
    Start-Process -FilePath $dockerDesktop -WindowStyle Hidden
    $engineReady = Wait-DockerEngine -Attempts 90
  }

  if (-not $engineReady) {
    throw 'Docker Desktop no pudo iniciar. Revise su ventana e intente nuevamente.'
  }
}

Push-Location $projectRoot
try {
  Write-Host 'Construyendo e iniciando los siete contenedores...'
  & $dockerCli compose up --build -d
  if ($LASTEXITCODE -ne 0) {
    throw 'Docker Compose no pudo iniciar el proyecto.'
  }

  $servicesReady = $false
  for ($attempt = 1; $attempt -le 45; $attempt++) {
    Start-Sleep -Seconds 2
    try {
      $expense = Invoke-RestMethod -Uri 'http://localhost:3001/health' -TimeoutSec 3
      $referral = Invoke-RestMethod -Uri 'http://localhost:3002/health' -TimeoutSec 3
      $administration = Invoke-RestMethod -Uri 'http://localhost:3003/health' -TimeoutSec 3
      $demo = Invoke-WebRequest -Uri 'http://localhost:8080/health-ui' -UseBasicParsing -TimeoutSec 3
      if ($expense.status -eq 'ok' -and $referral.status -eq 'ok' -and $administration.status -eq 'ok' -and $demo.StatusCode -eq 200) {
        $servicesReady = $true
        break
      }
    } catch {
      # Las bases pueden tardar unos segundos en aceptar conexiones.
    }
  }

  if (-not $servicesReady) {
    & $dockerCli compose ps
    throw 'Los contenedores iniciaron, pero las APIs no respondieron a tiempo.'
  }

  Write-Host ''
  Write-Host 'LISTO: la interfaz, las tres API y las tres bases estan funcionando.' -ForegroundColor Green
  Write-Host 'Pantalla de demostracion: http://localhost:8080'
  Write-Host 'Gastos medicos:      http://localhost:3001/health'
  Write-Host 'Referencias medicas: http://localhost:3002/health'
  Write-Host 'Administracion:      http://localhost:3003/health'
  Write-Host ''
  & $dockerCli compose ps
} finally {
  Pop-Location
}
