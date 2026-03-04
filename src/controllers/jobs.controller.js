const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/AppError");
const asyncHandler = require("express-async-handler");

// Jobs Model
const { createJob, deleteJob, getJobs } = require("../services/jobs.services");

//Get Jobs controller
exports.getJobs = asyncHandler (async (req, res) => {
    // Get jobs from service Layer
    const jobs = await getJobs();
    if (!jobs || jobs.length === 0) {
     throw new AppError("No jobs found", StatusCodes.NOT_FOUND);
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
});


exports.JobCreate = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobData = req.body;
    console.log(jobData)

    // Validate input
    if (!jobData || Object.keys(jobData).length === 0 || !userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Job data is required",
      });
    }

    // Create job from service Layer
    const createdJob = await createJob(jobData, userId);
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Job created successfully",
      data: createdJob,
    });

  } catch (err) {
    console.error("Job creation error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create job",
    });
  }
};


// Delete Job Controller
exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    // Validate input
    if (!jobId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Job ID is required",
      });
    }

    // Delete Job from Service Layer
    const deletedJob = await deleteJob(jobId);
    if(!deletedJob) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "Job not found",
        });
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Job deleted successfully",
      data: deletedJob,
    });

  } catch (err) {
    console.error("Delete Job Error:", err.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete job",
    });
  }
};