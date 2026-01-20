
const panels = new Map();      // ya lo tienes
const offsets = new Map();     // NUEVO

const systemState = {
  calibradorReady: false,
  lastError: null
};


function setStatus(text, type = "warn") {
  const el = document.getElementById("statusBar");
  el.textContent = text;
  el.className = `text-center mb-2 status-${type}`;
}


function registerPanel(sensor, panel) {
  const key = `${sensor.IDAMB}-${sensor.IDSENSOR}`;
  panels.set(key, panel);
}

function updateValue({ IDAMB, IDSENSOR, value, offset, error }) {
  const key = `${IDAMB}-${IDSENSOR}`;
  const panel = panels.get(key);
  if (!panel) return;

  panel.set(value, offset);

  if (error) {
    panel.setError?.(true); // opcional si luego lo implementas
  }
}

const OFFSET_CACHE_KEY = "calibrador_offsets_v1";

function saveOffsetsToCache() {
  const obj = Object.fromEntries(offsets);
  localStorage.setItem(OFFSET_CACHE_KEY, JSON.stringify(obj));
}

function loadOffsetsFromCache() {
  const raw = localStorage.getItem(OFFSET_CACHE_KEY);
  if (!raw) return false;

  try {
    const obj = JSON.parse(raw);
    Object.entries(obj).forEach(([key, value]) => {
      offsets.set(key, value);

      const panel = panels.get(key);
      if (panel) {
        panel.set(panel._main ?? 0, value);
      }
    });

    systemState.calibradorReady = true;
    setStatus("Calibración cargada desde cache", "warn");
    return true;

  } catch (e) {
    console.warn("Cache corrupta, ignorando");
    localStorage.removeItem(OFFSET_CACHE_KEY);
    return false;
  }
}


async function loadOffsets() {
  const res = await fetch("/api/modbus/read/calibrador");
  const json = await res.json();

  if (!json.ok) return;

  json.data.forEach(arr => {
    if (!arr.length) return;

    const sensor = arr[0];
    const key = `${sensor.IDAMB}-${sensor.IDSENSOR}`;

    // Guardar offset
    offsets.set(key, sensor.value);

    // Si el panel ya existe, actualizar solo el offset
    const panel = panels.get(key);
    if (panel) {
      panel.set(panel._main ?? 0, sensor.value);
    }
  });
}


async function loadValues() {
  if (!systemState.calibradorReady) return;

  try {
    const res = await fetch("/api/modbus/read/ambientes");
    const json = await res.json();

    if (!json.ok) throw new Error(json.error);

    setStatus("Sistema operativo", "ok");

    json.data.forEach(arr => {
      if (!arr.length) return;

      const s = arr[0];
      const key = `${s.IDAMB}-${s.IDSENSOR}`;
      const panel = panels.get(key);
      if (!panel) return;

      const offset = offsets.get(key) ?? 0;
      panel.set(s.value, offset);
    });

  } catch (err) {
    setStatus("Error lectura sensores", "error");
  }
}



async function loadOffsetsWithRetry() {
  setStatus("Cargando calibración…", "warn");
  while (true) {
    try {
      const res = await fetch("/api/modbus/read/calibrador");
      const json = await res.json();

      if (!json.ok) throw new Error(json.error);

      json.data.forEach(arr => {
        if (!arr.length) return;
        const s = arr[0];
        const key = `${s.IDAMB}-${s.IDSENSOR}`;
        offsets.set(key, s.value);

        const panel = panels.get(key);
        if (panel) {
          panel.set(panel._main ?? 0, s.value);
        }
      });

      systemState.calibradorReady = true;
      saveOffsetsToCache();
      setStatus("Calibración cargada", "ok");
      return; // ✅ salir del loop

    } catch (err) {
      systemState.calibradorReady = false;
      systemState.lastError = err.message;

      setStatus(
        "Error calibrador. Reintentando en 1s…",
        "error"
      );

      await new Promise(r => setTimeout(r, 10000));
    }
  }
}

/*
loadOffsets();
//setInterval(loadOffsets, 17000); // c
setInterval(loadValues, 17000); // c
*/

async function loadStructure() {
  const res = await fetch("/api/modbus/structure");
  const json = await res.json();
  if (!json.ok) return;

  const data = json.data;
  const tuneles = Object.keys(data);

  const activeTunel = getActiveTunel() || tuneles[0];

  // construir tabs
  buildTabs(tuneles, activeTunel);

  // limpiar UI
  const app = document.getElementById("app");
  app.innerHTML = "";

  // construir SOLO el túnel activo
  const grupos = data[activeTunel];
  if (!grupos) return;

  grupos.forEach(grupo => {
    grupo.forEach(sensor => {
      const panel = createTempPanel({
        mount: "#app",
        title: sensor.Sensor,
        rangeMain: [-15, 50],
        rangeOffset: [-10, 10],
        onOffsetChange: (newOffset) => {
          console.log("Nuevo offset", sensor, newOffset);

          // aquí tú decides:
          // - enviar a backend
          // - escribir Modbus
          // - guardar cache
        },

        onCalibrar: () => console.log("Calibrar", sensor),
        onCero: () => console.log("Cero", sensor)
      });

      const key = `${sensor.IDAMB}-${sensor.IDSENSOR}`;
      panels.set(key, panel);
    });
  });
}



function getActiveTunel() {
  const params = new URLSearchParams(window.location.search);
  return params.get("tunel");
}

function buildTabs(tuneles, activeTunel) {
  const tabs = document.getElementById("tunelTabs");
  tabs.innerHTML = "";

  tuneles.forEach(tunel => {
    const active = tunel === activeTunel ? "active" : "";

    tabs.insertAdjacentHTML("beforeend", `
      <li class="nav-item">
        <a class="nav-link ${active}" href="?tunel=${encodeURIComponent(tunel)}">
          ${tunel}
        </a>
      </li>
    `);
  });
}

async function init() {
  
  await new Promise(r => setTimeout(r, 5000));

  await loadStructure();        // UI

  // 👉 intentar cache primero
  const cacheOk = loadOffsetsFromCache();

  // 👉 en paralelo intentar calibrador real
  await loadOffsetsWithRetry();

  // 👉 permitir lecturas si hay cache
  if (cacheOk) {
    await loadValues();
  }

  setInterval(loadValues, 10000);
}


init();


