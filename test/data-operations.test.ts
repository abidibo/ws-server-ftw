import { describe, it, beforeEach } from 'mocha'
import assert from 'assert'
import { loadDataFromDb, applyOperation } from '../src/data-operations.js'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

describe('data-operations', () => {
  describe('loadDataFromDb', () => {
    let tempDir: string

    beforeEach(async () => {
      tempDir = join(tmpdir(), `ws-server-test-${Date.now()}`)
      await mkdir(tempDir, { recursive: true })
    })

    it('should load JSON file', async () => {
      const dbPath = join(tempDir, 'db.json')
      const data = { users: [{ id: 1, name: 'John' }], posts: [] }
      await writeFile(dbPath, JSON.stringify(data))

      const result = await loadDataFromDb(dbPath, '/')

      assert.deepStrictEqual(result, data)
    })

    it('should navigate nested path in JSON', async () => {
      const dbPath = join(tempDir, 'db.json')
      const data = { api: { v1: { users: [{ id: 1, name: 'Alice' }] } } }
      await writeFile(dbPath, JSON.stringify(data))

      const result = await loadDataFromDb(dbPath, '/api/v1/users')

      assert.deepStrictEqual(result, [{ id: 1, name: 'Alice' }])
    })

    it('should handle empty path segments', async () => {
      const dbPath = join(tempDir, 'db.json')
      const data = { api: { users: [{ id: 1 }] } }
      await writeFile(dbPath, JSON.stringify(data))

      const result = await loadDataFromDb(dbPath, '//api//users//')

      assert.deepStrictEqual(result, [{ id: 1 }])
    })

    it('should return undefined for non-existent path', async () => {
      const dbPath = join(tempDir, 'db.json')
      const data = { users: [] }
      await writeFile(dbPath, JSON.stringify(data))

      const result = await loadDataFromDb(dbPath, '/nonexistent/path')

      assert.strictEqual(result, undefined)
    })

    it('should load JS file with default export', async () => {
      const dbPath = join(tempDir, 'db.js')
      const content = 'export default { users: [{ id: 1, name: "Bob" }] }'
      await writeFile(dbPath, content)

      const result = await loadDataFromDb(dbPath, '/')

      assert.deepStrictEqual(result, { users: [{ id: 1, name: 'Bob' }] })
    })

    it('should navigate path in JS file', async () => {
      const dbPath = join(tempDir, 'db.js')
      const content = 'export default { api: { data: { value: 42 } } }'
      await writeFile(dbPath, content)

      const result = await loadDataFromDb(dbPath, '/api/data/value')

      assert.strictEqual(result, 42)
    })
  })

  describe('applyOperation', () => {
    it('should return base data when operation is null', async () => {
      const baseData = { test: 'value' }
      const result = await applyOperation(baseData, null)

      assert.strictEqual(result, baseData)
    })

    it('should apply raw operation', async () => {
      const baseData = { old: 'data' }
      const operation = { type: 'raw' as const, data: { new: 'data' } }

      const result = await applyOperation(baseData, operation)

      assert.deepStrictEqual(result, { new: 'data' })
    })

    it('should apply merge operation to objects', async () => {
      const baseData = { a: 1, b: 2 }
      const operation = { type: 'merge' as const, data: { b: 3, c: 4 } }

      const result = await applyOperation(baseData, operation)

      assert.deepStrictEqual(result, { a: 1, b: 3, c: 4 })
    })

    it('should not mutate original data in merge', async () => {
      const baseData = { a: 1, b: 2 }
      const operation = { type: 'merge' as const, data: { b: 3 } }

      await applyOperation(baseData, operation)

      assert.deepStrictEqual(baseData, { a: 1, b: 2 })
    })

    it('should return base data when merge with non-object', async () => {
      const baseData = { a: 1 }
      const operation = { type: 'merge' as const, data: 'string' }

      const result = await applyOperation(baseData, operation)

      assert.strictEqual(result, baseData)
    })

    it('should apply deepmerge operation to objects', async () => {
      const baseData = { a: { b: 1, c: 2 }, d: 3 }
      const operation = { type: 'deepmerge' as const, data: { a: { b: 10 }, e: 4 } }

      const result = await applyOperation(baseData, operation)

      assert.deepStrictEqual(result, { a: { b: 10, c: 2 }, d: 3, e: 4 })
    })

    it('should concatenate arrays in deepmerge', async () => {
      const baseData = { items: [1, 2] }
      const operation = { type: 'deepmerge' as const, data: { items: [3, 4] } }

      const result = await applyOperation(baseData, operation)

      assert.deepStrictEqual(result, { items: [1, 2, 3, 4] })
    })

    it('should return base data when deepmerge with non-object', async () => {
      const baseData = { a: 1 }
      const operation = { type: 'deepmerge' as const, data: [1, 2, 3] }

      const result = await applyOperation(baseData, operation)

      assert.strictEqual(result, baseData)
    })

    it('should apply append operation to arrays', async () => {
      const baseData = [1, 2, 3]
      const operation = { type: 'append' as const, data: [4, 5, 6] }

      const result = await applyOperation(baseData, operation)

      assert.deepStrictEqual(result, [1, 2, 3, 4, 5, 6])
    })

    it('should not mutate original array in append', async () => {
      const baseData = [1, 2, 3]
      const operation = { type: 'append' as const, data: [4, 5] }

      await applyOperation(baseData, operation)

      assert.deepStrictEqual(baseData, [1, 2, 3])
    })

    it('should return base data when append with non-array', async () => {
      const baseData = [1, 2, 3]
      const operation = { type: 'append' as const, data: { key: 'value' } }

      const result = await applyOperation(baseData, operation)

      assert.strictEqual(result, baseData)
    })

    it('should handle append when base is not array', async () => {
      const baseData = { key: 'value' }
      const operation = { type: 'append' as const, data: [1, 2, 3] }

      const result = await applyOperation(baseData, operation)

      assert.strictEqual(result, baseData)
    })

    it('should handle complex nested deepmerge', async () => {
      const baseData = {
        users: [{ id: 1, name: 'Alice' }],
        settings: { theme: 'dark', language: 'en' }
      }
      const operation = {
        type: 'deepmerge' as const,
        data: {
          users: [{ id: 2, name: 'Bob' }],
          settings: { language: 'fr', notifications: true }
        }
      }

      const result = await applyOperation(baseData, operation)

      assert.deepStrictEqual(result, {
        users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
        settings: { theme: 'dark', language: 'fr', notifications: true }
      })
    })
  })
})
