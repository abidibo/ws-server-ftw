import { describe, it } from 'mocha'
import assert from 'assert'
import { highlightJson } from '../src/tui/utils/json-highlighter.js'
import chalk from 'chalk'

describe('json-highlighter', () => {
  describe('highlightJson', () => {
    it('should highlight object keys in cyan', () => {
      const json = '{"name": "value"}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.cyan('"name"')))
    })

    it('should highlight string values in green', () => {
      const json = '{"key": "string value"}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.green('"string value"')))
    })

    it('should highlight numbers in yellow', () => {
      const json = '{"count": 42}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.yellow('42')))
    })

    it('should highlight floating point numbers', () => {
      const json = '{"pi": 3.14159}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.yellow('3.14159')))
    })

    it('should highlight negative numbers', () => {
      const json = '{"value": -123}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.yellow('-123')))
    })

    it('should highlight scientific notation', () => {
      const json = '{"value": 1.5e10}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.yellow('1.5e10')))
    })

    it('should highlight true in magenta', () => {
      const json = '{"enabled": true}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.magenta('true')))
    })

    it('should highlight false in magenta', () => {
      const json = '{"disabled": false}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.magenta('false')))
    })

    it('should highlight null in gray', () => {
      const json = '{"data": null}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.gray('null')))
    })

    it('should highlight punctuation in white', () => {
      const json = '{"a": 1}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.white('{')))
      assert.ok(result.includes(chalk.white('}')))
      assert.ok(result.includes(chalk.white(':')))
    })

    it('should highlight arrays correctly', () => {
      const json = '[1, 2, 3]'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.white('[')))
      assert.ok(result.includes(chalk.white(']')))
      assert.ok(result.includes(chalk.yellow('1')))
      assert.ok(result.includes(chalk.yellow('2')))
      assert.ok(result.includes(chalk.yellow('3')))
    })

    it('should distinguish between keys and string values', () => {
      const json = '{"key": "value"}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.cyan('"key"')))
      assert.ok(result.includes(chalk.green('"value"')))
    })

    it('should handle nested objects', () => {
      const json = '{"outer": {"inner": "value"}}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.cyan('"outer"')))
      assert.ok(result.includes(chalk.cyan('"inner"')))
      assert.ok(result.includes(chalk.green('"value"')))
    })

    it('should handle arrays of objects', () => {
      const json = '[{"id": 1}, {"id": 2}]'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.cyan('"id"')))
      assert.ok(result.includes(chalk.yellow('1')))
      assert.ok(result.includes(chalk.yellow('2')))
    })

    it('should handle complex nested structures', () => {
      const json = JSON.stringify({
        users: [
          { id: 1, name: 'Alice', active: true },
          { id: 2, name: 'Bob', active: false }
        ],
        count: 2,
        metadata: null
      })

      const result = highlightJson(json)

      assert.ok(result.includes(chalk.cyan('"users"')))
      assert.ok(result.includes(chalk.cyan('"id"')))
      assert.ok(result.includes(chalk.cyan('"name"')))
      assert.ok(result.includes(chalk.cyan('"active"')))
      assert.ok(result.includes(chalk.green('"Alice"')))
      assert.ok(result.includes(chalk.green('"Bob"')))
      assert.ok(result.includes(chalk.yellow('1')))
      assert.ok(result.includes(chalk.yellow('2')))
      assert.ok(result.includes(chalk.magenta('true')))
      assert.ok(result.includes(chalk.magenta('false')))
      assert.ok(result.includes(chalk.gray('null')))
    })

    it('should preserve whitespace', () => {
      const json = '{\n  "key": "value"\n}'
      const result = highlightJson(json)

      // Strip ANSI codes to verify whitespace is preserved
      const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
      assert.strictEqual(stripped, json)

      // Also verify the newlines and indentation exist in the result
      assert.ok(result.includes('\n'))
      const lines = result.split('\n')
      assert.strictEqual(lines.length, 3) // three lines: {, "key": "value", }
    })

    it('should handle empty object', () => {
      const json = '{}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.white('{')))
      assert.ok(result.includes(chalk.white('}')))
    })

    it('should handle empty array', () => {
      const json = '[]'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.white('[')))
      assert.ok(result.includes(chalk.white(']')))
    })

    it('should handle string with escaped characters', () => {
      const json = '{"text": "line1\\nline2"}'
      const result = highlightJson(json)

      assert.ok(result.includes(chalk.cyan('"text"')))
      assert.ok(result.includes(chalk.green('"line1\\nline2"')))
    })

    it('should return the same content when no highlighting applied to plain text', () => {
      const json = '{"simple": 123}'
      const result = highlightJson(json)

      // Result should contain all original characters (with color codes)
      // Strip ANSI codes to verify content preservation
      const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
      assert.strictEqual(stripped, json)
    })
  })
})
