const urlbase = "http://100.94.14.38:1880";

// ===============================
// Estado global
// ===============================
let ambienteActual = null;
let Ambientes = {}; // diccionario: { "Tunel 1": ["SENSOR 1", ...], ... }

// ===============================
// API: GET /structure -> Ambientes
// ===============================
async function getAmbientes() {
  const endpoint = "/structure";

  const response = await fetch(`${urlbase}${endpoint}`);
  if (!response.ok) throw new Error("Error al obtener /structure");

  const data = await response.json();

  // Normalizar: { ambiente: [ {sensorObj...}, ... ] }
  const ambientes = Object.entries(data).map(([nombre, arr]) => {
    const sensores = Array.isArray(arr) && Array.isArray(arr[0]) ? arr[0] : [];
    return { nombre, sensores };
  });

  // Devolver: { ambiente: ["SENSOR 1","SENSOR 2", ...] }
  const sensoresPorAmbiente = {};
  ambientes.forEach((a) => {
    sensoresPorAmbiente[a.nombre] = a.sensores.map((s) => s.Sensor);
  });

  return sensoresPorAmbiente;
}

// ===============================
// API: Funciones utilidades
// ===============================

/** fetch JSON con manejo de error */
async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();

  let data;
  try { data = text ? JSON.parse(text) : null; }
  catch { data = text; }

  if (!res.ok) {
    const msg = (data && typeof data === "object" && (data.error || data.message))
      ? (data.error || data.message)
      : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/** arma querystring con encoding */
function qs(params) {
  const parts = [];

  for (const [k, v] of Object.entries(params || {})) {
    if (v === undefined || v === null || v === "") continue;

    const key = encodeURIComponent(k);
    const val = encodeURIComponent(String(v)); // espacios -> %20
    parts.push(`${key}=${val}`);
  }

  return parts.length ? `?${parts.join("&")}` : "";
}


// ===============================
// GET: un solo dato (devuelve el objeto {Ambiente, Sensor, value})
// ===============================
async function apiGetOffset(ambiente, sensor) {
  const url = `${urlbase}/offset${qs({ ambiente, sensor })}`;
  const arr = await fetchJSON(url);
  return Array.isArray(arr) ? (arr[0] ?? null) : arr;
}

async function apiGetValue(ambiente, sensor) {
  const url = `${urlbase}/value${qs({ ambiente, sensor })}`;
  const arr = await fetchJSON(url);
  return Array.isArray(arr) ? (arr[0] ?? null) : arr;
}

// ===============================
// GET: varios datos (devuelve array completo)
// ===============================

async function mapLimit(items, limit, asyncFn) {
  const results = new Array(items.length);
  let i = 0;

  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await asyncFn(items[idx], idx);
    }
  });

  await Promise.all(workers);
  return results;
}

async function apiGetOffsets(ambiente) {
  const sensores = Ambientes?.[ambiente] || [];
  if (!sensores.length) return [];

  const rows = await mapLimit(sensores, 1, async (sensor) => {
    try {
      return await apiGetOffset(ambiente, sensor); // devuelve {Ambiente, Sensor, value} o null
    } catch (e) {
      // si falla uno, no tumbes todo
      return { Ambiente: ambiente, Sensor: sensor, value: null, error: String(e?.message || e) };
    }
  });

  // filtrar nulls si deseas
  return rows.filter(Boolean);
}

async function apiGetValuesV1(ambiente) {
  const sensores = Ambientes?.[ambiente] || [];
  if (!sensores.length) return [];

  const rows = await mapLimit(sensores, 1, async (sensor) => {
    try {
      return await apiGetValue(ambiente, sensor);
    } catch (e) {
      return { Ambiente: ambiente, Sensor: sensor, value: null, error: String(e?.message || e) };
    }
  });

  return rows.filter(Boolean);
}

async function apiGetOffsetsV0(ambiente) {
  const url = `${urlbase}/offsets${qs({ ambiente })}`;
  console.log(url)
  return await fetchJSON(url);
}

async function apiGetValues(ambiente) {
  const url = `${urlbase}/values${qs({ ambiente })}`;
  return await fetchJSON(url);
}

function updateValues(valuesArray) {
  valuesArray.forEach(({ Sensor, value }) => {
    console.log(Sensor,value);
    setValueSensor(Sensor, value);
  });
}

function updateOffsets(offsetsArray) {
  offsetsArray.forEach(({ Sensor, value }) => {
    setOffsetSensor(Sensor, value);
  });
}


// ===============================
// POST: escritura offset
// body: { UnitId, IDmodbus, value }
// ===============================
async function apiPostOffset({ UnitId, IDmodbus, value }) {
  const url = `${urlbase}/offset`;
  return await fetchJSON(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ UnitId, IDmodbus, value }),
  });
}

// ===============================
// (Opcional) Helpers prácticos
// ===============================

/** Lee temp+offset de un sensor en paralelo */
async function apiGetValueAndOffset(ambiente, sensor) {
  const [value, offset] = await Promise.all([
    apiGetValue(ambiente, sensor),
    apiGetOffset(ambiente, sensor),
  ]);
  return { value, offset };
}

/** Escribe offset en °C (convierte °C -> entero x10) */
async function apiSetOffsetC(UnitId, IDmodbus, offsetC) {
  const raw = Math.round(Number(offsetC) * 10); // -0.5°C => -5
  return await apiPostOffset({ UnitId, IDmodbus, value: raw });
}

// ===============================
// Cambio de ambiente
// ===============================
function cambiarAmbiente(nuevoAmbiente) {
  if (!nuevoAmbiente || !Ambientes[nuevoAmbiente]) return;
  
  if (refreshInFlight) return;

  const stop = stopAutoRefresh();
  if(stop !== undefined & !stop) return;

  ambienteActual = nuevoAmbiente;
  console.log("Ambiente actual:", ambienteActual);

  renderListaSensores(Ambientes[ambienteActual]);
  return true;
}

// ===============================
// Render: lista de ambientes (sidebar)
// ===============================
function renderListaAmbientes(dicAmbientes) {
  const list = document.getElementById("list-group");
  if (!list) return;

  list.innerHTML = "";

  const nombres = Object.keys(dicAmbientes);
  if (nombres.length === 0) return;

  // si no hay seleccionado, usar el primero
  if (!ambienteActual) ambienteActual = nombres[0];

  nombres.forEach((ambiente) => {
    const li = document.createElement("li");
    li.className = "list-group-item list-item-dark";
    li.textContent = ambiente;

    if (ambiente === ambienteActual) li.classList.add("active");

    li.addEventListener("click", () => {
      // UI active
      if(cambiarAmbiente(ambiente)){
        list.querySelectorAll(".active").forEach((el) => el.classList.remove("active"));
        li.classList.add("active");
      }
      
    });

    list.appendChild(li);
  });
}

// ===============================
// Render: cards de sensores (grid)
// Requiere un contenedor:
// <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3" id="cards-sensores"></div>
// ===============================
function renderListaSensores(sensores) {
  const container = document.getElementById("cards-sensores");
  if (!container) return;

  container.innerHTML = "";

  (sensores || []).forEach((nombreSensor) => {
    const col = document.createElement("div");
    col.className = "col";

    col.innerHTML = `
      <div class="card shadow-sm sensor-card" data-sensor="${nombreSensor}">
        <div class="card-body text-center">

          <div class="small text-muted mb-1 sensor-name text-white">
            ${nombreSensor}
          </div>

          <div class="display-5 fw-semibold mb-1">
            <span class="temp-value">--</span>°C
          </div>

          <div class="text-muted mb-3">
            Offset: <span class="offset-value">--</span>°C
          </div>

          <div class="input-group input-group-sm mb-3">
            <input
              type="number"
              step="0.1"
              class="form-control offset-input"
              placeholder="Ej: -0.5"
            />
            <button class="btn btn-outline-secondary btn-set px-3 py-2" type="button">
              Fijar
            </button>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm flex-fill px-3 py-2 btn-calibrar" type="button">
              Calibrar
            </button>
            <button class="btn btn-outline-secondary btn-sm px-3 py-2 btn-reset" type="button">
              Reset
            </button>
          </div>

        </div>
      </div>
    `;

    container.appendChild(col);
  });
}

// ===============================
// Eventos: Recargar Valores de Card
// ===============================

function getSensorCard(nombreSensor) {
  return document.querySelector(
    `.sensor-card[data-sensor="${nombreSensor}"]`
  );
}

function setValueSensor(nombreSensor, value) {
  const card = getSensorCard(nombreSensor);
  if (!card) return;

  const el = card.querySelector(".temp-value");
  if (!el) return;

  el.textContent = value ?? "--";
}

function setOffsetSensor(nombreSensor, offset) {
  const card = getSensorCard(nombreSensor);
  if (!card) return;

  const el = card.querySelector(".offset-value");
  if (!el) return;

  el.textContent = offset ?? "--";
}

function setSensorData(nombreSensor, { value, offset }) {
  if (value !== undefined) {
    setValueSensor(nombreSensor, value);
  }
  if (offset !== undefined) {
    setOffsetSensor(nombreSensor, offset);
  }
}


// ===============================
// Eventos: clicks en cards (delegación)
// ===============================
document.getElementById("cards-sensores")?.addEventListener("click", (e) => {
  const card = e.target.closest(".sensor-card");
  if (!card) return;

  const sensor = card.dataset.sensor;

  if (e.target.closest(".btn-set")) {
    const val = card.querySelector(".offset-input")?.value;
    console.log("Fijar", { ambiente: ambienteActual, sensor, offset: val });
  }

  if (e.target.closest(".btn-calibrar")) {
    console.log("Calibrar", { ambiente: ambienteActual, sensor });
  }

  if (e.target.closest(".btn-reset")) {
    console.log("Reset", { ambiente: ambienteActual, sensor });
  }
});

// ===============================
// Eventos: clicks en recargar
// ===============================


document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-refresh");
  console.log("btn-refresh:", btn);

  if (!btn) return;

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    const icon = btn.querySelector("i");
    console.log("icon:", icon);
    console.log("before:", icon?.className);

    icon?.classList.add("spin");

    console.log("after:", icon?.className);

    try {
      stopAutoRefresh();              // rompe la tarea
      await refreshNow("button");     // recarga ya
      restartAutoRefresh();           // reprograma desde cero
    } finally {
      icon?.classList.remove("spin");
      btn.disabled = false;
    }
    
  });
});




// ===============================
// Inicio: cargar ambientes + render
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    Ambientes = await getAmbientes();        // ✅ guardar en el global
    renderListaAmbientes(Ambientes);         // ✅ crea sidebar y setea activo
    cambiarAmbiente(ambienteActual);         // ✅ renderiza cards del ambiente activo
  } catch (error) {
    console.error("Error inicial:", error);
  }
});
