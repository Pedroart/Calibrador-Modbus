"use client"

import { Knob } from "./knob"
import type { PointState } from "@/types/modbus"

interface KnobCellProps {
  point: PointState
  onAdjust: () => void
}

export function KnobCell({ point, onAdjust }: KnobCellProps) {
  const showAdjustButton = point.ROLE === "OFFSET" || point.ROLE === "SETPOINT"

  return (
    <div
      className={`bg-slate-800/50 border rounded-lg p-4 flex flex-col items-center gap-4 transition-colors ${
        point.offline ? "border-red-700 opacity-70" : "border-slate-700 hover:border-slate-600"
      }`}
    >
      {/* Knob */}
      <div className="flex justify-center">
        <Knob
          value={point.value}
          min={0}
          max={100}
          size={120}
          thickness={0.15}
          angleArc={250}
          angleOffset={-125}
          fgColor={point.offline ? "#EF4444" : "#3B82F6"}
          bgColor="#334155"
        />
      </div>

      {/* Información del punto */}
      <div className="text-center">
        <h3 className="text-sm font-semibold text-slate-100">{point.S}</h3>
        <p className="text-xs text-slate-400 mt-1">
          {point.value.toFixed(1)} {point.UNIT}
        </p>
        {point.offline && <p className="text-xs text-red-400 mt-1">OFFLINE</p>}
      </div>

      {/* Botón Ajustar (solo si ROLE es OFFSET o SETPOINT) */}
      {showAdjustButton && (
        <button
          onClick={onAdjust}
          disabled={point.offline}
          className="w-full mt-auto px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
        >
          Ajustar
        </button>
      )}
    </div>
  )
}
