import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { stdinParse } from '../../stdin.js';
import Config from './Config.js';
export const CommandInput = ({ onCommand, onDbCommand, selectedConnection, isFocused }) => {
    const [value, setValue] = useState('');
    const handleSubmit = () => {
        const trimmedValue = value.trim();
        if (trimmedValue.startsWith('db set ')) {
            const commandParts = trimmedValue.substring(7).split(' ');
            const path = commandParts[0];
            const rawValue = commandParts.slice(1).join(' ');
            let parsedValue = rawValue;
            try {
                parsedValue = JSON.parse(rawValue);
            }
            catch (e) {
                // Not a JSON value, treat as a string
            }
            onDbCommand(path, parsedValue);
        }
        else if (selectedConnection) {
            if (!trimmedValue) {
                // Empty input - resend original data
                onCommand(selectedConnection, null);
            }
            else {
                // Parse input using existing stdinParse
                const mockInput = { toString: () => value };
                const parsedData = stdinParse(mockInput);
                if (parsedData) {
                    // Convert parsed data to operation format
                    let operation = null;
                    if (parsedData.merge && parsedData.obj) {
                        operation = { type: 'merge', data: parsedData.obj };
                    }
                    else if (parsedData.deepmerge && parsedData.obj) {
                        operation = { type: 'deepmerge', data: parsedData.obj };
                    }
                    else if (parsedData.append && parsedData.arr) {
                        operation = { type: 'append', data: parsedData.arr };
                    }
                    else if (parsedData.data) {
                        operation = { type: 'raw', data: parsedData.data };
                    }
                    if (operation) {
                        onCommand(selectedConnection, operation);
                    }
                }
            }
        }
        setValue('');
    };
    if (!selectedConnection) {
        return (React.createElement(Box, { borderStyle: "round", borderColor: isFocused ? Config.ui.focusedPanelBorderColor : Config.ui.panelBorderColor },
            React.createElement(Text, { color: "gray" }, "No connection selected")));
    }
    return (React.createElement(Box, { flexDirection: "column", borderStyle: "round", borderColor: isFocused ? Config.ui.focusedPanelBorderColor : Config.ui.panelBorderColor },
        React.createElement(Box, null,
            React.createElement(Text, { bold: true, color: "yellow" },
                " Command (Target: Connection ",
                selectedConnection,
                ") ")),
        React.createElement(Box, { paddingLeft: 1 },
            React.createElement(Text, { color: "gray" }, "\u25B6 "),
            React.createElement(TextInput, { value: value, onChange: setValue, onSubmit: handleSubmit, placeholder: "Enter command or press Enter to resend...", focus: isFocused })),
        React.createElement(Box, { paddingLeft: 1, paddingTop: 1 },
            React.createElement(Text, { dimColor: true },
                "Commands: db set path value | merge ",
                '{...}',
                " | deepmerge ",
                '{...}',
                " | append [...] | ",
                '{...}',
                " (raw) | Enter (resend)"))));
};
//# sourceMappingURL=CommandInput.js.map