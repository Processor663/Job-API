const { StatusCodes } = require("http-status-codes");
const { register, login } = require("../services/auth.services");
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
const registerController = async (req, res) => {
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
const loginController = async (req, res) => {
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





// const logoutController = async (req, res) => {
//   await authService.logout(req.cookies.refreshToken);
//  res.clearCookie("accessToken");
//   res.clearCookie("refreshToken");
//   res.json({ message: "Logged out" });
// };




// const logoutAllController = (req, res) => {
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
  // console.log("logout all");
// };

// module.exports = { registerController, loginController, logoutController, logoutAllController };
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

