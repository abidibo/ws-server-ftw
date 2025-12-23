import React from 'react';
import { Box, useInput, useApp, useStdout } from 'ink';
import { useServerState } from '../hooks/use-server-state.js';
import { ConnectionList } from './ConnectionList.js';
import { CommandInput } from './CommandInput.js';
import { StatusBar } from './StatusBar.js';
import { MessageLog } from './MessageLog.js';
export const App = ({ serverManager }) => {
    const { exit } = useApp();
    const { stdout } = useStdout();
    const { connections, selectedIndex, setSelectedIndex, messages, port } = useServerState(serverManager);
    const selectedConnection = connections[selectedIndex];
    // Get terminal dimensions
    const terminalHeight = stdout?.rows || 24;
    const terminalWidth = stdout?.columns || 80;
    // Calculate heights for different sections
    const statusBarHeight = 3; // Border + content
    const commandInputHeight = 6; // Border + input + help text
    const availableHeight = terminalHeight - statusBarHeight;
    const connectionListHeight = availableHeight - commandInputHeight - 1; // -1 for spacing
    const messageLogHeight = availableHeight - 2; // -2 for borders
    // Keyboard navigation
    useInput((input, key) => {
        if (input === 'q') {
            serverManager.stop();
            exit();
        }
        if (key.upArrow && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
        }
        if (key.downArrow && selectedIndex < connections.length - 1) {
            setSelectedIndex(selectedIndex + 1);
        }
    });
    const handleCommand = (connId, operation) => {
        serverManager.sendData(connId, operation);
    };
    return (React.createElement(Box, { flexDirection: "column", height: terminalHeight, width: terminalWidth },
        React.createElement(StatusBar, { port: port, connectionCount: connections.length, selectedConnection: selectedConnection?.id }),
        React.createElement(Box, { flexDirection: "row", flexGrow: 1 },
            React.createElement(Box, { flexDirection: "column", width: "60%" },
                React.createElement(ConnectionList, { connections: connections, selectedIndex: selectedIndex, maxHeight: connectionListHeight }),
                React.createElement(CommandInput, { onCommand: handleCommand, selectedConnection: selectedConnection?.id })),
            React.createElement(Box, { flexDirection: "column", width: "40%" },
                React.createElement(MessageLog, { messages: messages, maxHeight: messageLogHeight })))));
};
//# sourceMappingURL=App.js.map