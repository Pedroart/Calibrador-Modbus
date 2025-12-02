"use client"

import { useRef, useEffect } from "react"

interface KnobProps {
  value: number
  min: number
  max: number
  size: number
}

export function Knob({
  value,
  min,
  max,
  size,
}: KnobProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - size * 0.1

    ctx.clearRect(0, 0, size, size)

    // Normalizar 0..1
    const pct = (value - min) / (max - min)

    // Selección de color simple
    let color = "#4caf50" // verde
    if (pct < 0.33) color = "#2196f3"   // azul
    else if (pct > 0.66) color = "#f44336" // rojo

    // Círculo
    ctx.fillStyle = "#1e293b"
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()

    // Valor
    ctx.fillStyle = color
    ctx.font = `bold ${size * 0.28}px system-ui`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(value.toFixed(1), cx, cy)

  }, [value, min, max, size])

  return <canvas ref={canvasRef} width={size} height={size} style={{ display: "block" }} />
}
