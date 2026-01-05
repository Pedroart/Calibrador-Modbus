"use client"

import { useEffect, useState, useRef } from "react"
import type { ModbusPoint, PointState, WebSocketMessage } from "@/types/modbus"

export function useModbusWebSocket(url = "ws://25.0.224.15:3101") {
  const [points, setPoints] = useState<Map<string, PointState>>(new Map())
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Conectar WebSocket
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("[v0] WebSocket connected")
      setConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const msg: WebSocketMessage = JSON.parse(event.data)

        if (msg.type === "init" && msg.points) {
          // Inicializar puntos
          const newPoints = new Map<string, PointState>()
          msg.points.forEach((p: ModbusPoint) => {
            const key = `${p.Host}|${p.Unit}|${p.REG}|${p.ADDR}`
            newPoints.set(key, {
              ...p,
              key,
              value: 0,
              raw: 0,
              ts: Date.now(),
              offline: false,
            })
          })
          setPoints(newPoints)
        } else if (msg.type === "update" && msg.key) {
          // Actualizar valor
          setPoints((prev) => {
            const newMap = new Map(prev)
            const point = newMap.get(msg.key!)
            if (point) {
              newMap.set(msg.key!, {
                ...point,
                value: msg.value!,
                raw: msg.raw!,
                ts: msg.ts!,
                offline: false,
              })
            }
            return newMap
          })
        } else if (msg.type === "offline" && msg.key) {
          // Marcar offline
          setPoints((prev) => {
            const newMap = new Map(prev)
            const point = newMap.get(msg.key!)
            if (point) {
              newMap.set(msg.key!, {
                ...point,
                offline: true,
                lastSeen: msg.lastSeen,
              })
            }
            return newMap
          })
        }
      } catch (err) {
        console.error("[v0] WebSocket parse error:", err)
      }
    }

    ws.onerror = (err) => {
      console.error("[v0] WebSocket error:", err)
    }

    ws.onclose = () => {
      console.log("[v0] WebSocket closed")
      setConnected(false)
    }

    return () => {
      ws.close()
    }
  }, [url])

  return { points, connected }
}
