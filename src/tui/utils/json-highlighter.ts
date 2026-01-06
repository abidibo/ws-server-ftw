import chalk from 'chalk'

/**
 * Highlights JSON syntax with colors suitable for terminal display.
 * Uses chalk to apply ANSI color codes that work with Ink's Text component.
 *
 * Color scheme:
 * - Keys: cyan
 * - String values: green
 * - Numbers: yellow
 * - Booleans: magenta
 * - null: gray
 * - Punctuation: white
 *
 * @param jsonString - The JSON string to highlight (should be formatted with JSON.stringify)
 * @returns The same string with ANSI color codes applied
 */
export function highlightJson(jsonString: string): string {
  // Regex to match JSON tokens:
  // - Quoted strings: "([^"\\]|\\.)*"
  // - Keywords: true, false, null
  // - Numbers: -?\d+\.?\d*([eE][+-]?\d+)?
  // - Punctuation: {, }, [, ], :, ,
  const tokenRegex = /"([^"\\]|\\.)*"|true|false|null|-?\d+\.?\d*([eE][+-]?\d+)?|[{}[\]:,]/g

  let lastIndex = 0
  let result = ''
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(jsonString)) !== null) {
    // Add any characters between the last match and this one (whitespace)
    result += jsonString.slice(lastIndex, match.index)

    const token = match[0]

    // Determine token type and apply appropriate color
    if (token === '{' || token === '}' || token === '[' || token === ']' ||
        token === ':' || token === ',') {
      // Punctuation
      result += chalk.white(token)
    } else if (token === 'true' || token === 'false') {
      // Booleans
      result += chalk.magenta(token)
    } else if (token === 'null') {
      // null
      result += chalk.gray(token)
    } else if (token.startsWith('"')) {
      // String - need to determine if it's a key or a value
      // Look ahead to see if the next non-whitespace character is a colon
      const afterToken = jsonString.slice(match.index + token.length)
      const nextNonWhitespace = afterToken.match(/^\s*(.)/)?.[1]

      if (nextNonWhitespace === ':') {
        // This is a key
        result += chalk.cyan(token)
      } else {
        // This is a string value
        result += chalk.green(token)
      }
    } else {
      // Must be a number
      result += chalk.yellow(token)
    }

    lastIndex = tokenRegex.lastIndex
  }

  // Add any remaining characters
  result += jsonString.slice(lastIndex)

  return result
}
