const UserModel = require("../models/auth.model");
const TokenModel = require("../models/token.model");
const { hashPassword, comparePassword } = require("../utils/password.util");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const { StatusCodes } = require("http-status-codes");
const { generateToken } = require("../utils/token");
const { sendVerificationEmail } = require("./email.service");
const crypto = require("crypto");

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

  const { token, hashedToken } = generateToken();

  // store token in separate collection
  await TokenModel.create({
    userId: user._id,
    token: hashedToken,
    type: "emailVerification",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
  });

  // send email
  const verifyURL = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await sendVerificationEmail(user.email, verifyURL);

  // Payload for tokens
  // const userPayload = {
  //   id: newUser._id,
  //   role: user.role,
  // };

  // Generate tokens and hash refresh token for storage
  // const accessToken = generateAccessToken(userPayload);
  // const refreshToken = generateRefreshToken(userPayload);
  // const TokenHash = hashToken(refreshToken);

  // TokenModel schema has user field which is a reference to UserModel.
  // TokenModel.create({
  //   user: newUser._id,
  //   tokenHash: TokenHash,
  //   expiresAt: new Date(Date.now() + Number(process.env.REFRESH_TOKEN_TTL)),
  // });

  // Don't return password in response
  // const { password: _password, _id: id, ...userData } = newUser.toObject();
  // const safeUser = { id, ...userData };

  // Return user data and tokens
  // return { user: safeUser, accessToken, refreshToken };
  return true;
});

// Login service
exports.login = asyncHandler(async (credentials) => {
  const user = await UserModel.findOne({ email: credentials.email }).select(
    "+password",
  );

  if (!user)
    throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);

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
  await TokenModel.findOneAndDelete({ tokenHash });
});

// To logout from all devices, All refresh tokens for the user would be deleted from the database.
exports.logoutAllSessions = asyncHandler(async (userId) => {
  try {
    if (!userId)
      throw new AppError(
        "User ID is required to logout from all sessions",
        StatusCodes.BAD_REQUEST,
      );

    // const tokenHash = hashToken(refreshToken);
    await TokenModel.deleteMany({ user: userId });
  } catch (error) {
    throw new Error("Logout failed: " + error.message);
  }
});

exports.verifyEmail = async (token) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // find token
  const tokenDoc = await TokenModel.findOne({
    token: hashedToken,
    type: "emailVerification",
    expiresAt: { $gt: Date.now() },
  });

  if (!tokenDoc) {
   throw new AppError(
      "Invalid or expired token",
      StatusCodes.BAD_REQUEST,
    );
  }

  const user = await UserModel.findById(tokenDoc._id);
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  if (user.isVerified) {
    throw new AppError("User already verified", StatusCodes.BAD_REQUEST);
  }

  user.isVerified = true;
  await user.save();

  // delete token after use
  await tokenDoc.deleteOne();

  return true;
};

exports.resetPassword = asyncHandler(async (email) => {
  const user = await UserModel.findOne({ email});
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  const { token, hashedToken } = generateToken();

  await TokenModel.create({
    userId: user._id,
    tokenHash: hashedToken,
    type: "passwordReset",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
  });

  const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendPasswordResetEmail(user.email, resetURL);
});

// Refresh token service with rotation and reuse detection
exports.refresh = asyncHandler(async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  const tokenHash = hashToken(refreshToken);

  const existingToken = await TokenModel.findOne({
    tokenHash,
    user: decoded.id,
  });

  // Reuse detection
  if (!existingToken) {
    await TokenModel.deleteMany({ user: decoded.id });
    console.warn(
      `⚠️ Refresh token reuse detected for user ${decoded.id} at ${new Date().toISOString()}`,
    );
    throw new AppErrorError(
      "Refresh token reuse detected. Please login again.",
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
    user: user._id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + ttl),
  });

  return { newAccessToken, newRefreshToken };
});
