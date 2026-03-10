import { EventEmitter } from 'events';
import * as fs from 'fs';
import WebSocket, { WebSocketServer } from 'ws';
import { ConnectionRegistry } from './connection-registry.js';
import { loadDataFromDb, applyOperation } from './data-operations.js';
import { findMatchingRule, processResponseTemplate } from './auto-responder.js';
export class ServerManager extends EventEmitter {
    constructor(dbPath, port) {
        super();
        this.wss = null;
        this.autoResponseRules = [];
        this.dbPath = dbPath;
        this.port = port;
        this.registry = new ConnectionRegistry();
        this.loadAutoResponseRules();
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
                const messageStr = message.toString();
                this.emit('connection:message', connId, messageStr);
                // Check auto-response rules
                this.handleAutoResponse(connId, messageStr, conn.path);
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
    getDbContent() {
        return fs.readFileSync(this.dbPath, 'utf-8');
    }
    saveDbContent(content) {
        fs.writeFileSync(this.dbPath, content, 'utf-8');
    }
    updateDbValue(path, value) {
        const content = this.getDbContent();
        const db = JSON.parse(content);
        this._setValueByPath(db, path, value);
        this.saveDbContent(JSON.stringify(db, null, 2));
    }
    _setValueByPath(obj, path, value) {
        const keys = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (typeof current[key] === 'undefined') {
                current[key] = {};
            }
            current = current[key];
        }
        current[keys[keys.length - 1]] = value;
    }
    closeConnection(connId) {
        const conn = this.registry.get(connId);
        if (conn) {
            conn.ws.close();
            // The 'close' event listener will handle cleanup and emit 'connection:close'
        }
    }
    getAutoResponseRules() {
        return this.autoResponseRules;
    }
    setAutoResponseRules(rules) {
        this.autoResponseRules = rules;
    }
    loadAutoResponseRules() {
        try {
            const content = fs.readFileSync(this.dbPath, 'utf-8');
            const db = JSON.parse(content);
            if (db.__rules && Array.isArray(db.__rules)) {
                this.autoResponseRules = db.__rules;
            }
            else {
                this.autoResponseRules = [];
            }
        }
        catch {
            this.autoResponseRules = [];
        }
    }
    handleAutoResponse(connId, message, connectionPath) {
        if (this.autoResponseRules.length === 0)
            return;
        const match = findMatchingRule(message, this.autoResponseRules, connectionPath);
        if (!match)
            return;
        const conn = this.registry.get(connId);
        if (!conn)
            return;
        const responseData = processResponseTemplate(match.response, {
            message,
            connectionId: connId
        });
        const sendResponse = () => {
            // Connection may have closed during delay
            const currentConn = this.registry.get(connId);
            if (!currentConn || currentConn.ws.readyState !== WebSocket.OPEN)
                return;
            try {
                currentConn.ws.send(JSON.stringify(responseData));
                this.registry.updateMetadata(connId, {
                    messagesSent: currentConn.messagesSent + 1,
                    lastActivity: new Date()
                });
                this.emit('auto-response:sent', connId, match.rule.name || 'unnamed', responseData);
            }
            catch (e) {
                this.emit('error', connId, e);
            }
        };
        if (match.rule.delay && match.rule.delay > 0) {
            setTimeout(sendResponse, match.rule.delay);
        }
        else {
            sendResponse();
        }
    }
    stop() {
        if (this.wss) {
            // Terminate all active connections to allow the process to exit
            for (const conn of this.registry.getAll()) {
                conn.ws.terminate();
            }
            this.wss.close();
            this.emit('server:stopped');
        }
    }
}
//# sourceMappingURL=server-manager.js.map