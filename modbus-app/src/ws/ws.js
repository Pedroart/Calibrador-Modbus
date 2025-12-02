import { WebSocketServer } from "ws";
import { raw, offset, finalValue } from "../memory/register-map.js";

export function initWebSocket(app) {
  const wss = new WebSocketServer({ noServer: true });

  app.on("upgrade", (req, socket, head) => {
    if (req.url === "/ws") {
      wss.handleUpgrade(req, socket, head, ws => {
        wss.emit("connection", ws, req);
      });
    }
  });

  wss.on("connection", ws => {
    console.log("🔵 Cliente WS conectado");

    setInterval(() => {
      ws.send(JSON.stringify({ raw, offset, finalValue }));
    }, 200);
  });

  console.log("🌐 WebSocket listo en /ws");
}
