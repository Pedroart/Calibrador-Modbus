// ===============================
// Auto-refresh controller
// ===============================
const AUTO_REFRESH_MS = 15_000;

let refreshTimerId = null;
let refreshInFlight = false;
let cantidad = 0;

/** Ejecuta refresh del ambiente actual (values + offsets) */
async function refreshNow(reason = "manual") {
  if (!ambienteActual) return;

  // evita refresh simultáneo (manual + auto)
  if (refreshInFlight) return;

  refreshInFlight = true;
  console.log(`[refreshNow] ${reason} ->`, ambienteActual);

  try {
    
    const debeTraerOffsets = cantidad % 20 === 0;

    const [values, offset] = await Promise.all([
      apiGetValues(ambienteActual),
      debeTraerOffsets ? apiGetOffsets(ambienteActual) : Promise.resolve(null),
    ]);

    valuesMemoria = values;
    offsetMemoria = offset;

    cantidad++;

    updateValues(values);
    if (offset !== null) {
      updateOffsets(offset);
    }
    
  } catch (err) {
    console.error("[refreshNow] error:", err);
  } finally {
    refreshInFlight = false;
  }
}

/** Inicia auto-refresh */
function startAutoRefresh() {
  stopAutoRefresh(); // asegura uno solo
  cantidad = 0;
  refreshTimerId = setInterval(() => refreshNow("auto"), AUTO_REFRESH_MS);
  console.log("[autoRefresh] started");
}

/** Detiene auto-refresh */
function stopAutoRefresh() {
  if (refreshTimerId) {
    clearInterval(refreshTimerId);
    refreshTimerId = null;
    console.log("[autoRefresh] stopped");
    return true;
  }
}

/** Reinicia auto-refresh (rompe la tarea y reprograma desde cero) */
function restartAutoRefresh() {
  stopAutoRefresh();
  startAutoRefresh();
  console.log("[autoRefresh] restarted");
}

function waitForRefreshIdle({ timeoutMs = 10_000, pollMs = 50 } = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const t = setInterval(() => {
      if (!refreshInFlight) {
        clearInterval(t);
        resolve(true);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        clearInterval(t);
        reject(new Error("Timeout esperando a que refreshInFlight sea false"));
      }
    }, pollMs);
  });
}

async function withPausedAutoRefresh(fn) {
  await waitForRefreshIdle();

  stopAutoRefresh();

  try {
    const out = await fn();
    return out;
  } finally {
    startAutoRefresh();
  }
}
