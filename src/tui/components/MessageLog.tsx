import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { LogMessage } from '../hooks/use-server-state.js'

interface MessageLogProps {
  messages: LogMessage[]
  maxHeight?: number
  isFocused: boolean
}

export const MessageLog: React.FC<MessageLogProps> = ({ messages, maxHeight = 10, isFocused }) => {
  const [scrollOffset, setScrollOffset] = useState(0)
  const contentHeight = maxHeight > 2 ? maxHeight - 2 : 0

  useInput((input, key) => {
    if (key.upArrow) {
      setScrollOffset(prev => Math.max(0, prev - 1))
    }
    if (key.downArrow) {
      setScrollOffset(prev => Math.min(Math.max(0, messages.length - contentHeight), prev + 1))
    }
  }, { isActive: isFocused })

  // Auto-scroll to bottom on new message if not manually scrolled
  useEffect(() => {
    if (messages.length > contentHeight) {
      const maxScroll = messages.length - contentHeight
      // Only auto-scroll if we are already at the bottom
      if (scrollOffset === maxScroll - 1 || scrollOffset === maxScroll) {
        setScrollOffset(maxScroll)
      }
    }
  }, [messages, contentHeight])


  const visibleMessages = messages.slice(scrollOffset, scrollOffset + contentHeight)

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
    <Box flexDirection="column" borderStyle="round" borderColor={isFocused ? 'green' : 'magenta'} height={maxHeight}>
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
