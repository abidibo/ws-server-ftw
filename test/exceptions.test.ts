import { describe, it } from 'mocha'
import assert from 'assert'
import { InvalidFileException } from '../src/exceptions.js'

describe('exceptions', () => {
  describe('InvalidFileException', () => {
    it('should create an error with the correct message', () => {
      const message = 'Invalid file format'
      const error = new InvalidFileException(message)

      assert.strictEqual(error.message, message)
    })

    it('should have the correct name property', () => {
      const error = new InvalidFileException('test')
      assert.strictEqual(error.name, 'InvalidFileException')
    })

    it('should be an instance of Error', () => {
      const error = new InvalidFileException('test')
      assert.ok(error instanceof Error)
    })

    it('should be an instance of InvalidFileException', () => {
      const error = new InvalidFileException('test')
      assert.ok(error instanceof InvalidFileException)
    })

    it('should have a stack trace', () => {
      const error = new InvalidFileException('test')
      assert.ok(error.stack)
      assert.ok(error.stack!.includes('InvalidFileException'))
    })
  })
})
