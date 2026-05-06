
// ─── src/sockets/index.js ────────────────────────────────────────────────────
//
// PURPOSE:
//   This file sets up the Socket.io WebSocket server.
//   It also subscribes to a Redis channel so it can receive status updates
//   that the worker process (a separate Node.js process) publishes.
//
//  REDIS PUB/SUB
//   The worker (worker.js) and the server (server.js) are TWO separate processes.
//   Socket.io lives on the server — the worker can't call io.emit() directly.
//   So the worker PUBLISHES status events to a Redis channel,
//   and the server SUBSCRIBES to that channel and relays them via socket.io.
//
//   Flow:  Worker → redis.publish() → Redis → subscriber here → io.to(userId).emit()
// ─────────────────────────────────────────────────────────────────────────────

const { Server } = require('socket.io');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// We'll store the io instance so it can be imported by other files if needed
let io;

// ─── REDIS SUBSCRIBER ────────────────────────────────────────────────────────
// A dedicated Redis connection just for subscribing to the "lexshift:progress" channel.
// NOTE: A subscriber connection CANNOT be used for other Redis commands.
const createRedisSubscriber = () => {
  const subscriber = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  });

  subscriber.on('error', (err) => {
    logger.error(`Redis subscriber error: ${err.message}`);
  });

  return subscriber;
};

// ─── INITIALIZE SOCKETS ──────────────────────────────────────────────────────
// Called from server.js — receives the HTTP server instance and attaches socket.io to it.
const initializeSockets = (httpServer) => {
  // Create socket.io server, allow connections from the frontend dev server
  io = new Server(httpServer, {
    cors: {
      // Must use exact origin (not *) when credentials:true
      // because browsers block wildcard origin with credentialed requests
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // ── Client Connection Handler ─────────────────────────────────────────────
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // When a user logs in on the frontend, they emit 'joinRoom' with their userId.
    // We put them in a private room named after their userId.
    // This way we can send updates ONLY to that specific user.
    socket.on('joinRoom', (userId) => {
      socket.join(userId);
      logger.info(`User ${userId} joined private room`);
    });

    // Log when user disconnects
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  // ── Redis Subscriber Setup ────────────────────────────────────────────────
  const subscriber = createRedisSubscriber();

  // Subscribe to the channel the worker publishes to
  subscriber.subscribe('lexshift:progress', (err) => {
    if (err) {
      logger.error(`Failed to subscribe to Redis channel: ${err.message}`);
    } else {
      logger.info('Subscribed to Redis channel: lexshift:progress');
    }
  });

  // When the worker publishes a status update, this fires
  subscriber.on('message', (channel, message) => {
    try {
      // Worker sends: { docId, userId, status }
      const { docId, userId, status } = JSON.parse(message);

      // Emit the update ONLY to the specific user's room
      io.to(userId).emit('progressUpdate', { docId, status });

      logger.info(`progressUpdate emitted → userId: ${userId} | status: ${status}`);
    } catch (err) {
      logger.error(`Error parsing progress message: ${err.message}`);
    }
  });

  logger.info('WebSocket server initialized');
  return io;
};

// Export both the init function and the io instance
// io can be imported elsewhere if needed (not required for now)
module.exports = { initializeSockets, getIO: () => io };
