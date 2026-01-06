import { describe, it, beforeEach } from 'mocha'
import assert from 'assert'
import { ConnectionRegistry } from '../src/connection-registry.js'
import WebSocket from 'ws'
import { IncomingMessage } from 'http'

describe('ConnectionRegistry', () => {
  let registry: ConnectionRegistry
  let mockWs: WebSocket
  let mockReq: IncomingMessage

  beforeEach(() => {
    registry = new ConnectionRegistry()
    mockWs = {} as WebSocket
    mockReq = { url: '/test/path' } as IncomingMessage
  })

  describe('add', () => {
    it('should add a connection and return an auto-incremented ID', () => {
      const id1 = registry.add(mockWs, mockReq)
      const id2 = registry.add(mockWs, { url: '/another' } as IncomingMessage)

      assert.strictEqual(id1, 1)
      assert.strictEqual(id2, 2)
    })

    it('should store connection with correct properties', () => {
      const beforeAdd = Date.now()
      const id = registry.add(mockWs, mockReq)
      const afterAdd = Date.now()

      const connection = registry.get(id)

      assert.ok(connection)
      assert.strictEqual(connection.id, id)
      assert.strictEqual(connection.ws, mockWs)
      assert.strictEqual(connection.path, '/test/path')
      assert.strictEqual(connection.messagesSent, 0)
      assert.strictEqual(connection.messagesReceived, 0)
      assert.ok(connection.connectedAt.getTime() >= beforeAdd)
      assert.ok(connection.connectedAt.getTime() <= afterAdd)
      assert.ok(connection.lastActivity.getTime() >= beforeAdd)
      assert.ok(connection.lastActivity.getTime() <= afterAdd)
    })

    it('should default to "/" when req.url is undefined', () => {
      const id = registry.add(mockWs, {} as IncomingMessage)
      const connection = registry.get(id)

      assert.ok(connection)
      assert.strictEqual(connection.path, '/')
    })
  })

  describe('remove', () => {
    it('should remove a connection by ID', () => {
      const id = registry.add(mockWs, mockReq)

      assert.ok(registry.get(id))
      registry.remove(id)
      assert.strictEqual(registry.get(id), undefined)
    })

    it('should handle removing non-existent connection', () => {
      assert.doesNotThrow(() => {
        registry.remove(999)
      })
    })
  })

  describe('get', () => {
    it('should return connection by ID', () => {
      const id = registry.add(mockWs, mockReq)
      const connection = registry.get(id)

      assert.ok(connection)
      assert.strictEqual(connection.id, id)
    })

    it('should return undefined for non-existent ID', () => {
      const connection = registry.get(999)
      assert.strictEqual(connection, undefined)
    })
  })

  describe('getAll', () => {
    it('should return empty array when no connections', () => {
      const connections = registry.getAll()
      assert.ok(Array.isArray(connections))
      assert.strictEqual(connections.length, 0)
    })

    it('should return all connections as an array', () => {
      const id1 = registry.add(mockWs, mockReq)
      const id2 = registry.add(mockWs, { url: '/another' } as IncomingMessage)
      const id3 = registry.add(mockWs, { url: '/third' } as IncomingMessage)

      const connections = registry.getAll()

      assert.strictEqual(connections.length, 3)
      assert.ok(connections.find(c => c.id === id1))
      assert.ok(connections.find(c => c.id === id2))
      assert.ok(connections.find(c => c.id === id3))
    })

    it('should return current state after removals', () => {
      const id1 = registry.add(mockWs, mockReq)
      const id2 = registry.add(mockWs, mockReq)
      const id3 = registry.add(mockWs, mockReq)

      registry.remove(id2)

      const connections = registry.getAll()
      assert.strictEqual(connections.length, 2)
      assert.ok(connections.find(c => c.id === id1))
      assert.ok(connections.find(c => c.id === id3))
      assert.ok(!connections.find(c => c.id === id2))
    })
  })

  describe('updateMetadata', () => {
    it('should update messagesSent', () => {
      const id = registry.add(mockWs, mockReq)

      registry.updateMetadata(id, { messagesSent: 5 })

      const connection = registry.get(id)
      assert.ok(connection)
      assert.strictEqual(connection.messagesSent, 5)
    })

    it('should update messagesReceived', () => {
      const id = registry.add(mockWs, mockReq)

      registry.updateMetadata(id, { messagesReceived: 10 })

      const connection = registry.get(id)
      assert.ok(connection)
      assert.strictEqual(connection.messagesReceived, 10)
    })

    it('should update lastActivity', () => {
      const id = registry.add(mockWs, mockReq)
      const newDate = new Date('2025-01-01')

      registry.updateMetadata(id, { lastActivity: newDate })

      const connection = registry.get(id)
      assert.ok(connection)
      assert.strictEqual(connection.lastActivity, newDate)
    })

    it('should update multiple fields at once', () => {
      const id = registry.add(mockWs, mockReq)
      const newDate = new Date('2025-01-01')

      registry.updateMetadata(id, {
        messagesSent: 3,
        messagesReceived: 7,
        lastActivity: newDate
      })

      const connection = registry.get(id)
      assert.ok(connection)
      assert.strictEqual(connection.messagesSent, 3)
      assert.strictEqual(connection.messagesReceived, 7)
      assert.strictEqual(connection.lastActivity, newDate)
    })

    it('should not throw when updating non-existent connection', () => {
      assert.doesNotThrow(() => {
        registry.updateMetadata(999, { messagesSent: 5 })
      })
    })

    it('should preserve other fields when updating partial metadata', () => {
      const id = registry.add(mockWs, mockReq)
      const connection = registry.get(id)!
      const originalConnectedAt = connection.connectedAt
      const originalPath = connection.path

      registry.updateMetadata(id, { messagesSent: 5 })

      const updated = registry.get(id)!
      assert.strictEqual(updated.messagesSent, 5)
      assert.strictEqual(updated.messagesReceived, 0)
      assert.strictEqual(updated.connectedAt, originalConnectedAt)
      assert.strictEqual(updated.path, originalPath)
    })
  })
})
