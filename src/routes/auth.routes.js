const express = require("express");
const router = express.Router();
const {protect} = require("../middlewares/auth.middleware");

// Controllers
const {
  registerController,
  loginController,
  logoutController,
  logoutAllController,
  refreshController
} = require("../controllers/auth.controller");

// Routes
router.route("/register").post(registerController);
router.route("/login").post(loginController);
router.route("/refresh").post(protect,refreshController);
router.route("/logout").delete(protect,logoutController);
router.route("/sessions").delete(protect,logoutAllController);

module.exports = router;
