import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import Config from './Config.js';
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
export const MessageLog = ({ messages, maxHeight, isFocused }) => {
    const [scrollOffset, setScrollOffset] = useState(0);
    // Reverse messages so newest are at the top
    const reversedMessages = [...messages].reverse();
    const messageCount = reversedMessages.length;
    // Use refs to avoid stale closures in useInput callback
    const messageCountRef = useRef(messageCount);
    messageCountRef.current = messageCount;
    useInput((input, key) => {
        if (key.upArrow) {
            // Move up = decrease offset = show newer messages
            setScrollOffset(prev => Math.max(0, prev - 1));
        }
        if (key.downArrow) {
            // Move down = increase offset = show older messages
            // We scroll by message, not by line
            setScrollOffset(prev => Math.min(messageCountRef.current - 1, prev + 1));
        }
    }, { isActive: isFocused });
    // Reset scroll to top (newest messages) when new messages arrive
    useEffect(() => {
        setScrollOffset(0);
    }, [messages]);
    // Slice to get visible messages starting from scroll offset
    const visibleMessages = reversedMessages.slice(scrollOffset);
    return (React.createElement(Box, { flexDirection: "column", borderStyle: "round", borderColor: isFocused ? Config.ui.focusedPanelBorderColor : Config.ui.panelBorderColor, flexGrow: 1, height: maxHeight },
        React.createElement(Box, null,
            React.createElement(Text, { bold: true, color: "magenta" },
                " Message Log (",
                messages.length,
                ") ")),
        React.createElement(Box, { flexDirection: "column", paddingLeft: 1, paddingRight: 1, flexGrow: 1, overflowY: "hidden" }, visibleMessages.length === 0 ? (React.createElement(Text, { color: "gray" }, "No messages yet")) : (visibleMessages.map((msg, idx) => (React.createElement(Box, { key: scrollOffset + idx, flexDirection: "row" },
            React.createElement(Box, { minWidth: 13 },
                React.createElement(Text, { color: "gray" },
                    "[",
                    msg.timestamp.toLocaleTimeString(),
                    "]")),
            React.createElement(Text, { color: getMessageColor(msg.type), wrap: "wrap" },
                " ",
                msg.text))))))));
};
//# sourceMappingURL=MessageLog.js.map