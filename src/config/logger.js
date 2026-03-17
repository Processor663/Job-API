const winston = require("winston");
require("winston-daily-rotate-file");

const { combine, timestamp, errors, printf, json } = winston.format;

// Custom log format (as JSON string)
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  return JSON.stringify({
    level,
    message,
    timestamp,
    stack,
    ...meta,
  });
});

// Daily rotate file transport
const dailyRotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "info", // only log info and above
  format: combine(timestamp(), errors({ stack: true }), logFormat),
});

// Error-specific log file
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: "logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "error",
  format: combine(timestamp(), errors({ stack: true }), logFormat),
});

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: { service: "backend-service" },
  transports: [
    new winston.transports.Console({
      format: combine(timestamp(), errors({ stack: true }), logFormat),
    }),
    dailyRotateTransport,
    errorFileTransport,
  ],
});

module.exports = logger;
