const { StatusCodes } = require("http-status-codes");
const { register, login } = require("../services/auth.services");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // sameSite: isProduction ? "strict" : "lax",
  sameSite: "none",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "none",
  // sameSite: isProduction ? "strict" : "lax",
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in ms
};

const registerController = async (req, res) => {
  const { name, email, role, password } = req.body;
  const userData = { name, email, role, password };

  if (!name || !email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Please provide name, email and password" });
  }
  try {
    const { user, accessToken, refreshToken } = await register(userData);
    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    const updatedUser = {
     name: user.name,
     email: user.email,
     role: user.role, 
    };
    res.status(StatusCodes.CREATED).json({ user: updatedUser, accessToken });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
    console.error(error);
  }
};

const loginController = (req, res) => {
  // const { name, email, role, password } = req.body;
  // const userData = { name, email, role, password };
  //   try {
  //     const { accessToken, refreshToken } = await authService(userData);

  //     res
  //       .cookie("accessToken", accessToken, cookieOptions)
  //       .cookie("refreshToken", refreshToken, cookieOptions)
  //       .json({ message: "Logged in" });
  //   } catch (err) {
  //     res.status(401).json({ message: err.message });
  //   }
  // };
  console.log("login");
};

module.exports = { registerController, loginController };

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

// exports.logout = async (req, res) => {
//   await authService.logout(req.cookies.refreshToken);
//   res.clearCookie("accessToken");
//   res.clearCookie("refreshToken");
//   res.json({ message: "Logged out" });
// };
