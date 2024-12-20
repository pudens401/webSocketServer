const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
let server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('WebSocket server is running. Use a WebSocket client to connect.');
    } else if (req.method === 'GET' && req.url === '/restart') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Server is restarting...');
        restartServer();
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Create WebSocket server
let wss = createWebSocketServer(server);

// Start the server on a specific port
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Function to create a WebSocket server
function createWebSocketServer(httpServer) {
    const wss = new WebSocket.Server({ server: httpServer });
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

    console.log('WebSocket server created');
    return wss;
}

// Function to restart the server
function restartServer() {
    console.log('Restarting server...');

    // Close the WebSocket server
    if (wss) {
        wss.clients.forEach((client) => client.close());
        wss.close(() => {
            console.log('WebSocket server closed');
        });
    }

    // Close the HTTP server and restart it
    server.close(() => {
        console.log('HTTP server closed');
        server = http.createServer((req, res) => {
            if (req.method === 'GET' && req.url === '/') {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('WebSocket server is running. Use a WebSocket client to connect.');
            } else if (req.method === 'POST' && req.url === '/restart') {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Server is restarting...');
                restartServer();
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        });

        // Recreate WebSocket server
        wss = createWebSocketServer(server);

        // Start the HTTP server again
        server.listen(PORT, () => {
            console.log(`Server restarted on port ${PORT}`);
        });
    });
}
