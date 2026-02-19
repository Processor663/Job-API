const express = require("express");
const router = express.Router();
const {
  registerController,
} = require("../controllers/auth.controller");

router.route("/register").post(registerController);
// router.route("/login").post(loginController);
// router.route("/logout").post(logoutController);
// router.route("/logout-all").post(logoutAllController);

module.exports = router;
