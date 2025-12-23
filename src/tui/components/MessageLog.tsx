import React from 'react'
import { Box, Text } from 'ink'
import { LogMessage } from '../hooks/use-server-state.js'

interface MessageLogProps {
  messages: LogMessage[]
  maxHeight?: number
}

export const MessageLog: React.FC<MessageLogProps> = ({ messages, maxHeight = 10 }) => {
  // Calculate how many messages can fit (accounting for header)
  const contentHeight = maxHeight ? maxHeight - 2 : 10
  const visibleMessages = messages.slice(-contentHeight)

  const getMessageColor = (type: LogMessage['type']): string => {
    switch (type) {
      case 'success':
        return 'green'
      case 'error':
        return 'red'
      case 'info':
        return 'cyan'
      default:
        return 'white'
    }
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="magenta" height={maxHeight}>
      <Box>
        <Text bold color="magenta"> Message Log ({messages.length}) </Text>
      </Box>
      <Box flexDirection="column" paddingLeft={1} flexGrow={1} overflowY="hidden">
        {visibleMessages.length === 0 ? (
          <Text color="gray">No messages yet</Text>
        ) : (
          visibleMessages.map((msg, idx) => (
            <Box key={idx}>
              <Text color="gray">[{msg.timestamp.toLocaleTimeString()}]</Text>
              <Text color={getMessageColor(msg.type)}> {msg.text}</Text>
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
}
