const express = require("express");
const router = express.Router();
const { registerController, loginController } = require("../controllers/auth.controller");



router.post("/register", registerController);
router.route('/login').post(loginController); 

module.exports = router;
