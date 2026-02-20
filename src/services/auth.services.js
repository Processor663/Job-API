const UserModel = require("../models/auth.model");
const RefreshTokenModel = require("../models/token.model");
const { hashPassword, comparePassword } = require("../utils/password.util");
require("dotenv").config();

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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Don't return password in response
    const { password: _password, _id: id, ...userData } = newUser.toObject();
    const safeUser = { id, ...userData };
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
    console.log(user);

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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

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
exports.logoutAll = async (userId) => {
  try {
    if (!userId) throw new Error("User ID is required for logout all");
    
    const tokenHash = hashToken(refreshToken);
    await RefreshTokenModel.deleteMany({ user: userId });
  } catch (error) {
    throw new Error("Logout failed: " + error.message);
  }
};




// exports.refresh = async (refreshToken) => {
//   const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
//   const tokenHash = hashToken(refreshToken);
//   const existingToken = await RefreshToken.findOne({
//     tokenHash,
//     user: decoded.id,
//   });
//   if (!existingToken) {
//     // Token reuse detected
//     await RefreshToken.deleteMany({ user: decoded.id });
//     throw new Error("Refresh token reuse detected. Please login again.");
//   }
//   // Delete old refresh token (rotation)
//   await existingToken.deleteOne();
//   const user = await UserModel.findById(decoded.id);
//   const newAccessToken = generateAccessToken(user);
//   const newRefreshToken = generateRefreshToken(user);
//   const newTokenHash = hashToken(newRefreshToken);
//   await RefreshToken.create({
//     user: user._id,
//     tokenHash: newTokenHash,
//     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//   });
//   return { newAccessToken, newRefreshToken };
// };





// refresh updated by chat GPT

// exports.refresh = async (refreshToken, deviceInfo) => {
//   let decoded;
//   try {
//     decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
//   } catch (err) {
//     throw new Error("Invalid or expired refresh token");
//   }

//   const tokenHash = hashToken(refreshToken);
//   const existingToken = await RefreshToken.findOne({
//     tokenHash,
//     user: decoded.id,
//   });

//   if (!existingToken) {
//     // Token reuse detected
//     await RefreshToken.deleteMany({ user: decoded.id });
//     throw new Error("Refresh token reuse detected. Please login again.");
//   }

//   // Rotate token
//   await existingToken.deleteOne();

//   const user = await UserModel.findById(decoded.id);
//   if (!user) throw new Error("UserModel not found");

//   const newAccessToken = generateAccessToken(user);
//   const newRefreshToken = generateRefreshToken(user);
//   const newTokenHash = hashToken(newRefreshToken);

//   await RefreshToken.create({
//     user: user._id,
//     tokenHash: newTokenHash,
//     deviceInfo, // optional: track device/session
//     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//   });

//   return { newAccessToken, newRefreshToken };
// };
