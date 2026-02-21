const UserModel = require("../models/auth.model");
const RefreshTokenModel = require("../models/token.model");
const { hashPassword, comparePassword } = require("../utils/password.util");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require("../utils/token");

// Registration service
exports.register = async (user) => {
  try {
    console.log("registration successful");
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: user.email });
    if (existingUser) {
      throw new Error("User already exists");
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
  } catch (error) {
    throw new Error("Registration failed: " + error.message);
  }
};

// Login service
exports.login = async (credentials) => {
  try {
    const user = await UserModel.findOne({ email: credentials.email }).select(
      "+password",
    );

    if (!user) throw new Error("Invalid credentials");
    const isMatch = await comparePassword(credentials.password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");
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
    console.log(parseInt(process.env.REFRESH_TOKEN_TTL));

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error("Login failed: " + error.message);
  }
};

// logout service
exports.logout = async (refreshToken) => {
  try {
    if (!refreshToken) throw new Error("Refresh token is required for logout");

    const tokenHash = hashToken(refreshToken);
    await RefreshTokenModel.findOneAndDelete({ tokenHash });
  } catch (error) {
    throw new Error("Logout failed: " + error.message);
  }
};

// To logout from all devices, All refresh tokens for the user would be deleted from the database.
exports.logoutAllSessions = async (userId) => {
  try {
    if (!userId)
      throw new Error("User ID is required to logout from all sessions");

    // const tokenHash = hashToken(refreshToken);
    await RefreshTokenModel.deleteMany({ user: userId });
  } catch (error) {
    throw new Error("Logout failed: " + error.message);
  }
};

// Refresh token service with rotation and reuse detection
exports.refresh = async (refreshToken) => {
  try {   
    if (!refreshToken) throw new Error("Refresh token is required");

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
      throw new Error("Refresh token reuse detected. Please login again.");
    }

    // Manual expiry check (important)
    if (new Date() > existingToken.expiresAt) {
      await existingToken.deleteOne();
      throw new Error("Refresh token expired");
    }

    // Rotation
    await existingToken.deleteOne();

    const user = await UserModel.findById(decoded.id);
    if (!user) throw new Error("Invalid user");

    const payload = { id: user._id, role: user.role };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const ttl = Number(process.env.REFRESH_TOKEN_TTL);
    if (!ttl) throw new Error("REFRESH_TOKEN_TTL not configured");

    await RefreshTokenModel.create({
      user: user._id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + ttl),
    });

    return { newAccessToken, newRefreshToken };
    } catch (err) {
    throw new Error(err.message);
}}