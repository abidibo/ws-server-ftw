import deepmerge from 'deepmerge'
import { isArray, isObject } from './utils.js'
import { readFile } from 'fs/promises'

export type OperationType = 'merge' | 'deepmerge' | 'append' | 'raw'

export interface DataOperation {
  type: OperationType
  data: unknown
}

/**
 * Load data from DB file with path traversal
 * @param dbPath - Absolute path to DB file
 * @param requestPath - URL path like '/api/v1/users'
 * @returns Data from DB at the specified path
 */
export async function loadDataFromDb(dbPath: string, requestPath: string): Promise<unknown> {
  let res: any

  // Check if it's a JSON file
  if (dbPath.endsWith('.json')) {
    // For JSON files, read and parse directly
    const content = await readFile(dbPath, 'utf-8')
    res = JSON.parse(content)
  } else {
    // For JS files, use dynamic import with cache busting
    const cacheBuster = `?t=${Date.now()}`
    const module = await import(dbPath + cacheBuster)
    res = module.default || module
  }

  // Navigate nested path: /api/v1/ → res.api.v1
  requestPath.split('/').forEach(p => {
    if (p && res) {
      res = res[p]
    }
  })

  return res
}

/**
 * Apply operation to base data
 * @param baseData - Original data loaded from DB
 * @param operation - Operation to apply (merge, deepmerge, append, raw)
 * @returns Transformed data
 */
export async function applyOperation(baseData: unknown, operation: DataOperation | null): Promise<unknown> {
  if (!operation) {
    return baseData
  }

  if (operation.type === 'raw') {
    return operation.data
  }

  if (operation.type === 'merge' && isObject(baseData) && isObject(operation.data)) {
    return Object.assign({}, baseData, operation.data)
  }

  if (operation.type === 'deepmerge' && isObject(baseData) && isObject(operation.data)) {
    return deepmerge(baseData as any, operation.data as any)
  }

  if (operation.type === 'append' && isArray(baseData) && isArray(operation.data)) {
    return (baseData as any[]).concat(operation.data as any[])
  }

  return baseData
}
