import { useState, useEffect } from 'react';
export function useServerState(serverManager) {
  const [connections, setConnections] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [port, setPort] = useState(null);
  const addMessage = (type, text) => {
    setMessages(prev => [...prev, { type, text, timestamp: new Date() }].slice(-100));
  };
  useEffect(() => {
    // Server started
    const onServerStarted = (p) => {
      setPort(p);
    };
    // New connection
    const onConnectionNew = (conn) => {
      setConnections(prev => [...prev, conn]);
      addMessage('info', `New connection: ${conn.path} (ID: ${conn.id})`);
    };
    // Connection closed
    const onConnectionClose = (connId) => {
      setConnections(prev => {
        const newConns = prev.filter(c => c.id !== connId);
        // Adjust selected index if needed
        setSelectedIndex(prevIdx => Math.max(0, Math.min(prevIdx, newConns.length - 1)));
        return newConns;
      });
      addMessage('info', `Connection closed: ${connId}`);
    };
    // Data sent
    const onDataSent = (connId, data) => {
      const dataStr = JSON.stringify(data);
      const preview = dataStr.length > 100 ? dataStr.substring(0, 100) + '...' : dataStr;
      addMessage('success', `Sent to ${connId}: ${preview}`);
    };
    // Message received
    const onConnectionMessage = (connId, message) => {
      addMessage('info', `Received from ${connId}: ${message}`);
    };
    // Error
    const onError = (connId, error) => {
      addMessage('error', `Error on ${connId}: ${error.message}`);
    };
    // Register event listeners
    serverManager.on('server:started', onServerStarted);
    serverManager.on('connection:new', onConnectionNew);
    serverManager.on('connection:close', onConnectionClose);
    serverManager.on('data:sent', onDataSent);
    serverManager.on('connection:message', onConnectionMessage);
    serverManager.on('error', onError);
    // Cleanup
    return () => {
      serverManager.removeListener('server:started', onServerStarted);
      serverManager.removeListener('connection:new', onConnectionNew);
      serverManager.removeListener('connection:close', onConnectionClose);
      serverManager.removeListener('data:sent', onDataSent);
      serverManager.removeListener('connection:message', onConnectionMessage);
      serverManager.removeListener('error', onError);
    };
  }, [serverManager]);
  return {
    connections,
    selectedIndex,
    setSelectedIndex,
    messages,
    port
  };
}
//# sourceMappingURL=use-server-state.js.map
