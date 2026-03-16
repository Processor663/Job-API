// middlewares/globalErrorHandler.js
const AppError = require("../utils/AppError");
const { StatusCodes } = require("http-status-codes");
require("dotenv").config();
const logger = require("../config/logger"); // Winston logger


// ------------------- DATABASE ERROR HANDLERS -------------------

// Invalid MongoDB ObjectId
const handleDBCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, StatusCodes.BAD_REQUEST);

// Duplicate field error
const handleDBDuplicateFields = (err) => {
  const value = Object.values(err.keyValue).join(", ");
  return new AppError(
    `Duplicate field value: ${value}. Please use another value!`,
    StatusCodes.BAD_REQUEST,
  );
};

// Mongoose validation error
const handleDBValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(
    `Invalid input data: ${errors.join(". ")}`,
    StatusCodes.BAD_REQUEST,
  );
};

// ------------------- JWT ERROR HANDLERS -------------------

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", StatusCodes.UNAUTHORIZED);

const handleJWTExpiredError = () =>
  new AppError(
    "Your token has expired! Please log in again.",
    StatusCodes.UNAUTHORIZED,
  );

// ------------------- SEND ERROR -------------------

const sendErrorDev = (err, req, res, next) => {
    logger.error(err.message, {
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });


  res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, req, res) => {
  // Always log error in production
  logger.error(err.message, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.isOperational ? err.message : "Something went wrong!",
  });
};

// ------------------- GLOBAL ERROR HANDLER -------------------

module.exports = (err, req, res, next) => {
  // Default values
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.isOperational =
  err.isOperational !== undefined ? err.isOperational : false;

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    // Clone error to avoid mutation issues
    let error = Object.create(err);

    // Mongoose / MongoDB errors
    if (error.name === "CastError") error = handleDBCastError(error);
    if (error.code === 11000) error = handleDBDuplicateFields(error);
    if (error.name === "ValidationError")
      error = handleDBValidationError(error);

    // JWT errors
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
