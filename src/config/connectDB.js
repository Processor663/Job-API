const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { StatusCodes } = require("http-status-codes");
const logger = require("./logger");

const connectDB = async (URI) => {
  if (!URI) {
    throw new AppError(
      "MONGO_URI is not defined",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
  try {
    await mongoose.connect(URI)
    console.log("MongoDB connected successfully");
    logger.info("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    logger.error("Error connecting to MongoDB", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1); // Exit app if DB fails
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect()
    console.log("MongoDB disconnected successfully");
    logger.info("MongoDB disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error.message);
    logger.error("Error disconnecting from MongoDB", {
      error: error.message,
      stack: error.stack,
    }); 
    process.exit(1); // Exit app if DB fails
  }
};

module.exports = { connectDB, disconnectDB };
