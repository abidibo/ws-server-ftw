import * as path from 'path'
import * as fs from 'fs'
import { ArgumentParser } from 'argparse'
import * as React from 'react'
import { render } from 'ink'
import { ServerManager } from './server-manager.js'
import { App } from './tui/components/App.js'
import { InvalidFileException } from './exceptions.js'

// File validation function
function fileType(filePath: string): string {
  const cwd = process.cwd()
  const absPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath)

  if (fs.existsSync(absPath)) {
    return absPath
  } else {
    throw new InvalidFileException('Invalid file path')
  }
}

// Setup argument parser
const parser = new ArgumentParser({
  add_help: true,
  description: 'ws-server TUI - Mock WebSocket endpoints with a beautiful Terminal UI'
})

parser.add_argument('-p', '--port', {
  help: 'WebSocket server port',
  default: 9704,
  type: 'int',
  dest: 'port'
})

parser.add_argument('-i', '--input', {
  help: 'JSON or JS input file which exports (ES5) an object',
  required: true,
  dest: 'db',
  type: fileType
})

const args = parser.parse_args()

// Create and start server
const serverManager = new ServerManager(args.db, args.port)
serverManager.start()

// Render TUI
render(React.createElement(App, { serverManager }))
