const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

exports.generateAccessToken = (payload) => {
     const secret = process.env.ACCESS_SECRET;
    if (!secret) {
      throw new Error("ACCESS_SECRET is missing in environment variables!");
    }
    return jwt.sign({id: payload.name}, secret, { expiresIn: process.env.ACCESS_EXPIRES  });
  };
  // return jwt.sign(
  //   { id: user.id, role: user.role },
  //   process.env.ACCESS_SECRET,
  //   { expiresIn: process.env.ACCESS_EXPIRES }
  // );
// };

  exports.generateRefreshToken = (payload) => {
    const secret = process.env.REFRESH_SECRET;
    if (!secret) {
      throw new Error("REFRESH_SECRET is missing in environment variables!");
    }
    return jwt.sign({id: payload.name}, secret, { expiresIn: process.env.REFRESH_EXPIRES  });
  };

  // return jwt.sign(
  //   { id: user.id },
  //   process.env.REFRESH_SECRET,
  //   { expiresIn: process.env.REFRESH_EXPIRES }
  // );


exports.hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
