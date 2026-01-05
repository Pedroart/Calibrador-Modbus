"use client"

import { useState, useEffect } from "react"
import { AddEntryPointModal } from "./add-entry-point-modal"
import type { ModbusPoint, ModbusRegister } from "@/types/modbus"

export function EntryPoints() {
  const [data, setData] = useState<ModbusPoint[]>([])
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<ModbusPoint>>({})
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetch("/api/points")
      .then((res) => res.json())
      .then((points: ModbusPoint[]) => setData(points))
      .catch((err) => console.error("[v0] Error loading points:", err))
  }, [])

  const getKey = (point: ModbusPoint) => `${point.Host}|${point.Unit}|${point.REG}|${point.ADDR}`

  const handleEdit = (point: ModbusPoint) => {
    setEditingKey(getKey(point))
    setEditData({ ...point })
  }

  const handleSave = async (point: ModbusPoint) => {
    const key = getKey(point)

    try {
      await fetch("/api/points", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...point, ...editData }),
      })

      setData((prev) => prev.map((p) => (getKey(p) === key ? { ...p, ...editData } : p)))
    } catch (err) {
      console.error("[v0] Error saving point:", err)
    }

    setEditingKey(null)
    setEditData({})
  }

  const handleCancel = () => {
    setEditingKey(null)
    setEditData({})
  }

  const handleAddEntryPoint = async (newPoint: ModbusPoint) => {
    try {
      const response = await fetch("/api/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPoint),
      })

      if (response.ok) {
        setData((prev) => [...prev, newPoint])
      }
    } catch (err) {
      console.error("[v0] Error adding point:", err)
    }

    setModalOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Botón Agregar */}
      <div className="flex justify-end">
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
        >
          + Agregar EntryPoint
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-slate-700 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Ambiente</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Unidad</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Host</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Unit ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Registro</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Dirección</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => {
              const key = getKey(point)
              const isEditing = editingKey === key

              return (
                <tr key={key} className="border-b border-slate-700 hover:bg-slate-800/50">
                  {/* AMB */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.AMB || ""}
                        onChange={(e) => setEditData({ ...editData, AMB: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
                      />
                    ) : (
                      point.AMB
                    )}
                  </td>

                  {/* S (nombre) */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.S || ""}
                        onChange={(e) => setEditData({ ...editData, S: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
                      />
                    ) : (
                      point.S
                    )}
                  </td>

                  {/* UNIT */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.UNIT || ""}
                        onChange={(e) => setEditData({ ...editData, UNIT: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
                      />
                    ) : (
                      point.UNIT
                    )}
                  </td>

                  {/* Host */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.Host || ""}
                        onChange={(e) => setEditData({ ...editData, Host: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
                      />
                    ) : (
                      point.Host
                    )}
                  </td>

                  {/* Unit ID */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.Unit || ""}
                        onChange={(e) => setEditData({ ...editData, Unit: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
                      />
                    ) : (
                      point.Unit
                    )}
                  </td>

                  {/* REG */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        value={editData.REG || ""}
                        onChange={(e) => setEditData({ ...editData, REG: e.target.value as ModbusRegister })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
                      >
                        <option value="IR">IR</option>
                        <option value="HR">HR</option>
                        <option value="CO">CO</option>
                        <option value="DI">DI</option>
                      </select>
                    ) : (
                      point.REG
                    )}
                  </td>

                  {/* ADDR */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.ADDR || ""}
                        onChange={(e) => setEditData({ ...editData, ADDR: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
                      />
                    ) : (
                      point.ADDR
                    )}
                  </td>

                  {/* ROLE (read only) */}
                  <td className="px-4 py-3 text-slate-400 bg-slate-900/30">{point.ROLE}</td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(point)}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs rounded transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(point)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Agregar */}
      {modalOpen && <AddEntryPointModal onAdd={handleAddEntryPoint} onClose={() => setModalOpen(false)} />}
    </div>
  )
}
