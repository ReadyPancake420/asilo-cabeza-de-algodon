# Autenticación, roles y permisos

## Inicio de sesión

La aplicación solicita usuario y contraseña en `http://localhost:8080`. El servicio administrativo verifica la contraseña protegida con `scrypt` y devuelve una sesión firmada con vigencia de ocho horas. Esa sesión se envía a los tres servicios mediante el encabezado `Authorization: Bearer <token>`.

Las rutas `/health` son públicas para permitir el monitoreo. Todas las rutas de negocio requieren una sesión válida. Una solicitud sin sesión o con una sesión alterada o vencida recibe `401`. Una sesión válida que intenta una acción no autorizada recibe `403`.

## Usuarios ficticios

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Médico | `medico.demo` | `DemoMedico2026!` |
| Enfermería | `enfermeria.demo` | `DemoEnfermeria2026!` |
| Coordinación | `coordinacion.demo` | `DemoCoordinacion2026!` |
| Administración | `administracion.demo` | `DemoAdministracion2026!` |

## Matriz de permisos

| Módulo o acción | Médico | Enfermería | Coordinación | Administración |
| --- | :---: | :---: | :---: | :---: |
| Consultar residentes y fichas | Sí | Sí | Sí | Sí |
| Registrar residente | No | No | No | Sí |
| Registrar visita médica | Sí | No | No | No |
| Consultar laboratorio | Sí | Sí | Sí | Sí |
| Crear orden de laboratorio | Sí | No | No | No |
| Registrar resultado de laboratorio | No | Sí | No | No |
| Consultar farmacia | Sí | Sí | Sí | Sí |
| Entregar medicamento y descontar inventario | No | Sí | No | No |
| Crear referencia médica | Sí | No | No | No |
| Consultar referencias y trazabilidad | Sí | Sí | Sí | Sí |
| Asignar enfermería y programar cita | No | No | Sí | No |
| Marcar traslado y atención | No | Sí | No | No |
| Cancelar o convertir referencia en visita | No | No | Sí | No |
| Consultar liquidaciones | No | No | Sí | Sí |
| Calcular, guardar o anular liquidaciones | No | No | No | Sí |
| Caja, cuotas, donaciones y pagos | No | No | No | Sí |
| Reportes consolidados | No | No | Sí | Sí |

La interfaz oculta las opciones que no corresponden al rol, pero la protección definitiva se ejecuta también en cada API para impedir que se evada mediante llamadas directas.

## Consideraciones para producción

Las cuentas anteriores y la clave predeterminada son exclusivamente académicas. Antes de publicar el sistema se deben reemplazar, configurar `AUTH_JWT_SECRET` con un secreto robusto fuera del repositorio, usar HTTPS, agregar recuperación y bloqueo de cuentas, rotación de claves, auditoría de accesos y gestión de usuarios autorizados.
