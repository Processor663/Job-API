const express = require("express");
const router = express.Router();
const {protect} = require("../middlewares/auth.middleware");

// Controllers
const {
//   registerController,
//   loginController,
//   logoutController,
//   logoutAllController,
//   refreshController
} = require("../controllers/jobs.controller");

// Routes
// router.route("/jobs").post();


module.exports = router;
