import React from 'react'
import { Box, Text } from 'ink'
import { Connection } from '../../connection-registry.js'

interface ConnectionListProps {
  connections: Connection[]
  selectedIndex: number
  isFocused: boolean
}

export const ConnectionList: React.FC<ConnectionListProps> = ({ connections, selectedIndex, isFocused }) => {
  if (connections.length === 0) {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor={isFocused ? 'green' : 'gray'} flexGrow={1}>
        <Text color="gray">No active connections</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={isFocused ? 'green' : 'cyan'} flexGrow={1}>
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
