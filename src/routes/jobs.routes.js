const express = require("express");
const router = express.Router();
const {protect} = require("../middlewares/auth.middleware");

// Controllers
const {JobCreate, deleteJob, getJobs} = require("../controllers/jobs.controller");

// Routes
router.route("/jobs").post(protect, JobCreate).get(getJobs);
router.route("/jobs/:id").delete(protect, deleteJob);


module.exports = router;
