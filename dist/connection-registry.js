export class ConnectionRegistry {
    constructor() {
        this.connections = new Map();
        this.nextId = 1;
    }
    add(ws, req) {
        const id = this.nextId++;
        const connection = {
            id,
            ws,
            path: req.url || '/',
            connectedAt: new Date(),
            messagesSent: 0,
            messagesReceived: 0,
            lastActivity: new Date()
        };
        this.connections.set(id, connection);
        return id;
    }
    remove(id) {
        this.connections.delete(id);
    }
    get(id) {
        return this.connections.get(id);
    }
    getAll() {
        return Array.from(this.connections.values());
    }
    updateMetadata(id, updates) {
        const connection = this.connections.get(id);
        if (connection) {
            Object.assign(connection, updates);
        }
    }
}
//# sourceMappingURL=connection-registry.js.map