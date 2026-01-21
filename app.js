const urlbase = "/api";

// ===============================
// Estado global
// ===============================
let ambienteActual = null;
let Ambientes = {}; // diccionario: { "Tunel 1": ["SENSOR 1", ...], ... }
let EstructuraModbus = {};
let valuesMemoria = [];
let offsetMemoria = [];

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
    Ambientes[a.nombre] = a.sensores.map((s) => s.Sensor);
    EstructuraModbus[a.nombre] = a.sensores.map(s => ({
      Sensor: s.Sensor,
      UnitId: s.UnitId
    }));
  });

  //Ambientes = sensoresPorAmbiente




  //return sensoresPorAmbiente;
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
async function apiPostOffset({ UnitId, IDModbus, value }) {
  const url = `${urlbase}/offset`;
  return await fetchJSON(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ UnitId, IDModbus, value }),
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


async function apiSetOffsetC(UnitId, IDModbus, offsetC) {
  const num = Number(offsetC);

  if (!Number.isFinite(num)) {
    throw new Error("offsetC no es un número válido");
  }

  const truncated = Math.trunc(num * 10) / 10;
  console.log(truncated);
  return await apiPostOffset({ UnitId, IDModbus, value: truncated });
}


// ===============================
// Cambio de ambiente
// ===============================
async function cambiarAmbiente(nuevoAmbiente) {
  if (!nuevoAmbiente || !Ambientes[nuevoAmbiente]) return;
  
  
  if (refreshInFlight) return;

  const stop = stopAutoRefresh();
  if(stop !== undefined & !stop) return;
  showPreloader();
  ambienteActual = nuevoAmbiente;
  console.log("Ambiente actual:", ambienteActual);

  renderListaSensores(Ambientes[ambienteActual]);
  startAutoRefresh();
  await refreshNow();
  hidePreloader();
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

document.getElementById("cards-sensores")?.addEventListener("click", async (e) => {
  const card = e.target.closest(".sensor-card");
  if (!card) return;

  const sensor = card.dataset.sensor;

  try {
    if (e.target.closest(".btn-set")) {
      const val = Number(card.querySelector(".offset-input")?.value);
      if (Number.isNaN(val)) throw new Error("Offset inválido");

      await cambiarCalibracion(ambienteActual, sensor, val);
    }

    if (e.target.closest(".btn-calibrar")) {
      const newOffset = calcullarCalibracion(ambienteActual, sensor);
      console.log(sensor,newOffset)
      await cambiarCalibracion(ambienteActual, sensor, newOffset);
    }

    if (e.target.closest(".btn-reset")) {
      await cambiarCalibracion(ambienteActual, sensor, 0);
    }
  } catch (err) {
    console.error(err);
    // acá podés mostrar toast/modal
  }
});


function calcullarCalibracion(ambiente, sensor) {
  const v = valuesMemoria?.find(e => e.Sensor === sensor)?.value;
  const o = offsetMemoria?.find(e => e.Sensor === sensor)?.value;

  if (v == null || o == null) throw new Error("No hay value/offset en memoria aún");

  return o - v;
}


async function cambiarCalibracion(ambiente, sensor, newOffset) {
  return withPausedAutoRefresh(async () => {
    const entry = EstructuraModbus[ambiente]?.find(s => s.Sensor === sensor);
    if (!entry) throw new Error(`No existe ${sensor} en ${ambiente}`);

    const result = await apiSetOffsetC(entry.UnitId, 781, newOffset);

    await refreshNow("after-offset-change");
    
    console.log("Offset cambiado:", result);
    return result;
  });
}




// ===============================
// Eventos: clicks en recargar
// ===============================


document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-refresh");
  console.log("btn-refresh:", btn);

  if (!btn) return;

  btn.addEventListener("click", async () => {
    showPreloader();
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
    hidePreloader();
  });
});

function showPreloader() {
  document.getElementById("preloader")?.classList.add("active");
}

function hidePreloader() {
  document.getElementById("preloader")?.classList.remove("active");
}




// ===============================
// Inicio: cargar ambientes + render
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    
    await getAmbientes();
    renderListaAmbientes(Ambientes);        
    cambiarAmbiente(ambienteActual);
  } catch (error) {
    console.error("Error inicial:", error);
  }
  
});


