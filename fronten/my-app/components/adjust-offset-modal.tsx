"use client"

import { useState } from "react"
import type { PointState } from "@/types/modbus"

interface AdjustOffsetModalProps {
  point: PointState
  onSave: (offset: number) => void
  onClose: () => void
}

export function AdjustOffsetModal({ point, onSave, onClose }: AdjustOffsetModalProps) {
  const [offset, setOffset] = useState(0)

  const handleSave = () => {
    onSave(offset)
  }

  const handleReset = () => {
    setOffset(0)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Ajustar Offset - {point.S}</h2>

        <div className="space-y-4">
          {/* Info actual */}
          <div className="bg-slate-900/50 border border-slate-700 rounded p-3 text-sm">
            <p className="text-slate-400">
              Valor actual:{" "}
              <span className="text-blue-400 font-semibold">
                {point.value.toFixed(2)} {point.UNIT}
              </span>
            </p>
            <p className="text-slate-400 mt-1 text-xs">
              Raw: <span className="text-slate-500">{point.raw}</span>
            </p>
          </div>

          {/* Input de offset */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nuevo Offset</label>
            <input
              type="number"
              value={offset}
              onChange={(e) => setOffset(Number.parseFloat(e.target.value) || 0)}
              step="0.1"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Información de cálculo */}
          <div className="bg-slate-900/50 border border-slate-700 rounded p-3 text-sm">
            <p className="text-slate-400">
              Valor final:{" "}
              <span className="text-blue-400 font-semibold">
                {(point.value + offset).toFixed(2)} {point.UNIT}
              </span>
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded transition-colors"
          >
            Reset a 0
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
          >
            Guardar
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
