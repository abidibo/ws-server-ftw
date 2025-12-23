import React, { useEffect, useState } from 'react'
import { Box, useInput, useApp, useStdout, useStdin } from 'ink'
import { ServerManager } from '../../server-manager.js'
import { useServerState } from '../hooks/use-server-state.js'
import { ConnectionList } from './ConnectionList.js'
import { CommandInput } from './CommandInput.js'
import { StatusBar } from './StatusBar.js'
import { MessageLog } from './MessageLog.js'
import { DbEditor } from './DbEditor.js'
import { DataOperation } from '../../data-operations.js'

interface AppProps {
  serverManager: ServerManager
  onReady?: () => void
}

type FocusedPanel = 'connections' | 'command' | 'db' | 'log'

export const App: React.FC<AppProps> = ({ serverManager, onReady }) => {
  const { exit } = useApp()
  const { stdout } = useStdout()
  const { stdin } = useStdin()
  const { connections, selectedIndex, setSelectedIndex, messages, port, dbContent, setDbContent } = useServerState(serverManager)
  const [focusedPanel, setFocusedPanel] = useState<FocusedPanel>('connections')

  const selectedConnection = connections[selectedIndex]

  useEffect(() => {
    onReady?.()
  }, [])

  // Global quit handler
  useEffect(() => {
    const handler = (data: string) => {
      if (data === 'q') {
        serverManager.stop()
        exit()
      }
    }
    stdin?.on('data', handler)
    return () => {
      stdin?.off('data', handler)
    }
  }, [stdin, exit, serverManager])

  // Get terminal dimensions
  const terminalHeight = stdout?.rows ?? 24

  // Calculate heights for different sections
  const statusBarHeight = 3 // Border + content
  const availableHeight = terminalHeight - statusBarHeight
  const rightPanelHeight = availableHeight - 2 // -2 for borders

  // Keyboard navigation
  useInput((input: string, key: any) => {
    if (key.tab) {
      const panels: FocusedPanel[] = ['connections', 'command', 'db', 'log']
      const currentIndex = panels.indexOf(focusedPanel)
      const nextIndex = (currentIndex + 1) % panels.length
      setFocusedPanel(panels[nextIndex])
    }

    if (focusedPanel === 'connections') {
      if (key.upArrow && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1)
      }

      if (key.downArrow && selectedIndex < connections.length - 1) {
        setSelectedIndex(selectedIndex + 1)
      }
    }
  })

  const handleCommand = (connId: number, operation: DataOperation | null) => {
    serverManager.sendData(connId, operation)
  }

  const handleDbCommand = (path: string, value: any) => {
    serverManager.updateDbValue(path, value)
    setDbContent(serverManager.getDbContent())
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <StatusBar
        port={port}
        connectionCount={connections.length}
        selectedConnection={selectedConnection?.id}
        focusedPanel={focusedPanel}
      />

      <Box flexDirection="row" flexGrow={1}>
        <Box flexDirection="column" width="30%">
          <ConnectionList
            connections={connections}
            selectedIndex={selectedIndex}
            isFocused={focusedPanel === 'connections'}
          />
          <CommandInput
            onCommand={handleCommand}
            onDbCommand={handleDbCommand}
            selectedConnection={selectedConnection?.id}
            isFocused={focusedPanel === 'command'}
          />
        </Box>

        <Box flexDirection="column" width="45%">
          <DbEditor dbContent={dbContent} maxHeight={rightPanelHeight} isFocused={focusedPanel === 'db'} />
        </Box>

        <Box flexDirection="column" width="25%">
          <MessageLog messages={messages} maxHeight={rightPanelHeight} isFocused={focusedPanel === 'log'} />
        </Box>
      </Box>
    </Box>
  )
}
