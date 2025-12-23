import React from 'react'
import { Box, Text } from 'ink'

interface StatusBarProps {
  port: number | null
  connectionCount: number
  selectedConnection: number | undefined
}

export const StatusBar: React.FC<StatusBarProps> = ({ port, connectionCount, selectedConnection }) => {
  return (
    <Box borderStyle="round" borderColor="green">
      <Box paddingLeft={1} paddingRight={2}>
        <Text color="green">⚡ Server: </Text>
        <Text>localhost:{port}</Text>
      </Box>
      <Box paddingLeft={1} paddingRight={2}>
        <Text color="cyan">🔗 Connections: </Text>
        <Text>{connectionCount}</Text>
      </Box>
      {selectedConnection !== undefined && (
        <Box paddingLeft={1} paddingRight={2}>
          <Text color="yellow">🎯 Selected: </Text>
          <Text>{selectedConnection}</Text>
        </Box>
      )}
      <Box paddingLeft={1} paddingRight={1}>
        <Text color="gray">Press q to quit | ↑↓ to navigate</Text>
      </Box>
    </Box>
  )
}
