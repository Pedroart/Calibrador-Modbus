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
    const debeTraerOffsets = cantidad % 10 === 0;
    
    const [values, offset] = await Promise.all([
        apiGetValues(ambienteActual),
        debeTraerOffsets ? apiGetOffsets(ambienteActual) : Promise.resolve(null),
    ]);
    
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
