import { isObject } from './utils.js'

export interface AutoResponseRule {
  /** Unique name for the rule (for logging) */
  name?: string
  /** Match type: "exact", "contains", "regex", or "jsonpath" */
  match: 'exact' | 'contains' | 'regex' | 'jsonpath'
  /** The pattern to match against incoming messages */
  pattern: string
  /** Optional: only apply this rule to connections on this path */
  path?: string
  /** The response to send back when the rule matches */
  response: unknown
  /** Optional delay in ms before sending the response */
  delay?: number
}

export interface AutoResponseResult {
  rule: AutoResponseRule
  response: unknown
}

/**
 * Check if a message matches a single rule
 */
export function matchRule(message: string, rule: AutoResponseRule, connectionPath?: string): boolean {
  // Check path filter first
  if (rule.path && connectionPath) {
    const rulePath = rule.path.replace(/\/$/, '')
    const connPath = connectionPath.replace(/\/$/, '')
    if (rulePath !== connPath) {
      return false
    }
  }

  switch (rule.match) {
    case 'exact':
      return message === rule.pattern

    case 'contains':
      return message.includes(rule.pattern)

    case 'regex': {
      try {
        const regex = new RegExp(rule.pattern)
        return regex.test(message)
      } catch {
        return false
      }
    }

    case 'jsonpath': {
      try {
        const parsed = JSON.parse(message)
        if (!isObject(parsed)) return false
        return matchJsonPath(parsed, rule.pattern)
      } catch {
        return false
      }
    }

    default:
      return false
  }
}

/**
 * Simple JSONPath-like matcher
 * Supports patterns like:
 *   "type=subscribe" — top-level key equals value
 *   "action=ping&channel=*" — multiple conditions with wildcard
 *   "user.role=admin" — nested dot-notation path
 */
export function matchJsonPath(obj: Record<string, unknown>, pattern: string): boolean {
  const conditions = pattern.split('&')

  return conditions.every(condition => {
    const [path, expected] = condition.split('=')
    if (!path || expected === undefined) return false

    const actual = getNestedValue(obj, path.trim())
    if (actual === undefined) return false

    const expectedTrimmed = expected.trim()

    // Wildcard matches any existing value
    if (expectedTrimmed === '*') return true

    // Compare as strings
    return String(actual) === expectedTrimmed
  })
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (!isObject(current)) return undefined
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

/**
 * Process a response template, replacing variables
 * Supported variables:
 *   {{message}} — the raw incoming message
 *   {{timestamp}} — ISO timestamp
 *   {{connectionId}} — the connection ID
 */
export function processResponseTemplate(
  response: unknown,
  context: { message: string; connectionId: number }
): unknown {
  if (typeof response === 'string') {
    return replaceTemplateVars(response, context)
  }

  if (Array.isArray(response)) {
    return response.map(item => processResponseTemplate(item, context))
  }

  if (isObject(response)) {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(response)) {
      result[key] = processResponseTemplate(value, context)
    }
    return result
  }

  return response
}

function replaceTemplateVars(
  str: string,
  context: { message: string; connectionId: number }
): string {
  return str
    .replace(/\{\{message\}\}/g, context.message)
    .replace(/\{\{timestamp\}\}/g, new Date().toISOString())
    .replace(/\{\{connectionId\}\}/g, String(context.connectionId))
}

/**
 * Find the first matching rule for a message
 */
export function findMatchingRule(
  message: string,
  rules: AutoResponseRule[],
  connectionPath?: string
): AutoResponseResult | null {
  for (const rule of rules) {
    if (matchRule(message, rule, connectionPath)) {
      return { rule, response: rule.response }
    }
  }
  return null
}
