"""Carga adicional y explícita de datos ficticios: python -m app.seed_demo."""
from __future__ import annotations

import json
import sqlite3
from contextlib import closing
from datetime import date, datetime, timedelta

from app.database import DB_PATH, get_connection, init_db

SEED_KEY = "expanded-demo-v1"
UNIT_VOLUME = 0.015

# Destinos de referencia que reconoce el catálogo local del mapa.
DESTINATIONS = [
    ("Veracruz", "Centro mayorista Veracruz", 2.5),
    ("Puebla", "Central de abasto Puebla", 4.0),
    ("Oaxaca", "Distribuidora regional Oaxaca", 7.5),
    ("Tabasco", "Centro de distribución Tabasco", 6.0),
    ("Chiapas", "Mayorista regional Chiapas", 10.5),
    ("Yucatán", "Central de abasto Mérida", 14.0),
    ("Campeche", "Comercializadora Campeche", 11.0),
    ("Quintana Roo", "Distribuidora Cancún", 17.0),
    ("Ciudad de México", "Central de abasto CDMX", 6.0),
    ("Nuevo León", "Centro mayorista Monterrey", 15.5),
    ("Jalisco", "Mercado de abastos Guadalajara", 12.5),
    ("Querétaro", "Centro de distribución Querétaro", 8.0),
    ("Hidalgo", "Comercializadora Hidalgo", 5.5),
    ("Tamaulipas", "Distribuidora regional Tamaulipas", 10.0),
    ("San Luis Potosí", "Central de abasto San Luis Potosí", 9.5),
    ("Puebla", "Centro de reparto Puebla", 4.5),
    ("Veracruz", "Empacadora regional Veracruz", 3.0),
    ("Yucatán", "Distribuidora hotelera Mérida", 14.5),
]
PEOPLE = ["Laura Méndez", "Carlos Rivera", "Jorge Salinas", "Ana Torres",
          "Diego Ramos", "Mariana López", "Daniel Cruz", "Sofía Herrera"]
SUPPLIERS = [
    ("Cooperativa demo del Papaloapan", "Veracruz"),
    ("Productores demo de la Cuenca", "Oaxaca"),
    ("Agrocomercial demo del Sureste", "Tabasco"),
    ("Unión demo de productores del Sur", "Chiapas"),
]
WAREHOUSES = ["Bodega A1", "Bodega B2", "Bodega C1", "Bodega D2", "Bodega E1", "Bodega F2"]


def add_demo_data(connection: sqlite3.Connection, as_of: date) -> dict:
    """Inserta un escenario reconciliado sin tocar filas existentes."""
    with connection:
        connection.execute("BEGIN IMMEDIATE")
        connection.execute("""
            CREATE TABLE IF NOT EXISTS demo_seed_runs (
                seed_key TEXT PRIMARY KEY,
                reference_date TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        if connection.execute("SELECT 1 FROM demo_seed_runs WHERE seed_key = ?", (SEED_KEY,)).fetchone():
            return {"added": False, "reason": "El escenario ya está cargado. No se modificaron registros."}

        route_statuses = ["Operativa", "Programada", "Operativa", "En tránsito", "Operativa", "En mantenimiento"]
        for index, (state, destination, hours) in enumerate(DESTINATIONS):
            connection.execute("""
                INSERT INTO routes (state_name, destination, travel_time_hours, status,
                    responsible, capacity_units, last_maintenance)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (state, f"{destination} (demo)", hours, route_statuses[index % len(route_statuses)],
                  PEOPLE[index % len(PEOPLE)], 1200 + (index % 5) * 200,
                  (as_of - timedelta(days=4 + index % 18)).isoformat()))

        for index in range(48):
            batch = f"DEMO-PI-{index + 1:03d}"
            age = index % 14
            received_on = as_of - timedelta(days=age)
            supplier, origin_state = SUPPLIERS[index % len(SUPPLIERS)]
            first_entry = 900 + (index % 7) * 100
            second_entry = 300 + (index % 4) * 60
            remaining = [90, 140, 220, 290, 380, 460, 540, 620][index % 8]
            dispatched = first_entry + second_entry - remaining
            first_exit = dispatched // 3
            second_exit = dispatched // 3
            third_exit = dispatched - first_exit - second_exit
            status = "Stock crítico" if remaining <= 180 else "Alerta de stock" if remaining <= 320 else "Maduración media" if age > 8 else "Fresco"
            connection.execute("""
                INSERT INTO inventory_items (product_name, batch_code, origin, state, quantity,
                    volume_m3, warehouse_location, entry_date, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (["Piña Miel", "Piña Golden", "Piña MD2"][index % 3], batch, supplier, origin_state,
                  remaining, round(remaining * UNIT_VOLUME, 3), WAREHOUSES[index % len(WAREHOUSES)],
                  received_on.isoformat(), status))

            events = [
                ("entrada", first_entry, 0),
                ("entrada", second_entry, 1),
                ("salida", first_exit, 1),
                ("salida", second_exit, 2),
                ("salida", third_exit, 3),
            ]
            for event_index, (kind, quantity, offset) in enumerate(events):
                event_date = received_on + timedelta(days=min(age, offset))
                _, destination, hours = DESTINATIONS[(index + event_index) % len(DESTINATIONS)]
                state = "Recibido" if kind == "entrada" else "Entregado"
                if kind == "salida" and event_date >= as_of - timedelta(days=1):
                    state = ["En tránsito", "Entregado", "Retrasado"][index % 3]
                prefix = "EN" if kind == "entrada" else "SA"
                connection.execute("""
                    INSERT INTO movements (folio, movement_type, partner, quantity, volume_m3,
                        state, travel_time_hours, responsible, movement_date, batch_code, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (f"DEMO-{prefix}-{index + 1:03d}-{event_index + 1}", kind,
                      supplier if kind == "entrada" else f"{destination} (demo)", quantity,
                      round(quantity * UNIT_VOLUME, 3), state, 2 + (index % 5) * 0.5 if kind == "entrada" else hours,
                      PEOPLE[(index + event_index) % len(PEOPLE)], event_date.isoformat(), batch,
                      "SIMULACIÓN: registro ficticio para demostración. " +
                      ("Recepción y revisión del lote." if kind == "entrada" else "Salida descontada del inventario, pendiente de recepción si está en tránsito.")))

        connection.execute("INSERT INTO demo_seed_runs VALUES (?, ?, ?)",
                           (SEED_KEY, as_of.isoformat(), datetime.now().isoformat(timespec="seconds")))
    return {"added": True, "lots": 48, "movements": 240, "entries": 96, "exits": 144,
            "routes": len(DESTINATIONS), "warehouses": len(WAREHOUSES), "reference_date": as_of.isoformat()}


def main() -> None:
    # La API puede estar abierta: backup() toma una copia consistente de SQLite.
    backup_path = None
    if DB_PATH.exists():
        backup_path = DB_PATH.parent / "backups" / f"before-demo-{datetime.now():%Y%m%d-%H%M%S-%f}.sqlite3"
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        with closing(get_connection()) as source, closing(sqlite3.connect(backup_path)) as backup:
            source.backup(backup)
    init_db()
    with closing(get_connection()) as connection:
        result = add_demo_data(connection, date.today())
    print(json.dumps({**result, "backup": str(backup_path) if backup_path else None}, ensure_ascii=False))


if __name__ == "__main__":
    main()
