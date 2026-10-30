# Reportes y limitaciones para SQA

Fecha de revisión: 29 de octubre de 2026.

## Informes disponibles

El módulo Reportes permite a Administración y Coordinación generar seis informes independientes, filtrados por residente y rango de fechas, e imprimir o guardar el resultado como PDF. Los datos provienen de las API y las bases de datos; los totales utilizan únicamente los registros incluidos por los filtros.

1. Costos de citas: liquidaciones finalizadas con consulta, laboratorio, farmacia, descuento y total.
2. Análisis médico: visitas registradas con motivo, diagnóstico y tratamiento.
3. Cobros: cuotas familiares recibidas y liquidaciones finalizadas por separado, para evitar sumar dos veces un posible pago.
4. Pagos a fundación: movimientos de salida clasificados como pago a fundación.
5. Donaciones y cobros: entradas de caja por categoría y procedencia.
6. Exámenes y medicamentos: órdenes de laboratorio y entregas de farmacia registradas.

Los filtros de fecha usan la fecha almacenada para cada registro. En liquidaciones se utiliza la fecha de registro, no la fecha de la cita. Las liquidaciones anuladas no se incluyen en los totales de los reportes de costos y cobros.

## Limitaciones conocidas

- El sistema no registra un campo independiente de motivo de ingreso; el informe médico muestra los datos disponibles de las visitas.
- Los pagos a fundación se registran como movimientos de caja y no contienen un desglose obligatorio por consulta, laboratorio y farmacia.
- El sistema aún no concilia automáticamente los cargos y los pagos para calcular un saldo individual de cuenta familiar.
- Los servicios usan bases de datos separadas y actualmente no garantizan mediante una clave foránea que el residente o la visita de una liquidación exista en la base administrativa. En los datos de demostración hay una liquidación para el residente 16 que no aparece en el registro administrativo. Los reportes lo señalan como no encontrado; no se han eliminado ni modificado datos existentes.
- La acción de convertir una referencia registra el identificador de una visita en la base de referencias, pero no crea ni verifica la visita en la base administrativa. Ese flujo requiere integración adicional antes de considerarse completo.
- Las pruebas automáticas y las comprobaciones locales no sustituyen la ejecución y aceptación independientes del plan SQA.
- Antes de usar datos reales, faltan despliegue seguro, gestión real de usuarios, respaldo y restauración verificada, auditoría de accesos y revisión de seguridad.

## Comprobaciones realizadas

- Compilación de los tres servicios y sus 15 pruebas automáticas.
- Consulta de los seis informes desde la interfaz con datos de demostración y prueba del filtro por residente.
- Acceso a los dos nuevos recursos de reportes: permitido a Administración y Coordinación y rechazado para Médico y Enfermería.
- No se registraron transacciones nuevas ni se alteraron las bases para estas comprobaciones.
