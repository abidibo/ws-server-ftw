import { useState, useEffect } from 'react'
import { ServerManager } from '../../server-manager.js'
import { Connection } from '../../connection-registry.js'

export interface LogMessage {
  type: 'success' | 'error' | 'info'
  text: string
  timestamp: Date
}

export interface ServerState {
  connections: Connection[]
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  messages: LogMessage[]
  port: number | null
}

export function useServerState(serverManager: ServerManager): ServerState {
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [messages, setMessages] = useState<LogMessage[]>([])
  const [port, setPort] = useState<number | null>(null)

  const addMessage = (type: LogMessage['type'], text: string) => {
    setMessages(prev => [...prev, { type, text, timestamp: new Date() }].slice(-100))
  }

  useEffect(() => {
    // Server started
    const onServerStarted = (p: number) => {
      setPort(p)
    }

    // New connection
    const onConnectionNew = (conn: Connection) => {
      setConnections(prev => [...prev, conn])
      addMessage('info', `New connection: ${conn.path} (ID: ${conn.id})`)
    }

    // Connection closed
    const onConnectionClose = (connId: number) => {
      setConnections(prev => {
        const newConns = prev.filter(c => c.id !== connId)
        // Adjust selected index if needed
        setSelectedIndex(prevIdx => Math.max(0, Math.min(prevIdx, newConns.length - 1)))
        return newConns
      })
      addMessage('info', `Connection closed: ${connId}`)
    }

    // Data sent
    const onDataSent = (connId: number, data: unknown) => {
      const dataStr = JSON.stringify(data)
      const preview = dataStr.length > 100 ? dataStr.substring(0, 100) + '...' : dataStr
      addMessage('success', `Sent to ${connId}: ${preview}`)
    }

    // Message received
    const onConnectionMessage = (connId: number, message: string) => {
      addMessage('info', `Received from ${connId}: ${message}`)
    }

    // Error
    const onError = (connId: number, error: Error) => {
      addMessage('error', `Error on ${connId}: ${error.message}`)
    }

    // Register event listeners
    serverManager.on('server:started', onServerStarted)
    serverManager.on('connection:new', onConnectionNew)
    serverManager.on('connection:close', onConnectionClose)
    serverManager.on('data:sent', onDataSent)
    serverManager.on('connection:message', onConnectionMessage)
    serverManager.on('error', onError)

    // Cleanup
    return () => {
      serverManager.removeListener('server:started', onServerStarted)
      serverManager.removeListener('connection:new', onConnectionNew)
      serverManager.removeListener('connection:close', onConnectionClose)
      serverManager.removeListener('data:sent', onDataSent)
      serverManager.removeListener('connection:message', onConnectionMessage)
      serverManager.removeListener('error', onError)
    }
  }, [serverManager])

  return {
    connections,
    selectedIndex,
    setSelectedIndex,
    messages,
    port
  }
}
