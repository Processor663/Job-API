const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth.middleware");

// Controllers
const {
  JobCreate,
  jobUpdate,
  deleteJob,
  getJobs,
} = require("../controllers/jobs.controller");

// Routes
router.route("/jobs").post([protect, authorize(["admin"])], JobCreate).get(getJobs);
router
  .route("/jobs/:id")
  .delete([protect, authorize(["admin"])], deleteJob)
  .patch([protect, authorize(["admin"])], jobUpdate);

module.exports = router;
