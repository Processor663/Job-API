const { statusCodes } = require("http-status-codes");
const { register } = require("../services/auth.services");

const registerController = async (req, res) => {
  const { name, email, password } = req.body;
  const userData = { name, email, password };

  if (!name || !email || !password) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .json({ message: "Please provide name, email and password" });
  }
  try {
    await register(userData);
    res.status(statusCodes.CREATED).json(userData);
  } catch (error) {
    console.error(error);
  }
};

const loginController = (res, req) => {
  console.log("login");
};

module.exports = { registerController, loginController };
