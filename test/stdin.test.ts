import { describe, it } from 'mocha'
import assert from 'assert'
import { stdinParse } from '../src/stdin.js'

describe('stdin', () => {
  describe('stdinParse', () => {
    it('should parse merge command with object', () => {
      const input = Buffer.from('merge {"name": "John", "age": 30}')
      const result = stdinParse(input)

      assert.ok(result)
      assert.strictEqual(result.merge, true)
      assert.deepStrictEqual(result.obj, { name: 'John', age: 30 })
    })

    it('should parse deepmerge command with object', () => {
      const input = Buffer.from('deepmerge {"nested": {"key": "value"}}')
      const result = stdinParse(input)

      assert.ok(result)
      assert.strictEqual(result.deepmerge, true)
      assert.deepStrictEqual(result.obj, { nested: { key: 'value' } })
    })

    it('should parse append command with array', () => {
      const input = Buffer.from('append [1, 2, 3]')
      const result = stdinParse(input)

      assert.ok(result)
      assert.strictEqual(result.append, true)
      assert.deepStrictEqual(result.arr, [1, 2, 3])
    })

    it('should parse raw JSON object', () => {
      const input = Buffer.from('{"id": 1, "data": "test"}')
      const result = stdinParse(input)

      assert.ok(result)
      assert.deepStrictEqual(result.data, { id: 1, data: 'test' })
    })

    it('should parse raw JSON array', () => {
      const input = Buffer.from('[1, 2, 3, 4]')
      const result = stdinParse(input)

      assert.ok(result)
      assert.deepStrictEqual(result.data, [1, 2, 3, 4])
    })

    it('should parse raw JSON primitives', () => {
      let result = stdinParse(Buffer.from('true'))
      assert.ok(result)
      assert.strictEqual(result.data, true)

      result = stdinParse(Buffer.from('false'))
      assert.ok(result)
      assert.strictEqual(result.data, false)

      result = stdinParse(Buffer.from('null'))
      assert.ok(result)
      assert.strictEqual(result.data, null)

      result = stdinParse(Buffer.from('42'))
      assert.ok(result)
      assert.strictEqual(result.data, 42)

      result = stdinParse(Buffer.from('"hello"'))
      assert.ok(result)
      assert.strictEqual(result.data, 'hello')
    })

    it('should handle empty input', () => {
      const input = Buffer.from('')
      const result = stdinParse(input)

      assert.strictEqual(result, undefined)
    })

    it('should handle whitespace-only input', () => {
      const input = Buffer.from('   \n  \t  ')
      const result = stdinParse(input)

      assert.strictEqual(result, undefined)
    })

    it('should handle invalid JSON gracefully', () => {
      const originalConsoleError = console.error
      console.error = () => {} // Suppress expected error output

      const input = Buffer.from('invalid json')
      const result = stdinParse(input)

      console.error = originalConsoleError
      assert.strictEqual(result, undefined)
    })

    it('should handle invalid merge command', () => {
      const originalConsoleError = console.error
      console.error = () => {} // Suppress expected error output

      const input = Buffer.from('merge invalid')
      const result = stdinParse(input)

      console.error = originalConsoleError
      assert.strictEqual(result, undefined)
    })

    it('should handle invalid deepmerge command', () => {
      const originalConsoleError = console.error
      console.error = () => {} // Suppress expected error output

      const input = Buffer.from('deepmerge not-json')
      const result = stdinParse(input)

      console.error = originalConsoleError
      assert.strictEqual(result, undefined)
    })

    it('should handle invalid append command', () => {
      const originalConsoleError = console.error
      console.error = () => {} // Suppress expected error output

      const input = Buffer.from('append not-an-array')
      const result = stdinParse(input)

      console.error = originalConsoleError
      assert.strictEqual(result, undefined)
    })

    it('should work with object that has toString method', () => {
      const input = {
        toString: () => '{"test": true}'
      }
      const result = stdinParse(input)

      assert.ok(result)
      assert.deepStrictEqual(result.data, { test: true })
    })
  })
})
