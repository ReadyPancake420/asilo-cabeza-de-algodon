# Pruebas con curl

Ejecute estos comandos desde la raíz `asilo-microservices`. En Windows use `curl.exe` para evitar el alias histórico de PowerShell. Los ejemplos utilizan `medicalVisitId=9202`; si repite todo el flujo con curl, cambie ese número tanto en `referral-convert.json` como en `expense-create.json`. La colección de Postman genera uno nuevo automáticamente y puede repetirse sin editar archivos.

## 1. Salud y datos precargados

```powershell
curl.exe http://localhost:3001/health
curl.exe http://localhost:3002/health
curl.exe http://localhost:3001/api/v1/liquidations/1
curl.exe http://localhost:3002/api/v1/referrals/1
```

## 2. Vista previa de una liquidación

No guarda nada en MySQL:

```powershell
curl.exe -X POST http://localhost:3001/api/v1/liquidations/preview -H "Content-Type: application/json" --data-binary "@examples/expense-preview.json"
```

Compruebe en la respuesta:

```text
grossTotal:     415
discountAmount: 83
totalDue:       332
```

## 3. Flujo completo de una referencia

### 3.1 Crear desde medicina general

```powershell
curl.exe -X POST http://localhost:3002/api/v1/referrals -H "Content-Type: application/json" --data-binary "@examples/referral-create.json"
```

Copie el `data.id` devuelto. Los siguientes ejemplos suponen que es `2`; reemplácelo si fuera diferente.

### 3.2 Asignar enfermero acompañante

```powershell
curl.exe -X PATCH http://localhost:3002/api/v1/referrals/2/nurse -H "Content-Type: application/json" --data-binary "@examples/referral-nurse.json"
```

El estado debe ser `PENDING_FOUNDATION`.

### 3.3 Fundación programa especialista, fecha y hora

```powershell
curl.exe -X PATCH http://localhost:3002/api/v1/referrals/2/schedule -H "Content-Type: application/json" --data-binary "@examples/referral-schedule.json"
```

El estado debe ser `APPOINTMENT_SCHEDULED`.

### 3.4 Marcar traslado y atención

```powershell
curl.exe -X PATCH http://localhost:3002/api/v1/referrals/2/status -H "Content-Type: application/json" --data-binary "@examples/referral-in-transit.json"
curl.exe -X PATCH http://localhost:3002/api/v1/referrals/2/status -H "Content-Type: application/json" --data-binary "@examples/referral-attended.json"
```

### 3.5 Convertir la solicitud en visita médica

```powershell
curl.exe -X POST http://localhost:3002/api/v1/referrals/2/convert-to-visit -H "Content-Type: application/json" --data-binary "@examples/referral-convert.json"
```

El estado debe ser `COMPLETED` y `medicalVisitId` debe valer `9202`.

### 3.6 Consultar la línea de tiempo

```powershell
curl.exe http://localhost:3002/api/v1/referrals/2
```

La propiedad `timeline` debe contener seis eventos, desde `CREATED` hasta `CONVERTED_TO_VISIT`.

## 4. Liquidar la visita producida por la referencia

El cuerpo usa el mismo `medicalVisitId=9202`:

```powershell
curl.exe -X POST http://localhost:3001/api/v1/liquidations -H "Content-Type: application/json" --data-binary "@examples/expense-create.json"
curl.exe http://localhost:3001/api/v1/liquidations/visit/9202
```

Esto demuestra la integración por contrato: los servicios continúan separados, pero el sistema principal puede usar el identificador de visita producido por uno para consumir el otro.

## 5. Casos de validación útiles para el video

### Intentar liquidar una cita cancelada

```powershell
curl.exe -X POST http://localhost:3001/api/v1/liquidations -H "Content-Type: application/json" --data-binary "@examples/expense-cancelled.json"
```

Resultado esperado: HTTP `422`, código `CANCELLED_APPOINTMENT`.

### Intentar saltar un estado

Cree una referencia nueva y, sin asignar enfermero ni programarla, intente marcarla atendida:

```powershell
curl.exe -X PATCH http://localhost:3002/api/v1/referrals/3/status -H "Content-Type: application/json" --data-binary "@examples/referral-attended.json"
```

Resultado esperado: HTTP `409`, código `INVALID_STATUS_TRANSITION`. Ajuste el id al de la nueva referencia.

## 6. Filtros

```powershell
curl.exe "http://localhost:3001/api/v1/liquidations?patientId=15&status=FINALIZED"
curl.exe "http://localhost:3002/api/v1/referrals?patientId=15"
curl.exe "http://localhost:3002/api/v1/referrals?status=APPOINTMENT_SCHEDULED"
curl.exe "http://localhost:3002/api/v1/referrals?specialty=Cardiologia"
```
