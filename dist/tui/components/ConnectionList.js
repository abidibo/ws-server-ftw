import React from 'react';
import { Box, Text, useInput } from 'ink';
import Config from './Config.js';
export const ConnectionList = ({ connections, selectedIndex, setSelectedIndex, isFocused, onCloseConnection }) => {
    // Handle arrow key navigation and close command when focused
    useInput((input, key) => {
        if (key.upArrow && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
        }
        if (key.downArrow && selectedIndex < connections.length - 1) {
            setSelectedIndex(selectedIndex + 1);
        }
        // Close selected connection with 'x' or 'c' key
        if ((input === 'x' || input === 'c') && connections.length > 0) {
            const selectedConn = connections[selectedIndex];
            if (selectedConn) {
                onCloseConnection(selectedConn.id);
            }
        }
    }, { isActive: isFocused });
    if (connections.length === 0) {
        return (React.createElement(Box, { flexDirection: "column", borderStyle: "round", borderColor: isFocused ? Config.ui.focusedPanelBorderColor : Config.ui.panelBorderColor, flexGrow: 1 },
            React.createElement(Text, { color: "gray" }, "No active connections")));
    }
    return (React.createElement(Box, { flexDirection: "column", borderStyle: "round", borderColor: isFocused ? Config.ui.focusedPanelBorderColor : Config.ui.panelBorderColor, flexGrow: 1 },
        React.createElement(Box, null,
            React.createElement(Text, { bold: true, color: "cyan" },
                " Connections (",
                connections.length,
                ") "),
            isFocused && React.createElement(Text, { color: "gray", dimColor: true }, " [x/c: close] ")),
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