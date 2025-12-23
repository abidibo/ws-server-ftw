import WebSocket from 'ws'
import { IncomingMessage } from 'http'

export interface Connection {
  id: number
  ws: WebSocket
  path: string
  connectedAt: Date
  messagesSent: number
  messagesReceived: number
  lastActivity: Date
}

export interface ConnectionMetadataUpdate {
  messagesSent?: number
  messagesReceived?: number
  lastActivity?: Date
}

export class ConnectionRegistry {
  private connections: Map<number, Connection>
  private nextId: number

  constructor() {
    this.connections = new Map()
    this.nextId = 1
  }

  add(ws: WebSocket, req: IncomingMessage): number {
    const id = this.nextId++
    const connection: Connection = {
      id,
      ws,
      path: req.url || '/',
      connectedAt: new Date(),
      messagesSent: 0,
      messagesReceived: 0,
      lastActivity: new Date()
    }
    this.connections.set(id, connection)
    return id
  }

  remove(id: number): void {
    this.connections.delete(id)
  }

  get(id: number): Connection | undefined {
    return this.connections.get(id)
  }

  getAll(): Connection[] {
    return Array.from(this.connections.values())
  }

  updateMetadata(id: number, updates: ConnectionMetadataUpdate): void {
    const connection = this.connections.get(id)
    if (connection) {
      Object.assign(connection, updates)
    }
  }
}
