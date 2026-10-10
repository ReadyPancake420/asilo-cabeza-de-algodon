# Pruebas con curl

Ejecute estos comandos desde la raíz `asilo-microservices`. En Windows use `curl.exe` para evitar el alias histórico de PowerShell. Los ejemplos utilizan `medicalVisitId=9202`; si repite todo el flujo con curl, cambie ese número tanto en `referral-convert.json` como en `expense-create.json`. La colección de Postman genera uno nuevo automáticamente y puede repetirse sin editar archivos.

## 1. Obtener sesiones por rol

Ejecute este bloque en PowerShell. Cada variable conservará la sesión necesaria para el flujo:

```powershell
$loginMedico = curl.exe -s -X POST http://localhost:3003/api/v1/auth/login -H "Content-Type: application/json" -d '{"username":"medico.demo","password":"DemoMedico2026!"}' | ConvertFrom-Json
$loginEnfermeria = curl.exe -s -X POST http://localhost:3003/api/v1/auth/login -H "Content-Type: application/json" -d '{"username":"enfermeria.demo","password":"DemoEnfermeria2026!"}' | ConvertFrom-Json
$loginCoordinacion = curl.exe -s -X POST http://localhost:3003/api/v1/auth/login -H "Content-Type: application/json" -d '{"username":"coordinacion.demo","password":"DemoCoordinacion2026!"}' | ConvertFrom-Json
$loginAdministracion = curl.exe -s -X POST http://localhost:3003/api/v1/auth/login -H "Content-Type: application/json" -d '{"username":"administracion.demo","password":"DemoAdministracion2026!"}' | ConvertFrom-Json
$tokenMedico = $loginMedico.data.token
$tokenEnfermeria = $loginEnfermeria.data.token
$tokenCoordinacion = $loginCoordinacion.data.token
$tokenAdministracion = $loginAdministracion.data.token
```

## 2. Salud y datos precargados

```powershell
curl.exe http://localhost:3001/health
curl.exe http://localhost:3002/health
curl.exe http://localhost:3001/api/v1/liquidations/1 -H "Authorization: Bearer $tokenAdministracion"
curl.exe http://localhost:3002/api/v1/referrals/1 -H "Authorization: Bearer $tokenAdministracion"
```

## 3. Vista previa de una liquidación

No guarda nada en MySQL:

```powershell
curl.exe -X POST http://localhost:3001/api/v1/liquidations/preview -H "Authorization: Bearer $tokenAdministracion" -H "Content-Type: application/json" --data-binary "@examples/expense-preview.json"
```

Compruebe en la respuesta:

```text
grossTotal:     415
discountAmount: 83
totalDue:       332
```

## 4. Flujo completo de una referencia

### 4.1 Crear desde medicina general

```powershell
curl.exe -X POST http://localhost:3002/api/v1/referrals -H "Authorization: Bearer $tokenMedico" -H "Content-Type: application/json" --data-binary "@examples/referral-create.json"
```

Copie el `data.id` devuelto. Los siguientes ejemplos suponen que es `2`; reemplácelo si fuera diferente.

### 4.2 Asignar enfermero acompañante

```powershell
curl.exe -X PATCH http://localhost:3002/api/v1/referrals/2/nurse -H "Authorization: Bearer $tokenCoordinacion" -H "Content-Type: application/json" --data-binary "@examples/referral-nurse.json"
```

El estado debe ser `PENDING_FOUNDATION`.

### 4.3 Fundación programa especialista, fecha y hora

```powershell
curl.exe -X PATCH http://localhost:3002/api/v1/referrals/2/schedule -H "Authorization: Bearer $tokenCoordinacion" -H "Content-Type: application/json" --data-binary "@examples/referral-schedule.json"
```

El estado debe ser `APPOINTMENT_SCHEDULED`.

### 4.4 Marcar traslado y atención

```powershell
curl.exe -X PATCH http://localhost:3002/api/v1/referrals/2/status -H "Authorization: Bearer $tokenEnfermeria" -H "Content-Type: application/json" --data-binary "@examples/referral-in-transit.json"
curl.exe -X PATCH http://localhost:3002/api/v1/referrals/2/status -H "Authorization: Bearer $tokenEnfermeria" -H "Content-Type: application/json" --data-binary "@examples/referral-attended.json"
```

### 4.5 Convertir la solicitud en visita médica

```powershell
curl.exe -X POST http://localhost:3002/api/v1/referrals/2/convert-to-visit -H "Authorization: Bearer $tokenCoordinacion" -H "Content-Type: application/json" --data-binary "@examples/referral-convert.json"
```

El estado debe ser `COMPLETED` y `medicalVisitId` debe valer `9202`.

### 4.6 Consultar la línea de tiempo

```powershell
curl.exe http://localhost:3002/api/v1/referrals/2 -H "Authorization: Bearer $tokenCoordinacion"
```

La propiedad `timeline` debe contener seis eventos, desde `CREATED` hasta `CONVERTED_TO_VISIT`.

## 5. Liquidar la visita producida por la referencia

El cuerpo usa el mismo `medicalVisitId=9202`:

```powershell
curl.exe -X POST http://localhost:3001/api/v1/liquidations -H "Authorization: Bearer $tokenAdministracion" -H "Content-Type: application/json" --data-binary "@examples/expense-create.json"
curl.exe http://localhost:3001/api/v1/liquidations/visit/9202 -H "Authorization: Bearer $tokenAdministracion"
```

Esto demuestra la integración por contrato: los servicios continúan separados, pero el sistema principal puede usar el identificador de visita producido por uno para consumir el otro.

## 6. Casos de validación útiles para el video

### Intentar liquidar una cita cancelada

```powershell
curl.exe -X POST http://localhost:3001/api/v1/liquidations -H "Authorization: Bearer $tokenAdministracion" -H "Content-Type: application/json" --data-binary "@examples/expense-cancelled.json"
```

Resultado esperado: HTTP `422`, código `CANCELLED_APPOINTMENT`.

### Intentar saltar un estado

Cree una referencia nueva y, sin asignar enfermero ni programarla, intente marcarla atendida:

```powershell
curl.exe -X PATCH http://localhost:3002/api/v1/referrals/3/status -H "Authorization: Bearer $tokenEnfermeria" -H "Content-Type: application/json" --data-binary "@examples/referral-attended.json"
```

Resultado esperado: HTTP `409`, código `INVALID_STATUS_TRANSITION`. Ajuste el id al de la nueva referencia.

## 7. Filtros

```powershell
curl.exe "http://localhost:3001/api/v1/liquidations?patientId=15&status=FINALIZED" -H "Authorization: Bearer $tokenAdministracion"
curl.exe "http://localhost:3002/api/v1/referrals?patientId=15" -H "Authorization: Bearer $tokenCoordinacion"
curl.exe "http://localhost:3002/api/v1/referrals?status=APPOINTMENT_SCHEDULED" -H "Authorization: Bearer $tokenCoordinacion"
curl.exe "http://localhost:3002/api/v1/referrals?specialty=Cardiologia" -H "Authorization: Bearer $tokenCoordinacion"
```
