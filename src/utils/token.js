const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_EXPIRES }
  );
};

exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRES }
  );
};

exports.hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
