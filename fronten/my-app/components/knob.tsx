"use client"

import { useRef, useEffect } from "react"

interface KnobProps {
  value: number
  min: number
  max: number
  size: number
  thickness: number
  angleArc: number
  angleOffset: number
  fgColor: string
  bgColor: string
}

export function Knob({ value, min, max, size, thickness, angleArc, angleOffset, fgColor, bgColor }: KnobProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - size * thickness

    // Limpiar
    ctx.clearRect(0, 0, size, size)

    // Dibujar fondo
    ctx.strokeStyle = bgColor
    ctx.lineWidth = size * thickness
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, (angleOffset * Math.PI) / 180, ((angleOffset + angleArc) * Math.PI) / 180)
    ctx.stroke()

    // Dibujar valor
    const percentage = (value - min) / (max - min)
    const angle = angleOffset + angleArc * percentage
    ctx.strokeStyle = fgColor
    ctx.lineWidth = size * thickness
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, (angleOffset * Math.PI) / 180, (angle * Math.PI) / 180)
    ctx.stroke()

    // Dibujar indicador
    const indicatorAngle = (angle * Math.PI) / 180
    const indicatorX = centerX + radius * Math.cos(indicatorAngle)
    const indicatorY = centerY + radius * Math.sin(indicatorAngle)
    ctx.fillStyle = fgColor
    ctx.beginPath()
    ctx.arc(indicatorX, indicatorY, size * 0.08, 0, Math.PI * 2)
    ctx.fill()

    // Dibujar centro
    ctx.fillStyle = "#1e293b"
    ctx.beginPath()
    ctx.arc(centerX, centerY, size * 0.12, 0, Math.PI * 2)
    ctx.fill()

    // Texto del valor
    ctx.fillStyle = fgColor
    ctx.font = `bold ${size * 0.25}px system-ui`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(value.toFixed(0), centerX, centerY)
  }, [value, min, max, size, thickness, angleArc, angleOffset, fgColor, bgColor])

  return <canvas ref={canvasRef} width={size} height={size} style={{ display: "block" }} />
}
