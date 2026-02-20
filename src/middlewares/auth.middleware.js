const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
require("dotenv").config();



exports.protect = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch {
    console.log("Token verification failed:", error);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid or expired token" });
  }
};

// exports.authorize = (roles) => (req, res, next) => {
//   if (!roles.includes(req.user.role)) {
//     return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
//   } else {
//     next();
//   } 
// }