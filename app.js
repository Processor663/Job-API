const express = require("express");
const app = express();

require("dotenv").config();
const cookieParser = require('cookie-parser');

// connectDB
const {connectDB, disconnectDB} = require("./src/config/connectDB");

// Request Logger
const requestLogger = require("./src/middlewares/requestLogger");

// Global error handler
const globalErrorHandler = require("./src/middlewares/globalErrorHandler"); 

// AppError class for custom error handling
const AppError = require("./src/utils/AppError");

// auth routes
const authRoutes = require("./src/routes/auth.routes");
const jobsRoutes = require("./src/routes/jobs.routes");


const dns = require("dns");
const { StatusCodes } = require("http-status-codes");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const PORT = process.env.PORT || 3500;

// Middlewares
app.use(cookieParser());
app.use(express.json());

// HTTP Request logging
app.use(requestLogger);


// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1', jobsRoutes)

// Catch-all for this router only
app.use((req, res, next) => {
  // res.status(404).json({ message: "Route not found" });
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, StatusCodes.NOT_FOUND));
});


// Global error handling middleware (it should be defined after all routes and other middlewares)
app.use(globalErrorHandler);

let server; // store server reference

// start server function with DB connection
const serverStart = async () => {
  try {
    // Connect to DB
    await connectDB(process.env.MONGO_URI)
    server = app.listen(PORT, () => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`Server running on port ${PORT}`);
      }
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (code = 0) => {
  console.log("Shutting down server...");

  // Safety net: force exit after 10 seconds
  const forceExit = setTimeout(() => {
    console.error("Force shutdown (timeout)");
    process.exit(1);
  }, 10000);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }

    await disconnectDB();

    clearTimeout(forceExit); // cancel the force exit
    console.log("Shutdown complete");
    process.exit(code);
  } catch (err) {
    console.error("Error during shutdown:", err.message);
    process.exit(1);
  }
};

// Process signals & errors
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  shutdown(1);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown(1);
});

// Start the server
serverStart();