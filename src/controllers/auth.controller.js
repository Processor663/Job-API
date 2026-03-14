const { StatusCodes } = require("http-status-codes");
const {
  register,
  login,
  logout,
  logoutAllSessions,
  verifyEmail,
  forgotPassword,
  resetPassword,
  requestEmailVerification,
  refresh,
} = require("../services/auth.services");
require("dotenv").config();
const AppError = require("../utils/AppError");
const asyncHandler = require("express-async-handler");


// check if we are in production environment to set secure cookie options
const isProduction = process.env.NODE_ENV === "production";

// Cookie options for access and refresh tokens
const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // sameSite: isProduction ? "strict" : "lax",
  sameSite: "none",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

// cookie options for refresh token with longer expiration
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "none",
  // sameSite: isProduction ? "strict" : "lax",
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in ms
};

// Controller for user registration
exports.registerController = asyncHandler(async (req, res) => {
  const userData = req.body;

  if (!userData.name || !userData.email || !userData.password) {
    throw new AppError(
      "Please, provide name, email, and password",
      StatusCodes.BAD_REQUEST,
    );
  }
  // const { _user, accessToken, refreshToken } = await register(userData);
   await register(userData);
  /* res.cookie("accessToken", accessToken, accessCookieOptions);
   res.cookie("refreshToken", refreshToken, refreshCookieOptions); */

  res.status(StatusCodes.CREATED).json({ success: true, message: "User registered successfully. Please check your email to verify your account."});
});

// Controller for user login
exports.loginController = asyncHandler(async (req, res) => {
  const userData = req.body;

  if (!userData.email || !userData.password) {
    throw new AppError(
      "Please provide email and password",
      StatusCodes.BAD_REQUEST,
    );
  }

  const { accessToken, refreshToken } = await login(userData);
  res
    .cookie("accessToken", accessToken, accessCookieOptions)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .status(StatusCodes.OK)
    .json({ success: true, message: "Logged in successfully" });
  console.log("login Successful");
});

// Controller for user logout
exports.logoutController = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new AppError(
      "Refresh token is required for logout",
      StatusCodes.BAD_REQUEST,
    );
  }

  await logout(refreshToken);

  res.clearCookie("accessToken", accessCookieOptions);
  res.clearCookie("refreshToken", refreshCookieOptions);

  return res.sendStatus(StatusCodes.NO_CONTENT);
});

// Controller for logging out from all devices
exports.logoutAllController = asyncHandler(async (req, res) => {
  const userId = req.user?.id; // from auth middleware
  if (!userId) {
    throw new AppError(
      "User ID is required to logout from all sessions",
      StatusCodes.BAD_REQUEST,
    );
  }
    await logoutAllSessions(userId);
    res
      .clearCookie("accessToken", accessCookieOptions)
      .clearCookie("refreshToken", refreshCookieOptions)
      .sendStatus(StatusCodes.NO_CONTENT);
});

exports.verifyEmailController = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) {
    throw new AppError("Verification token is required", StatusCodes.BAD_REQUEST);
  }
 
  await verifyEmail(token);

  res.status(StatusCodes.OK).json({ success: true, message: "Email verified successfully" });
});

exports.forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError("Email is required", StatusCodes.BAD_REQUEST);
  }

  await forgotPassword(email);
 
  res.status(StatusCodes.OK).json({ success: true, message: "Password reset link sent to your email" });
});

exports.resetPasswordController = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    throw new AppError("Token and new password are required", StatusCodes.BAD_REQUEST);
  }

   await resetPassword(token, newPassword);
 
  res.status(StatusCodes.OK).json({ success: true, message: "Password reset successfully" });
});

exports.requestEmailVerificationController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError("Email is required", StatusCodes.BAD_REQUEST);
  }
  await requestEmailVerification(email);
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: "Verification email sent" });
});

exports.refreshController = asyncHandler(async (req, res) => {
   if (!req.cookies?.refreshToken) throw new AppError("Refresh token is required", StatusCodes.BAD_REQUEST);
  
    const { newAccessToken, newRefreshToken } = await refresh(
      req.cookies.refreshToken,
    );
    res
      .cookie("accessToken", newAccessToken, accessCookieOptions)
      .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
      .status(StatusCodes.OK)
      .json({ success: true, message: "Token refreshed" });
});

