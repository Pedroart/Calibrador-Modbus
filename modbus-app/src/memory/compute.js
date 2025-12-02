import { raw, offset, finalValue } from "./register-map.js";

export function initMemory() {
  console.log("📦 Memoria inicializada");

  setInterval(() => {
    for (let i = 0; i < raw.length; i++) {
      finalValue[i] = raw[i] + offset[i];
    }
  }, 200);
}
