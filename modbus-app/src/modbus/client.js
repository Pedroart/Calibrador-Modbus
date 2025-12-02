// src/modbus/client.js
import ModbusRTU from "modbus-serial";
import { raw } from "../memory/register-map.js";
import { mapper } from "./mapper.js";
import { lookupByPhysical } from "../memory/lookup.js";

export function initModbusClient() {
  if (!mapper.groups.length) {
    console.log("⚠️ initModbusClient: mapper.groups está vacío, nada que leer.");
    return;
  }

  console.log("🔌 Iniciando clientes Modbus externos...");

  for (const group of mapper.groups) {
    const client = new ModbusRTU();
    const { modbus_ip, modbus_id, blocks } = group;
    const PORT = 502; // <-- tu servidor uModbus corre en 5020

    client
      .connectTCP(modbus_ip, { port: PORT })
      .then(() => {
        console.log(`🟢 Conectado a Modbus externo: ${modbus_ip} (slave ${modbus_id})`);

        client.setID(modbus_id);

        // Loop de lectura periódica
        setInterval(async () => {
          for (const block of blocks) {
            const start = block.min;
            const count = block.max - block.min + 1;

            try {
              const resp = await client.readHoldingRegisters(start, count);

              for (let i = 0; i < count; i++) {
                const physicalAddr = start + i;
                const key = `${modbus_ip}#${modbus_id}#${physicalAddr}`;
                const finalAddr = lookupByPhysical[key];

                if (finalAddr !== undefined) {
                  raw[finalAddr] = resp.data[i];
                  // opcional: log de depuración
                  // console.log(`📥 ${key} -> finalAddr ${finalAddr} = ${resp.data[i]}`);
                }
              }
            } catch (e) {
              console.log(
                `⚠️ Error leyendo bloque ${start}-${start + count - 1} de ${modbus_ip} (ID ${modbus_id}):`,
                e.message
              );
            }
          }
        }, 200); // cada 200 ms

      })
      .catch((err) => {
        console.log(`❌ No se pudo conectar a ${modbus_ip} (ID ${modbus_id}):`, err.message);
      });
  }
}
