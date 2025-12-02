import { db } from "./sqlite.js";

// -----------------------------------------------------------------------------
// GET ALL
// -----------------------------------------------------------------------------
export function getAllEntrypoints() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM entrypoints`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// -----------------------------------------------------------------------------
// GET BY INTERNAL ID
// -----------------------------------------------------------------------------
export function getByInternalId(id) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM entrypoints WHERE internal_id = ?`,
      [id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

// -----------------------------------------------------------------------------
// GET BY MODBUS SLAVE ID
// -----------------------------------------------------------------------------
export function getByModbusId(modbus_id) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM entrypoints WHERE modbus_id = ?`,
      [modbus_id],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

// -----------------------------------------------------------------------------
// CREATE ENTRYPOINT
// -----------------------------------------------------------------------------
export function createEntrypoint(entry) {
  const {
    group_name,
    name,
    modbus_ip,
    modbus_id,
    modbus_addr,
    offset_addr,
    final_addr,
    offset_value = 0,
    final_value = 0,
  } = entry;

  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO entrypoints (
        group_name, name,
        modbus_ip, modbus_id, modbus_addr,
        offset_addr, final_addr,
        offset_value, final_value
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        group_name,
        name,
        modbus_ip,
        modbus_id,
        modbus_addr,
        offset_addr,
        final_addr,
        offset_value,
        final_value,
      ],
      function (err) {
        if (err) reject(err);
        else resolve({ internal_id: this.lastID });
      }
    );
  });
}

// -----------------------------------------------------------------------------
// UPDATE ENTRYPOINT
// -----------------------------------------------------------------------------
export function updateEntrypoint(id, entry) {
  const {
    group_name,
    name,
    modbus_ip,
    modbus_id,
    modbus_addr,
    offset_addr,
    final_addr,
    offset_value,
    final_value,
  } = entry;

  return new Promise((resolve, reject) => {
    db.run(
      `
      UPDATE entrypoints
      SET
        group_name = ?,
        name = ?,
        modbus_ip = ?,
        modbus_id = ?,
        modbus_addr = ?,
        offset_addr = ?,
        final_addr = ?,
        offset_value = ?,
        final_value = ?
      WHERE internal_id = ?
      `,
      [
        group_name,
        name,
        modbus_ip,
        modbus_id,
        modbus_addr,
        offset_addr,
        final_addr,
        offset_value,
        final_value,
        id,
      ],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
}

// -----------------------------------------------------------------------------
// DELETE ENTRYPOINT
// -----------------------------------------------------------------------------
export function deleteEntrypoint(id) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM entrypoints WHERE internal_id = ?`,
      [id],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
}

// -----------------------------------------------------------------------------
// UPDATE OFFSET VALUE ONLY
// -----------------------------------------------------------------------------
export function updateOffsetValue(id, newValue) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      UPDATE entrypoints
      SET offset_value = ?
      WHERE internal_id = ?
      `,
      [newValue, id],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
}

// -----------------------------------------------------------------------------
// UPDATE FINAL VALUE ONLY
// -----------------------------------------------------------------------------
export function updateFinalValue(id, newValue) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      UPDATE entrypoints
      SET final_value = ?
      WHERE internal_id = ?
      `,
      [newValue, id],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
}
