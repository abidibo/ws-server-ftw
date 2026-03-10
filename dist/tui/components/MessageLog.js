import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Config from './Config.js';
const getMessageColor = (type) => {
    switch (type) {
        case 'success':
            return 'green';
        case 'error':
            return 'red';
        case 'info':
            return 'cyan';
        case 'autoResponse':
            return 'yellow';
        default:
            return 'white';
    }
};
const typeFilterOrder = ['all', 'success', 'info', 'autoResponse', 'error'];
const typeFilterLabels = {
    all: 'All',
    success: 'Sent',
    info: 'Received',
    autoResponse: 'Auto',
    error: 'Error'
};
export const MessageLog = ({ messages, maxHeight, isFocused, onSearchModeChange }) => {
    const [scrollOffset, setScrollOffset] = useState(0);
    const [searchMode, setSearchMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    // Filter messages
    const filteredMessages = useMemo(() => {
        return messages.filter(msg => {
            if (typeFilter !== 'all' && msg.type !== typeFilter)
                return false;
            if (searchText && !msg.text.toLowerCase().includes(searchText.toLowerCase()))
                return false;
            return true;
        });
    }, [messages, typeFilter, searchText]);
    // Reverse messages so newest are at the top
    const reversedMessages = [...filteredMessages].reverse();
    const messageCount = reversedMessages.length;
    // Use refs to avoid stale closures in useInput callback
    const messageCountRef = useRef(messageCount);
    messageCountRef.current = messageCount;
    const searchModeRef = useRef(searchMode);
    searchModeRef.current = searchMode;
    useInput((input, key) => {
        // Don't handle navigation keys while typing in search
        if (searchModeRef.current) {
            if (key.escape) {
                setSearchMode(false);
                setSearchText('');
                setScrollOffset(0);
            }
            return;
        }
        if (key.upArrow) {
            setScrollOffset(prev => Math.max(0, prev - 1));
        }
        if (key.downArrow) {
            setScrollOffset(prev => Math.min(Math.max(0, messageCountRef.current - 1), prev + 1));
        }
        if (input === '/') {
            setSearchMode(true);
            setScrollOffset(0);
        }
        if (input === 't') {
            setTypeFilter(prev => {
                const currentIdx = typeFilterOrder.indexOf(prev);
                return typeFilterOrder[(currentIdx + 1) % typeFilterOrder.length];
            });
            setScrollOffset(0);
        }
        if (key.escape) {
            // Clear filters even outside search mode
            if (typeFilter !== 'all') {
                setTypeFilter('all');
                setScrollOffset(0);
            }
        }
    }, { isActive: isFocused });
    // Exit search mode when panel loses focus
    useEffect(() => {
        if (!isFocused && searchMode) {
            setSearchMode(false);
        }
    }, [isFocused]);
    // Notify parent of search mode changes
    useEffect(() => {
        onSearchModeChange?.(searchMode);
    }, [searchMode]);
    // Reset scroll to top (newest messages) when new messages arrive
    useEffect(() => {
        setScrollOffset(0);
    }, [messages]);
    // Reset scroll when filter changes
    useEffect(() => {
        setScrollOffset(0);
    }, [typeFilter, searchText]);
    // Slice to get visible messages starting from scroll offset
    const visibleMessages = reversedMessages.slice(scrollOffset);
    const isFiltered = typeFilter !== 'all' || searchText !== '';
    // Build header text
    const headerParts = [];
    if (isFiltered) {
        headerParts.push(`${filteredMessages.length}/${messages.length}`);
    }
    else {
        headerParts.push(`${messages.length}`);
    }
    return (React.createElement(Box, { flexDirection: "column", borderStyle: "round", borderColor: isFocused ? Config.ui.focusedPanelBorderColor : Config.ui.panelBorderColor, flexGrow: 1, height: maxHeight },
        React.createElement(Box, null,
            React.createElement(Text, { bold: true, color: "magenta" },
                " Message Log (",
                headerParts.join(''),
                ") "),
            typeFilter !== 'all' && (React.createElement(Text, { color: getMessageColor(typeFilter) },
                "[",
                typeFilterLabels[typeFilter],
                "] ")),
            searchText && (React.createElement(Text, { color: "white" },
                "\"",
                searchText,
                "\" "))),
        React.createElement(Box, { flexDirection: "column", paddingLeft: 1, paddingRight: 1, flexGrow: 1, overflowY: "hidden" }, visibleMessages.length === 0 ? (React.createElement(Text, { color: "gray" }, isFiltered ? 'No messages match the current filter' : 'No messages yet')) : (visibleMessages.map((msg, idx) => (React.createElement(Box, { key: scrollOffset + idx, flexDirection: "row" },
            React.createElement(Box, { minWidth: 13 },
                React.createElement(Text, { color: "gray" },
                    "[",
                    msg.timestamp.toLocaleTimeString(),
                    "]")),
            React.createElement(Text, { color: getMessageColor(msg.type), wrap: "wrap" },
                " ",
                msg.text)))))),
        isFocused && (React.createElement(Box, { paddingLeft: 1 }, searchMode ? (React.createElement(Box, null,
            React.createElement(Text, { color: "white" }, "/ "),
            React.createElement(TextInput, { value: searchText, onChange: setSearchText, onSubmit: () => setSearchMode(false), placeholder: "Type to filter...", focus: searchMode }),
            React.createElement(Text, { color: "gray" }, " (Enter to confirm, Esc to clear)"))) : (React.createElement(Text, { dimColor: true },
            "/: search | t: type (",
            typeFilterLabels[typeFilter],
            ") | Esc: clear"))))));
};
//# sourceMappingURL=MessageLog.js.map