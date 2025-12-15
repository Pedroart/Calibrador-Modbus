const ModbusRTU = require("modbus-serial");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const winston = require("winston");

// ===============================
// ENV / CONFIG
// ===============================
const API_PORT = Number(process.env.API_PORT || 3100);
const WS_PORT = Number(process.env.WS_PORT || 3101);
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL || 10000);
const WATCHDOG_TIMEOUT = Number(process.env.WATCHDOG_TIMEOUT || 30000);
const MODBUS_PORT = 502;

// ===============================
// LOGGER (archivo + consola)
// ===============================
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/app.log" }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

logger.info("Backend iniciando");

// ===============================
// CONFIG MODBUS
// ===============================
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

// ===============================
// CACHE
// ===============================
// key = Host|Unit|REG|ADDR
const cache = {};

// ===============================
// DECODER (ESTÁNDAR TUYO)
// ===============================
function decodeInt16BE(u) {
  const buf = Buffer.alloc(2);
  buf.writeUInt16BE(Number(u) & 0xFFFF);
  return buf.readInt16BE();
}

// ===============================
// AGRUPACIONES
// ===============================
function groupByTarget(rows) {
  const map = {};
  rows.forEach(r => {
    const key = `${r.Host}|${r.Unit}|${r.REG}`;
    if (!map[key]) map[key] = [];
    map[key].push(r);
  });
  return map;
}

function groupContiguous(rows) {
  const sorted = [...rows].sort((a, b) => a.ADDR - b.ADDR);
  const groups = [];
  let current = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].ADDR === sorted[i - 1].ADDR + 1) current.push(sorted[i]);
    else { groups.push(current); current = [sorted[i]]; }
  }
  groups.push(current);
  return groups;
}

// ===============================
// WEBSOCKET
// ===============================
const wss = new WebSocket.Server({ port: WS_PORT });

function broadcast(msg) {
  const data = JSON.stringify(msg);
  wss.clients.forEach(c => c.readyState === 1 && c.send(data));
}

wss.on("connection", ws => {
  ws.send(JSON.stringify({ type: "init", config, cache }));
});

logger.info(`WebSocket escuchando en ${WS_PORT}`);

// ===============================
// MODBUS READ
// ===============================
async function readGroup(host, unit, reg, blocks) {
  const client = new ModbusRTU();
  try {
    await client.connectTCP(host, { port: MODBUS_PORT });
    client.setID(unit);
    client.setTimeout(2000);

    for (const block of blocks) {
      const start = block[0].ADDR;
      const qty = block.length;

      const res = reg === "IR"
        ? await client.readInputRegisters(start, qty)
        : await client.readHoldingRegisters(start, qty);

      block.forEach((r, i) => {
        const rawSigned = decodeInt16BE(res.data[i]);
        const value = rawSigned * r.SCALE;
        const ts = Date.now();
        const key = `${host}|${unit}|${reg}|${r.ADDR}`;

        cache[key] = { raw: rawSigned, value, ts };

        broadcast({
          type: "update",
          key, Host: host, Unit: unit, REG: reg, ADDR: r.ADDR,
          raw: rawSigned, value, ts
        });
      });
    }
  } catch (e) {
    logger.error(`Modbus ${host} U${unit}: ${e.message}`);
  } finally {
    client.close();
  }
}

// ===============================
// POLLER
// ===============================
async function poll() {
  const grouped = groupByTarget(config);
  for (const k in grouped) {
    const [host, unit, reg] = k.split("|");
    const blocks = groupContiguous(grouped[k]);
    await readGroup(host, Number(unit), reg, blocks);
  }
}

logger.info("Poller iniciado");
poll();
setInterval(poll, POLL_INTERVAL);

// ===============================
// WATCHDOG LÓGICO
// ===============================
setInterval(() => {
  const now = Date.now();
  Object.entries(cache).forEach(([key, v]) => {
    if (now - v.ts > WATCHDOG_TIMEOUT) {
      broadcast({ type: "offline", key, lastSeen: v.ts });
      logger.warn(`WATCHDOG OFFLINE ${key}`);
    }
  });
}, WATCHDOG_TIMEOUT);

// ===============================
// API REST
// ===============================
const app = express();
app.use(bodyParser.json());

app.get("/api/points", (req, res) => {
  res.json(config.map(p => {
    const k = `${p.Host}|${p.Unit}|${p.REG}|${p.ADDR}`;
    return { ...p, ...(cache[k] || { value: null, raw: null, ts: null }) };
  }));
});

app.post("/api/write", async (req, res) => {
  const { Host, Unit, REG, ADDR, value } = req.body;
  try {
    const c = new ModbusRTU();
    await c.connectTCP(Host, { port: MODBUS_PORT });
    c.setID(Unit);
    if (REG === "HR") await c.writeRegister(ADDR, value);
    else if (REG === "CO") await c.writeCoil(ADDR, value);
    else return res.status(400).json({ error: "REG no escribible" });
    c.close();
    logger.info(`WRITE ${Host} U${Unit} ${REG} ${ADDR}=${value}`);
    res.json({ ok: true });
  } catch (e) {
    logger.error(`WRITE error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

app.listen(API_PORT, () =>
  logger.info(`API REST escuchando en ${API_PORT}`)
);
