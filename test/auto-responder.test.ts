import { describe, it } from 'mocha'
import assert from 'assert'
import {
  matchRule,
  matchJsonPath,
  findMatchingRule,
  processResponseTemplate,
  AutoResponseRule
} from '../src/auto-responder.js'

describe('auto-responder', () => {
  describe('matchRule', () => {
    describe('exact match', () => {
      const rule: AutoResponseRule = { match: 'exact', pattern: 'ping', response: 'pong' }

      it('should match exact string', () => {
        assert.strictEqual(matchRule('ping', rule), true)
      })

      it('should not match partial string', () => {
        assert.strictEqual(matchRule('ping!', rule), false)
      })

      it('should not match different string', () => {
        assert.strictEqual(matchRule('pong', rule), false)
      })
    })

    describe('contains match', () => {
      const rule: AutoResponseRule = { match: 'contains', pattern: 'hello', response: 'hi' }

      it('should match when message contains pattern', () => {
        assert.strictEqual(matchRule('say hello world', rule), true)
      })

      it('should match exact pattern', () => {
        assert.strictEqual(matchRule('hello', rule), true)
      })

      it('should not match when pattern is absent', () => {
        assert.strictEqual(matchRule('goodbye', rule), false)
      })
    })

    describe('regex match', () => {
      const rule: AutoResponseRule = { match: 'regex', pattern: '^error\\b', response: {} }

      it('should match regex pattern', () => {
        assert.strictEqual(matchRule('error something happened', rule), true)
      })

      it('should not match when regex does not match', () => {
        assert.strictEqual(matchRule('no error here', rule), false)
      })

      it('should handle invalid regex gracefully', () => {
        const badRule: AutoResponseRule = { match: 'regex', pattern: '[invalid', response: {} }
        assert.strictEqual(matchRule('test', badRule), false)
      })
    })

    describe('jsonpath match', () => {
      const rule: AutoResponseRule = {
        match: 'jsonpath',
        pattern: 'type=subscribe',
        response: {}
      }

      it('should match JSON message with matching field', () => {
        assert.strictEqual(matchRule('{"type":"subscribe"}', rule), true)
      })

      it('should not match JSON with different value', () => {
        assert.strictEqual(matchRule('{"type":"unsubscribe"}', rule), false)
      })

      it('should not match non-JSON message', () => {
        assert.strictEqual(matchRule('not json', rule), false)
      })

      it('should not match non-object JSON', () => {
        assert.strictEqual(matchRule('"just a string"', rule), false)
      })
    })

    describe('path filtering', () => {
      const rule: AutoResponseRule = {
        match: 'exact',
        pattern: 'test',
        path: '/chat',
        response: 'ok'
      }

      it('should match when path matches', () => {
        assert.strictEqual(matchRule('test', rule, '/chat'), true)
      })

      it('should not match when path differs', () => {
        assert.strictEqual(matchRule('test', rule, '/other'), false)
      })

      it('should handle trailing slashes', () => {
        assert.strictEqual(matchRule('test', rule, '/chat/'), true)
      })
    })

    describe('unknown match type', () => {
      it('should return false for unknown match type', () => {
        const rule = { match: 'unknown' as any, pattern: 'test', response: {} }
        assert.strictEqual(matchRule('test', rule), false)
      })
    })
  })

  describe('matchJsonPath', () => {
    it('should match single condition', () => {
      assert.strictEqual(matchJsonPath({ type: 'subscribe' }, 'type=subscribe'), true)
    })

    it('should match multiple conditions', () => {
      const obj = { type: 'subscribe', channel: 'news' }
      assert.strictEqual(matchJsonPath(obj, 'type=subscribe&channel=news'), true)
    })

    it('should fail when one condition does not match', () => {
      const obj = { type: 'subscribe', channel: 'news' }
      assert.strictEqual(matchJsonPath(obj, 'type=subscribe&channel=sports'), false)
    })

    it('should support wildcard values', () => {
      const obj = { type: 'subscribe', channel: 'anything' }
      assert.strictEqual(matchJsonPath(obj, 'type=subscribe&channel=*'), true)
    })

    it('should support nested dot notation', () => {
      const obj = { user: { role: 'admin' } }
      assert.strictEqual(matchJsonPath(obj, 'user.role=admin'), true)
    })

    it('should return false for missing path', () => {
      assert.strictEqual(matchJsonPath({ a: 1 }, 'b=1'), false)
    })

    it('should return false for invalid condition format', () => {
      assert.strictEqual(matchJsonPath({ a: 1 }, 'invalid'), false)
    })

    it('should compare numbers as strings', () => {
      assert.strictEqual(matchJsonPath({ count: 42 }, 'count=42'), true)
    })
  })

  describe('processResponseTemplate', () => {
    const context = { message: 'hello', connectionId: 5 }

    it('should replace {{message}} in strings', () => {
      const result = processResponseTemplate('got: {{message}}', context)
      assert.strictEqual(result, 'got: hello')
    })

    it('should replace {{connectionId}} in strings', () => {
      const result = processResponseTemplate('conn: {{connectionId}}', context)
      assert.strictEqual(result, 'conn: 5')
    })

    it('should replace {{timestamp}} with ISO string', () => {
      const result = processResponseTemplate('time: {{timestamp}}', context) as string
      // Should contain a valid ISO date
      assert.ok(result.startsWith('time: '))
      assert.ok(!isNaN(Date.parse(result.replace('time: ', ''))))
    })

    it('should process nested objects', () => {
      const response = { msg: '{{message}}', meta: { conn: '{{connectionId}}' } }
      const result = processResponseTemplate(response, context) as any
      assert.strictEqual(result.msg, 'hello')
      assert.strictEqual(result.meta.conn, '5')
    })

    it('should process arrays', () => {
      const response = ['{{message}}', '{{connectionId}}']
      const result = processResponseTemplate(response, context) as any
      assert.deepStrictEqual(result, ['hello', '5'])
    })

    it('should return non-string primitives unchanged', () => {
      assert.strictEqual(processResponseTemplate(42, context), 42)
      assert.strictEqual(processResponseTemplate(true, context), true)
      assert.strictEqual(processResponseTemplate(null, context), null)
    })
  })

  describe('findMatchingRule', () => {
    const rules: AutoResponseRule[] = [
      { name: 'ping', match: 'exact', pattern: 'ping', response: 'pong' },
      { name: 'greeting', match: 'contains', pattern: 'hello', response: 'hi' },
      { name: 'subscribe', match: 'jsonpath', pattern: 'type=subscribe', response: { ok: true } }
    ]

    it('should find the first matching rule', () => {
      const result = findMatchingRule('ping', rules)
      assert.notStrictEqual(result, null)
      assert.strictEqual(result!.rule.name, 'ping')
    })

    it('should return null when no rule matches', () => {
      const result = findMatchingRule('unknown', rules)
      assert.strictEqual(result, null)
    })

    it('should match in order (first wins)', () => {
      // "hello ping" contains "hello" — greeting rule should match first
      const result = findMatchingRule('hello ping', rules)
      assert.notStrictEqual(result, null)
      assert.strictEqual(result!.rule.name, 'greeting')
    })

    it('should pass connection path to rules', () => {
      const pathRules: AutoResponseRule[] = [
        { name: 'chat-only', match: 'exact', pattern: 'test', path: '/chat', response: 'chat' },
        { name: 'fallback', match: 'exact', pattern: 'test', response: 'fallback' }
      ]
      const result = findMatchingRule('test', pathRules, '/other')
      assert.notStrictEqual(result, null)
      assert.strictEqual(result!.rule.name, 'fallback')
    })
  })
})
