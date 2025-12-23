import React from 'react';
import { Box, Text } from 'ink';
export const StatusBar = ({ port, connectionCount, selectedConnection }) => {
    return (React.createElement(Box, { borderStyle: "round", borderColor: "green" },
        React.createElement(Box, { paddingLeft: 1, paddingRight: 2 },
            React.createElement(Text, { color: "green" }, "\u26A1 Server: "),
            React.createElement(Text, null,
                "localhost:",
                port)),
        React.createElement(Box, { paddingLeft: 1, paddingRight: 2 },
            React.createElement(Text, { color: "cyan" }, "\uD83D\uDD17 Connections: "),
            React.createElement(Text, null, connectionCount)),
        selectedConnection !== undefined && (React.createElement(Box, { paddingLeft: 1, paddingRight: 2 },
            React.createElement(Text, { color: "yellow" }, "\uD83C\uDFAF Selected: "),
            React.createElement(Text, null, selectedConnection))),
        React.createElement(Box, { paddingLeft: 1, paddingRight: 1 },
            React.createElement(Text, { color: "gray" }, "Press q to quit | \u2191\u2193 to navigate"))));
};
//# sourceMappingURL=StatusBar.js.map