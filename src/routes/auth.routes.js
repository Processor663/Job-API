const express = require("express");
const router = express.Router();
const {protect} = require("../middlewares/auth.middleware");
const {
  registerController,
  loginController,
  logoutController,
  logoutAllController,
} = require("../controllers/auth.controller");

router.route("/register").post(registerController);
router.route("/login").post(loginController);
router.route("/logout").delete(protect,logoutController);
router.route("/sessions").delete(protect,logoutAllController);

module.exports = router;
