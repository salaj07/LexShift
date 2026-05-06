/**
 * @file src/features/converter/hooks/useConverterSocket.js
 * @description Imperative socket hook — connect/disconnect tied to job lifecycle.
 *
 * Lifecycle:
 *   connect(userId) → called when user uploads a file
 *   disconnect()    → called when download completes, job fails, or user resets
 *
 * This is intentionally NOT auto-connected on mount — the socket only exists
 * while a conversion job is in flight.
 *
 * Note: onProgressRef pattern ensures the socket listener always calls the
 * latest version of onProgress even across React re-renders (avoids stale closure).
 */

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * @param {Function} onProgress - Callback: (docId, status) => void
 * @returns {{ connect: Function, disconnect: Function }}
 */
const useConverterSocket = (onProgress) => {
  const socketRef = useRef(null);

  // Always keep ref pointing to latest onProgress — avoids stale closure in socket listener
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  });

  /**
   * Connect to socket and join the user's private room.
   * Safe to call multiple times — skips if already connected.
   * @param {string} userId
   */
  const connect = (userId) => {
    if (!userId) return;
    if (socketRef.current?.connected) return; // already connected

    socketRef.current = io('http://localhost:3000', {
      // Start with HTTP polling (always works), auto-upgrade to WebSocket
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      // Join private room so we only receive updates for THIS user's jobs
      socketRef.current.emit('joinRoom', userId);
    });

    socketRef.current.on('progressUpdate', ({ docId, status }) => {
      // Always calls latest onProgress — not the stale closure from when socket was created
      onProgressRef.current(docId, status);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  };

  /**
   * Disconnect the socket and clean up.
   * Called when the job finishes (download) or is reset/failed.
   */
  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // Safety net: disconnect if component unmounts while a job is still running
  useEffect(() => {
    return () => disconnect();
  }, []);

  return { connect, disconnect };
};

export default useConverterSocket;
