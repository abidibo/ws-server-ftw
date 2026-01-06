import React from 'react'
import { Box, Text, useInput } from 'ink'
import { Connection } from '../../connection-registry.js'
import Config from './Config.js'

interface ConnectionListProps {
  connections: Connection[]
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  isFocused: boolean
  onCloseConnection: (connId: number) => void
}

export const ConnectionList: React.FC<ConnectionListProps> = ({ connections, selectedIndex, setSelectedIndex, isFocused, onCloseConnection }) => {
  // Handle arrow key navigation and close command when focused
  useInput((input, key) => {
    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
    if (key.downArrow && selectedIndex < connections.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
    // Close selected connection with 'x' or 'c' key
    if ((input === 'x' || input === 'c') && connections.length > 0) {
      const selectedConn = connections[selectedIndex]
      if (selectedConn) {
        onCloseConnection(selectedConn.id)
      }
    }
  }, { isActive: isFocused })
  if (connections.length === 0) {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor={isFocused ? Config.ui.focusedPanelBorderColor : Config.ui.panelBorderColor} flexGrow={1}>
        <Text color="gray">No active connections</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={isFocused ? Config.ui.focusedPanelBorderColor : Config.ui.panelBorderColor} flexGrow={1}>
      <Box>
        <Text bold color="cyan"> Connections ({connections.length}) </Text>
        {isFocused && <Text color="gray" dimColor> [x/c: close] </Text>}
      </Box>
      <Box flexDirection="column" flexGrow={1} overflowY="hidden">
        {connections.map((conn, idx) => (
          <Box key={conn.id} paddingLeft={1}>
            <Text color={idx === selectedIndex ? 'green' : 'white'}>
              {idx === selectedIndex ? '▶ ' : '  '}
              ID: {conn.id} | Path: {conn.path} | Sent: {conn.messagesSent} | Received: {conn.messagesReceived}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
