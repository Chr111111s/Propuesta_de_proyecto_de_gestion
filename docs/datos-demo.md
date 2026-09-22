# Datos de demostración

Desde `backend`, ejecutar con el Python del entorno virtual:

```powershell
.\.venv\Scripts\python.exe -m app.seed_demo
```

La carga agrega 48 lotes, 96 entradas, 144 salidas y 18 rutas. Distribuye el inventario entre seis bodegas, con stock crítico, alertas y producto disponible. Las fechas se calculan a partir del día de ejecución y cubren los últimos 14 días. No son operaciones ni resultados reales.

Los lotes y folios llevan el prefijo `DEMO-`. Los proveedores y destinos incluyen la indicación de demostración y las notas de los movimientos indican `SIMULACIÓN`.

Cada lote conserva un saldo igual a entradas menos salidas, tanto en unidades como en volumen. Las salidas en tránsito ya se descuentan del stock en bodega. El volumen utiliza la misma referencia ilustrativa de 0.015 m³ por unidad que la demo original.

El comando conserva todas las filas existentes y respalda SQLite en `backend/data/backups/` antes de insertar. Una transacción revierte toda la carga ante un conflicto. La tabla `demo_seed_runs` evita repetir este escenario, incluso si se ejecuta otro día. Las fechas no se desplazan al reiniciar y la API no carga esta ampliación automáticamente.

Después de cargar, usar **Actualizar** en el frontend. La API lee la misma base de datos sin necesitar reinicio. Los filtros y la exportación CSV incluyen también los registros simulados.

Validación en bases temporales, sin modificar la base de trabajo:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```
