import React from 'react';
import { Box, Text } from 'ink';
export const ConnectionList = ({ connections, selectedIndex, maxHeight }) => {
    if (connections.length === 0) {
        return (React.createElement(Box, { flexDirection: "column", borderStyle: "round", borderColor: "gray", height: maxHeight },
            React.createElement(Text, { color: "gray" }, "No active connections")));
    }
    return (React.createElement(Box, { flexDirection: "column", borderStyle: "round", borderColor: "cyan", height: maxHeight },
        React.createElement(Box, null,
            React.createElement(Text, { bold: true, color: "cyan" },
                " Connections (",
                connections.length,
                ") ")),
        React.createElement(Box, { flexDirection: "column", flexGrow: 1, overflowY: "hidden" }, connections.map((conn, idx) => (React.createElement(Box, { key: conn.id, paddingLeft: 1 },
            React.createElement(Text, { color: idx === selectedIndex ? 'green' : 'white' },
                idx === selectedIndex ? '▶ ' : '  ',
                "ID: ",
                conn.id,
                " | Path: ",
                conn.path,
                " | Sent: ",
                conn.messagesSent,
                " | Received: ",
                conn.messagesReceived)))))));
};
//# sourceMappingURL=ConnectionList.js.map