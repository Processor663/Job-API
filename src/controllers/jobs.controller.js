const { StatusCodes } = require("http-status-codes");

// Jobs Model
const { createJob, deleteJob, getJobs } = require("../services/jobs.services");

//Get Jobs controller
exports.getJobs = async (req, res) => {
  try {
    // Get jobs from service Layer
    const jobs = await getJobs();
    if (!jobs) {
      return res.status(StatusCodes.OK).json({
        success: false,
        message: "No job found"
      });
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });

  } catch (err) {
    console.error("Get Jobs Error:", err.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};


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