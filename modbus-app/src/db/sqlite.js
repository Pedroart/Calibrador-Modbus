import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// Resolver __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta física del archivo SQLite
const DB_PATH = path.join(__dirname, "../../modbus.db");

// Crear conexión
sqlite3.verbose();
export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ Error abriendo base SQLite:", err.message);
  } else {
    console.log("📁 Conectado a SQLite:", DB_PATH);

    db.run(`
      CREATE TABLE IF NOT EXISTS entrypoints (
        internal_id    INTEGER PRIMARY KEY AUTOINCREMENT,

        group_name     TEXT        NOT NULL,
        name           TEXT        NOT NULL,

        modbus_ip      TEXT        NOT NULL,
        modbus_id      INTEGER     NOT NULL,
        modbus_addr    INTEGER     NOT NULL,

        offset_addr    INTEGER     NOT NULL,
        final_addr     INTEGER     NOT NULL,

        offset_value   REAL        DEFAULT 0,
        final_value    REAL        DEFAULT 0
      )
    `);
  }
});
