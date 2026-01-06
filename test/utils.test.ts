import { describe, it } from 'mocha'
import assert from 'assert'
import { isArray, isObject } from '../src/utils.js'

describe('utils', () => {
  describe('isArray', () => {
    it('should return true for arrays', () => {
      assert.strictEqual(isArray([]), true)
      assert.strictEqual(isArray([1, 2, 3]), true)
      assert.strictEqual(isArray(['a', 'b', 'c']), true)
      assert.strictEqual(isArray(new Array()), true)
    })

    it('should return false for non-arrays', () => {
      assert.strictEqual(isArray({}), false)
      assert.strictEqual(isArray(null), false)
      assert.strictEqual(isArray(undefined), false)
      assert.strictEqual(isArray('string'), false)
      assert.strictEqual(isArray(123), false)
      assert.strictEqual(isArray(true), false)
    })
  })

  describe('isObject', () => {
    it('should return true for plain objects', () => {
      assert.strictEqual(isObject({}), true)
      assert.strictEqual(isObject({ key: 'value' }), true)
      assert.strictEqual(isObject(new Object()), true)
    })

    it('should return false for arrays', () => {
      assert.strictEqual(isObject([]), false)
      assert.strictEqual(isObject([1, 2, 3]), false)
    })

    it('should return false for null', () => {
      assert.strictEqual(isObject(null), false)
    })

    it('should return false for primitives', () => {
      assert.strictEqual(isObject(undefined), false)
      assert.strictEqual(isObject('string'), false)
      assert.strictEqual(isObject(123), false)
      assert.strictEqual(isObject(true), false)
    })
  })
})
