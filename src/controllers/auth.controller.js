const { StatusCodes } = require("http-status-codes");
const { register, login, logout, logoutAll } = require("../services/auth.services");
require("dotenv").config();

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
exports.registerController = async (req, res) => {
  const userData = req.body;

  if (!userData.name || !userData.email || !userData.password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Please provide name, email and password" });
  }
  try {
    const { user, accessToken, refreshToken } = await register(userData);
    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
   
    res.status(StatusCodes.CREATED).json({ success: true, user});
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
    console.error(error);
  }
};

// Controller for user login
exports.loginController = async (req, res) => {
  console.log("login Successful");
  const userData = req.body;
    try {
      if (!userData.email || !userData.password) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ success: false, message: "Please provide email and password" });
      }

      const { accessToken, refreshToken } = await login(userData);

      res
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .status(StatusCodes.OK)
        .json({success: true, message: "Logged in successfully" });
    } catch (err) {
      res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: err.message });
    }
  };



// Controller for user logout
exports.logoutController = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    await logout(refreshToken);

    res.clearCookie("accessToken", accessCookieOptions);
    res.clearCookie("refreshToken", refreshCookieOptions);

    return res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success: false, message: "Failed to log out" });
  }
};


// Controller for logging out from all devices
exports.logoutAllController = async (req, res) => {
  const userId = req.user?.id; // from auth middleware
    try {
      await logoutAll(userId);
      res
        .clearCookie("accessToken", accessCookieOptions)
        .clearCookie("refreshToken", refreshCookieOptions)
        .sendStatus(StatusCodes.NO_CONTENT)
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  };



// exports.refresh = async (req, res) => {
//   try {
//     const { newAccessToken, newRefreshToken } =
//       await authService.refresh(req.cookies.refreshToken);

//     res
//       .cookie("accessToken", newAccessToken, cookieOptions)
//       .cookie("refreshToken", newRefreshToken, cookieOptions)
//       .json({ message: "Token refreshed" });
//   } catch (err) {
//     res.status(403).json({ message: err.message });
//   }
// };

