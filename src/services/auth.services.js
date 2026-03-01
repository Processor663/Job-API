const UserModel = require("../models/auth.model");
const RefreshTokenModel = require("../models/token.model");
const { hashPassword, comparePassword } = require("../utils/password.util");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const { StatusCodes } = require("http-status-codes");

const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require("../utils/token");

// Registration service
exports.register = asyncHandler(async (user) => {

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: user.email });
    if (existingUser) {
      throw new AppError("User already exists", StatusCodes.CONFLICT);
    }

    // Hash password before saving
    const hashedPassword = await hashPassword(user.password);

    // Create new user
    const newUser = await UserModel.create({
      ...user,
      password: hashedPassword,
    });

    // Payload for tokens
    const userPayload = {
      id: newUser._id,
      role: user.role,
    };

    // Generate tokens and hash refresh token for storage
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);
    const TokenHash = hashToken(refreshToken);

    // RefreshTokenModel schema has user field which is a reference to UserModel.
    RefreshTokenModel.create({
      user: newUser._id,
      tokenHash: TokenHash,
      expiresAt: new Date(Date.now() + Number(process.env.REFRESH_TOKEN_TTL)),
    });

      // Don't return password in response
    const { password: _password, _id: id, ...userData } = newUser.toObject();
    const safeUser = { id, ...userData };

    // Return user data and tokens
    return { user: safeUser, accessToken, refreshToken };
 
});

// Login service
exports.login = asyncHandler(async (credentials) => {
 
    const user = await UserModel.findOne({ email: credentials.email }).select(
      "+password",
    );

    if (!user) throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
    const isMatch = await comparePassword(credentials.password, user.password);
    if (!isMatch) throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
    const userPayload = {
      id: user._id,
      role: user.role,
    };

    // Generate tokens and hash refresh token for storage
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);
    const tokenHash = hashToken(refreshToken);

    // Store hashed refresh token in database with reference to user
    await RefreshTokenModel.create({
      user: user._id,
      tokenHash,
      // expiresAt: 34 * 60 * 60 * 1000, // 34 hours
      expiresAt: new Date(Date.now() + Number(process.env.REFRESH_TOKEN_TTL)),
    });
  

    return { accessToken, refreshToken };

});

// logout service
exports.logout = asyncHandler(async (refreshToken) => {

    const tokenHash = hashToken(refreshToken);
    await RefreshTokenModel.findOneAndDelete({ tokenHash });
});

// To logout from all devices, All refresh tokens for the user would be deleted from the database.
exports.logoutAllSessions = asyncHandler(async (userId) => {
  try {
    if (!userId)
      throw new AppError("User ID is required to logout from all sessions", StatusCodes.BAD_REQUEST);

    // const tokenHash = hashToken(refreshToken);
    await RefreshTokenModel.deleteMany({ user: userId });
  } catch (error) {
    throw new Error("Logout failed: " + error.message);
  }
});

// Refresh token service with rotation and reuse detection
exports.refresh = asyncHandler(async (refreshToken) => { 

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const tokenHash = hashToken(refreshToken);

    const existingToken = await RefreshTokenModel.findOne({
      tokenHash,
      user: decoded.id,
    });

    // Reuse detection
    if (!existingToken) {
      await RefreshTokenModel.deleteMany({ user: decoded.id });
      console.warn(
        `⚠️ Refresh token reuse detected for user ${decoded.id} at ${new Date().toISOString()}`,
      );
      throw new AppErrorError("Refresh token reuse detected. Please login again.");
    }

    // Manual expiry check (important)
    if (new Date() > existingToken.expiresAt) {
      await existingToken.deleteOne();
      throw new AppError("Refresh token expired", StatusCodes.UNAUTHORIZED);
    }

    // Rotation
    await existingToken.deleteOne();

    const user = await UserModel.findById(decoded.id);
    if (!user) throw new AppError("Invalid user", StatusCodes.UNAUTHORIZED);

    const payload = { id: user._id, role: user.role };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const ttl = Number(process.env.REFRESH_TOKEN_TTL);
    if (!ttl) throw new AppError("REFRESH_TOKEN_TTL not configured", StatusCodes.INTERNAL_SERVER_ERROR);

    await RefreshTokenModel.create({
      user: user._id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + ttl),
    });

    return { newAccessToken, newRefreshToken };

});