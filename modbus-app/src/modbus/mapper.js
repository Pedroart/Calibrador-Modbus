import { getAllEntrypoints } from "../db/entrypoints.repo.js";

export let mapper = {
  groups: []
};

export async function buildMapper() {
  const list = await getAllEntrypoints();

  if (!list.length) {
    console.log("⚠️ No hay entrypoints en la BD para construir mapper");
    mapper.groups = [];
    return;
  }

  const groupMap = new Map();

  // Agrupar por host/slave
  for (const e of list) {
    const key = `${e.modbus_ip}#${e.modbus_id}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        modbus_ip: e.modbus_ip,
        modbus_id: e.modbus_id,
        rawAddrs: []
      });
    }
    groupMap.get(key).rawAddrs.push(e.modbus_addr);
  }

  const groups = [];

  // Construir bloques por grupo
  for (const g of groupMap.values()) {
    const sorted = [...g.rawAddrs].sort((a, b) => a - b);
    
    const blocks = [];
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === prev + 1) {
        // sigue contiguo
        prev = sorted[i];
      } else {
        // cierre bloque
        blocks.push({ min: start, max: prev });
        // iniciar nuevo
        start = sorted[i];
        prev = sorted[i];
      }
    }

    // último bloque
    blocks.push({ min: start, max: prev });

    groups.push({
      modbus_ip: g.modbus_ip,
      modbus_id: g.modbus_id,
      blocks
    });
  }

  mapper.groups = groups;

  console.log("🗺️ Mapper construido:");
  console.dir(mapper, { depth: null });
}
