import WebSocket from 'ws';
import { IncomingMessage } from 'http';
export interface Connection {
    id: number;
    ws: WebSocket;
    path: string;
    connectedAt: Date;
    messagesSent: number;
    messagesReceived: number;
    lastActivity: Date;
}
export interface ConnectionMetadataUpdate {
    messagesSent?: number;
    messagesReceived?: number;
    lastActivity?: Date;
}
export declare class ConnectionRegistry {
    private connections;
    private nextId;
    constructor();
    add(ws: WebSocket, req: IncomingMessage): number;
    remove(id: number): void;
    get(id: number): Connection | undefined;
    getAll(): Connection[];
    updateMetadata(id: number, updates: ConnectionMetadataUpdate): void;
}
//# sourceMappingURL=connection-registry.d.ts.map