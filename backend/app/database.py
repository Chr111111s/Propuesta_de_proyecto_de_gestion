from __future__ import annotations

import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "pinalog.db"


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.executescript(
            """
            CREATE TABLE IF NOT EXISTS inventory_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_name TEXT NOT NULL,
                batch_code TEXT NOT NULL UNIQUE,
                origin TEXT NOT NULL,
                state TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                volume_m3 REAL NOT NULL,
                warehouse_location TEXT NOT NULL,
                entry_date TEXT NOT NULL,
                status TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS movements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                folio TEXT NOT NULL UNIQUE,
                movement_type TEXT NOT NULL,
                partner TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                volume_m3 REAL NOT NULL,
                state TEXT NOT NULL,
                travel_time_hours REAL NOT NULL,
                responsible TEXT NOT NULL,
                movement_date TEXT NOT NULL,
                batch_code TEXT NOT NULL,
                notes TEXT
            );

            CREATE TABLE IF NOT EXISTS routes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                state_name TEXT NOT NULL,
                destination TEXT NOT NULL,
                travel_time_hours REAL NOT NULL,
                status TEXT NOT NULL,
                responsible TEXT NOT NULL,
                capacity_units INTEGER NOT NULL,
                last_maintenance TEXT NOT NULL
            );
            """
        )
        connection.commit()

    seed_data()


def seed_data() -> None:
    with get_connection() as connection:
        cursor = connection.cursor()
        inventory_count = cursor.execute("SELECT COUNT(*) FROM inventory_items").fetchone()[0]
        movements_count = cursor.execute("SELECT COUNT(*) FROM movements").fetchone()[0]
        routes_count = cursor.execute("SELECT COUNT(*) FROM routes").fetchone()[0]

        if inventory_count == 0:
            cursor.executemany(
                """
                INSERT INTO inventory_items (
                    product_name, batch_code, origin, state, quantity, volume_m3,
                    warehouse_location, entry_date, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    ("Piña Miel", "LOT-PI-001", "AgroPiña del Golfo", "Veracruz", 1200, 18.0, "Bodega A1", "2026-09-20", "Fresco"),
                    ("Piña Golden", "LOT-PI-002", "Productores Unidos del Sur", "Oaxaca", 900, 13.5, "Bodega B2", "2026-09-20", "Maduración media"),
                ],
            )

        if movements_count == 0:
            cursor.executemany(
                """
                INSERT INTO movements (
                    folio, movement_type, partner, quantity, volume_m3, state,
                    travel_time_hours, responsible, movement_date, batch_code, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    ("EN-00125", "entrada", "AgroPiña del Golfo", 1200, 18.0, "Recibido", 2.25, "Laura Méndez", "2026-09-20", "LOT-PI-001", "Entrega completa"),
                    ("EN-00126", "entrada", "Productores Unidos del Sur", 900, 13.5, "Recibido", 1.83, "Carlos Rivera", "2026-09-20", "LOT-PI-002", "Revisión aprobada"),
                    ("SA-00452", "salida", "Centro de Distribución Veracruz", 300, 4.5, "Entregado", 2.67, "Jorge Salinas", "2026-09-21", "LOT-PI-001", "Despacho prioritario"),
                ],
            )
            cursor.execute(
                "UPDATE inventory_items SET quantity = quantity - 300, volume_m3 = volume_m3 - 4.5 WHERE batch_code = 'LOT-PI-001'"
            )

        if routes_count == 0:
            cursor.executemany(
                """
                INSERT INTO routes (
                    state_name, destination, travel_time_hours, status,
                    responsible, capacity_units, last_maintenance
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    ("Veracruz", "Centro de Distribución Veracruz", 2.67, "Operativa", "Jorge Salinas", 800, "2026-09-10"),
                    ("Xalapa", "Centro de Distribución Xalapa", 3.17, "Programada", "Ana Torres", 700, "2026-09-12"),
                    ("Puebla", "Mayorista Estatal Norte", 4.08, "En mantenimiento", "Diego Ramos", 500, "2026-09-08"),
                ],
            )

        connection.commit()
