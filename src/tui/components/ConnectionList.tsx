import React from 'react'
import { Box, Text, useInput } from 'ink'
import { Connection } from '../../connection-registry.js'
import Config from './Config.js'

interface ConnectionListProps {
  connections: Connection[]
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  isFocused: boolean
}

export const ConnectionList: React.FC<ConnectionListProps> = ({ connections, selectedIndex, setSelectedIndex, isFocused }) => {
  // Handle arrow key navigation when focused
  useInput((input, key) => {
    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
    if (key.downArrow && selectedIndex < connections.length - 1) {
      setSelectedIndex(selectedIndex + 1)
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
