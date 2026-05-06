require('dotenv').config();
const http = require('http');                              // Node.js built-in HTTP module
const app = require('./src/app');
const connectToDB = require('./src/db/db');
const { initializeSockets } = require('./src/sockets/index'); // WebSocket setup
const logger = require('./src/utils/logger');

// Connect to MongoDB
connectToDB();

// Create an HTTP server from the Express app
// (Required because Socket.io must attach to an HTTP server, not Express directly)
const server = http.createServer(app);

// Initialize WebSocket server — attaches socket.io to the HTTP server
// Also starts the Redis subscriber for worker progress updates
initializeSockets(server);

// Start listening
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});