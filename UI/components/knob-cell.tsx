"use client"

import { Knob } from "./knob"

interface DataPoint {
  internal_id: string
  group: string
  name: string
  final_value: number
  offset: number
}

interface KnobCellProps {
  point: DataPoint
  onAdjust: () => void
}

export function KnobCell({ point, onAdjust }: KnobCellProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col items-center gap-4 hover:border-slate-600 transition-colors">
      {/* Knob */}
      <div className="flex justify-center">
        <Knob
          value={point.final_value}
          min={0}
          max={100}
          size={120}
          thickness={0.15}
          angleArc={250}
          angleOffset={-125}
          fgColor="#3B82F6"
          bgColor="#334155"
        />
      </div>

      {/* Nombre del punto */}
      <div className="text-center">
        <h3 className="text-sm font-semibold text-slate-100">{point.name}</h3>
        <p className="text-xs text-slate-400 mt-1">
          Offset: <span className="text-blue-400">{point.offset.toFixed(2)}</span>
        </p>
      </div>

      {/* Botón Ajustar */}
      <button
        onClick={onAdjust}
        className="w-full mt-auto px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
      >
        Ajustar
      </button>
    </div>
  )
}
