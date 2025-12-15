module.exports = {
  apps: [{
    name: "modbus-backend",
    script: "server.js",
    exec_mode: "fork",        // NO cluster (Modbus)
    instances: 1,
    autorestart: true,
    watch: false,             // no reiniciar por cambios de archivos
    max_memory_restart: "300M",
    env: {
      NODE_ENV: "production",
      API_PORT: 3100,
      WS_PORT: 3101,
      POLL_INTERVAL: 10000,
      WATCHDOG_TIMEOUT: 30000
    },
    error_file: "./logs/error.log",
    out_file: "./logs/app.log",
    time: true
  }]
};
