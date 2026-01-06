export interface ParsedData {
  merge?: boolean
  deepmerge?: boolean
  append?: boolean
  obj?: Record<string, unknown>
  arr?: unknown[]
  data?: unknown
}

export function stdinParse(d: Buffer | { toString(): string }): ParsedData | undefined {
  const input = d.toString().trim()
  let data: ParsedData | undefined

  try {
    if (/^merge /.test(input)) {
      data = {
        merge: true,
        obj: JSON.parse(input.replace(/^merge /, ''))
      }
    } else if (/^deepmerge /.test(input)) {
      data = {
        deepmerge: true,
        obj: JSON.parse(input.replace(/^deepmerge /, ''))
      }
    } else if (/^append /.test(input)) {
      data = {
        append: true,
        arr: JSON.parse(input.replace(/^append /, ''))
      }
    } else if (input) {
      data = {
        data: JSON.parse(input)
      }
    }
  } catch (e) {
    console.error(`${e}. Sending original data.`)
  }

  return data
}
