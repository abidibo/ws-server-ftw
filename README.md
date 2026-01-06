# @abidibo/ws-server-ftw

[![Build Status](https://app.travis-ci.com/abidibo/ws-server.svg?token=fp5hqwJQgwHKLpsjsZ3L&branch=master)](https://travis-ci.org/abidibo/ws-server)
[![Coverage Status](https://coveralls.io/repos/github/abidibo/ws-server-ftw/badge.svg?branch=master)](https://coveralls.io/github/abidibo/ws-server-ftw?branch=master)

> Mock websocket endpoints with a beautiful Terminal User Interface (TUI)

![screenshot](./screenshot-v0.2.0.png)

@abidibo/ws-server-ftw is a powerful development tool that lets you easily mock WebSocket APIs with a rich, interactive terminal interface. Inspired by [json-server](https://github.com/typicode/json-server), it provides real-time WebSocket mocking with visual feedback and control.

## Features

- **Interactive TUI**: Beautiful terminal interface built with Ink (React for terminals)
- **Real-time Connection Monitoring**: Track active WebSocket connections as they connect and disconnect
- **Live Message Logging**: See all incoming and outgoing messages in real-time with color-coded syntax highlighting
- **JSON Database Editor**: View and edit your mock database with syntax-highlighted JSON
- **Multiple Command Operations**: Send, merge, deep-merge, or append data to connected clients
- **Path-based Routing**: Serve different data based on WebSocket connection paths

# Install

[![NPM](https://nodei.co/npm/@abidibo/ws-server-ftw.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/@abidibo/ws-server-ftw/)

    npm install @abidibo/ws-server-ftw --save-dev

# Getting Started

## Quick Start

Start the TUI application with your mock database file:

```bash
ws-server -i mydb.json
```

The interactive terminal interface will launch, showing real-time connection status, database content, and message logs.

## Command Line Options

```bash
$ ws-server -h

usage: ws-server [-h] [-v] [-p PORT] -i DB

ws-server cli

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -p PORT, --port PORT  WebSocket server port (default: 9704)
  -i DB, --input DB     JSON or js input file which exports an object
```

## TUI Interface Overview

The terminal interface consists of five main panels:

### 1. Status Bar (Top)

Displays server status, port number, and database file path.

### 2. Connections List (Left Panel Top)

- Shows all active WebSocket connections
- Displays connection ID and path for each client
- Navigate connections using **↑/↓ arrow keys** when panel is focused
- Selected connection is highlighted
- Shows "No connections" when no clients are connected

### 3. Command Input (Left Panel Bottom)

Interactive command prompt for sending data to the selected connection. Available commands:

- **`db set <path> <value>`** - Set a value in the database at a specific path
  - Example: `db set api.v1.ui.modalIsOpen true`
  - Example: `db set api.v1.users [{"id": 1, "name": "John"}]`

- **`merge {...}`** - Shallow merge new data with current data
  - Example: `merge {"ui": {"foo": "bar"}}`
  - Replaces entire top-level keys

- **`deepmerge {...}`** - Deep merge new data with current data
  - Example: `deepmerge {"ui": {"modalIsOpen": false}}`
  - Merges nested properties recursively
  - Arrays are concatenated

- **`append [...]`** - Append items to an array
  - Example: `append [{"username": "newuser"}]`
  - Only works if the endpoint data is an array

- **`{...}`** - Send raw JSON data
  - Example: `{"status": "updated"}`
  - Replaces all data for the endpoint

- **`Enter`** (empty input) - Resend the original data

### 4. DB Content (Middle Panel)

- Shows the current database content with **JSON syntax highlighting**
- Colors: keys (cyan), strings (green), numbers (yellow), booleans (magenta), null (gray)
- Scroll through large JSON files using **↑/↓ arrow keys** when panel is focused
- Updates in real-time when database is modified via `db set` commands

### 5. Message Log (Right Panel)

- Displays all WebSocket messages in real-time
- **Outgoing messages** (sent to clients): green "→" indicator
- **Incoming messages** (received from clients): red "←" indicator
- Shows message type, connection ID, and JSON content
- Auto-scrolls to show latest messages
- Scroll through history using **↑/↓ arrow keys** when panel is focused
- Shows "No messages yet" when log is empty

## Navigation & Controls

- **Tab** - Cycle focus through panels (Connections → Command → DB Content → Message Log)
- **↑/↓ Arrow Keys** - Navigate within focused panel
  - In Connections List: Select different connections
  - In DB Content: Scroll through JSON
  - In Message Log: Scroll through message history
- **q** or **Ctrl+C** - Quit the application
- **Enter** - Submit command (when Command Input is focused)

The currently focused panel is highlighted with a bright red border, while unfocused panels have gray borders.

## How It Works

@abidibo/ws-server-ftw serves data from a JSON or JavaScript file through WebSocket connections. The server uses path-based routing:

- Path `/foo/bar` serves `db['foo']['bar']` from your database file
- Path `/api/v1/users` serves `db['api']['v1']['users']`

When a client connects:

1. The server automatically sends the data for the requested path
2. The connection appears in the Connections List panel
3. You can send additional data using commands in the Command Input panel
4. All messages are logged in the Message Log panel

A JavaScript file can be used instead of JSON to export dynamic data or perform operations.

# Example Workflow

## 1. Create Your Database File

Create `db.json`:

```json
{
  "api": {
    "v1": {
      "ui": {
        "modalIsOpen": true,
        "sidebarStyle": "dark"
      },
      "users": [
        {
          "username": "admin",
          "email": "admin@example.com",
          "id": 1,
          "role": "admin"
        },
        {
          "username": "guest",
          "email": "guest@example.com",
          "id": 2,
          "role": "guest"
        }
      ]
    }
  }
}
```

## 2. Start the Server

```bash
ws-server -i db.json
```

The TUI launches showing your database with syntax highlighting in the DB Content panel.

## 3. Connect a Client

Connect a WebSocket client to `ws://localhost:9704/api/v1/`. The client automatically receives:

```json
{
  "ui": {
    "modalIsOpen": true,
    "sidebarStyle": "dark"
  },
  "users": [
    {
      "username": "admin",
      "email": "admin@example.com",
      "id": 1,
      "role": "admin"
    },
    {
      "username": "guest",
      "email": "guest@example.com",
      "id": 2,
      "role": "guest"
    }
  ]
}
```

The connection appears in the **Connections List** panel, and the message is logged in the **Message Log**.

## 4. Send Commands

### Resend Original Data

1. Use **Tab** to focus the Command Input panel
2. Select the connection (if not already selected)
3. Press **Enter** (empty input)
4. The original data is sent again

### Merge Data (Shallow)

Enter in the Command Input:

```
merge {"ui": {"foo": "bar"}}
```

Client receives (note: entire `ui` object is replaced):

```json
{
  "ui": {
    "foo": "bar"
  },
  "users": [...]
}
```

### Deep Merge Data

Enter in the Command Input:

```
deepmerge {"ui": {"foo": "bar"}}
```

Client receives (note: properties are merged, not replaced):

```json
{
  "ui": {
    "modalIsOpen": true,
    "sidebarStyle": "dark",
    "foo": "bar"
  },
  "users": [...]
}
```

### Append to Array

Enter in the Command Input:

```
deepmerge {"users": [{"username": "foo", "id": 3}]}
```

Client receives:

```json
{
  "ui": {...},
  "users": [
    {"username": "admin", "email": "admin@example.com", "id": 1, "role": "admin"},
    {"username": "guest", "email": "guest@example.com", "id": 2, "role": "guest"},
    {"username": "foo", "id": 3}
  ]
}
```

### Update Database

Enter in the Command Input:

```
db set api.v1.ui.modalIsOpen false
```

The database file is updated, and you'll see the change reflected in the **DB Content** panel with syntax highlighting.

## Use Cases

- **Frontend Development**: Mock WebSocket APIs while building real-time features (chat, notifications, live updates)
- **Testing**: Create predictable WebSocket responses for integration and E2E tests
- **Prototyping**: Quickly demo WebSocket functionality without backend implementation
- **Development**: Work on UI features independently of backend WebSocket services

## Contributing

Contributions are welcome! This project was developed to simplify WebSocket mocking during React application development with real-time communication needs.

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run in development mode: `npm run dev`
4. Build: `npm run build`
5. Run tests: `npm run test`

### Tech Stack

- **TypeScript** - Type-safe development
- **Ink** - React-based TUI framework
- **ws** - WebSocket library
- **Node.js ESM** - Modern module system

Pull requests are appreciated! Please ensure your code:

- Passes TypeScript compilation (`npm run build`)
- Follows the existing code style
- Includes tests for new features
- Updates documentation as needed

## License

MIT

## Author

**abidibo** - [abidibo@gmail.com](mailto:abidibo@gmail.com) - [https://www.abidibo.net](https://www.abidibo.net)

## Links

- [GitHub Repository](https://github.com/abidibo/ws-server)
- [Issues](https://github.com/abidibo/ws-server/issues)
- [NPM Package](https://www.npmjs.com/package/@abidibo/ws-server-ftw)
