const winston = require("winston");

const { combine, timestamp, errors, json, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  return JSON.stringify({
    level,
    message,
    timestamp,
    stack,
    ...meta,
  });
});

exports.logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: { service: "auth-service" },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});
