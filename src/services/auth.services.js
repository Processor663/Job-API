const UserModel = require("../models/auth.model");
const TokenModel = require("../models/token.model");
const { hashPassword, comparePassword } = require("../utils/password.util");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const { StatusCodes } = require("http-status-codes");
const { generateVerificationToken } = require("../utils/generateToken.util");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("./email.service");
const crypto = require("crypto");

const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require("../utils/token");
const { logAudit } = require("./audit.service");

// Registration service
exports.register = async (user) => {
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

  const { token, hashedToken } = generateVerificationToken();

  await TokenModel.create({
    userId: newUser._id,
    token: hashedToken,
    type: "emailVerification",
    expiresAt: new Date(
      Date.now() + Number(process.env.EMAIL_VERIFICATION_TOKEN_TTL),
    ), // 1 hour expiry
  });

  // send email
  const verifyURL = `${process.env.CLIENT_URL}/verify-email/${token}`;
  console.log("Verification URL:", verifyURL); // For debugging

  try {
    await sendVerificationEmail(user.email, verifyURL);
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw new AppError(
      "Failed to send verification email. Please try again later.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

// Login service
exports.login = async (credentials) => {
  const user = await UserModel.findOne({ email: credentials.email }).select(
    "+password",
  );

  if (!user) {
    throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  const isMatch = await comparePassword(credentials.password, user.password);

  if (!isMatch)
    throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);

  // Check if email is verified before allowing login
  if (!user.isVerified) {
    throw new AppError(
      "Please verify your email first",
      StatusCodes.UNAUTHORIZED,
    );
  }

  const userPayload = {
    id: user._id,
    role: user.role,
  };

  // Generate tokens and hash refresh token for storage
  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);
  const tokenHash = hashToken(refreshToken);

  // Store hashed refresh token in database with reference to user
  await TokenModel.create({
    userId: user._id,
    token: tokenHash,
    // expiresAt: 34 * 60 * 60 * 1000, // 34 hours
    expiresAt: new Date(Date.now() + Number(process.env.REFRESH_TOKEN_TTL)),
  });

  return { accessToken, refreshToken };
};

// logout service
exports.logout = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken);
  const deletedToken = await TokenModel.findOneAndDelete({
    token: tokenHash,
    type: "refreshToken",
  });

  if (!deletedToken) {
    throw new AppError("Invalid refresh token", StatusCodes.BAD_REQUEST);
  }
};

// To logout from all devices, All refresh tokens for the user would be deleted from the database.
exports.logoutAllSessions = async (userId) => {
  if (!userId)
    throw new AppError(
      "User ID is required to logout from all sessions",
      StatusCodes.BAD_REQUEST,
    );

  const deletedTokens = await TokenModel.deleteMany({
    userId,
    type: "refreshToken",
  });
  if (
    deletedTokens.deletedCount === 0 ||
    deletedTokens.deletedCount === undefined
  ) {
    throw new AppError(
      "No active sessions found for the user",
      StatusCodes.NOT_FOUND,
    );
  }
};

exports.verifyEmail = async (token) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const tokenDoc = await TokenModel.findOneAndDelete({
    token: hashedToken,
    type: "emailVerification",
    expiresAt: { $gt: Date.now() },
  });

  if (!tokenDoc) {
    throw new AppError(
      "Invalid or expired verification token",
      StatusCodes.BAD_REQUEST,
    );
  }

  const user = await UserModel.findById(tokenDoc.userId);

  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  if (user.isVerified) {
    throw new AppError("User already verified", StatusCodes.BAD_REQUEST);
  }

  user.isVerified = true;

  await user.save();
};

exports.forgotPassword = async (email) => {
  const user = await UserModel.findOne({ email });

  // Don't reveal if email exists
  if (!user) {
    return;
  }

  // Delete any existing password reset tokens for the user
  await TokenModel.deleteMany({
    userId: user._id,
    type: "passwordReset",
  });

  const { token, hashedToken } = generateVerificationToken();

  await TokenModel.create({
    userId: user._id,
    token: hashedToken,
    type: "passwordReset",
    expiresAt: new Date(
      Date.now() + Number(process.env.PASSWORD_RESET_TOKEN_TTL),
    ), // 10 min
  });

  const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;
  console.log("Password Reset URL:", resetURL); // For debugging

  try {
    await sendPasswordResetEmail(user.email, resetURL);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new AppError(
      "Failed to send password reset email. Please try again later.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

exports.resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const tokenDoc = await TokenModel.findOneAndDelete({
    token: hashedToken,
    type: "passwordReset",
    expiresAt: { $gt: Date.now() },
  });

  if (!tokenDoc) {
    throw new AppError("Invalid or expired token", StatusCodes.BAD_REQUEST);
  }

  const user = await UserModel.findById(tokenDoc.userId);
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  return user;
};

exports.requestEmailVerification = async (email) => {
  const user = await UserModel.findOne({ email });
  // Don't reveal if email exists
  if (!user) {
    return;
  }

  if (user.isVerified) {
    throw new AppError("Email is already verified", StatusCodes.BAD_REQUEST);
  }

  // delete old verification tokens
  await TokenModel.deleteMany({
    userId: user._id,
    type: "emailVerification",
  });

  const { token, hashedToken } = generateVerificationToken();

  await TokenModel.create({
    userId: user._id,
    token: hashedToken,
    type: "emailVerification",
    expiresAt: new Date(
      Date.now() + Number(process.env.EMAIL_VERIFICATION_TOKEN_TTL),
    ), // 1 hour expiry
  });

  // send email
  const verifyURL = `${process.env.CLIENT_URL}/verify-email/${token}`;
  console.log("Verification URL:", verifyURL); // For debugging

  try {
    await sendVerificationEmail(user.email, verifyURL);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new AppError(
      "Failed to send verification email. Please try again later.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

// Refresh token service with rotation and reuse detection
exports.refresh = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  const tokenHash = hashToken(refreshToken);

  const existingToken = await TokenModel.findOne({
    token: tokenHash,
    userId: decoded.id,
  });

  // Reuse detection
  if (!existingToken) {
    await TokenModel.deleteMany({ userId: decoded.id });
    console.warn(
      `⚠️ Refresh token reuse detected for user ${decoded.id} at ${new Date().toISOString()}`,
    );
    throw new AppError(
      "Refresh token reuse detected. Please login again.",
      StatusCodes.BAD_REQUEST,
    );
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
  if (!ttl)
    throw new AppError(
      "REFRESH_TOKEN_TTL not configured",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );

  await TokenModel.create({
    userId: user._id,
    token: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + ttl),
  });

  return { newAccessToken, newRefreshToken };
};
