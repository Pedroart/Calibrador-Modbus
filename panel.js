function createTempPanel({
  mount,
  title,
  rangeMain,
  rangeOffset,
  step = 0.1,
  onCalibrar,
  onCero,
  onOffsetChange
}) {

  const root = document.querySelector(mount);
  const id = Math.random().toString(36).slice(2);

  const html = `
    <div class="col-xl-3 col-lg-4 col-md-6 col-sm-12">
      <div class="panel">

        <div class="title">${title}</div>

        <div class="gauge1-container">
          <canvas id="g1-${id}"></canvas>
          <div class="gauge1-value" id="v1-${id}">0.0</div>
        </div>

        <div class="bottom-row">
          <div class="gauge2-wrapper">
            <button class="btn btn-sm btn-light" id="up-${id}">▲</button>

            <!-- SOLO TEXTO, SIN GAUGE -->
            <div class="offset-text" id="v2-${id}">0.0</div>

            <button class="btn btn-sm btn-light" id="down-${id}">▼</button>
          </div>

          <div class="buttons">
            <button class="btn-calibrar" id="cal-${id}">Calibrar</button>
            <button class="btn-cero" id="zero-${id}">Borrar</button>
          </div>
        </div>

      </div>
    </div>
  `;

  root.insertAdjacentHTML("beforeend", html);

  /* ===== GAUGE PRINCIPAL ===== */
  const g1 = new Gauge(document.getElementById(`g1-${id}`)).setOptions({
    angle: -0.2,
    lineWidth: 0.2,
    colorStart: "#fff",
    colorStop: "#fff",
    strokeColor: "#17a1d7ff",
    pointer: { length: 0.6, strokeWidth: 0 },
    highDpiSupport: true
  });
  g1.minValue = rangeMain[0];
  g1.maxValue = rangeMain[1];

  /* ===== PANEL STATE ===== */
  const thisPanel = {
    _main: 0,
    _offset: 0,

    set(main, offset) {
      this._main = main;
      this._offset = offset;

      g1.set(main);

      document.getElementById(`v1-${id}`).innerText = main.toFixed(1);
      document.getElementById(`v2-${id}`).innerText = offset.toFixed(1);
    }
  };

  /* ===== HOOKS ===== */
  document.getElementById(`cal-${id}`).onclick = () => {
    onCalibrar?.();
  };

  document.getElementById(`zero-${id}`).onclick = () => {
    onCero?.();
  };

  document.getElementById(`up-${id}`).onclick = () => {
    let next = thisPanel._offset + step;
    next = Math.min(next, rangeOffset[1]);
    thisPanel.set(thisPanel._main, next);
    onOffsetChange?.(next);
  };

  document.getElementById(`down-${id}`).onclick = () => {
    let next = thisPanel._offset - step;
    next = Math.max(next, rangeOffset[0]);
    thisPanel.set(thisPanel._main, next);
    onOffsetChange?.(next);
  };

  return thisPanel;
}
