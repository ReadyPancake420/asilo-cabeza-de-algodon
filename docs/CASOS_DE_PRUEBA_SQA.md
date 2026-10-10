# Casos de prueba SQA

## Convenciones

- **Prioridad:** P0 inmediata, P1 alta, P2 media, P3 baja.
- **Tipo:** positivo, negativo, integración, concurrencia, seguridad o usabilidad.
- Todos los datos deben ser ficticios.
- Cada ejecución debe indicar el SHA evaluado y adjuntar evidencia.

## Datos base sugeridos

| Dato | Valor ficticio |
| --- | --- |
| Residente | Ana Prueba SQA |
| Habitación | QA-01 |
| Responsable | Carlos Prueba |
| Teléfono | 5555-0101 |
| Médico | Dra. María Prueba |
| Enfermería | Luis Prueba |
| Especialidad | Cardiología |
| Medicamento | Medicamento QA 10 mg |

## A. Ambiente y humo

### CP-ENV-001 — Inicio del entorno completo

- **Prioridad:** P0
- **Precondición:** Docker Desktop activo y puertos libres.
- **Pasos:** ejecutar `ABRIR_APLICACION.cmd`; esperar los estados saludables; abrir `http://localhost:8080`.
- **Resultado esperado:** se inician siete contenedores, las tres APIs responden `status: ok` y la interfaz muestra Cabeza de Algodón.

### CP-ENV-002 — Verificación automatizada de la demostración

- **Prioridad:** P0
- **Pasos:** ejecutar `VERIFICAR_DEMO.cmd`.
- **Resultado esperado:** aparece `VERIFICACION APROBADA`; existen al menos seis residentes y seis medicamentos; el ejemplo calcula Q415, Q83 y Q332.

### CP-ENV-003 — Detención controlada

- **Prioridad:** P2
- **Pasos:** ejecutar `DETENER_DEMO.cmd`; consultar nuevamente las URLs locales.
- **Resultado esperado:** se detienen solo los contenedores del proyecto y las URLs dejan de responder.

## B. Residentes y visitas

### CP-RES-001 — Crear residente válido

- **Prioridad:** P1
- **Datos:** nombre Ana Prueba SQA, fecha `1945-05-10`, habitación `QA-01`, condición estable y responsable ficticio.
- **Pasos:** registrar desde la interfaz o `POST /api/v1/residents`; consultar el identificador retornado.
- **Resultado esperado:** HTTP 201, datos persistidos y residente visible en listado y ficha.

### CP-RES-002 — Rechazar campos obligatorios inválidos

- **Prioridad:** P1
- **Tipo:** negativo
- **Pasos:** enviar nombre de dos caracteres, fecha con formato incorrecto o teléfono demasiado corto.
- **Resultado esperado:** HTTP 400; mensaje de validación; no se crea ningún registro parcial.

### CP-RES-003 — Evitar duplicar habitación

- **Prioridad:** P1
- **Tipo:** negativo e integridad
- **Precondición:** existe un residente en `QA-01`.
- **Pasos:** intentar crear otro residente con la misma habitación.
- **Resultado esperado:** la base rechaza el duplicado; el residente original permanece intacto.

### CP-RES-004 — Buscar y filtrar residentes

- **Prioridad:** P2
- **Pasos:** buscar por parte del nombre y por habitación; filtrar por estado.
- **Resultado esperado:** solo se muestran coincidencias y los filtros no modifican datos.

### CP-VIS-001 — Registrar visita médica

- **Prioridad:** P1
- **Precondición:** residente existente.
- **Pasos:** enviar una visita con fecha, tipo, médico, motivo y diagnóstico válidos.
- **Resultado esperado:** HTTP 201 y visita visible en el historial del residente.

### CP-VIS-002 — Rechazar visita para residente inexistente

- **Prioridad:** P1
- **Tipo:** negativo
- **Pasos:** crear visita con un `residentId` que no existe.
- **Resultado esperado:** HTTP 404 con código `RESIDENT_NOT_FOUND`; no se registra la visita.

## C. Laboratorio

### CP-LAB-001 — Crear orden de laboratorio

- **Prioridad:** P1
- **Pasos:** crear una orden para un residente con exámenes, fecha y médico.
- **Resultado esperado:** HTTP 201, estado `Pendiente` y orden visible en el listado.

### CP-LAB-002 — Actualizar resultado

- **Prioridad:** P1
- **Precondición:** orden existente.
- **Pasos:** actualizar a `En procesamiento`; luego a `Resultados listos` con notas.
- **Resultado esperado:** cada cambio queda persistido y las notas se recuperan sin alteración.

### CP-LAB-003 — Rechazar estado no permitido

- **Prioridad:** P1
- **Tipo:** negativo
- **Pasos:** enviar un estado distinto de `Pendiente`, `En procesamiento` o `Resultados listos`.
- **Resultado esperado:** HTTP 400 y la orden conserva el estado anterior.

## D. Farmacia e inventario

### CP-FAR-001 — Crear medicamento

- **Prioridad:** P1
- **Pasos:** registrar nombre, presentación, existencia, precio y nivel mínimo.
- **Resultado esperado:** HTTP 201 y estado calculado correctamente en el inventario.

### CP-FAR-002 — Entregar medicamento con existencia suficiente

- **Prioridad:** P0
- **Precondición:** medicamento con existencia 10.
- **Pasos:** entregar 3 unidades a un residente.
- **Resultado esperado:** HTTP 201, entrega registrada y existencia final 7.

### CP-FAR-003 — Impedir existencia negativa

- **Prioridad:** P0
- **Tipo:** negativo
- **Precondición:** medicamento con existencia 2.
- **Pasos:** intentar entregar 3 unidades.
- **Resultado esperado:** HTTP 409 con `INSUFFICIENT_STOCK`; existencia continúa en 2 y no existe entrega parcial.

### CP-FAR-004 — Concurrencia en últimas unidades

- **Prioridad:** P0
- **Tipo:** concurrencia
- **Precondición:** medicamento con existencia 5.
- **Pasos:** enviar simultáneamente dos entregas de 4 unidades.
- **Resultado esperado:** solo una transacción se confirma; la otra recibe conflicto; existencia final 1.

### CP-FAR-005 — Alertas de inventario

- **Prioridad:** P2
- **Pasos:** consultar medicamentos con existencia igual a cero, menor a la mitad del mínimo, menor al mínimo y normal.
- **Resultado esperado:** estados `Reabastecer`, `Existencia baja` o `Disponible` según corresponda.

## E. Caja y cuota mensual

### CP-CAJ-001 — Registrar entrada y salida

- **Prioridad:** P1
- **Pasos:** registrar una donación como entrada y un gasto operativo como salida.
- **Resultado esperado:** ambos movimientos se persisten y el resumen suma ingresos y egresos en la columna correcta.

### CP-CAJ-002 — Rechazar monto cero o negativo

- **Prioridad:** P1
- **Tipo:** negativo
- **Pasos:** enviar movimiento con monto 0 y luego con monto negativo.
- **Resultado esperado:** HTTP 400 y ningún movimiento creado.

### CP-CAJ-003 — Cuota mensual fuera de liquidación médica

- **Prioridad:** P0
- **Pasos:** registrar una cuota familiar en caja; calcular después una liquidación médica del mismo residente.
- **Resultado esperado:** la cuota aparece solo en caja y no modifica consulta, laboratorio, farmacia, descuento ni total médico.

## F. Referencias médicas

### CP-REF-001 — Flujo completo de referencia

- **Prioridad:** P0
- **Pasos:** crear referencia; asignar enfermería; programar especialista; marcar `IN_TRANSIT`; marcar `ATTENDED`; convertir a visita.
- **Resultado esperado:** secuencia `PENDING_NURSE_ASSIGNMENT` → `PENDING_FOUNDATION` → `APPOINTMENT_SCHEDULED` → `IN_TRANSIT` → `ATTENDED` → `COMPLETED`; cada paso agrega un evento a la línea de tiempo.

### CP-REF-002 — Impedir salto de estados

- **Prioridad:** P0
- **Tipo:** negativo
- **Pasos:** intentar pasar una referencia recién creada directamente a `ATTENDED`.
- **Resultado esperado:** HTTP 409 con `INVALID_STATUS_TRANSITION`; el estado no cambia.

### CP-REF-003 — Reprogramar cita

- **Prioridad:** P1
- **Precondición:** referencia `APPOINTMENT_SCHEDULED`.
- **Pasos:** enviar nuevo especialista, fecha u hora por la ruta de programación.
- **Resultado esperado:** continúa `APPOINTMENT_SCHEDULED` y agrega evento `RESCHEDULED`.

### CP-REF-004 — Cancelar con motivo obligatorio

- **Prioridad:** P1
- **Tipo:** negativo y positivo
- **Pasos:** intentar cancelar sin motivo; repetir con un motivo de al menos cinco caracteres.
- **Resultado esperado:** el primer intento devuelve HTTP 400; el segundo cambia a `CANCELLED` y guarda el motivo.

### CP-REF-005 — Estados finales inmutables

- **Prioridad:** P0
- **Precondición:** una referencia `COMPLETED` y otra `CANCELLED`.
- **Pasos:** intentar cualquier transición adicional.
- **Resultado esperado:** HTTP 409; no cambia el estado ni se agrega un evento incorrecto.

### CP-REF-006 — Conflicto de actualización simultánea

- **Prioridad:** P1
- **Tipo:** concurrencia
- **Pasos:** enviar dos cambios simultáneos sobre la misma referencia y el mismo estado inicial.
- **Resultado esperado:** uno se confirma y el otro recibe `REFERRAL_UPDATE_CONFLICT`; la línea de tiempo queda coherente.

## G. Liquidaciones y descuentos

### CP-LIQ-001 — Ejemplo oficial del 20 %

- **Prioridad:** P0
- **Datos:** consulta Q150, laboratorio Q175 y farmacia Q90.
- **Pasos:** enviar vista previa con descuento 20 %.
- **Resultado esperado:** total bruto Q415, descuento Q83 y total a pagar Q332, moneda GTQ.

### CP-LIQ-002 — Redondeo al centavo

- **Prioridad:** P0
- **Datos:** consulta Q100.01 y descuento 15 %.
- **Resultado esperado:** descuento Q15.00 y total Q85.01.

### CP-LIQ-003 — Límites del descuento

- **Prioridad:** P1
- **Pasos:** probar 0 %, 100 %, -0.01 % y 100.01 %.
- **Resultado esperado:** 0 % y 100 % calculan correctamente; valores fuera del rango devuelven HTTP 400.

### CP-LIQ-004 — Rechazar cita cancelada

- **Prioridad:** P0
- **Pasos:** intentar crear liquidación con `appointmentStatus: CANCELLED`.
- **Resultado esperado:** HTTP 422 con `CANCELLED_APPOINTMENT`; no se registra la liquidación.

### CP-LIQ-005 — Evitar doble liquidación

- **Prioridad:** P0
- **Precondición:** visita ya liquidada.
- **Pasos:** intentar crear una segunda liquidación para el mismo `medicalVisitId`.
- **Resultado esperado:** HTTP 409 con `VISIT_ALREADY_LIQUIDATED`; se conserva la primera.

### CP-LIQ-006 — Anular liquidación

- **Prioridad:** P1
- **Pasos:** anular con motivo válido; repetir la anulación.
- **Resultado esperado:** primer intento cambia a `VOIDED` y guarda el motivo; segundo devuelve HTTP 409 con `LIQUIDATION_ALREADY_VOIDED`.

### CP-LIQ-007 — Validación de renglones

- **Prioridad:** P1
- **Tipo:** negativo
- **Pasos:** probar cantidad 0, precio negativo, más de 100 renglones y nombre demasiado corto.
- **Resultado esperado:** HTTP 400 y ninguna liquidación parcial.

## H. Reportes, interfaz y seguridad básica

### CP-REP-001 — Coherencia del resumen

- **Prioridad:** P1
- **Pasos:** registrar datos controlados en residentes, laboratorio, farmacia y caja; consultar `/api/v1/reports/summary`.
- **Resultado esperado:** los conteos y montos coinciden con los registros creados.

### CP-UI-001 — Navegación principal

- **Prioridad:** P1
- **Pasos:** recorrer todos los módulos, abrir formularios, cancelar y guardar datos válidos.
- **Resultado esperado:** no hay enlaces rotos, el módulo activo es visible y los mensajes permiten comprender el resultado.

### CP-UI-002 — Vista adaptable y teclado

- **Prioridad:** P2
- **Pasos:** probar anchos de escritorio y móvil; recorrer acciones con teclado.
- **Resultado esperado:** no se pierde contenido esencial, el foco es visible y las acciones principales son utilizables.

### CP-SEG-001 — Archivos sensibles fuera del repositorio

- **Prioridad:** P0
- **Pasos:** revisar el historial y los archivos publicados buscando `.env`, tokens, claves privadas o contraseñas reales.
- **Resultado esperado:** solo existen ejemplos ficticios; no hay secretos ni datos reales.

### CP-SEG-002 — Rechazar solicitudes sin autenticación

- **Prioridad:** P0
- **Tipo:** seguridad
- **Pasos:** llamar sin encabezado `Authorization` a residentes, referencias y liquidaciones; repetir con un token alterado y con uno vencido.
- **Resultado esperado:** las API responden `401`; las rutas `/health` y el inicio de sesión continúan disponibles.

### CP-SEG-003 — Aplicar permisos por rol

- **Prioridad:** P0
- **Tipo:** seguridad y funcional
- **Pasos:** iniciar sesión con cada cuenta ficticia e intentar una acción autorizada y una prohibida según la matriz de roles.
- **Resultado esperado:** la acción autorizada funciona; la acción prohibida no aparece en la interfaz y, si se intenta directamente por API, responde `403` sin modificar datos.

### CP-SEG-004 — Proteger credenciales y cerrar sesión

- **Prioridad:** P1
- **Tipo:** seguridad
- **Pasos:** revisar que la base no almacene contraseñas legibles; iniciar y cerrar sesión desde la interfaz; reutilizar la pantalla con otra cuenta.
- **Resultado esperado:** la base contiene hashes `scrypt`; al cerrar sesión se elimina el token de la pestaña y el sistema solicita credenciales nuevamente.

## Registro resumido de ejecución

| Caso | Estado | Commit | Responsable | Evidencia/defecto |
| --- | --- | --- | --- | --- |
| CP-ENV-001 | No ejecutado |  |  |  |
| CP-ENV-002 | No ejecutado |  |  |  |
| CP-FAR-004 | No ejecutado |  |  |  |
| CP-REF-001 | No ejecutado |  |  |  |
| CP-LIQ-001 | No ejecutado |  |  |  |
| CP-SEG-001 | No ejecutado |  |  |  |

Para el resto de casos debe utilizarse la plantilla **Resultado de prueba SQA** de GitHub Issues.
