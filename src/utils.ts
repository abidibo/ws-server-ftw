export function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val)
}

export function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}
