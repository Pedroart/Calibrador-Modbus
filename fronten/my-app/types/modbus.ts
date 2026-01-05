export type ModbusRegister = "IR" | "HR" | "CO" | "DI"
export type PointRole = "VALUE" | "OFFSET" | "SETPOINT" | "STATUS"

export interface ModbusPoint {
  // Metadatos (no cambian)
  AMB: string // Ambiente / grupo visual
  S: string // Nombre del punto
  UNIT: string // Unidad (°C, %, bar)
  ROLE: PointRole
  Host: string
  Unit: number
  REG: ModbusRegister
  ADDR: number
}

export interface PointValue {
  key: string // "Host|Unit|REG|ADDR"
  value: number
  raw: number
  ts: number // epoch ms
}

export interface PointState extends ModbusPoint {
  key: string
  value: number
  raw: number
  ts: number
  offline?: boolean
  lastSeen?: number
}

export interface WebSocketMessage {
  type: "init" | "update" | "offline"
  points?: ModbusPoint[]
  key?: string
  value?: number
  raw?: number
  ts?: number
  lastSeen?: number
}

export interface WriteRequest {
  Host: string
  Unit: number
  REG: "HR" | "CO"
  ADDR: number
  value: number | boolean
}
