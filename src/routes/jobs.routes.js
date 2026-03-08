const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");

// Controllers
const {
  JobCreate,
  jobUpdate,
  deleteJob,
  getJobs,
} = require("../controllers/jobs.controller");

// Routes
router.route("/jobs").post(protect, JobCreate).get(getJobs);
router.route("/jobs/:id").delete(protect, deleteJob).patch(protect, jobUpdate);

module.exports = router;
