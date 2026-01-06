import React, { useState, useEffect, useRef } from 'react'
import { Box, Text, useInput } from 'ink'
import { LogMessage } from '../hooks/use-server-state.js'
import Config from './Config.js'

interface MessageLogProps {
  messages: LogMessage[]
  maxHeight: number
  isFocused: boolean
}

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

export const MessageLog: React.FC<MessageLogProps> = ({ messages, maxHeight, isFocused }) => {
  const [scrollOffset, setScrollOffset] = useState(0)

  // Reverse messages so newest are at the top
  const reversedMessages = [...messages].reverse()
  const messageCount = reversedMessages.length

  // Use refs to avoid stale closures in useInput callback
  const messageCountRef = useRef(messageCount)
  messageCountRef.current = messageCount

  useInput((input, key) => {
    if (key.upArrow) {
      // Move up = decrease offset = show newer messages
      setScrollOffset(prev => Math.max(0, prev - 1))
    }
    if (key.downArrow) {
      // Move down = increase offset = show older messages
      // We scroll by message, not by line
      setScrollOffset(prev => Math.min(messageCountRef.current - 1, prev + 1))
    }
  }, { isActive: isFocused })

  // Reset scroll to top (newest messages) when new messages arrive
  useEffect(() => {
    setScrollOffset(0)
  }, [messages])

  // Slice to get visible messages starting from scroll offset
  const visibleMessages = reversedMessages.slice(scrollOffset)

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={isFocused ? Config.ui.focusedPanelBorderColor : Config.ui.panelBorderColor} flexGrow={1} height={maxHeight}>
      <Box>
        <Text bold color="magenta"> Message Log ({messages.length}) </Text>
      </Box>
      <Box flexDirection="column" paddingLeft={1} paddingRight={1} flexGrow={1} overflowY="hidden">
        {visibleMessages.length === 0 ? (
          <Text color="gray">No messages yet</Text>
        ) : (
          visibleMessages.map((msg, idx) => (
            <Box key={scrollOffset + idx} flexDirection="row">
              <Box minWidth={13}>
                <Text color="gray">[{msg.timestamp.toLocaleTimeString()}]</Text>
              </Box>
              <Text color={getMessageColor(msg.type)} wrap="wrap"> {msg.text}</Text>
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
}
