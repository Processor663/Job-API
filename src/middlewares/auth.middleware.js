const { statusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
dotenv.config();



// exports.protect = (req, res, next) => {
//   const token = req.cookies.accessToken;

//   if (!token)
//     return res
//       .status(statusCodes.UNAUTHORIZED)
//       .json({ message: "Unauthorized" });

//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
//     req.user = decoded;
//     next();
//   } catch {
//     return res
//       .status(statusCodes.UNAUTHORIZED)
//       .json({ message: "Invalid or expired token" });
//   }
// };

// exports.authorize = (roles) => (req, res, next) => {
//   if (!roles.includes(req.user.role)) {
//     return res.status(statusCodes.FORBIDDEN).json({ message: "Forbidden" });
//   } else {
//     next();
//   } 
// }