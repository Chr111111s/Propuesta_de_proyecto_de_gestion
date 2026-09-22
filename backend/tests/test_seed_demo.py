import sqlite3
import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest.mock import patch

from app import database
from app.seed_demo import add_demo_data


class DemoSeedTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.db_patch = patch.object(database, "DB_PATH", Path(self.directory.name) / "test.sqlite3")
        self.db_patch.start()
        self.addCleanup(self.db_patch.stop)
        database.init_db()
        self.connection = database.get_connection()
        self.addCleanup(self.connection.close)

    def snapshot(self):
        return {table: [tuple(row) for row in self.connection.execute(f"SELECT * FROM {table} ORDER BY id")]
                for table in ("inventory_items", "movements", "routes")}

    def test_preserves_existing_rows_and_is_idempotent(self):
        original = self.snapshot()
        result = add_demo_data(self.connection, date(2026, 9, 22))
        self.assertTrue(result["added"])
        populated = self.snapshot()
        for table, old_rows in original.items():
            self.assertEqual(populated[table][:len(old_rows)], old_rows)
        self.assertEqual(len(populated["inventory_items"]) - len(original["inventory_items"]), 48)
        self.assertEqual(len(populated["movements"]) - len(original["movements"]), 240)
        self.assertEqual(len(populated["routes"]) - len(original["routes"]), 18)
        self.assertFalse(add_demo_data(self.connection, date(2026, 10, 1))["added"])
        self.assertEqual(self.snapshot(), populated)

    def test_inventory_matches_movements_and_never_goes_negative(self):
        as_of = date(2026, 9, 22)
        add_demo_data(self.connection, as_of)
        for lot in self.connection.execute("SELECT * FROM inventory_items WHERE batch_code LIKE 'DEMO-%'"):
            units = 0
            volume = 0
            events = self.connection.execute("SELECT * FROM movements WHERE batch_code = ? ORDER BY movement_date, id", (lot["batch_code"],))
            for event in events:
                sign = 1 if event["movement_type"] == "entrada" else -1
                units += sign * event["quantity"]
                volume += sign * event["volume_m3"]
                self.assertGreaterEqual(units, 0)
                self.assertGreaterEqual(volume, -1e-8)
                self.assertLessEqual(date.fromisoformat(event["movement_date"]), as_of)
                self.assertGreater(event["quantity"], 0)
                self.assertAlmostEqual(event["volume_m3"], event["quantity"] * 0.015)
                if sign == -1:
                    self.assertIsNotNone(self.connection.execute("SELECT id FROM routes WHERE destination = ?", (event["partner"],)).fetchone())
            self.assertEqual(units, lot["quantity"])
            self.assertAlmostEqual(volume, lot["volume_m3"])

    def test_recent_days_have_both_movement_types(self):
        add_demo_data(self.connection, date(2026, 9, 22))
        days = self.connection.execute("SELECT movement_date, COUNT(DISTINCT movement_type) AS kinds FROM movements WHERE folio LIKE 'DEMO-%' AND movement_date >= '2026-09-16' GROUP BY movement_date").fetchall()
        self.assertEqual(len(days), 7)
        for row in days:
            self.assertEqual(row["kinds"], 2)
        statuses = {row[0] for row in self.connection.execute("SELECT DISTINCT state FROM movements WHERE folio LIKE 'DEMO-%'")}
        self.assertTrue({"Recibido", "Entregado", "En tránsito", "Retrasado"}.issubset(statuses))

    def test_conflict_rolls_back_the_whole_seed(self):
        self.connection.execute("UPDATE inventory_items SET batch_code = 'DEMO-PI-048' WHERE id = 1")
        self.connection.commit()
        original = self.snapshot()
        with self.assertRaises(sqlite3.IntegrityError):
            add_demo_data(self.connection, date(2026, 9, 22))
        self.assertEqual(self.snapshot(), original)


if __name__ == "__main__":
    unittest.main()
