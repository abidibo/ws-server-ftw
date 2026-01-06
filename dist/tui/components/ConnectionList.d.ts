import React from 'react';
import { Connection } from '../../connection-registry.js';
interface ConnectionListProps {
    connections: Connection[];
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
    isFocused: boolean;
    onCloseConnection: (connId: number) => void;
}
export declare const ConnectionList: React.FC<ConnectionListProps>;
export {};
//# sourceMappingURL=ConnectionList.d.ts.map