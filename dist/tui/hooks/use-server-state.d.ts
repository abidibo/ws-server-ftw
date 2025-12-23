import { ServerManager } from '../../server-manager.js';
import { Connection } from '../../connection-registry.js';
export interface LogMessage {
    type: 'success' | 'error' | 'info';
    text: string;
    timestamp: Date;
}
export interface ServerState {
    connections: Connection[];
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
    messages: LogMessage[];
    port: number | null;
    dbContent: string;
    setDbContent: (content: string) => void;
}
export declare function useServerState(serverManager: ServerManager): ServerState;
//# sourceMappingURL=use-server-state.d.ts.map