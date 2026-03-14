const express = require("express");
const router = express.Router();
const {protect} = require("../middlewares/auth.middleware");

// Controllers
const {
  registerController,
  loginController,
  logoutController,
  logoutAllController,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordController,
  requestEmailVerificationController, 
  refreshController
} = require("../controllers/auth.controller");

// Routes
router.route("/verify-email/:token").get(verifyEmailController);
router.route("/register").post(registerController);
router.route("/login").post(loginController);
router.route("/forgot-password").post(forgotPasswordController);
router.route("/reset-password").post(resetPasswordController);
router.route("/request-email").post(requestEmailVerificationController);
router.route("/refresh").post(protect,refreshController);
router.route("/logout").delete(protect,logoutController);
router.route("/sessions").delete(protect,logoutAllController);

module.exports = router;
