/**
 * @file src/utils/logger.js
 * @description Winston logger — production-grade structured logging.
 *
 */

const winston = require('winston');
const path = require('path');

const { combine, timestamp, json, colorize, printf } = winston.format;

// Dev-friendly console format: [2026-05-06 00:15:00] INFO: message
const devFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
  transports: [
    // Always write errors to error.log
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
    }),
  ],
});

// In development — also log to console with readable format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        devFormat
      ),
    })
  );
}

module.exports = logger;
