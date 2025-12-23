import React, { useState } from 'react'
import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'
import { stdinParse } from '../../stdin.js'
import { DataOperation } from '../../data-operations.js'

interface CommandInputProps {
  onCommand: (connId: number, operation: DataOperation | null) => void
  selectedConnection: number | undefined
}

export const CommandInput: React.FC<CommandInputProps> = ({ onCommand, selectedConnection }) => {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (!selectedConnection) return

    if (!value.trim()) {
      // Empty input - resend original data
      onCommand(selectedConnection, null)
    } else {
      // Parse input using existing stdinParse
      const mockInput = { toString: () => value }
      const parsedData = stdinParse(mockInput)

      if (parsedData) {
        // Convert parsed data to operation format
        let operation: DataOperation | null = null

        if (parsedData.merge && parsedData.obj) {
          operation = { type: 'merge', data: parsedData.obj }
        } else if (parsedData.deepmerge && parsedData.obj) {
          operation = { type: 'deepmerge', data: parsedData.obj }
        } else if (parsedData.append && parsedData.arr) {
          operation = { type: 'append', data: parsedData.arr }
        } else if (parsedData.data) {
          operation = { type: 'raw', data: parsedData.data }
        }

        if (operation) {
          onCommand(selectedConnection, operation)
        }
      }
    }

    setValue('')
  }

  if (!selectedConnection) {
    return (
      <Box borderStyle="round" borderColor="gray">
        <Text color="gray">No connection selected</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="yellow">
      <Box>
        <Text bold color="yellow"> Command (Target: Connection {selectedConnection}) </Text>
      </Box>
      <Box paddingLeft={1}>
        <Text color="gray">▶ </Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder="Enter command or press Enter to resend..."
        />
      </Box>
      <Box paddingLeft={1} paddingTop={1}>
        <Text dimColor>
          Commands: merge {'{...}'} | deepmerge {'{...}'} | append [...] | {'{...}'} (raw) | Enter (resend)
        </Text>
      </Box>
    </Box>
  )
}
