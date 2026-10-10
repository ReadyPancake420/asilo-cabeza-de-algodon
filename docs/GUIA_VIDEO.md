# Guía sugerida para el video académico

Duración recomendada: 8 a 12 minutos.

## 1. Introducción — 45 segundos

Abra primero `ABRIR_APLICACION.cmd`. El frontend integral aparecerá como una aplicación independiente. Inicie sesión con una de las cuentas ficticias y señale que el menú cambia según el rol. En el menú completo se encuentran residentes, fichas médicas, citas y referencias, laboratorio, farmacia, gastos médicos, caja, donaciones y reportes. Los puertos 3001, 3002 y 3003 son APIs y por eso muestran únicamente JSON.

Explique el problema:

> El sistema del Asilo Cabeza de Algodón debe controlar los gastos producidos por las visitas médicas y también el proceso de referencia desde medicina general hacia un especialista. Separé estas dos responsabilidades porque tienen reglas y ciclos de vida distintos.

Nombre los servicios con sus nombres completos para remarcar que son específicos del proyecto:

- Microservicio de Liquidación y Cálculo de Gastos Médicos con Descuento de Fundación.
- Microservicio de Trazabilidad de Referencias Médicas del Asilo.

## 2. Arquitectura — 1 minuto

Muestre primero el panel general y luego el diagrama del `README.md`. Señale:

- El frontend representa el sistema principal del asilo y consume HTTP/JSON.
- Los dos microservicios médicos y el backend administrativo tienen un puerto y una base MySQL propios.
- Pueden compilarse y desplegarse por separado.
- No comparten tablas; se relacionan por `medicalVisitId`.
- Los tres servicios validan la misma sesión firmada y aplican permisos aunque se intente llamar la API directamente.

Aclare que gastos y referencias permanecen como microservicios especializados y que residentes, fichas, laboratorio, farmacia y caja consumen el backend administrativo del puerto 3003.

Frase útil:

> Un microservicio no es solo una carpeta separada: posee una responsabilidad concreta, un contrato REST y sus propios datos.

## 3. Servicio de liquidaciones — 2 minutos

Abra brevemente:

1. `liquidation.routes.ts` para enseñar el contrato REST.
2. `liquidation.calculator.ts` para explicar la suma y el descuento en centavos.
3. `liquidation.service.ts` para mostrar que se rechazan citas canceladas.
4. `database/init.sql` para enseñar las tablas de liquidación y renglones.

En Postman ejecute primero **Login - Administracion** y después **Expense / Preview calculation**. Señale el resultado:

```text
Q150 consulta + Q175 laboratorio + Q90 farmacia = Q415
20 % de descuento = Q83
Total = Q332
```

Luego ejecute **Reject cancelled appointment** para enseñar una validación real.

## 4. Servicio de referencias — 3 minutos

Abra brevemente:

1. `referral.transitions.ts` para mostrar la máquina de estados.
2. `referral.service.ts` para enseñar asignación, programación y conversión.
3. `database/init.sql` para mostrar `medical_referrals` y `referral_events`.

En Postman ejecute en orden, cambiando de sesión según el rol indicado:

1. Login - Medico y Create referral.
2. Login - Coordinacion, Assign nurse y Foundation schedules appointment.
3. Login - Enfermeria, Mark in transit y Mark attended.
4. Login - Coordinacion y Convert to medical visit.
5. Get referral and timeline.

En la última respuesta, despliegue la propiedad `timeline` y explique que la trazabilidad no sobrescribe el pasado: agrega un evento por cada acción.

## 5. Integración y despliegue — 1 a 2 minutos

Muestre los siete contenedores en Docker Desktop o con:

```powershell
docker compose ps
```

Después cree la liquidación que usa el identificador de visita generado automáticamente por la colección al completar la referencia. Explique:

> El sistema principal coordina el flujo. El servicio de referencias produce el identificador de visita y el servicio de gastos lo utiliza, sin acceder directamente a la base del otro.

## 6. Cierre — 30 segundos

Resuma:

- Responsabilidades independientes.
- Validaciones y reglas de negocio.
- Persistencia MySQL por servicio.
- Autenticación y autorización por rol.
- Despliegue reproducible con Docker Compose.
- Pruebas unitarias, Postman y curl.

Evite dedicar tiempo a leer cada línea. El video resulta más claro si explica una ruta vertical por servicio: petición → regla → datos → respuesta.
