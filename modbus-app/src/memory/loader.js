import { getAllEntrypoints } from "../db/entrypoints.repo.js";
import { raw, offset, finalValue } from "./register-map.js";
import { lookupByPhysical } from "./lookup.js";

export async function loadMemoryFromDatabase() {
  const entries = await getAllEntrypoints();

  if (!entries.length) {
    console.log("⚠️ No hay entrypoints en BD");
    return;
  }

  // Limpiar memoria
  raw.length = 0;
  offset.length = 0;
  finalValue.length = 0;

  // Limpiar lookup
  for (const key in lookupByPhysical) delete lookupByPhysical[key];

  for (const e of entries) {
    // ---- 1) Construir clave para lookup físico ----
    const key = `${e.modbus_ip}#${e.modbus_id}#${e.modbus_addr}`;
    lookupByPhysical[key] = e.final_addr;

    // ---- 2) Inicializar memoria virtual ----
    raw[e.final_addr] = 0;
    offset[e.final_addr] = e.offset_value ?? 0;
    finalValue[e.final_addr] = 0;
  }

  console.log("🧠 Memoria cargada desde BD.");
  console.log("🔗 Lookup físico → virtual:", lookupByPhysical);
}
