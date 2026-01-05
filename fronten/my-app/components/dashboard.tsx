"use client"

import { useState, useMemo } from "react"
import { KnobCell } from "./knob-cell"
import { AdjustOffsetModal } from "./adjust-offset-modal"
import { useModbusWebSocket } from "@/hooks/use-modbus-websocket"
import type { PointState } from "@/types/modbus"

const COLUMN_OPTIONS = [4, 5, 6]

export function Dashboard() {
  const { points, connected } = useModbusWebSocket()
  const [columns, setColumns] = useState(4)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<PointState | null>(null)

  // Extraer grupos únicos (AMB)
  const groups = useMemo(() => {
    const set = new Set<string>()
    points.forEach((p) => set.add(p.AMB))
    return Array.from(set).sort()
  }, [points])

  const [activeGroup, setActiveGroup] = useState<string>("")

  // Auto-seleccionar primer grupo
  if (groups.length > 0 && !activeGroup) {
    setActiveGroup(groups[0])
  }

  // Filtrar por grupo activo
  const filteredData = useMemo(() => {
    return Array.from(points.values()).filter((p) => p.AMB === activeGroup)
  }, [points, activeGroup])

  const handleOpenModal = (point: PointState) => {
    setSelectedPoint(point)
    setModalOpen(true)
  }

  const handleSaveOffset = async (newOffset: number) => {
    if (!selectedPoint) return

    try {
      const response = await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Host: selectedPoint.Host,
          Unit: selectedPoint.Unit,
          REG: selectedPoint.REG,
          ADDR: selectedPoint.ADDR,
          value: newOffset,
        }),
      })

      if (!response.ok) {
        console.error("[v0] Write failed:", await response.text())
      }
    } catch (err) {
      console.error("[v0] Write error:", err)
    }

    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Estado de conexión */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-slate-400">{connected ? "Conectado" : "Desconectado"}</span>
      </div>

      {/* Controles */}
      <div className="flex gap-6 items-center">
        {/* Selector de Grupo */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Grupo</label>
          <select
            value={activeGroup}
            onChange={(e) => setActiveGroup(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 hover:border-slate-600 cursor-pointer"
          >
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Columnas */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Columnas</label>
          <div className="flex gap-2">
            {COLUMN_OPTIONS.map((col) => (
              <button
                key={col}
                onClick={() => setColumns(col)}
                className={`px-3 py-2 rounded font-medium transition-colors ${
                  columns === col ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Knobs */}
      <div
        className="grid gap-4 p-4 bg-slate-900/30 border border-slate-800 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(200px, 1fr))`,
        }}
      >
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-400">
            {groups.length === 0 ? "Esperando datos..." : "Sin datos para este grupo"}
          </div>
        ) : (
          filteredData.map((point) => (
            <KnobCell key={point.key} point={point} onAdjust={() => handleOpenModal(point)} />
          ))
        )}
      </div>

      {/* Modal de Ajuste */}
      {modalOpen && selectedPoint && (
        <AdjustOffsetModal point={selectedPoint} onSave={handleSaveOffset} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}
