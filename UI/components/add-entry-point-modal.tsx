"use client"

import type React from "react"

import { useState } from "react"

interface NewEntryPoint {
  group: string
  name: string
  modbus_ip: string
  modbus_id: string
  modbus_addr: string
}

interface AddEntryPointModalProps {
  onAdd: (ep: NewEntryPoint) => void
  onClose: () => void
}

export function AddEntryPointModal({ onAdd, onClose }: AddEntryPointModalProps) {
  const [formData, setFormData] = useState<NewEntryPoint>({
    group: "",
    name: "",
    modbus_ip: "",
    modbus_id: "",
    modbus_addr: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.group && formData.name && formData.modbus_ip && formData.modbus_id && formData.modbus_addr) {
      onAdd(formData)
      setFormData({
        group: "",
        name: "",
        modbus_ip: "",
        modbus_id: "",
        modbus_addr: "",
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Agregar nuevo EntryPoint</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Grupo</label>
            <input
              type="text"
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              placeholder="ej: COMPRESOR"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ej: Presión"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Modbus IP</label>
            <input
              type="text"
              value={formData.modbus_ip}
              onChange={(e) => setFormData({ ...formData, modbus_ip: e.target.value })}
              placeholder="ej: 192.168.1.100"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Modbus ID</label>
            <input
              type="text"
              value={formData.modbus_id}
              onChange={(e) => setFormData({ ...formData, modbus_id: e.target.value })}
              placeholder="ej: 01"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Modbus Address</label>
            <input
              type="text"
              value={formData.modbus_addr}
              onChange={(e) => setFormData({ ...formData, modbus_addr: e.target.value })}
              placeholder="ej: 1000"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
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
