import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';
import { ConnectionRegistry } from './connection-registry.js';
import { loadDataFromDb, applyOperation } from './data-operations.js';
export class ServerManager extends EventEmitter {
    constructor(dbPath, port) {
        super();
        this.wss = null;
        this.dbPath = dbPath;
        this.port = port;
        this.registry = new ConnectionRegistry();
    }
    start() {
        this.wss = new WebSocketServer({ port: this.port });
        this.wss.on('connection', (ws, req) => {
            const connId = this.registry.add(ws, req);
            const conn = this.registry.get(connId);
            if (!conn)
                return;
            // Emit new connection event
            this.emit('connection:new', conn);
            // Setup message listener
            ws.on('message', (message) => {
                this.registry.updateMetadata(connId, {
                    messagesReceived: conn.messagesReceived + 1,
                    lastActivity: new Date()
                });
                this.emit('connection:message', connId, message.toString());
            });
            // Setup close listener
            ws.on('close', () => {
                this.emit('connection:close', connId);
                this.registry.remove(connId);
            });
            // Send initial data
            this.sendData(connId);
        });
        this.emit('server:started', this.port);
    }
    async sendData(connId, operation) {
        const conn = this.registry.get(connId);
        if (!conn)
            return;
        try {
            const baseData = await loadDataFromDb(this.dbPath, conn.path);
            const finalData = await applyOperation(baseData, operation || null);
            conn.ws.send(JSON.stringify(finalData));
            this.registry.updateMetadata(connId, {
                messagesSent: conn.messagesSent + 1,
                lastActivity: new Date()
            });
            this.emit('data:sent', connId, finalData);
        }
        catch (e) {
            this.emit('error', connId, e);
        }
    }
    getConnections() {
        return this.registry.getAll();
    }
    stop() {
        if (this.wss) {
            this.wss.close();
            this.emit('server:stopped');
        }
    }
}
//# sourceMappingURL=server-manager.js.map