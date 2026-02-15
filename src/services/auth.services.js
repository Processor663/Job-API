const UserModel = require("../models/auth.model");
const RefreshTokenModel = require("../models/token.model");
const { hashPassword, comparePassword } = require("../utils/password.util");
require("dotenv").config();

const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require("../utils/token");

exports.register = async ({ name, email, role, password }) => {
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }
  const hashedPassword = await hashPassword(password);
  const user = await UserModel.create({
    name,
    email,
    role,
    password: hashedPassword,
  });

  
  console.log("registration successful");
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const TokenHash = hashToken(refreshToken);
  RefreshTokenModel.create({
    user: user._id,
    tokenHash: TokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return { user, accessToken, refreshToken };
};

exports.login = async ({ name, email, role, password }) => {
  //   const user = await UserModel.findOne({ email }).select("+password");
  //   if (!user) throw new Error("Invalid credentials");
  //   const isMatch = await user.comparePassword(password, user.password);
  //   if (!isMatch) throw new Error("Invalid credentials");
  //   const accessToken = generateAccessToken(user);
  //   const refreshToken = generateRefreshToken(user);
  //   const tokenHash = hashToken(refreshToken);
  //   await RefreshToken.create({
  //     user: user._id,
  //     tokenHash,
  //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  //   });
  //   return { accessToken, refreshToken };
  // };
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
};

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

// export const logout = async (req, res) => {
//   const token = req.cookies.refreshToken;

//   if (!token) return res.sendStatus(204);

//   const tokenHash = hashToken(token);

//   await RefreshToken.findOneAndDelete({ tokenHash });

//   res.clearCookie('refreshToken');

//   res.sendStatus(204);
// };

// };
