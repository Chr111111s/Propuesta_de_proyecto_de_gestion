# Arquitectura Técnica — PiñaLog 360

## Objetivo técnico

PiñaLog 360 busca demostrar una solución logística full-stack enfocada en la trazabilidad de piñas, con una arquitectura simple, entendible y defendible en un contexto académico.

## Stack tecnológico

### Backend
- FastAPI
- Pydantic
- SQLite
- Uvicorn

### Frontend
- React
- TypeScript
- Vite
- CSS plano

## Razón de estas decisiones

- **FastAPI**: facilita exponer APIs limpias, documentadas y rápidas de implementar.
- **SQLite**: reduce complejidad de infraestructura para una demo local.
- **React + Vite**: permiten una interfaz moderna con arranque rápido.
- **TypeScript**: da consistencia entre payloads del backend y formularios del frontend.

## Arquitectura por capas

### 1. Capa de presentación
Ubicada en `frontend/src/`.

Responsabilidades:
- Mostrar métricas del dashboard.
- Capturar movimientos de entrada y salida.
- Capturar rutas de distribución.
- Mostrar inventario, bitácora y resumen estatal.
- Exportar la plantilla logística en CSV.

### 2. Capa de API
Ubicada en `backend/app/routers/`.

Responsabilidades:
- Exponer rutas HTTP del sistema.
- Separar dominios funcionales: dashboard, inventario, movimientos y distribución.
- Validar los datos de entrada a través de esquemas.

### 3. Capa de negocio y persistencia
Ubicada en `backend/app/services/repository.py`.

Responsabilidades:
- Consultar inventario, movimientos y rutas.
- Registrar entradas y salidas.
- Actualizar el inventario en función del tipo de movimiento.
- Consolidar métricas y reportes derivados.

### 4. Capa de datos
Ubicada en `backend/app/database.py`.

Responsabilidades:
- Crear la base de datos SQLite.
- Crear tablas iniciales.
- Insertar datos semilla para la demo.

## Estructura del proyecto

```text
backend/
  requirements.txt
  app/
    main.py
    database.py
    routers/
      dashboard.py
      distribution.py
      inventory.py
      movements.py
    schemas/
      logistics.py
    services/
      repository.py
  data/
    pinalog.db

frontend/
  package.json
  index.html
  src/
    App.tsx
    main.tsx
    services/
      api.ts
    types/
      logistics.ts
    styles.css
```

## Modelo de datos actual

### Tabla `inventory_items`
Representa inventario por lote.

Campos clave:
- `batch_code`
- `product_name`
- `origin`
- `state`
- `quantity`
- `volume_m3`
- `warehouse_location`
- `entry_date`
- `status`

### Tabla `movements`
Representa entradas y salidas registradas.

Campos clave:
- `folio`
- `movement_type`
- `partner`
- `quantity`
- `volume_m3`
- `state`
- `travel_time_hours`
- `responsible`
- `movement_date`
- `batch_code`
- `notes`

### Tabla `routes`
Representa rutas o canales de distribución.

Campos clave:
- `state_name`
- `destination`
- `travel_time_hours`
- `status`
- `responsible`
- `capacity_units`
- `last_maintenance`

## Reglas de negocio implementadas

- Una salida no puede registrarse si el lote no existe.
- Una salida no puede registrarse si no hay inventario suficiente.
- Una entrada crea un lote nuevo si no existe.
- Una entrada actualiza cantidad, volumen, estado y ubicación si el lote ya existe.
- Las métricas del dashboard se calculan a partir de inventario, movimientos y rutas.
- El resumen estatal consolida capacidad, promedio de traslado y rutas en mantenimiento.

## Datos semilla

La aplicación crea datos iniciales automáticamente para permitir la demo sin configuración adicional.

Incluye:
- 2 lotes de inventario.
- 3 movimientos.
- 3 rutas estatales.

## Decisiones de diseño para defensa académica

- Se priorizó **claridad** sobre complejidad empresarial.
- Se usó **persistencia local** para asegurar que el jurado pueda correr el proyecto en cualquier laptop.
- Se modularizó el backend para que el sistema sea defendible como base escalable.
- Se dejó el frontend en una sola vista para privilegiar la narrativa visual del demo.

## Limitaciones técnicas actuales

- Sin autenticación ni autorización.
- Sin pruebas automáticas.
- Sin paginación ni filtros avanzados.
- Sin base de datos multiusuario.
- Sin despliegue en nube.

## Ruta de crecimiento sugerida

### Fase 2
- Roles de usuario.
- Filtros por fecha/lote/estado.
- Exportación Excel/PDF.
- Historial de mantenimiento.

### Fase 3
- PostgreSQL.
- Despliegue cloud.
- Integración con GPS, ERP o sensores.
- KPIs históricos y pronóstico de demanda.
