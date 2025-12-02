modbus-app/
│
├── server.js                 <-- Punto de entrada ÚNICO (levanta TODO)
│
├── public/                   <-- UI EXPORTADA de Next.js (v0.app)
│   └── index.html
│   └── assets/...            <-- (todo el build estático)
│
├── src/
│   ├── config/
│   │   ├── app.js            <-- puertos, rutas, variables globales
│   │   ├── modbus.js         <-- RAW_BASE, OFFSET_BASE, FINAL_BASE, COUNT
│   │   └── db.js             <-- path BD
│   │
│   ├── memory/
│   │   ├── register-map.js   <-- raw[], offset[], final[]
│   │   └── compute.js        <-- final[i] = raw[i] + offset[i]
│   │
│   ├── modbus/
│   │   ├── client.js         <-- lectura Modbus externo
│   │   ├── server.js         <-- servidor Modbus TCP interno
│   │   └── mapper.js         <-- mapea RAW/OFFSET/FINAL a direcciones
│   │
│   ├── db/
│   │   ├── sqlite.js         <-- conexión SQLite
│   │   └── entrypoints.repo.js
│   │
│   ├── api/
│   │   ├── index.js          <-- agrupa rutas
│   │   ├── entrypoints.js    <-- /api/entrypoints (CRUD)
│   │   └── offsets.js        <-- /api/entrypoints/:id/offset
│   │
│   ├── ws/
│   │   └── ws.js             <-- WebSocket: envía final_value y offset_value cada 200ms
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   └── helpers.js
│   │
│   └── main.js               <-- inicia Modbus + memoria + API + WS
│
├── package.json
└── README.md
