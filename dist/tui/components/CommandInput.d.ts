import React from 'react';
import { DataOperation } from '../../data-operations.js';
interface CommandInputProps {
    onCommand: (connId: number, operation: DataOperation | null) => void;
    onDbCommand: (path: string, value: any) => void;
    selectedConnection: number | undefined;
    isFocused: boolean;
}
export declare const CommandInput: React.FC<CommandInputProps>;
export {};
//# sourceMappingURL=CommandInput.d.ts.map