"use client"

import { useState } from "react"
import { AddEntryPointModal } from "./add-entry-point-modal"

interface EntryPoint {
  internal_id: string
  group: string
  name: string
  modbus_ip: string
  modbus_id: string
  modbus_addr: string
  offset_addr: string
  final_addr: string
}

const MOCK_ENTRY_POINTS: EntryPoint[] = [
  {
    internal_id: "EP001",
    group: "COMPRESOR",
    name: "Presión Compresor",
    modbus_ip: "192.168.1.100",
    modbus_id: "01",
    modbus_addr: "1000",
    offset_addr: "1001",
    final_addr: "1002",
  },
  {
    internal_id: "EP002",
    group: "EVAPORADORES",
    name: "Temp Evaporador 1",
    modbus_ip: "192.168.1.101",
    modbus_id: "02",
    modbus_addr: "2000",
    offset_addr: "2001",
    final_addr: "2002",
  },
]

export function EntryPoints() {
  const [data, setData] = useState<EntryPoint[]>(MOCK_ENTRY_POINTS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<EntryPoint>>({})
  const [modalOpen, setModalOpen] = useState(false)

  const handleEdit = (ep: EntryPoint) => {
    setEditingId(ep.internal_id)
    setEditData({ ...ep })
  }

  const handleSave = (id: string) => {
    setData((prev) => prev.map((ep) => (ep.internal_id === id ? { ...ep, ...editData } : ep)))
    setEditingId(null)
    setEditData({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleAddEntryPoint = (newEP: Omit<EntryPoint, "internal_id" | "offset_addr" | "final_addr">) => {
    const ep: EntryPoint = {
      ...newEP,
      internal_id: `EP${Date.now()}`,
      offset_addr: "0",
      final_addr: "0",
    }
    setData((prev) => [...prev, ep])
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
              <th className="px-4 py-3 text-left font-semibold text-slate-300">ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Grupo</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Modbus IP</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Modbus ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Modbus Addr</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Offset Addr</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Final Addr</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((ep) => (
              <tr key={ep.internal_id} className="border-b border-slate-700 hover:bg-slate-800/50">
                <td className="px-4 py-3 text-slate-400 bg-slate-900/30">{ep.internal_id}</td>
                <td className="px-4 py-3">
                  {editingId === ep.internal_id ? (
                    <input
                      type="text"
                      value={editData.group || ""}
                      onChange={(e) => setEditData({ ...editData, group: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
                    />
                  ) : (
                    ep.group
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === ep.internal_id ? (
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
                    />
                  ) : (
                    ep.name
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === ep.internal_id ? (
                    <input
                      type="text"
                      value={editData.modbus_ip || ""}
                      onChange={(e) => setEditData({ ...editData, modbus_ip: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
                    />
                  ) : (
                    ep.modbus_ip
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === ep.internal_id ? (
                    <input
                      type="text"
                      value={editData.modbus_id || ""}
                      onChange={(e) => setEditData({ ...editData, modbus_id: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
                    />
                  ) : (
                    ep.modbus_id
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === ep.internal_id ? (
                    <input
                      type="text"
                      value={editData.modbus_addr || ""}
                      onChange={(e) => setEditData({ ...editData, modbus_addr: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100"
                    />
                  ) : (
                    ep.modbus_addr
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400 bg-slate-900/30">{ep.offset_addr}</td>
                <td className="px-4 py-3 text-slate-400 bg-slate-900/30">{ep.final_addr}</td>
                <td className="px-4 py-3">
                  {editingId === ep.internal_id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(ep.internal_id)}
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
                      onClick={() => handleEdit(ep)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Agregar */}
      {modalOpen && <AddEntryPointModal onAdd={handleAddEntryPoint} onClose={() => setModalOpen(false)} />}
    </div>
  )
}
