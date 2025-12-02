import { db } from "./sqlite.js";

export function seedEntrypoints() {
  const inserts = [
    // UNIT 1
    ["COMPRESOR", "Presión Succión", "127.0.0.1", 1, 1, 1000, 2000],
    ["COMPRESOR", "Presión Descarga", "127.0.0.1", 1, 2, 1001, 2001],
    ["COMPRESOR", "Temperatura Aceite", "127.0.0.1", 1, 3, 1002, 2002],

    ["EVAPORADOR", "Temp Entrada", "127.0.0.1", 1, 50, 1003, 2003],
    ["EVAPORADOR", "Temp Salida", "127.0.0.1", 1, 51, 1004, 2004],

    ["GENERAL", "Corriente L1", "127.0.0.1", 1, 300, 1005, 2005],
    ["GENERAL", "Corriente L2", "127.0.0.1", 1, 301, 1006, 2006],
    ["GENERAL", "Corriente L3", "127.0.0.1", 1, 302, 1007, 2007],

    // UNIT 4
    ["EVAPORADOR", "Temp Aire In", "127.0.0.1", 4, 10, 1500, 2500],
    ["EVAPORADOR", "Temp Aire Out", "127.0.0.1", 4, 11, 1501, 2501],
    ["SALA", "Humedad", "127.0.0.1", 4, 100, 1502, 2502],
    ["SALA", "Flujo1", "127.0.0.1", 4, 700, 1503, 2503],
    ["SALA", "Flujo2", "127.0.0.1", 4, 701, 1504, 2504],

    // UNIT 2
    ["SENSORES", "Nivel Tanque", "127.0.0.1", 2, 5, 3000, 4000],
    ["SENSORES", "Temp1", "127.0.0.1", 2, 200, 3001, 4001],
    ["SENSORES", "Temp2", "127.0.0.1", 2, 201, 3002, 4002],
    ["SENSORES", "Temp3", "127.0.0.1", 2, 202, 3003, 4003],
    ["SENSORES", "Flujo", "127.0.0.1", 2, 800, 3004, 4004],
  ];

  const sql = `
    INSERT INTO entrypoints 
      (group_name, name, modbus_ip, modbus_id, modbus_addr, offset_addr, final_addr)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.serialize(() => {
    inserts.forEach(row => db.run(sql, row));
  });

  console.log("🌱 Seed completado: entrypoints cargados.");
}
