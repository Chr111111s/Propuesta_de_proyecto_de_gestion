# API y Operación — PiñaLog 360

## Base URL

- Local: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`

## Flujo recomendado de uso

1. Consultar métricas del dashboard.
2. Consultar inventario actual.
3. Registrar una entrada o salida.
4. Verificar que el inventario cambió.
5. Registrar o consultar rutas estatales.
6. Consultar resumen estatal.
7. Exportar plantilla logística desde el frontend.

## Endpoints disponibles

### `GET /`
Verifica que la API está activa.

Respuesta esperada:

```json
{
  "message": "PiñaLog 360 API operativa"
}
```

### `GET /dashboard/metrics`
Devuelve las métricas generales del tablero.

Respuesta ejemplo:

```json
{
  "total_units": 1800,
  "total_volume_m3": 27.0,
  "active_routes": 2,
  "monthly_movements": 3,
  "estimated_waste_reduction_pct": 3.5
}
```

### `GET /inventory`
Lista el inventario actual por lote.

Campos relevantes por fila:
- `batch_code`
- `product_name`
- `origin`
- `state`
- `quantity`
- `volume_m3`
- `warehouse_location`
- `entry_date`
- `status`

### `GET /movements`
Lista la bitácora completa de entradas y salidas.

### `POST /movements`
Registra un movimiento logístico.

Payload ejemplo para entrada:

```json
{
  "folio": "EN-00150",
  "movement_type": "entrada",
  "partner": "Finca La Esperanza",
  "quantity": 600,
  "volume_m3": 8.5,
  "state": "Recibido",
  "travel_time_hours": 1.5,
  "responsible": "Laura Méndez",
  "movement_date": "2026-09-20",
  "batch_code": "LOT-PI-003",
  "notes": "Ingreso para almacenamiento inmediato",
  "product_name": "Piña Miel",
  "origin": "Veracruz",
  "warehouse_location": "Bodega A2",
  "status": "Fresco"
}
```

Payload ejemplo para salida:

```json
{
  "folio": "SA-00500",
  "movement_type": "salida",
  "partner": "Centro de Distribución Puebla",
  "quantity": 200,
  "volume_m3": 3.0,
  "state": "Despachado",
  "travel_time_hours": 4.2,
  "responsible": "Jorge Salinas",
  "movement_date": "2026-09-21",
  "batch_code": "LOT-PI-001",
  "notes": "Salida programada",
  "product_name": "Piña Miel",
  "origin": "Veracruz",
  "warehouse_location": "Bodega A1",
  "status": "Fresco"
}
```

Reglas:
- Si el lote no existe para una salida, la API responde error.
- Si no hay suficiente inventario, la API responde error.

### `GET /movements/template`
Devuelve la plantilla logística consolidada, lista para exportación.

Campos:
- `movement_date`
- `folio`
- `provider_or_destination`
- `quantity`
- `volume_m3`
- `state`
- `travel_time_hours`
- `responsible`
- `movement_type`
- `batch_code`

### `GET /distribution/routes`
Lista rutas registradas.

### `POST /distribution/routes`
Crea una ruta estatal.

Payload ejemplo:

```json
{
  "state_name": "Oaxaca",
  "destination": "Centro de Distribución Oaxaca",
  "travel_time_hours": 5.2,
  "status": "Programada",
  "responsible": "Ana Torres",
  "capacity_units": 650,
  "last_maintenance": "2026-09-18"
}
```

### `GET /distribution/summary/states`
Consolida cobertura logística por estado.

Respuesta ejemplo:

```json
[
  {
    "state_name": "Veracruz",
    "route_count": 1,
    "active_routes": 1,
    "maintenance_routes": 0,
    "total_capacity_units": 800,
    "average_travel_time_hours": 2.67
  }
]
```

## Uso del frontend para la demo

### Paso 1
Abrir el dashboard.

### Paso 2
Mostrar métricas de stock, volumen, rutas y cobertura estatal.

### Paso 3
Registrar un movimiento de entrada o salida.

### Paso 4
Enseñar cómo cambia el inventario y la bitácora.

### Paso 5
Mostrar el resumen estatal.

### Paso 6
Exportar la plantilla logística en CSV.

## Casos de demostración sugeridos

### Caso 1 — Entrada nueva
- Registrar un lote nuevo.
- Comprobar que aparece en inventario.

### Caso 2 — Salida válida
- Registrar una salida de un lote existente.
- Comprobar que disminuye el inventario.

### Caso 3 — Validación de error
- Intentar sacar más inventario del disponible.
- Mostrar que el backend protege la operación.

## Mensaje recomendado durante el demo

“Lo importante aquí no es solo guardar datos, sino que cada captura impacta inventario, bitácora y distribución. Eso es lo que convierte la herramienta en una solución logística y no solo en una tabla digital.”
