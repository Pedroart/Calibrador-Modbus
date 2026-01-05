"use client"

import type React from "react"
import { useState } from "react"
import type { ModbusPoint, ModbusRegister, PointRole } from "@/types/modbus"

interface AddEntryPointModalProps {
  onAdd: (point: ModbusPoint) => void
  onClose: () => void
}

export function AddEntryPointModal({ onAdd, onClose }: AddEntryPointModalProps) {
  const [formData, setFormData] = useState<ModbusPoint>({
    AMB: "",
    S: "",
    UNIT: "",
    ROLE: "VALUE",
    Host: "",
    Unit: 1,
    REG: "HR",
    ADDR: 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.AMB && formData.S && formData.Host) {
      onAdd(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Agregar nuevo EntryPoint</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Ambiente (AMB)</label>
            <input
              type="text"
              value={formData.AMB}
              onChange={(e) => setFormData({ ...formData, AMB: e.target.value })}
              placeholder="ej: COMPRESOR"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nombre (S)</label>
            <input
              type="text"
              value={formData.S}
              onChange={(e) => setFormData({ ...formData, S: e.target.value })}
              placeholder="ej: Presión"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Unidad (UNIT)</label>
            <input
              type="text"
              value={formData.UNIT}
              onChange={(e) => setFormData({ ...formData, UNIT: e.target.value })}
              placeholder="ej: °C, %, bar"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Host (IP)</label>
            <input
              type="text"
              value={formData.Host}
              onChange={(e) => setFormData({ ...formData, Host: e.target.value })}
              placeholder="ej: 192.168.1.100"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Unit ID</label>
              <input
                type="number"
                value={formData.Unit}
                onChange={(e) => setFormData({ ...formData, Unit: Number(e.target.value) })}
                placeholder="ej: 1"
                min="1"
                max="255"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Registro</label>
              <select
                value={formData.REG}
                onChange={(e) => setFormData({ ...formData, REG: e.target.value as ModbusRegister })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="IR">IR (Input Register)</option>
                <option value="HR">HR (Holding Register)</option>
                <option value="CO">CO (Coil)</option>
                <option value="DI">DI (Discrete Input)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Dirección (ADDR)</label>
              <input
                type="number"
                value={formData.ADDR}
                onChange={(e) => setFormData({ ...formData, ADDR: Number(e.target.value) })}
                placeholder="ej: 1000"
                min="0"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
              <select
                value={formData.ROLE}
                onChange={(e) => setFormData({ ...formData, ROLE: e.target.value as PointRole })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="VALUE">VALUE</option>
                <option value="OFFSET">OFFSET</option>
                <option value="SETPOINT">SETPOINT</option>
                <option value="STATUS">STATUS</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
