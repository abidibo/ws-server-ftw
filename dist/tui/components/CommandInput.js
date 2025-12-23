import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { stdinParse } from '../../stdin.js';
export const CommandInput = ({ onCommand, selectedConnection }) => {
    const [value, setValue] = useState('');
    const handleSubmit = () => {
        if (!selectedConnection)
            return;
        if (!value.trim()) {
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
        setValue('');
    };
    if (!selectedConnection) {
        return (React.createElement(Box, { borderStyle: "round", borderColor: "gray" },
            React.createElement(Text, { color: "gray" }, "No connection selected")));
    }
    return (React.createElement(Box, { flexDirection: "column", borderStyle: "round", borderColor: "yellow" },
        React.createElement(Box, null,
            React.createElement(Text, { bold: true, color: "yellow" },
                " Command (Target: Connection ",
                selectedConnection,
                ") ")),
        React.createElement(Box, { paddingLeft: 1 },
            React.createElement(Text, { color: "gray" }, "\u25B6 "),
            React.createElement(TextInput, { value: value, onChange: setValue, onSubmit: handleSubmit, placeholder: "Enter command or press Enter to resend..." })),
        React.createElement(Box, { paddingLeft: 1, paddingTop: 1 },
            React.createElement(Text, { dimColor: true },
                "Commands: merge ",
                '{...}',
                " | deepmerge ",
                '{...}',
                " | append [...] | ",
                '{...}',
                " (raw) | Enter (resend)"))));
};
//# sourceMappingURL=CommandInput.js.map