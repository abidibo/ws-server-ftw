import React from 'react';
import { Box, Text } from 'ink';
import Config from './Config.js';
export const StatusBar = ({ port, connectionCount, selectedConnection, focusedPanel }) => {
    return (React.createElement(Box, { borderStyle: "round", borderColor: Config.ui.statusBarBorderColor },
        React.createElement(Box, { paddingLeft: 1, paddingRight: 2 },
            React.createElement(Text, { color: "red" },
                "WS-SERVER v",
                process.env.npm_package_version)),
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
        React.createElement(Box, { flexGrow: 1 }),
        React.createElement(Box, { paddingLeft: 1, paddingRight: 2 },
            React.createElement(Text, { color: "magenta" }, "Focus: "),
            React.createElement(Text, null, focusedPanel.charAt(0).toUpperCase() + focusedPanel.slice(1))),
        React.createElement(Box, { paddingLeft: 1, paddingRight: 1 },
            React.createElement(Text, { color: "gray" }, "Press q to quit | \u2191\u2193 to navigate | Tab to switch panels"))));
};
//# sourceMappingURL=StatusBar.js.map