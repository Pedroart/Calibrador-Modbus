pm2 start ecosystem.config.js
pm2 status
pm2 logs modbus-backend
pm2 startup
pm2 save


# Modbus Backend

Backend Node.js para lectura Modbus TCP con WebSocket, API REST y PM2.

## Requisitos
- Node.js >= 18
- PM2
- Acceso a red Modbus TCP

## Instalación
npm install

## Ejecutar
pm2 start ecosystem.config.js
pm2 save

## Puertos
- API REST: 3100
- WebSocket: 3101
