import net from "net";
import { finalValue, offset, raw } from "../memory/register-map.js";

export function initModbusServer() {
  const server = net.createServer(socket => {
    console.log("📥 Cliente conectado al Modbus interno");
  });

  server.listen(8502, () => {
    console.log("🟢 Modbus TCP Server interno en puerto 8502");
  });
}
