# Estado de módulos comparado con el cronograma

## Actualización de seguimiento: 29 de octubre de 2026

El SQA informó una primera ejecución sobre el commit `db117ea`, con 287 verificaciones aprobadas de 297. Posteriormente se corrigieron observaciones de validación y presentación, y se añadieron pruebas automáticas. Estas correcciones requieren una nueva ejecución del SQA sobre el commit que las incluya. Los reportes se ampliaron respecto al corte anterior.

Siguen pendientes la validación automática entre referencias, visitas y liquidaciones; la aceptación y usabilidad; y el acceso público seguro. Las fechas y el porcentaje real del cronograma en Microsoft Project deben actualizarse con el responsable del proyecto a partir de las horas efectivamente trabajadas; este seguimiento no inventa tiempos ni modifica el archivo de planificación.

**Proyecto:** Sistema para el Asilo Cabeza de Algodón  
**Curso:** Análisis de Sistemas II  
**Fecha de corte:** 10 de octubre de 2026

## Criterio utilizado

Un módulo se considera **funcional** cuando existe en la interfaz, está conectado con su API y base de datos, compila correctamente y permite ejecutar su flujo principal. Esto no significa que ya haya superado las pruebas de aceptación del SQA.

El cronograma oficial tiene una planificación consolidada de 200 horas y fecha de estado del 26 de septiembre de 2026. La comparación siguiente conserva sus fechas; no se agregan nuevas actividades ni fechas.

## Comparación por módulo

| Módulo o actividad | Fecha del cronograma | Estado al 10 oct 2026 | Comparación con el plan |
| --- | --- | --- | --- |
| Interfaz y navegación | 18 sep 2026 | Funcional | Construido y disponible para pruebas |
| Residentes y fichas médicas | 25 sep 2026 | Funcional | Flujo principal construido |
| Laboratorio | 25 sep 2026 | Funcional | Órdenes, estados y resultados disponibles |
| Farmacia | 25 sep 2026 | Funcional | Inventario, alertas y entregas disponibles |
| Caja y donaciones | 25 sep 2026 | Funcional | Entradas, salidas, cuotas y pagos disponibles |
| Referencias médicas | 25 sep 2026 | Funcional | Flujo de estados y trazabilidad disponibles |
| Gastos médicos | 25 sep 2026 | Funcional | Cálculo, descuento, registro, consulta y anulación disponibles |
| Panel e indicadores | 28 sep 2026 | Funcional básico | Presenta indicadores operativos y financieros |
| Reportes | 28 sep 2026 | Parcial | Existe catálogo, resumen e impresión; no todos los informes cuentan con generación independiente |
| Integración de interfaz con las API | 28 sep 2026 | Implementada | La interfaz consume los tres servicios mediante Nginx |
| Validación, seguridad y control | 9 oct 2026 | Implementada parcialmente | Validaciones, sesiones firmadas y permisos por rol funcionan; falta el ciclo SQA completo |
| Pruebas automatizadas ampliadas | 9 oct 2026 | Implementadas | Existen 15 pruebas y la verificación continua de GitHub está aprobada |
| Autenticación y permisos por rol | Sin fecha detallada en el cronograma | Funcional desde 10 oct 2026 | Implementado fuera del detalle original del cronograma |

## Módulos que funcionan hoy

- Inicio de sesión y permisos para médico, enfermería, coordinación y administración.
- Residentes y fichas médicas.
- Visitas médicas.
- Órdenes y resultados de laboratorio.
- Inventario y entrega de medicamentos.
- Caja, cuotas, donaciones y pagos.
- Referencias médicas con trazabilidad de estados.
- Liquidaciones de gastos médicos y regla de descuento.
- Panel con indicadores básicos.

## Elementos que todavía no están completos

- Generación independiente de todos los reportes incluidos en el catálogo.
- Pruebas integrales y de aceptación del SQA, planificadas para el 23 y 30 de octubre de 2026.
- Prueba de usabilidad, planificada para el 6 de noviembre de 2026.
- Versión candidata, planificada para el 13 de noviembre de 2026.
- Acceso público con HTTPS, respaldos y monitoreo, planificado para el 20 de noviembre de 2026.
- Entrega final, planificada para el 27 de noviembre de 2026.

## Conclusión

Los módulos operativos principales se encuentran construidos y disponibles en código. El punto con avance parcial es la generación completa de reportes. Los hitos futuros de aceptación, usabilidad, versión candidata, acceso público y entrega final conservan las fechas del cronograma. Debido a que el historial actual de GitHub comienza el 10 de octubre de 2026, el repositorio prueba el estado actual del código, pero no acredita por sí solo la fecha exacta en que se terminó cada módulo anterior.
