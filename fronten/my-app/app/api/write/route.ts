import { NextResponse } from "next/server"
import type { WriteRequest } from "@/types/modbus"

export async function POST(request: Request) {
  try {
    const body: WriteRequest = await request.json()

    // TODO: Reemplazar con la URL real del backend
    const backendUrl = process.env.MODBUS_BACKEND_URL || "http://25.0.224.15:3100"

    const response = await fetch(`${backendUrl}/api/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Write failed" }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Write error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
