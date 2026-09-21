from __future__ import annotations

from fastapi import HTTPException

from app.database import get_connection
from app.schemas.logistics import MovementCreate, RouteCreate


def list_inventory() -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM inventory_items ORDER BY entry_date DESC, id DESC"
        ).fetchall()
        return [dict(row) for row in rows]


def list_movements() -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM movements ORDER BY movement_date DESC, id DESC"
        ).fetchall()
        return [dict(row) for row in rows]


def list_logistics_template_rows() -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                movement_date,
                folio,
                partner AS provider_or_destination,
                quantity,
                volume_m3,
                state,
                travel_time_hours,
                responsible,
                movement_type,
                batch_code
            FROM movements
            ORDER BY movement_date DESC, id DESC
            """
        ).fetchall()
        return [dict(row) for row in rows]


def list_routes() -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM routes ORDER BY id DESC"
        ).fetchall()
        return [dict(row) for row in rows]


def get_distribution_state_summary() -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                state_name,
                COUNT(*) AS route_count,
                SUM(CASE WHEN status IN ('Operativa', 'Programada') THEN 1 ELSE 0 END) AS active_routes,
                SUM(CASE WHEN status = 'En mantenimiento' THEN 1 ELSE 0 END) AS maintenance_routes,
                COALESCE(SUM(capacity_units), 0) AS total_capacity_units,
                ROUND(AVG(travel_time_hours), 2) AS average_travel_time_hours
            FROM routes
            GROUP BY state_name
            ORDER BY total_capacity_units DESC, state_name ASC
            """
        ).fetchall()
        return [dict(row) for row in rows]


def get_dashboard_metrics() -> dict:
    with get_connection() as connection:
        total_units = connection.execute(
            "SELECT COALESCE(SUM(quantity), 0) FROM inventory_items"
        ).fetchone()[0]
        total_volume = connection.execute(
            "SELECT COALESCE(SUM(volume_m3), 0) FROM inventory_items"
        ).fetchone()[0]
        active_routes = connection.execute(
            "SELECT COUNT(*) FROM routes WHERE status IN ('Operativa', 'Programada')"
        ).fetchone()[0]
        monthly_movements = connection.execute(
            "SELECT COUNT(*) FROM movements"
        ).fetchone()[0]

    return {
        "total_units": total_units,
        "total_volume_m3": round(total_volume, 2),
        "active_routes": active_routes,
        "monthly_movements": monthly_movements,
        "estimated_waste_reduction_pct": 3.5,
    }


def create_route(route: RouteCreate) -> dict:
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO routes (
                state_name, destination, travel_time_hours, status,
                responsible, capacity_units, last_maintenance
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                route.state_name,
                route.destination,
                route.travel_time_hours,
                route.status,
                route.responsible,
                route.capacity_units,
                route.last_maintenance,
            ),
        )
        connection.commit()
        route_id = cursor.lastrowid

    return {"id": route_id, **route.model_dump()}


def create_movement(movement: MovementCreate) -> dict:
    with get_connection() as connection:
        existing_inventory = connection.execute(
            "SELECT * FROM inventory_items WHERE batch_code = ?",
            (movement.batch_code,),
        ).fetchone()

        if movement.movement_type == "salida" and existing_inventory is None:
            raise HTTPException(status_code=404, detail="El lote no existe en inventario")

        if movement.movement_type == "salida" and existing_inventory["quantity"] < movement.quantity:
            raise HTTPException(status_code=400, detail="Inventario insuficiente para la salida")

        cursor = connection.execute(
            """
            INSERT INTO movements (
                folio, movement_type, partner, quantity, volume_m3, state,
                travel_time_hours, responsible, movement_date, batch_code, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                movement.folio,
                movement.movement_type,
                movement.partner,
                movement.quantity,
                movement.volume_m3,
                movement.state,
                movement.travel_time_hours,
                movement.responsible,
                movement.movement_date,
                movement.batch_code,
                movement.notes,
            ),
        )

        if movement.movement_type == "entrada":
            if existing_inventory is None:
                connection.execute(
                    """
                    INSERT INTO inventory_items (
                        product_name, batch_code, origin, state, quantity, volume_m3,
                        warehouse_location, entry_date, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        movement.product_name,
                        movement.batch_code,
                        movement.origin,
                        movement.state,
                        movement.quantity,
                        movement.volume_m3,
                        movement.warehouse_location,
                        movement.movement_date,
                        movement.status,
                    ),
                )
            else:
                connection.execute(
                    """
                    UPDATE inventory_items
                    SET quantity = quantity + ?,
                        volume_m3 = volume_m3 + ?,
                        status = ?,
                        warehouse_location = ?,
                        state = ?,
                        origin = ?,
                        product_name = ?
                    WHERE batch_code = ?
                    """,
                    (
                        movement.quantity,
                        movement.volume_m3,
                        movement.status,
                        movement.warehouse_location,
                        movement.state,
                        movement.origin,
                        movement.product_name,
                        movement.batch_code,
                    ),
                )
        else:
            connection.execute(
                """
                UPDATE inventory_items
                SET quantity = quantity - ?,
                    volume_m3 = volume_m3 - ?
                WHERE batch_code = ?
                """,
                (movement.quantity, movement.volume_m3, movement.batch_code),
            )

        connection.commit()
        movement_id = cursor.lastrowid

    return {"id": movement_id, **movement.model_dump()}
