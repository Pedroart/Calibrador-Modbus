"use client"

import { useState, useEffect } from "react"
import { KnobCell } from "./knob-cell"
import { AdjustOffsetModal } from "./adjust-offset-modal"

interface DataPoint {
  internal_id: string
  group: string
  name: string
  final_value: number
  offset: number
}

const GROUPS = ["COMPRESOR", "EVAPORADORES", "BOMBA", "VÁLVULAS"]
const COLUMN_OPTIONS = [4, 5, 6]

// Mock data - reemplazar con API real
const MOCK_DATA: DataPoint[] = [
  { internal_id: "1", group: "COMPRESOR", name: "Presión", final_value: 0, offset: 0 },
  { internal_id: "2", group: "COMPRESOR", name: "Temperatura", final_value: 0, offset: 0 },
  { internal_id: "3", group: "COMPRESOR", name: "Velocidad", final_value: 0, offset: 0 },
  { internal_id: "4", group: "COMPRESOR", name: "Vibración", final_value: 0, offset: 0 },

  { internal_id: "5", group: "EVAPORADORES", name: "Temp Entrada", final_value: 0, offset: 0 },
  { internal_id: "6", group: "EVAPORADORES", name: "Temp Salida", final_value: 0, offset: 0 },
  { internal_id: "7", group: "EVAPORADORES", name: "Flujo", final_value: 0, offset: 0 },
  { internal_id: "8", group: "EVAPORADORES", name: "Humedad", final_value: 0, offset: 0 },

  { internal_id: "9", group: "BOMBA", name: "RPM", final_value: 0, offset: 0 },
  { internal_id: "10", group: "BOMBA", name: "Potencia", final_value: 0, offset: 0 },
  { internal_id: "11", group: "BOMBA", name: "Flujo", final_value: 0, offset: 0 },

  { internal_id: "12", group: "VÁLVULAS", name: "Posición 1", final_value: 0, offset: 0 },
  { internal_id: "13", group: "VÁLVULAS", name: "Posición 2", final_value: 0, offset: 0 },
]

export function Dashboard() {
  const [activeGroup, setActiveGroup] = useState(GROUPS[0])
  const [columns, setColumns] = useState(4)
  const [data, setData] = useState<DataPoint[]>(MOCK_DATA)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((point) => {
          // Variación aleatoria pequeña
          const delta = (Math.random() - 0.5) * 10; // cambia máximo ±0.25 por tick

          // Nuevo valor dentro del rango -10 a 10
          let newValue = point.final_value + delta;

          // Limitar a -10 y 10
          newValue = Math.max(-10, Math.min(10, newValue));

          return {
            ...point,
            final_value: parseFloat(newValue.toFixed(2)), // 2 decimales
          };
        }),
      )
    }, 200);

    return () => clearInterval(interval);
  }, []);


  const filteredData = data.filter((point) => point.group === activeGroup)

  const handleOpenModal = (point: DataPoint) => {
    setSelectedPoint(point)
    setModalOpen(true)
  }

  const handleSaveOffset = (newOffset: number) => {
    if (selectedPoint) {
      setData((prev) =>
        prev.map((p) => (p.internal_id === selectedPoint.internal_id ? { ...p, offset: newOffset } : p)),
      )
    }
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
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
            {GROUPS.map((group) => (
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
          <div className="col-span-full text-center py-8 text-slate-400">Sin datos para este grupo</div>
        ) : (
          filteredData.map((point) => (
            <KnobCell key={point.internal_id} point={point} onAdjust={() => handleOpenModal(point)} />
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
