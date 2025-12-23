import React, { useState } from 'react'
import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'
import { stdinParse } from '../../stdin.js'
import { DataOperation } from '../../data-operations.js'

interface CommandInputProps {
  onCommand: (connId: number, operation: DataOperation | null) => void
  onDbCommand: (path: string, value: any) => void
  selectedConnection: number | undefined
  isFocused: boolean
}

export const CommandInput: React.FC<CommandInputProps> = ({ onCommand, onDbCommand, selectedConnection, isFocused }) => {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    const trimmedValue = value.trim()

    if (trimmedValue.startsWith('db set ')) {
      const commandParts = trimmedValue.substring(7).split(' ')
      const path = commandParts[0]
      const rawValue = commandParts.slice(1).join(' ')
      let parsedValue: any = rawValue
      try {
        parsedValue = JSON.parse(rawValue)
      } catch (e) {
        // Not a JSON value, treat as a string
      }
      onDbCommand(path, parsedValue)
    } else if (selectedConnection) {
      if (!trimmedValue) {
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
    <Box flexDirection="column" borderStyle="round" borderColor={isFocused ? 'green' : 'yellow'}>
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
          focus={isFocused}
        />
      </Box>
      <Box paddingLeft={1} paddingTop={1}>
        <Text dimColor>
          Commands: db set path value | merge {'{...}'} | deepmerge {'{...}'} | append [...] | {'{...}'} (raw) | Enter (resend)
        </Text>
      </Box>
    </Box>
  )
}
