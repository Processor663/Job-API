const express = require("express");
const router = express.Router();
const {protect} = require("../middlewares/auth.middleware");

// Controllers
const {JobCreate, deleteJob} = require("../controllers/jobs.controller");

// Routes
router.route("/jobs").post(protect, JobCreate);

router.route("/jobs/:id").delete(protect, deleteJob);


module.exports = router;
