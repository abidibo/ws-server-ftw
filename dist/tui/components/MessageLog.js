import React from 'react';
import { Box, Text } from 'ink';
export const MessageLog = ({ messages, maxHeight = 10 }) => {
    // Calculate how many messages can fit (accounting for header)
    const contentHeight = maxHeight ? maxHeight - 2 : 10;
    const visibleMessages = messages.slice(-contentHeight);
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
    return (React.createElement(Box, { flexDirection: "column", borderStyle: "round", borderColor: "magenta", height: maxHeight },
        React.createElement(Box, null,
            React.createElement(Text, { bold: true, color: "magenta" },
                " Message Log (",
                messages.length,
                ") ")),
        React.createElement(Box, { flexDirection: "column", paddingLeft: 1, flexGrow: 1, overflowY: "hidden" }, visibleMessages.length === 0 ? (React.createElement(Text, { color: "gray" }, "No messages yet")) : (visibleMessages.map((msg, idx) => (React.createElement(Box, { key: idx },
            React.createElement(Text, { color: "gray" },
                "[",
                msg.timestamp.toLocaleTimeString(),
                "]"),
            React.createElement(Text, { color: getMessageColor(msg.type) },
                " ",
                msg.text))))))));
};
//# sourceMappingURL=MessageLog.js.map