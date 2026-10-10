# Plan de aseguramiento de calidad de software (SQA)

## Control del documento

| Dato | Valor |
| --- | --- |
| Proyecto | Sistema del Asilo Cabeza de Algodón |
| Curso | Análisis de Sistemas II |
| Versión | 1.0 |
| Fecha de corte | 10 de octubre de 2026 |
| Rama evaluada | `main` |
| Repositorio | `ReadyPancake420/asilo-cabeza-de-algodon` |

## 1. Propósito

Este plan define cómo se revisará la calidad funcional y técnica del prototipo. Su objetivo es encontrar defectos antes de la aceptación, conservar evidencia reproducible y establecer una regla común para decidir cuándo una versión puede pasar al siguiente hito.

El SQA debe evaluar resultados observables. No debe modificar datos para ocultar fallos ni cerrar un defecto sin evidencia de la corrección y de su regresión.

## 2. Alcance

### Incluido

- Interfaz web y navegación.
- Residentes y fichas médicas.
- Visitas médicas.
- Laboratorio.
- Farmacia e inventario.
- Caja, cuotas y donaciones.
- Referencias médicas y su línea de tiempo.
- Liquidaciones, descuentos y anulaciones.
- Reportes básicos.
- Contratos REST, validaciones y respuestas de error.
- Integridad de las tres bases MySQL.
- Construcción reproducible con Docker Compose.
- Compilación, pruebas unitarias y flujo de GitHub Actions.
- Inicio de sesión, vencimiento de sesión y autorización por roles.

### Fuera del alcance actual

Los siguientes elementos se documentan como brechas y no deben marcarse como aprobados hasta que exista implementación verificable:

- Recuperación y bloqueo de cuentas.
- Swagger u OpenAPI.
- Despliegue público, HTTPS, copias de seguridad y monitoreo.
- Pruebas con información real de residentes.

## 3. Objetivos de calidad

1. Confirmar que cada operación principal produce el resultado esperado.
2. Impedir pérdida o corrupción de datos ante validaciones y conflictos.
3. Verificar que el inventario nunca quede negativo.
4. Verificar que una referencia solo avance por transiciones permitidas.
5. Verificar que una visita solo tenga una liquidación activa registrada.
6. Comprobar que el descuento se calcule y redondee al centavo.
7. Comprobar que la cuota mensual quede fuera de la liquidación médica.
8. Mantener una compilación limpia y pruebas automáticas aprobadas.
9. Registrar cada hallazgo con pasos, evidencia, severidad y versión.

## 4. Ambiente de pruebas

| Elemento | Configuración |
| --- | --- |
| Sistema operativo principal | Windows 10 u 11 |
| Contenedores | Docker Desktop y Docker Compose |
| Interfaz | `http://localhost:8080` |
| API de gastos | `http://localhost:3001` |
| API de referencias | `http://localhost:3002` |
| API administrativa | `http://localhost:3003` |
| Bases de datos | MySQL 8 en los puertos 3307, 3308 y 3309 |
| Datos | Semilla ficticia incluida en los scripts SQL |
| Colección API | `postman/Asilo-Cabeza-de-Algodon.postman_collection.json` |

No se debe utilizar información personal, clínica o financiera real. Las capturas y reportes deben ocultar cualquier dato sensible que se agregue accidentalmente.

## 5. Estrategia de pruebas

| Tipo | Objetivo | Ejecución |
| --- | --- | --- |
| Humo | Confirmar que interfaz y tres APIs estén disponibles | En cada despliegue de prueba |
| Unitarias | Validar reglas aisladas de descuentos y referencias | En cada push y pull request |
| Funcionales | Verificar flujos positivos por módulo | En cada ciclo SQA |
| Negativas | Probar datos inválidos, faltantes y estados prohibidos | En cada ciclo SQA |
| Integración | Validar interacción entre interfaz, APIs y bases | Antes de aceptación |
| Concurrencia | Evitar inventario negativo y actualizaciones perdidas | Antes de versión candidata |
| Regresión | Confirmar que una corrección no rompa funciones aprobadas | Por cada corrección y release |
| Usabilidad | Revisar claridad, mensajes y navegación | Con usuarios representativos |
| Seguridad básica | Revisar secretos, validación, cabeceras y exposición | Antes de cualquier despliegue |

Los casos ejecutables se encuentran en [CASOS_DE_PRUEBA_SQA.md](CASOS_DE_PRUEBA_SQA.md).

## 6. Criterios de entrada

Un ciclo formal puede comenzar cuando:

- La versión está identificada por rama y commit.
- GitHub Actions termina correctamente.
- Las tres APIs responden `status: ok`.
- La interfaz carga sin errores bloqueantes.
- Los datos semilla están disponibles o existe un procedimiento de reinicio.
- La colección de Postman coincide con las rutas publicadas.
- Los cambios incluidos y las brechas conocidas están documentados.

## 7. Criterios de salida y aceptación

Una versión puede aprobarse para el siguiente hito cuando:

- El 100 % de los casos críticos fue ejecutado y aprobado.
- Al menos el 95 % del total de casos ejecutados fue aprobado.
- No existen defectos S1 o S2 abiertos.
- Los defectos S3 aceptados tienen responsable y fecha.
- La regresión de las correcciones está aprobada.
- GitHub Actions está en verde para el commit evaluado.
- Se adjuntó evidencia del ciclo y un resumen de resultados.
- Coordinación o la persona responsable acepta el resultado.

La versión se rechaza si hay pérdida de datos, inventario negativo, cálculos monetarios incorrectos, acceso no autorizado o imposibilidad de iniciar el sistema.

## 8. Severidad y prioridad

La severidad describe el impacto técnico. La prioridad indica cuándo debe atenderse.

| Nivel | Definición | Ejemplos | Tratamiento |
| --- | --- | --- | --- |
| S1 Bloqueante | El sistema no puede probarse o existe pérdida/exposición grave | No inicia, base corrupta, datos sensibles expuestos | Corregir inmediatamente; detiene el ciclo |
| S2 Crítico | Falla una función principal sin alternativa segura | Cobro incorrecto, inventario negativo, referencia en estado imposible | Corregir antes de aceptar la versión |
| S3 Mayor | Función degradada con alternativa temporal | Filtro incorrecto, mensaje confuso que permite continuar | Planificar en el ciclo actual o siguiente |
| S4 Menor | Impacto bajo o principalmente visual | Alineación, texto o formato sin afectar datos | Corregir según prioridad disponible |

| Prioridad | Regla |
| --- | --- |
| P0 | Atención inmediata; bloquea pruebas o entrega |
| P1 | Debe resolverse antes del hito actual |
| P2 | Debe planificarse para el siguiente ciclo |
| P3 | Mejora o deuda aceptada |

## 9. Flujo de un defecto

1. **Nuevo:** SQA registra el defecto con la plantilla de GitHub.
2. **Confirmado:** se reproduce y se asignan severidad y prioridad.
3. **En corrección:** desarrollo vincula rama o pull request.
4. **Listo para validar:** la corrección está en el ambiente acordado.
5. **En revalidación:** SQA repite el caso y la regresión relacionada.
6. **Cerrado:** evidencia aprobada y resultado esperado.
7. **Reabierto:** el problema persiste o reaparece.

No debe cerrarse un defecto solo porque el código cambió. SQA debe comprobar el comportamiento final.

## 10. Evidencia obligatoria

Cada ejecución debe registrar:

- Identificador del caso de prueba.
- Fecha, responsable y ambiente.
- Rama y SHA del commit.
- Datos ficticios utilizados.
- Resultado esperado y resultado observado.
- Estado: aprobado, fallido, bloqueado o no ejecutado.
- Captura, respuesta HTTP o fragmento de registro cuando sea relevante.
- Enlace al defecto si el caso falla.

Las evidencias no deben contener contraseñas, tokens, archivos `.env` ni datos reales de residentes.

## 11. Responsabilidades

| Rol | Responsabilidad |
| --- | --- |
| SQA | Diseñar y ejecutar casos, registrar evidencia, reportar defectos y revalidar |
| Desarrollo | Corregir defectos, agregar pruebas y explicar el alcance de cada cambio |
| Coordinación | Priorizar, aceptar riesgos y aprobar hitos |
| Administración funcional | Validar reglas de caja, farmacia y operación del asilo |
| Personal clínico representativo | Validar claridad de los flujos médicos sin usar datos reales |

## 12. Calendario de referencia

| Hito | Fecha del plan | Entregable SQA |
| --- | --- | --- |
| Primera integración y aceptación | 23 oct 2026 | Informe del primer ciclo |
| Hito de aceptación | 30 oct 2026 | Matriz ejecutada y defectos priorizados |
| Prueba de usabilidad | 6 nov 2026 | Hallazgos de usuarios representativos |
| Versión candidata | 13 nov 2026 | Regresión completa |
| Acceso público | 20 nov 2026 | Verificación de seguridad y operación |
| Entrega final | 27 nov 2026 | Informe final de calidad |

Las fechas deben actualizarse si cambian el alcance o la disponibilidad del ambiente.

## 13. Métricas del ciclo

- Casos planificados, ejecutados, aprobados, fallidos y bloqueados.
- Porcentaje de aprobación.
- Defectos abiertos y cerrados por severidad.
- Tiempo promedio desde registro hasta corrección.
- Defectos reabiertos.
- Cobertura de módulos y requisitos.
- Estado de la compilación y de las pruebas automáticas.

## 14. Riesgos principales

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| Credenciales de demostración conocidas | Acceso si el entorno se publica sin cambiar secretos | Limitar al entorno local y reemplazar usuarios y claves antes de desplegar |
| Cobertura automática reducida | Regresiones no detectadas | Automatizar primero los casos críticos |
| Tres bases independientes | Inconsistencias entre identificadores lógicos | Probar flujos completos y trazabilidad |
| Credenciales de demostración | Uso accidental fuera del entorno local | Mantener secretos reales fuera del repositorio |
| Falta de respaldo verificado | Pérdida de información | Diseñar y probar restauración antes de producción |
| Cronograma desactualizado | Fechas de calidad poco confiables | Actualizar avances y responsables por ciclo |
