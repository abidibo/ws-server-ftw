import React, { useEffect, useState } from 'react';
import { Box, useInput, useApp, useStdout, useStdin } from 'ink';
import { useServerState } from '../hooks/use-server-state.js';
import { ConnectionList } from './ConnectionList.js';
import { CommandInput } from './CommandInput.js';
import { StatusBar } from './StatusBar.js';
import { MessageLog } from './MessageLog.js';
import { DbEditor } from './DbEditor.js';
export const App = ({ serverManager, onReady }) => {
    const { exit } = useApp();
    const { stdout } = useStdout();
    const { stdin } = useStdin();
    const { connections, selectedIndex, setSelectedIndex, messages, port, dbContent, setDbContent } = useServerState(serverManager);
    const [focusedPanel, setFocusedPanel] = useState('connections');
    const selectedConnection = connections[selectedIndex];
    useEffect(() => {
        onReady?.();
    }, []);
    // Global quit handler
    useEffect(() => {
        const handler = (data) => {
            if (data === 'q') {
                serverManager.stop();
                exit();
            }
        };
        stdin?.on('data', handler);
        return () => {
            stdin?.off('data', handler);
        };
    }, [stdin, exit, serverManager]);
    // Get terminal dimensions
    const terminalHeight = stdout?.rows ?? 24;
    // Calculate heights for different sections
    const statusBarHeight = 3; // Border + content
    const availableHeight = terminalHeight - statusBarHeight;
    const rightPanelHeight = availableHeight - 2; // -2 for borders
    // Keyboard navigation
    useInput((input, key) => {
        if (key.tab) {
            const panels = ['connections', 'command', 'db', 'log'];
            const currentIndex = panels.indexOf(focusedPanel);
            const nextIndex = (currentIndex + 1) % panels.length;
            setFocusedPanel(panels[nextIndex]);
        }
        if (focusedPanel === 'connections') {
            if (key.upArrow && selectedIndex > 0) {
                setSelectedIndex(selectedIndex - 1);
            }
            if (key.downArrow && selectedIndex < connections.length - 1) {
                setSelectedIndex(selectedIndex + 1);
            }
        }
    });
    const handleCommand = (connId, operation) => {
        serverManager.sendData(connId, operation);
    };
    const handleDbCommand = (path, value) => {
        serverManager.updateDbValue(path, value);
        setDbContent(serverManager.getDbContent());
    };
    return (React.createElement(Box, { flexDirection: "column", flexGrow: 1 },
        React.createElement(StatusBar, { port: port, connectionCount: connections.length, selectedConnection: selectedConnection?.id, focusedPanel: focusedPanel }),
        React.createElement(Box, { flexDirection: "row", flexGrow: 1 },
            React.createElement(Box, { flexDirection: "column", width: "30%" },
                React.createElement(ConnectionList, { connections: connections, selectedIndex: selectedIndex, isFocused: focusedPanel === 'connections' }),
                React.createElement(CommandInput, { onCommand: handleCommand, onDbCommand: handleDbCommand, selectedConnection: selectedConnection?.id, isFocused: focusedPanel === 'command' })),
            React.createElement(Box, { flexDirection: "column", width: "45%" },
                React.createElement(DbEditor, { dbContent: dbContent, maxHeight: rightPanelHeight, isFocused: focusedPanel === 'db' })),
            React.createElement(Box, { flexDirection: "column", width: "25%" },
                React.createElement(MessageLog, { messages: messages, maxHeight: rightPanelHeight, isFocused: focusedPanel === 'log' })))));
};
//# sourceMappingURL=App.js.map