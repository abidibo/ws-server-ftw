import React from 'react';
import { DataOperation } from '../../data-operations.js';
interface CommandInputProps {
    onCommand: (connId: number, operation: DataOperation | null) => void;
    selectedConnection: number | undefined;
}
export declare const CommandInput: React.FC<CommandInputProps>;
export {};
//# sourceMappingURL=CommandInput.d.ts.map