import { db } from "./db/sqlite.js";
import { seedEntrypoints } from "./db/seed.js";
import { buildMapper } from "./modbus/mapper.js";
import { createApp } from "./config/app.js";
import { loadMemoryFromDatabase } from "./memory/loader.js";
import { initMemory } from "./memory/compute.js";
import { initModbusClient } from "./modbus/client.js";
import { initModbusServer } from "./modbus/server.js";
import { initWebSocket } from "./ws/ws.js";

console.log("🚀 Iniciando Modbus-App...");

// 1) Memoria dinámica (RAW, OFFSET, FINAL)
//await seedEntrypoints();

await buildMapper();
await loadMemoryFromDatabase();

initMemory();

// 2) Modbus Cliente (lectura externa)
initModbusClient();

// 3) HTTP API + UI estática
const app = createApp();

// 4) WebSocket server
initWebSocket(app);

// 5) Modbus TCP Server (exponer registros)
initModbusServer();

console.log("✔️ Modbus-App iniciada correctamente");
