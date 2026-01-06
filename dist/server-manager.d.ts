import { EventEmitter } from 'events';
import { Connection } from './connection-registry.js';
import { DataOperation } from './data-operations.js';
export interface ServerManagerEvents {
    'connection:new': (conn: Connection) => void;
    'connection:message': (connId: number, message: string) => void;
    'connection:close': (connId: number) => void;
    'data:sent': (connId: number, data: unknown) => void;
    'server:started': (port: number) => void;
    'server:stopped': () => void;
    'error': (connId: number, error: Error) => void;
}
export declare interface ServerManager {
    on<K extends keyof ServerManagerEvents>(event: K, listener: ServerManagerEvents[K]): this;
    emit<K extends keyof ServerManagerEvents>(event: K, ...args: Parameters<ServerManagerEvents[K]>): boolean;
}
export declare class ServerManager extends EventEmitter {
    private dbPath;
    private port;
    private registry;
    private wss;
    constructor(dbPath: string, port: number);
    start(): void;
    sendData(connId: number, operation?: DataOperation | null): Promise<void>;
    getConnections(): Connection[];
    getDbContent(): string;
    saveDbContent(content: string): void;
    updateDbValue(path: string, value: any): void;
    private _setValueByPath;
    closeConnection(connId: number): void;
    stop(): void;
}
//# sourceMappingURL=server-manager.d.ts.map