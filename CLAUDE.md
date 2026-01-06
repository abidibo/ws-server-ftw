# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ws-server-ftw is a development tool for mocking WebSocket APIs with an interactive Terminal User Interface (TUI). It serves data from JSON or JavaScript files through WebSocket connections with path-based routing, similar to how json-server works for REST APIs.

## Development Commands

### Running the application
```bash
npm run dev                 # Run in development mode with tsx
npm run build              # Compile TypeScript to dist/
ws-server -i <db.json>     # Run compiled version (after build)
ws-server -p 8080 -i db.json  # Custom port
```

### Testing
```bash
npm run test               # Run all tests with mocha
npm run coverage           # Generate coverage and send to coveralls
npm run coverage-html      # Generate HTML coverage report
```

The test suite uses:
- Mocha as test runner
- tsx for TypeScript execution in tests
- Tests are in `test/` directory (*.test.js files)
- NODE_ENV=test is set during test runs

### Building & Publishing
```bash
npm run build              # TypeScript compilation (required before publishing)
npm run prepublishOnly     # Runs automatically before npm publish
```

## Architecture

### Core Components

**ServerManager** (`src/server-manager.ts`)
- Central orchestrator for WebSocket server lifecycle
- Extends EventEmitter for event-driven architecture
- Manages the WebSocket server instance (ws library)
- Emits events: `connection:new`, `connection:message`, `connection:close`, `data:sent`, `server:started`, `server:stopped`, `error`
- Handles database operations (reading, updating via path navigation)
- Coordinates between ConnectionRegistry and data operations

**ConnectionRegistry** (`src/connection-registry.ts`)
- Tracks all active WebSocket connections with auto-incrementing IDs
- Stores connection metadata: path, timestamps, message counts
- Provides CRUD operations for connection management
- Connection object includes: id, WebSocket instance, path, connectedAt, messagesSent, messagesReceived, lastActivity

**Data Operations** (`src/data-operations.ts`)
- Handles loading data from database files (JSON or JS with dynamic import)
- Path-based data traversal: `/api/v1/users` → `db.api.v1.users`
- Supports four operation types:
  - `merge`: Shallow merge (Object.assign)
  - `deepmerge`: Recursive merge using deepmerge library (arrays are concatenated)
  - `append`: Concatenate arrays
  - `raw`: Replace data entirely
- JS files use cache-busting for dynamic imports

**Command Parsing** (`src/stdin.ts`)
- Parses user input from TUI command panel
- Recognizes patterns: `merge {...}`, `deepmerge {...}`, `append [...]`, `db set <path> <value>`, raw JSON
- Returns structured ParsedData with operation type and data

### TUI Architecture

Built with **Ink** (React for terminals) in `src/tui/`:

**App Component** (`tui/components/App.tsx`)
- Root component orchestrating four panels with Tab-based focus management
- Layout: Status bar (top) + three columns (Connections/Command | DB Content | Message Log)
- Handles global keyboard shortcuts (Tab for panel switching, 'q' for quit)
- Focused panels are highlighted with different border colors
- Coordinates data flow between panels and ServerManager

**useServerState Hook** (`tui/hooks/use-server-state.ts`)
- Custom hook managing all server state (connections, messages, port, DB content)
- Subscribes to ServerManager events and updates React state
- Maintains message log (last 100 messages with timestamps)
- Auto-adjusts selected connection index when connections close

**Panel Components**:
- **ConnectionList**: Displays active connections with arrow key navigation
- **CommandInput**: Text input for sending commands to selected connection
- **DbEditor**: JSON syntax-highlighted view of database with scrolling
- **MessageLog**: Real-time message display (sent/received) with color indicators
- **StatusBar**: Server status, port, connection count, focused panel

**JSON Highlighting** (`tui/utils/json-highlighter.ts`)
- Colorizes JSON in terminal: keys (cyan), strings (green), numbers (yellow), booleans (magenta), null (gray)

### Module System

- **Type**: ES Modules (ESM) - `"type": "module"` in package.json
- **Import extensions**: All imports use `.js` extension even for `.ts` files (TypeScript ESM requirement)
- **Module resolution**: NodeNext (supports both ESM and CommonJS interop)
- **Target**: ES2020

### Entry Points

- **CLI**: `src/cli.ts` - Argument parsing, creates ServerManager, renders TUI
- **Binary**: `bin/ws-server` - Shell script wrapper
- **Library**: `src/index.ts` - Exports core classes and types for programmatic use

## Important Implementation Details

### Path-Based Routing
- WebSocket path `/foo/bar` serves `db['foo']['bar']` from database
- Path navigation happens in `loadDataFromDb()` by splitting on `/` and traversing object
- Empty path segments are ignored

### Database Updates
- `db set` commands use dot notation: `api.v1.ui.modalIsOpen`
- Updates persist to the database file (writes JSON with 2-space indentation)
- Path can include array notation: `users[0].name` gets converted to dot notation

### Event Flow
1. Client connects → ServerManager emits `connection:new` → TUI updates connections list
2. Initial data sent automatically on connection
3. User enters command → CommandInput parses → ServerManager.sendData() → Operation applied → Data sent
4. Messages logged via events → useServerState updates messages array → MessageLog re-renders

### TypeScript Configuration
- Strict mode enabled
- Declaration files generated (for npm package)
- Source maps enabled
- JSX configured for React (Ink components)

## Testing Notes

- Tests use `.test.js` extension (not `.test.ts`)
- Test files import from source TypeScript files using tsx loader
- nyc (Istanbul) configured for per-file coverage checking
- Coverage reports can be HTML or sent to Coveralls

## Development Workflow

When adding features:
1. Core logic goes in `src/` root (if server-related) or `src/tui/` (if UI-related)
2. Update types in relevant files (ServerManagerEvents, DataOperation, etc.)
3. For new operations, extend `data-operations.ts` and `stdin.ts` parser
4. For new TUI features, create/modify components in `tui/components/`
5. Build before testing the compiled version: `npm run build`
6. For rapid iteration, use `npm run dev` which uses tsx

When modifying events:
- Update ServerManagerEvents interface in `server-manager.ts`
- Add event emission in ServerManager methods
- Subscribe to events in `useServerState` hook
- Handle in TUI components
