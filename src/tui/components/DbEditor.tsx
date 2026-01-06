import React, { useState, useEffect, useMemo } from 'react'
import { Box, Text, useInput } from 'ink'
import Config from './Config.js'
import { highlightJson } from '../utils/json-highlighter.js'

interface DbEditorProps {
  dbContent: string
  maxHeight: number
  isFocused: boolean
}

export const DbEditor: React.FC<DbEditorProps> = ({ dbContent, maxHeight, isFocused }) => {
  const [scrollOffset, setScrollOffset] = useState(0)

  // Memoize the highlighted content - only recompute when dbContent changes
  const { highlightedLines, lineCount } = useMemo(() => {
    let displayContent = dbContent

    try {
      const parsed = JSON.parse(dbContent)
      displayContent = JSON.stringify(parsed, null, 2)
    } catch (e) {
      // Not valid JSON, display as is
    }

    // Apply syntax highlighting
    const highlighted = highlightJson(displayContent)
    const lines = highlighted.split('\n')

    return {
      highlightedLines: lines,
      lineCount: lines.length
    }
  }, [dbContent])

  const visibleAreaHeight = maxHeight > 2 ? maxHeight - 2 : 0

  useInput((input, key) => {
    if (key.upArrow) {
      setScrollOffset(prev => Math.max(0, prev - 1))
    }
    if (key.downArrow) {
      setScrollOffset(prev => Math.min(Math.max(0, lineCount - visibleAreaHeight), prev + 1))
    }
  }, { isActive: isFocused })

  // Reset scroll on content change
  useEffect(() => {
    setScrollOffset(0)
  }, [dbContent])

  // Memoize the visible lines - only recompute when scroll position or content changes
  const visibleLines = useMemo(() => {
    return highlightedLines
      .slice(scrollOffset, scrollOffset + visibleAreaHeight)
      .join('\n')
  }, [highlightedLines, scrollOffset, visibleAreaHeight])

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={isFocused ? Config.ui.focusedPanelBorderColor : Config.ui.panelBorderColor} flexGrow={1} height={maxHeight}>
      <Box>
        <Text bold color="blue"> DB Content (db.json) </Text>
      </Box>
      <Box flexGrow={1} paddingLeft={1} paddingRight={1} overflowY="hidden">
        <Text>{visibleLines}</Text>
      </Box>
    </Box>
  )
}
