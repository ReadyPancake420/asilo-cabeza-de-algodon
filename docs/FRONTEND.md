# Frontend del Sistema Cabeza de Algodón

El frontend representa la aplicación principal descrita en el proyecto final. Se ejecuta en `http://localhost:8080` y está construido con HTML, CSS y JavaScript sin dependencias externas, servido por Nginx dentro de Docker.

## Módulos incluidos

1. **Resumen:** indicadores de residentes, citas, referencias, gastos, ocupación y agenda.
2. **Residentes:** directorio, búsqueda, habitación, padecimiento, responsable y estado.
3. **Fichas médicas:** datos clínicos, psicopatología, medicinas de cajón e historial de visitas.
4. **Citas y referencias:** creación y trazabilidad completa conectadas al microservicio del puerto 3002.
5. **Laboratorio:** órdenes, exámenes, médico solicitante y estado de resultados.
6. **Farmacia:** inventario, presentación, precio especial y alertas de existencia.
7. **Gastos médicos:** formulario editable, cálculo y registro conectados al microservicio del puerto 3001.
8. **Caja y donaciones:** entradas, cuotas familiares, gastos, pagos a la fundación y saldo.
9. **Reportes:** catálogo de los informes requeridos y visualizaciones financieras y médicas.

## Integración actual

- **Conectado a API real:** liquidaciones y cálculo de gastos médicos.
- **Conectado a API real:** creación, consulta y cambios de estado de referencias médicas.
- **Conectado a API real:** residentes y fichas con historial de visitas.
- **Conectado a API real:** órdenes y resultados de laboratorio.
- **Conectado a API real:** inventario y entregas de farmacia con descuento de existencias.
- **Conectado a API real:** movimientos de caja, donaciones y pagos familiares.
- **Conectado a API real:** indicadores administrativos para el panel y los reportes.

## Archivos principales

- `demo-ui/index.html`: estructura y vistas del sistema.
- `demo-ui/styles.css`: diseño adaptable para escritorio, tableta y teléfono.
- `demo-ui/app.js`: navegación, datos de demostración e integración REST.
- `demo-ui/nginx.conf`: publicación del frontend y proxy hacia los microservicios.
- `administration-service/`: API de los módulos principales y su modelo MySQL.

## Ejecución

Después de iniciar Docker Desktop, ejecute `ABRIR_APLICACION.cmd`. El acceso construye los contenedores, espera las conexiones y abre el frontend en Microsoft Edge.

Los datos iniciales son ficticios y se utilizan únicamente para demostrar el funcionamiento. Los nuevos registros creados desde los formularios permanecen en MySQL hasta que se modifiquen o se restablezca el volumen de desarrollo.
