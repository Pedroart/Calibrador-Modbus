import { NextResponse } from "next/server"
import type { ModbusPoint } from "@/types/modbus"

const backendUrl = process.env.MODBUS_BACKEND_URL || "http://25.0.224.15:3100"

// GET - Obtener todos los puntos
export async function GET() {
  try {
    const response = await fetch(`${backendUrl}/api/points`)
    const points: ModbusPoint[] = await response.json()
    return NextResponse.json(points)
  } catch (error) {
    console.error("[API] Error fetching points:", error)
    return NextResponse.json([], { status: 500 })
  }
}

// POST - Crear nuevo punto
export async function POST(request: Request) {
  try {
    const body: ModbusPoint = await request.json()

    const response = await fetch(`${backendUrl}/api/points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to create point" }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error creating point:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Actualizar punto existente
export async function PUT(request: Request) {
  try {
    const body: ModbusPoint = await request.json()

    const response = await fetch(`${backendUrl}/api/points`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to update point" }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error updating point:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
