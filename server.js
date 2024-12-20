const WebSocket = require('ws');

// Create WebSocket server
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.add(ws);

    // Handle messages from clients
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);

        // Forward the message to all connected clients
        for (const client of clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});

console.log('WebSocket server is running...');
