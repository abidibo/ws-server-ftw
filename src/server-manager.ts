import { EventEmitter } from 'events'
import * as fs from 'fs'
import WebSocket, { WebSocketServer } from 'ws'
import { ConnectionRegistry, Connection } from './connection-registry.js'
import { loadDataFromDb, applyOperation, DataOperation } from './data-operations.js'
import type { IncomingMessage } from 'http'

export interface ServerManagerEvents {
  'connection:new': (conn: Connection) => void
  'connection:message': (connId: number, message: string) => void
  'connection:close': (connId: number) => void
  'data:sent': (connId: number, data: unknown) => void
  'server:started': (port: number) => void
  'server:stopped': () => void
  'error': (connId: number, error: Error) => void
}

export declare interface ServerManager {
  on<K extends keyof ServerManagerEvents>(
    event: K,
    listener: ServerManagerEvents[K]
  ): this
  emit<K extends keyof ServerManagerEvents>(
    event: K,
    ...args: Parameters<ServerManagerEvents[K]>
  ): boolean
}

export class ServerManager extends EventEmitter {
  private dbPath: string
  private port: number
  private registry: ConnectionRegistry
  private wss: WebSocketServer | null = null

  constructor(dbPath: string, port: number) {
    super()
    this.dbPath = dbPath
    this.port = port
    this.registry = new ConnectionRegistry()
  }

  start(): void {
    this.wss = new WebSocketServer({ port: this.port })

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const connId = this.registry.add(ws, req)
      const conn = this.registry.get(connId)

      if (!conn) return

      // Emit new connection event
      this.emit('connection:new', conn)

      // Setup message listener
      ws.on('message', (message: WebSocket.Data) => {
        this.registry.updateMetadata(connId, {
          messagesReceived: conn.messagesReceived + 1,
          lastActivity: new Date()
        })
        this.emit('connection:message', connId, message.toString())
      })

      // Setup close listener
      ws.on('close', () => {
        this.emit('connection:close', connId)
        this.registry.remove(connId)
      })

      // Send initial data
      this.sendData(connId)
    })

    this.emit('server:started', this.port)
  }

  async sendData(connId: number, operation?: DataOperation | null): Promise<void> {
    const conn = this.registry.get(connId)
    if (!conn) return

    try {
      const baseData = await loadDataFromDb(this.dbPath, conn.path)
      const finalData = await applyOperation(baseData, operation || null)

      conn.ws.send(JSON.stringify(finalData))
      this.registry.updateMetadata(connId, {
        messagesSent: conn.messagesSent + 1,
        lastActivity: new Date()
      })

      this.emit('data:sent', connId, finalData)
    } catch (e) {
      this.emit('error', connId, e as Error)
    }
  }

  getConnections(): Connection[] {
    return this.registry.getAll()
  }

  getDbContent(): string {
    return fs.readFileSync(this.dbPath, 'utf-8')
  }

  saveDbContent(content: string): void {
    fs.writeFileSync(this.dbPath, content, 'utf-8')
  }

  updateDbValue(path: string, value: any): void {
    const content = this.getDbContent()
    const db = JSON.parse(content)
    this._setValueByPath(db, path, value)
    this.saveDbContent(JSON.stringify(db, null, 2))
  }

  private _setValueByPath(obj: any, path: string, value: any) {
    const keys = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.')
    let current = obj
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (typeof current[key] === 'undefined') {
        current[key] = {}
      }
      current = current[key]
    }
    current[keys[keys.length - 1]] = value
  }

  closeConnection(connId: number): void {
    const conn = this.registry.get(connId)
    if (conn) {
      conn.ws.close()
      // The 'close' event listener will handle cleanup and emit 'connection:close'
    }
  }

  stop(): void {
    if (this.wss) {
      // Terminate all active connections to allow the process to exit
      for (const conn of this.registry.getAll()) {
        conn.ws.terminate()
      }
      this.wss.close()
      this.emit('server:stopped')
    }
  }
}
