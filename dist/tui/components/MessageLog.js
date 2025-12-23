import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Config from './Config.js';
export const MessageLog = ({ messages, maxHeight = 10, isFocused }) => {
    const [scrollOffset, setScrollOffset] = useState(0);
    const contentHeight = maxHeight > 2 ? maxHeight - 2 : 0;
    useInput((input, key) => {
        if (key.upArrow) {
            setScrollOffset(prev => Math.max(0, prev - 1));
        }
        if (key.downArrow) {
            setScrollOffset(prev => Math.min(Math.max(0, messages.length - contentHeight), prev + 1));
        }
    }, { isActive: isFocused });
    // Auto-scroll to bottom on new message if not manually scrolled
    useEffect(() => {
        if (messages.length > contentHeight) {
            const maxScroll = messages.length - contentHeight;
            // Only auto-scroll if we are already at the bottom
            if (scrollOffset === maxScroll - 1 || scrollOffset === maxScroll) {
                setScrollOffset(maxScroll);
            }
        }
    }, [messages, contentHeight]);
    const visibleMessages = messages.slice(scrollOffset, scrollOffset + contentHeight);
    const getMessageColor = (type) => {
        switch (type) {
            case 'success':
                return 'green';
            case 'error':
                return 'red';
            case 'info':
                return 'cyan';
            default:
                return 'white';
        }
    };
    return (React.createElement(Box, { flexDirection: "column", borderStyle: "round", borderColor: isFocused ? Config.ui.focusedPanelBorderColor : Config.ui.panelBorderColor, height: maxHeight, paddingRight: 2 },
        React.createElement(Box, null,
            React.createElement(Text, { bold: true, color: "magenta" },
                " Message Log (",
                messages.length,
                ") ")),
        React.createElement(Box, { flexDirection: "column", paddingLeft: 1, flexGrow: 1, overflowY: "hidden" }, visibleMessages.length === 0 ? (React.createElement(Text, { color: "gray" }, "No messages yet")) : (visibleMessages.map((msg, idx) => (React.createElement(Box, { key: idx, flexDirection: "row" },
            React.createElement(Box, { minWidth: 13 },
                React.createElement(Text, { color: "gray" },
                    "[",
                    msg.timestamp.toLocaleTimeString(),
                    "]")),
            React.createElement(Text, { color: getMessageColor(msg.type), wrap: 'wrap' },
                " ",
                msg.text))))))));
};
//# sourceMappingURL=MessageLog.js.map