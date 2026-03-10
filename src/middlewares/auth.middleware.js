const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/AppError");
require("dotenv").config();

exports.protect = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token)
    return next(new AppError("Unauthorized: No token provided", StatusCodes.UNAUTHORIZED));

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Token verification failed:", error);
    return next(new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED));
  }
};

exports.authorize = (req, res, next) => {
  if (req.user?.role?.toLowerCase() !== "admin") {
    return next(new AppError("Forbidden", StatusCodes.FORBIDDEN));
  } else {
    next();
  }
};

exports.authorize =
  (roles = []) =>
  (req, res, next) => {
  
    if (!req.user) {
      return next(new AppError("Unauthorized", StatusCodes.UNAUTHORIZED));    
    }

    // Check if the user's role is allowed
    if (
      !roles.map((r) => r.toLowerCase()).includes(req.user.role?.toLowerCase())
    ) {
      return next(new AppError("Forbidden", StatusCodes.FORBIDDEN));
    }

    next();
  };
