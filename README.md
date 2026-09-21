# PiñaLog 360

PiñaLog 360 es un MVP de software logístico para control de inventario, movimientos de entrada/salida y distribución estatal de piñas.

## Documentación disponible

- `README.md`: vista general del proyecto.
- `docs/arquitectura-tecnica.md`: arquitectura, modelo de datos, estructura y decisiones técnicas.
- `docs/api-operacion.md`: endpoints, payloads y flujo de uso del sistema.
- `docs/presentacion-negociacion.md`: guion corto de presentación.
- `docs/banco-preguntas.md`: preguntas difíciles y respuestas cortas para defensa.
- `docs/guion-exposicion.md`: reparto sugerido para dos personas y cierre de negociación.

## Propuesta de valor

PiñaLog 360 automatiza la trazabilidad y la distribución estatal de piñas, reduciendo mermas y tiempos de traslado con control en tiempo real y reportes accionables.

## Qué incluye hoy

- Backend con FastAPI y SQLite.
- Frontend con React + Vite.
- Registro de entradas y salidas.
- Inventario por lote y bodega.
- Rutas de distribución estatal.
- Resumen estatal por capacidad y mantenimiento.
- Plantilla logística exportable a CSV.
- Dashboard con métricas operativas.

## Estado actual del MVP

- Funciona como demo full-stack local.
- Tiene datos semilla para mostrar inventario, movimientos y rutas sin carga previa.
- Permite registrar entradas y salidas que actualizan el inventario.
- Permite registrar rutas estatales y ver un resumen de cobertura/capacidad.
- Está orientado a presentación académica y validación conceptual.

## Arquitectura

### Backend

- `backend/app/main.py`: arranque de FastAPI y registro de routers.
- `backend/app/database.py`: creación de base SQLite y datos semilla.
- `backend/app/services/repository.py`: lógica de consulta y persistencia.
- `backend/app/routers/`: endpoints de dashboard, inventario, movimientos y distribución.
- `backend/app/schemas/logistics.py`: modelos Pydantic.

### Frontend

- `frontend/src/App.tsx`: dashboard principal.
- `frontend/src/services/api.ts`: cliente HTTP.
- `frontend/src/types/logistics.ts`: tipos del dominio.
- `frontend/src/styles.css`: estilos UI.

Para más detalle técnico, ver `docs/arquitectura-tecnica.md`.

## Requisitos

- Python 3.14+
- Node.js 20+
- npm 10+

## Instalación

### Backend

```bash
cd backend
../.venv/bin/pip install -r requirements.txt
../.venv/bin/uvicorn app.main:app --reload
```

API disponible en `http://127.0.0.1:8000`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend disponible en `http://127.0.0.1:5173`.

## Ejecución rápida

### Terminal 1 — Backend

```bash
cd /Users/josle/Desktop/pinalog-360/backend
/Users/josle/Desktop/pinalog-360/.venv/bin/python -m uvicorn app.main:app --reload
```

### Terminal 2 — Frontend

```bash
cd /Users/josle/Desktop/pinalog-360/frontend
npm run dev
```

### URLs de uso

- API: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- Frontend: `http://127.0.0.1:5173`

## Variables de entorno

### Frontend

- `VITE_API_BASE_URL`: URL base del backend.

## Endpoints principales

- `GET /dashboard/metrics`
- `GET /inventory`
- `GET /movements`
- `POST /movements`
- `GET /movements/template`
- `GET /distribution/routes`
- `POST /distribution/routes`
- `GET /distribution/summary/states`

Payloads y respuestas de ejemplo están documentados en `docs/api-operacion.md`.

## Flujo logístico

1. Se registra la entrada de piñas con folio, lote, origen y responsable.
2. El sistema actualiza inventario por bodega y estado del producto.
3. Se programan rutas de distribución por estado.
4. Se registran salidas y tiempos de traslado.
5. El dashboard consolida inventario, movimientos y cobertura estatal.
6. La plantilla logística se exporta para operación o exposición.

## Beneficio de negocio estimado

Ejemplo académico:

- Operación anual: 1,000,000 kg.
- Merma actual: 8%.
- Merma objetivo con trazabilidad: 4%.
- Ahorro recuperado: 40,000 kg.
- Si el valor promedio es 5 MXN/kg, el ahorro potencial es 200,000 MXN anuales.
- Si además se reduce 10% del costo de transporte sobre 1,000,000 MXN anuales, el ahorro adicional sería 100,000 MXN.

Ahorro estimado total: 300,000 MXN/año.

## Guía breve para la exposición

### Presentador A

- Problema logístico actual.
- Nombre del software y propuesta de valor.
- Módulos de entradas/salidas, inventario y distribución.
- Flujo del proceso logístico.

### Presentador B

- Plantilla logística exportable.
- Resumen estatal y métricas.
- Beneficio económico y viabilidad.
- Manejo de objeciones y preguntas críticas.

Versión extendida del discurso en `docs/guion-exposicion.md`.

## Objeciones frecuentes

- **“Ya existe”**: PiñaLog 360 está verticalizado para el manejo de piñas y reduce parametrización inicial.
- **“Es caro”**: el enfoque por MVP permite validar ROI antes de una inversión mayor.
- **“No escala”**: el backend está modularizado y el frontend ya consume APIs separadas por dominio.
- **“¿Por qué piñas?”**: es un producto perecedero con fuerte necesidad de trazabilidad, ideal para demostrar impacto.

## Próximas mejoras sugeridas

- Autenticación y roles.
- Exportación PDF/Excel.
- Historial formal de mantenimiento de rutas.
- Reportes con filtros por fecha, lote y estado.
- Pruebas automáticas backend/frontend.

## Alcance y límites actuales

- No incluye autenticación de usuarios.
- No incluye exportación PDF/Excel, solo CSV.
- No incluye integración real con sensores, GPS o ERP.
- No incluye despliegue productivo ni monitoreo.
- Usa SQLite local para simplificar la demo.
